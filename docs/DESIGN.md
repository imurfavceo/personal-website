# Design reference

Factual notes for anyone (human or agent) touching UI. Every line is grounded in a file. Read before adding a page.

## Stack
- Hand-written static HTML. One `index.html` per route dir (`about/`, `projects/`, `investments/`, `principles/`, `collections/`, `collections/{books,links,places,objects}/`), plus `index.html` and `404.html`. No package.json, no build, no templating — header/footer are copy-pasted per page.
- All styling in one file: `assets/style.css`; behavior in `assets/site.js` (deferred) + `assets/theme-init.js` (blocking, in `<head>`). No per-page CSS. Only inline `style=` in the repo: two `.small` bylines in `about/index.html`.
- Deploy: push to `main` → `.github/workflows/deploy.yml` rsyncs the repo (dotfiles, internal instructions, docs, and tests excluded) into `_site` and runs `pages deploy` to Cloudflare Pages project `imurfavceo`. No build step or linter. Run the dependency-free regression tests with `node --test tests/site.test.cjs`.
- Fonts: system stack only, set once on `body` in `assets/style.css`; no webfonts. Icons: no icon library — `assets/favicon.svg` is an emoji in an SVG `<text>`, theme buttons use glyphs (`☀︎ ☾ 🖥`) in `assets/site.js`, `.project-url::after` appends `↗`.

## Layout & spacing
- Container is `.wrap` (`assets/style.css`): `max-width: var(--max)` = **760px**, `padding: 24px var(--pad) 64px`, `--pad: 18px`. Used twice per page — once inside `<header>`, once as the body wrapper.
- `body` is a flex column (`min-height:100vh`); `.footer` uses `margin-top:auto`, so short pages still pin the footer. Header is `position:sticky; top:0`, `backdrop-filter: blur(10px)`, 1px bottom border; its height comes from 18px top/bottom padding on `header .wrap`. `--header-h: 72px` is used only in the `body > .wrap` `min-height` calc, not to size the header.
- `main` has `padding-top: 28px`. Rhythm in use: `h2` `32px 0 12px`, `h3` `24px 0 8px`, `p` `0 0 14px`, `hr` `26px 0`, `.section-divider` `36px 0 20px`, grid/card gaps `16px`, `--radius: 10px`.
- One breakpoint: `@media (max-width: 720px)` (two blocks in `assets/style.css`). Below it: `nav` hides and `.menu-btn` shows when JavaScript is available, header stacks, `.projects li` becomes a 2-column grid. Also a `@media (prefers-reduced-motion: no-preference)` block gating the live-status dot pulse.

## Typography & color
- Base `16px/1.7`; `h1` 28px/1.25, `letter-spacing:-0.01em`; `h2` 22px; `h3` 17px; `.proj-group` 21px/700; `.small` and `.project-url` and `.lesson` 13px; `.status`/`.metric` 12px (all `assets/style.css`).
- Every hex color lives in the `:root` blocks; page HTML carries no color literals. The only literals elsewhere in the CSS are three `rgba(0,0,0,…)` box-shadows (`.floating-back`, `.card:hover`, `.card:active`). Light status text uses `--live:#15803d`, `--building:#92400e`, and `--dead:#b91c1c` to meet 4.5:1 contrast on their soft backgrounds. Light tokens include `--bg:#ffffff`, `--fg:#0f172a`, `--muted:#475569`, `--accent:#7c3aed`, `--border:#e5e7eb`, plus `--surface`, `--accent-hover`, `--accent-soft`. Status triads: `--live`/`--building`/`--dead` each with a `-soft` background.
- Dark mode: yes, via `:root[data-theme="dark"]` overriding the same tokens (accent flips purple → `#f4c95d`). `assets/theme-init.js` sets `data-theme` before paint; three modes (`light`/`dark`/`system`) persist in `localStorage` key `theme-preference`. The switcher markup is **injected into `.footer` by `assets/site.js`** — do not hand-write it into a page.

## Reusable pieces (copy these)
- Header + nav: the `<header>` block in `index.html`. Copy verbatim; move `aria-current="page"` to the current link (sub-pages under `collections/` mark Collections current). Nav is Home / Projects / Collections / About / Blog (external). `investments/` and `principles/` are not in the nav — they are linked from body copy (`index.html`, `about/index.html`).
- Footer: `<div class="footer"><div class="small">© 2025–2026 Gleb Braverman</div></div>` (`about/index.html`). Variant `class="footer footer-spacer"` when content ends flush against it (`principles/index.html`).
- Card grid: `.grid` (1 col) in `index.html`, `.grid-collections` (auto-fit, min 260px) in `collections/index.html`. Each `.card` is a native anchor containing a `strong` label and a `.small` description; do not nest links or reintroduce JavaScript navigation.
- Lists: `<ul class="list bullets">` with accent left-border items — `collections/books/index.html`, `investments/index.html`, `principles/index.html`. Stacked link groups use `.contact-links` (`about/index.html`).
- Project rows: `.projects > li` with `.project-body`/`.project-id`/`.project-name`/`.project-url`/`.project-desc`, and `.project-meta` holding optional `.metric` then `.status status--live|--building|--dead` with an inner `<span class="dot">` (`projects/index.html`).
- Sub-pages under `collections/` add `<a class="floating-back" href="/collections/">← Back</a>` between `</main>` and `.footer` (`collections/books/index.html`). Visible at desktop and mobile widths.

## Page anatomy
`<!doctype html>` → `<html lang="en">` → head: `charset`, `viewport`, `<title>`, `<meta name="description">`, canonical/Open Graph/Twitter metadata (or 404 `noindex`), `theme-init.js`, `style.css`, `favicon.svg` (that order) → skip link → `<header><div class="wrap">` menu button + `<nav data-nav>` → `<div class="wrap"><main id="main" tabindex="-1">` `h1` + `p.kicker` + content → optional `.floating-back` → `.footer` → `<script src="/assets/site.js" defer>`. Internal page links are root-absolute with a trailing slash (`/collections/books/`); asset links are root-absolute without one (`/assets/style.css`).

## Reference pages
- `collections/books/index.html` — the canonical small page (h1 + kicker + `hr` + bullet list + back link).
- `projects/index.html` — the richest page (grouped headings, status pills, metrics).
- `about/index.html` — multi-section text page with `h2` sections and link groups.

## Copy
- Titles are `<Page> · Gleb`; the root page is the exception, `Home · Gleb Braverman`. Every page carries a one-sentence `meta description`, and every external link carries `target="_blank" rel="noopener"`.
- Every `h1` is followed by `<p class="kicker">` — one sentence, sentence case, ends with a period: "Things I work on now and built in the past." (`projects/index.html`), "Books I enjoy rereading." (`collections/books/index.html`). `about/index.html` is the only page with no kicker; `principles/index.html` adds `compact-kicker` plus a `p.small` "Last updated" line.
- First person, plain, no marketing adjectives; contractions are avoided in prose — "I am curious about…" (`about/index.html`), "That link does not exist." (`404.html`). One exception: "wasn't" in `projects/index.html`.

## UX invariants
- This repo's `CLAUDE.md` says only: static HTML, no build tooling, no `verify` script; verify by opening the changed page in a browser at desktop and mobile widths; see this file.
- The rest of the process lives in the parent `Desktop/Projects/AGENTS.md` (or `CLAUDE.md` for Claude sessions), outside this repo. UI changes must be opened at desktop and mobile widths, including every touched state. Use available craft skills and report verification limits honestly. There is no `verify` script; run `node --test tests/site.test.cjs` for the theme regression tests.
- `.github/workflows/coderabbit.yml` runs an AI review on every PR open/sync/reopen; expect review comments before merge.

## Accessibility and content boundaries
- All content pages have canonical URLs, Open Graph text metadata, and a summary Twitter card; 404 is marked `noindex`. No `theme-color` meta tags. No `<img>` in any page, and `assets/favicon.svg` is the only image file in the repo — no image, alt-text, or asset-naming convention.
- Heading depth is inconsistent (`about/index.html` and `projects/index.html` use `h2`, `principles/index.html` uses `h3`), as is indentation inside `<main>` (`principles/index.html` indents its content 6 spaces, every other page is flush-left after the `h1`); no rule, no formatter config.
- Links and buttons have visible focus outlines. Every page has a skip link and a focusable `main#main`; navigation and theme controls expose `aria-controls`. Hidden theme options leave keyboard navigation, and Escape dismisses menus.
- Unfinished Places and Objects routes show an explicit empty-state paragraph with links to Books and Links; they are omitted from the Collections index until populated. Links points to the active Telegram channel.

## Refresh verification

- Blog links use `https://imurfavceo.substack.com/archive` to show articles directly.
- Imladris Labs appears on Home and under Active projects, linking to `https://imladrislabs.dev`.
- CSS hides mobile navigation only after `theme-init.js` adds the `js` root class; navigation stays available without JavaScript.
- `assets/site.js` catches storage failures and changes theme-menu visibility synchronously; regression tests cover those edge cases.

- CSS and script references carry a `?v=` SHA-256 content hash (first 12 hex digits). Update those references on every HTML page whenever any referenced asset changes; the regression test checks the hashes to prevent mixed cached and current releases.

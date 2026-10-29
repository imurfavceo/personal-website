# personal-website

Process rules live in `Desktop/Projects/AGENTS.md` (the folder above) and load automatically for every project in that folder. This file is for project specifics only. If that file isn't present (a cloud session with only this repo), work directly and don't commit to `main` without asking.

- Static HTML, no build tooling: there is no `verify` script. Run `node --test tests/site.test.cjs` for theme regressions. Verify by opening the changed page in a browser at desktop and mobile widths. See `docs/DESIGN.md`.

## UX invariants and gotchas

- Hidden theme options must be removed from layout and keyboard navigation; never override `[hidden]` with a visible display value.
- Theme menus must update visibility synchronously so rapid close/reopen cannot leave an expanded menu hidden.
- Browser storage can throw; theme controls must still work and default to the system preference when saving or reading fails.
- Use native anchor cards so keyboard access, modifier clicks, and navigation work without JavaScript.
- Do not promote empty collections; keep existing routes useful with an explicit empty state and working return links.
- Blog links must open the article archive, rather than the subscription form.
- Deployment must exclude internal instructions, design notes, and tests from public assets.
- Light-theme status text must maintain at least 4.5:1 contrast against its badge background.
- Remove confirmed broken project links rather than sending visitors to dead preview deployments.
- Version CSS and JavaScript URLs with their content hashes on every page; stale cached assets can break newly deployed HTML. Update all references whenever asset contents change and run the regression test.

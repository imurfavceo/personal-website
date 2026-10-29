# personal-website

Process rules live in `Desktop/Projects/CLAUDE.md` (the folder above) and load automatically for every project in that folder. This file is for project specifics only. If that file isn't present (a cloud session with only this repo), work directly and don't commit to `main` without asking.

- Static HTML, no build tooling: there is no `verify` script. Run `node --test tests/site.test.cjs` for theme regressions. Verify by opening the changed page in a browser at desktop and mobile widths. See `docs/DESIGN.md`.

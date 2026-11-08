# Neutron City — conventions for Claude

**Start every session by reading `docs/STATUS.md`.** Working rules of the project owner: `PROMPT-neutron-city.md`
(work in lots; propose → approval → build → verify (tests + visual check) → short report → stop; ask before any
commit, installation, push to GitHub or irreversible action). Decisions: `docs/DECISIONS.md` (D-xx); configuration
management: `docs/CONFIGURATION.md`.

- Docs and game texts in French; commit messages in English (`<lot>: <what changes>`).
- No text hard-coded in code: ids in `content/i18n/*.yaml` and `content/dialogues/`.
- `packages/engine`: pure, deterministic; no DOM/React, no `Date.now()`, no `Math.random()`, no timers.
- Visual check at 1280 × 800 and 1920 × 1200 for every UI lot (preview config: `.claude/launch.json`, name `game`).
- Commands: `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run dev` (port 5180).

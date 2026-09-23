# Project: Engineering Workflow Skills

A collection of Claude Code skills encoding a phase based engineering workflow. No mandated playbook: you run whichever skills a change needs, in whatever order fits. `/scope` recommends a workflow tier (`Prototype`/`Alpha`/`Beta`/`GA`, how much verification a project or feature warrants), but it is a default you override per feature, never a forced track.

## Conventions every skill follows

- **The engineer decides; the AI recommends.** Any AI initiated verification or critique (e.g. `/architect`'s cross model spec check) is *offered*, never run or skipped on the engineer's behalf. Whatever such a check finds, a gap, a load bearing decision, a fix, is *surfaced to the engineer to decide*, never silently resolved or auto applied. A check the engineer invokes directly (`/check verify`, `/check review`) is already their choice to run, and still reports rather than auto fixes.
- **Suggestions, never gates.** The engineer is in charge: every step after `/develop` (`/check verify`, `/test`, `/check review`, `/document`) is suggested by the tier and freely skippable, and `done` is the engineer's to declare, never a status a skill withholds until boxes are ticked. A skipped step is recorded honestly as skipped. The one thing the workflow asks is that a load bearing decision be written down (a spec); even that is flagged, not enforced (an `Assumed` spec never blocks `done`).
- **Every user facing question carries exactly one recommended option** with a one line why (make the call, let them override). Never a neutral menu, never a cold question, never a silent decision.
- **Keep skills lean.** A skill loads in full on its path every run, so every line is a recurring cost. Cut lines that don't change the agent's behavior, keep the reasoning in the commit or PR (not the skill body), name concepts instead of explaining them, and split out only rare, long content. Full guidance: [`docs/conventions.md`](docs/conventions.md). Run `npm run check` before committing skill edits.

## Layout

- Skills (source, for distribution via `npx skills`): `skills/<name>/SKILL.md`
- Docs: `docs/workflow-guide.md` (what the workflow is and how it works) and `docs/conventions.md` (how to write skills). The "why" behind a change lives in its commit and PR, not a separate decision-record file.

## Skills

See `skills/` for available skills. (Consumers install them via `npx skills add JavaScript-Mastery-Pro/skills`, which lands them in their agent's skills dir, e.g. `.claude/skills/`.)

## App: Grow (personal development)

The product being built with these skills lives in `app/`: a React + Vite + TypeScript single page app with a left sidebar of life areas (Evenimente, Learning, Fashion, Psychology, Culture). The user writes in Romanian; the UI copy is Romanian, section names are as the user chose them. The owner is a frontend developer moving into AI engineering; Learning areas (`app/src/features/learning/areas.ts`) and the `/learning-daily` reader profile come from his questionnaire (spec 0005): AI engineer on applications, body, nutrition, social confidence (main blocker: shyness), mind, money; keep new content aimed at that.

- Plan and status: `docs/scope/scope.md` (build approach Facade, workflow Prototype). Stack decision: `docs/specs/0001-stack-and-architecture.md`.
- Run: `npm run dev` (from the root or `app/`), then http://localhost:5173. Check: `npm run build` and `npm run lint`.
- Add a section: one entry in `app/src/config/sections.ts` (menu + route), placeholder items in `app/src/data/mockItems.ts`. Then enroll it with `/scope <section name>`.
- Styling: plain CSS, one file beside each component; colors, spacing and radius only via tokens in `app/src/styles/tokens.css` (light and dark). Per section accent comes through the `--accent` CSS variable.
- AI content: no API calls at runtime. Content is written ahead of time by Claude Code skills into JSON (Learning: `/learning-daily` → `app/src/content/learning/days/<date>.json`, a daily plan of 3 lessons built from the owner's profile, spec 0005), checked with `npm run content:check -- --fix`, and read at build time. Evenimente: `/events-refresh` → `app/src/content/events/events.json` (spec 0004), checked with `npm --prefix app run events:check -- --fix`; the page fetches it once and caches it in the browser by the file's hashed url. Fashion: `/fashion-refresh` → `app/src/content/fashion/style.json` (spec 0007). Psychology: `/psychology-refresh` → `app/src/content/psychology/guide.json` (spec 0008); the journal is not content: it lives in `journal/<month>.json` in the repo, written at runtime by `app/api/journal.ts`, and commits starting with `journal:` skip the Vercel build. Culture: `/culture-refresh` → `app/src/content/culture/guide.json` (spec 0009); his marks live in `data/culture.json`, written at runtime by `app/api/store.ts`, and commits starting with `data:` skip the Vercel build. Future AI sections follow the same pattern.
- Data: the other sections are mock only until feature 10 (data model) is decided; don't add persistence ad hoc.
- Deploy: Vercel (root `app/`, `app/vercel.json` for client routes); a push redeploys. Private: `app/middleware.ts` asks for `SITE_PASSWORD` on every path. The Learning and Evenimente buttons call `app/api/generate.ts`, which starts the skill on GitHub Actions (`.github/workflows/run-skill.yml` → `docker/run-skill.sh`) and commits only the content folder (spec 0006).
- `.claude/skills/`: project skills are committed (`learning-daily`, `events-refresh`, `fashion-refresh`, `psychology-refresh`, `culture-refresh`); the workflow skills are per skill symlinks to `skills/`, local only (gitignored), so `/scope`, `/architect`, `/develop` etc. work here.

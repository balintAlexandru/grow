# Scope: Grow (personal development app)

A personal web app for your own growth: a clean page with a left menu of life areas (Evenimente, Learning, Fashion, Psychology, Culture), each holding what you follow, learn, and plan. Built for you, run locally, more sections added over time.

**Build approach:** Facade (make every screen look and feel real on placeholder data first, then wire real data screen by screen). Prototype grade on purpose until the data model is wired.
**Workflow:** Prototype (just `/develop`, nothing required after it). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· Alpha`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | done |
| 2 | Coding standards & tooling | Foundation | planned |
| 3 | Design system & UI foundation | Foundation | planned |
| 4 | App shell & sidebar navigation | Skeleton | done |
| 5 | Evenimente page | Phase 1 | in-progress |
| 6 | Learning page | Phase 1 | in-progress |
| 7 | Fashion page | Phase 1 | in-progress |
| 8 | Psychology page | Phase 1 | in-progress |
| 9 | Culture page | Phase 1 | planned |
| 10 | Data model & local persistence | Phase 2 | planned |
| 11 | Add and edit items | Phase 2 | planned |
| 12 | Home overview | Phase 2 | planned |
| 13 | Hosting & daily content routine | Foundation | planned |

## Foundations

### 1. Stack & architecture · done
React single page app in `app/`, so every later feature builds on a real, runnable structure.
**Done when:** the stack is recorded in a spec and the app boots locally, builds, and lints clean.
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture`
Spec [0001](../specs/0001-stack-and-architecture.md) · code in `app/`

### 2. Coding standards & tooling
Capture your conventions and tooling from the real scaffolded project, then install formatting and checks.
**Done when:** root `AGENTS.md` reflects the real stack, and lint and format run clean.
- [ ] Capture conventions + tooling choices: `/audit`
- [ ] Install the tooling: `/develop tooling`

### 3. Design system & UI foundation · needs a decision
The visual language (type, color, spacing, components) so every section feels cohesive and modern. A starter theme already lives in `app/src/styles/tokens.css`.
**Done when:** `design.md` covers type, color, spacing, and base components, light and dark, and the starter tokens match it.
- [ ] Design it (spec): `/architect design system & UI foundation`

### 13. Hosting & daily content routine
Put the site online and refresh AI written content every morning, at no cost beyond the Claude Pro plan.
**Done when:** a push to GitHub redeploys the site, and a daily routine runs `/learning-daily`, commits and pushes.
- [ ] Create the GitHub repo and push (you)
- [ ] Connect Vercel, root directory `app` (you)
- [ ] Schedule the daily run: `/schedule`

## Skeleton

### 4. App shell & sidebar navigation · done
Left menu with every section, one route per section, a home page, responsive drawer on phones. Sections come from one config file so adding one is a single entry.
**Done when:** each menu item opens its page with the active item highlighted; on a phone the menu opens as a drawer; a new entry in `sections.ts` shows up in the menu and routes.
- [x] Build it: `/develop app shell & sidebar navigation`
code in `app/src/layouts/`, `app/src/components/Sidebar/`, `app/src/config/sections.ts`

## Phase 1: Clickable prototype (every section on placeholder data)

### 5. Evenimente page · in-progress
This month's events in București: bouldering, șah, board games, teatru, muzică clasică, artă, dezvoltare personală, sport în grup. Found on the web by the `/events-refresh` Claude Code skill (Facebook and Instagram have no public event API), loaded once and cached in the browser, refetched only when new events are deployed.
**Done when:** upcoming and past events of the month are visibly separated, each shows date, place and a note, an empty state renders, and a recurring run adds new events without repeats.
- [x] Design it (spec): `/architect evenimente page`
- [ ] Build it: `/develop evenimente page`
   - [x] Page, browser cache and merge, `/events-refresh` skill, `npm run events:check`
   - [x] First run: 37 events (Sept–Oct 2026)
   - [x] Chess for beginners, sport în grup, weekly events (50 events)
   - [ ] Recurring run (feature 13)
Spec [0004](../specs/0004-events-monthly-via-claude-code.md) · code in `app/src/features/events/`, `app/src/content/events/`, `.claude/skills/events-refresh/`

### 6. Learning page · in-progress
A daily growth plan built from your answers: 3 short lessons a day (10–15 min), each with one concrete mission. Every day a social lesson on an exposure ladder (your main blocker is shyness) and an AI engineer lesson; the third rotates through strength and cardio, nutrition science, habits and emotions, money and career, AI news. Written daily by `/learning-daily`, no API cost.
**Done when:** the page shows today's 3 lessons with missions you can tick, the social rung, and earlier lessons by area; a daily run writes a new plan without repeating titles.
- [x] Design it (spec): `/architect learning page`
- [ ] Build it: `/develop learning page`
   - [x] First version: 6 topics × 3 articles (spec 0003)
   - [x] Questionnaire, daily plan, ladder, missions, explore by area (spec 0005)
   - [x] First plan generated (2026-09-22)
   - [ ] Daily refresh running (feature 13)
Spec [0005](../specs/0005-learning-daily-growth-plan.md) (refines 0003) · code in `app/src/features/learning/`, `app/src/content/learning/`, `.claude/skills/learning-daily/`

### 7. Fashion page · in-progress
Learn to dress from zero, in an urban minimalist style: the rules that matter, the base wardrobe, outfits for birou, oraș, restaurant, weekend and întâlniri, current trends with sources, and shops in București. A wishlist keeps pieces, links and pictures. The „Generează stil nou” button runs `/fashion-refresh`.
**Done when:** each tab renders from JSON, every occasion has an outfit, the wishlist survives a reload, and the button publishes new content.
- [x] Design it (spec): `/architect fashion page`
- [ ] Build it: `/develop fashion page`
   - [x] Page, wishlist, `npm run fashion:check`, `/fashion-refresh`, workflow
   - [x] First content (6 rules, 14 pieces, 6 outfits, 5 trends, 9 shops)
   - [ ] First run from the button
Spec [0007](../specs/0007-fashion-style-guide.md) · code in `app/src/features/fashion/`, `app/src/content/fashion/`, `.claude/skills/fashion-refresh/`

### 8. Psychology page · in-progress
Daily check-in (mood, gratitude, free writing), the whole journal with search, guided exercises with a timer, and evidence-based articles. The journal is stored in the private repo, so it survives deploys and devices; the button refreshes only the articles and exercises.
**Done when:** an entry saves to the repo and comes back on another device, the journal is searchable, exercises run with the timer, and the button publishes new articles.
- [x] Design it (spec): `/architect psychology page`
- [ ] Build it: `/develop psychology page`
   - [x] Journal API with offline queue, check-in, journal, exercise player, articles
   - [x] First content: 7 articles, 6 exercises, sources verified
   - [ ] Token gets Contents: read and write, then the first real save
Spec [0008](../specs/0008-psychology-journal-and-tools.md) · code in `app/src/features/psychology/`, `app/api/journal.ts`, `.claude/skills/psychology-refresh/`

### 9. Culture page · needs a decision
Films, exhibitions, music, books, and places that widen your horizon, as lists you work through.
**Done when:** items are grouped by kind (film, exhibition, and so on), done ones are marked, and an empty state renders.
- [ ] Design it (spec): `/architect culture page`

## Phase 2: Wire real data

### 10. Data model & local persistence · needs a decision
The shape of items across sections and where they are saved, replacing `app/src/data/mockItems.ts`. The costliest thing to redo, so decide it before adding and editing.
**Done when:** items survive a page reload, and every section reads from the same persisted source.
- [ ] Design it (spec): `/architect data model & local persistence`

### 11. Add and edit items · needs a decision
Turn on the `Adaugă` button: create, edit, and delete items in any section.
**Done when:** you can add, edit, and delete an item in every section, and invalid input shows a clear message.
- [ ] Design it (spec): `/architect add and edit items`

### 12. Home overview
The home page summarizes what is next across sections (next event, current learning, today's habits) from real data.
**Done when:** home shows one live highlight per section, and each links to its section.
- [ ] Build it: `/develop home overview`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Accounts and sync across devices**: sign in and use it from phone and laptop · needs a decision · Alpha
- **Search across sections**: find any item from one search box · needs a decision
- **Reminders**: nudges for upcoming events and daily habits · needs a decision
- **Progress stats**: charts of learning and habits over time · needs a decision
- **Manual theme switch**: choose light or dark (today it follows your system)

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box.

**Feature lifecycle**:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | `/architect` at spec capture | `Design it` ticked; spec linked; `Build it: /develop <feature>` + 2 to 5 milestones |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `done` | you, when you decide it is | boxes you ran ticked, skipped ones marked skipped; at `Prototype`, right after `/develop` |

- **Next step** = the first unticked box.
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling).
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Workflow tier tag** beside a heading (e.g. `· Alpha`) sets that feature's rigor above or below the project default.
- **Workflow** (header line): **Prototype** = nothing after `/develop`; **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds `/check review` then `/document`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.

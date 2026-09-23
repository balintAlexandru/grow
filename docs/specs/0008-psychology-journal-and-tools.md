# 0008. Psychology: a journal that is never lost, plus tools and articles

**Date**: 2026-09-23
**Status**: In Progress

## Summary

Psychology has four tabs: **Azi** (daily check-in: mood, three gratitudes, free writing), **Jurnal** (everything written, searchable), **Exerciții** (guided, with a timer) and **Articole** (evidence-based, refreshed by the button). What he writes is stored in the private GitHub repo, so it survives deploys, browsers and devices.

## Decision

- **Journal storage: the private repo**, one file per month at `journal/<YYYY-MM>.json`, written through `app/api/journal.ts` (GET / PUT / DELETE) with the same token as the button, which now also needs **Contents: read and write**. Chosen over a browser-only journal (lost with the browser data, single device) and over an external database (another account, keys, upkeep, no real gain).
- **Nothing is lost when the network is not there**: an entry is written to `localStorage` first, then sent. A failed send leaves it in a queue that is retried on the next save or page load, and the header says „salvat local, urcă la următoarea încercare”. Verified with the API forced to fail: the text survives a reload.
- **Journal commits do not rebuild the site**: `vercel.json` has an `ignoreCommand` that skips the build when the commit message starts with `journal:`. The site reads the journal at runtime, never at build time.
- **The button refreshes only what comes from the internet** (`/psychology-refresh` → articles and exercises). It never touches `journal/`, and the workflow commits only `app/src/content/psychology`.
- **Exercises are guided, not just described**: steps run one at a time, the timed ones counting down, so an exercise is done rather than read.
- **Safety**: the skill is told to name when something belongs with a specialist, and never to give diagnoses or medical advice.

## Build plan

- [x] `/api/journal`, sync with offline queue, check-in, journal with search and delete, exercise player, articles reader
- [x] First content: 7 articles (breathing with the Stanford trial, worry postponement, behavioural activation, self-compassion, male loneliness, sleep regularity, ACT values) and 6 exercises, every source live
- [x] `npm run psychology:check`, `/psychology-refresh`, workflow, button
- [x] Tested in Chrome: entry survives a reload with the API failing, journal lists it, timer runs
- [ ] The owner adds **Contents: read and write** to the GitHub token in Vercel, then the first save lands in the repo

# 0004. Events of the month, found by Claude Code and cached in the browser

**Date**: 2026-09-22
**Status**: In Progress

## Summary

The Evenimente page shows this month's events in Bucharest: bouldering, chess, board games, theatre, classical music, art, personal development and group sports (`sport`: run clubs, group hikes, amateur races). Chess favors beginners: pub and café chess nights, amateur tournaments. A Claude Code skill, `/events-refresh`, finds them on the web (Google, including Facebook and Instagram pages, ticket sites, venue programs) and **adds** them to `app/src/content/events/events.json`. The page requests that file once, keeps it in the browser, and requests it again only when a newer version has been deployed, merging the new events into the ones already shown.

## Context

You asked for Facebook and Instagram APIs. Neither can do this: Facebook removed public event search from the Graph API in 2018 (only events of Pages you administer are readable), and the Instagram API has no events. Paid event APIs (SerpApi Google Events and others) would break the "no extra cost" rule from spec 0003.

## Requirements

- **AC-1**: The page shows only events that overlap the current month, upcoming first; this month's past events sit in a collapsed "Au trecut" list; a filter by category.
- **AC-2**: First visit: exactly one request for `events.json`. Later visits, navigation and reloads: **no request** while the deployed file is unchanged.
- **AC-3**: After a deploy with new events: exactly one request; the new events are added to the ones already seen and marked "Nou"; events missing from the new file stay until their month ends.
- **AC-4**: `/events-refresh` only adds or corrects (ids never change, cancellations are flagged, not deleted), and leaves the file untouched when nothing is new, so no request is triggered.
- **AC-5**: `npm run events:check` validates shape, dates, categories, unique ids and dead URLs; `--fix` fills ids, drops past months and sorts.

## Decision

- **Version = file url.** `events.json` is imported with `?url`; the build puts a content hash in its name (`events-<hash>.json`, never inlined, see `vite.config.ts`). The page caches `{ version, events, newIds }` in `localStorage` (`grow.events`) and fetches only when the url differs. In dev the url is fixed, so dev fetches once per page load.
- **Merge by id** (`<slug>-<date>`), prune events whose last day is before this month. First load highlights nothing; later loads highlight ids that were not in the cache.
- **Weekly events** (a chess night, a run club) are one entry with `weekdays` between `date` and `endDate`; the page shows the next session (`nextDate` in `store.ts`) and "În fiecare …".
- **Next month**: in the last week of a month the skill also adds next month's events, so the page is not empty on the 1st.
- Code: `app/src/features/events/` (`store.ts` holds the logic), skill `.claude/skills/events-refresh/`, check `app/scripts/check-events.mjs`.

## Build plan

- [x] Page, store with cache and merge, check script, skill (AC-1…AC-5)
- [x] First run: 37 events, Sept–Oct 2026; verified in Chrome: 1 → 0 → 0 requests, then 1 on a new deploy with "Nou", 0 after
- [x] Chess for beginners, `sport` category, weekly events: 50 events
- [ ] Recurring run (weekly + 1st of the month) with `/schedule`, together with feature 13

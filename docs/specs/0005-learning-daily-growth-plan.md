# 0005. Learning as a daily growth plan built from the owner's profile

**Date**: 2026-09-22
**Status**: In Progress
**Refines**: [0003](0003-learning-content-via-claude-code.md) (same generation pipeline: Claude Code skill, static JSON, no API cost)

## Summary

Learning stops being 6 topics × 3 articles picked from a dropdown. Each day it shows **a plan of 3 short lessons, each with one concrete mission**, 10–15 minutes in total, plus an "Explorează" view of earlier lessons by area.

## Context

The owner found the old section too generic. A questionnaire (motivation, life areas, blockers, time, what keeps him coming back) gave this profile:

- Career: AI engineer on applications. Also growth in body (strength + cardio), nutrition (the science), social (starting conversations with strangers), mind (habits, focus, emotions), money and practical career.
- **Main blocker: shyness.** Time: 10–15 min/day. Comes back for **one concrete action per day**.

## Requirements

- **AC-1**: The page shows the latest `days/<date>.json` as "Planul de azi" (3 lessons from 3 areas); when it is not today's, it says so.
- **AC-2**: Slots: `social` and `ai-engineer` every day; the third rotates by weekday (Mon `body`, Tue `nutrition`, Wed `mind`, Thu `money`, Fri `body`, Sat `ai-news`, Sun `mind`).
- **AC-3**: Social missions follow a 6-rung exposure ladder (`socialSteps` in `areas.ts`), 3 days per rung, each with an easier variant; the page shows the current rung.
- **AC-4**: A mission can be marked done ("Am făcut-o"), kept in this browser; the page shows missions done this week.
- **AC-5**: When an event from Evenimente fits (next 7 days), a social or body mission uses it (`eventTitle`, link to Evenimente).
- **AC-6**: `npm run content:check -- --fix` validates days, library and history (3 lessons, distinct areas, no repeated titles, `step` only for social), fills ids and reading time, archives days older than 60 into `history.json`.

## Decision

- Content: `app/src/content/learning/days/<date>.json` (daily plan), `library.json` (the 9 evergreen articles kept from 0003: AI engineering, AI career, charisma), `history.json` (used titles). Old news and world topics were dropped; their titles live in history.
- Code: `app/src/features/learning/` (`areas.ts` is the source of areas and the ladder; `done.ts` the done ticks), skill `.claude/skills/learning-daily/`.
- One daily run writes 3 lessons instead of 18, so it also costs less of the Pro plan usage.
- The done ticks live in `localStorage` as a convenience until feature 10 decides real persistence.

## Build plan

- [x] Questionnaire and profile
- [x] Areas, ladder, day files, library migration, check script (AC-1, AC-2, AC-6)
- [x] Page: today's plan, done ticks, rung, explore by area (AC-1, AC-3, AC-4)
- [x] Skill rewritten; events skill tuned to the profile (AC-2, AC-3, AC-5)
- [x] First plan: 2026-09-22 (social rung 1, tool use, protein science)
- [ ] Daily routine with `/schedule` (feature 13)

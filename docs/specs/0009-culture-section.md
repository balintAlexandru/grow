# 0009. Culture: what to watch, read and say

**Date**: 2026-09-23
**Status**: In Progress

## Summary

Culture has four tabs: **De văzut și citit** (films, books, albums, documentaries, podcasts, each with why it is worth his time and what to say about it), **Povești de spus** (true, sourced stories with a 30 second version), **Locuri în București** (museums, art cinemas, bookshops, concert halls, with addresses), and **Lista mea** (what he marked). The **„Adu lucruri noi”** button runs `/culture-refresh` like the other sections (spec 0006).

## Decision

- **Every recommendation carries a `talkingPoint`**, because the owner's stated goal is to be better company, not to collect titles. The tab that would be a list elsewhere is here a conversation aid.
- **Stories are a tab of their own**, with sources and a „cum o spui în 30 de secunde” line. This is what the dropped `good-stories` topic from Learning was good for, now in the section where it belongs.
- **Dated things stay out**: concerts and temporary exhibitions belong to `/events-refresh`. Culture holds what is true all year, and the places link the two.
- **Marks live in the repo**, `data/culture.json` through the new `app/api/store.ts`, a small key-value store reusing the journal's pattern (browser first, repo right after). Its commits start with `data:` and skip the Vercel build, like `journal:` ones.
- Ids are what the marks point at, so `culture:check` refuses duplicate ids and the skill is told never to change an existing id.

## Build plan

- [x] `/api/store`, marks with local-first saving, page with 4 tabs, check script, skill, workflow, button
- [x] First content: 12 recommendations (3 films, 4 books, 3 albums, 1 documentary, 1 podcast), 4 stories (Brâncuși's trial, the heaviest building, the woman who dubbed every smuggled film, the collector who gave away his house), 9 places, links verified
- [x] Tested in Chrome: a mark survives a reload with the API failing, stories open, no errors
- [ ] First run from the site's button

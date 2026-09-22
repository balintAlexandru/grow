# 0003. Generate Learning articles with Claude Code and serve them as static JSON

**Date**: 2026-09-22
**Status**: In Progress
**Supersedes**: [0002](0002-learning-ai-articles.md)

## Summary

The Learning articles are no longer written by an API call from the site. A Claude Code skill, `/learning-daily`, researches and writes them using your Claude Pro plan, saves them as JSON files in the repo, and the site just reads those files. No server, no API key, no extra cost. A daily scheduled routine can run the skill, commit and push, and the host redeploys the site with the new articles.

## Context

Spec 0002 called the Claude API from a local server. That works, but the API is billed separately from the Claude Pro subscription. You want zero extra cost, and you are fine with articles being refreshed once a day instead of on demand.

## Requirements

- **AC-1**: The dropdown shows the topics from `app/src/features/learning/categories.ts`; each shows the 3 articles from `app/src/content/learning/<id>.json`, with no network call.
- **AC-6**: Topics fit the reader (a frontend developer moving into AI): Noutăți din AI, Carieră în AI, De la frontend la AI engineer, Ce se întâmplă în lume, Povești care te fac interesant, Umor și carismă. News topics only cover the last 7 to 14 days, with dates in the text.
- **AC-7**: Technical articles may carry a short TypeScript example (`sections[].code`, at most 15 lines, verified APIs), shown as a code block.
- **AC-2**: `/learning-daily` (all topics) or `/learning-daily <id>` writes 3 new articles per topic, following the article rules in the skill, and moves the old titles into `history` so topics do not repeat.
- **AC-3**: `npm run content:check` fails on a wrong shape, missing fields, a bad source URL, or a video that does not exist; `--fix` fills ids, reading time and video details and drops dead videos.
- **AC-4**: The site builds as static files; a push to the main branch redeploys it.
- **AC-5**: Optional: a daily routine runs the skill, commits and pushes without any manual step.

## Options considered

1. **Claude API from the site (spec 0002)**: on demand, but billed per call.
2. **Claude API through the Batch API**: about half the price, still billed.
3. **Claude Code skill + static JSON (chosen)**: uses the Pro plan's included usage, no runtime cost, content refreshed daily.

## Decision

**Chosen option**: Option 3.

- **Generation**: `.claude/skills/learning-daily/SKILL.md` (committed, so a cloud routine can use it). Research with Claude Code's WebSearch and WebFetch, capped per article to save usage.
- **Validation**: `app/scripts/check-content.mjs` (`npm run content:check`), YouTube oEmbed check, channel shown to catch re-uploads.
- **Storage**: JSON in `app/src/content/learning/`, loaded at build time with `import.meta.glob`. Git history is the archive.
- **Hosting**: Vercel (free tier), project root `app/`, `app/vercel.json` rewrites every route to `index.html` for client routing. Cloudflare Pages works the same way.
- **Automation**: a Claude Code routine created with `/schedule`, daily, prompt: run `/learning-daily`, then commit `content: learning daily <date>` and push.

## Rationale

The only thing the site needs is fresh text once a day, so there is no reason to pay per request at runtime. Writing the content ahead of time also lets it be checked (sources, videos, length) before anyone reads it, which the on demand version could not do. The tradeoff is that the "generate new articles" button is gone; new articles come with the next run.

## Build plan

- [x] Remove the local API and the SDK dependency (AC-4)
- [x] Page reads JSON, no generation button (AC-1)
- [x] `/learning-daily` skill with the article rules (AC-2)
- [x] `content:check` with `--fix` (AC-3)
- [x] First set of articles generated and checked (AC-1, AC-2)
- [x] Topics retargeted to the reader profile, optional code blocks, second set of 18 articles (AC-6, AC-7)
- [ ] GitHub repo + Vercel project (AC-4)
- [ ] Daily routine with `/schedule` (AC-5)

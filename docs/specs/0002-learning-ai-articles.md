# 0002. Generate Learning articles with Claude, web search and a local API

**Date**: 2026-09-22
**Status**: Superseded by [0003](0003-learning-content-via-claude-code.md)

## Summary

On the Learning page you pick a topic from a dropdown and get 3 short articles written by Claude from real web sources, each with an optional YouTube video. The call runs on a small local API inside the Vite server, so your API key never reaches the browser. Articles are saved per topic in the browser and only regenerated when you press the button, which keeps token use low.

## Context

Every section will eventually generate content with AI; Learning is the first. The articles must teach something concrete fast (not long reads), be grounded in current web sources, and link a video when one helps. Tokens cost money, so the design minimizes calls and the size of each one.

## Requirements

**User stories**:
- As the owner, I pick a Learning topic and get 3 useful, easy articles with sources and a video, so I learn something in minutes.
- As the owner, I switch topics freely without paying again for articles I already have.

**Acceptance criteria**:
- **AC-1**: Topics: AI și tehnologie, Știință și lumea din jur, Corp și minte, Psihologie și emoții, Istorie și cultură.
- **AC-2**: Picking a topic with no saved articles generates 3; picking one that has them shows them with no AI call.
- **AC-3**: `Generează articole noi` replaces that topic's 3 articles, avoiding the previous titles.
- **AC-4**: Each article has: hook, core idea in one sentence, 2 to 3 short sections, an everyday example, 3 takeaways, one action for today, a self check question with a hidden answer, sources; 250 to 350 words.
- **AC-5**: Videos shown are real and embeddable (checked through YouTube oEmbed); no video is shown rather than a broken one.
- **AC-6**: The API key lives only in `app/.env`; missing key, rate limit, network and refusal each show a clear Romanian message.
- **AC-7**: Articles survive a page reload.

## Decision

**Chosen option**: one Claude call per generation, from a Vite middleware API.

- **Where the call runs**: `app/server/apiPlugin.ts` mounts `POST /api/learning/articles` in the Vite dev and preview servers. Chosen over a separate backend: one command (`npm run dev`), and the key stays in Node. Move to a standalone server if the app is ever hosted.
- **Model**: `claude-opus-5` by default (override with `ANTHROPIC_MODEL`, e.g. `claude-sonnet-5`, cheaper), with `fallbacks: "default"` so a rare refusal is retried server side.
- **Web**: Claude's `web_search_20260209` server tool, `max_uses: 3` (search results are the largest input cost; this version filters results before they enter the context). One search targets YouTube.
- **Output**: a strict `save_articles` tool (JSON schema), so the answer is structured and has no extra prose.
- **Token levers**: one call for all 3 articles; `effort: "low"`; short, stable system prompt; capped searches; word budget per article; no regeneration on topic switch; only previous titles are sent on regenerate.
- **Storage**: browser `localStorage` (`grow.learning.v1`), an interim choice until feature 10 (data model) decides persistence.

Rough cost per generation on Opus 5: about 3 searches ($0.03) plus 10k to 25k input and 3k to 5k output tokens, so roughly $0.10 to $0.25. Sonnet 5 cuts the token part by about 2.5 times.

## Architecture

- `app/server/claude.ts`: client and config from `.env`.
- `app/server/learning/generateArticles.ts`: prompt, tools, `pause_turn` resume, validation, reading time.
- `app/server/youtube.ts`: video id extraction and oEmbed check.
- `app/src/features/learning/`: `LearningPage`, `ArticleCard`, `ArticleReader`, `categories.ts`, `storage.ts`, `api.ts`, `types.ts` (shared with the server).

## Build plan

- [x] Local API + Claude call with web search and strict output (AC-2, AC-4, AC-6)
- [x] Video verification (AC-5)
- [x] Learning page: dropdown, per topic cache, regenerate, reader (AC-1, AC-2, AC-3, AC-7)
- [ ] Live run with a real API key, review article quality and token usage (AC-4)

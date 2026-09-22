# 0006. Private hosting and a button that runs the content skills

**Date**: 2026-09-22
**Status**: In Progress

## Summary

The site lives on Vercel behind a password only the owner knows. On Learning and Evenimente, a button starts the section's Claude Code skill (`/learning-daily`, `/events-refresh`) on GitHub Actions; the run commits the new JSON, Vercel rebuilds, and a reload shows it. No VS Code, no manual push, no API cost.

## Decision

- **Hosting**: Vercel Hobby (free), project root `app/`, GitHub integration (a push to `main` deploys). Private GitHub repo.
- **Access**: `app/middleware.ts` (Vercel Routing Middleware) guards every path, `/api` included, with HTTP Basic Auth; the password is the `SITE_PASSWORD` env var; without it the site serves nothing. Chosen over Cloudflare Access (card on signup) and Vercel Pro (paid).
- **Button → run**: `app/api/generate.ts` (Vercel Function) dispatches `.github/workflows/learning-daily.yml` or `events-refresh.yml` and reports the latest run; `GenerateButton` polls it every 15 s.
- **Run**: `run-skill.yml` → `docker/run-skill.sh`: `npm ci`, `claude -p "/<skill>"` with only the tools the skill needs, then `--fix` check and build. Only the section's content folder is committed, so nothing else the agent touches can be published.
- **Claude auth**: `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token`, i.e. the owner's Pro plan; each run uses plan usage, not billed API.
- **Learning button replaces today's plan** (owner's choice): the old lessons move to `library.json`, the new plan gets `version` + 1 (ids `<date>-<area>-<version>`), and the social step stays the same. When a run changes nothing (e.g. no new events), the publish step is skipped and the button says so.
- **Docker**: `docker/Dockerfile` runs the same script locally; it does not commit.

## One-time setup (owner)

| Where | What |
|---|---|
| GitHub secret | `CLAUDE_CODE_OAUTH_TOKEN` = output of `claude setup-token` |
| Vercel env | `SITE_PASSWORD` = your password |
| Vercel env | `GITHUB_REPO` = `owner/name` |
| Vercel env | `GITHUB_DISPATCH_TOKEN` = fine-grained token, only this repo, permission **Actions: Read and write** |

## Build plan

- [x] Middleware, API, button, workflows, Docker script (tested: middleware cases, types, lint, build)
- [x] Private repo pushed
- [x] Vercel project, env vars, GitHub secret
- [x] First button run: chain works (plan already existed, nothing published) → button now replaces the plan
- [ ] First run from the button, end to end

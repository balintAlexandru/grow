#!/usr/bin/env bash
# Runs one content skill headless with Claude Code, then normalizes, checks and builds (spec 0006).
# Used by .github/workflows/run-skill.yml and by the Docker image; it never commits, the caller decides.
#   CLAUDE_CODE_OAUTH_TOKEN=… docker/run-skill.sh learning-daily|events-refresh|fashion-refresh|psychology-refresh [argumente pentru skill]
set -euo pipefail

skill="${1:?folosire: run-skill.sh learning-daily|events-refresh|fashion-refresh|psychology-refresh [argumente]}"
args="${2:-}"
extra=""
case "$skill" in
  learning-daily) check=content:check ;;
  events-refresh) check=events:check ;;
  # Fashion needs curl to read the photo url (og:image) out of a shop's product page.
  fashion-refresh) check=fashion:check; extra=",Bash(curl:*)" ;;
  psychology-refresh) check=psychology:check ;;
  *) echo "Skill necunoscut: $skill" >&2; exit 2 ;;
esac
: "${CLAUDE_CODE_OAUTH_TOKEN:?lipsește CLAUDE_CODE_OAUTH_TOKEN (îl obții cu: claude setup-token)}"
export TZ="${TZ:-Europe/Bucharest}"

npm ci --prefix app

# Only what the skill needs: research, editing files, and its own check and build commands.
claude -p "/$skill${args:+ $args}" \
  --allowedTools "Read,Write,Edit,Glob,Grep,WebSearch,WebFetch,Bash(npm --prefix app run $check:*),Bash(npm --prefix app run build:*)$extra"

npm --prefix app run "$check" -- --fix
npm --prefix app run build

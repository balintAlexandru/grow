#!/usr/bin/env bash
# Runs one content skill headless with Claude Code, then normalizes, checks and builds (spec 0006).
# Used by .github/workflows/run-skill.yml and by the Docker image; it never commits, the caller decides.
#   CLAUDE_CODE_OAUTH_TOKEN=… docker/run-skill.sh learning-daily|events-refresh [argumente pentru skill]
set -euo pipefail

skill="${1:?folosire: run-skill.sh learning-daily|events-refresh [argumente]}"
args="${2:-}"
case "$skill" in
  learning-daily) check=content:check ;;
  events-refresh) check=events:check ;;
  *) echo "Skill necunoscut: $skill" >&2; exit 2 ;;
esac
: "${CLAUDE_CODE_OAUTH_TOKEN:?lipsește CLAUDE_CODE_OAUTH_TOKEN (îl obții cu: claude setup-token)}"
export TZ="${TZ:-Europe/Bucharest}"

npm ci --prefix app

# Only what the skill needs: research, editing files, and its own check and build commands.
claude -p "/$skill${args:+ $args}" \
  --allowedTools "Read,Write,Edit,Glob,Grep,WebSearch,WebFetch,Bash(npm --prefix app run $check:*),Bash(npm --prefix app run build:*)"

npm --prefix app run "$check" -- --fix
npm --prefix app run build

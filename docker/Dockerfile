# Runs a content skill (/learning-daily, /events-refresh) locally in a container, the same way GitHub Actions does.
#   docker build -t grow-skills -f docker/Dockerfile .
#   docker run --rm -e CLAUDE_CODE_OAUTH_TOKEN -v "$PWD":/repo grow-skills learning-daily
# The new JSON lands in your working copy; review it, then commit and push.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g @anthropic-ai/claude-code

ENV TZ=Europe/Bucharest
WORKDIR /repo
ENTRYPOINT ["bash", "docker/run-skill.sh"]

#!/usr/bin/env bash
set -euo pipefail

VAULT="/Users/kee/Documents/01_Obsidian/AI News"
CONTENT="$(cd "$(dirname "$0")" && pwd)/content"

rsync -av --delete \
  --exclude=".obsidian/" \
  --exclude=".trash/" \
  --exclude=".DS_Store" \
  --exclude="CLAUDE.md" \
  --exclude="*.base" \
  --exclude="node_modules/" \
  "$VAULT/" "$CONTENT/"

echo "✅ Synced vault → content/"

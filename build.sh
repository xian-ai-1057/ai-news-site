#!/usr/bin/env bash
# Wrapper used by both local dev and Cloudflare Pages.
# Runs Quartz build and copies _headers (Cloudflare-only file) into public/.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

npx quartz build
cp _headers public/_headers
echo "✅ Build complete with _headers"

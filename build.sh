#!/usr/bin/env bash
# Cloudflare + local build wrapper.
# 1. 動態重新產生 content/index.md(掃 content/ 目錄)
# 2. 跑 quartz build
# 3. 把 _headers 複製到 public/
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# === 1. 動態產生 content/index.md ===
{
  echo "---"
  echo "title: AI 日報"
  echo "---"
  echo ""
  echo "# AI 日報 — Claude 自動整理的 AI 新聞知識庫"
  echo ""
  echo "每日追蹤 AI 領域的技術突破、市場動態、企業導入與新創動向,由 Claude 整理成結構化筆記,並交互連結成三階層的知識網。"
  echo ""
  echo "## 📅 最新日報"
  echo ""
  ls content 2>/dev/null \
    | grep -E "^AI日報-[0-9]{4}-[0-9]{2}-[0-9]{2}\.md$" \
    | sort -r | head -5 \
    | while read -r f; do
        slug="${f%.md}"
        date=$(echo "$slug" | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}")
        echo "- [[${slug}]] — ${date}"
      done
  echo ""
  echo "## 🧭 探索方式"
  echo ""
  echo "- **[[Learning Notes/INDEX|📚 學習筆記索引]]** — 按主題、難度、學習路徑瀏覽所有技術深度筆記"
  echo "- **每日日報** — 五大分類:🔬 技術理論 / 📊 市場情況 / 📰 重大新聞 / 🏢 企業應用導入 / 🚀 新創公司"
  echo "- **左側檔案樹** — 直接瀏覽 Articles 與 Learning Notes 目錄"
  echo "- **右側 Graph View** — 視覺化三階層連結(日報 → 文章 → 學習筆記)"
  echo "- **搜尋(\`Ctrl+K\` / \`Cmd+K\`)** — 全文搜尋所有筆記"
  echo ""
  echo "## 🎮 互動式學習工具"
  echo ""
  if [ -d "content/Learning Notes/Interactive" ]; then
    ls "content/Learning Notes/Interactive/" \
      | grep -E "\.html$" \
      | sort \
      | while read -r f; do
          name="${f%.html}"
          path=$(printf "Learning%%20Notes/Interactive/%s" "$f")
          echo "- [${name}](${path})"
        done
  fi
  echo ""
  echo "---"
  echo ""
  echo "*本站由 [Quartz](https://quartz.jzhao.xyz/) 從 Obsidian vault 自動產生,內容由 Claude 整理。*"
} > content/index.md

echo "✅ Regenerated content/index.md"

# === 2. Quartz build ===
npx quartz build

# === 3. Copy _headers (Workers Static Assets metadata) ===
cp _headers public/_headers

echo "✅ Build complete with _headers"

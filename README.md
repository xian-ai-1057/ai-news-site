# AI 日報 — Markdown → Supabase DB-first 內容管線

這是什麼：**AI 日報**是一個繁體中文 AI 新聞知識庫的後端內容管線。原為 Quartz 靜態網站，現已轉型為 **Supabase DB-first** 架構：Markdown 原始檔由 ingest CLI 解析後直接寫入 Postgres；介面（前端閱讀 App）為獨立專案，尚在規劃中，**不再使用 Quartz**。

## 架構（三層內容）

```
daily_reports → daily_report_items → articles ← learning_notes
```

| 資料類型 | 說明 | 現有數量 |
|---|---|---|
| `daily_reports` | 每日 AI 日報 | 23 份 |
| `articles` | 個別新聞文章 | 214 篇 |
| `learning_notes` | 技術學習筆記 | 61 份 |

## 目錄結構

```
ingest/
  parser/   — Markdown 解析（frontmatter + body → records）
  db/       — records → Supabase upsert
  cli/      — 批次回填 & 單日入庫 CLI
supabase/
  migrations/ — DB schema DDL（進版控）
specs/        — 規格文件（每層一份 spec.md）
content/      — 歷史種子 / 回填來源（已非內容來源，DB 為準）
  Articles/
  Learning Notes/
  AI日報-YYYY-MM-DD.md（×23）
```

> `content/` 僅作為可重現回填的種子與歷史備份，**不再是內容的唯一來源；資料庫（Supabase）才是唯一事實**。

## 環境設定與常用指令

1. 複製環境變數範本並填入金鑰：
   ```bash
   cp .env.example .env
   # 填入 SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY
   ```

2. 安裝相依套件：
   ```bash
   npm install
   ```

3. 型別檢查：
   ```bash
   npm run typecheck
   ```

4. 執行測試：
   ```bash
   npm test
   ```

5. 全量入庫 / 每日入庫（需 Supabase 金鑰）—— 遞迴掃整個 `content/`、idempotent upsert、兩階段 FK 解析：
   ```bash
   npm run ingest:backfill
   ```

6. 單日增量入庫（需 Supabase 金鑰）—— 只傳「當日」的檔案路徑，不可傳 `content/` 目錄：
   ```bash
   # ✅ 正確：明確列出當日檔案（含子資料夾路徑）
   npm run ingest:day -- content/Articles/2026-06-07-*.md "content/Learning Notes/2026-06-07-*.md" content/AI日報-2026-06-07.md

   # ⛔ 不要這樣用：ingest:day 的目錄掃描是「非遞迴」的，傳 content/ 只會抓到頂層日報、
   #    抓不到 Articles/ 與 Learning Notes/，且 daily_report_items 採 delete-then-insert，
   #    會把 join 表清空。要對整個 content/ 入庫，請改用上面的 ingest:backfill。
   # npm run ingest:day -- content/
   ```

## 待辦事項

- **新 UI**：獨立前端 App，直接讀取 Supabase，尚未開始
- **Cloudflare `ai-news` Workers 專案**：需手動在 Cloudflare Dashboard 停用（repo 外操作）
- **中文全文搜尋**：Postgres `pg_jieba` 或 `pgroonga` 擴充，尚在評估

## 技術棧

- Node ≥ 22、TypeScript、Zod、`@supabase/supabase-js`、`gray-matter`、`tsx`
- Supabase（Postgres + PostgREST）
- GitHub Actions CI（typecheck + parser 測試）

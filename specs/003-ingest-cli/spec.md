# Spec 003 — Supabase Upsert & CLI

> 對應重建計畫「Phase 2」。上游：Spec 001（schema + records）、Spec 002（IngestBundle）。下游：無（最終消費端）。

## 1. Context
parser（002）產出 records 後，需要冪等地寫進 Supabase（001 的表）。本 spec 負責 records → DB 的 upsert，含兩階段 FK 解析，並提供 CLI 做一次性回填與未來每日直寫。

## 2. Scope
### In scope
- `@supabase/supabase-js`（service role key）冪等 upsert。
- 兩階段 FK 解析：先寫 articles 取得 id，再以 slug→id 對映解 `learning_notes.source_article_id` 與 `daily_report_items.article_id`。
- CLI：`ingest:backfill`（掃 `content/`）、`ingest:day -- <dir|files...>`（寫單日）。
- 寫入後印出摘要：各表筆數、FK 解析率、未解析 slug 清單。

### Out of scope
- parser 規則（屬 002，**第 1 次重複提醒**）、schema DDL（屬 001）、UI。

## 3. 核心設計決策
- **寫入順序**：① `articles`（`upsert onConflict:slug`）→ 查回 `{slug:id}` → ② `learning_notes`（填 `source_article_id`，`onConflict:slug`）→ ③ `daily_reports`（`onConflict:slug`）→ 查回 `{slug:id}` → ④ `daily_report_items`（填 `daily_report_id`+`article_id`，`onConflict:(daily_report_id,article_id)`）。
- **冪等**：全部 upsert；同輸入連跑兩次，筆數與內容不變。`daily_report_items` 在寫某日報前先 `delete where daily_report_id=…`（避免改版後殘留舊 item）。
- **FK 解不到**：item 的 article 找不到 → 跳過該 item 並記 warning（不讓整批失敗）；note 的 source article 找不到 → `source_article_id=null`、保留 `source_article_slug`。
- **camelCase↔snake_case**：在 `ingest/db/` 的 mapper 集中轉換。
- **金鑰**：`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` 由 `.env` 注入（`dotenv`），**不得 commit**。

## 8. Acceptance Criteria
1. **回填筆數**：`ingest:backfill` 後 `articles=214`、`learning_notes=61`、`daily_reports=23`；`daily_report_items` = 各日報 items 總和。
2. **golden 寫入**：給 golden records 寫入後，DB row 經 mapper 反查與 records 相符（prose 欄位 startsWith）。
3. **冪等**：連跑兩次 backfill，四表筆數不變。
4. **FK 解析**：`learning_notes.source_article_id` 解析率 > 0；未解析者 `source_article_slug` 非空且 `source_article_id is null`；CLI 印出未解析清單。
5. **抽查**：`AI日報-2026-05-19` 之 items 經 join 還原 8 則、5 章節對應正確。
6. **失敗不外溢**：單筆寫入錯誤被捕捉、計入 warning，批次續跑並以非零 exit code 標示有 warning。

## 9. 與其他 spec 的介面
| 對象 | 介面 |
|---|---|
| Spec 001 | 寫入目標表 + conflict keys；RLS 由 service role 繞過 |
| Spec 002 | 消費 `buildBundle()` 的 `IngestBundle` 與單檔 parse 結果 |

## 10. Out of scope（再次強調）
parser 規則（**第 2 次重複提醒**）、schema、UI、網路抓取。

# Spec 001 — DB Schema & Records 契約

> 對應重建計畫「Phase 1」。上游：無。下游：Spec 002（消費型別）、Spec 003（消費型別 + 寫入 schema）。

## 1. Context
內容要從 Markdown 搬進 Supabase（DB-first）。本 spec 是**跨層唯一事實**：定義四張表的 DDL（`supabase/migrations/0001_init.sql`）與對應 Zod records（`contracts/records.schema.ts`），鎖死 parser 與 upsert 之間的介面。

## 2. Scope
### In scope
- 四表：`articles` / `learning_notes` / `daily_reports` / `daily_report_items`，含 `category_enum`、FK、索引、RLS。
- Zod records + golden fixtures（`contracts/fixtures/*.{input.md,expected.json}`）。

### Out of scope
- 全文搜尋（中文 FTS 列後續，**第 1 次重複提醒**）。
- 實際資料寫入（屬 Spec 003）、UI。

## 3. 核心設計決策
- **三層圖**：`daily_reports → daily_report_items → articles ← learning_notes`。文章→筆記為 `learning_notes.source_article_id` 反向，不另設表。
- **FK 備援**：`learning_notes.source_article_slug` 保留原始 wikilink；FK 解不到時資料不遺失、可事後修。
- **category enum / difficulty·industry text**：category 全庫僅 5 值（已驗證）故設 enum；difficulty（入門/中階/進階）、industry（自由文字如「跨產業 / 私募基金」）保留 text。
- **RLS public-read**：anon 可 SELECT；寫入只走 service_role（繞過 RLS）。

## 4. 詳細規格
見 `supabase/migrations/0001_init.sql` 與 `contracts/records.schema.ts`（本 spec 的可機器驗證契約本體）。

## 8. Acceptance Criteria
1. **Migration 套用**：`apply_migration` 後 `list_tables` 見 4 表；FK：`learning_notes.source_article_id→articles`、`daily_report_items.{daily_report_id→daily_reports, article_id→articles}`。
2. **Fixture validate**：`article/learning-note/daily-report.expected.json` 各自通過對應 Zod `.parse()`（daily 用 `DailyReportRecordSchema.partial` 容許 prose 前綴）。
3. **RLS 啟用**：四表 `rowsecurity = true` 且各有一條 public read policy；`get_advisors(security)` 無「RLS disabled」紅燈。
4. **Enum 完整**：`category_enum` 恰含 5 值。
5. **冪等 DDL**：migration 用 `if not exists` / `drop policy if exists`，重跑不報錯。

## 9. 與其他 spec 的介面
| 對象 | 介面 |
|---|---|
| Spec 002 | 提供 records 型別、`CategorySchema`、`SECTION_HEADER_TO_CATEGORY` |
| Spec 003 | 提供表結構（upsert 目標）、conflict key（`slug` / `report_date` / `(daily_report_id,article_id)`） |

## 10. Out of scope（再次強調）
全文搜尋（**第 2 次重複提醒**）、UI、資料寫入。

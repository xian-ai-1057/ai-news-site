# AI News — DB-first 內容平台（SDD repo）

繁中 AI 新聞知識庫。原為 Quartz 靜態站，**正在轉型為 Supabase DB-first**：內容存 Postgres，介面另案設計（不再用 Quartz）。

## 方法論：SDD + Agent Teams
- **Spec 為單一事實**：寫程式前先讀 `specs/00X-*/spec.md`；發現 spec 漏洞 → 回報改 spec，不自行解讀。
- **契約優先**：`specs/001-db-schema/contracts/records.schema.ts` 是跨層唯一介面，Phase 0 凍結後**唯讀**。
- **檔案隔離**：兩位 teammate 不可動同一檔案（見 `specs/agent-teams-plan.md`）。
- **不寫入 `Archive/`**：舊 Quartz 移此，全程禁寫。

## 架構（三層內容）
`daily_reports → daily_report_items → articles ← learning_notes`
- 日報 `content/AI日報-YYYY-MM-DD.md`（23）
- 文章 `content/Articles/*.md`（214）
- 學習筆記 `content/Learning Notes/*學習*.md`（61，排除 INDEX/Interactive）

## 目錄
- `specs/` — 規格、契約、golden fixtures
- `supabase/migrations/` — DB schema（進版控）
- `ingest/{parser,db,cli}/` — Markdown → records → Supabase
- `content/` — 歷史種子/回填來源（**已非內容來源，DB 為準**）

## 環境
- Node ≥ 22、TypeScript、Zod、`@supabase/supabase-js`、`gray-matter`、`tsx`。
- 金鑰：`.env`（`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`），**不得 commit**。
- 常用：`npm run typecheck`、`npm test`、`npm run ingest:backfill`、`npm run ingest:day -- <dir>`。

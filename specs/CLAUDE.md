# specs/ — 給 teammate 的規則

每份 spec 一個目錄 `00X-<feature>/spec.md`。實作前**必讀對應 spec.md**。

## 鐵則
1. **契約凍結**：`001-db-schema/contracts/records.schema.ts` + `fixtures/` 是跨層唯一事實，Phase 0 後唯讀。需要改契約 → 回報 Lead，不自行改。
2. **檔案隔離**：照 `agent-teams-plan.md` 的「可動檔案範圍」，不越界。越界需求 → 回報 Lead 重分配。
3. **AC 可測**：每條 Acceptance Criteria 都要能用一個測試或一條 SQL/MCP 查詢驗證。
4. **prose 比對**：golden fixture 的 `summaryMd/contentMd/blurbMd` 採 `startsWith` 前綴比對，`rawMd` 不比對，其餘嚴格相等（見 `002-parser/spec.md` §5）。
5. **不寫 `Archive/`**。

## spec 索引
- `001-db-schema` — schema DDL + Zod records + golden fixtures（上游）
- `002-parser` — Markdown → records（消費 001；僅種子復原用）
- `003-ingest-cli` — records → Supabase + CLI（消費 001+002）
- `004-decommission` — 移除 Quartz + 文件 + 交付
- `005-web-ui` / `006-web-linking` — Next.js 16 閱讀 App（web/）
- `007-structured-channel` — daily-bundle.json 通道＋品質閘門＋ingestion_runs（組合 001 契約）
- `008-source-layer` — sources/raw_items 候選池＋fetch-sources Edge Function
- `009-observability` — status page＋daily-healthcheck＋Slack 告警
- `010-ai-features` — pgvector 語意搜尋/相關文章＋pgroonga 中文 FTS

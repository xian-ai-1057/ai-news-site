# Agent Teams 配置

一 Phase 一 Team，做完解散。檔案隔離為契約：同一檔案只能有一位 owner。

| Phase | Teammate | subagent_type | model | 可動檔案範圍 | 任務 |
|---|---|---|---|---|---|
| 0 | Lead（spec-author 角色） | — | opus | `specs/**`、`supabase/migrations/**` | 寫 001–004 spec + Zod 契約 + golden fixtures + schema |
| 1 | Lead | — | opus | `package.json`、`tsconfig.json`、`.env.example`、`.gitignore` | 套 migration（MCP）、寫 meta 設定檔（含 ingest 全部相依） |
| 2 | `parser-eng` | general-purpose | opus | `ingest/parser/**`、`tests/parser/**` | 依 002 實作 parser，過 golden 測試 |
| 2 | `upsert-eng` | general-purpose | opus | `ingest/db/**`、`ingest/cli/**`、`tests/db/**` | 依 003 實作 upsert + CLI |
| 3 | `infra-eng` | general-purpose | sonnet | 刪 Quartz 檔、`README.md`、`.github/workflows/**`、`每日…排程.md` | 依 004 移除 Quartz + 改寫文件 |

## 檔案隔離契約
- `package.json` / `tsconfig.json`：**Lead 在 Phase 1 寫定**（含 `zod`、`@supabase/supabase-js`、`gray-matter`、`dotenv`、`tsx`、`typescript`）。Phase 2 兩位 teammate **只新增 source、不改 deps** → 無三方撞檔。
- `contracts/`：Phase 0 凍結、Phase 2 唯讀。
- `Archive/`：全程禁寫。
- Phase 2 兩位 teammate 檔案範圍互斥（`parser/` vs `db/`+`cli/`），可平行；建議開 `isolation: "worktree"`。

## 派 teammate 的 prompt 必含
spec.md 路徑、契約路徑（`specs/001-db-schema/contracts/records.schema.ts`）、可動檔案範圍、上下游介面、測試/驗收清單、「禁寫 Archive/」、「契約唯讀」。

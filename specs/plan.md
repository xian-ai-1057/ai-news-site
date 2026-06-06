# 重建計畫：Quartz 靜態站 → Supabase DB-first 內容平台

## 為什麼
內容鎖在 Markdown + Quartz 靜態站，無法被介面/查詢靈活取用。改為 **DB-first**：內容存 Supabase（專案 `ifbpfuvlevjegwdnhyqh`），介面另案設計（不再用 Quartz）。

## 已確認決策
1. **DB 為主**：未來每日流程直接寫 Supabase，Markdown/git 不再是內容儲存。
2. **本次範圍**：DB schema + ingest 工具 + 回填現有 300 篇；介面之後另做。
3. **交付**：從 `v4` 開分支、開 PR；同一 PR 移除 Quartz。

## 資料模型
三層圖 `daily_reports → daily_report_items → articles ← learning_notes`。
目標筆數：articles=214、learning_notes=61、daily_reports=23。
契約：`001-db-schema/contracts/records.schema.ts`（凍結）。

## Phase
| Phase | 目標 | Specs | 驗收 |
|---|---|---|---|
| 0 | 寫 spec + 契約 + golden | 001–004 | specs 完整、契約凍結 |
| 1 | 套 migration、寫 meta 設定 | 001 | `list_tables` 4 表 + FK；`get_advisors` 無紅燈 |
| 2 | parser ∥ upsert+CLI | 002, 003 | golden 測試過 |
| 3 | 回填 + 移除 Quartz + 開 PR | 004 | 筆數對齊、Quartz 清除、CI 綠、PR 開成 |

依賴：0 → 1 → 2 → 3。Team 配置見 `agent-teams-plan.md`。

## 驗證見各 spec §8（Acceptance Criteria）。

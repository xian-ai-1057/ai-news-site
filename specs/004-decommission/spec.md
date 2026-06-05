# Spec 004 — 移除 Quartz & 交付

> 對應重建計畫「Phase 3」。上游：001–003 完成。下游：無。

## 1. Context
DB-first 後不再需要 Quartz 靜態站。本 spec 把 repo 從「靜態站產生器」清理成「資料管線 repo」，改寫文件，並把每日流程文件改為「產生後直寫 DB」。

## 2. Scope
### In scope
- **刪除 Quartz**：`quartz/`、`quartz.config.ts`、`quartz.layout.ts`、`build.sh`、`sync-vault.sh`、`wrangler.jsonc`、`Dockerfile`、`docs/`、`_headers`、`globals.d.ts`、`index.d.ts`、`.npmrc`(Quartz 用)、`.github/workflows/{build-preview,deploy-preview,docker-build-push}.yaml`、`content/index.md`、`Learning Note Template (Notebook).html`、`learning-note.zip`。
- **改寫**：`package.json`（精簡為 ingest 專案）、`README.md`（新 infra 說明）、`.github/workflows/ci.yaml`（只跑 typecheck + parser 測試）。
- **更新** `每日AI新聞日報排程-雲端版.md`：產生當日筆記後改執行 `npm run ingest:day -- content/`（直寫 Supabase），**不再 git push 內容、不再建 Quartz**。
- **保留** `content/`（歷史種子/回填來源）+ `content/Articles`、`content/Learning Notes`；README 註明「已非內容來源，DB 為準」。

### Out of scope
- 刪除 `content/` 內容檔（保留為種子，**第 1 次重複提醒**）。
- Cloudflare `ai-news` 專案停用（repo 外、手動，僅在 PR/README 列待辦）。
- 新 UI 實作。

## 3. 核心設計決策
- **package.json 由 Lead 在 Phase 1 寫定**（含 ingest 全部相依）；本 spec 的 infra-eng 只做「移除 Quartz 殘留 + 文件」，避免與 Phase 2 撞 `package.json`。
- **保留內容檔**：DB 雖為來源，但 `content/` 保留作為可重現回填的種子與歷史備份。

## 8. Acceptance Criteria
1. **無殘留**：`grep -ri quartz` 在 repo（排除 `Archive/`、git 歷史）無命中；上列檔案/目錄已刪。
2. **typecheck 綠**：`npm run typecheck` 通過。
3. **CI 重寫**：`.github/workflows/ci.yaml` 只含 install + typecheck + parser 測試，無 Quartz/deploy。
4. **文件正確**：`README.md` 描述 DB-first、schema、`ingest` 用法、UI 另案；排程文件改為直寫 DB。
5. **content 保留**：`content/Articles`、`content/Learning Notes`、`AI日報-*.md` 仍在；README 註明非來源。

## 9. 與其他 spec 的介面
| 對象 | 介面 |
|---|---|
| Spec 003 | 排程文件引用 `ingest:day` 指令 |

## 10. Out of scope（再次強調）
不刪 `content/` 內容（**第 2 次重複提醒**）、不自動停用 Cloudflare、不做新 UI。

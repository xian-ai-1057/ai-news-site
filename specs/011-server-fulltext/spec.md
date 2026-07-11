# Spec 011 — 全文抽取 Edge Function（收緊 routine 網路）

## 1. 目標

把「抓新聞全文」從 Claude routine 搬到伺服端 Edge Function，讓 routine 只需連
Supabase（＋ WebSearch 走 Anthropic，免白名單），不再對任意新聞網域發出請求。
如此 Claude Code Routine 的環境 **Network access 可從 Full 降為 Custom**
（只放行 `ifbpfuvlevjegwdnhyqh.supabase.co`），移除「routine 一邊握 service_role
key、一邊抓不可信網頁」的 prompt-injection 曝險面。

## 2. 範圍邊界

- 只做「URL → 純文字全文」的伺服端抽取；翻譯、摘要、改寫仍由 routine（唯一 AI
  環節）負責。抽取回傳純文字（多為原文語言），routine 據此產 `contentMd`。
- 同時服務兩種來源：候選池文章（有 rawItemId/url）與 WebSearch 補缺文章（只有 url）。
  一律以 **url** 為介面，兩者統一。
- 不改品質閘門：抽取失敗或內容過薄 → routine 丟棄該篇、另選一篇（池內上千筆，
  替代充足）。`ingest:json` 的 content-quality 閘門仍是最終防線。

## 3. Edge Function（`supabase/functions/extract-fulltext/index.ts`）

- POST `{ "urls": string[] }`（verify_jwt；routine 帶 service_role key）。
- 對每個 url：
  1. 算 `url_hash`（`_shared/normalize-url.ts`，與 008 同一套），查 `raw_items`。
  2. **既有 feed 全文優先**：若該列 `content_text` 已足夠（≥ 200 字、非樣板），
     直接回傳，`status='cached-feed'`——省一次 fetch，且 RSS `content:encoded`
     來源本就有全文。
  3. 否則伺服端 `fetch` 該 url，用 **Readability**（`@mozilla/readability` +
     `linkedom`）抽正文；失敗則退化為去標籤純文字。
  4. 抽取結果 ≥ 200 字且非樣板 → best-effort 回寫 `raw_items.content_text`（快取），
     `status='fetched'`；否則 `status='failed: <reason>'`、`contentText=''`。
- 回傳 `{ results: [{ url, title, contentText, chars, status }] }`。單 url 失敗
  不影響其他 url（per-url try/catch）。抽取文字上限 30,000 字。
- 網路：本函式 fetch 任意新聞網域——但這是伺服端、與 routine 的憑證隔離。

## 4. CLI（`ingest/cli/index.ts` + `ingest/cli/fulltext.ts`）

- 新子命令 `fulltext <urls.json | url...>`：讀 URL 清單（JSON 陣列／`{urls:[]}`／
  每行一個／CLI 參數）→ POST 到 extract-fulltext（`SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY`）→ 印 `FULLTEXT_JSON: {...}` 供 routine 消費。
- `ingest/cli/fulltext.ts`：純函式 `parseUrlsInput`（解析＋去重＋濾非 http），可測。

## 5. Routine prompt 改動（`每日AI新聞日報排程-雲端版.md`）

- 步驟 3「抓全文」：不再用 defuddle/WebFetch。改為把選中文章的 url（候選池的
  url，或 WebSearch 結果的 url）收成清單 → `npm run fulltext -- urls.json` →
  讀 `FULLTEXT_JSON` → 以 `contentText` 為底翻譯成繁中 `contentMd`。某 url
  `status` 非 fetched/cached-feed → 丟棄該篇、另選。
- `origin.fetchMethod` 填 `edge-extract`。
- 網路白名單警語：Full → **Custom，只需放行 Supabase**（WebSearch 自動放行）。

## 6. 部署

- 隨 `supabase/functions/**` 由 `.github/workflows/deploy-functions.yml` 自動部署
  （本次亦以 MCP 直接部署上線）。
- `supabase/functions/deno.json` 加入 `@mozilla/readability`、`linkedom` import。

## 7. Acceptance Criteria

- AC1 `parseUrlsInput` 支援 JSON 陣列／`{urls}`／換行／CLI 參數，去重、濾掉非 http。（unit test）
- AC2 extract-fulltext：feed 已有全文 → `cached-feed` 不重抓；無則 fetch+Readability。（部署後 smoke）
- AC3 對真實 arXiv abs 與一則新聞頁回傳 ≥200 字 contentText、status 正常。（部署後 smoke）
- AC4 403/薄內容 → `status='failed: …'`、contentText 空，不 throw。（部署後 smoke）
- AC5 routine 網路設 Custom（只 Supabase）時仍能跑完整條流程。（切換後觀察）

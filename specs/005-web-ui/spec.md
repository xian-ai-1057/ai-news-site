# Spec 005 — Web UI（AI 日報 · Signal 前端）

> 對應重建計畫「Phase 4–6」。上游：Spec 001（DB schema / category_enum / public-read RLS）。下游：無。
> 本前端是獨立讀取端，**不寫 DB**；只透過 anon/publishable key 走 public-read RLS。

## 1. Context

`repo/` 後端已就緒（Supabase `ifbpfuvlevjegwdnhyqh`：23 日報 / 214 文章 / 61 學習筆記）。設計稿 `AI News.zip` 的 hifi 原型（代號 **Signal**，繁中數位日報）要在 `repo/web/` 用 **Next.js App Router + Tailwind v4 + CSS 變數**重建，Server Components 直讀 Supabase（ISR），並把學習筆記串成真實 `/notes/[slug]`。

本 spec 是前端的單一事實：定義 view-model 契約（`contracts/viewmodel.ts`）、分類常數（`contracts/categories.ts`）、token 參考（`reference/tokens.md`）、golden fixtures，鎖死「資料層 ↔ 元件」介面。

## 2. Scope

### In scope
- `web/` Next.js App Router 專案：5 畫面（首頁 / 內頁 / 分類 / 關於 / 全文搜尋 overlay）+ 新增學習筆記頁。
- 資料層：用 `@supabase/supabase-js`（anon key）以 PostgREST embedding 取齊，shape 成 view-model。
- 三個 DB 無欄位的衍生：`observation`（抽自 `raw_md`）、`issue`（期數）、`lead`（頭條）。
- 亮/暗主題（CSS 變數 + `localStorage['ainews-theme-c']` + 防閃爍 script）、響應式（880/600 斷點）、pixel-perfect tokens。
- 分類頁搜尋 + 主題篩選、⌘K 全文搜尋 overlay（皆 client-side `includes`）。

### Out of scope
- 寫入 DB / 任何 mutation；訂閱表單接後端（靜態展示，**第 1 次重複提醒**）。
- Postgres 中文全文搜尋（`pg_jieba`/`pgroonga`，後端待評估，**第 1 次重複提醒**）。
- 動 ingest 契約（`001-db-schema/contracts/records.schema.ts`）或 DB schema —— 唯讀。
- 部署設定（Vercel/Cloudflare）、原型 Tweaks 面板 / `__edit_mode` / 密度變體 / 襯線字型。

## 3. 核心設計決策

- **view-model 契約優先**：元件只認 `viewmodel.ts`（`Digest / DigestItem / SearchRow / Note`），不直接認 DB schema。資料層負責中→英分類對映、欄位整形與三個衍生。兩邊靠 golden fixtures 對齊（同 Spec 001 的契約思路）。
- **衍生規則（DB 無欄位，於 `web/lib/shape.ts`）**：
  - `extractObservation(rawMd)`：定位 `## 📌 今日觀察`，切到下一個 `## ` 標題前；移除 callout 首行 `> [!...] 標題`，逐行去 `> ` 前綴，空 `>` 行 → 段落分隔；trim。無此段 → `""`。
  - `deriveIssue(report_date)`：對全表 `report_date` 由舊到新排名，由 **1** 起算（2026-06-05 = 23）。
  - `deriveLead(items)`：取 `重大新聞`（news）section `position 0`；若該期無 news，取整體（CAT_ORDER→position）第一則。每期恰一則 `lead:true`。
- **note 旗標**：`learning_notes.source_article_id = articles.id` 命中 → `noteSlug` = 該筆 slug（→ `/notes/[slug]`），否則 `null`。
- **搜尋一律 client-side**：抓輕量 `SearchRow[]` 一次，瀏覽器 `includes` 比對 `title+points+source+industry`（小寫）；分類頁主題 chip 可與關鍵字疊加；命中 `<mark>` 高亮（需 escape regex）。**刻意不碰 DB FTS**（**第 2 次重複提醒**）。
- **渲染/安全**：頁面 Server Component + ISR（`revalidate=3600`）；搜尋/篩選/主題/overlay 為 Client Component。只用 anon/publishable key，**service_role 不得進 web/**。
- **分類色一致**：以 `catColor(hue, dark)` 衍生（Light `66%/48%`、Dark `60%/64%`），對映規則與 emoji 取自 `categories.ts`，不重造。

## 4. 詳細規格
- 介面型別：`contracts/viewmodel.ts`（本 spec 的機器驗證契約本體）。
- 分類常數：`contracts/categories.ts`。
- 視覺數值：`reference/tokens.md`（pixel-perfect 來源）。
- 路由與元件 owner、檔案隔離：見 `specs/agent-teams-plan.md`「Phase 6」。

## 5. 路由
| 路由 | 對應原型 | 型態 |
|---|---|---|
| `/` | homeView：hero 頭條 + 五分類 strip + archive grid | Server (ISR) |
| `/digest/[date]` | digestView：rhead/lede-box/分類段/obs/上下期導覽（`generateStaticParams` 取 report_date） | Server (ISR) |
| `/sections` | catView：sticky 控制列 + 搜尋 + 主題 chips + `<mark>` + 空狀態（`?q=&cat=`） | Client |
| `/about` | aboutView：訂閱卡（靜態）+ 五分類 tag | Server |
| `/notes/[slug]` | **新增**：render `learning_notes.content_md` | Server (ISR) |
| 全域殼 | header / 主題切換 / ⌘K overlay | Layout + Client |

## 8. Acceptance Criteria（可測）
1. **契約 parse**：`fixtures/digest-2026-06-05.json` 可被 `viewmodel.ts` 的 `Digest` 型別接受（`tsc` 無錯）；`search-index.json` 各列符合 `SearchRow`。
2. **getDigest 對齊 golden**：`getDigest('2026-06-05')` 輸出與 `digest-2026-06-05.json` 相符（`date/weekday/issue/items[].catKey/title/source/url/industry/noteSlug` 嚴格相等；`summary/points/observation` 採 `startsWith` 前綴）。
3. **issue 衍生**：`deriveIssue` 使 2026-06-05 = 23，且全 23 期連號不重複。
4. **lead 衍生**：2026-06-05 的 `lead:true` 恰一則，且為 news section 的「Anthropic 估值衝破 9650 億美元…」。
5. **observation 抽取**：2026-06-05 的 `observation` 以「今日新聞呈現出技術理論與企業應用之間的清晰對應」開頭，且**不含** `>`、`[!note]`、`## 📚 歷史日報`、footer。
6. **note 對映**：2026-06-05 兩篇 tech 文章 `noteSlug` 非 null（GPT-5.5、Transformer 早期退出）；其餘 6 則為 null。`/notes/<該 slug>` 能 render 出對應筆記標題。
7. **中→英分類**：所有 `catKey ∈ {tech,market,news,enterprise,startup}`；`industry` 空字串正規化為 `null`。
8. **首頁 hero = 內頁頭條**：`/` 的 hero 標題與 `/digest/2026-06-05` 的 `lead` 則標題一致。
9. **token 保真**：`globals.css` 的亮/暗變數值與 `reference/tokens.md` §1 完全相符（逐 hex 對照）；`--accent` light=`#4b3ff7`、dark=`#8b7dff`。
10. **主題切換**：toggle 改 `<html data-theme>` 並寫 `localStorage['ainews-theme-c']`；reload 無 FOUC（防閃爍 script 生效）。
11. **響應式**：≥881px strip 5 欄、archive 2 欄；≤880px strip 2 欄、archive 1 欄；≤600px strip 1 欄、nav 僅留 `.on` + 兩 icon。
12. **分類頁搜尋焦點**：輸入時只重繪結果、不 remount input（焦點與游標保留）；命中以 `<mark>` 包裹；空命中顯示 `.cat-empty`。
13. **⌘K overlay**：⌘K/Ctrl-K 開、Esc/點遮罩關；空輸入顯示前 8 筆、有查詢最多 20 筆、無命中空狀態；點結果進 `/digest/[date]`。
14. **建置**：`cd web && npm run build` 成功（含 `/digest/[date]`、`/notes/[slug]` 的 `generateStaticParams`）。
15. **安全**：`web/` 內無 `SUPABASE_SERVICE_ROLE_KEY`；只用 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`。

## 9. 與其他 spec 的介面
| 對象 | 介面 |
|---|---|
| Spec 001 | 消費四表（public-read RLS）、`category_enum` 五值、conflict key（`report_date`/`slug`）；**唯讀** |
| 資料層 ↔ 元件（本 spec 內） | `contracts/viewmodel.ts` 型別 + `categories.ts` 常數（Phase 4 凍結、Phase 6 唯讀） |

## 10. Out of scope（再次強調）
訂閱接後端（**第 2 次重複提醒**）、DB 中文 FTS（**第 3 次重複提醒**）、寫 DB、改 ingest 契約 / schema、部署。

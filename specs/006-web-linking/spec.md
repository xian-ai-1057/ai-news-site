# Spec 006 — Web 文章頁與串接 + UX 優化

> 對應重建計畫「Phase 7」。上游：Spec 001（DB schema）、Spec 005（Web UI / view-model 契約）。下游：無。
> 本 spec 是 Spec 005 的**加法式延伸**：只加欄位 / 路由 / 元件，不改既有語意，故 005 既有 AC 不受影響。

## 1. Context

Spec 005 把前端做到「日報頁 / 學習筆記頁」，但**刻意未做文章頁與標題內連**（005 §5 路由表無 `/articles`）。使用者回報三個痛點：

1. 日報頁每則新聞**標題不能點**，無法進到對應文章（`SectionItem` 標題是純文字 `<h3>`）。
2. **文章本身沒有頁面**可連（無 `/articles/[slug]` route）。
3. UX 可優化：搜尋結果只連日報、跨頁回連跳脫脈絡、學習筆記的 Mermaid 圖無法 render、文章無法依標籤瀏覽。

**根因**：DB 關聯早已齊備 —— `daily_report_items.article_id → articles.id`（FK，ingest 已 resolve；經 SQL 驗證 2026-06-05 八則每則都有 article slug）、`articles.slug` unique。缺口全在 `web/`：查詢沒取 `slug` → view-model 無 `articleSlug` → 無 URL 可組 → 無路由。**本 spec 比照筆記（`learning_notes(slug)` → `noteSlug` → `/notes/[slug]`）把文章補成可路由。**

## 2. Scope

### In scope
- 契約加法式擴充：`DigestItem.articleSlug`、`SearchRow.articleSlug`、新 `Article` 型別（`contracts/viewmodel.ts` 與 `web/lib/viewmodel.ts` 同步）。
- 查詢層：`DIGEST_SELECT` 補 `articles.slug`；新增 `getArticle(slug)` / `getArticleSlugs()` / `getTagArticles(tag)`。
- 新路由 `/articles/[slug]`（Server + ISR）、`/tags/[tag]`（Server）。
- 日報標題內連文章；搜尋（⌘K / 分類頁）結果直達文章。
- 三向回連：文章 ↔ 日報 ↔ 學習筆記；筆記頁「返回」改連來源文章。
- 共用 `<MarkdownView>` client 元件：Mermaid 渲染（**方案 A：瀏覽器端**）、Obsidian callout 美化、`[[wikilink]]` 內連。

### Out of scope
- 改 DB schema / ingest 契約（`001-db-schema`）/ migration —— 唯讀（**第 1 次重複提醒**）。
- **Mermaid 預渲染成圖片 / Supabase Storage**：經效益評估後不做，採瀏覽器端 render（**第 1 次重複提醒**）。
- 寫入 DB / mutation、部署、DB 中文全文搜尋。
- 寫 `Archive/`。

## 3. 核心設計決策

### 3.1 內連用 slug（比照 noteSlug）
**決定**：digest item 經查詢補 `articles.slug` → `DigestItem.articleSlug`；`SectionItem` 標題包 `<Link href={"/articles/"+articleSlug}>`。
**為何**：DB FK 已有，與 005 既有 `noteSlug → /notes/[slug]` 同模式，最小變更。
**影響**：`DIGEST_SELECT` 多 select 一欄；`shapeItem`/`getSearchIndex` 多帶一欄。

### 3.2 文章頁 `/articles/[slug]`（比照 `/notes/[slug]`）
Server + ISR（`revalidate=3600`）；`generateStaticParams` 用 `getArticleSlugs()`（214 篇）；slug 含中文 → `decodeURIComponent(slug)`（同 notes 頁既有處理）；沿用既有 class（`reader/rhead/eb/rm`）；內文用 `<MarkdownView>`。

### 3.3 Mermaid = 瀏覽器端 render（方案 A）
**決定**：共用 client 元件 `MarkdownView.tsx`，於 `react-markdown` 的 `code` renderer 攔 `language-mermaid`，用 `dynamic import('mermaid')` + `mermaid.render`。
**為何**：全 61 篇筆記都含 ` ```mermaid `；瀏覽器端 render 讓**主題切換免費跟著變**（靜態圖做不到），且不需動 ingest/Storage。`dynamic import` 確保 mermaid 只在含圖頁載入，不進首頁/日報頁 bundle。
**影響**：`web/package.json` 加 `mermaid` 依賴（Lead 寫定）。主題：依 `document.documentElement.dataset.theme` 設 `mermaid.initialize({ theme })`（亮 `default` / 暗 `dark`），監聽主題切換重繪。

### 3.4 三向回連
`getArticle()` 反查 `daily_report_items(daily_reports(report_date))` 組 `reportDates`；文章頁連回日報 + `📓 學習筆記`；筆記頁「返回」改連 `sourceArticleSlug`。

### 3.5 標籤瀏覽
`getTagArticles(tag)` 用 `.contains("tags",[tag])`（`articles_tags_gin` 已有）；文章頁 tag/category 顯示為可點 chip → `/tags/[tag]`。

## 4. 詳細規格（查詢層簽名）

| 函式 | 簽名 | 說明 |
|---|---|---|
| `getArticle` | `(slug: string) => Promise<Article \| null>` | 查 `articles` + `learning_notes(slug)` + 反查 reportDates |
| `getArticleSlugs` | `() => Promise<string[]>` | 全文章 slug，供 `generateStaticParams` |
| `getTagArticles` | `(tag: string) => Promise<Article[]>` | `tags @> [tag]`，按 `article_date` 新→舊 |

`<MarkdownView>` props：`{ content: string }`（client component）。

## 6. DTO 欄位設計總表

### Article（新增）
| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| slug | string | Y | articles.slug（路由參數） |
| title | string | Y | articles.title |
| articleDate | string | Y | article_date YYYY-MM-DD |
| source | string | Y | articles.source |
| url | string | Y | 原文外連（可空字串） |
| category | CatKey | Y | category 中→英 |
| industry | string \| null | Y | 空字串正規化為 null |
| summaryMd | string | Y | articles.summary_md |
| contentMd | string | Y | articles.content_md |
| tags | string[] | Y | articles.tags |
| noteSlug | string \| null | Y | 對應學習筆記 slug |
| reportDates | string[] | Y | 出現過的日報 report_date |

### DigestItem / SearchRow（加欄位）
| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| articleSlug | string | Y | articles.slug（內連 /articles/[slug]） |

## 8. Acceptance Criteria（可測）

1. **契約 parse**：`fixtures/article-colorado.json` 被 `viewmodel.ts` 的 `Article` 接受、`fixtures/digest-with-articleslug.json` 被 `Digest` 接受（`tsc` 無錯）；005 既有 fixtures 仍過。
2. **articleSlug 補齊**：`getDigest('2026-06-05')` 每則 `articleSlug` 非空且等於 SQL 對應 article slug（八則對照 `digest-with-articleslug.json`）。
3. **getArticle**：`getArticle('2026-05-24-科羅拉多州改寫AI法律全球監管新趨勢')` → `title`/`source`/`category(market)`/`industry(null)`/`tags`/`reportDates(["2026-05-24"])`/`noteSlug(null)` 與 `article-colorado.json` 嚴格相等；`summaryMd`/`contentMd` 採 `startsWith`（依 `specs/CLAUDE.md` 規則 4）。
4. **文章頁**：`/articles/[slug]` `generateStaticParams` 產 214 筆；抽一篇 build 後 render 出 frontmatter 標題與內容。
5. **標題內連**：日報頁標題為 `<a href="/articles/…">`，點擊進對應文章。
6. **搜尋直達**：⌘K / 分類頁結果連 `/articles/[articleSlug]`（`SearchRow.articleSlug` 非空）。
7. **Mermaid**：含 ` ```mermaid ` 的內容在筆記/文章頁 render 出 `<svg>`（非純 `<code>`）；切主題後重繪；callout 不顯示字面 `[!info]`。
8. **回連**：notes 頁「返回」`href=/articles/[sourceArticleSlug]`（有 source 時）；文章頁含日報與筆記連結。
9. **標籤頁**：`/tags/[tag]` 列出 `tags @> [tag]` 的文章，數量 = SQL count。
10. **build**：`cd web && npm run build` 成功（含 `/articles/[slug]`、`/tags/[tag]` 的 `generateStaticParams`）。
11. **安全**：`web/` 內無 `SUPABASE_SERVICE_ROLE_KEY`；只用 anon key。

## 9. 與其他 spec 的介面

| 對象 spec | 本 spec 暴露 / 消費 | 對方怎麼用 |
|---|---|---|
| Spec 001 | 消費 `articles`（含 `slug`/`tags`/`content_md`）、`daily_report_items` FK、`learning_notes`；唯讀 | 既有 public-read RLS |
| Spec 005 | **延伸**其 `contracts/viewmodel.ts`（加 `articleSlug`、`Article`）；沿用 `categories.ts`、`shape.ts`、頁面殼與 class | 加法式，不破壞既有型別 |

## 10. Out of scope（再次強調）
- 不改 DB schema / ingest / migration。
- **Mermaid 預渲染 / Supabase Storage 不做，採瀏覽器端 render（第 2 次重複提醒）**。
- 不寫 `Archive/`、不碰部署、不做 DB 中文 FTS。

## 11. 參考
- 重建計畫：`specs/plan.md`、`specs/agent-teams-plan.md`「Phase 7」
- 上游 spec：[`005-web-ui/spec.md`](../005-web-ui/spec.md)
- SDD 規範：[`specs/CLAUDE.md`](../CLAUDE.md)

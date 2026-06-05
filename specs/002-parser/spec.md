# Spec 002 — Markdown Parser

> 對應重建計畫「Phase 2」。
> 上游：Spec 001（消費 `records.schema.ts` 的型別與 `CategorySchema` / `SECTION_HEADER_TO_CATEGORY`）
> 下游：Spec 003（產出的 `IngestBundle` 由 upsert 消費）

---

## 1. Context

舊系統把 `content/*.md` 直接餵 Quartz 產靜態站，內容鎖在 Markdown 與 Obsidian wikilink，無法被查詢或介面取用。本 spec 提供**純函式 parser**：把 `content/` 內三類 Markdown（日報 / 文章 / 學習筆記）轉成 Spec 001 契約定義的 records，並把 Obsidian `[[wikilink]]` 關係抽成可入 DB 的外鍵字串。parser **不碰網路、不碰 DB**，只做 bytes → records。

---

## 2. Scope

### In scope
- 解析三類檔案的 frontmatter（`gray-matter`）與 body。
- 抽 wikilink slug、日報章節 → category、日報每則的 article slug 與 blurb。
- 組成 `IngestBundle`（articles / learningNotes / dailyReports / warnings）。
- 偵測未解析的 wikilink（item.articleSlug 或 note.sourceArticleSlug 找不到對應 article slug）→ 記 `warnings`，**不中斷**。

### Out of scope
- 寫入 Supabase（**第 1 次重複提醒**：parser 不碰 DB，屬 Spec 003）。
- 網路抓取、產生新內容。
- `content/Learning Notes/INDEX.md`、`content/Learning Notes/Interactive/**`、`content/index.md`、`*.html`、`*.zip`、`*.base`——這些是導覽/衍生/工具檔，**不解析**。

---

## 3. 核心設計決策

### 3.1 純函式、可測試
**決定**：對外暴露 `parseArticle(path, raw)`、`parseLearningNote(path, raw)`、`parseDailyReport(path, raw)`、`buildBundle(dir)`。
**為何**：純函式 → golden fixture 可鎖死、冪等天然成立。
**影響**：相同檔案 bytes → 完全相同 records（含 list 順序）。

### 3.2 日期正規化
**決定**：frontmatter `date` / `created` 經 YAML 可能被解析成 JS `Date`；一律轉回 `YYYY-MM-DD` 字串（取 UTC 年月日）。
**為何**：契約 `DateStr` 要求 `^\d{4}-\d{2}-\d{2}$`，且避免時區位移。

### 3.3 slug = 檔名去副檔名
**決定**：`slug = basename(path).replace(/\.md$/, "")`，**保留中文與空格**（與 wikilink 目標一致）。
**為何**：日報 wikilink 目標就是檔名（不含路徑與 `.md`），FK 解析靠字串完全相符。

### 3.4 wikilink 抽取
**決定**：regex `/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]*)?\]\]/`，取 group1 trim 為 slug（忽略 `#heading` 與 `|display`）。
**影響**：`[[slug]]`、`[[slug|顯示]]`、`[[slug#段|顯示]]` 都解出 `slug`。

---

## 4. 詳細解析規則（parser-eng 必須照此實作）

通用：`rawMd` = 原始檔案全文；`body` = `gray-matter` 的 `.content`（frontmatter 之後），`trim()`。footer 簽名行（`*由 Claude 自動整理…*` / `*本日報由 Claude…*`）與其緊鄰的 `---` 從 `contentMd` 移除。

### 4.1 Article（`content/Articles/*.md`）
| 欄位 | 來源 |
|---|---|
| slug | 檔名去 `.md` |
| title | `fm.title` |
| articleDate | `fm.date` → YYYY-MM-DD |
| source / url / industry | `fm.source` / `fm.url` / `fm.industry`，缺省 `""` |
| category | `fm.category`（**必須** ∈ 5 值，否則該檔記 warning 並跳過） |
| tags | `fm.tags` 陣列，缺省 `[]` |
| createdDate | `fm.created` → YYYY-MM-DD 或 `null` |
| summaryMd | `## 📝 重點摘要` 標題到下一個 `## ` 之間的內文，trim |
| contentMd | `body` 去 footer，trim |

### 4.2 Learning Note（`content/Learning Notes/*學習*.md`，排除 INDEX/Interactive）
| 欄位 | 來源 |
|---|---|
| slug / title / noteDate / topic / difficulty / tags / createdDate | 同理對應 frontmatter（`note_date`←`date`） |
| sourceArticleSlug | 從 `fm.source_article`（形如 `"[[slug]]"`）抽 slug；無則 `null` |
| contentMd | `body` 去 footer，trim |

僅解析 `type: learning-note`（或檔名含「學習-」）者；`INDEX.md`（`type: index`）排除。

### 4.3 Daily Report（`content/AI日報-*.md`）
| 欄位 | 來源 |
|---|---|
| slug / reportDate(`date`) / title / tags / createdDate | frontmatter |
| summaryMd | `> [!summary] 今日重點` 之後連續 `>` 行，去 `> ` 前綴，join `\n`，trim |
| items | 見下 |

items 規則：
1. 逐 `## <header>` 區段；`header`（emoji+名稱）∈ `SECTION_HEADER_TO_CATEGORY` 才視為內容章節，得 `section`。其餘（`📌 今日觀察`、`📚 歷史日報`）跳過。
2. 區段內每個 `### [[target|disp]]` 為一則 item：`articleSlug = target`、`position` = 該章節內 0 起算序號、`section` = 該章節 category。
3. `blurbMd` = 該則下方 `- **重點**：` 後的文字（取該行，raw markdown），trim；無則 `""`。

### 4.4 buildBundle(dir)
掃 `content/`：日報、`Articles/`、`Learning Notes/`（排除 INDEX/Interactive）。組 `IngestBundle`。對每個 `item.articleSlug` 與 `note.sourceArticleSlug`，若不在 articles slug 集合 → push warning `"unresolved wikilink: <slug> (from <source>)"`。

---

## 5. Golden 比對規則（Spec 002 測試用）

`contracts/fixtures/` 內每個 case 有 `<case>.input.md` 與 `<case>.expected.json`。比對：
- **prose 欄位** = `{ summaryMd, contentMd, blurbMd }`：`actual.startsWith(expected)`（expected 為前綴；可為空字串時跳過）。
- **`rawMd`**：不納入 golden 比對（= 檔案 bytes，trivially 正確）。
- **其餘欄位**（含 `items` 的 `section/position/articleSlug/reportSlug`、`tags`、各 slug/date/title/category）：深度嚴格相等。

## 8. Acceptance Criteria
1. **Article golden**：`parseArticle` 對 `article.input.md` 之輸出，依 §5 規則與 `article.expected.json` 相符。
2. **Note golden**：`parseLearningNote` 對 `learning-note.input.md` 相符；`sourceArticleSlug == "2026-05-15-SubQ Subquadratic LLM 架構突破"`。
3. **Daily golden**：`parseDailyReport` 對 `daily-report.input.md` 相符；`items.length == 8`、章節/順序/articleSlug 全對；跳過 `📌 今日觀察`/`📚 歷史日報`。
4. **Enum 防呆**：`category` 非 5 值時該檔跳過並記 warning，不丟例外。
5. **冪等**：同檔連解兩次，輸出 deep-equal。
6. **Schema 鎖死**：所有輸出 records 通過對應 Zod `.parse()`。
7. **未解析 wikilink**：`buildBundle` 對找不到的 slug 記 warning 不中斷。

## 9. 與其他 spec 的介面
| 對象 spec | 介面 |
|---|---|
| **Spec 001** | 消費 `ArticleRecord/LearningNoteRecord/DailyReportRecord/DailyReportItem` 型別、`CategorySchema`、`SECTION_HEADER_TO_CATEGORY` |
| **Spec 003** | 產出 `IngestBundle`（backfill）與單檔 parse 結果（`ingest:day`）供 upsert 寫入 |

## 10. Out of scope（再次強調）
- 不寫 DB（**第 2 次重複提醒**）、不抓網路、不解析 INDEX/Interactive/html/zip。

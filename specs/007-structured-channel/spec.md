# Spec 007 — 結構化資料通道＋品質閘門＋執行紀錄

## 1. 目標

Claude routine 每日輸出**一份 Zod 驗證的 JSON bundle**（`daily-bundle.json`），由新的
`ingest:json` 子命令驗證 → 品質閘門 → 只 upsert 當日資料；每次執行寫入
`ingestion_runs`。Markdown 從資料通道降級為**由 DB 記錄渲染**的輸出格式
（`raw_md` 保真＋選配匯出），方向永遠是 **record → markdown，不再 markdown → record**。

背景：routine 已不 `git push`，`content/` 凍結在 2026-06-07；每日內容唯一持久副本是
DB。舊的「寫 .md → 檔名慣例解析 → 全量 backfill」通道脆弱且 O(n) 成長，且 DB 領先
種子後重跑 backfill 會用舊 Markdown 蓋掉新資料。

## 2. 範圍邊界

- **不改**凍結契約 `specs/001-db-schema/contracts/records.schema.ts` —— 本 spec 的
  契約以 **import 組合** 擴充之。
- 不新增資料來源（Spec 008）、不做告警 UI（Spec 009）、不做 embeddings（Spec 010）。
- `ingestion_runs` 表在本 spec 建立（`ingest:json` 是第一個寫入者）；`channel` enum 預留
  008/009/010 的值。
- `articles.origin.rawItemId` 欄位語意在 008 才啟用，本 spec 僅存欄位。

## 3. 契約（`contracts/daily-bundle.schema.ts`）

- `OriginSchema = { channel: 'raw-item'|'websearch'|'manual', rawItemId: uuid|null, fetchMethod: string }`
- `BundleArticleSchema = ArticleRecordSchema.extend({ url: 必填合法 URL, origin, observationsMd })`
  —— JSON 通道把 001 的 `url: default("")` 升級為必填；legacy markdown 記錄維持寬鬆。
  `observationsMd`（💡 觀察與啟發）僅進 `raw_md` 渲染，DB 無獨立欄位。
- `BundleDailyReportSchema = DailyReportRecordSchema.extend({ observationsMd })`（📌 今日觀察）。
- `DailyBundleSchema = { runDate, articles: min(1), learningNotes, dailyReport, meta: { generator, promptVersion, generatedAt } }`

## 4. Schema（`supabase/migrations/0002_ingestion_runs.sql`）

- 新表 `public.ingestion_runs`：`run_date date`、`channel`（`json | markdown-backfill |
  edge-fetch | embed | healthcheck`）、`trigger_src`、`phase`（`started → validated → gated →
  written → completed | failed`）、`counts jsonb`、`gate_results jsonb`、`warnings jsonb`、
  `error text`、`started_at / finished_at`。RLS public-read（供 009 status page；warnings
  寫入前不得含金鑰/PII）。
- `articles` 加欄（additive）：`origin jsonb not null default '{}'`、
  `url_normalized text not null default ''` + btree index。**先不設 unique**：舊資料可能有
  重複/空 URL；去重先做成閘門，語料清理後另出 migration 升級為 unique index。

## 5. 品質閘門（`ingest/gates/`）

閘門為純函式（DB 查詢經注入的 lookup），依序執行，輸出
`{ gate, status: pass|warn|fail, detail }[]`。任一 `fail` → CLI exit 3、不寫入
（run 記為 `phase='failed'`）。

| # | Gate | 級別 | 規則 |
|---|------|------|------|
| 1 | `url-format` | fail | 每篇 `url` 必須是 http(s)。（可達性**不**檢查——媒體常 403 資料中心請求，403 樣板文字由 #3 擋） |
| 2 | `url-dedup` | warn(drop) / fail | 正規化 URL（見 §6）比對：(a) bundle 內互重 → 保留第一篇、drop 其餘；(b) 與 DB 既有文章重複（slug 不同）→ drop。被 drop 的文章連同其日報 items 一併移除，記入 warn。**不比對標題相似度**。 |
| 3 | `content-quality` | fail | 每篇 `contentMd` ≥ 200 字元、`summaryMd` ≥ 20 字元；禁用樣板字串（`全文抓取失敗`、`Access Denied`、`Just a moment`、`Enable JavaScript`、`Attention Required`、`Checking your browser`、`verify you are human`、`are you a robot`，不分大小寫）。 |
| 4 | `article-count` | fail | drop 後 8–15 篇。 |
| 5 | `report-date` | fail | `dailyReport.reportDate === runDate`，且 `dailyReport.slug === AI日報-{runDate}`。 |
| 6 | `section-coverage` | warn | 五章節各 ≥1 則；技術理論、企業應用導入各 ≥2 則。 |
| 7 | `note-coverage` | fail | 每篇「技術理論」文章都有一份 learningNote 其 `sourceArticleSlug` 指向它。 |
| 8 | `item-integrity` | fail / warn | 每個 report item 的 `articleSlug` 必須在（drop 後的）bundle articles 內（fail）；每篇 article 至少被一個 item 引用（warn）。 |

## 6. URL 正規化（`ingest/gates/url.ts`）

跨 spec 共用規則（008 的 Edge Function 需實作同一套；規則以本節為準）：

1. 小寫 protocol 與 host；移除預設 port（`:80`/`:443`）。
2. 移除 hash fragment。
3. 移除追蹤參數：`utm_*` 前綴、`fbclid`、`gclid`、`igshid`、`mc_cid`、`mc_eid`、
   `ref`、`ref_src`、`cmpid`、`s_kwcid`、`sr_share`。
4. 其餘 query 參數按 key 排序保留。
5. 移除路徑尾斜線（根路徑 `/` 除外）。
6. 無法解析的 URL 原樣返回（由 `url-format` gate 攔）。

## 7. CLI（`ingest/cli/index.ts`）

- 新子命令：`json <bundle.json> [--dry-run]`
  流程：讀檔 → `DailyBundleSchema.safeParse`（失敗印 Zod issues、exit 3）→ 開 run
  （dry-run 不寫 run）→ 渲染缺漏的 `rawMd`（§8）→ 閘門 → 印
  `GATE_REPORT_JSON: {...}`（機器可讀，routine 據此修正重試）→ fail 則 run 記
  failed、exit 3 → dry-run 到此為止（印 would-write 摘要、exit 0）→
  `ingestBundle`（day-scoped，只含當日記錄）→ run 記 completed → exit 0（有
  warnings 則 1）。
- `backfill` 改為**種子復原工具**：無 `--force-seed` 旗標即 exit 2 並印警告；帶旗標
  仍在開頭印「會用凍結種子（≤2026-06-07）覆蓋較新 DB 資料」的警示 banner。
  `npm run ingest:backfill` script 內建 `--force-seed`（保留 v1 prompt 回滾路徑）。
- Exit codes：`0` 成功、`1` 完成但有 warnings、`2` 用法錯誤、`3` 驗證/閘門失敗。

## 8. Markdown 渲染器（`ingest/render/markdown.ts`）

範本 A/B/C 的格式邏輯從 routine prompt 移入程式碼：

- `renderArticleMd(article, { noteSlug? })` → 範本 A 全文（frontmatter、info callout、
  📝/📖/💡/🔗 章節、技術理論補 📓 wikilink、頁尾簽名）。
- `renderLearningNoteMd(note)` → 範本 B（frontmatter + `# title` + `contentMd` body +
  簽名）；note 的 body 章節結構仍由 routine 產出（存於 `contentMd`）。
- `renderDailyReportMd(report, articles, notes, meta)` → 範本 C（依 CATEGORIES 順序
  分節、`### [[slug|title]]`、來源/連結/產業/重點列、技術理論補學習筆記列、
  📌 今日觀察、📚 歷史日報、含時間戳的頁尾簽名）。
- bundle 記錄的 `rawMd` 非空則保留、為空則由渲染器填入（idempotent）。

## 9. Taxonomy 單源化

`001` 契約的 `CATEGORIES` 為唯一事實。新增 `tests/taxonomy.test.ts` 靜態比對：
(a) `supabase/migrations/0001_init.sql` 的 `category_enum` 值；
(b) `web/lib/categories.ts` 的 label/對照表。任何一處漂移 → CI 失敗。
（web 端維持自有檔案不跨包 import——web 有獨立 lockfile/build；以測試鎖一致性。）

## 10. Routine prompt

- 舊 prompt 完整保留為 `每日AI新聞日報排程-雲端版-v1.md`（回滾用，直至 008 穩定）。
- 新版 `每日AI新聞日報排程-雲端版.md`：範本 A/C 的 Markdown 產出改為組裝
  `daily-bundle.json`（逐篇寫入、增量更新檔案，抗 context 壓縮）；範本 B 的 body
  結構保留（進 `learningNotes[].contentMd`）；步驟 7 改
  `npm run ingest:json -- daily-bundle.json`，gate fail 依 `GATE_REPORT_JSON` 修正
  重試（上限 3 次）；成功標準改以 `ingestion_runs.phase='completed'` 佐證。

## 11. Acceptance Criteria

- AC1 `DailyBundleSchema` 拒絕：缺 url、非法 url、articles 為空。（unit test）
- AC2 `normalizeUrl` 通過 golden 案例（大小寫 host、utm、hash、尾斜線、排序、非法 URL 原樣）。（unit test）
- AC3 八個閘門各有至少一個 fail/warn 觸發測試；`url-dedup` drop 會同步移除對應日報 items。（unit test）
- AC4 `ingest json` dry-run 不產生任何 DB 寫入呼叫（fake client 驗證 upsert/insert/delete/update 均未發生）。（unit test）
- AC5 `ingest json` 成功路徑：run 記錄 insert → phase 依序推進 → completed；gate fail 路徑 run 記 failed 且無內容寫入。（unit test, fake client）
- AC6 `backfill` 無 `--force-seed` → exit 2、不建 DB client 連線。（unit test）
- AC7 渲染器輸出通過「格式自檢」關鍵斷言：frontmatter 欄位齊全、emoji 章節順序、頁尾簽名、技術理論文章含 📓 wikilink。（unit test）
- AC8 taxonomy 測試能偵測三處任一漂移。（unit test：以字串比對現檔）
- AC9 `articles` 新欄 migration 可在既有資料上執行（additive、default 安全）。（apply 於 Supabase 後以 SQL 驗證）

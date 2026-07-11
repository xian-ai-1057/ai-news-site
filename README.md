# AI 日報 — Supabase DB-first 內容管線

這是什麼：**AI 日報**是一個繁體中文 AI 新聞知識庫。內容存於 **Supabase Postgres**
（唯一事實），由 Claude Code Routine（雲端排程）每日策展入庫，前端為
`web/` 的 Next.js 16 閱讀 App（Vercel 部署）。原 Quartz 靜態站已除役。

## 架構（v2 — 結構化通道，Specs 007–010）

```
外部來源（arXiv API / RSS/Atom）
   └─ fetch-sources Edge Function（Supabase Cron 每 4h）
        └─ raw_items 候選池（url_hash 跨日去重）
             └─ Claude Code Routine（雲端排程：讀候選池 → WebSearch 補缺 → 策展/摘要/翻譯）
                  └─ daily-bundle.json（Zod 契約驗證）
                       └─ ingest:json（品質閘門 → 當日 upsert → ingestion_runs）
                            ├─ Supabase（articles / learning_notes / daily_reports / items）
                            ├─ embed-articles Edge Function（pgvector 語意向量）
                            └─ Vercel Deploy Hook → Next.js 網站（ISR + 搜尋 + /status）
```

- **確定性程式**（抓取、去重、儲存、向量化、健檢）跑在 Supabase/Vercel；
  **AI 環節只有一個**：Claude routine 負責選材、摘要、翻譯。
- 排程：**Claude Code Routine**（[claude.ai/code/routines](https://claude.ai/code/routines)，訂閱制、雲端、不需開機）。
  Routine 設定：repo `xian-ai-1057/ai-news-site`、Environment 變數
  `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`VERCEL_DEPLOY_HOOK_URL`/`INGEST_TRIGGER_SRC=routine`、
  **Setup script 留空**（相依套件由 `.claude/settings.json` 的 SessionStart hook 在 clone 後 `npm ci`；
  Setup script 在 clone 前執行，放 `npm ci` 會失敗）、
  **Network access = Custom，放行 `ifbpfuvlevjegwdnhyqh.supabase.co` ＋ `api.vercel.com`**（前者讀寫 Supabase、後者觸發 deploy hook；全文抽取已搬伺服端，routine 不碰新聞網站；WebSearch 走 Anthropic 自動放行）、Schedule 觸發（台北時間，早於健檢 14:00）。
  Instructions 指向本 repo 的 `每日AI新聞日報排程-雲端版.md`。舊 Markdown 流程備份於
  `每日AI新聞日報排程-雲端版-v1.md`。

### 三層內容 + 管線表

```
daily_reports → daily_report_items → articles ← learning_notes
sources → raw_items（候選池）      ingestion_runs（執行紀錄）
```

## 目錄結構

```
ingest/
  parser/   — Markdown 解析（僅供種子復原）
  gates/    — 品質閘門（URL 格式/去重、內容品質、篇數、筆記覆蓋…）
  render/   — record → Markdown 渲染器（raw_md；方向 DB→MD）
  db/       — records → Supabase upsert、ingestion_runs 紀錄
  cli/      — json / candidates / backfill / day 子命令
supabase/
  migrations/ — DB schema DDL（0001–0005，進版控）
  functions/  — Edge Functions（fetch-sources / daily-healthcheck / embed-articles）
specs/        — 規格與凍結契約（001–010）
web/          — Next.js 16 閱讀 App（獨立子專案，Vercel Root Directory = web）
content/      — 凍結歷史種子（2026-05-13 → 2026-06-07），僅供災難復原；禁止寫入
```

## 環境設定與常用指令

1. 環境變數：`cp .env.example .env`，填入 `SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`。
2. `npm install` → `npm run typecheck` → `npm test`。

### 日常入庫（routine 使用）

```bash
npm run candidates -- --hours 36        # 讀候選池（Spec 008）
npm run ingest:json -- daily-bundle.json [--dry-run]   # 驗證+閘門+當日 upsert（Spec 007）
```

- exit code：`0` 成功 / `1` 有 warnings / `2` 用法錯誤 / `3` 驗證或閘門失敗。
- 閘門結果印於 `GATE_REPORT_JSON:`（機器可讀）；每次執行記錄於 `ingestion_runs`。

### 種子復原（僅災難復原用）

```bash
npm run ingest:backfill        # = ingest backfill --force-seed
```

> ⚠️ `content/` 種子凍結於 2026-06-07。DB 已領先種子——整批 upsert 會以舊
> Markdown **覆蓋較新的 DB 資料**，僅在災難復原時使用。無 `--force-seed`
> 旗標的裸 `backfill` 會直接 exit 2。
> `ingest:day` 傳目錄採遞迴掃描；批次無文章時會跳過 join 表的
> delete-then-insert（防清空防呆）。

### Edge Functions（網路服務端）

| Function | 觸發 | 用途 |
|---|---|---|
| `fetch-sources` | Supabase Cron 每 4h | 抓 arXiv/RSS 進 `raw_items` 候選池 |
| `extract-fulltext` | routine 呼叫（on-demand） | 伺服端抽全文（Readability，優先用 feed 全文）；讓 routine 不必自己抓新聞 |
| `daily-healthcheck` | Cron（台北 11:00 / 14:00） | 檢查日報/來源，失敗 POST Slack |
| `embed-articles` | Cron 每小時＋ingest 後觸發 | OpenAI embeddings → pgvector |

部署：push `v4` 觸碰 `supabase/functions/**` → GitHub Actions 自動
`supabase functions deploy`（需 `SUPABASE_ACCESS_TOKEN` secret）。
Cron 排程 SQL 見各 spec（008 §8、009 §5、010 §6）。

### Secrets 總表

| Secret | 位置 | 用途 |
|---|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Routine environment 變數 / 本機 .env | ingest 寫入 |
| `VERCEL_DEPLOY_HOOK_URL` | Routine environment 變數 | 入庫後觸發前端重建 |
| `SUPABASE_ACCESS_TOKEN` | GitHub Actions secret | 自動部署 Edge Functions |
| `SLACK_WEBHOOK_URL` | Edge Function secret | 健檢告警 |
| `OPENAI_API_KEY` | Edge Function secret＋Vercel server env | embeddings / 語意搜尋 |

## 待辦事項

- **建立 Claude Code Routine**（[claude.ai/code/routines](https://claude.ai/code/routines)）：設 env 變數＋**Setup script 留空**＋Network=Custom（放行 Supabase ＋ api.vercel.com）＋daily 排程；先 Run now 試跑驗證，穩定後停用舊 Cowork 排程
- Edge Function secrets：`SLACK_WEBHOOK_URL`（健檢告警）、`OPENAI_API_KEY`（embeddings＋語意搜尋；Vercel 也需一份 server env）
- GitHub secret `SUPABASE_ACCESS_TOKEN`（deploy-functions workflow 自動部署 Edge Functions）
- seed sources 觀察 3-4 天 → 確認候選池健康後再把 routine prompt 切為兩層選材主通道
- 舊文 embedding backfill（重複 invoke `embed-articles` 至補完）
- `articles.url_normalized` 清理舊資料後升級 unique index
- ~~把新聞全文抽取搬進 Edge Function，讓 routine network 降為 Custom~~ ✅ 完成（Spec 011：extract-fulltext）
- **Cloudflare `ai-news` Workers 專案**：需手動在 Cloudflare Dashboard 停用（repo 外操作）

## 技術棧

- Node ≥ 22、TypeScript、Zod、`@supabase/supabase-js`、`gray-matter`、`fast-xml-parser`、`tsx`
- Supabase（Postgres + PostgREST + Edge Functions + pg_cron；pgvector、pgroonga）
- Next.js 16 + React 19 + Tailwind v4（`web/`，Vercel）
- GitHub Actions（CI：typecheck + 測試；CD：Edge Functions）

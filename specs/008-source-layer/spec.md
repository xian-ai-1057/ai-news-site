# Spec 008 — 來源層：確定性抓取＋候選池

## 1. 目標

Supabase Edge Function（`fetch-sources`，Supabase Cron 每 4 小時觸發）抓取
arXiv API 與 RSS/Atom feeds 進 `raw_items` 候選池（URL-hash 去重）；Claude routine
**先從候選池策展**，WebSearch 只補缺口。來源與關鍵字設定從 prompt 移入
`sources` 表（config-as-data）。

分工原則：抓取層只做**確定性**工作（fetch、parse、normalize、dedup、存放）；
選材、摘要、翻譯仍由 routine（唯一 AI 環節）負責。無自動發佈。

## 2. 範圍邊界

- 抓取層存 feed metadata＋best-effort 內文（RSS content:encoded / summary），
  不做完整全文抽取（routine 抓全文照舊用 defuddle/WebFetch）。
- `raw_items` **RLS 開、無 public read policy**：原始擷取文字僅服務端可讀
  （著作權考量）；009 的 status page 經 sanitized view 讀新鮮度。
- 市場情況章節維持 WebSearch 為主（無高品質 feed）。
- 來源層故障**永不阻斷 routine**（prompt 內建 fallback 條款）。

## 3. Schema（`supabase/migrations/0003_sources_raw_items.sql`）

- `sources`：`name unique`、`kind ∈ rss|atom|arxiv-api|json-feed`、`feed_url`、
  `default_category category_enum null`（僅提示；最終分類由 routine 決定）、
  `language`、`active`、`fetch_interval_minutes`（預設 240）、`last_fetched_at`、
  `last_status`、`config jsonb`（arXiv query、include/exclude 關鍵字——自 prompt 遷出）。
- `raw_items`：`source_id FK on delete set null`、`url`、
  **`url_hash text unique`**（= sha256(normalizeUrl(url))，跨日去重核心）、`title`、
  `summary`、`content_text`、`published_at`、`fetched_at`、`category_hint`、`lang`、
  `status ∈ new|curated|rejected|stale`、`curated_article_id FK articles on delete set null`、
  `payload jsonb`。
- Seed：arXiv cs.AI / cs.CL、HF Papers、OpenAI/DeepMind blog、TechCrunch AI、
  The Verge AI、VentureBeat AI、MIT Tech Review、iThome、科技新報、INSIDE、數位時代
  （約 13 個）。feed URL 失效屬預期情境：`last_status` 記錄錯誤、009 告警，
  修 URL 只需 UPDATE sources，不需部署。

## 4. URL 正規化單一實作

實作移至 `supabase/functions/_shared/normalize-url.ts`（純 TS、零依賴）；
`ingest/gates/url.ts` **re-export** 之。Edge Function（Deno）與 ingest CLI（Node）
共用同一份程式碼——規則同 Spec 007 §6，parity by construction。

## 5. Edge Function（`supabase/functions/fetch-sources/index.ts`）

1. service-role client（edge runtime 自動注入 `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`）。
2. 撈到期的 active sources（`last_fetched_at + fetch_interval_minutes < now()` 或 null）。
3. 逐source：fetch feed → `_shared/feed.ts` 解析（RSS 2.0 / Atom / arXiv Atom，
   fast-xml-parser，經 `supabase/functions/deno.json` import map 對映 npm 套件；
   同一套 parser 於 Node 測試直接 import）→ 每個 entry 正規化 URL、算 `url_hash`
   → `insert … onConflict url_hash ignoreDuplicates` → 更新 `sources.last_fetched_at`
   /`last_status`。**單一來源失敗不阻塞其他來源**（per-source try/catch，
   `last_status` 記錄錯誤訊息）。
4. 寫一列 `ingestion_runs`（`channel='edge-fetch'`，counts = {sources, fetched, inserted, errors}）。

排程：pg_cron + pg_net 每 4 小時（設定 SQL 見 §8，屬一次性手動步驟——
需 Vault 存 function URL 與金鑰後執行）。

## 6. CLI（`ingest/cli/index.ts`）

- 新子命令 `candidates [--hours 36]`：撈 `raw_items` 中 `status='new'` 且
  `fetched_at > now()-hours` 的候選，依 `category_hint` 分組、新→舊排序，印出
  `CANDIDATES_JSON: {...}`（含 id/url/title/summary 截斷 500 字/published_at/source
  名稱）。routine Read 此輸出選材。
- `ingest:json` 成功入庫後：對 `origin.channel='raw-item'` 且帶 `rawItemId` 的文章，
  回寫 `raw_items.status='curated'`、`curated_article_id`（查 slug→id）。
  回寫失敗降級為 warning，不影響 ingest 成敗。

## 7. 部署（`.github/workflows/deploy-functions.yml`）

Push 到 `v4` 且觸碰 `supabase/functions/**` → `supabase functions deploy`
（`SUPABASE_ACCESS_TOKEN` GitHub secret、`--project-ref ifbpfuvlevjegwdnhyqh`）。
滿足「一切跑網路服務、不依賴本機」。

## 8. Cron 一次性設定（手動 SQL，migration 不含）

```sql
-- 先在 Dashboard 啟用 pg_cron、pg_net extensions，並在 Vault 存 anon key
select cron.schedule(
  'fetch-sources-every-4h', '0 */4 * * *',
  $$ select net.http_post(
       url := 'https://ifbpfuvlevjegwdnhyqh.supabase.co/functions/v1/fetch-sources',
       headers := jsonb_build_object(
         'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
         'Content-Type', 'application/json'),
       body := '{}'::jsonb) $$);
```

## 9. Routine prompt 改動

步驟 2 改兩層：(a) `npm run candidates` 讀候選池、按章節選材（帶
`origin={channel:'raw-item', rawItemId}`）；(b) 池覆蓋不足的章節才 WebSearch
（市場情況永遠是）。**Fallback**：`candidates` 為空或錯誤 → 全 WebSearch 流程
照 v2 既有步驟，來源層故障不擋日報。

## 10. 遷移順序（routine 不中斷）

1. Migration 0003 → 部署 fetch-sources → 設 cron → **先跑 3-4 天**觀察
   `raw_items` 量/去重/`last_status`。
2. 確認池健康後才把 prompt 換成兩層選材版。
3. 回滾 = `update sources set active=false` 或 prompt 移除層 (a)。

## 11. Acceptance Criteria

- AC1 `_shared/feed.ts` 能解析 RSS 2.0、Atom、arXiv Atom 三種 fixture（title/link/
  published/summary 正確；CDATA、多 link rel 處理）。（unit test）
- AC2 `ingest/gates/url.ts` 與 `_shared/normalize-url.ts` 為同一實作（re-export；
  golden 案例沿用 007 AC2 測試）。（unit test）
- AC3 `candidates` 輸出分組/排序/截斷正確。（unit test：pure format 函式）
- AC4 `ingest:json` 對 raw-item 出處文章回寫 curated 狀態；回寫失敗僅 warning。
  （unit test, fake client）
- AC5 migration 0003 可套用；seed sources 插入 idempotent（on conflict do nothing）。
- AC6 fetch-sources 部署後：手動 invoke 一次，`raw_items` 有新列、重複 invoke 不增列
  （url_hash dedup）、`ingestion_runs` 有 edge-fetch 列。（部署後手動驗證）

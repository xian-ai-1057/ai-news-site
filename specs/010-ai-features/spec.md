# Spec 010 — AI 功能：語意搜尋＋相關文章＋中文全文搜尋

## 1. 目標

用上累積中的語料：`articles.embedding`（pgvector）支援語意搜尋與「相關文章」
推薦；pgroonga 支援中文關鍵字全文搜尋。全部跑在 Supabase/Vercel（網路服務）。

## 2. 模型與範圍決策

- **Embedding**：OpenAI `text-embedding-3-small`（1536 維、多語、~$0.02/1M tokens，
  本語料 <$0.1/月）。**拒用** Supabase 內建 gte-small（384 維、英文中心；語料為繁中）。
- **Embed 輸入**：`title + '\n' + summary_md`（文章級相似度即夠用，免 chunking；
  全文 embed 成本高且對「相關文章」無增益）。
- **pgroonga 條件式啟用**：migration 以 `pg_available_extensions` 檢查——可用則建
  pgroonga index＋FTS 函式；不可用則 FTS 函式退化為 `ilike`（語意搜尋不受影響）。
  `pg_jieba` 不在 Supabase 目錄，不考慮。
- SearchOverlay 既有 client-side 索引搜尋**保留**；`/api/search` 為新增的伺服端
  語意＋FTS 端點（UI 深度整合留待後續迭代）。

## 3. Schema（`supabase/migrations/0005_ai_features.sql`）

- `create extension vector`；`articles.embedding vector(1536)`＋HNSW index
  （`vector_cosine_ops`）。
- pgroonga（條件式）：`articles_pgroonga_idx on (array[title, summary_md, content_md])`。
- RPC（invoker 權限；articles 本就 public-read）：
  - `match_articles(query_embedding vector, lim int)` → 依 cosine 距離排序。
  - `related_articles(p_slug text, lim int)` → 同表 self-join，排除自身。
  - `search_articles_fts(q text, lim int)` → pgroonga `&@~`（或 ilike fallback）。

## 4. Embedding 管線（`supabase/functions/embed-articles/index.ts`）

- 撈 `embedding is null` 的文章（新→舊，批次 50）→ OpenAI embeddings API
  （單次呼叫帶整批 input）→ 逐列 update。
- 寫一列 `ingestion_runs`（`channel='embed'`，counts={selected, embedded}）。
- Secret：`OPENAI_API_KEY`（Edge Function secrets）。未設定 → 回 200 附訊息、
  不寫 run（避免 cron 灌 failed 紀錄）。
- 觸發：**Supabase Cron 每小時掃尾**（null-query 天然冪等、自癒；~250 篇舊文跑
  5-6 次補完）＋ `ingest:json` 成功後 fire-and-forget POST（20s timeout，失敗僅
  warning——cron 會補）。
- 停擺安全：embedding 為 null 時網站不受影響（相關文章區塊自動隱藏）。

## 5. Web

- `web/app/api/search/route.ts`（dynamic route handler）：POST `{q}` →
  （有 `OPENAI_API_KEY` server env 時）embed query → `match_articles`；並行
  `search_articles_fts` → RRF-lite 交錯合併去重 → 回傳。無 key → 純 FTS。
  key 放 **Vercel server env**（非 `NEXT_PUBLIC`）。
- 文章頁「相關文章」區塊：`getRelatedArticles(slug)`（rpc，fail-safe 空陣列）
  → 列出 top 5（標題/分類/日期連結）。SSG-safe（revalidate 時計算）。

## 6. Cron 一次性設定（手動 SQL）

```sql
select cron.schedule('embed-articles-hourly', '30 * * * *',
  $$ select net.http_post(
       url := 'https://ifbpfuvlevjegwdnhyqh.supabase.co/functions/v1/embed-articles',
       headers := jsonb_build_object('Authorization','Bearer ' ||
         (select decrypted_secret from vault.decrypted_secrets where name='anon_key')),
       body := '{}'::jsonb) $$);
```

## 7. Acceptance Criteria

- AC1 migration 0005 在 pgroonga 可用/不可用兩情境都能套用（DO block 條件）。
- AC2 舊文 backfill：重複 invoke embed-articles 直到 `embedding is null` 為 0；
  重跑不重複計費（null-query 冪等）。（SQL 驗證）
- AC3 `related_articles('<某技術文 slug>')` 回傳語意相近文章（繁中目測）。（SQL smoke）
- AC4 FTS：「聯發科」「晶片」等詞命中（pgroonga 情境）。（SQL smoke）
- AC5 `/api/search` 無 OPENAI_API_KEY 時仍回 FTS 結果；有 key 時合併語意結果。（部署後驗證）
- AC6 文章頁相關文章區塊：embedding 未就緒時隱藏、不噴錯。（unit/目視）

# Spec 009 — 可觀測性：status page＋健檢告警

## 1. 目標

看得到每一次 run；日報缺漏或管線劣化時**主動告警**。只疊在 007/008 已建立的表上：
`ingestion_runs`（007，public-read）＋ `sources`/`raw_items`（008，私有）。

告警通道：**Slack Incoming Webhook**（單一 secret、零依賴）。不用 GitHub Actions
排程做告警——避免第三個 scheduler；cron 集中在 Supabase。

## 2. Schema（`supabase/migrations/0004_observability.sql`）

`source_health` view（**owner 權限**，即非 security_invoker——刻意繞過 sources/raw_items
的 RLS，但只暴露 sanitized 欄位）：`name, kind, active, last_fetched_at, last_status,
items_48h`（近 48h 抓到的 raw_items 數）。`grant select to anon, authenticated`。
`raw_items` 本體維持不可公開讀（負向測試 AC3）。

## 3. Edge Function（`supabase/functions/daily-healthcheck/index.ts`）

Cron 兩班（台北時間；UTC cron 03:00 / 06:00）：
- **11:00（warn-only）**：`?alert=false` — 只寫 run 紀錄，不發 Slack（routine 可能還沒跑完）。
- **14:00（告警）**：`?alert=true` — 檢查失敗即 POST Slack。

檢查項（以台北「今天」為準，UTC+8 推算）：
1. 今日 `daily_reports` 列存在。
2. 該報 `daily_report_items` 數在 8–15。
3. 今日最新 `channel='json'` 的 run `phase='completed'`。
4. 無 active source 逾 48h 未成功抓取（`last_fetched_at` 過舊或 `last_status` 帶 error）。

無論結果都寫一列 `ingestion_runs`（`channel='healthcheck'`，counts=檢查通過數，
warnings=失敗項清單）。Slack 訊息含失敗項與 status page 連結。
Secret：`SLACK_WEBHOOK_URL`（Edge Function secrets；未設定時只記 log 不告警）。

## 4. Web status page（`web/app/status/page.tsx`）

- `web/lib/queries.ts` 新增：`getRuns(limit=14)`（ingestion_runs 新→舊）、
  `getSourceHealth()`（source_health view）。全部走既有 anon client（唯讀）。
- 頁面：今日管線狀態（最新 json run 的 phase/counts/gate 摘要）→ 近 14 次 run 清單
  （phase 以顏色 chip 呈現；gate_results pass/warn/fail 計數）→ 來源新鮮度表。
- `export const revalidate = 300`（status 需比內容頁新鮮）。

## 5. Cron 一次性設定（手動 SQL）

```sql
select cron.schedule('healthcheck-1100-tpe', '0 3 * * *',
  $$ select net.http_post(
       url := 'https://ifbpfuvlevjegwdnhyqh.supabase.co/functions/v1/daily-healthcheck?alert=false',
       headers := jsonb_build_object('Authorization','Bearer ' ||
         (select decrypted_secret from vault.decrypted_secrets where name='anon_key')),
       body := '{}'::jsonb) $$);
select cron.schedule('healthcheck-1400-tpe', '0 6 * * *',
  $$ select net.http_post(
       url := 'https://ifbpfuvlevjegwdnhyqh.supabase.co/functions/v1/daily-healthcheck?alert=true',
       headers := jsonb_build_object('Authorization','Bearer ' ||
         (select decrypted_secret from vault.decrypted_secrets where name='anon_key')),
       body := '{}'::jsonb) $$);
```

Routine 的 Cowork 排程時間須早於 14:00（台北），並記載於 prompt 頁首。

## 6. Acceptance Criteria

- AC1 `source_health` view 以 anon key 可讀且只含 sanitized 欄位。（SQL/status page 驗證）
- AC2 status page 只用 anon key 渲染成功（近 14 runs＋來源表）。（部署後目視）
- AC3 anon 讀 `raw_items` 被 RLS 擋下（負向測試）。（SQL 驗證）
- AC4 強制失敗演練：對無日報的日期跑 healthcheck `?alert=true` → 收到 Slack 訊息。（手動）
- AC5 healthcheck 每次執行寫入一列 `ingestion_runs(channel='healthcheck')`。（SQL 驗證）

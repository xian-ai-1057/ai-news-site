-- Spec 008 §8 / 009 §5 / 010 §6 — pg_cron 排程（Edge Functions 觸發）
-- 前置：vault 需有名為 'anon_key' 的 secret（值 = 專案 publishable/anon key，
-- 以 execute_sql / SQL Editor 建立，不進版控）。cron body 於執行時才讀 vault。
-- cron.schedule 以 jobname upsert，重跑 idempotent。

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- fetch-sources：每 4 小時抓 feed 進候選池（Spec 008）
select cron.schedule(
  'fetch-sources-every-4h',
  '0 */4 * * *',
  $$
  select net.http_post(
    url := 'https://ifbpfuvlevjegwdnhyqh.supabase.co/functions/v1/fetch-sources',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Content-Type', 'application/json'),
    body := '{}'::jsonb)
  $$
);

-- daily-healthcheck：台北 11:00（UTC 03:00，warn-only）與 14:00（UTC 06:00，告警）（Spec 009）
select cron.schedule(
  'healthcheck-1100-tpe',
  '0 3 * * *',
  $$
  select net.http_post(
    url := 'https://ifbpfuvlevjegwdnhyqh.supabase.co/functions/v1/daily-healthcheck?alert=false',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Content-Type', 'application/json'),
    body := '{}'::jsonb)
  $$
);

select cron.schedule(
  'healthcheck-1400-tpe',
  '0 6 * * *',
  $$
  select net.http_post(
    url := 'https://ifbpfuvlevjegwdnhyqh.supabase.co/functions/v1/daily-healthcheck?alert=true',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Content-Type', 'application/json'),
    body := '{}'::jsonb)
  $$
);

-- embed-articles：每小時掃尾補向量（Spec 010；null-query 冪等）
select cron.schedule(
  'embed-articles-hourly',
  '30 * * * *',
  $$
  select net.http_post(
    url := 'https://ifbpfuvlevjegwdnhyqh.supabase.co/functions/v1/embed-articles',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'Content-Type', 'application/json'),
    body := '{}'::jsonb)
  $$
);

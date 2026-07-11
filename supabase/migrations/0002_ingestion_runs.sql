-- Spec 007 — ingestion_runs（執行紀錄）+ articles 出處欄位
-- 全部 additive；先於程式碼部署（遷移安全規則）。

-- ── ingestion_runs：每次 ingest / fetch / embed / healthcheck 一列 ─────────
create table if not exists public.ingestion_runs (
  id           uuid primary key default gen_random_uuid(),
  run_date     date not null,
  channel      text not null check (channel in
                 ('json','markdown-backfill','edge-fetch','embed','healthcheck')),
  trigger_src  text not null default '',   -- 'cowork' | 'github-actions' | 'supabase-cron' | 'manual'
  phase        text not null default 'started' check (phase in
                 ('started','validated','gated','written','completed','failed')),
  counts       jsonb not null default '{}'::jsonb, -- {articles, learningNotes, dailyReports, dailyReportItems}
  gate_results jsonb not null default '[]'::jsonb, -- [{gate, status, detail}]
  warnings     jsonb not null default '[]'::jsonb, -- 寫入前不得含金鑰/PII（public read）
  error        text,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz
);
create index if not exists ingestion_runs_run_date_idx
  on public.ingestion_runs (run_date desc, started_at desc);

alter table public.ingestion_runs enable row level security;
drop policy if exists "public read ingestion runs" on public.ingestion_runs;
create policy "public read ingestion runs" on public.ingestion_runs
  for select to anon, authenticated using (true); -- 供 Spec 009 status page

-- ── articles：出處與正規化 URL（additive，default 安全）────────────────────
alter table public.articles
  add column if not exists origin jsonb not null default '{}'::jsonb,
  add column if not exists url_normalized text not null default '';
create index if not exists articles_url_norm_idx
  on public.articles (url_normalized);
-- 注意：url_normalized 先不設 unique —— 舊資料可能有重複/空 URL。
-- 去重先由 ingest 閘門把關；語料清理後另出 migration 升級為 unique index。

-- Spec 001 — AI News DB-first schema
-- 三層內容：daily_reports → daily_report_items → articles ← learning_notes
-- 對齊 specs/001-db-schema/contracts/records.schema.ts

-- ── Enum ──────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'category_enum') then
    create type category_enum as enum (
      '技術理論', '市場情況', '重大新聞', '企業應用導入', '新創公司'
    );
  end if;
end $$;

-- ── articles ──────────────────────────────────────────────────────────
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  article_date  date not null,
  source        text not null default '',
  url           text not null default '',
  category      category_enum not null,
  industry      text not null default '',
  summary_md    text not null default '',
  content_md    text not null default '',
  tags          text[] not null default '{}',
  created_date  date,
  raw_md        text not null default '',
  inserted_at   timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists articles_article_date_idx on public.articles (article_date desc);
create index if not exists articles_category_idx      on public.articles (category);
create index if not exists articles_tags_gin          on public.articles using gin (tags);

-- ── learning_notes ────────────────────────────────────────────────────
create table if not exists public.learning_notes (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  note_date           date not null,
  topic               text not null default '',
  difficulty          text not null default '',
  source_article_id   uuid references public.articles (id) on delete set null,
  source_article_slug text,  -- FK 解不到時的備援
  content_md          text not null default '',
  tags                text[] not null default '{}',
  created_date        date,
  raw_md              text not null default '',
  inserted_at         timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists learning_notes_source_article_idx on public.learning_notes (source_article_id);
create index if not exists learning_notes_tags_gin           on public.learning_notes using gin (tags);

-- ── daily_reports ─────────────────────────────────────────────────────
create table if not exists public.daily_reports (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  report_date   date not null unique,
  title         text not null default '',
  summary_md    text not null default '',
  tags          text[] not null default '{}',
  created_date  date,
  raw_md        text not null default '',
  inserted_at   timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists daily_reports_report_date_idx on public.daily_reports (report_date desc);

-- ── daily_report_items（join：日報 ⨯ 文章，含章節與順序）─────────────────
create table if not exists public.daily_report_items (
  id              uuid primary key default gen_random_uuid(),
  daily_report_id uuid not null references public.daily_reports (id) on delete cascade,
  article_id      uuid not null references public.articles (id) on delete cascade,
  section         category_enum not null,
  position        int not null default 0,
  blurb_md        text not null default '',
  unique (daily_report_id, article_id)
);
create index if not exists dri_report_idx  on public.daily_report_items (daily_report_id);
create index if not exists dri_article_idx on public.daily_report_items (article_id);

-- ── updated_at 觸發器 ─────────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists learning_notes_set_updated_at on public.learning_notes;
create trigger learning_notes_set_updated_at before update on public.learning_notes
  for each row execute function public.set_updated_at();

drop trigger if exists daily_reports_set_updated_at on public.daily_reports;
create trigger daily_reports_set_updated_at before update on public.daily_reports
  for each row execute function public.set_updated_at();

-- ── RLS：公開唯讀，寫入只走 service_role（繞過 RLS）───────────────────
alter table public.articles            enable row level security;
alter table public.learning_notes      enable row level security;
alter table public.daily_reports       enable row level security;
alter table public.daily_report_items  enable row level security;

drop policy if exists "public read articles"     on public.articles;
drop policy if exists "public read notes"         on public.learning_notes;
drop policy if exists "public read reports"       on public.daily_reports;
drop policy if exists "public read report items"  on public.daily_report_items;

create policy "public read articles"    on public.articles
  for select to anon, authenticated using (true);
create policy "public read notes"        on public.learning_notes
  for select to anon, authenticated using (true);
create policy "public read reports"      on public.daily_reports
  for select to anon, authenticated using (true);
create policy "public read report items" on public.daily_report_items
  for select to anon, authenticated using (true);

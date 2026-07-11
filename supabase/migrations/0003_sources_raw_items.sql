-- Spec 008 — 來源層：sources（config-as-data）+ raw_items（候選池）
-- 全部 additive。raw_items 無 public read policy（原始擷取文字僅服務端可讀）。

-- ── sources：feed 設定（關鍵字/查詢自 routine prompt 遷出）───────────────
create table if not exists public.sources (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null unique,
  kind                   text not null check (kind in ('rss','atom','arxiv-api','json-feed')),
  feed_url               text not null,
  default_category       category_enum,          -- 提示用；最終分類由 routine 決定
  language               text not null default 'en',
  active                 boolean not null default true,
  fetch_interval_minutes int not null default 240,
  last_fetched_at        timestamptz,
  last_status            text not null default '',
  config                 jsonb not null default '{}'::jsonb,
  inserted_at            timestamptz not null default now()
);
alter table public.sources enable row level security;
-- 無 public policy：sources 讀寫僅 service_role（009 經 sanitized view 供 status page）。

-- ── raw_items：候選池（url_hash 唯一 = 跨日去重核心）─────────────────────
create table if not exists public.raw_items (
  id                 uuid primary key default gen_random_uuid(),
  source_id          uuid references public.sources (id) on delete set null,
  url                text not null,
  url_hash           text not null unique,       -- sha256(normalizeUrl(url))
  title              text not null default '',
  summary            text not null default '',
  content_text       text not null default '',   -- best-effort（RSS content:encoded）
  published_at       timestamptz,
  fetched_at         timestamptz not null default now(),
  category_hint      category_enum,
  lang               text not null default '',
  status             text not null default 'new'
                       check (status in ('new','curated','rejected','stale')),
  curated_article_id uuid references public.articles (id) on delete set null,
  payload            jsonb not null default '{}'::jsonb
);
create index if not exists raw_items_status_published_idx
  on public.raw_items (status, published_at desc);
create index if not exists raw_items_fetched_idx
  on public.raw_items (fetched_at desc);
alter table public.raw_items enable row level security;
-- 無 public policy（著作權考量；status page 走 source_health view，見 Spec 009）。

-- ── Seed sources（idempotent）────────────────────────────────────────────
insert into public.sources (name, kind, feed_url, default_category, language, config) values
  ('arXiv cs.AI', 'arxiv-api',
   'https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=30',
   '技術理論', 'en', '{"note":"arXiv Atom API"}'),
  ('arXiv cs.CL', 'arxiv-api',
   'https://export.arxiv.org/api/query?search_query=cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=30',
   '技術理論', 'en', '{"note":"arXiv Atom API"}'),
  ('Hugging Face Blog', 'rss', 'https://huggingface.co/blog/feed.xml', '技術理論', 'en', '{}'),
  ('OpenAI News', 'rss', 'https://openai.com/news/rss.xml', '重大新聞', 'en', '{}'),
  ('Google DeepMind Blog', 'rss', 'https://deepmind.google/blog/rss.xml', '技術理論', 'en', '{}'),
  ('TechCrunch AI', 'rss', 'https://techcrunch.com/category/artificial-intelligence/feed/', '重大新聞', 'en', '{}'),
  ('The Verge AI', 'atom', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', '重大新聞', 'en', '{}'),
  ('VentureBeat AI', 'rss', 'https://venturebeat.com/category/ai/feed/', '企業應用導入', 'en', '{}'),
  ('MIT Technology Review', 'rss', 'https://www.technologyreview.com/feed/', '企業應用導入', 'en', '{}'),
  ('iThome', 'rss', 'https://www.ithome.com.tw/rss', '重大新聞', 'zh-TW', '{}'),
  ('科技新報 TechNews', 'rss', 'https://technews.tw/feed/', '重大新聞', 'zh-TW', '{}'),
  ('INSIDE', 'rss', 'https://www.inside.com.tw/feed/rss', '新創公司', 'zh-TW', '{}'),
  ('TechOrange 科技報橘', 'rss', 'https://buzzorange.com/techorange/feed/', '新創公司', 'zh-TW', '{}')
on conflict (name) do nothing;

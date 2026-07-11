-- Spec 010 — pgvector 語意欄位＋RPC＋（條件式）pgroonga 中文全文搜尋
-- pgroonga 以 pg_available_extensions 檢查：不可用時 FTS 函式退化為 ilike，
-- migration 兩種情境都能套用（AC1）。

-- ── pgvector ──────────────────────────────────────────────────────────
create extension if not exists vector;

alter table public.articles
  add column if not exists embedding vector(1536); -- text-embedding-3-small

create index if not exists articles_embedding_hnsw
  on public.articles using hnsw (embedding vector_cosine_ops);

-- ── RPC：語意搜尋 ─────────────────────────────────────────────────────
create or replace function public.match_articles(
  query_embedding vector(1536),
  lim int default 10
) returns table (
  slug text, title text, article_date date, category category_enum, similarity float
)
language sql stable
set search_path = ''
as $$
  select a.slug, a.title, a.article_date, a.category,
         1 - (a.embedding operator(public.<=>) query_embedding) as similarity
    from public.articles a
   where a.embedding is not null
   order by a.embedding operator(public.<=>) query_embedding
   limit lim
$$;

-- ── RPC：相關文章（self-join，排除自身）───────────────────────────────
create or replace function public.related_articles(
  p_slug text,
  lim int default 5
) returns table (
  slug text, title text, article_date date, category category_enum, similarity float
)
language sql stable
set search_path = ''
as $$
  select b.slug, b.title, b.article_date, b.category,
         1 - (b.embedding operator(public.<=>) a.embedding) as similarity
    from public.articles a
    join public.articles b
      on b.slug <> a.slug and b.embedding is not null
   where a.slug = p_slug and a.embedding is not null
   order by b.embedding operator(public.<=>) a.embedding
   limit lim
$$;

-- ── pgroonga（條件式）＋ FTS RPC ──────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pgroonga') then
    execute 'create extension if not exists pgroonga';
    execute 'create index if not exists articles_pgroonga_idx
               on public.articles using pgroonga ((array[title, summary_md, content_md]))';
    execute $f$
      create or replace function public.search_articles_fts(q text, lim int default 20)
      returns table (slug text, title text, article_date date, category category_enum, score float)
      language sql stable
      set search_path = ''
      as $body$
        select a.slug, a.title, a.article_date, a.category,
               public.pgroonga_score(a.tableoid, a.ctid)::float as score
          from public.articles a
         where array[a.title, a.summary_md, a.content_md] operator(public.&@~) q
         order by score desc, a.article_date desc
         limit lim
      $body$
    $f$;
  else
    -- fallback：無 pgroonga → ilike（品質較差但介面一致；語意搜尋不受影響）
    execute $f$
      create or replace function public.search_articles_fts(q text, lim int default 20)
      returns table (slug text, title text, article_date date, category category_enum, score float)
      language sql stable
      set search_path = ''
      as $body$
        select a.slug, a.title, a.article_date, a.category, 1.0::float as score
          from public.articles a
         where a.title ilike '%' || q || '%'
            or a.summary_md ilike '%' || q || '%'
            or a.content_md ilike '%' || q || '%'
         order by a.article_date desc
         limit lim
      $body$
    $f$;
  end if;
end $$;

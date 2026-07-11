-- Spec 009 — source_health view（sanitized 來源新鮮度，供 public status page）
-- 刻意用 view owner 權限（非 security_invoker）繞過 sources/raw_items 的 RLS，
-- 只暴露無著作權疑慮的欄位；raw_items 本體維持不可公開讀。
create or replace view public.source_health
with (security_invoker = off) as
select
  s.name,
  s.kind,
  s.active,
  s.last_fetched_at,
  s.last_status,
  (select count(*)
     from public.raw_items r
    where r.source_id = s.id
      and r.fetched_at > now() - interval '48 hours') as items_48h
from public.sources s;

grant select on public.source_health to anon, authenticated;

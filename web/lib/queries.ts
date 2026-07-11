// Phase 6 — 資料層查詢（supabase-js / PostgREST 巢狀 embedding，全部 async 唯讀）。
// 把 DB 列整形成 view-model（@/lib/types）。嚴禁寫 DB / 改 schema。
import { cache } from "react";
import { supabase } from "./supabase";
import { CATEGORY_KEY } from "./categories";
import type { Article, CatKey, Digest, DigestItem, Note, SearchRow } from "./viewmodel";
import {
  catOrderRank,
  deriveIssue,
  deriveLead,
  extractObservation,
  weekday,
} from "./shape";

// 巢狀 embedding：daily_report_items.articles 為 to-one（物件）；
// articles.learning_notes 為反向 FK（陣列，取 [0]）。
const DIGEST_SELECT = `
  report_date, summary_md, raw_md,
  daily_report_items( section, position, blurb_md,
    articles( slug, title, source, url, industry,
      learning_notes( slug ) ) )
`;

// PostgREST 回傳列的最小結構（只取我們 select 的欄位）。
interface RawArticle {
  slug: string | null;
  title: string | null;
  source: string | null;
  url: string | null;
  industry: string | null;
  learning_notes: { slug: string }[] | null;
}
interface RawItem {
  section: string;
  position: number;
  blurb_md: string | null;
  articles: RawArticle | null;
}
interface RawReport {
  report_date: string;
  summary_md: string | null;
  raw_md: string | null;
  daily_report_items: RawItem[] | null;
}

/** 把一列 daily_report_item 整形成 DigestItem（lead 之後由 deriveLead 設）。 */
function shapeItem(row: RawItem): DigestItem {
  const art = row.articles;
  const industry = art?.industry ?? null;
  const noteSlug = art?.learning_notes?.[0]?.slug ?? null;
  return {
    catKey: CATEGORY_KEY[row.section] as CatKey,
    lead: false,
    title: art?.title ?? "",
    articleSlug: art?.slug ?? "",
    source: art?.source ?? "",
    url: art?.url ?? "",
    industry: industry === "" ? null : industry,
    points: row.blurb_md ?? "",
    noteSlug,
  };
}

/** 排序：CAT_ORDER → position。 */
function sortItems(items: { item: DigestItem; position: number }[]): DigestItem[] {
  return items
    .slice()
    .sort((a, b) => {
      const ra = catOrderRank(a.item.catKey);
      const rb = catOrderRank(b.item.catKey);
      if (ra !== rb) return ra - rb;
      return a.position - b.position;
    })
    .map((x) => x.item);
}

/** 把整列 report 套 shape（issue 由呼叫端傳入，因需全表排名）。 */
function shapeReport(row: RawReport, issue: number): Digest {
  const rawItems = row.daily_report_items ?? [];
  const paired = rawItems.map((r) => ({ item: shapeItem(r), position: r.position }));
  const items = sortItems(paired);
  deriveLead(items);
  return {
    date: row.report_date,
    weekday: weekday(row.report_date),
    issue,
    summary: row.summary_md ?? "",
    observation: extractObservation(row.raw_md ?? ""),
    items,
  };
}

/** 全部 report_date（升冪）。供 generateStaticParams 與 issue 計算。
 *  以 React cache() 包裹：同一請求內（generateMetadata + page）去重，只打一次 DB。 */
export const getDigestDates = cache(async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("daily_reports")
    .select("report_date")
    .order("report_date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => r.report_date as string);
});

/** 全部日報（新到舊），每期套 shape（不帶 raw_md）。 */
export async function getDigests(): Promise<Digest[]> {
  const datesAsc = await getDigestDates();
  const { data, error } = await supabase
    .from("daily_reports")
    .select(DIGEST_SELECT)
    .order("report_date", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as RawReport[]).map((row) =>
    shapeReport(row, deriveIssue(datesAsc, row.report_date)),
  );
}

/** 單期日報（含 issue）。找不到 → null。
 *  以 React cache() 包裹：同一請求內 generateMetadata 與 page 共用同一次查詢。 */
export const getDigest = cache(async (date: string): Promise<Digest | null> => {
  const datesAsc = await getDigestDates();
  const { data, error } = await supabase
    .from("daily_reports")
    .select(DIGEST_SELECT)
    .eq("report_date", date)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return shapeReport(
    data as unknown as RawReport,
    deriveIssue(datesAsc, date),
  );
});

/** 全部文章扁平搜尋索引（一篇文章一列）。 */
export async function getSearchIndex(): Promise<SearchRow[]> {
  const { data, error } = await supabase
    .from("daily_reports")
    .select(DIGEST_SELECT)
    .order("report_date", { ascending: false });
  if (error) throw error;

  const rows: SearchRow[] = [];
  for (const report of (data ?? []) as unknown as RawReport[]) {
    for (const it of report.daily_report_items ?? []) {
      const art = it.articles;
      const industry = art?.industry ?? null;
      rows.push({
        date: report.report_date,
        catKey: CATEGORY_KEY[it.section] as CatKey,
        title: art?.title ?? "",
        articleSlug: art?.slug ?? "",
        source: art?.source ?? "",
        industry: industry === "" ? null : industry,
        points: it.blurb_md ?? "",
        noteSlug: art?.learning_notes?.[0]?.slug ?? null,
      });
    }
  }
  return rows;
}

interface RawNote {
  slug: string;
  title: string;
  note_date: string;
  topic: string | null;
  difficulty: string | null;
  content_md: string | null;
  source_article_slug: string | null;
}

/** 單筆學習筆記。找不到 → null。
 *  以 React cache() 包裹：generateMetadata 與 page 共用同一次查詢。 */
export const getNote = cache(async (slug: string): Promise<Note | null> => {
  const { data, error } = await supabase
    .from("learning_notes")
    .select(
      "slug, title, note_date, topic, difficulty, content_md, source_article_slug",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const n = data as unknown as RawNote;
  return {
    slug: n.slug,
    title: n.title,
    noteDate: n.note_date,
    topic: n.topic ?? "",
    difficulty: n.difficulty ?? "",
    contentMd: n.content_md ?? "",
    sourceArticleSlug: n.source_article_slug ?? null,
  };
});

// articles 列（getArticle / getTagArticles 共用）。
// learning_notes 為反向 FK（陣列，取 [0]）；
// daily_report_items.daily_reports 為 to-one（物件，可能 null）。
const ARTICLE_SELECT = `
  slug, title, article_date, source, url, category, industry,
  summary_md, content_md, tags,
  learning_notes( slug ),
  daily_report_items( daily_reports( report_date ) )
`;

interface RawArticleFull {
  slug: string;
  title: string | null;
  article_date: string;
  source: string | null;
  url: string | null;
  category: string | null;
  industry: string | null;
  summary_md: string | null;
  content_md: string | null;
  tags: string[] | null;
  learning_notes: { slug: string }[] | null;
  daily_report_items:
    | { daily_reports: { report_date: string } | null }[]
    | null;
}

/** 把一列 articles（含巢狀）整形成 Article。 */
function shapeArticle(a: RawArticleFull): Article {
  const industry = a.industry ?? null;
  const reportDates = Array.from(
    new Set(
      (a.daily_report_items ?? [])
        .map((d) => d.daily_reports?.report_date)
        .filter((d): d is string => !!d),
    ),
  ).sort();
  return {
    slug: a.slug,
    title: a.title ?? "",
    articleDate: a.article_date,
    source: a.source ?? "",
    url: a.url ?? "",
    category: CATEGORY_KEY[a.category ?? ""] as CatKey,
    industry: industry === "" ? null : industry,
    summaryMd: a.summary_md ?? "",
    contentMd: a.content_md ?? "",
    tags: a.tags ?? [],
    noteSlug: a.learning_notes?.[0]?.slug ?? null,
    reportDates,
  };
}

/** 單篇文章。找不到 → null。
 *  以 React cache() 包裹：generateMetadata 與 page 共用同一次查詢。 */
export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return shapeArticle(data as unknown as RawArticleFull);
});

/** 全部文章 slug。供 generateStaticParams。 */
export async function getArticleSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("articles").select("slug");
  if (error) throw error;
  return (data ?? []).map((r) => r.slug as string);
}

/** 含某 tag 的文章（按 article_date 新→舊）。
 *  以 React cache() 包裹：generateMetadata 與 page 共用同一次查詢。 */
export const getTagArticles = cache(async (tag: string): Promise<Article[]> => {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .contains("tags", [tag])
    .order("article_date", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as RawArticleFull[]).map(shapeArticle);
});

// ── Spec 009 — status page（ingestion_runs / source_health 皆 public-read）──

export interface RunSummary {
  runDate: string;
  channel: string;
  triggerSrc: string;
  phase: string;
  counts: Record<string, number>;
  gateResults: { gate: string; status: string; detail: string }[];
  warnings: string[];
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
}

/** 近 N 次 ingestion run（新→舊）。表不存在（migration 未套用）或網路失敗 → 空陣列。 */
export async function getRuns(limit = 14): Promise<RunSummary[]> {
  let data: Record<string, unknown>[] | null;
  try {
    const res = await supabase
      .from("ingestion_runs")
      .select("run_date, channel, trigger_src, phase, counts, gate_results, warnings, error, started_at, finished_at")
      .order("started_at", { ascending: false })
      .limit(limit);
    if (res.error) return [];
    data = res.data;
  } catch {
    return [];
  }
  return (data ?? []).map((r) => ({
    runDate: r.run_date as string,
    channel: (r.channel as string) ?? "",
    triggerSrc: (r.trigger_src as string) ?? "",
    phase: (r.phase as string) ?? "",
    counts: (r.counts as Record<string, number>) ?? {},
    gateResults: (r.gate_results as RunSummary["gateResults"]) ?? [],
    warnings: (r.warnings as string[]) ?? [],
    error: (r.error as string | null) ?? null,
    startedAt: r.started_at as string,
    finishedAt: (r.finished_at as string | null) ?? null,
  }));
}

// ── Spec 010 — 相關文章（pgvector RPC；embedding 未就緒或 RPC 不存在 → 空）──

export interface RelatedArticle {
  slug: string;
  title: string;
  articleDate: string;
  catKey: CatKey;
}

export async function getRelatedArticles(slug: string, limit = 5): Promise<RelatedArticle[]> {
  try {
    const { data, error } = await supabase.rpc("related_articles", {
      p_slug: slug,
      lim: limit,
    });
    if (error) return [];
    return ((data ?? []) as Array<{ slug: string; title: string; article_date: string; category: string }>)
      .filter((r) => CATEGORY_KEY[r.category])
      .map((r) => ({
        slug: r.slug,
        title: r.title,
        articleDate: r.article_date,
        catKey: CATEGORY_KEY[r.category] as CatKey,
      }));
  } catch {
    return [];
  }
}

export interface SourceHealth {
  name: string;
  kind: string;
  active: boolean;
  lastFetchedAt: string | null;
  lastStatus: string;
  items48h: number;
}

/** 來源新鮮度（source_health sanitized view）。view 不存在或網路失敗 → 空陣列。 */
export async function getSourceHealth(): Promise<SourceHealth[]> {
  let data: Record<string, unknown>[] | null;
  try {
    const res = await supabase
      .from("source_health")
      .select("name, kind, active, last_fetched_at, last_status, items_48h")
      .order("name", { ascending: true });
    if (res.error) return [];
    data = res.data;
  } catch {
    return [];
  }
  return (data ?? []).map((s) => ({
    name: s.name as string,
    kind: s.kind as string,
    active: Boolean(s.active),
    lastFetchedAt: (s.last_fetched_at as string | null) ?? null,
    lastStatus: (s.last_status as string) ?? "",
    items48h: Number(s.items_48h ?? 0),
  }));
}

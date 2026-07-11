// Spec 003 — record → row mappers. Pure functions, camelCase → snake_case.
// Column lists align with supabase/migrations/0001_init.sql.
import type {
  ArticleRecord,
  LearningNoteRecord,
  DailyReportRecord,
  DailyReportItem,
} from "../../specs/001-db-schema/contracts/records.schema";
import type { Origin } from "../../specs/007-structured-channel/contracts/daily-bundle.schema";
import { normalizeUrl } from "../gates/url";

export interface ArticleRow {
  slug: string;
  title: string;
  article_date: string;
  source: string;
  url: string;
  category: string;
  industry: string;
  summary_md: string;
  content_md: string;
  tags: string[];
  created_date: string | null;
  raw_md: string;
  /** Spec 007：出處（JSON 通道帶 Origin；markdown 種子為 channel 標記）。 */
  origin: Record<string, unknown>;
  /** Spec 007：正規化 URL（跨日去重比對鍵；空 url → ""）。 */
  url_normalized: string;
}

export interface LearningNoteRow {
  slug: string;
  title: string;
  note_date: string;
  topic: string;
  difficulty: string;
  source_article_id: string | null;
  source_article_slug: string | null;
  content_md: string;
  tags: string[];
  created_date: string | null;
  raw_md: string;
}

export interface DailyReportRow {
  slug: string;
  report_date: string;
  title: string;
  summary_md: string;
  tags: string[];
  created_date: string | null;
  raw_md: string;
}

export interface DailyReportItemRow {
  daily_report_id: string;
  article_id: string;
  section: string;
  position: number;
  blurb_md: string;
}

/**
 * article → public.articles。
 * JSON 通道（Spec 007）的記錄帶 origin；markdown 種子路徑無 origin，
 * 標記 channel=markdown-backfill 以利追溯。
 */
export function articleToRow(rec: ArticleRecord & { origin?: Origin }): ArticleRow {
  return {
    slug: rec.slug,
    title: rec.title,
    article_date: rec.articleDate,
    source: rec.source,
    url: rec.url,
    category: rec.category,
    industry: rec.industry,
    summary_md: rec.summaryMd,
    content_md: rec.contentMd,
    tags: rec.tags,
    created_date: rec.createdDate,
    raw_md: rec.rawMd,
    origin: rec.origin ?? { channel: "markdown-backfill" },
    url_normalized: rec.url ? normalizeUrl(rec.url) : "",
  };
}

/**
 * note → public.learning_notes.
 * @param sourceArticleId resolved articles.id for sourceArticleSlug, or null.
 */
export function learningNoteToRow(
  rec: LearningNoteRecord,
  sourceArticleId: string | null,
): LearningNoteRow {
  return {
    slug: rec.slug,
    title: rec.title,
    note_date: rec.noteDate,
    topic: rec.topic,
    difficulty: rec.difficulty,
    source_article_id: sourceArticleId,
    source_article_slug: rec.sourceArticleSlug,
    content_md: rec.contentMd,
    tags: rec.tags,
    created_date: rec.createdDate,
    raw_md: rec.rawMd,
  };
}

/** report → public.daily_reports (items handled separately). */
export function dailyReportToRow(rec: DailyReportRecord): DailyReportRow {
  return {
    slug: rec.slug,
    report_date: rec.reportDate,
    title: rec.title,
    summary_md: rec.summaryMd,
    tags: rec.tags,
    created_date: rec.createdDate,
    raw_md: rec.rawMd,
  };
}

/**
 * item → public.daily_report_items.
 * @param dailyReportId resolved daily_reports.id (required).
 * @param articleId resolved articles.id (required; callers skip unresolved items).
 */
export function dailyReportItemToRow(
  item: DailyReportItem,
  dailyReportId: string,
  articleId: string,
): DailyReportItemRow {
  return {
    daily_report_id: dailyReportId,
    article_id: articleId,
    section: item.section,
    position: item.position,
    blurb_md: item.blurbMd,
  };
}

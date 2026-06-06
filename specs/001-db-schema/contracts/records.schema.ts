// Spec 001 — Records 契約（跨 spec 唯一事實）
// 由 parser（Spec 002）產出、由 upsert（Spec 003）消費。Phase 0 凍結，Phase 2 唯讀。
// 對齊 supabase/migrations/0001_init.sql 的資料表欄位（camelCase ↔ snake_case 由 upsert 層轉換）。
import { z } from "zod";

/** 日報五大章節 == 文章 category，DB 為 category_enum。 */
export const CATEGORIES = [
  "技術理論",
  "市場情況",
  "重大新聞",
  "企業應用導入",
  "新創公司",
] as const;
export const CategorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof CategorySchema>;

/** 日報 emoji 章節標題 → category 對應（parser 用）。 */
export const SECTION_HEADER_TO_CATEGORY: Record<string, Category> = {
  "🔬 技術理論": "技術理論",
  "📊 市場情況": "市場情況",
  "📰 重大新聞": "重大新聞",
  "🏢 企業應用導入": "企業應用導入",
  "🚀 新創公司": "新創公司",
};

// YYYY-MM-DD（frontmatter date 可能被 YAML 解析成 Date，parser 須正規化成字串）
const DateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

/** 文章（content/Articles/*.md）→ public.articles */
export const ArticleRecordSchema = z.object({
  slug: z.string().min(1), // 檔名去 .md，例：2026-05-13-OpenAI 發布 GPT-5.5 Instant
  title: z.string().min(1),
  articleDate: DateStr,
  source: z.string().default(""),
  url: z.string().default(""),
  category: CategorySchema,
  industry: z.string().default(""), // 自由文字（僅企業應用導入常填），其他章節為 ""
  summaryMd: z.string().default(""), // 📝 重點摘要
  contentMd: z.string().default(""), // 📖 全文內容
  tags: z.array(z.string()).default([]),
  createdDate: DateStr.nullable().default(null),
  rawMd: z.string().default(""), // 原始 markdown 全文（保真）
});
export type ArticleRecord = z.infer<typeof ArticleRecordSchema>;

/** 學習筆記（content/Learning Notes/*學習-*.md）→ public.learning_notes */
export const LearningNoteRecordSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  noteDate: DateStr,
  topic: z.string().default(""),
  difficulty: z.string().default(""), // 入門 / 中階 / 進階（text，不設 enum）
  sourceArticleSlug: z.string().nullable().default(null), // 由 source_article wikilink 抽出的 slug
  contentMd: z.string().default(""), // 整段 body
  tags: z.array(z.string()).default([]),
  createdDate: DateStr.nullable().default(null),
  rawMd: z.string().default(""),
});
export type LearningNoteRecord = z.infer<typeof LearningNoteRecordSchema>;

/** 日報內單則（一篇文章在某日報某章節的呈現）。 */
export const DailyReportItemSchema = z.object({
  reportSlug: z.string().min(1), // 所屬日報 slug，例：AI日報-2026-06-05
  articleSlug: z.string().min(1), // 指向的文章 slug（由 wikilink 抽出）
  section: CategorySchema,
  position: z.number().int().nonnegative(), // 同章節內由 0 起算的順序
  blurbMd: z.string().default(""), // 日報內該則的「重點」短文
});
export type DailyReportItem = z.infer<typeof DailyReportItemSchema>;

/** 日報（content/AI日報-YYYY-MM-DD.md）→ public.daily_reports（+ items）。 */
export const DailyReportRecordSchema = z.object({
  slug: z.string().min(1),
  reportDate: DateStr,
  title: z.string().default(""),
  summaryMd: z.string().default(""), // 今日重點 callout
  tags: z.array(z.string()).default([]),
  createdDate: DateStr.nullable().default(null),
  rawMd: z.string().default(""),
  items: z.array(DailyReportItemSchema).default([]),
});
export type DailyReportRecord = z.infer<typeof DailyReportRecordSchema>;

/** parser 對整個 content/ 目錄的彙總輸出（backfill 用）。 */
export const IngestBundleSchema = z.object({
  articles: z.array(ArticleRecordSchema),
  learningNotes: z.array(LearningNoteRecordSchema),
  dailyReports: z.array(DailyReportRecordSchema),
  warnings: z.array(z.string()).default([]), // 未解析 wikilink 等非致命問題
});
export type IngestBundle = z.infer<typeof IngestBundleSchema>;

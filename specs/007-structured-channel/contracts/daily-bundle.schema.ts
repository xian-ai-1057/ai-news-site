// Spec 007 — Daily bundle 契約（JSON 通道）。
// 以 import「組合」凍結的 001 契約，不修改之（specs/CLAUDE.md 鐵則 1）。
// Claude routine 每日產出一份符合 DailyBundleSchema 的 daily-bundle.json，
// 由 `ingest json` 驗證後入庫；Markdown 由 ingest/render 從 record 渲染（DB→MD）。
import { z } from "zod";
import {
  ArticleRecordSchema,
  LearningNoteRecordSchema,
  DailyReportRecordSchema,
} from "../../001-db-schema/contracts/records.schema";

const DateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

/** 文章出處通道。'raw-item' 自 Spec 008 的候選池；rawItemId 於 008 啟用。 */
export const ORIGIN_CHANNELS = ["raw-item", "websearch", "manual"] as const;

export const OriginSchema = z.object({
  channel: z.enum(ORIGIN_CHANNELS),
  rawItemId: z.string().uuid().nullable().default(null),
  fetchMethod: z.string().default(""), // defuddle | webfetch | rss | ...
});
export type Origin = z.infer<typeof OriginSchema>;

/**
 * JSON 通道的文章：url 由 001 的 default("") 升級為必填合法 URL；
 * observationsMd（💡 觀察與啟發）無 DB 獨立欄位，由 render 併入 content_md
 * 顯示 body（fillDisplayContentMd）與 raw_md，使文章頁呈現與種子通道一致。
 */
export const BundleArticleSchema = ArticleRecordSchema.extend({
  url: z.string().url(),
  origin: OriginSchema,
  observationsMd: z.string().default(""),
});
export type BundleArticle = z.infer<typeof BundleArticleSchema>;

/** JSON 通道的日報：observationsMd（📌 今日觀察）僅用於 raw_md 渲染。 */
export const BundleDailyReportSchema = DailyReportRecordSchema.extend({
  observationsMd: z.string().default(""),
});
export type BundleDailyReport = z.infer<typeof BundleDailyReportSchema>;

export const BundleMetaSchema = z.object({
  generator: z.string().default(""), // 例：cowork-daily-routine
  promptVersion: z.string().default(""), // 例：v2
  generatedAt: z.string().default(""), // 'YYYY-MM-DD HH:MM'（Asia/Taipei，日報頁尾用）
});
export type BundleMeta = z.infer<typeof BundleMetaSchema>;

export const DailyBundleSchema = z.object({
  runDate: DateStr,
  articles: z.array(BundleArticleSchema).min(1),
  learningNotes: z.array(LearningNoteRecordSchema).default([]),
  dailyReport: BundleDailyReportSchema,
  meta: BundleMetaSchema.default({ generator: "", promptVersion: "", generatedAt: "" }),
});
export type DailyBundle = z.infer<typeof DailyBundleSchema>;

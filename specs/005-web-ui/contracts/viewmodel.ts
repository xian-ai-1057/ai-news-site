// Spec 005 — Web view-model 契約（資料層 → 元件 的跨層唯一介面）
// Phase 4 凍結，Phase 6 唯讀。資料層（web/lib）負責把 DB 列轉成這些型別；
// 元件只認本檔型別，不直接認 DB schema。對齊 001-db-schema/contracts/records.schema.ts。

/** 五大分類英文 key（DB 為中文 category_enum，由 categories.ts 的 CATEGORY_KEY 對映）。 */
export type CatKey = "tech" | "market" | "news" | "enterprise" | "startup";

/** 日報內單則（一篇文章在某日報某章節的呈現）。 */
export interface DigestItem {
  /** 對應 DB daily_report_items.section（經 CATEGORY_KEY 中→英）。 */
  catKey: CatKey;
  /** 當期頭條（每期一則）。DB 無欄位，由 deriveLead() 衍生：重大新聞 position 0；無則整體第一則。 */
  lead: boolean;
  /** articles.title */
  title: string;
  /** articles.slug —— 內連文章頁 /articles/[slug]（Spec 006 加法式擴充）。 */
  articleSlug: string;
  /** articles.source（可能為多來源以 " / " 串接） */
  source: string;
  /** articles.url（原文外連；可能為空字串） */
  url: string;
  /** articles.industry；空字串正規化為 null（僅企業應用導入常見） */
  industry: string | null;
  /** daily_report_items.blurb_md（原型的 points 重點段落） */
  points: string;
  /** 有對應學習筆記時為其 slug（learning_notes.source_article_id 命中），否則 null。 */
  noteSlug: string | null;
}

/** 一期完整日報（首頁 hero / archive、內頁、搜尋皆由此衍生）。 */
export interface Digest {
  /** daily_reports.report_date（YYYY-MM-DD），內頁 key / 路由參數。 */
  date: string;
  /** 由 date 計算的中文週幾（週一…週日）。 */
  weekday: string;
  /** 期數。DB 無欄位，由 deriveIssue() 對 report_date asc 排名衍生（由 1 起算）。 */
  issue: number;
  /** daily_reports.summary_md（今日重點 callout；hero lede / 卡片 ex / 內頁 lede-box）。 */
  summary: string;
  /** 今日觀察（Editor's Analysis）。DB 無欄位，由 extractObservation(raw_md) 抽出；無則空字串。 */
  observation: string;
  /** 依 CAT_ORDER 與 position 排序的全部則。 */
  items: DigestItem[];
}

/** 全站搜尋 / 分類頁的扁平索引列（一則文章一列）。 */
export interface SearchRow {
  date: string; // 所屬日報 date（仍保留；用於顯示與回連 /digest/[date]）
  catKey: CatKey;
  title: string;
  articleSlug: string; // articles.slug —— 搜尋結果直達 /articles/[slug]（Spec 006 加）
  source: string;
  industry: string | null;
  points: string; // 用於 includes 比對與顯示
  noteSlug: string | null;
}

/** 學習筆記頁（/notes/[slug]）。對應 DB learning_notes。 */
export interface Note {
  slug: string; // learning_notes.slug
  title: string;
  noteDate: string; // note_date YYYY-MM-DD
  topic: string;
  difficulty: string; // 入門 / 中階 / 進階（自由文字）
  contentMd: string; // content_md（整段 markdown body）
  sourceArticleSlug: string | null; // 回連來源文章（FK 解不到時的備援 slug）
}

/** 單篇文章頁（/articles/[slug]）。對應 DB articles（Spec 006 新增）。 */
export interface Article {
  slug: string; // articles.slug（路由參數）
  title: string; // articles.title
  articleDate: string; // article_date YYYY-MM-DD
  source: string; // articles.source
  url: string; // articles.url（原文外連；可能為空字串）
  category: CatKey; // articles.category 經 CATEGORY_KEY 中→英
  industry: string | null; // 空字串正規化為 null
  summaryMd: string; // articles.summary_md
  contentMd: string; // articles.content_md（整段 markdown body）
  tags: string[]; // articles.tags（文章頁可點 chip → /tags/[tag]）
  noteSlug: string | null; // 有對應學習筆記時為其 slug，否則 null
  reportDates: string[]; // 此文章出現過的日報 report_date（回連 /digest/[date]）
}

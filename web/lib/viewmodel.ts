// Phase 5（Lead 基座）。執行期型別，= 凍結契約 specs/005-web-ui/contracts/viewmodel.ts。
// 元件只認本檔型別；資料層負責把 DB 列轉成這些型別。改動需回 Lead 改契約。

export type CatKey = "tech" | "market" | "news" | "enterprise" | "startup";

export interface DigestItem {
  catKey: CatKey;
  lead: boolean;
  title: string;
  /** articles.slug —— 內連文章頁 /articles/[slug]（Spec 006 加，加法式擴充）。 */
  articleSlug: string;
  source: string;
  url: string;
  industry: string | null;
  points: string;
  noteSlug: string | null;
}

export interface Digest {
  date: string;
  weekday: string;
  issue: number;
  summary: string;
  observation: string;
  items: DigestItem[];
}

export interface SearchRow {
  date: string;
  catKey: CatKey;
  title: string;
  /** articles.slug —— 搜尋結果直達文章頁 /articles/[slug]（Spec 006 加）。 */
  articleSlug: string;
  source: string;
  industry: string | null;
  points: string;
  noteSlug: string | null;
}

export interface Note {
  slug: string;
  title: string;
  noteDate: string;
  topic: string;
  difficulty: string;
  contentMd: string;
  sourceArticleSlug: string | null;
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

// Hand-built golden records for db tests. Imports the frozen *.expected.json
// fixtures (record-shaped) and augments with the fields the upsert layer needs.
// NO parser import.
import articleJson from "../../specs/001-db-schema/contracts/fixtures/article.expected.json" with { type: "json" };
import noteJson from "../../specs/001-db-schema/contracts/fixtures/learning-note.expected.json" with { type: "json" };
import reportJson from "../../specs/001-db-schema/contracts/fixtures/daily-report.expected.json" with { type: "json" };
import type {
  ArticleRecord,
  LearningNoteRecord,
  DailyReportRecord,
  DailyReportItem,
  IngestBundle,
} from "../../specs/001-db-schema/contracts/records.schema";

/** Fill record defaults the *.expected.json fixtures omit (rawMd, etc.). */
export const goldenArticle: ArticleRecord = {
  source: "",
  url: "",
  industry: "",
  summaryMd: "",
  contentMd: "",
  tags: [],
  createdDate: null,
  rawMd: "raw article md",
  ...(articleJson as Partial<ArticleRecord>),
} as ArticleRecord;

export const goldenNote: LearningNoteRecord = {
  topic: "",
  difficulty: "",
  sourceArticleSlug: null,
  contentMd: "",
  tags: [],
  createdDate: null,
  rawMd: "raw note md",
  ...(noteJson as Partial<LearningNoteRecord>),
} as LearningNoteRecord;

export const goldenReport: DailyReportRecord = {
  title: "",
  summaryMd: "",
  tags: [],
  createdDate: null,
  rawMd: "raw report md",
  ...(reportJson as Partial<DailyReportRecord>),
  items: ((reportJson as { items?: Partial<DailyReportItem>[] }).items ?? []).map(
    (i) => ({ blurbMd: "", ...i }) as DailyReportItem,
  ),
} as DailyReportRecord;

/**
 * Build a bundle whose articles cover every article slug referenced by the
 * golden report items plus the note's source article, so FK resolution
 * succeeds end to end.
 */
export function fullyResolvableBundle(): IngestBundle {
  const referencedSlugs = new Set<string>(
    goldenReport.items.map((i) => i.articleSlug),
  );
  if (goldenNote.sourceArticleSlug) referencedSlugs.add(goldenNote.sourceArticleSlug);
  referencedSlugs.add(goldenArticle.slug);

  const articles: ArticleRecord[] = [...referencedSlugs].map((slug) => ({
    ...goldenArticle,
    slug,
    title: `title for ${slug}`,
    category: goldenArticle.category,
  }));

  return {
    articles,
    learningNotes: [goldenNote],
    dailyReports: [goldenReport],
    warnings: [],
  };
}

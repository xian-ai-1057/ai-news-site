// Spec 007 測試 fixtures — 合法 daily bundle 產生器（8 篇、五章節齊、筆記齊）。
import type {
  DailyBundle,
  BundleArticle,
} from "../../specs/007-structured-channel/contracts/daily-bundle.schema";
import type {
  Category,
  LearningNoteRecord,
} from "../../specs/001-db-schema/contracts/records.schema";

export const RUN_DATE = "2026-07-10";

const SECTION_PLAN: Array<{ category: Category; count: number }> = [
  { category: "技術理論", count: 2 },
  { category: "市場情況", count: 1 },
  { category: "重大新聞", count: 1 },
  { category: "企業應用導入", count: 2 },
  { category: "新創公司", count: 2 },
];

export function makeArticle(i: number, category: Category): BundleArticle {
  return {
    slug: `${RUN_DATE}-測試文章-${i}`,
    title: `測試文章 ${i}`,
    articleDate: RUN_DATE,
    source: "TestWire",
    url: `https://example.com/news/${i}`,
    category,
    industry: category === "企業應用導入" ? "金融" : "",
    summaryMd: `這是第 ${i} 篇測試文章的重點摘要，長度足夠通過內容品質閘門的最小字元數檢查。`,
    contentMd: `第 ${i} 篇完整內容。` + "內容充實的段落文字。".repeat(30),
    tags: ["AI", category],
    createdDate: RUN_DATE,
    rawMd: "",
    origin: { channel: "websearch", rawItemId: null, fetchMethod: "webfetch" },
    observationsMd: "",
  };
}

export function makeNote(article: BundleArticle, i: number): LearningNoteRecord {
  return {
    slug: `${RUN_DATE}-學習-主題${i}`,
    title: `學習主題 ${i}`,
    noteDate: RUN_DATE,
    topic: `主題${i}`,
    difficulty: "入門",
    sourceArticleSlug: article.slug,
    contentMd: `> [!abstract] 一句話理解\n> 測試筆記 body。\n\n## 🎯 為什麼重要\n說明。`,
    tags: ["AI", "學習筆記"],
    createdDate: RUN_DATE,
    rawMd: "",
  };
}

/** 8 篇、五章節齊備、技術理論皆有筆記、items 一一對應的合法 bundle。 */
export function makeValidBundle(): DailyBundle {
  const articles: BundleArticle[] = [];
  let i = 0;
  for (const plan of SECTION_PLAN) {
    for (let k = 0; k < plan.count; k += 1) {
      articles.push(makeArticle(i, plan.category));
      i += 1;
    }
  }
  const techArticles = articles.filter((a) => a.category === "技術理論");
  const notes = techArticles.map((a, idx) => makeNote(a, idx));

  const positionBySection = new Map<string, number>();
  const items = articles.map((a) => {
    const position = positionBySection.get(a.category) ?? 0;
    positionBySection.set(a.category, position + 1);
    return {
      reportSlug: `AI日報-${RUN_DATE}`,
      articleSlug: a.slug,
      section: a.category,
      position,
      blurbMd: `${a.title} 的兩三句重點摘要。`,
    };
  });

  return {
    runDate: RUN_DATE,
    articles,
    learningNotes: notes,
    dailyReport: {
      slug: `AI日報-${RUN_DATE}`,
      reportDate: RUN_DATE,
      title: `AI 日報 ${RUN_DATE}`,
      summaryMd: "今日五大領域重點總結，測試用摘要文字。",
      tags: ["AI", "日報", "新聞"],
      createdDate: RUN_DATE,
      rawMd: "",
      observationsMd: "今日跨章節趨勢觀察。",
      items,
    },
    meta: { generator: "test", promptVersion: "v2-test", generatedAt: `${RUN_DATE} 10:00` },
  };
}

/** 深拷貝（測試各自變造不互染）。 */
export function cloneBundle(bundle: DailyBundle): DailyBundle {
  return structuredClone(bundle);
}

// Spec 007 §8 — record → 標準 Markdown 渲染器（範本 A/B/C 自 routine prompt 移入）。
// 方向永遠是 DB record → Markdown（raw_md 保真＋選配匯出），不再反向解析。
import type {
  LearningNoteRecord,
} from "../../specs/001-db-schema/contracts/records.schema";
import type {
  BundleArticle,
  BundleDailyReport,
  BundleMeta,
  DailyBundle,
} from "../../specs/007-structured-channel/contracts/daily-bundle.schema";

const SECTION_ORDER = [
  { emoji: "🔬", name: "技術理論" },
  { emoji: "📊", name: "市場情況" },
  { emoji: "📰", name: "重大新聞" },
  { emoji: "🏢", name: "企業應用導入" },
  { emoji: "🚀", name: "新創公司" },
] as const;

function yamlStr(value: string): string {
  return JSON.stringify(value);
}

function yamlTags(tags: string[]): string {
  if (tags.length === 0) return "tags:";
  return ["tags:", ...tags.map((t) => `  - ${t}`)].join("\n");
}

/** 每行加 "> " 前綴（callout 內文用）。 */
function calloutBody(text: string): string {
  return text
    .split("\n")
    .map((line) => (line.length > 0 ? `> ${line}` : ">"))
    .join("\n");
}

/** reportDate 的前一天（YYYY-MM-DD，日曆日；歷史日報 wikilink 用）。 */
export function previousDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** 範本 A：Article 筆記。noteSlug 僅技術理論文章提供（📓 學習筆記 wikilink）。 */
export function renderArticleMd(
  article: BundleArticle,
  opts: { noteSlug?: string } = {},
): string {
  const created = article.createdDate ?? article.articleDate;
  const lines: string[] = [
    "---",
    `title: ${yamlStr(article.title)}`,
    `date: ${article.articleDate}`,
    `source: ${yamlStr(article.source)}`,
    `url: ${yamlStr(article.url)}`,
    `category: ${article.category}`,
    `industry: ${yamlStr(article.industry)}`,
    yamlTags(article.tags),
    `created: ${created}`,
    "---",
    "",
    `# ${article.title}`,
    "",
    "> [!info] 文章資訊",
    `> - **來源**：[${article.source}](${article.url})`,
    `> - **發布日期**：${article.articleDate}`,
    `> - **分類**：${article.category}`,
    "",
    "## 📝 重點摘要",
    article.summaryMd,
    "",
    "## 📖 全文內容",
    article.contentMd,
    "",
  ];
  if (article.observationsMd.length > 0) {
    lines.push("## 💡 觀察與啟發", article.observationsMd, "");
  }
  lines.push("## 🔗 相關連結", `- [原文連結](${article.url})`, "");
  if (article.category === "技術理論" && opts.noteSlug) {
    lines.push("## 📓 學習筆記", `- [[${opts.noteSlug}|查看深入學習筆記]]`, "");
  }
  lines.push("---", `*由 Claude 自動整理於 ${created}*`, "");
  return lines.join("\n");
}

/** 範本 B：Learning Note。body 章節結構由 routine 產出（存於 contentMd）。 */
export function renderLearningNoteMd(note: LearningNoteRecord): string {
  const created = note.createdDate ?? note.noteDate;
  const body = note.contentMd.startsWith("# ")
    ? note.contentMd
    : `# ${note.title}\n\n${note.contentMd}`;
  return [
    "---",
    `title: ${yamlStr(note.title)}`,
    `date: ${note.noteDate}`,
    "type: learning-note",
    `source_article: "[[${note.sourceArticleSlug ?? ""}]]"`,
    `topic: ${yamlStr(note.topic)}`,
    `difficulty: ${note.difficulty}`,
    yamlTags(note.tags),
    `created: ${created}`,
    "---",
    "",
    body,
    "",
    "---",
    `*由 Claude 自動整理於 ${created}*`,
    "",
  ].join("\n");
}

/** 範本 C：當日日報。articles/notes 供 items 的來源列與學習筆記列查找。 */
export function renderDailyReportMd(
  report: BundleDailyReport,
  articles: BundleArticle[],
  notes: LearningNoteRecord[],
  meta: BundleMeta,
): string {
  const articleBySlug = new Map(articles.map((a) => [a.slug, a]));
  const noteByArticleSlug = new Map(
    notes.filter((n) => n.sourceArticleSlug).map((n) => [n.sourceArticleSlug!, n]),
  );
  const created = report.createdDate ?? report.reportDate;

  const lines: string[] = [
    "---",
    `title: ${yamlStr(report.title || `AI 日報 ${report.reportDate}`)}`,
    `date: ${report.reportDate}`,
    yamlTags(report.tags.length > 0 ? report.tags : ["AI", "日報", "新聞"]),
    `created: ${created}`,
    "---",
    "",
    `# AI 日報 ${report.reportDate}`,
    "",
    "> [!summary] 今日重點",
    calloutBody(report.summaryMd),
    "",
  ];

  for (const section of SECTION_ORDER) {
    lines.push(`## ${section.emoji} ${section.name}`, "");
    const items = report.items
      .filter((it) => it.section === section.name)
      .sort((a, b) => a.position - b.position);
    if (items.length === 0) {
      lines.push("（今日無重要進展）", "");
      continue;
    }
    for (const item of items) {
      const article = articleBySlug.get(item.articleSlug);
      const title = article?.title ?? item.articleSlug;
      lines.push(`### [[${item.articleSlug}|${title}]]`);
      if (article) {
        lines.push(`- **來源**：${article.source} ｜ **連結**：[原文](${article.url})`);
        if (section.name === "企業應用導入" && article.industry) {
          lines.push(`- **產業**：${article.industry}`);
        }
      }
      lines.push(`- **重點**：${item.blurbMd}`);
      if (section.name === "技術理論") {
        const note = noteByArticleSlug.get(item.articleSlug);
        if (note) {
          lines.push(`- 📓 **學習筆記**：[[${note.slug}|查看入門解說]]`);
        }
      }
      lines.push("");
    }
  }

  if (report.observationsMd.length > 0) {
    lines.push("## 📌 今日觀察", "> [!note] 趨勢觀察", calloutBody(report.observationsMd), "");
  }
  lines.push("## 📚 歷史日報", `- [[AI日報-${previousDate(report.reportDate)}]]`, "");
  const stamp = meta.generatedAt || report.reportDate;
  lines.push("---", `*本日報由 Claude 自動整理 - ${stamp}*`, "");
  return lines.join("\n");
}

/**
 * 補齊 bundle 內缺漏的 rawMd（非空者保留，idempotent）。
 * 同時為技術理論文章帶入對應學習筆記的 wikilink。
 */
export function fillRawMd(bundle: DailyBundle): DailyBundle {
  const noteByArticleSlug = new Map(
    bundle.learningNotes
      .filter((n) => n.sourceArticleSlug)
      .map((n) => [n.sourceArticleSlug!, n]),
  );
  return {
    ...bundle,
    articles: bundle.articles.map((a) =>
      a.rawMd.length > 0
        ? a
        : { ...a, rawMd: renderArticleMd(a, { noteSlug: noteByArticleSlug.get(a.slug)?.slug }) },
    ),
    learningNotes: bundle.learningNotes.map((n) =>
      n.rawMd.length > 0 ? n : { ...n, rawMd: renderLearningNoteMd(n) },
    ),
    dailyReport:
      bundle.dailyReport.rawMd.length > 0
        ? bundle.dailyReport
        : {
            ...bundle.dailyReport,
            rawMd: renderDailyReportMd(
              bundle.dailyReport,
              bundle.articles,
              bundle.learningNotes,
              bundle.meta,
            ),
          },
  };
}

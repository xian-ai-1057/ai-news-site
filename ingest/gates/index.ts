// Spec 007 §5 — 品質閘門。純函式：DB 查詢經注入的 lookup，不直接碰 client。
// 任一 fail → CLI 不寫入、exit 3。url-dedup 是唯一會「修改」bundle 的閘門
// （drop 重複文章＋其日報 items），其餘只驗不改。
import type {
  DailyBundle,
  BundleArticle,
} from "../../specs/007-structured-channel/contracts/daily-bundle.schema";
import { CATEGORIES } from "../../specs/001-db-schema/contracts/records.schema";
import { normalizeUrl } from "./url";

export type GateStatus = "pass" | "warn" | "fail";

export interface GateResult {
  gate: string;
  status: GateStatus;
  detail: string;
}

export interface GateReport {
  results: GateResult[];
  failed: boolean;
  /** drop 後的 bundle（url-dedup 可能移除文章與對應 items）。 */
  bundle: DailyBundle;
  droppedSlugs: string[];
}

/** DB 查詢注入點：回傳 url_normalized 命中的既有文章（slug + url_normalized）。 */
export type ExistingUrlLookup = (
  normalizedUrls: string[],
) => Promise<Array<{ slug: string; url_normalized: string }>>;

const BOILERPLATE_PATTERNS: RegExp[] = [
  /全文抓取失敗/,
  /access denied/i,
  /just a moment/i,
  /enable javascript/i,
  /attention required/i,
  /checking your browser/i,
  /verify you are human/i,
  /are you a robot/i,
];

const MIN_CONTENT_CHARS = 200;
const MIN_SUMMARY_CHARS = 20;
const MIN_ARTICLES = 8;
const MAX_ARTICLES = 15;
/** 雙重點章節（各 ≥2 則，warn 級）。 */
const FOCUS_SECTIONS = ["技術理論", "企業應用導入"] as const;

function pass(gate: string): GateResult {
  return { gate, status: "pass", detail: "" };
}

/** ① url-format（fail）：http(s) only。Zod .url() 已擋格式，這裡擋協定。 */
function gateUrlFormat(articles: BundleArticle[]): GateResult {
  const bad = articles.filter((a) => !/^https?:\/\//i.test(a.url)).map((a) => a.slug);
  if (bad.length === 0) return pass("url-format");
  return {
    gate: "url-format",
    status: "fail",
    detail: `非 http(s) URL：${bad.join(", ")}`,
  };
}

/**
 * ② url-dedup（warn，會 drop）：
 * (a) bundle 內互重 → 保留第一篇、drop 其餘；
 * (b) 與 DB 既有文章（slug 不同）重複 → drop。
 * 被 drop 的文章連同其日報 items 一併移除。全部被 drop 由後續 article-count 攔。
 */
async function gateUrlDedup(
  bundle: DailyBundle,
  lookup: ExistingUrlLookup,
): Promise<{ result: GateResult; bundle: DailyBundle; dropped: string[] }> {
  const bundleSlugs = new Set(bundle.articles.map((a) => a.slug));
  const normalized = new Map(bundle.articles.map((a) => [a.slug, normalizeUrl(a.url)]));

  const existing = await lookup([...new Set(normalized.values())]);
  const existingByUrl = new Map<string, string>(); // url_normalized → 既有 slug
  for (const row of existing) {
    if (!bundleSlugs.has(row.slug)) existingByUrl.set(row.url_normalized, row.slug);
  }

  const seenInBundle = new Map<string, string>(); // url_normalized → 首見 slug
  const dropped: Array<{ slug: string; reason: string }> = [];
  const kept: BundleArticle[] = [];
  for (const article of bundle.articles) {
    const url = normalized.get(article.slug)!;
    const dupOf = existingByUrl.get(url);
    if (dupOf) {
      dropped.push({ slug: article.slug, reason: `與既有文章 ${dupOf} 同 URL` });
      continue;
    }
    const firstSeen = seenInBundle.get(url);
    if (firstSeen) {
      dropped.push({ slug: article.slug, reason: `與 bundle 內 ${firstSeen} 同 URL` });
      continue;
    }
    seenInBundle.set(url, article.slug);
    kept.push(article);
  }

  if (dropped.length === 0) {
    return { result: pass("url-dedup"), bundle, dropped: [] };
  }

  const droppedSlugs = new Set(dropped.map((d) => d.slug));
  const nextBundle: DailyBundle = {
    ...bundle,
    articles: kept,
    dailyReport: {
      ...bundle.dailyReport,
      items: bundle.dailyReport.items.filter((it) => !droppedSlugs.has(it.articleSlug)),
    },
  };
  return {
    result: {
      gate: "url-dedup",
      status: "warn",
      detail: dropped.map((d) => `${d.slug}（${d.reason}）`).join("; "),
    },
    bundle: nextBundle,
    dropped: [...droppedSlugs],
  };
}

/** ③ content-quality（fail）：最小長度＋禁用樣板字串（403/驗證頁殘骸）。 */
function gateContentQuality(articles: BundleArticle[]): GateResult {
  const problems: string[] = [];
  for (const a of articles) {
    if (a.contentMd.length < MIN_CONTENT_CHARS) {
      problems.push(`${a.slug}: contentMd 僅 ${a.contentMd.length} 字元（<${MIN_CONTENT_CHARS}）`);
    }
    if (a.summaryMd.length < MIN_SUMMARY_CHARS) {
      problems.push(`${a.slug}: summaryMd 僅 ${a.summaryMd.length} 字元（<${MIN_SUMMARY_CHARS}）`);
    }
    const text = `${a.summaryMd}\n${a.contentMd}`;
    for (const pattern of BOILERPLATE_PATTERNS) {
      if (pattern.test(text)) {
        problems.push(`${a.slug}: 內容含樣板字串 ${pattern}`);
      }
    }
  }
  if (problems.length === 0) return pass("content-quality");
  return { gate: "content-quality", status: "fail", detail: problems.join("; ") };
}

/** ④ article-count（fail）：drop 後 8–15 篇。 */
function gateArticleCount(articles: BundleArticle[]): GateResult {
  const n = articles.length;
  if (n >= MIN_ARTICLES && n <= MAX_ARTICLES) return pass("article-count");
  return {
    gate: "article-count",
    status: "fail",
    detail: `drop 後共 ${n} 篇，需 ${MIN_ARTICLES}–${MAX_ARTICLES} 篇`,
  };
}

/** ⑤ report-date（fail）：reportDate === runDate 且 slug 符合慣例。 */
function gateReportDate(bundle: DailyBundle): GateResult {
  const problems: string[] = [];
  if (bundle.dailyReport.reportDate !== bundle.runDate) {
    problems.push(
      `dailyReport.reportDate=${bundle.dailyReport.reportDate} ≠ runDate=${bundle.runDate}`,
    );
  }
  const expectedSlug = `AI日報-${bundle.runDate}`;
  if (bundle.dailyReport.slug !== expectedSlug) {
    problems.push(`dailyReport.slug=${bundle.dailyReport.slug} ≠ ${expectedSlug}`);
  }
  if (problems.length === 0) return pass("report-date");
  return { gate: "report-date", status: "fail", detail: problems.join("; ") };
}

/** ⑥ section-coverage（warn）：五章節各 ≥1；技術理論、企業應用導入各 ≥2。 */
function gateSectionCoverage(bundle: DailyBundle): GateResult {
  const counts = new Map<string, number>();
  for (const item of bundle.dailyReport.items) {
    counts.set(item.section, (counts.get(item.section) ?? 0) + 1);
  }
  const problems: string[] = [];
  for (const section of CATEGORIES) {
    if ((counts.get(section) ?? 0) === 0) problems.push(`${section} 0 則`);
  }
  for (const section of FOCUS_SECTIONS) {
    const n = counts.get(section) ?? 0;
    if (n > 0 && n < 2) problems.push(`${section} 僅 ${n} 則（重點章節建議 ≥2）`);
  }
  if (problems.length === 0) return pass("section-coverage");
  return { gate: "section-coverage", status: "warn", detail: problems.join("; ") };
}

/** ⑦ note-coverage（fail）：每篇技術理論文章都有對應學習筆記。 */
function gateNoteCoverage(bundle: DailyBundle): GateResult {
  const covered = new Set(
    bundle.learningNotes.map((n) => n.sourceArticleSlug).filter(Boolean),
  );
  const missing = bundle.articles
    .filter((a) => a.category === "技術理論" && !covered.has(a.slug))
    .map((a) => a.slug);
  if (missing.length === 0) return pass("note-coverage");
  return {
    gate: "note-coverage",
    status: "fail",
    detail: `技術理論文章缺學習筆記：${missing.join(", ")}`,
  };
}

/** ⑧ item-integrity：items 指向 bundle 內文章（fail）；文章都被 items 引用（warn）。 */
function gateItemIntegrity(bundle: DailyBundle): GateResult[] {
  const articleSlugs = new Set(bundle.articles.map((a) => a.slug));
  const referenced = new Set(bundle.dailyReport.items.map((it) => it.articleSlug));

  const unknown = bundle.dailyReport.items
    .filter((it) => !articleSlugs.has(it.articleSlug))
    .map((it) => it.articleSlug);
  const unreferenced = bundle.articles
    .filter((a) => !referenced.has(a.slug))
    .map((a) => a.slug);

  const results: GateResult[] = [];
  results.push(
    unknown.length === 0
      ? pass("item-integrity")
      : {
          gate: "item-integrity",
          status: "fail",
          detail: `日報 items 指向 bundle 外的 slug：${[...new Set(unknown)].join(", ")}`,
        },
  );
  if (unreferenced.length > 0) {
    results.push({
      gate: "item-integrity",
      status: "warn",
      detail: `文章未被任何日報 item 引用：${unreferenced.join(", ")}`,
    });
  }
  return results;
}

/** 依 spec §5 順序執行全部閘門。 */
export async function runGates(
  bundle: DailyBundle,
  lookup: ExistingUrlLookup,
): Promise<GateReport> {
  const results: GateResult[] = [];

  results.push(gateUrlFormat(bundle.articles));

  const dedup = await gateUrlDedup(bundle, lookup);
  results.push(dedup.result);
  const gated = dedup.bundle;

  results.push(gateContentQuality(gated.articles));
  results.push(gateArticleCount(gated.articles));
  results.push(gateReportDate(gated));
  results.push(gateSectionCoverage(gated));
  results.push(gateNoteCoverage(gated));
  results.push(...gateItemIntegrity(gated));

  return {
    results,
    failed: results.some((r) => r.status === "fail"),
    bundle: gated,
    droppedSlugs: dedup.dropped,
  };
}

// Spec 002 — Markdown parser. Pure functions: bytes → records.
// Consumes Spec 001 contract (records.schema.ts). No network, no DB.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import {
  CATEGORIES,
  SECTION_HEADER_TO_CATEGORY,
  type Category,
  type ArticleRecord,
  type LearningNoteRecord,
  type DailyReportRecord,
  type DailyReportItem,
  type IngestBundle,
} from "../../specs/001-db-schema/contracts/records.schema.ts";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]*)?\]\]/;

/** basename without `.md` (keeps Chinese & spaces). */
function slugFromPath(filePath: string): string {
  return path.basename(filePath).replace(/\.md$/, "");
}

/**
 * gray-matter yields a JS Date for `date:` / `created:`. Normalise to
 * YYYY-MM-DD using UTC getters (no TZ shift). Strings pass through if already
 * matching; other values → null.
 */
function toDateStr(value: unknown): string | null {
  if (value instanceof Date) {
    const y = value.getUTCFullYear().toString().padStart(4, "0");
    const m = (value.getUTCMonth() + 1).toString().padStart(2, "0");
    const d = value.getUTCDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
}

/** Extract the slug (group 1, trimmed) from the first wikilink in `text`. */
function firstWikilinkSlug(text: unknown): string | null {
  if (typeof text !== "string") return null;
  const m = text.match(WIKILINK_RE);
  return m ? m[1].trim() : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

/**
 * Remove the trailing footer signature line
 * (`*由 Claude 自動整理…*` / `*本日報由 Claude…*`) and a `---` immediately
 * before it from a trimmed body.
 */
function stripFooter(body: string): string {
  const lines = body.split("\n");
  // Find last non-empty line.
  let end = lines.length - 1;
  while (end >= 0 && lines[end].trim() === "") end--;
  if (end < 0) return body.trim();

  const footerRe = /^\*(?:由 Claude 自動整理|本日報由 Claude).*\*$/;
  if (footerRe.test(lines[end].trim())) {
    let cut = end; // drop the footer line itself
    // drop blank lines before it
    let i = cut - 1;
    while (i >= 0 && lines[i].trim() === "") i--;
    // drop a `---` separator immediately before
    if (i >= 0 && lines[i].trim() === "---") {
      cut = i;
    } else {
      cut = i + 1;
    }
    return lines.slice(0, cut).join("\n").trim();
  }
  return body.trim();
}

/** Body = gray-matter `.content`, trimmed. */
function getBody(raw: string): { data: Record<string, unknown>; body: string } {
  const parsed = matter(raw);
  return {
    data: parsed.data as Record<string, unknown>,
    body: parsed.content.trim(),
  };
}

/**
 * Section text under a `## <heading>` until the next `## ` (or EOF), trimmed.
 * `heading` is matched against the text after `## ` (exact prefix match).
 */
function sectionUnderHeading(body: string, heading: string): string {
  const lines = body.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.*)$/);
    if (m && m[1].trim() === heading) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return "";
  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join("\n").trim();
}

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

export function parseArticle(filePath: string, raw: string): ArticleRecord {
  const { data, body } = getBody(raw);

  const categoryRaw = asString(data.category);
  if (!(CATEGORIES as readonly string[]).includes(categoryRaw)) {
    throw new Error(`invalid category: ${JSON.stringify(categoryRaw)}`);
  }

  return {
    slug: slugFromPath(filePath),
    title: asString(data.title),
    articleDate: toDateStr(data.date) ?? "",
    source: asString(data.source),
    url: asString(data.url),
    category: categoryRaw as Category,
    industry: asString(data.industry),
    summaryMd: sectionUnderHeading(body, "📝 重點摘要"),
    contentMd: stripFooter(body),
    tags: asStringArray(data.tags),
    createdDate: toDateStr(data.created),
    rawMd: raw,
  };
}

/**
 * 由文章 raw_md 還原「顯示用 content_md」（= 完整 body，起於 `> [!info]`）。
 *
 * 供 reconcile 修補既有 routine 文章列：這些列的 raw_md 已由 renderArticleMd 產出
 * 完整 body（含 📝 摘要 / 💡 觀察 / 📓 筆記），只是 content_md 當初僅存了全文一段。
 * 去掉 frontmatter、標題 H1 與頁尾簽名，即得與 render/markdown.ts fillDisplayContentMd
 * 相同語意的 body。無法還原（body 不以 info callout 起頭）→ 回傳 null，呼叫端略過。
 */
export function articleBodyFromRawMd(rawMd: string): string | null {
  const { body } = getBody(rawMd);
  const lines = stripFooter(body).split("\n");
  // 去掉開頭空行後、緊接的標題 H1（renderArticleMd 會加 `# title`）與其後空行。
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i += 1;
  if (i < lines.length && /^#\s+/.test(lines[i])) {
    lines.splice(i, 1);
    if (lines[i] !== undefined && lines[i].trim() === "") lines.splice(i, 1);
  }
  const result = lines.join("\n").trim();
  return result.startsWith("> [!info]") ? result : null;
}

// ---------------------------------------------------------------------------
// Learning Note
// ---------------------------------------------------------------------------

export function parseLearningNote(
  filePath: string,
  raw: string,
): LearningNoteRecord {
  const { data, body } = getBody(raw);

  return {
    slug: slugFromPath(filePath),
    title: asString(data.title),
    noteDate: toDateStr(data.date) ?? "",
    topic: asString(data.topic),
    difficulty: asString(data.difficulty),
    sourceArticleSlug: firstWikilinkSlug(data.source_article),
    contentMd: stripFooter(body),
    tags: asStringArray(data.tags),
    createdDate: toDateStr(data.created),
    rawMd: raw,
  };
}

// ---------------------------------------------------------------------------
// Daily Report
// ---------------------------------------------------------------------------

/**
 * summaryMd = the `> [!summary] 今日重點` callout: consecutive `>` lines after
 * the marker, with `> ` prefix stripped, joined by `\n`, trimmed.
 */
function dailySummary(body: string): string {
  const lines = body.split("\n");
  let i = 0;
  for (; i < lines.length; i++) {
    if (/^>\s*\[!summary\]\s*今日重點/.test(lines[i])) {
      i++;
      break;
    }
  }
  if (i >= lines.length) return "";
  const out: string[] = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (!/^>/.test(line)) break;
    out.push(line.replace(/^>\s?/, ""));
  }
  return out.join("\n").trim();
}

/** blurbMd = single line after `- **重點**：`, trimmed. */
function blurbFor(lines: string[], startIdx: number, endIdx: number): string {
  for (let i = startIdx; i < endIdx; i++) {
    const m = lines[i].match(/^- \*\*重點\*\*：\s*(.*)$/);
    if (m) return m[1].trim();
  }
  return "";
}

export function parseDailyReport(
  filePath: string,
  raw: string,
): DailyReportRecord {
  const { data, body } = getBody(raw);
  const reportSlug = slugFromPath(filePath);
  const lines = body.split("\n");

  const items: DailyReportItem[] = [];

  // Walk sections by `## <header>`.
  let i = 0;
  while (i < lines.length) {
    const headMatch = lines[i].match(/^##\s+(.*)$/);
    if (!headMatch) {
      i++;
      continue;
    }
    const header = headMatch[1].trim();
    const section = SECTION_HEADER_TO_CATEGORY[header];
    // Find section bounds (until next `## `).
    let sectionEnd = i + 1;
    while (sectionEnd < lines.length && !/^##\s/.test(lines[sectionEnd])) {
      sectionEnd++;
    }

    if (section) {
      // Within the section, each `### [[target|disp]]` is an item.
      let position = 0;
      for (let j = i + 1; j < sectionEnd; j++) {
        const h3 = lines[j].match(/^###\s+(.*)$/);
        if (!h3) continue;
        const slug = firstWikilinkSlug(h3[1]);
        if (!slug) continue;
        // item body spans until next `### ` or sectionEnd.
        let itemEnd = j + 1;
        while (itemEnd < sectionEnd && !/^###\s/.test(lines[itemEnd])) {
          itemEnd++;
        }
        items.push({
          reportSlug,
          articleSlug: slug,
          section,
          position,
          blurbMd: blurbFor(lines, j + 1, itemEnd),
        });
        position++;
      }
    }

    i = sectionEnd;
  }

  return {
    slug: reportSlug,
    reportDate: toDateStr(data.date) ?? "",
    title: asString(data.title),
    summaryMd: dailySummary(body),
    tags: asStringArray(data.tags),
    createdDate: toDateStr(data.created),
    rawMd: raw,
    items,
  };
}

// ---------------------------------------------------------------------------
// buildBundle
// ---------------------------------------------------------------------------

function isLearningNoteFile(fileName: string, data: Record<string, unknown>): boolean {
  if (fileName === "INDEX.md") return false;
  if (data.type === "index") return false;
  return data.type === "learning-note" || fileName.includes("學習-");
}

export async function buildBundle(contentDir: string): Promise<IngestBundle> {
  const articles: ArticleRecord[] = [];
  const learningNotes: LearningNoteRecord[] = [];
  const dailyReports: DailyReportRecord[] = [];
  const warnings: string[] = [];

  // Daily reports: top-level `AI日報-*.md`.
  const topEntries = fs.existsSync(contentDir) ? fs.readdirSync(contentDir) : [];
  for (const name of topEntries) {
    if (!/^AI日報-.*\.md$/.test(name)) continue;
    const full = path.join(contentDir, name);
    if (!fs.statSync(full).isFile()) continue;
    const raw = fs.readFileSync(full, "utf8");
    dailyReports.push(parseDailyReport(full, raw));
  }

  // Articles: `Articles/*.md`.
  const articlesDir = path.join(contentDir, "Articles");
  if (fs.existsSync(articlesDir)) {
    for (const name of fs.readdirSync(articlesDir)) {
      if (!name.endsWith(".md")) continue;
      const full = path.join(articlesDir, name);
      if (!fs.statSync(full).isFile()) continue;
      const raw = fs.readFileSync(full, "utf8");
      try {
        articles.push(parseArticle(full, raw));
      } catch (err) {
        warnings.push(`skipped article ${name}: ${(err as Error).message}`);
      }
    }
  }

  // Learning notes: `Learning Notes/*.md` (exclude INDEX/Interactive/non-md).
  const notesDir = path.join(contentDir, "Learning Notes");
  if (fs.existsSync(notesDir)) {
    for (const name of fs.readdirSync(notesDir)) {
      if (!name.endsWith(".md")) continue;
      const full = path.join(notesDir, name);
      if (!fs.statSync(full).isFile()) continue;
      const raw = fs.readFileSync(full, "utf8");
      const { data } = getBody(raw);
      if (!isLearningNoteFile(name, data)) continue;
      learningNotes.push(parseLearningNote(full, raw));
    }
  }

  // Unresolved wikilink warnings.
  const articleSlugs = new Set(articles.map((a) => a.slug));
  for (const report of dailyReports) {
    for (const item of report.items) {
      if (!articleSlugs.has(item.articleSlug)) {
        warnings.push(
          `unresolved wikilink: ${item.articleSlug} (from ${report.slug})`,
        );
      }
    }
  }
  for (const note of learningNotes) {
    if (note.sourceArticleSlug && !articleSlugs.has(note.sourceArticleSlug)) {
      warnings.push(
        `unresolved wikilink: ${note.sourceArticleSlug} (from ${note.slug})`,
      );
    }
  }

  return { articles, learningNotes, dailyReports, warnings };
}

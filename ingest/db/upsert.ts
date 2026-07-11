// Spec 003 — records → Supabase upsert orchestration (Spec 003 §3).
// Write order: articles → learning_notes → daily_reports → daily_report_items.
// Two-phase FK resolution via slug→id maps. Per-batch errors become warnings;
// the batch keeps going.
import type { IngestBundle } from "../../specs/001-db-schema/contracts/records.schema";
import type { DbClient } from "./client";
import {
  articleToRow,
  learningNoteToRow,
  dailyReportToRow,
  dailyReportItemToRow,
} from "./mappers";

export interface IngestSummary {
  counts: {
    articles: number;
    learningNotes: number;
    dailyReports: number;
    dailyReportItems: number;
  };
  fkResolution: {
    /** learning_notes whose source_article_slug resolved to an id. */
    notesResolved: number;
    /** learning_notes with a source_article_slug that did NOT resolve. */
    notesUnresolved: number;
    /** daily_report_items whose article_slug resolved (and were inserted). */
    itemsResolved: number;
    /** daily_report_items skipped because article_slug did not resolve. */
    itemsSkipped: number;
  };
  /** distinct article slugs referenced but not found in the articles map. */
  unresolvedSlugs: string[];
  warnings: string[];
}

interface IdRow {
  slug: string;
  id: string;
}

function buildSlugIdMap(rows: IdRow[] | null): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of rows ?? []) {
    if (row && typeof row.slug === "string" && typeof row.id === "string") {
      map.set(row.slug, row.id);
    }
  }
  return map;
}

/**
 * Idempotently write an {@link IngestBundle} to Supabase.
 *
 * @param bundle parser output (articles, learningNotes, dailyReports).
 * @param client a Supabase client (or test fake) satisfying {@link DbClient}.
 */
export async function ingestBundle(
  bundle: IngestBundle,
  client: DbClient,
): Promise<IngestSummary> {
  const warnings: string[] = [...(bundle.warnings ?? [])];
  const unresolvedSlugSet = new Set<string>();
  const summary: IngestSummary = {
    counts: { articles: 0, learningNotes: 0, dailyReports: 0, dailyReportItems: 0 },
    fkResolution: {
      notesResolved: 0,
      notesUnresolved: 0,
      itemsResolved: 0,
      itemsSkipped: 0,
    },
    unresolvedSlugs: [],
    warnings,
  };

  // ── ① articles ──────────────────────────────────────────────────────
  let articleMap = new Map<string, string>();
  if (bundle.articles.length > 0) {
    const rows = bundle.articles.map(articleToRow);
    const { data, error } = await client
      .from("articles")
      .upsert(rows, { onConflict: "slug" })
      .select("slug,id");
    if (error) {
      warnings.push(`[articles] upsert failed: ${error.message}`);
    } else {
      summary.counts.articles = rows.length;
      articleMap = buildSlugIdMap(data as IdRow[] | null);
    }
  }

  // ── ② learning_notes (resolve source_article_id) ───────────────────
  if (bundle.learningNotes.length > 0) {
    const rows = bundle.learningNotes.map((note) => {
      const slug = note.sourceArticleSlug;
      const resolvedId = slug ? articleMap.get(slug) ?? null : null;
      if (slug) {
        if (resolvedId) {
          summary.fkResolution.notesResolved += 1;
        } else {
          summary.fkResolution.notesUnresolved += 1;
          unresolvedSlugSet.add(slug);
          warnings.push(
            `[learning_notes] ${note.slug}: source_article_slug "${slug}" unresolved; source_article_id=null`,
          );
        }
      }
      return learningNoteToRow(note, resolvedId);
    });
    const { error } = await client
      .from("learning_notes")
      .upsert(rows, { onConflict: "slug" })
      .select("slug,id");
    if (error) {
      warnings.push(`[learning_notes] upsert failed: ${error.message}`);
    } else {
      summary.counts.learningNotes = rows.length;
    }
  }

  // ── ③ daily_reports ────────────────────────────────────────────────
  let reportMap = new Map<string, string>();
  if (bundle.dailyReports.length > 0) {
    const rows = bundle.dailyReports.map(dailyReportToRow);
    const { data, error } = await client
      .from("daily_reports")
      .upsert(rows, { onConflict: "slug" })
      .select("slug,id");
    if (error) {
      warnings.push(`[daily_reports] upsert failed: ${error.message}`);
    } else {
      summary.counts.dailyReports = rows.length;
      reportMap = buildSlugIdMap(data as IdRow[] | null);
    }
  }

  // ── ④ daily_report_items (delete-then-insert per report) ───────────
  // Destructive guard (Spec 003 §3, §8 AC8): with no articles in the bundle the
  // articleMap is empty, so every item FK is unresolvable and the per-report
  // delete-then-insert below would only ever DELETE — silently wiping the join
  // table. (History: a non-recursive `ingest:day -- content/` produced a
  // zero-article bundle and emptied daily_report_items 231 → 0.) Skip Phase ④.
  if (bundle.articles.length === 0 && bundle.dailyReports.length > 0) {
    warnings.push(
      `[daily_report_items] bundle has 0 articles; skipped delete-then-insert for ` +
        `${bundle.dailyReports.length} report(s) to avoid wiping the join table`,
    );
    summary.unresolvedSlugs = [...unresolvedSlugSet].sort();
    return summary;
  }

  for (const report of bundle.dailyReports) {
    const reportId = reportMap.get(report.slug);
    if (!reportId) {
      warnings.push(
        `[daily_report_items] report "${report.slug}" has no id; skipping its ${report.items.length} items`,
      );
      continue;
    }

    // Idempotency: clear existing items for this report before re-inserting.
    const del = await client
      .from("daily_report_items")
      .delete()
      .eq("daily_report_id", reportId);
    if (del.error) {
      warnings.push(
        `[daily_report_items] delete for "${report.slug}" failed: ${del.error.message}`,
      );
      continue;
    }

    const itemRows = [];
    for (const item of report.items) {
      const articleId = articleMap.get(item.articleSlug);
      if (!articleId) {
        summary.fkResolution.itemsSkipped += 1;
        unresolvedSlugSet.add(item.articleSlug);
        warnings.push(
          `[daily_report_items] ${report.slug}: article "${item.articleSlug}" unresolved; item skipped`,
        );
        continue;
      }
      itemRows.push(dailyReportItemToRow(item, reportId, articleId));
    }

    if (itemRows.length === 0) continue;

    const ins = await client.from("daily_report_items").insert(itemRows);
    if (ins.error) {
      warnings.push(
        `[daily_report_items] insert for "${report.slug}" failed: ${ins.error.message}`,
      );
      continue;
    }
    summary.fkResolution.itemsResolved += itemRows.length;
    summary.counts.dailyReportItems += itemRows.length;
  }

  summary.unresolvedSlugs = [...unresolvedSlugSet].sort();
  return summary;
}

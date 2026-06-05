#!/usr/bin/env tsx
// Spec 003 — ingest CLI.
//   backfill            → buildBundle('content') then ingestBundle
//   day <dir|files...>  → parse the given paths then ingestBundle
// Prints the summary; exits non-zero if any warnings.
import { statSync, readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { createDbClient, type DbClient } from "../db/client";
import { ingestBundle, type IngestSummary } from "../db/upsert";
import type {
  IngestBundle,
  ArticleRecord,
  LearningNoteRecord,
  DailyReportRecord,
} from "../../specs/001-db-schema/contracts/records.schema";
// Parser interface (Spec 002). May not exist while this is developed in isolation;
// the import resolves at runtime when the CLI is actually invoked.
import {
  buildBundle,
  parseArticle,
  parseLearningNote,
  parseDailyReport,
} from "../parser/index";

const CONTENT_DIR = "content";

function emptyBundle(): IngestBundle {
  return { articles: [], learningNotes: [], dailyReports: [], warnings: [] };
}

/** Expand a list of dir/file args into concrete .md file paths. */
function collectMarkdownFiles(paths: string[]): string[] {
  const files: string[] = [];
  for (const p of paths) {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const entry of readdirSync(p)) {
        if (entry.endsWith(".md")) files.push(join(p, entry));
      }
    } else if (p.endsWith(".md")) {
      files.push(p);
    }
  }
  return files;
}

/** Route a markdown file to the right parser by filename convention. */
function parseFileIntoBundle(file: string, bundle: IngestBundle): void {
  const name = basename(file);
  const raw = readFileSync(file, "utf8");
  if (name.startsWith("AI日報-")) {
    bundle.dailyReports.push(parseDailyReport(file, raw) as DailyReportRecord);
  } else if (name.includes("學習")) {
    bundle.learningNotes.push(parseLearningNote(file, raw) as LearningNoteRecord);
  } else {
    bundle.articles.push(parseArticle(file, raw) as ArticleRecord);
  }
}

function buildDayBundle(paths: string[]): IngestBundle {
  const bundle = emptyBundle();
  const files = collectMarkdownFiles(paths);
  for (const file of files) {
    parseFileIntoBundle(file, bundle);
  }
  return bundle;
}

function printSummary(summary: IngestSummary): void {
  const { counts, fkResolution, unresolvedSlugs, warnings } = summary;
  console.log("\n=== Ingest summary ===");
  console.log(
    `articles=${counts.articles} learning_notes=${counts.learningNotes} ` +
      `daily_reports=${counts.dailyReports} daily_report_items=${counts.dailyReportItems}`,
  );
  console.log(
    `FK: notes resolved=${fkResolution.notesResolved} unresolved=${fkResolution.notesUnresolved}; ` +
      `items resolved=${fkResolution.itemsResolved} skipped=${fkResolution.itemsSkipped}`,
  );
  if (unresolvedSlugs.length > 0) {
    console.log(`Unresolved article slugs (${unresolvedSlugs.length}):`);
    for (const slug of unresolvedSlugs) console.log(`  - ${slug}`);
  }
  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) console.log(`  ! ${w}`);
  }
}

async function main(): Promise<number> {
  const [cmd, ...rest] = process.argv.slice(2);
  const client = createDbClient() as unknown as DbClient;

  let bundle: IngestBundle;
  if (cmd === "backfill") {
    bundle = await buildBundle(CONTENT_DIR);
  } else if (cmd === "day") {
    if (rest.length === 0) {
      console.error("Usage: ingest day <dir|file.md ...>");
      return 2;
    }
    bundle = await buildDayBundle(rest);
  } else {
    console.error(`Unknown command "${cmd ?? ""}". Use: backfill | day <paths...>`);
    return 2;
  }

  const summary = await ingestBundle(bundle, client);
  printSummary(summary);
  return summary.warnings.length > 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err instanceof Error ? err.stack ?? err.message : String(err));
    process.exit(1);
  });

#!/usr/bin/env tsx
// Spec 003 + 007 — ingest CLI.
//   json <bundle.json> [--dry-run] → 驗證 + 閘門 + 當日 upsert（日常通道，Spec 007）
//   backfill --force-seed          → 種子復原：buildBundle('content') 整批 upsert
//   day <dir|files...>             → parse the given paths then ingestBundle
// Exit codes: 0 成功 / 1 有 warnings / 2 用法錯誤 / 3 驗證或閘門失敗。
import { statSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createDbClient, type DbClient } from "../db/client";
import { ingestBundle, type IngestSummary } from "../db/upsert";
import type {
  IngestBundle,
  ArticleRecord,
  LearningNoteRecord,
  DailyReportRecord,
} from "../../specs/001-db-schema/contracts/records.schema";
import { DailyBundleSchema } from "../../specs/007-structured-channel/contracts/daily-bundle.schema";
import { runGates, type ExistingUrlLookup } from "../gates/index";
import { fillRawMd, fillDisplayContentMd } from "../render/markdown";
import { startRun, gateResultsJson } from "../db/runs";
import { formatCandidates, type CandidateRow } from "./candidates";
import { parseUrlsInput, dedupeHttpUrls } from "./fulltext";
// Parser interface (Spec 002). May not exist while this is developed in isolation;
// the import resolves at runtime when the CLI is actually invoked.
import {
  buildBundle,
  parseArticle,
  parseLearningNote,
  parseDailyReport,
  articleBodyFromRawMd,
} from "../parser/index";

const CONTENT_DIR = "content";
const SEED_FROZEN_AT = "2026-06-07";

function emptyBundle(): IngestBundle {
  return { articles: [], learningNotes: [], dailyReports: [], warnings: [] };
}

/**
 * Expand a list of dir/file args into concrete .md file paths.
 *
 * Directory args are scanned **recursively** (`readdirSync(dir, { recursive: true })`
 * then filter `.md`) so that `ingest:day -- content/` picks up nested
 * `Articles/` and `Learning Notes/` files — the same set `backfill` collects.
 * A non-recursive scan here once produced a zero-article bundle that wiped
 * daily_report_items (Spec 003 §3). Non-directory args must end in `.md`.
 */
export function collectMarkdownFiles(paths: string[]): string[] {
  const files: string[] = [];
  for (const p of paths) {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const entry of readdirSync(p, { recursive: true })) {
        const rel = entry.toString();
        if (rel.endsWith(".md")) files.push(join(p, rel));
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

/** Spec 007 — 閘門去重查詢：url_normalized 命中的既有文章。 */
function makeExistingUrlLookup(client: DbClient): ExistingUrlLookup {
  return async (normalizedUrls) => {
    const hits: Array<{ slug: string; url_normalized: string }> = [];
    for (let i = 0; i < normalizedUrls.length; i += 100) {
      const chunk = normalizedUrls.slice(i, i + 100);
      const { data, error } = await client
        .from("articles")
        .select("slug,url_normalized")
        .in("url_normalized", chunk);
      if (error) {
        // fail closed：查不到既有 URL 就不能保證去重，寧可擋下。
        throw new Error(`url-dedup lookup failed: ${error.message}`);
      }
      hits.push(...((data ?? []) as Array<{ slug: string; url_normalized: string }>));
    }
    return hits;
  };
}

/**
 * Spec 008 §6 — 入庫成功後回寫 raw_items 候選狀態。
 * 回寫失敗降級為 warning，不影響 ingest 成敗。
 */
async function markRawItemsCurated(
  articles: Array<{ slug: string; origin: { channel: string; rawItemId: string | null } }>,
  client: DbClient,
  warnings: string[],
): Promise<void> {
  const curated = articles.filter(
    (a) => a.origin.channel === "raw-item" && a.origin.rawItemId,
  );
  if (curated.length === 0) return;
  try {
    const { data, error } = await client
      .from("articles")
      .select("slug,id")
      .in("slug", curated.map((a) => a.slug));
    if (error) throw new Error(error.message);
    const idBySlug = new Map(
      ((data ?? []) as Array<{ slug: string; id: string }>).map((r) => [r.slug, r.id]),
    );
    for (const article of curated) {
      const { error: updateError } = await client
        .from("raw_items")
        .update({
          status: "curated",
          curated_article_id: idBySlug.get(article.slug) ?? null,
        })
        .eq("id", article.origin.rawItemId);
      if (updateError) {
        warnings.push(`[raw_items] ${article.slug} 回寫 curated 失敗: ${updateError.message}`);
      }
    }
  } catch (err) {
    warnings.push(
      `[raw_items] curated 回寫失敗: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/** Spec 008 §6 — `candidates [--hours 36]`：印候選池供 routine 選材。 */
export async function runCandidatesCommand(args: string[]): Promise<number> {
  const hoursArg = args.find((a) => /^\d+$/.test(a)) ?? "36";
  const hours = Number(hoursArg);
  const since = new Date(Date.now() - hours * 3_600_000).toISOString();
  // candidates 需要 gte/order 等查詢面，直接用完整 Supabase client。
  const client = createDbClient();
  const { data, error } = await client
    .from("raw_items")
    .select("id,url,title,summary,published_at,category_hint,sources(name)")
    .eq("status", "new")
    .gte("fetched_at", since)
    .order("published_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error(`candidates 查詢失敗：${error.message}`);
    return 3;
  }
  const grouped = formatCandidates((data ?? []) as unknown as CandidateRow[]);
  console.log(
    "CANDIDATES_JSON: " +
      JSON.stringify({ sinceHours: hours, total: (data ?? []).length, groups: grouped }),
  );
  return 0;
}

/**
 * Spec 010 §4 — 入庫成功後 fire-and-forget 觸發 embed-articles Edge Function。
 * 失敗僅 console.warn（cron 每小時掃尾會補），不影響 exit code。
 */
async function triggerEmbedFunction(): Promise<void> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return;
  try {
    const res = await fetch(`${base}/functions/v1/embed-articles`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.warn(`[embed] 觸發失敗 HTTP ${res.status}（cron 每小時會補跑）`);
    }
  } catch (err) {
    console.warn(
      `[embed] 觸發失敗: ${err instanceof Error ? err.message : String(err)}（cron 每小時會補跑）`,
    );
  }
}

/**
 * Spec 011 §4 — `fulltext <urls.json | url...>` 子命令。
 * 呼叫 extract-fulltext Edge Function 伺服端抽全文，印 FULLTEXT_JSON 供 routine 消費。
 * routine 只需連 Supabase，不必自己抓新聞網站。
 */
export async function runFulltextCommand(args: string[]): Promise<number> {
  const fileArg = args.find(
    (a) => !a.startsWith("--") && !/^https?:\/\//i.test(a) && (a.endsWith(".json") || a.endsWith(".txt")),
  );
  let urls: string[];
  try {
    urls = fileArg
      ? parseUrlsInput(readFileSync(fileArg, "utf8"))
      : dedupeHttpUrls(args.filter((a) => !a.startsWith("--")));
  } catch (err) {
    console.error(`無法讀取 URL 清單：${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }
  if (urls.length === 0) {
    console.error("Usage: ingest fulltext <urls.json | url ...>");
    return 2;
  }

  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) {
    console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in environment.");
    return 2;
  }
  try {
    const res = await fetch(`${base}/functions/v1/extract-fulltext`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ urls }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) {
      console.error(`extract-fulltext HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return 3;
    }
    console.log("FULLTEXT_JSON: " + JSON.stringify(await res.json()));
    return 0;
  } catch (err) {
    console.error(`extract-fulltext 呼叫失敗：${err instanceof Error ? err.message : String(err)}`);
    return 3;
  }
}

const INFO_CALLOUT_MARK = "> [!info] 文章資訊";

/**
 * 一次性維護：把既有 routine（JSON 通道）文章列的 content_md 由「僅全文一段」
 * 補成「完整 body」（info + 摘要 + 全文 + 觀察 + 連結 + 筆記），與種子通道一致。
 *
 * 資料來源全部取自 DB 既有 raw_md（已含完整 body，含摘要與觀察），不需重跑 routine、
 * 不需外部網路。dry-run 為預設；`--apply` 才實際 UPDATE content_md。冪等：已是完整
 * body 的列（種子、或已修補過）會被略過。
 */
export async function runReconcileContentMdCommand(args: string[]): Promise<number> {
  const apply = args.includes("--apply");
  const client = createDbClient();

  // 分頁抓全部文章（slug + content_md + raw_md）。
  const rows: Array<{ slug: string; content_md: string | null; raw_md: string | null }> = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("articles")
      .select("slug,content_md,raw_md")
      .order("slug", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) {
      console.error(`reconcile 讀取 articles 失敗：${error.message}`);
      return 3;
    }
    const batch = (data ?? []) as typeof rows;
    rows.push(...batch);
    if (batch.length < pageSize) break;
  }

  const toFix: Array<{ slug: string; next: string; prevLen: number }> = [];
  const unfixable: string[] = [];
  let alreadyFull = 0;
  for (const row of rows) {
    const content = row.content_md ?? "";
    // 已是完整 body（種子通道，或先前已修補）→ 略過。
    // 用 includes 而非 startsWith：部分種子的 content_md 在 info callout 前still
    // 保留一行 H1 主張標題（例：`# 主張：…\n> [!info] 文章資訊`），只要正文任一處
    // 含 callout 即代表已是完整 body，不該被「還原」而砍掉標題。routine 通道漏補的
    // 列則是純全文段、不含 callout，才需回填。
    if (content.includes(INFO_CALLOUT_MARK)) {
      alreadyFull += 1;
      continue;
    }
    const next = articleBodyFromRawMd(row.raw_md ?? "");
    if (next === null) {
      unfixable.push(row.slug); // raw_md 無完整 body，無法還原。
      continue;
    }
    if (next === content) {
      alreadyFull += 1;
      continue;
    }
    toFix.push({ slug: row.slug, next, prevLen: content.length });
  }

  console.log(
    "\n=== reconcile content_md ===\n" +
      `文章總數=${rows.length} 已是完整 body（略過）=${alreadyFull} ` +
      `待修補=${toFix.length} 無法還原（raw_md 缺完整 body）=${unfixable.length}`,
  );
  for (const f of toFix.slice(0, 20)) {
    console.log(`  fix ${f.slug}: content_md ${f.prevLen} → ${f.next.length} 字元`);
  }
  if (toFix.length > 20) console.log(`  …另 ${toFix.length - 20} 篇`);
  if (unfixable.length > 0) {
    console.log("無法還原（略過，需重跑當天 routine 才會補內容）：");
    for (const s of unfixable) console.log(`  - ${s}`);
  }

  if (!apply) {
    console.log("\n[dry-run] 未寫入任何資料。確認無誤後加 --apply 實際更新。");
    return 0;
  }

  let ok = 0;
  const failed: string[] = [];
  for (const f of toFix) {
    const { error } = await client
      .from("articles")
      .update({ content_md: f.next })
      .eq("slug", f.slug);
    if (error) failed.push(`${f.slug}: ${error.message}`);
    else ok += 1;
  }
  console.log(`\n[apply] 已更新 ${ok}/${toFix.length} 篇 content_md。`);
  console.log("（前端 ISR 1 小時內自動反映；要即時可另觸發 Vercel deploy hook。）");
  if (failed.length > 0) {
    console.log(`更新失敗 ${failed.length} 篇：`);
    for (const m of failed) console.log(`  ! ${m}`);
    return 1;
  }
  return 0;
}

/** Spec 007 — `json <bundle.json> [--dry-run]` 子命令。 */
export async function runJsonCommand(
  args: string[],
  client: DbClient,
  opts: { triggerEmbed?: boolean } = {},
): Promise<number> {
  const dryRun = args.includes("--dry-run");
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("Usage: ingest json <bundle.json> [--dry-run]");
    return 2;
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    console.error(`無法讀取/解析 JSON：${err instanceof Error ? err.message : String(err)}`);
    return 3;
  }

  const parsed = DailyBundleSchema.safeParse(parsedJson);
  if (!parsed.success) {
    console.log(
      "VALIDATION_ERRORS_JSON: " +
        JSON.stringify(
          parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        ),
    );
    return 3;
  }

  const run = dryRun
    ? null
    : await startRun(client, {
        runDate: parsed.data.runDate,
        channel: "json",
        triggerSrc: process.env.INGEST_TRIGGER_SRC ?? "manual",
      });

  try {
    await run?.setPhase("validated");
    const filled = fillRawMd(parsed.data);
    const report = await runGates(filled, makeExistingUrlLookup(client));
    console.log(
      "GATE_REPORT_JSON: " +
        JSON.stringify({
          failed: report.failed,
          results: report.results,
          droppedSlugs: report.droppedSlugs,
        }),
    );
    await run?.setPhase("gated", { gate_results: gateResultsJson(report.results) });
    if (report.failed) {
      await run?.fail("gate failure（見 gate_results）");
      return 3;
    }

    // content_md 顯示欄位：把每篇文章的 contentMd（全文段）升級為完整 body，
    // 與種子（parser）通道一致 —— 文章頁只渲染 content_md，故此步驟讓 routine
    // 產出的文章頁恢復摘要／觀察等結構（見 render/markdown.ts fillDisplayContentMd）。
    const displayBundle = fillDisplayContentMd(report.bundle);
    const dayBundle: IngestBundle = {
      articles: displayBundle.articles,
      learningNotes: displayBundle.learningNotes,
      dailyReports: [displayBundle.dailyReport],
      warnings: [],
    };

    if (dryRun) {
      console.log(
        `[dry-run] 將寫入：articles=${dayBundle.articles.length} ` +
          `learning_notes=${dayBundle.learningNotes.length} daily_reports=1 ` +
          `items=${report.bundle.dailyReport.items.length}（未執行任何寫入）`,
      );
      return 0;
    }

    const summary = await ingestBundle(dayBundle, client);
    await run?.setPhase("written");
    await markRawItemsCurated(report.bundle.articles, client, summary.warnings);
    printSummary(summary);
    await run?.complete(summary.counts, summary.warnings);
    if (opts.triggerEmbed) await triggerEmbedFunction();
    return summary.warnings.length > 0 ? 1 : 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await run?.fail(message);
    console.error(message);
    return 3;
  }
}

async function main(): Promise<number> {
  const [cmd, ...rest] = process.argv.slice(2);

  if (cmd === "json") {
    const client = createDbClient() as unknown as DbClient;
    return runJsonCommand(rest, client, { triggerEmbed: true });
  }
  if (cmd === "candidates") {
    return runCandidatesCommand(rest);
  }
  if (cmd === "fulltext") {
    return runFulltextCommand(rest);
  }
  if (cmd === "reconcile-content-md") {
    return runReconcileContentMdCommand(rest);
  }

  let bundle: IngestBundle;
  if (cmd === "backfill") {
    // Spec 007 §7 — backfill 降級為種子復原工具。routine 已不寫 content/，
    // DB 領先種子後重跑會以舊 Markdown 覆蓋較新資料，故需明確旗標。
    if (!rest.includes("--force-seed")) {
      console.error(
        [
          "⛔ backfill 已降級為「種子復原工具」，日常入庫請改用：npm run ingest:json -- <bundle.json>",
          `   content/ 種子凍結於 ${SEED_FROZEN_AT}；整批 upsert 會以舊 Markdown 覆蓋 DB 中較新的列。`,
          "   確定要從種子復原，請帶旗標：ingest backfill --force-seed",
        ].join("\n"),
      );
      return 2;
    }
    console.error(
      `⚠️  種子復原模式：即將把 content/（凍結於 ${SEED_FROZEN_AT}）整批 upsert 回 Supabase，` +
        `可能覆蓋較新資料。`,
    );
    bundle = await buildBundle(CONTENT_DIR);
  } else if (cmd === "day") {
    if (rest.length === 0) {
      console.error("Usage: ingest day <dir|file.md ...>");
      return 2;
    }
    bundle = await buildDayBundle(rest);
  } else {
    console.error(
      `Unknown command "${cmd ?? ""}". Use: json <bundle.json> [--dry-run] | candidates [--hours N] | fulltext <urls.json|url...> | reconcile-content-md [--apply] | backfill --force-seed | day <paths...>`,
    );
    return 2;
  }

  const client = createDbClient() as unknown as DbClient;
  const summary = await ingestBundle(bundle, client);
  printSummary(summary);
  return summary.warnings.length > 0 ? 1 : 0;
}

/** True when this module is the process entry point (not imported by a test). */
function isMainModule(): boolean {
  const argv1 = process.argv[1];
  if (!argv1) return false;
  try {
    return realpathSync(argv1) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isMainModule()) {
  // 不可直接 process.exit()：大輸出（如 candidates 的 CANDIDATES_JSON）會在
  // stdout 未 flush 完時被截斷在 64KB。設 exitCode 讓行程自然結束；
  // 若有殘留 handle 撐住 event loop，2 秒後強制收尾。
  main()
    .then((code) => {
      process.exitCode = code;
      setTimeout(() => process.exit(code), 2_000).unref();
    })
    .catch((err) => {
      console.error(err instanceof Error ? err.stack ?? err.message : String(err));
      process.exitCode = 1;
      setTimeout(() => process.exit(1), 2_000).unref();
    });
}

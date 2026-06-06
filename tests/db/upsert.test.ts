// ingestBundle orchestration tests against a fake client. NO live DB, NO parser.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ingestBundle } from "../../ingest/db/upsert";
import { FakeClient, type RecordedCall } from "./fake-client";
import {
  fullyResolvableBundle,
  goldenNote,
  goldenReport,
  goldenArticle,
} from "./fixtures";
import type { IngestBundle } from "../../specs/001-db-schema/contracts/records.schema";

function tableOps(calls: RecordedCall[]): string[] {
  return calls.map((c) => `${c.table}:${c.op}`);
}

test("write order is articles → learning_notes → daily_reports → daily_report_items", async () => {
  const client = new FakeClient();
  await ingestBundle(fullyResolvableBundle(), client);
  const ops = tableOps(client.calls);
  const idxArticles = ops.indexOf("articles:upsert");
  const idxNotes = ops.indexOf("learning_notes:upsert");
  const idxReports = ops.indexOf("daily_reports:upsert");
  const idxItems = ops.findIndex((o) => o.startsWith("daily_report_items:"));
  assert.ok(idxArticles >= 0 && idxNotes >= 0 && idxReports >= 0 && idxItems >= 0);
  assert.ok(idxArticles < idxNotes, "articles before learning_notes");
  assert.ok(idxNotes < idxReports, "learning_notes before daily_reports");
  assert.ok(idxReports < idxItems, "daily_reports before daily_report_items");
});

test("conflict keys are slug for the three slug tables", async () => {
  const client = new FakeClient();
  await ingestBundle(fullyResolvableBundle(), client);
  for (const table of ["articles", "learning_notes", "daily_reports"]) {
    const call = client.calls.find((c) => c.table === table && c.op === "upsert");
    assert.ok(call, `${table} upsert recorded`);
    assert.equal(call!.onConflict, "slug", `${table} onConflict=slug`);
    assert.equal(call!.selected, true, `${table} upsert followed by select`);
  }
});

test("daily_report_items are delete-then-insert per report (idempotency shape)", async () => {
  const client = new FakeClient();
  await ingestBundle(fullyResolvableBundle(), client);
  const itemCalls = client.calls.filter((c) => c.table === "daily_report_items");
  assert.equal(itemCalls[0].op, "delete", "delete precedes insert");
  assert.equal(itemCalls[0].eq?.column, "daily_report_id");
  assert.ok(itemCalls.some((c) => c.op === "insert"), "insert happens");
  const insertIdx = itemCalls.findIndex((c) => c.op === "insert");
  assert.ok(insertIdx > 0, "insert after delete");
});

test("source_article_id resolved from prior article select", async () => {
  const client = new FakeClient();
  const summary = await ingestBundle(fullyResolvableBundle(), client);
  const noteUpsert = client.calls.find(
    (c) => c.table === "learning_notes" && c.op === "upsert",
  );
  const row = (noteUpsert!.rows as Array<Record<string, unknown>>)[0];
  assert.ok(
    typeof row.source_article_id === "string" &&
      (row.source_article_id as string).includes(goldenNote.sourceArticleSlug!),
    "source_article_id is the synthetic uuid for the source article slug",
  );
  assert.equal(row.source_article_slug, goldenNote.sourceArticleSlug);
  assert.equal(summary.fkResolution.notesResolved, 1);
  assert.equal(summary.fkResolution.notesUnresolved, 0);
});

test("item article_id resolved from prior article select", async () => {
  const client = new FakeClient();
  const summary = await ingestBundle(fullyResolvableBundle(), client);
  const insert = client.calls.find(
    (c) => c.table === "daily_report_items" && c.op === "insert",
  );
  const rows = insert!.rows as Array<Record<string, unknown>>;
  assert.equal(rows.length, goldenReport.items.length, "all items inserted");
  for (const r of rows) {
    assert.ok(typeof r.article_id === "string" && r.article_id, "article_id set");
    assert.ok(typeof r.daily_report_id === "string", "daily_report_id set");
  }
  assert.equal(summary.fkResolution.itemsResolved, goldenReport.items.length);
  assert.equal(summary.counts.dailyReportItems, goldenReport.items.length);
});

test("unresolved article slug → item skipped + warning + summary", async () => {
  // Bundle with a report item pointing at a non-existent article slug,
  // and only ONE article present (the source article for the note).
  const bundle: IngestBundle = {
    articles: [{ ...goldenArticle, slug: "present-article" }],
    learningNotes: [],
    dailyReports: [
      {
        ...goldenReport,
        items: [
          {
            reportSlug: goldenReport.slug,
            articleSlug: "present-article",
            section: goldenReport.items[0].section,
            position: 0,
            blurbMd: "ok",
          },
          {
            reportSlug: goldenReport.slug,
            articleSlug: "missing-article",
            section: goldenReport.items[0].section,
            position: 1,
            blurbMd: "skip me",
          },
        ],
      },
    ],
    warnings: [],
  };
  const client = new FakeClient();
  const summary = await ingestBundle(bundle, client);

  const insert = client.calls.find(
    (c) => c.table === "daily_report_items" && c.op === "insert",
  );
  const rows = insert!.rows as Array<Record<string, unknown>>;
  assert.equal(rows.length, 1, "only the resolvable item inserted");
  assert.equal(summary.fkResolution.itemsSkipped, 1);
  assert.equal(summary.fkResolution.itemsResolved, 1);
  assert.ok(summary.unresolvedSlugs.includes("missing-article"));
  assert.ok(
    summary.warnings.some((w) => w.includes("missing-article") && w.includes("skipped")),
    "warning recorded for skipped item",
  );
  // Batch did not throw — summary returned normally.
  assert.equal(summary.counts.dailyReports, 1);
});

test("per-batch upsert error → warning, batch continues", async () => {
  const client = new FakeClient({
    errorOn: [{ table: "articles", op: "upsert", message: "boom" }],
  });
  const summary = await ingestBundle(fullyResolvableBundle(), client);
  assert.ok(
    summary.warnings.some((w) => w.includes("[articles]") && w.includes("boom")),
    "article upsert error captured as warning",
  );
  // articles count stays 0, but later batches still ran.
  assert.equal(summary.counts.articles, 0);
  assert.ok(
    client.calls.some((c) => c.table === "learning_notes"),
    "learning_notes batch still attempted after article failure",
  );
  // With no article map, the note source FK is unresolved (null), not a throw.
  assert.equal(summary.fkResolution.notesUnresolved, 1);
});

test("idempotency shape: re-running issues the same upserts", async () => {
  const bundle = fullyResolvableBundle();
  const c1 = new FakeClient();
  const c2 = new FakeClient();
  await ingestBundle(bundle, c1);
  await ingestBundle(bundle, c2);

  const sig = (c: FakeClient) =>
    c.calls.map((x) => `${x.table}:${x.op}:${x.onConflict ?? ""}:${(x.rows ?? []).length}`);
  assert.deepEqual(sig(c1), sig(c2), "same call signature on re-run");
});

test("counts reflect rows written", async () => {
  const bundle = fullyResolvableBundle();
  const client = new FakeClient();
  const summary = await ingestBundle(bundle, client);
  assert.equal(summary.counts.articles, bundle.articles.length);
  assert.equal(summary.counts.learningNotes, bundle.learningNotes.length);
  assert.equal(summary.counts.dailyReports, bundle.dailyReports.length);
});

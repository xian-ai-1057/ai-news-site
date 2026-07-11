// Spec 007 §7 / AC4–AC6 — `ingest json` 子命令：dry-run 零寫入、run 生命週期、gate fail 不寫入。
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runJsonCommand } from "../../ingest/cli/index";
import { FakeClient } from "../db/fake-client";
import { makeValidBundle, cloneBundle } from "../gates/bundle-fixtures";
import type { DailyBundle } from "../../specs/007-structured-channel/contracts/daily-bundle.schema";

const WRITE_OPS = new Set(["upsert", "insert", "delete", "update"]);

function writeBundleFile(bundle: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), "ai-news-json-"));
  const file = join(dir, "daily-bundle.json");
  writeFileSync(file, JSON.stringify(bundle), "utf8");
  return file;
}

test("dry-run：exit 0 且無任何 DB 寫入呼叫（AC4）", async () => {
  const client = new FakeClient();
  const code = await runJsonCommand([writeBundleFile(makeValidBundle()), "--dry-run"], client);
  assert.equal(code, 0);
  const writes = client.calls.filter((c) => WRITE_OPS.has(c.op));
  assert.deepEqual(writes, [], "dry-run 不得有 upsert/insert/delete/update");
});

test("Zod 驗證失敗（articles 為空）：exit 3、完全不碰 DB（AC1/AC5）", async () => {
  const bundle = cloneBundle(makeValidBundle()) as DailyBundle & { articles: unknown[] };
  bundle.articles = [];
  const client = new FakeClient();
  const code = await runJsonCommand([writeBundleFile(bundle)], client);
  assert.equal(code, 3);
  assert.deepEqual(client.calls, []);
});

test("非法 JSON：exit 3", async () => {
  const dir = mkdtempSync(join(tmpdir(), "ai-news-json-"));
  const file = join(dir, "broken.json");
  writeFileSync(file, "{not json", "utf8");
  const code = await runJsonCommand([file], new FakeClient());
  assert.equal(code, 3);
});

test("成功路徑：run insert → phase 推進 → completed，內容寫入齊全（AC5）", async () => {
  const client = new FakeClient();
  const code = await runJsonCommand([writeBundleFile(makeValidBundle())], client);
  assert.equal(code, 0);

  const runInsert = client.calls.find((c) => c.table === "ingestion_runs" && c.op === "insert");
  assert.ok(runInsert, "有 ingestion_runs insert");
  const row = (runInsert!.rows as Array<Record<string, unknown>>)[0];
  assert.equal(row.channel, "json");

  const phases = client.calls
    .filter((c) => c.table === "ingestion_runs" && c.op === "update")
    .map((c) => c.values?.phase);
  assert.deepEqual(phases, ["validated", "gated", "written", "completed"]);

  const lastUpdate = client.calls
    .filter((c) => c.table === "ingestion_runs" && c.op === "update")
    .at(-1)!;
  const counts = lastUpdate.values?.counts as Record<string, number>;
  assert.equal(counts.articles, 8);
  assert.equal(counts.dailyReports, 1);

  // 內容表寫入齊全，且 articles rows 帶 origin + url_normalized
  const articleUpsert = client.calls.find((c) => c.table === "articles" && c.op === "upsert");
  assert.ok(articleUpsert);
  const articleRow = (articleUpsert!.rows as Array<Record<string, unknown>>)[0];
  assert.ok(articleRow.url_normalized, "articles row 有 url_normalized");
  assert.equal((articleRow.origin as { channel: string }).channel, "websearch");
  assert.ok(client.calls.some((c) => c.table === "daily_report_items" && c.op === "insert"));
});

test("gate fail（7 篇）：exit 3、run 記 failed、無內容寫入（AC5）", async () => {
  const bundle = cloneBundle(makeValidBundle());
  const removed = bundle.articles.pop()!;
  bundle.dailyReport.items = bundle.dailyReport.items.filter(
    (it) => it.articleSlug !== removed.slug,
  );
  const client = new FakeClient();
  const code = await runJsonCommand([writeBundleFile(bundle)], client);
  assert.equal(code, 3);

  const phases = client.calls
    .filter((c) => c.table === "ingestion_runs" && c.op === "update")
    .map((c) => c.values?.phase);
  assert.equal(phases.at(-1), "failed");

  const contentWrites = client.calls.filter(
    (c) => c.table !== "ingestion_runs" && WRITE_OPS.has(c.op),
  );
  assert.deepEqual(contentWrites, [], "gate fail 不得寫入內容表");
});

test("重跑同日 bundle（DB 已有同 slug 同 URL）：不被 dedup 擋、exit 0", async () => {
  const bundle = makeValidBundle();
  const client = new FakeClient({
    selectRows: {
      articles: bundle.articles.map((a) => ({
        slug: a.slug,
        url_normalized: a.url, // 測試 URL 已是正規形
      })),
    },
  });
  const code = await runJsonCommand([writeBundleFile(bundle)], client);
  assert.equal(code, 0);
});

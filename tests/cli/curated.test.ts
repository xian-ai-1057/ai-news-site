// Spec 008 AC4 — ingest:json 對 raw-item 出處文章回寫 raw_items curated 狀態。
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runJsonCommand } from "../../ingest/cli/index";
import { FakeClient } from "../db/fake-client";
import { makeValidBundle } from "../gates/bundle-fixtures";

const RAW_ITEM_ID = "11111111-2222-3333-4444-555555555555";

function writeBundleFile(bundle: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), "ai-news-curated-"));
  const file = join(dir, "daily-bundle.json");
  writeFileSync(file, JSON.stringify(bundle), "utf8");
  return file;
}

test("raw-item 出處 → 入庫後回寫 status=curated + curated_article_id", async () => {
  const bundle = makeValidBundle();
  bundle.articles[0].origin = {
    channel: "raw-item",
    rawItemId: RAW_ITEM_ID,
    fetchMethod: "rss",
  };
  const client = new FakeClient({
    selectRows: {
      // 供 curated 回寫的 slug→id 查詢（dedup 查詢也讀同表，url_normalized 不命中即可）
      articles: [{ slug: bundle.articles[0].slug, id: "article-uuid-1", url_normalized: "x" }],
    },
  });
  const code = await runJsonCommand([writeBundleFile(bundle)], client);
  assert.equal(code, 0);

  const update = client.calls.find((c) => c.table === "raw_items" && c.op === "update");
  assert.ok(update, "有 raw_items update");
  assert.equal(update!.values?.status, "curated");
  assert.equal(update!.values?.curated_article_id, "article-uuid-1");
  assert.deepEqual(update!.eq, { column: "id", value: RAW_ITEM_ID });
});

test("websearch 出處 → 不觸發 raw_items 回寫", async () => {
  const client = new FakeClient();
  const code = await runJsonCommand([writeBundleFile(makeValidBundle())], client);
  assert.equal(code, 0);
  assert.ok(!client.calls.some((c) => c.table === "raw_items"));
});

test("回寫失敗 → 僅 warning（exit 1），不影響入庫", async () => {
  const bundle = makeValidBundle();
  bundle.articles[0].origin = {
    channel: "raw-item",
    rawItemId: RAW_ITEM_ID,
    fetchMethod: "rss",
  };
  const client = new FakeClient({
    selectRows: {
      articles: [{ slug: bundle.articles[0].slug, id: "article-uuid-1", url_normalized: "x" }],
    },
    errorOn: [{ table: "raw_items", op: "update", message: "boom" }],
  });
  const code = await runJsonCommand([writeBundleFile(bundle)], client);
  assert.equal(code, 1, "warnings → exit 1");
  assert.ok(
    client.calls.some((c) => c.table === "daily_report_items" && c.op === "insert"),
    "內容仍完整入庫",
  );
});

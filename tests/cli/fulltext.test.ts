// Spec 011 §4 / AC1 — parseUrlsInput / dedupeHttpUrls 純函式測試。
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUrlsInput, dedupeHttpUrls } from "../../ingest/cli/fulltext";

test("JSON 陣列輸入", () => {
  assert.deepEqual(
    parseUrlsInput('["https://a.com/1", "https://b.com/2"]'),
    ["https://a.com/1", "https://b.com/2"],
  );
});

test("{ urls: [...] } 物件輸入", () => {
  assert.deepEqual(
    parseUrlsInput('{"urls":["https://a.com/1"]}'),
    ["https://a.com/1"],
  );
});

test("每行一個 URL", () => {
  assert.deepEqual(
    parseUrlsInput("https://a.com/1\nhttps://b.com/2\n"),
    ["https://a.com/1", "https://b.com/2"],
  );
});

test("去重並濾掉非 http(s)、保留順序", () => {
  assert.deepEqual(
    dedupeHttpUrls([
      "https://a.com/1",
      "ftp://x.com",
      "not a url",
      "https://a.com/1",
      "http://b.com/2",
    ]),
    ["https://a.com/1", "http://b.com/2"],
  );
});

test("空輸入 → 空陣列", () => {
  assert.deepEqual(parseUrlsInput("[]"), []);
  assert.deepEqual(parseUrlsInput("\n\n"), []);
});

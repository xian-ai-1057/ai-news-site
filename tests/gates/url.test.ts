// Spec 007 §6 / AC2 — normalizeUrl golden 案例。
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeUrl } from "../../ingest/gates/url";

test("小寫 host、移除預設 port", () => {
  assert.equal(normalizeUrl("HTTPS://Example.COM:443/Path"), "https://example.com/Path");
  assert.equal(normalizeUrl("http://EXAMPLE.com:80/a"), "http://example.com/a");
  assert.equal(normalizeUrl("https://example.com:8443/a"), "https://example.com:8443/a");
});

test("移除 hash fragment", () => {
  assert.equal(normalizeUrl("https://example.com/a#section-2"), "https://example.com/a");
});

test("移除 utm_* 與精確追蹤參數，其餘按 key 排序", () => {
  assert.equal(
    normalizeUrl("https://example.com/a?utm_source=x&b=2&utm_campaign=y&a=1&fbclid=zzz"),
    "https://example.com/a?a=1&b=2",
  );
  assert.equal(
    normalizeUrl("https://example.com/a?ref=homepage&gclid=1"),
    "https://example.com/a",
  );
});

test("移除路徑尾斜線（根路徑除外）", () => {
  assert.equal(normalizeUrl("https://example.com/a/b/"), "https://example.com/a/b");
  assert.equal(normalizeUrl("https://example.com/"), "https://example.com/");
});

test("同一文章的變體 URL 正規化後相等", () => {
  const canonical = normalizeUrl("https://example.com/news/ai-launch");
  assert.equal(
    normalizeUrl("https://Example.com/news/ai-launch/?utm_source=tw#top"),
    canonical,
  );
});

test("無法解析的輸入原樣返回", () => {
  assert.equal(normalizeUrl("not a url"), "not a url");
  assert.equal(normalizeUrl(""), "");
});

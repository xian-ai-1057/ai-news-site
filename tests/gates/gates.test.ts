// Spec 007 §5 / AC3 — 八個閘門的 fail/warn 觸發測試。純函式 + 注入 lookup，無 DB。
import { test } from "node:test";
import assert from "node:assert/strict";
import { runGates, type ExistingUrlLookup } from "../../ingest/gates/index";
import { normalizeUrl } from "../../ingest/gates/url";
import { makeValidBundle, cloneBundle } from "./bundle-fixtures";

const emptyLookup: ExistingUrlLookup = async () => [];

function statusOf(results: { gate: string; status: string }[], gate: string): string[] {
  return results.filter((r) => r.gate === gate).map((r) => r.status);
}

test("合法 bundle 全部閘門 pass", async () => {
  const report = await runGates(makeValidBundle(), emptyLookup);
  assert.equal(report.failed, false, JSON.stringify(report.results, null, 2));
  for (const r of report.results) assert.equal(r.status, "pass", r.gate);
  assert.equal(report.droppedSlugs.length, 0);
});

test("url-format：非 http(s) → fail", async () => {
  const bundle = cloneBundle(makeValidBundle());
  bundle.articles[0].url = "ftp://example.com/a";
  const report = await runGates(bundle, emptyLookup);
  assert.ok(statusOf(report.results, "url-format").includes("fail"));
  assert.equal(report.failed, true);
});

test("url-dedup：與 DB 既有文章同 URL → drop + warn，items 同步移除，count 連動 fail", async () => {
  const bundle = makeValidBundle();
  const dupUrl = normalizeUrl(bundle.articles[0].url);
  const lookup: ExistingUrlLookup = async () => [
    { slug: "2026-07-01-舊文章", url_normalized: dupUrl },
  ];
  const report = await runGates(bundle, lookup);
  assert.deepEqual(report.droppedSlugs, [bundle.articles[0].slug]);
  assert.ok(statusOf(report.results, "url-dedup").includes("warn"));
  assert.equal(report.bundle.articles.length, 7);
  assert.ok(
    !report.bundle.dailyReport.items.some((it) => it.articleSlug === bundle.articles[0].slug),
    "被 drop 文章的日報 item 一併移除",
  );
  // 8 → 7 篇，article-count 應 fail
  assert.ok(statusOf(report.results, "article-count").includes("fail"));
  assert.equal(report.failed, true);
});

test("url-dedup：DB 命中同 slug（重跑同日 bundle）→ 不 drop", async () => {
  const bundle = makeValidBundle();
  const lookup: ExistingUrlLookup = async () =>
    bundle.articles.map((a) => ({ slug: a.slug, url_normalized: normalizeUrl(a.url) }));
  const report = await runGates(bundle, lookup);
  assert.equal(report.droppedSlugs.length, 0);
  assert.equal(report.failed, false);
});

test("url-dedup：bundle 內互重 → 保留第一篇、drop 其餘", async () => {
  const bundle = cloneBundle(makeValidBundle());
  bundle.articles[1].url = bundle.articles[0].url + "?utm_source=copy";
  const report = await runGates(bundle, emptyLookup);
  assert.deepEqual(report.droppedSlugs, [bundle.articles[1].slug]);
  assert.ok(report.bundle.articles.some((a) => a.slug === bundle.articles[0].slug));
});

test("content-quality：全文太短 → fail", async () => {
  const bundle = cloneBundle(makeValidBundle());
  bundle.articles[2].contentMd = "太短";
  const report = await runGates(bundle, emptyLookup);
  assert.ok(statusOf(report.results, "content-quality").includes("fail"));
});

test("content-quality：403/驗證頁樣板字串 → fail", async () => {
  const bundle = cloneBundle(makeValidBundle());
  bundle.articles[3].contentMd = "Just a moment... " + "填充內容。".repeat(50);
  const report = await runGates(bundle, emptyLookup);
  assert.ok(statusOf(report.results, "content-quality").includes("fail"));

  const bundle2 = cloneBundle(makeValidBundle());
  bundle2.articles[3].contentMd = "⚠️ 全文抓取失敗（WebFetch 返回 403）" + "字".repeat(200);
  const report2 = await runGates(bundle2, emptyLookup);
  assert.ok(statusOf(report2.results, "content-quality").includes("fail"));
});

test("article-count：16 篇 → fail", async () => {
  const bundle = cloneBundle(makeValidBundle());
  while (bundle.articles.length < 16) {
    const extra = cloneBundle(makeValidBundle()).articles[7];
    extra.slug = `${extra.slug}-extra-${bundle.articles.length}`;
    extra.url = `https://example.com/extra/${bundle.articles.length}`;
    bundle.articles.push(extra);
    bundle.dailyReport.items.push({
      reportSlug: bundle.dailyReport.slug,
      articleSlug: extra.slug,
      section: extra.category,
      position: bundle.articles.length,
      blurbMd: "重點。",
    });
  }
  const report = await runGates(bundle, emptyLookup);
  assert.ok(statusOf(report.results, "article-count").includes("fail"));
});

test("report-date：reportDate ≠ runDate 或 slug 不符 → fail", async () => {
  const bundle = cloneBundle(makeValidBundle());
  bundle.dailyReport.reportDate = "2026-07-09";
  const report = await runGates(bundle, emptyLookup);
  assert.ok(statusOf(report.results, "report-date").includes("fail"));
});

test("section-coverage：缺章節 → warn（不 fail）", async () => {
  const bundle = cloneBundle(makeValidBundle());
  bundle.dailyReport.items = bundle.dailyReport.items.filter(
    (it) => it.section !== "新創公司",
  );
  const report = await runGates(bundle, emptyLookup);
  assert.ok(statusOf(report.results, "section-coverage").includes("warn"));
  // 未被引用的兩篇新創文章 → item-integrity warn
  assert.ok(statusOf(report.results, "item-integrity").includes("warn"));
  assert.equal(report.failed, false);
});

test("note-coverage：技術理論文章缺筆記 → fail", async () => {
  const bundle = cloneBundle(makeValidBundle());
  bundle.learningNotes = bundle.learningNotes.slice(1);
  const report = await runGates(bundle, emptyLookup);
  assert.ok(statusOf(report.results, "note-coverage").includes("fail"));
});

test("item-integrity：item 指向 bundle 外 slug → fail", async () => {
  const bundle = cloneBundle(makeValidBundle());
  bundle.dailyReport.items[0].articleSlug = "2026-07-10-不存在的文章";
  const report = await runGates(bundle, emptyLookup);
  assert.ok(statusOf(report.results, "item-integrity").includes("fail"));
});

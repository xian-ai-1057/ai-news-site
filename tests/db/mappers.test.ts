// Mapper unit tests: record → row field & casing correctness. NO DB, NO parser.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  articleToRow,
  learningNoteToRow,
  dailyReportToRow,
  dailyReportItemToRow,
} from "../../ingest/db/mappers";
import { goldenArticle, goldenNote, goldenReport } from "./fixtures";

test("articleToRow maps camelCase → snake_case", () => {
  const row = articleToRow(goldenArticle);
  assert.equal(row.slug, goldenArticle.slug);
  assert.equal(row.title, goldenArticle.title);
  assert.equal(row.article_date, goldenArticle.articleDate);
  assert.equal(row.source, goldenArticle.source);
  assert.equal(row.url, goldenArticle.url);
  assert.equal(row.category, goldenArticle.category);
  assert.equal(row.industry, goldenArticle.industry);
  assert.equal(row.summary_md, goldenArticle.summaryMd);
  assert.equal(row.content_md, goldenArticle.contentMd);
  assert.deepEqual(row.tags, goldenArticle.tags);
  assert.equal(row.created_date, goldenArticle.createdDate);
  assert.equal(row.raw_md, goldenArticle.rawMd);
  // No camelCase keys leaked through.
  assert.ok(!("articleDate" in row));
  assert.ok(!("summaryMd" in row));
});

test("learningNoteToRow maps fields and accepts resolved source_article_id", () => {
  const row = learningNoteToRow(goldenNote, "resolved-uuid");
  assert.equal(row.slug, goldenNote.slug);
  assert.equal(row.note_date, goldenNote.noteDate);
  assert.equal(row.topic, goldenNote.topic);
  assert.equal(row.difficulty, goldenNote.difficulty);
  assert.equal(row.source_article_id, "resolved-uuid");
  assert.equal(row.source_article_slug, goldenNote.sourceArticleSlug);
  assert.equal(row.content_md, goldenNote.contentMd);
  assert.equal(row.raw_md, goldenNote.rawMd);
});

test("learningNoteToRow keeps null source_article_id when unresolved", () => {
  const row = learningNoteToRow(goldenNote, null);
  assert.equal(row.source_article_id, null);
  // Backup slug is still retained.
  assert.equal(row.source_article_slug, goldenNote.sourceArticleSlug);
});

test("dailyReportToRow maps reportDate → report_date and omits items", () => {
  const row = dailyReportToRow(goldenReport);
  assert.equal(row.slug, goldenReport.slug);
  assert.equal(row.report_date, goldenReport.reportDate);
  assert.equal(row.title, goldenReport.title);
  assert.equal(row.summary_md, goldenReport.summaryMd);
  assert.ok(!("items" in row));
  assert.ok(!("reportDate" in row));
});

test("dailyReportItemToRow maps section/position/blurb and FKs", () => {
  const item = goldenReport.items[0];
  const row = dailyReportItemToRow(item, "report-uuid", "article-uuid");
  assert.equal(row.daily_report_id, "report-uuid");
  assert.equal(row.article_id, "article-uuid");
  assert.equal(row.section, item.section);
  assert.equal(row.position, item.position);
  assert.equal(row.blurb_md, item.blurbMd);
  assert.ok(!("blurbMd" in row));
  assert.ok(!("articleSlug" in row));
});

// Spec 002 §5 / §8 — golden 比對 + AC 驗證。
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import {
  parseArticle,
  parseLearningNote,
  parseDailyReport,
  buildBundle,
} from "../../ingest/parser/index.ts";
import {
  ArticleRecordSchema,
  LearningNoteRecordSchema,
  DailyReportRecordSchema,
} from "../../specs/001-db-schema/contracts/records.schema.ts";

const FIXTURES = "../../specs/001-db-schema/contracts/fixtures/";

function fixturePath(name: string): string {
  return fileURLToPath(new URL(FIXTURES + name, import.meta.url));
}
function readFixture(name: string): string {
  return fs.readFileSync(fixturePath(name), "utf8");
}
function readJson(name: string): Record<string, unknown> {
  return JSON.parse(readFixture(name));
}

const PROSE_FIELDS = new Set(["summaryMd", "contentMd", "blurbMd"]);

/**
 * Spec 002 §5 比對：
 *  - prose 欄位（summaryMd/contentMd/blurbMd）：actual.startsWith(expected)（expected 空字串跳過）。
 *  - rawMd：不比對（呼叫端不放進 expected 即可）。
 *  - 其餘欄位：深度嚴格相等（含 items 陣列、tags）。
 * 只比對 expected 內出現的 key（允許 actual 多出 rawMd 等欄位）。
 */
function goldenCompare(actual: any, expected: any, pathStr = ""): void {
  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), `${pathStr}: expected array`);
    assert.equal(
      actual.length,
      expected.length,
      `${pathStr}: array length mismatch`,
    );
    for (let i = 0; i < expected.length; i++) {
      goldenCompare(actual[i], expected[i], `${pathStr}[${i}]`);
    }
    return;
  }
  if (expected !== null && typeof expected === "object") {
    assert.ok(
      actual !== null && typeof actual === "object",
      `${pathStr}: expected object`,
    );
    for (const key of Object.keys(expected)) {
      const childPath = pathStr ? `${pathStr}.${key}` : key;
      if (PROSE_FIELDS.has(key)) {
        const exp = expected[key];
        if (exp === "") continue; // 空前綴跳過。
        assert.equal(
          typeof actual[key],
          "string",
          `${childPath}: prose field must be string`,
        );
        assert.ok(
          (actual[key] as string).startsWith(exp),
          `${childPath}: prose prefix mismatch\n  expected prefix: ${JSON.stringify(exp)}\n  actual start:    ${JSON.stringify((actual[key] as string).slice(0, exp.length + 20))}`,
        );
      } else {
        goldenCompare(actual[key], expected[key], childPath);
      }
    }
    return;
  }
  assert.deepEqual(actual, expected, `${pathStr}: value mismatch`);
}

// ---------------------------------------------------------------------------
// Article golden (AC 1)
// ---------------------------------------------------------------------------

test("Article golden — parseArticle matches article.expected.json (§5)", () => {
  const expected = readJson("article.expected.json");
  const raw = readFixture("article.input.md");
  // slug 來自檔名；fixture 的真實 slug 在 expected.slug，故用合成路徑。
  const filePath = `${expected.slug}.md`;
  const actual = parseArticle(filePath, raw);

  goldenCompare(actual, expected);
  ArticleRecordSchema.parse(actual); // AC 6
});

// ---------------------------------------------------------------------------
// Learning Note golden (AC 2)
// ---------------------------------------------------------------------------

test("Note golden — parseLearningNote matches learning-note.expected.json (§5)", () => {
  const expected = readJson("learning-note.expected.json");
  const raw = readFixture("learning-note.input.md");
  const filePath = `${expected.slug}.md`;
  const actual = parseLearningNote(filePath, raw);

  goldenCompare(actual, expected);
  assert.equal(
    actual.sourceArticleSlug,
    "2026-05-15-SubQ Subquadratic LLM 架構突破",
    "sourceArticleSlug must resolve from source_article wikilink",
  );
  LearningNoteRecordSchema.parse(actual); // AC 6
});

// ---------------------------------------------------------------------------
// Daily Report golden (AC 3)
// ---------------------------------------------------------------------------

test("Daily golden — parseDailyReport matches daily-report.expected.json (§5)", () => {
  const expected = readJson("daily-report.expected.json");
  const raw = readFixture("daily-report.input.md");
  const filePath = `${expected.slug}.md`;
  const actual = parseDailyReport(filePath, raw);

  goldenCompare(actual, expected);
  assert.equal(actual.items.length, 8, "daily report must have 8 items");
  // 跳過 📌 今日觀察 / 📚 歷史日報：無 item 指向其 wikilink。
  const slugs = actual.items.map((i: { articleSlug: string }) => i.articleSlug);
  assert.ok(
    !slugs.some((s: string) => s.startsWith("AI日報-")),
    "歷史日報 wikilink must not become an item",
  );
  DailyReportRecordSchema.parse(actual); // AC 6
});

// ---------------------------------------------------------------------------
// Idempotency (AC 5)
// ---------------------------------------------------------------------------

test("Idempotency — parsing twice yields deep-equal records (AC 5)", () => {
  const aRaw = readFixture("article.input.md");
  const nRaw = readFixture("learning-note.input.md");
  const dRaw = readFixture("daily-report.input.md");

  assert.deepEqual(
    parseArticle("a.md", aRaw),
    parseArticle("a.md", aRaw),
  );
  assert.deepEqual(
    parseLearningNote("n.md", nRaw),
    parseLearningNote("n.md", nRaw),
  );
  assert.deepEqual(
    parseDailyReport("d.md", dRaw),
    parseDailyReport("d.md", dRaw),
  );
});

// ---------------------------------------------------------------------------
// Enum guard + Zod schema lock (AC 4, AC 6)
// ---------------------------------------------------------------------------

test("Enum guard — invalid category throws (AC 4)", () => {
  const bad = `---
title: bad
date: 2026-01-01
category: 不存在的分類
---
# x
`;
  assert.throws(() => parseArticle("bad.md", bad), /invalid category/);
});

test("Schema lock — golden outputs pass Zod .parse() (AC 6)", () => {
  parseArticle(
    "2026-05-13-OpenAI 發布 GPT-5.5 Instant.md",
    readFixture("article.input.md"),
  );
  // already parsed above; assert all three schemas accept outputs.
  ArticleRecordSchema.parse(
    parseArticle("a.md", readFixture("article.input.md")),
  );
  LearningNoteRecordSchema.parse(
    parseLearningNote("n.md", readFixture("learning-note.input.md")),
  );
  DailyReportRecordSchema.parse(
    parseDailyReport("d.md", readFixture("daily-report.input.md")),
  );
});

// ---------------------------------------------------------------------------
// buildBundle over real content/ (AC 4 skip-warn, AC 7 unresolved wikilink)
// ---------------------------------------------------------------------------

test("buildBundle — scans content/, fills bundle and warnings (AC 4, AC 7)", async () => {
  const contentDir = fileURLToPath(new URL("../../content", import.meta.url));
  const bundle = await buildBundle(contentDir);

  assert.ok(bundle.articles.length > 0, "should parse some articles");
  assert.ok(bundle.learningNotes.length > 0, "should parse some learning notes");
  assert.ok(bundle.dailyReports.length > 0, "should parse some daily reports");

  // INDEX.md excluded.
  assert.ok(
    !bundle.learningNotes.some((n: { slug: string }) => n.slug === "INDEX"),
    "INDEX.md must be excluded",
  );

  // Every record passes its Zod schema (AC 6 over real corpus).
  for (const a of bundle.articles) ArticleRecordSchema.parse(a);
  for (const n of bundle.learningNotes) LearningNoteRecordSchema.parse(n);
  for (const d of bundle.dailyReports) DailyReportRecordSchema.parse(d);

  // warnings is an array; does not throw on unresolved wikilinks (AC 7).
  assert.ok(Array.isArray(bundle.warnings));
});

// Phase 6 — shape.ts 純函式單元測試。執行：npx tsx --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractObservation,
  deriveIssue,
  deriveLead,
  weekday,
  fmtDate,
} from "../lib/shape";
import type { DigestItem } from "../lib/viewmodel";

const SAMPLE_RAW = [
  "## 📰 今日重點",
  "> some summary",
  "",
  "## 📌 今日觀察",
  "> [!note] 趨勢觀察",
  "> 第一段第一句。第一段第二句。",
  ">",
  "> 第二段第一句。第二段第二句。",
  "",
  "## 📚 歷史日報",
  "- [[AI日報-2026-06-04]]",
  "",
  "---",
  "*本日報由 Claude 自動整理*",
  "",
].join("\n");

test("extractObservation: 去引用前綴、去 callout 首行、兩段以 \\n\\n 連接", () => {
  const out = extractObservation(SAMPLE_RAW);
  assert.equal(
    out,
    "第一段第一句。第一段第二句。\n\n第二段第一句。第二段第二句。",
  );
  // 不得含引用/callout/下一段標題/footer 痕跡。
  assert.ok(!out.includes(">"));
  assert.ok(!out.includes("[!"));
  assert.ok(!out.includes("## 📚"));
  assert.ok(!out.includes("歷史日報"));
  assert.ok(!out.includes("自動整理"));
});

test("extractObservation: 找不到段落回傳空字串", () => {
  assert.equal(extractObservation("## 其他\n內容"), "");
  assert.equal(extractObservation(""), "");
});

test("deriveIssue: 由舊到新序位，由 1 起算", () => {
  // 23 個升冪日期，末筆為 2026-06-05（不假設連續）。
  const dates = Array.from({ length: 22 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 4, 13 + i));
    return d.toISOString().slice(0, 10);
  });
  dates.push("2026-06-05");
  assert.equal(dates.length, 23);
  assert.equal(deriveIssue(dates, dates[0]), 1);
  assert.equal(deriveIssue(dates, "2026-06-05"), 23);
  assert.equal(deriveIssue(dates, "1999-01-01"), 0); // 不存在 → 0
});

function mkItem(catKey: DigestItem["catKey"], title: string): DigestItem {
  return {
    catKey,
    lead: false,
    title,
    articleSlug: "",
    source: "",
    url: "",
    industry: null,
    points: "",
    noteSlug: null,
  };
}

test("deriveLead: 有 news → news 段第一則；恰一則 lead", () => {
  const items = [
    mkItem("tech", "t0"),
    mkItem("tech", "t1"),
    mkItem("news", "n0"),
    mkItem("enterprise", "e0"),
  ];
  deriveLead(items);
  const leads = items.filter((i) => i.lead);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].title, "n0");
});

test("deriveLead: 無 news → 整體第一則；恰一則 lead", () => {
  const items = [mkItem("tech", "t0"), mkItem("market", "m0")];
  deriveLead(items);
  const leads = items.filter((i) => i.lead);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].title, "t0");
});

test("weekday: 2026-06-05 === 週五", () => {
  assert.equal(weekday("2026-06-05"), "週五");
  assert.equal(weekday("2026-06-07"), "週日"); // Sunday
  assert.equal(weekday("2026-06-08"), "週一");
});

test("fmtDate: UTC 解析、英文月縮寫", () => {
  const f = fmtDate("2026-06-05");
  assert.deepEqual(f, { year: 2026, month: 6, day: 5, monthEn: "Jun" });
});

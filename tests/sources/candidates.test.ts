// Spec 008 AC3 — candidates 分組/排序/截斷。
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCandidates, UNCATEGORIZED, type CandidateRow } from "../../ingest/cli/candidates";

function row(overrides: Partial<CandidateRow>): CandidateRow {
  return {
    id: "id-1",
    url: "https://example.com/a",
    title: "標題",
    summary: "摘要",
    published_at: "2026-07-10T08:00:00Z",
    category_hint: "技術理論",
    sources: { name: "TestSource" },
    ...overrides,
  };
}

test("依 category_hint 分組、published_at 新→舊、null hint 進未分類", () => {
  const grouped = formatCandidates([
    row({ id: "a", published_at: "2026-07-10T06:00:00Z" }),
    row({ id: "b", published_at: "2026-07-10T09:00:00Z" }),
    row({ id: "c", category_hint: null, published_at: null }),
    row({ id: "d", category_hint: "重大新聞" }),
  ]);
  assert.deepEqual(
    grouped["技術理論"].map((i) => i.id),
    ["b", "a"],
    "同組內新→舊",
  );
  assert.equal(grouped["重大新聞"].length, 1);
  assert.equal(grouped[UNCATEGORIZED][0].id, "c");
});

test("summary 截斷 500 字、source 名稱帶出", () => {
  const grouped = formatCandidates([row({ summary: "長".repeat(600) })]);
  const item = grouped["技術理論"][0];
  assert.equal(item.summary.length, 500);
  assert.equal(item.source, "TestSource");
});

// collectMarkdownFiles recursion tests (Spec 003 §8 AC7). No DB, no parser.
// Builds a throwaway content tree in os.tmpdir() with nested subfolders and
// asserts nested .md files are collected — mirroring `ingest:day -- content/`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename } from "node:path";
import { collectMarkdownFiles } from "../../ingest/cli/index";

function makeTree(): string {
  const root = mkdtempSync(join(tmpdir(), "ingest-collect-"));
  mkdirSync(join(root, "Articles"));
  mkdirSync(join(root, "Learning Notes"));
  writeFileSync(join(root, "AI日報-2026-06-07.md"), "# report");
  writeFileSync(join(root, "Articles", "2026-06-07-foo.md"), "# article");
  writeFileSync(join(root, "Learning Notes", "2026-06-07-學習-bar.md"), "# note");
  // Noise that must be ignored: a non-.md file and a nested non-.md.
  writeFileSync(join(root, "Articles", "image.png"), "binary");
  writeFileSync(join(root, "README.txt"), "ignore me");
  return root;
}

test("collectMarkdownFiles recurses into subfolders (AC7)", () => {
  const root = makeTree();
  try {
    const files = collectMarkdownFiles([root]);
    const names = files.map((f) => basename(f)).sort();
    assert.deepEqual(names, [
      "2026-06-07-foo.md",
      "2026-06-07-學習-bar.md",
      "AI日報-2026-06-07.md",
    ]);
    // Every returned path actually ends in .md (no dirs, no .png/.txt).
    assert.ok(files.every((f) => f.endsWith(".md")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("collectMarkdownFiles passes through explicit .md file args", () => {
  const root = makeTree();
  try {
    const explicit = join(root, "Articles", "2026-06-07-foo.md");
    assert.deepEqual(collectMarkdownFiles([explicit]), [explicit]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

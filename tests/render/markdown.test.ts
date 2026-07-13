// Spec 007 §8 / AC7 — 渲染器格式自檢斷言（frontmatter 齊全、emoji 章節順序、頁尾簽名）。
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  renderArticleMd,
  renderArticleBodyMd,
  renderLearningNoteMd,
  renderDailyReportMd,
  previousDate,
  fillRawMd,
  fillDisplayContentMd,
} from "../../ingest/render/markdown";
import { makeValidBundle, makeArticle, makeNote, RUN_DATE } from "../gates/bundle-fixtures";

function assertAscendingOrder(text: string, markers: string[]): void {
  let last = -1;
  for (const marker of markers) {
    const idx = text.indexOf(marker);
    assert.ok(idx >= 0, `缺章節/標記：${marker}`);
    assert.ok(idx > last, `順序錯誤：${marker}`);
    last = idx;
  }
}

test("範本 A：frontmatter 八欄位 + 章節順序 + 頁尾簽名 + 技術理論 wikilink", () => {
  const article = makeArticle(0, "技術理論");
  article.observationsMd = "一段觀察。";
  const note = makeNote(article, 0);
  const md = renderArticleMd(article, { noteSlug: note.slug });

  for (const field of ["title:", "date:", "source:", "url:", "category:", "industry:", "tags:", "created:"]) {
    assert.ok(md.includes(field), `frontmatter 缺 ${field}`);
  }
  assertAscendingOrder(md, [
    "> [!info] 文章資訊",
    "## 📝 重點摘要",
    "## 📖 全文內容",
    "## 💡 觀察與啟發",
    "## 🔗 相關連結",
    "## 📓 學習筆記",
  ]);
  assert.ok(md.includes(`[[${note.slug}|查看深入學習筆記]]`));
  assert.ok(md.includes(`*由 Claude 自動整理於 ${RUN_DATE}*`));
});

test("範本 A：非技術理論不產生 📓 學習筆記區塊", () => {
  const md = renderArticleMd(makeArticle(1, "市場情況"));
  assert.ok(!md.includes("## 📓 學習筆記"));
});

test("範本 B：type=learning-note、source_article wikilink、簽名", () => {
  const article = makeArticle(0, "技術理論");
  const note = makeNote(article, 0);
  const md = renderLearningNoteMd(note);
  assert.ok(md.includes("type: learning-note"));
  assert.ok(md.includes(`source_article: "[[${article.slug}]]"`));
  assert.ok(md.includes(`difficulty: 入門`));
  assert.ok(md.includes(`# ${note.title}`), "contentMd 無標題時補 # title");
  assert.ok(md.includes(`*由 Claude 自動整理於 ${RUN_DATE}*`));
});

test("範本 C：五章節順序、產業列、學習筆記列、callout、歷史日報、時間戳簽名", () => {
  const bundle = makeValidBundle();
  const md = renderDailyReportMd(
    bundle.dailyReport,
    bundle.articles,
    bundle.learningNotes,
    bundle.meta,
  );
  assertAscendingOrder(md, [
    "> [!summary] 今日重點",
    "## 🔬 技術理論",
    "## 📊 市場情況",
    "## 📰 重大新聞",
    "## 🏢 企業應用導入",
    "## 🚀 新創公司",
    "## 📌 今日觀察",
    "## 📚 歷史日報",
  ]);
  assert.ok(md.includes("- **產業**：金融"));
  assert.ok(md.includes("📓 **學習筆記**：[["));
  assert.ok(md.includes("> [!note] 趨勢觀察"));
  assert.ok(md.includes(`- [[AI日報-${previousDate(RUN_DATE)}]]`));
  assert.ok(md.includes(`*本日報由 Claude 自動整理 - ${bundle.meta.generatedAt}*`));
});

test("範本 C：缺章節保留標題並標註（今日無重要進展）", () => {
  const bundle = makeValidBundle();
  bundle.dailyReport.items = bundle.dailyReport.items.filter(
    (it) => it.section !== "新創公司",
  );
  const md = renderDailyReportMd(
    bundle.dailyReport,
    bundle.articles,
    bundle.learningNotes,
    bundle.meta,
  );
  assert.ok(md.includes("## 🚀 新創公司\n\n（今日無重要進展）"));
});

test("previousDate 跨月/跨年正確", () => {
  assert.equal(previousDate("2026-07-01"), "2026-06-30");
  assert.equal(previousDate("2026-01-01"), "2025-12-31");
  assert.equal(previousDate("2026-03-01"), "2026-02-28");
});

test("renderArticleBodyMd：完整 body（info + 摘要 + 全文 + 觀察 + 連結 + 筆記），無 frontmatter/標題/頁尾", () => {
  const article = makeArticle(0, "技術理論");
  article.observationsMd = "一段觀察與啟發。";
  const note = makeNote(article, 0);
  const body = renderArticleBodyMd(article, { noteSlug: note.slug });

  // 完整 body 各章節齊、順序正確。
  assertAscendingOrder(body, [
    "> [!info] 文章資訊",
    "## 📝 重點摘要",
    "## 📖 全文內容",
    "## 💡 觀察與啟發",
    "## 🔗 相關連結",
    "## 📓 學習筆記",
  ]);
  // 原始摘要與全文段都保留在 body 內。
  assert.ok(body.includes(article.summaryMd), "body 應含原始摘要");
  assert.ok(body.includes(article.contentMd), "body 應含原始全文");
  assert.ok(body.includes(`[[${note.slug}|查看深入學習筆記]]`));
  // content_md 顯示欄位不含 frontmatter / 標題 H1 / 頁尾簽名。
  assert.ok(!body.startsWith("---"), "content_md 不應含 frontmatter");
  assert.ok(!body.includes(`# ${article.title}`), "content_md 不應含標題 H1");
  assert.ok(!body.includes("自動整理於"), "content_md 不應含頁尾簽名");
});

test("fillDisplayContentMd：JSON 通道 content_md 升級為完整 body、raw_md 不受影響", () => {
  const filled = fillRawMd(makeValidBundle());
  const rawBefore = filled.articles.map((a) => a.rawMd);
  const contentFulltextBefore = filled.articles.map((a) => a.contentMd);

  const display = fillDisplayContentMd(filled);

  for (let i = 0; i < display.articles.length; i += 1) {
    const a = display.articles[i];
    // content_md 現在是完整 body（含摘要與全文章節標題）。
    assert.ok(a.contentMd.includes("## 📝 重點摘要"), `${a.slug} content_md 缺摘要章節`);
    assert.ok(a.contentMd.includes("## 📖 全文內容"), `${a.slug} content_md 缺全文章節`);
    // 原本的全文段仍完整保留在新的 content_md 內。
    assert.ok(
      a.contentMd.includes(contentFulltextBefore[i]),
      `${a.slug} content_md 應保留原始全文`,
    );
    // 技術理論文章帶入對應筆記 wikilink。
    if (a.category === "技術理論") {
      assert.ok(a.contentMd.includes("查看深入學習筆記"), `${a.slug} 缺筆記連結`);
    }
    // raw_md 不受此步驟影響。
    assert.equal(a.rawMd, rawBefore[i], `${a.slug} raw_md 不應被改動`);
  }
});

test("fillRawMd：空 rawMd 補齊、非空保留（idempotent）", () => {
  const bundle = makeValidBundle();
  bundle.articles[0].rawMd = "既有 raw";
  const filled = fillRawMd(bundle);
  assert.equal(filled.articles[0].rawMd, "既有 raw");
  for (const a of filled.articles.slice(1)) assert.ok(a.rawMd.startsWith("---\n"));
  for (const n of filled.learningNotes) assert.ok(n.rawMd.includes("type: learning-note"));
  assert.ok(filled.dailyReport.rawMd.includes("## 🔬 技術理論"));
  const again = fillRawMd(filled);
  assert.equal(again.dailyReport.rawMd, filled.dailyReport.rawMd);
});

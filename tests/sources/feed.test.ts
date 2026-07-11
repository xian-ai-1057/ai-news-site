// Spec 008 AC1 — feed 解析：RSS 2.0（含 CDATA/content:encoded）、Atom（多 link rel）、arXiv Atom。
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeed } from "../../supabase/functions/_shared/feed";

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>TechCrunch AI</title>
    <item>
      <title><![CDATA[OpenAI launches <b>new</b> model]]></title>
      <link>https://techcrunch.com/2026/07/10/openai-new-model/</link>
      <description><![CDATA[A short <em>summary</em> here.]]></description>
      <content:encoded><![CDATA[<p>Full body text with <a href="#">links</a>.</p>]]></content:encoded>
      <pubDate>Fri, 10 Jul 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Second item</title>
      <link>https://techcrunch.com/2026/07/10/second/</link>
      <description>Plain description</description>
      <pubDate>Fri, 10 Jul 2026 09:30:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>The Verge - AI</title>
  <entry>
    <title>Anthropic ships new safety tooling</title>
    <link rel="self" href="https://www.theverge.com/rss/entry-self.xml"/>
    <link rel="alternate" type="text/html" href="https://www.theverge.com/ai/2026/7/10/anthropic-safety"/>
    <summary>Verge summary text.</summary>
    <published>2026-07-10T12:00:00Z</published>
  </entry>
</feed>`;

const ARXIV = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2607.01234v1</id>
    <title>Scaling Laws for Sparse Mixture-of-Experts</title>
    <summary>  We study scaling laws...  </summary>
    <published>2026-07-09T17:59:00Z</published>
    <link href="http://arxiv.org/abs/2607.01234v1" rel="alternate" type="text/html"/>
    <link title="pdf" href="http://arxiv.org/pdf/2607.01234v1" rel="related" type="application/pdf"/>
  </entry>
</feed>`;

test("RSS 2.0：title 去 HTML/CDATA、link、description、content:encoded、pubDate → ISO", () => {
  const entries = parseFeed(RSS);
  assert.equal(entries.length, 2);
  assert.equal(entries[0].title, "OpenAI launches new model");
  assert.equal(entries[0].url, "https://techcrunch.com/2026/07/10/openai-new-model/");
  assert.equal(entries[0].summary, "A short summary here.");
  assert.ok(entries[0].contentText.includes("Full body text with"));
  assert.ok(!entries[0].contentText.includes("<p>"), "content:encoded 已去 HTML");
  assert.equal(entries[0].publishedAt, "2026-07-10T08:00:00.000Z");
});

test("Atom：取 rel=alternate 的 link，忽略 rel=self", () => {
  const entries = parseFeed(ATOM);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, "https://www.theverge.com/ai/2026/7/10/anthropic-safety");
  assert.equal(entries[0].summary, "Verge summary text.");
  assert.equal(entries[0].publishedAt, "2026-07-10T12:00:00.000Z");
});

test("arXiv Atom：alternate link（abs 頁）、summary trim、published", () => {
  const entries = parseFeed(ARXIV);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, "http://arxiv.org/abs/2607.01234v1");
  assert.equal(entries[0].title, "Scaling Laws for Sparse Mixture-of-Experts");
  assert.ok(entries[0].summary.startsWith("We study scaling laws"));
});

test("無法辨識的格式 → 空陣列", () => {
  assert.deepEqual(parseFeed("<html><body>not a feed</body></html>"), []);
  assert.deepEqual(parseFeed("not xml at all"), []);
});

// Spec 008 §5 / AC1 — RSS 2.0 / Atom / arXiv Atom feed 解析。
// 純 TS：fast-xml-parser 走 bare specifier —— Deno 端經
// supabase/functions/deno.json import map 對映 npm 套件，Node 測試端走
// package.json 依賴。兩個 runtime 跑同一份程式碼。
import { XMLParser } from "fast-xml-parser";

export interface FeedEntry {
  url: string;
  title: string;
  summary: string;
  contentText: string;
  publishedAt: string | null; // ISO 8601，解析失敗為 null
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // CDATA 與文字節點統一取 #text
  textNodeName: "#text",
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** fast-xml-parser 的節點可能是字串或 { "#text": ... }。 */
function text(node: unknown): string {
  if (node === undefined || node === null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node).trim();
  if (typeof node === "object" && "#text" in (node as Record<string, unknown>)) {
    return text((node as Record<string, unknown>)["#text"]);
  }
  return "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function toIso(dateStr: string): string | null {
  if (!dateStr) return null;
  const ms = Date.parse(dateStr);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

/** Atom entry 的 link：可能多個，取 rel=alternate（或無 rel 者），退而求 id。 */
function atomLink(entry: Record<string, unknown>): string {
  const links = asArray(entry.link as unknown);
  for (const l of links) {
    if (typeof l === "object" && l !== null) {
      const rec = l as Record<string, unknown>;
      const rel = rec["@_rel"];
      if (rel === undefined || rel === "alternate") {
        const href = rec["@_href"];
        if (typeof href === "string") return href;
      }
    }
  }
  // arXiv：id 即為 abs 頁 URL
  const id = text(entry.id);
  return id.startsWith("http") ? id : "";
}

/**
 * 解析 RSS 2.0（rss.channel.item[]）或 Atom（feed.entry[]，含 arXiv API）。
 * 無法辨識的格式回傳空陣列（呼叫端記 last_status）。
 */
export function parseFeed(xml: string): FeedEntry[] {
  let doc: Record<string, unknown>;
  try {
    doc = parser.parse(xml) as Record<string, unknown>;
  } catch {
    return [];
  }

  // ── RSS 2.0 ──────────────────────────────────────────────────────────
  const rss = doc.rss as Record<string, unknown> | undefined;
  const channel = rss?.channel as Record<string, unknown> | undefined;
  if (channel) {
    return asArray(channel.item as unknown).flatMap((raw) => {
      const item = raw as Record<string, unknown>;
      const url = text(item.link);
      if (!url) return [];
      return [
        {
          url,
          title: stripHtml(text(item.title)),
          summary: stripHtml(text(item.description)).slice(0, 2000),
          contentText: stripHtml(text(item["content:encoded"])).slice(0, 20000),
          publishedAt: toIso(text(item.pubDate) || text(item["dc:date"])),
        },
      ];
    });
  }

  // ── Atom（含 arXiv API）──────────────────────────────────────────────
  const feed = doc.feed as Record<string, unknown> | undefined;
  if (feed) {
    return asArray(feed.entry as unknown).flatMap((raw) => {
      const entry = raw as Record<string, unknown>;
      const url = atomLink(entry);
      if (!url) return [];
      return [
        {
          url,
          title: stripHtml(text(entry.title)),
          summary: stripHtml(text(entry.summary) || text(entry.content)).slice(0, 2000),
          contentText: stripHtml(text(entry.content)).slice(0, 20000),
          publishedAt: toIso(text(entry.published) || text(entry.updated)),
        },
      ];
    });
  }

  return [];
}

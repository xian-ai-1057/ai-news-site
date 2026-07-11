// Spec 011 §3 — extract-fulltext Edge Function（Deno）。
// POST { urls: string[] } → 每個 url 伺服端抽全文（優先用 raw_items 既有 feed
// 全文，否則 fetch + Readability）→ 回傳純文字。讓 routine 不必自己抓新聞網站，
// 得以把環境網路鎖到只放行 Supabase。
import { createClient } from "@supabase/supabase-js";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { normalizeUrl, sha256Hex } from "../_shared/normalize-url.ts";

const MIN_CHARS = 200;
const MAX_CHARS = 30_000;
const FETCH_TIMEOUT = 20_000;

const BOILERPLATE = [
  /全文抓取失敗/,
  /access denied/i,
  /just a moment/i,
  /enable javascript/i,
  /attention required/i,
  /checking your browser/i,
  /verify you are human/i,
  /are you a robot/i,
];

function isThin(text: string): boolean {
  if (text.trim().length < MIN_CHARS) return true;
  return BOILERPLATE.some((re) => re.test(text));
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Readability 抽正文；失敗或過薄則退化為去標籤純文字。 */
function extractReadable(html: string): { title: string; text: string } {
  try {
    const { document } = parseHTML(html);
    const article = new Readability(document).parse();
    const text = article?.textContent?.trim() ?? "";
    if (text.length >= MIN_CHARS) {
      return { title: article?.title ?? "", text: text.slice(0, MAX_CHARS) };
    }
  } catch {
    // fall through to tag-strip fallback
  }
  return { title: "", text: stripTags(html).slice(0, MAX_CHARS) };
}

interface Result {
  url: string;
  title: string;
  contentText: string;
  chars: number;
  status: string;
}

Deno.serve(async (req: Request) => {
  let urls: string[] = [];
  try {
    const body = (await req.json()) as { urls?: unknown };
    if (Array.isArray(body.urls)) {
      urls = body.urls.filter((u): u is string => typeof u === "string").slice(0, 30);
    }
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (urls.length === 0) {
    return Response.json({ error: "urls[] required" }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const results: Result[] = [];
  for (const url of urls) {
    try {
      const hash = await sha256Hex(normalizeUrl(url));
      const { data: row } = await supabase
        .from("raw_items")
        .select("id,title,content_text")
        .eq("url_hash", hash)
        .maybeSingle();

      // ① 既有 feed 全文足夠 → 直接用（省一次 fetch）
      if (row?.content_text && !isThin(row.content_text)) {
        const text = String(row.content_text).slice(0, MAX_CHARS);
        results.push({
          url,
          title: row.title ?? "",
          contentText: text,
          chars: text.length,
          status: "cached-feed",
        });
        continue;
      }

      // ② 伺服端抓取 + Readability
      const res = await fetch(url, {
        headers: {
          "user-agent":
            "ai-news-fetcher/1.0 (+https://github.com/xian-ai-1057/ai-news-site)",
          accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });
      if (!res.ok) {
        results.push({ url, title: "", contentText: "", chars: 0, status: `failed: HTTP ${res.status}` });
        continue;
      }
      const { title, text } = extractReadable(await res.text());
      if (isThin(text)) {
        results.push({ url, title, contentText: "", chars: text.length, status: "failed: thin/boilerplate" });
        continue;
      }

      // best-effort 回寫快取
      if (row?.id) {
        await supabase.from("raw_items").update({ content_text: text }).eq("id", row.id);
      }
      results.push({
        url,
        title: title || (row?.title ?? ""),
        contentText: text,
        chars: text.length,
        status: "fetched",
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      results.push({ url, title: "", contentText: "", chars: 0, status: `failed: ${reason}`.slice(0, 200) });
    }
  }

  return Response.json({ results });
});

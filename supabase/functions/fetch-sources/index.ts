// Spec 008 §5 — fetch-sources Edge Function（Deno）。
// Supabase Cron 每 4 小時觸發：撈到期的 active sources → 抓 feed → 解析 →
// 正規化 URL → url_hash 去重 insert raw_items → 更新 last_status →
// 寫一列 ingestion_runs（channel='edge-fetch'）。
// 單一來源失敗不阻塞其他來源。
import { createClient } from "@supabase/supabase-js";
import { parseFeed } from "../_shared/feed.ts";
import { normalizeUrl, sha256Hex } from "../_shared/normalize-url.ts";

interface SourceRow {
  id: string;
  name: string;
  kind: string;
  feed_url: string;
  default_category: string | null;
  language: string;
  fetch_interval_minutes: number;
  last_fetched_at: string | null;
}

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const startedAt = new Date();
  const runDate = startedAt.toISOString().slice(0, 10);

  const { data: sources, error: sourcesError } = await supabase
    .from("sources")
    .select(
      "id,name,kind,feed_url,default_category,language,fetch_interval_minutes,last_fetched_at",
    )
    .eq("active", true);

  if (sourcesError) {
    return Response.json({ error: sourcesError.message }, { status: 500 });
  }

  const now = Date.now();
  const due = ((sources ?? []) as SourceRow[]).filter((s) => {
    if (!s.last_fetched_at) return true;
    return now - Date.parse(s.last_fetched_at) >= s.fetch_interval_minutes * 60_000;
  });

  let fetched = 0;
  let inserted = 0;
  const errors: string[] = [];

  for (const source of due) {
    let status = "ok";
    try {
      const res = await fetch(source.feed_url, {
        headers: { "user-agent": "ai-news-fetcher/1.0 (+https://github.com/xian-ai-1057/ai-news-site)" },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const entries = parseFeed(await res.text());
      if (entries.length === 0) throw new Error("feed 解析結果為空（格式不符或無項目）");
      fetched += entries.length;

      const rows = [];
      for (const entry of entries) {
        const urlNormalized = normalizeUrl(entry.url);
        rows.push({
          source_id: source.id,
          url: entry.url,
          url_hash: await sha256Hex(urlNormalized),
          title: entry.title.slice(0, 500),
          summary: entry.summary,
          content_text: entry.contentText,
          published_at: entry.publishedAt,
          category_hint: source.default_category,
          lang: source.language,
          payload: { feedUrl: source.feed_url },
        });
      }
      const { data: insertedRows, error: insertError } = await supabase
        .from("raw_items")
        .upsert(rows, { onConflict: "url_hash", ignoreDuplicates: true })
        .select("id");
      if (insertError) throw new Error(`raw_items insert: ${insertError.message}`);
      inserted += insertedRows?.length ?? 0;
    } catch (err) {
      status = `error: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500);
      errors.push(`${source.name} → ${status}`);
    }
    await supabase
      .from("sources")
      .update({ last_fetched_at: new Date().toISOString(), last_status: status })
      .eq("id", source.id);
  }

  const counts = { sources: due.length, fetched, inserted, errors: errors.length };
  await supabase.from("ingestion_runs").insert([
    {
      run_date: runDate,
      channel: "edge-fetch",
      trigger_src: "supabase-cron",
      phase: errors.length === due.length && due.length > 0 ? "failed" : "completed",
      counts,
      warnings: errors,
      finished_at: new Date().toISOString(),
    },
  ]);

  return Response.json({ ...counts, errors });
});

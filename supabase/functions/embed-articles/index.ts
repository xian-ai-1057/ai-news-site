// Spec 010 §4 — embed-articles Edge Function（Deno）。
// 撈 embedding is null 的文章（批次 50）→ OpenAI text-embedding-3-small（整批
// 一次呼叫）→ 逐列 update。null-query 天然冪等：cron 每小時掃尾即自癒。
import { createClient } from "@supabase/supabase-js";

const MODEL = "text-embedding-3-small";
const BATCH = 50;

Deno.serve(async (_req: Request) => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    // 未設定 key → no-op（不寫 run，避免 cron 灌 failed 紀錄）
    return Response.json({ skipped: true, reason: "OPENAI_API_KEY not set" });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id,slug,title,summary_md")
    .is("embedding", null)
    .order("article_date", { ascending: false })
    .limit(BATCH);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!articles || articles.length === 0) {
    return Response.json({ selected: 0, embedded: 0 });
  }

  const inputs = articles.map((a) => `${a.title}\n${a.summary_md ?? ""}`.slice(0, 8000));
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, input: inputs }),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    return Response.json({ error: `OpenAI ${res.status}: ${detail}` }, { status: 502 });
  }
  const payload = (await res.json()) as { data: Array<{ index: number; embedding: number[] }> };

  let embedded = 0;
  const failures: string[] = [];
  for (const item of payload.data) {
    const article = articles[item.index];
    const { error: updateError } = await supabase
      .from("articles")
      .update({ embedding: item.embedding })
      .eq("id", article.id);
    if (updateError) failures.push(`${article.slug}: ${updateError.message}`);
    else embedded += 1;
  }

  await supabase.from("ingestion_runs").insert([
    {
      run_date: new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10),
      channel: "embed",
      trigger_src: "supabase-cron",
      phase: failures.length > 0 && embedded === 0 ? "failed" : "completed",
      counts: { selected: articles.length, embedded },
      warnings: failures,
      finished_at: new Date().toISOString(),
    },
  ]);

  return Response.json({ selected: articles.length, embedded, failures });
});

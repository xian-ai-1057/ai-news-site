// Spec 010 §5 — 伺服端搜尋端點：語意（pgvector）＋中文 FTS（pgroonga）合併。
// OPENAI_API_KEY 為 Vercel server env（非 NEXT_PUBLIC）；未設定時退化為純 FTS。
import { supabase } from "@/lib/supabase";

export interface SearchHit {
  slug: string;
  title: string;
  articleDate: string;
  category: string;
  via: "semantic" | "fts";
}

interface RpcRow {
  slug: string;
  title: string;
  article_date: string;
  category: string;
}

async function embedQuery(q: string, apiKey: string): Promise<number[] | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "text-embedding-3-small", input: q }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as { data: Array<{ embedding: number[] }> };
    return payload.data[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

/** RRF-lite：兩個排名清單交錯合併、slug 去重。 */
function interleave(semantic: SearchHit[], fts: SearchHit[], limit: number): SearchHit[] {
  const merged: SearchHit[] = [];
  const seen = new Set<string>();
  const max = Math.max(semantic.length, fts.length);
  for (let i = 0; i < max && merged.length < limit; i += 1) {
    for (const list of [semantic, fts]) {
      const hit = list[i];
      if (hit && !seen.has(hit.slug) && merged.length < limit) {
        seen.add(hit.slug);
        merged.push(hit);
      }
    }
  }
  return merged;
}

export async function POST(req: Request): Promise<Response> {
  let q = "";
  try {
    const body = (await req.json()) as { q?: unknown };
    if (typeof body.q === "string") q = body.q.trim().slice(0, 200);
  } catch {
    // fallthrough → 400
  }
  if (!q) {
    return Response.json({ results: [] }, { status: 400 });
  }

  const toHits = (rows: RpcRow[] | null, via: SearchHit["via"]): SearchHit[] =>
    (rows ?? []).map((r) => ({
      slug: r.slug,
      title: r.title,
      articleDate: r.article_date,
      category: r.category,
      via,
    }));

  let fts: SearchHit[] = [];
  try {
    const res = await supabase.rpc("search_articles_fts", { q, lim: 20 });
    if (!res.error) fts = toHits(res.data as RpcRow[] | null, "fts");
  } catch {
    // RPC 不存在（migration 未套用）→ 純語意或空結果
  }

  let semantic: SearchHit[] = [];
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const embedding = await embedQuery(q, apiKey);
    if (embedding) {
      try {
        const res = await supabase.rpc("match_articles", {
          query_embedding: embedding,
          lim: 20,
        });
        if (!res.error) semantic = toHits(res.data as RpcRow[] | null, "semantic");
      } catch {
        // 同上
      }
    }
  }

  return Response.json({ q, results: interleave(semantic, fts, 20) });
}

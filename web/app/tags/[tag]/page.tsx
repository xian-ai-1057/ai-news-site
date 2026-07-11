import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTagArticles } from "@/lib/queries";
import { articleUrl, decodeSlugParam } from "@/lib/routes";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const t = decodeSlugParam(tag);
  const articles = await getTagArticles(t);
  const title = `#${t} · AI 日報`;
  const description = `與 ${t} 相關的 ${articles.length} 篇文章`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "AI 日報 · Signal",
    },
    twitter: { card: "summary" },
  };
}

// next.config.ts 未設 output: "export"（伺服器 / ISR 模式），dynamicParams 預設 true，
// 故未列入 generateStaticParams 的 tag 仍可在請求時 on-demand 生成。
// 仍補上 generateStaticParams：建置時預渲染所有已知 tag（成本低、行為一致）。
export async function generateStaticParams() {
  const { data, error } = await supabase.from("articles").select("tags");
  if (error) throw error;
  const set = new Set<string>();
  for (const row of data ?? []) {
    for (const t of (row.tags as string[] | null) ?? []) set.add(t);
  }
  return Array.from(set).map((tag) => ({ tag }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  // Next.js 16：非 ASCII 的 dynamic param 會以 percent-encoded 形式進來，需手動還原。
  const t = decodeSlugParam(tag);
  const articles = await getTagArticles(t);

  return (
    <main className="wrap">
      <div className="reader">
        <Link className="back" href="/">
          ← 返回
        </Link>

        <div className="rhead">
          <div className="eb">標籤 · Tag</div>
          <h1>#{t}</h1>
          <div className="rm">
            <span className="v">{articles.length} 篇文章</span>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="cat-empty">
            沒有符合此標籤的文章
            <span>#{t}</span>
          </div>
        ) : (
          <div className="tag-list">
            {articles.map((a) => (
              <Link className="tag-row" key={a.slug} href={articleUrl(a.slug)}>
                <h3>{a.title}</h3>
                <div className="rim">
                  {a.source && <span className="src">{a.source}</span>}
                  <span>{a.articleDate}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

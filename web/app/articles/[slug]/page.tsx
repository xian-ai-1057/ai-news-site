import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, getArticleSlugs, getRelatedArticles } from "@/lib/queries";
import { CATS } from "@/lib/categories";
import { articleUrl, noteUrl, tagUrl, digestUrl, decodeSlugParam } from "@/lib/routes";
import MarkdownView from "@/components/MarkdownView";

export const revalidate = 3600;

// 把 Markdown 摘要壓成純文字 meta description（去除 **粗體**、`code`、[連結]()、# 標題等）。
function plainExcerpt(md: string, max = 120): string {
  const s = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(decodeSlugParam(slug));
  if (!article) return {};
  const title = `${article.title} · AI 日報`;
  const description = plainExcerpt(article.summaryMd || article.contentMd);
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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Next.js 16：非 ASCII 的 dynamic param 會以 percent-encoded 形式進來，需手動還原。
  // 對已解碼（無 %）的字串而言 decodeURIComponent 為無害的 no-op。
  const article = await getArticle(decodeSlugParam(slug));

  if (!article) notFound();

  // Spec 010：語意相關文章（embedding 未就緒時為空 → 區塊隱藏）；排除自己。
  const related = (await getRelatedArticles(article.slug)).filter(
    (r) => r.slug !== article.slug,
  );

  const cat = CATS[article.category];
  const backHref = article.reportDates[0]
    ? digestUrl(article.reportDates[0])
    : "/";

  return (
    <main className="wrap">
      <div className="reader">
        <Link className="back" href={backHref}>
          ← 返回
        </Link>

        <div className="rhead">
          <div className="eb">
            {cat ? cat.emoji + " " + cat.label : "文章"}
          </div>
          <h1>{article.title}</h1>
          <div className="rm">
            {article.source && <span className="v">{article.source}</span>}
            <span>{article.articleDate}</span>
            {article.industry && <span>{article.industry}</span>}
          </div>
        </div>

        <div className="note-prose">
          <MarkdownView content={article.contentMd} dedupeTitle={article.title} />
        </div>

        <div className="xlinks">
          {article.url && (
            <a
              className="nt"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              原文 ↗
            </a>
          )}
          {article.noteSlug && (
            <Link className="nt" href={noteUrl(article.noteSlug)}>
              📓 學習筆記 →
            </Link>
          )}
          {article.reportDates.map((date) => (
            <Link className="nt" key={date} href={digestUrl(date)}>
              收錄於 AI 日報 {date}
            </Link>
          ))}
        </div>

        {article.tags.length > 0 && (
          <div className="tag-chips">
            {article.tags.map((tag) => (
              <Link className="tag-chip" key={tag} href={tagUrl(tag)}>
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <div className="eb">相關文章 · RELATED</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
              {related.map((r) => {
                const rcat = CATS[r.catKey];
                return (
                  <li key={r.slug} style={{ padding: "8px 0" }}>
                    <Link href={articleUrl(r.slug)}>
                      {rcat ? rcat.emoji + " " : ""}
                      {r.title}
                    </Link>
                    <span style={{ opacity: 0.6, fontSize: 13, marginLeft: 8 }}>
                      {r.articleDate}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

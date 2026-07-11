import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, getArticleSlugs, getRelatedArticles } from "@/lib/queries";
import { CATS } from "@/lib/categories";
import MarkdownView from "@/components/MarkdownView";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Next.js 16：非 ASCII 的 dynamic param 會以 percent-encoded 形式進來，需手動還原。
  // 對已解碼（無 %）的字串而言 decodeURIComponent 為無害的 no-op。
  const article = await getArticle(decodeURIComponent(slug));

  if (!article) notFound();

  // Spec 010：語意相關文章（embedding 未就緒時為空 → 區塊隱藏）
  const related = await getRelatedArticles(article.slug);

  const cat = CATS[article.category];
  const backHref = article.reportDates[0]
    ? "/digest/" + article.reportDates[0]
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
          <MarkdownView content={article.contentMd} />
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
            <Link className="nt" href={"/notes/" + article.noteSlug}>
              📓 學習筆記 →
            </Link>
          )}
          {article.reportDates.map((date) => (
            <Link className="nt" key={date} href={"/digest/" + date}>
              收錄於 AI 日報 {date}
            </Link>
          ))}
        </div>

        {article.tags.length > 0 && (
          <div className="tag-chips">
            {article.tags.map((tag) => (
              <Link className="tag-chip" key={tag} href={"/tags/" + tag}>
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
                    <Link href={"/articles/" + r.slug}>
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getNote } from "@/lib/queries";
import { articleUrl, decodeSlugParam } from "@/lib/routes";
import MarkdownView from "@/components/MarkdownView";

export const revalidate = 3600;

// 把 Markdown 內文壓成純文字 meta description。
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNote(decodeSlugParam(slug));
  if (!note) return {};
  const title = `${note.title} · AI 日報`;
  const description = plainExcerpt(note.contentMd);
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
  const note = await getNote(decodeSlugParam(slug));

  if (!note) notFound();

  return (
    <main className="wrap">
      <div className="reader">
        <Link
          className="back"
          href={
            note.sourceArticleSlug
              ? articleUrl(note.sourceArticleSlug)
              : "/"
          }
        >
          ← 返回
        </Link>

        <div className="rhead">
          <div className="eb">入門學習筆記</div>
          <h1>{note.title}</h1>
          <div className="rm">
            <span className="v">{note.topic}</span>
            <span>{note.difficulty}</span>
            <span>{note.noteDate}</span>
          </div>
        </div>

        <div className="note-prose">
          <MarkdownView content={note.contentMd} dedupeTitle={note.title} />
        </div>
      </div>
    </main>
  );
}

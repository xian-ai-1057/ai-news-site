import { notFound } from "next/navigation";
import Link from "next/link";
import { getNote } from "@/lib/queries";
import MarkdownView from "@/components/MarkdownView";

export const revalidate = 3600;

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Next.js 16：非 ASCII 的 dynamic param 會以 percent-encoded 形式進來，需手動還原。
  // 對已解碼（無 %）的字串而言 decodeURIComponent 為無害的 no-op。
  const note = await getNote(decodeURIComponent(slug));

  if (!note) notFound();

  return (
    <main className="wrap">
      <div className="reader">
        <Link
          className="back"
          href={
            note.sourceArticleSlug
              ? "/articles/" + note.sourceArticleSlug
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
          <MarkdownView content={note.contentMd} />
        </div>
      </div>
    </main>
  );
}

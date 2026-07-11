import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDigest, getDigestDates } from "@/lib/queries";
import DigestReader from "@/components/DigestReader";

export const revalidate = 3600;

export async function generateStaticParams() {
  const dates = await getDigestDates();
  return dates.map((date) => ({ date }));
}

// 把 Markdown 摘要壓成純文字 meta description。
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
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const digest = await getDigest(date);
  if (!digest) return {};
  const title = `第 ${digest.issue} 期 · ${digest.date} · AI 日報`;
  const description = plainExcerpt(digest.summary);
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
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const [digest, dates] = await Promise.all([getDigest(date), getDigestDates()]);

  if (!digest) notFound();

  // dates 由 getDigestDates() 回傳升冪（舊→新）
  const idx = dates.indexOf(date);
  // 左「← 前一期」= 較舊（idx - 1），右「後一期 →」= 較新（idx + 1）
  const prevDate = idx > 0 ? dates[idx - 1] : null;
  const nextDate = idx < dates.length - 1 ? dates[idx + 1] : null;

  return (
    <main className="wrap">
      <div className="reader">
        <DigestReader digest={digest} prevDate={prevDate} nextDate={nextDate} />
      </div>
    </main>
  );
}

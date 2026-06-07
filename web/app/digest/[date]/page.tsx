import { notFound } from "next/navigation";
import { getDigest, getDigestDates } from "@/lib/queries";
import DigestReader from "@/components/DigestReader";

export const revalidate = 3600;

export async function generateStaticParams() {
  const dates = await getDigestDates();
  return dates.map((date) => ({ date }));
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

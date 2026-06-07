import Link from "next/link";
import type { Digest } from "@/lib/viewmodel";
import { fmtDate } from "@/lib/shape";

interface HeroProps {
  digest: Digest;
}

export default function Hero({ digest }: HeroProps) {
  const leadItem = digest.items.find((i) => i.lead);
  const { year, month, day } = fmtDate(digest.date);
  const issueStr = String(digest.issue).padStart(2, "0");

  return (
    <section className="hero">
      <div className="ghost disp">{issueStr}</div>
      <span className="eb">
        <span className="pulse" />
        今日頭條 · TODAY&apos;S LEAD
      </span>
      <h1>
        <Link href={"/digest/" + digest.date}>
          {leadItem?.title ?? ""}
        </Link>
      </h1>
      <div className="hmeta">
        <span className="dt">{year} 年 {month} 月 {day} 日</span>
        <span>{digest.weekday}</span>
        <span>第 {digest.issue} 期</span>
        <span>收錄 {digest.items.length} 則</span>
      </div>
      <p className="lede">{digest.summary}</p>
      <Link className="cta" href={"/digest/" + digest.date}>
        閱讀今日完整日報 <span className="disp">→</span>
      </Link>
    </section>
  );
}

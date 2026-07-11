import Link from "next/link";
import { CAT_ORDER, CATS } from "@/lib/categories";
import type { Digest } from "@/lib/viewmodel";
import { fmtDate } from "@/lib/shape";
import SectionItem from "./SectionItem";
import InlineMd from "./InlineMd";

interface Props {
  digest: Digest;
  prevDate: string | null; // 較舊（← 前一期）
  nextDate: string | null; // 較新（後一期 →）
}

export default function DigestReader({ digest, prevDate, nextDate }: Props) {
  // 依 CAT_ORDER 分組
  const grouped = CAT_ORDER.map((k) => ({
    key: k,
    items: digest.items.filter((it) => it.catKey === k),
  })).filter((g) => g.items.length > 0);

  // 觀察段落（以 \n\n 切割）
  const obsParagraphs = digest.observation
    ? digest.observation.split("\n\n").filter(Boolean)
    : [];

  // 大標題用中文日期格式（如「2026 年 7 月 11 日」）
  const { year, month, day } = fmtDate(digest.date);
  const titleDate = `${year} 年 ${month} 月 ${day} 日`;

  return (
    <>
      <Link className="back" href="/">
        ← 返回所有日報
      </Link>

      <div className="rhead">
        <div className="eb">每日彙整 · 第 {digest.issue} 期</div>
        <h1>{titleDate}</h1>
        <div className="rm">
          <span>{digest.weekday}</span>
          <span>收錄 {digest.items.length} 則新聞</span>
        </div>
      </div>

      {digest.summary && (
        <div className="lede-box"><InlineMd text={digest.summary} /></div>
      )}

      {grouped.map(({ key, items }) => {
        const cat = CATS[key];
        return (
          <section key={key} className="rsec">
            <div className="rsec-h">
              <span
                className="pill"
                style={{ "--hue": cat.hue } as React.CSSProperties}
              >
                {cat.emoji} {cat.label}
              </span>
              <span className="en">
                {cat.en} · {items.length} 則
              </span>
            </div>
            {items.map((item, i) => (
              <SectionItem key={i} item={item} />
            ))}
          </section>
        );
      })}

      {obsParagraphs.length > 0 && (
        <div className="obs">
          <div className="ok">📌 今日觀察 · Editor&apos;s Analysis</div>
          {obsParagraphs.map((p, i) => (
            <p key={i}><InlineMd text={p} /></p>
          ))}
        </div>
      )}

      <nav className="rnav">
        {prevDate ? (
          <Link href={"/digest/" + prevDate}>
            <div className="lab">← 前一期</div>
            <div className="v">{prevDate}</div>
          </Link>
        ) : (
          <div />
        )}
        {nextDate ? (
          <Link className="nx" href={"/digest/" + nextDate}>
            <div className="lab">後一期 →</div>
            <div className="v">{nextDate}</div>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </>
  );
}

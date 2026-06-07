import Link from "next/link";
import type { Digest } from "@/lib/viewmodel";
import { CAT_ORDER, CATS } from "@/lib/categories";
import { fmtDate } from "@/lib/shape";

interface ArchiveGridProps {
  digests: Digest[];
}

export default function ArchiveGrid({ digests }: ArchiveGridProps) {
  return (
    <>
      <div className="feed-head">
        <h3>往期日報 · The Archive</h3>
        <span className="cnt">{digests.length} 期完整</span>
      </div>
      <div className="grid">
        {digests.map((d) => {
          const leadItem = d.items.find((i) => i.lead);
          const { day, monthEn, year } = fmtDate(d.date);

          // Collect categories that appear in this digest, in CAT_ORDER
          const catCounts = CAT_ORDER.reduce<Record<string, number>>(
            (acc, k) => {
              const count = d.items.filter((i) => i.catKey === k).length;
              if (count > 0) acc[k] = count;
              return acc;
            },
            {},
          );

          return (
            <Link key={d.date} className="card" href={"/digest/" + d.date}>
              <div className="cd">
                <span className="big">{day}</span>
                <span className="my">
                  {monthEn} {year}
                  <br />
                  {d.weekday}
                </span>
                <span className="iss">第 {d.issue} 期</span>
              </div>
              <h4>{leadItem?.title ?? ""}</h4>
              <p className="ex">{d.summary}</p>
              <div className="tags">
                {CAT_ORDER.filter((k) => catCounts[k] !== undefined).map(
                  (k) => (
                    <span key={k} className="tag">
                      <span
                        className="d"
                        style={
                          { "--hue": CATS[k].hue } as React.CSSProperties
                        }
                      />
                      {CATS[k].label} {catCounts[k]}
                    </span>
                  ),
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

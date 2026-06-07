import Link from "next/link";
import type { Digest } from "@/lib/viewmodel";
import { CAT_ORDER, CATS } from "@/lib/categories";

interface CategoryStripProps {
  digest: Digest;
}

export default function CategoryStrip({ digest }: CategoryStripProps) {
  return (
    <div className="strip">
      {CAT_ORDER.map((k) => {
        const firstItem = digest.items.find((i) => i.catKey === k);
        return (
          <Link key={k} className="s" href={"/digest/" + digest.date}>
            <div className="num">
              <span
                className="d"
                style={{ "--hue": CATS[k].hue } as React.CSSProperties}
              />
              {CATS[k].label}
            </div>
            <div className="ti">
              {firstItem?.title ?? "今日無更新"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

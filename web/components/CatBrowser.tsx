"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATS, CAT_ORDER } from "@/lib/categories";
import type { CatKey, SearchRow } from "@/lib/viewmodel";
import Mark from "./Mark";

interface CatBrowserProps {
  rows: SearchRow[];
}

type CatFilter = "all" | CatKey;

function isCatKey(v: string | null): v is CatKey {
  return !!v && (CAT_ORDER as string[]).includes(v);
}

/** 小寫 includes 比對 title+points+source+industry。 */
function matches(r: SearchRow, q: string): boolean {
  const hay = `${r.title} ${r.points} ${r.source} ${r.industry ?? ""}`.toLowerCase();
  return hay.includes(q);
}

/**
 * 分類頁核心。受控 input 永遠掛載（不 remount，保留焦點/游標）；
 * 結果區由 useMemo 計算。q/cat 變更時 router.replace 同步 ?q=&cat=。
 */
export default function CatBrowser({ rows }: CatBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCat = searchParams.get("cat");
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [cat, setCat] = useState<CatFilter>(
    isCatKey(initialCat) ? initialCat : "all",
  );

  // 把 q/cat 同步進網址（不捲動）。
  const syncUrl = useCallback(
    (nextQ: string, nextCat: CatFilter) => {
      const params = new URLSearchParams();
      if (nextQ.trim()) params.set("q", nextQ);
      if (nextCat !== "all") params.set("cat", nextCat);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  function onQ(value: string) {
    setQ(value);
    syncUrl(value, cat);
  }
  function clearQ() {
    setQ("");
    syncUrl("", cat);
  }
  function pickCat(next: CatFilter) {
    setCat(next);
    syncUrl(q, next);
  }

  // 過濾：q（includes）+ cat。
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (cat !== "all" && r.catKey !== cat) return false;
      if (query && !matches(r, query)) return false;
      return true;
    });
  }, [rows, q, cat]);

  // 依 CAT_ORDER 分段（cat≠all 時只該段）。
  const sections = useMemo(() => {
    const order = cat === "all" ? CAT_ORDER : [cat];
    return order
      .map((k) => ({ key: k, items: filtered.filter((r) => r.catKey === k) }))
      .filter((s) => s.items.length > 0);
  }, [filtered, cat]);

  const hasFilter = q.trim().length > 0 || cat !== "all";
  const count = filtered.length;

  return (
    <>
      <div className="catbar">
        <div className="csearch">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="搜尋關鍵字、公司、來源…"
            aria-label="搜尋關鍵字、公司、來源"
          />
          <button
            className={q ? "cclr on" : "cclr"}
            onClick={clearQ}
            title="清除"
            aria-label="清除搜尋"
          >
            ✕
          </button>
        </div>
        <div className="cchips">
          <button
            className={cat === "all" ? "cchip all on" : "cchip all"}
            onClick={() => pickCat("all")}
          >
            全部主題
          </button>
          {CAT_ORDER.map((k) => (
            <button
              key={k}
              className={cat === k ? "cchip on" : "cchip"}
              style={{ "--hue": CATS[k].hue } as React.CSSProperties}
              onClick={() => pickCat(k)}
            >
              {CATS[k].emoji} {CATS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="cat-count">
        {hasFilter ? `篩選出 ${count} 則文章` : `共 ${count} 則文章`}
      </div>

      {sections.length === 0 ? (
        <div className="cat-empty">
          找不到符合條件的文章
          <span>試試其他關鍵字或主題</span>
        </div>
      ) : (
        sections.map((sec) => {
          const meta = CATS[sec.key];
          return (
            <div className="rsec" key={sec.key}>
              <div className="rsec-h">
                <span
                  className="pill"
                  style={{ "--hue": meta.hue } as React.CSSProperties}
                >
                  {meta.emoji} {meta.label}
                </span>
                <span className="en">
                  {meta.en} · {sec.items.length} 則
                </span>
              </div>
              {sec.items.map((r, i) => (
                <div className="ritem" key={`${r.date}-${r.title}-${i}`}>
                  <h3>
                    <Link href={r.articleSlug ? `/articles/${r.articleSlug}` : `/digest/${r.date}`}>
                      <Mark text={r.title} q={q} />
                    </Link>
                  </h3>
                  <div className="rim">
                    <span>{r.source}</span>
                    {r.industry ? <span className="ind">{r.industry}</span> : null}
                    <span>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}
    </>
  );
}

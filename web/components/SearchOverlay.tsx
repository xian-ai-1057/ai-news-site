"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATS } from "@/lib/categories";
import type { SearchRow } from "@/lib/viewmodel";
import { articleUrl, digestUrl } from "@/lib/routes";
import Mark from "./Mark";

interface SearchOverlayProps {
  rows: SearchRow[];
}

/** 對單列做小寫 includes 比對（title+points+source+industry）。 */
function matches(r: SearchRow, q: string): boolean {
  const hay = `${r.title} ${r.points} ${r.source} ${r.industry ?? ""}`.toLowerCase();
  return hay.includes(q);
}

/** 單列結果對應的目標網址（含 % 的 slug 需經 encode，見 lib/routes）。 */
function rowHref(r: SearchRow): string {
  return r.articleSlug ? articleUrl(r.articleSlug) : digestUrl(r.date);
}

/**
 * 全站 ⌘K 全文搜尋 overlay。空查詢顯示前 8 筆，有查詢最多 20 筆。
 * ⌘K/Ctrl-K toggle、Esc 關、點遮罩空白關、window 'open-search' 事件開。
 * 鍵盤：↑↓ 選取、Enter 開啟、Tab 焦點陷阱於浮層內。
 */
export default function SearchOverlay({ rows }: SearchOverlayProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // ⌘K / Ctrl-K toggle、Esc 關；window 'open-search' 事件開。
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  // open 時 autofocus；關閉時清空查詢。
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQ("");
    }
  }, [open]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows.slice(0, 8);
    return rows.filter((r) => matches(r, query)).slice(0, 20);
  }, [q, rows]);

  const hasQuery = q.trim().length > 0;

  // 查詢變更由 input onChange 重置選取（見下方 handler），避免 effect 內同步 setState。

  // 捲動使選中項可見。
  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, results]);

  const optionId = (i: number) => `search-opt-${i}`;

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const target = results[activeIndex];
      if (target) {
        e.preventDefault();
        setOpen(false);
        router.push(rowHref(target));
      }
    } else if (e.key === "Tab") {
      // 簡單焦點陷阱：僅在浮層內的可聚焦元素間循環。
      const focusables = boxRef.current?.querySelectorAll<HTMLElement>(
        'input, a[href], button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (activeEl === first || !boxRef.current?.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  return (
    <div
      className={open ? "ov on" : "ov"}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        className="ov-box"
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label="搜尋"
        onKeyDown={onKeyDown}
      >
        <div className="ov-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="搜尋所有日報與新聞…"
            aria-label="搜尋所有日報與新聞"
            aria-controls="search-results"
            aria-activedescendant={
              results.length > 0 ? optionId(activeIndex) : undefined
            }
          />
        </div>
        <div className="ov-res" role="listbox" id="search-results">
          {results.length === 0 ? (
            <div className="ov-empty">找不到符合條件的文章</div>
          ) : (
            results.map((r, i) => (
              <Link
                key={`${r.date}-${r.title}-${i}`}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                id={optionId(i)}
                role="option"
                aria-selected={i === activeIndex}
                className={i === activeIndex ? "r2 active" : "r2"}
                href={rowHref(r)}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => setOpen(false)}
              >
                <span
                  className="d"
                  style={{ "--hue": CATS[r.catKey].hue } as React.CSSProperties}
                />
                <div>
                  <div className="rt2">
                    <Mark text={r.title} q={hasQuery ? q : ""} />
                  </div>
                  <div className="rm2">
                    {CATS[r.catKey].label} · {r.source} · {r.date}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="ov-hint">
          <span>即時搜尋</span>
          <span>Esc 關閉</span>
        </div>
      </div>
    </div>
  );
}

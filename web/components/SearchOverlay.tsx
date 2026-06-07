"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATS } from "@/lib/categories";
import type { SearchRow } from "@/lib/viewmodel";
import Mark from "./Mark";

interface SearchOverlayProps {
  rows: SearchRow[];
}

/** 對單列做小寫 includes 比對（title+points+source+industry）。 */
function matches(r: SearchRow, q: string): boolean {
  const hay = `${r.title} ${r.points} ${r.source} ${r.industry ?? ""}`.toLowerCase();
  return hay.includes(q);
}

/**
 * 全站 ⌘K 全文搜尋 overlay。空查詢顯示前 8 筆，有查詢最多 20 筆。
 * ⌘K/Ctrl-K toggle、Esc 關、點遮罩空白關、window 'open-search' 事件開。
 */
export default function SearchOverlay({ rows }: SearchOverlayProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      className={open ? "ov on" : "ov"}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="ov-box">
        <div className="ov-in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋所有日報與新聞…"
            aria-label="搜尋所有日報與新聞"
          />
        </div>
        <div className="ov-res">
          {results.length === 0 ? (
            <div className="ov-empty">找不到符合條件的文章</div>
          ) : (
            results.map((r, i) => (
              <Link
                key={`${r.date}-${r.title}-${i}`}
                className="r2"
                href={r.articleSlug ? `/articles/${r.articleSlug}` : `/digest/${r.date}`}
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
          <span>即時全文搜尋</span>
          <span>Esc 關閉</span>
        </div>
      </div>
    </div>
  );
}

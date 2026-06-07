"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

/** nav 連結；精確比對路徑決定 .on 高亮。 */
const NAV = [
  { href: "/", label: "首頁" },
  { href: "/sections", label: "分類" },
  { href: "/about", label: "關於" },
];

export default function Header() {
  const pathname = usePathname();

  function openSearch() {
    window.dispatchEvent(new Event("open-search"));
  }

  return (
    <header>
      <div className="hrow">
        <Link className="logo" href="/" aria-label="AI 日報 首頁">
          <span className="sq" />
          <span>
            <b>AI 日報</b>
            <span className="disp">Signal</span>
          </span>
        </Link>
        <nav className="nav">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={pathname === n.href ? "on" : undefined}
            >
              {n.label}
            </Link>
          ))}
          <button
            className="cbtn"
            onClick={openSearch}
            title="搜尋 ⌘K"
            aria-label="搜尋"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

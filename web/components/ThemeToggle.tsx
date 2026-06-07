"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "ainews-theme-c";

/**
 * 主題切換鈕（.cbtn）。點擊切換 <html data-theme> 並寫 localStorage。
 * 防閃爍 script（layout <head>）已在首繪前設好 data-theme；本元件
 * mount 後讀取真實值校正 state，避免 hydration mismatch（首繪以 light 佔位）。
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      className="cbtn"
      onClick={toggle}
      title="切換主題"
      aria-label="切換主題"
      suppressHydrationWarning
    >
      {mounted && isDark ? (
        // 月亮（dark 時顯示）
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // 太陽（light 時顯示）
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v3" />
          <path d="M12 19v3" />
          <path d="M2 12h3" />
          <path d="M19 12h3" />
          <path d="M4.9 4.9l2.1 2.1" />
          <path d="M17 17l2.1 2.1" />
          <path d="M19.1 4.9L17 7" />
          <path d="M7 17l-2.1 2.1" />
        </svg>
      )}
    </button>
  );
}

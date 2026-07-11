import Link from "next/link";

/**
 * 全站頁尾（server component）。
 * 行動版（≤600px）header 只保留當前頁 nav，故頁尾提供固定可達的 首頁 / 分類 / 關於 導覽。
 * 樣式由 globals.css 的 .site-footer* 提供（Agent C 負責）。
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="site-footer-nav">
        <Link href="/">首頁</Link>
        <Link href="/sections">分類</Link>
        <Link href="/about">關於</Link>
      </nav>
      <div className="site-footer-brand">AI 日報 · Signal</div>
    </footer>
  );
}

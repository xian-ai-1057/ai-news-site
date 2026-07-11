import type { Metadata } from "next";
import "./globals.css";
import { getSearchIndex } from "@/lib/queries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchOverlay from "@/components/SearchOverlay";

export const metadata: Metadata = {
  title: "AI 日報 · Signal",
  description:
    "每天，把 AI 世界讀成一則訊號。繁體中文 AI 新聞日報，依技術理論 / 市場情況 / 重大新聞 / 企業應用導入 / 新創公司五大分類組織。",
};

// 防閃爍：在第一次繪製前依 localStorage 設定 data-theme。
const themeScript = `
(function(){try{
  var t = localStorage.getItem('ainews-theme-c');
  if(!t){ t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  document.documentElement.setAttribute('data-theme', t);
}catch(e){}})();
`;

/**
 * Phase 6（search-eng）：Server Component layout。
 * - 防閃爍 script + 字型 link 留在 <head>。
 * - client 殼：<Header/>（含 ⌘K 鈕、ThemeToggle）、<SearchOverlay/>（全站 ⌘K）。
 * - 在 server 取一次 SearchRow[] 傳給 overlay。
 */
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const rows = await getSearchIndex();

  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
        <SearchOverlay rows={rows} />
      </body>
    </html>
  );
}

// Spec 005 — 分類設計常數（非 DB 資料，來自設計稿 content.js）
// Phase 4 凍結，Phase 6 唯讀。對齊 001-db-schema 的 category_enum 五值。

import type { CatKey } from "./viewmodel";

export interface CatMeta {
  key: CatKey;
  emoji: string;
  label: string; // 繁中名（= DB category_enum 值）
  en: string; // 英文小標
  hue: number; // 分類代表色 hue，配 catColor() 動態算 hsl
}

/** 固定顯示順序（內頁章節、分類頁分段皆依此）。 */
export const CAT_ORDER: CatKey[] = [
  "tech",
  "market",
  "news",
  "enterprise",
  "startup",
];

export const CATS: Record<CatKey, CatMeta> = {
  tech: { key: "tech", emoji: "🔬", label: "技術理論", en: "Research", hue: 268 },
  market: { key: "market", emoji: "📊", label: "市場情況", en: "Markets", hue: 32 },
  news: { key: "news", emoji: "📰", label: "重大新聞", en: "Headlines", hue: 8 },
  enterprise: { key: "enterprise", emoji: "🏢", label: "企業應用導入", en: "Enterprise", hue: 200 },
  startup: { key: "startup", emoji: "🚀", label: "新創公司", en: "Startups", hue: 150 },
};

/** DB category_enum（中文）→ CatKey（英文）。資料層用來把 section 正規化。 */
export const CATEGORY_KEY: Record<string, CatKey> = {
  技術理論: "tech",
  市場情況: "market",
  重大新聞: "news",
  企業應用導入: "enterprise",
  新創公司: "startup",
};

/** CatKey → 中文 enum（資料層 / 查詢條件用）。 */
export const KEY_CATEGORY: Record<CatKey, string> = {
  tech: "技術理論",
  market: "市場情況",
  news: "重大新聞",
  enterprise: "企業應用導入",
  startup: "新創公司",
};

/**
 * 分類代表色。與原型一致：
 *   Light：hsl(<hue> 66% 48%)
 *   Dark ：hsl(<hue> 60% 64%)
 * 注意：原型用 body[data-theme] 在 runtime 取色；正式版以 CSS 變數驅動更佳——
 * 可於各分類容器設 `--cc: hsl(<hue> 66% 48%)`，並在 [data-theme="dark"] 下覆寫，
 * 或於 client 端呼叫本函式。dark 參數預設 false（SSR 安全）。
 */
export function catColor(hue: number, dark = false): string {
  return `hsl(${hue} ${dark ? 60 : 66}% ${dark ? 64 : 48}%)`;
}

// Phase 5（Lead 基座）。= 凍結契約 specs/005-web-ui/contracts/categories.ts。
import type { CatKey } from "./viewmodel";

export interface CatMeta {
  key: CatKey;
  emoji: string;
  label: string; // = DB category_enum 值
  en: string;
  hue: number;
}

export const CAT_ORDER: CatKey[] = ["tech", "market", "news", "enterprise", "startup"];

export const CATS: Record<CatKey, CatMeta> = {
  tech: { key: "tech", emoji: "🔬", label: "技術理論", en: "Research", hue: 268 },
  market: { key: "market", emoji: "📊", label: "市場情況", en: "Markets", hue: 32 },
  news: { key: "news", emoji: "📰", label: "重大新聞", en: "Headlines", hue: 8 },
  enterprise: { key: "enterprise", emoji: "🏢", label: "企業應用導入", en: "Enterprise", hue: 200 },
  startup: { key: "startup", emoji: "🚀", label: "新創公司", en: "Startups", hue: 150 },
};

/** DB category_enum（中文）→ CatKey。 */
export const CATEGORY_KEY: Record<string, CatKey> = {
  技術理論: "tech",
  市場情況: "market",
  重大新聞: "news",
  企業應用導入: "enterprise",
  新創公司: "startup",
};

/** CatKey → 中文 enum。 */
export const KEY_CATEGORY: Record<CatKey, string> = {
  tech: "技術理論",
  market: "市場情況",
  news: "重大新聞",
  enterprise: "企業應用導入",
  startup: "新創公司",
};

/** Light：hsl(<hue> 66% 48%)；Dark：hsl(<hue> 60% 64%)。 */
export function catColor(hue: number, dark = false): string {
  return `hsl(${hue} ${dark ? 60 : 66}% ${dark ? 64 : 48}%)`;
}

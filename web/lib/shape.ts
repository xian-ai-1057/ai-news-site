// Phase 6 — 純函式 + DB 列 → view-model 衍生（observation / issue / lead / 日期）。
// 三個 DB 無欄位的衍生規則見 spec 005 §3。無副作用、可單測。
import type { DigestItem } from "./viewmodel";
import { CAT_ORDER } from "./categories";

/**
 * 從日報 raw_md 抽出「今日觀察」（Editor's Analysis）。
 * - 定位 `## 📌 今日觀察`，切到「下一個以 `## ` 開頭的行」之前。
 * - 移除 callout 首行（`> [!note] 趨勢觀察` 或任意 `> [!xxx] ...`）。
 * - 逐行去除開頭 `> ` / `>` 引用前綴；連續空引用行 → 段落分隔（`\n\n`）。
 * - trim。找不到該段落 → 回傳 ""。
 * 輸出不含 `>`、`[!`、`## 📚`、footer。
 */
export function extractObservation(rawMd: string): string {
  if (!rawMd) return "";
  const lines = rawMd.split("\n");
  const startIdx = lines.findIndex((l) => l.trim().startsWith("## 📌 今日觀察"));
  if (startIdx === -1) return "";

  // 收集標題之後到下一個 `## ` 標題前的行。
  const bodyLines: string[] = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) break;
    bodyLines.push(lines[i]);
  }

  const paragraphs: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length) {
      paragraphs.push(current.join("\n"));
      current = [];
    }
  };

  for (const raw of bodyLines) {
    const line = raw.replace(/\r$/, "");
    // 去引用前綴：`> ` 或 `>`（含純 `>` 空引用行）。
    const isQuote = /^>/.test(line);
    const content = isQuote ? line.replace(/^>\s?/, "") : line;

    // callout 首行：形如 `[!note] 趨勢觀察`（去前綴後以 `[!` 開頭）。
    if (/^\[!/.test(content.trim())) continue;

    if (content.trim() === "") {
      // 空（引用）行 → 段落分隔。
      flush();
      continue;
    }
    current.push(content);
  }
  flush();

  return paragraphs.map((p) => p.trim()).join("\n\n").trim();
}

/**
 * 期數：date 在「由舊到新」排序中的序位（由 1 起算）。
 * allReportDatesAsc 必須是升冪。2026-06-05 = 23。
 */
export function deriveIssue(allReportDatesAsc: string[], date: string): number {
  return allReportDatesAsc.indexOf(date) + 1;
}

/**
 * 衍生頭條：把「重大新聞」(news) section position 0 那則設 lead=true；
 * 若該期無 news，取 CAT_ORDER→position 排序後第一則。每期恰一則 lead。
 * 原地修改傳入的 items（假設 items 已先排序）。
 */
export function deriveLead(items: DigestItem[]): void {
  for (const it of items) it.lead = false;
  if (items.length === 0) return;

  // 重大新聞 = news；該 section 的第一則（已排序後 news 段首即 position 0）。
  const newsLead = items.find((it) => it.catKey === "news");
  const lead = newsLead ?? items[0];
  lead.lead = true;
}

// 週日對應 Sunday（getUTCDay()===0）。用 UTC 避免時區誤差。
const WEEKDAYS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

/** YYYY-MM-DD → 中文「週一…週日」。 */
export function weekday(date: string): string {
  const day = new Date(date + "T00:00:00Z").getUTCDay();
  return WEEKDAYS[day];
}

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** YYYY-MM-DD → UI 用日期欄位（年/月/日 + 英文月縮寫）。用 UTC 解析。 */
export function fmtDate(date: string): {
  year: number;
  month: number;
  day: number;
  monthEn: string;
} {
  const d = new Date(date + "T00:00:00Z");
  const month = d.getUTCMonth() + 1;
  return {
    year: d.getUTCFullYear(),
    month,
    day: d.getUTCDate(),
    monthEn: MONTHS_EN[month - 1],
  };
}

/** items 排序鍵：CAT_ORDER 次序 → position。 */
export function catOrderRank(catKey: DigestItem["catKey"]): number {
  const i = CAT_ORDER.indexOf(catKey);
  return i === -1 ? CAT_ORDER.length : i;
}

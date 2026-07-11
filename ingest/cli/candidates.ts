// Spec 008 §6 — candidates 子命令的純邏輯（分組/排序/截斷），CLI 薄殼在 index.ts。
export interface CandidateRow {
  id: string;
  url: string;
  title: string;
  summary: string;
  published_at: string | null;
  category_hint: string | null;
  sources: { name: string } | null;
}

export interface CandidateItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  source: string;
}

export type GroupedCandidates = Record<string, CandidateItem[]>;

const SUMMARY_LIMIT = 500;
export const UNCATEGORIZED = "未分類";

/** category_hint 分組、published_at 新→舊、summary 截斷 500 字。 */
export function formatCandidates(rows: CandidateRow[]): GroupedCandidates {
  const grouped: GroupedCandidates = {};
  const sorted = [...rows].sort((a, b) => {
    const ta = a.published_at ? Date.parse(a.published_at) : 0;
    const tb = b.published_at ? Date.parse(b.published_at) : 0;
    return tb - ta;
  });
  for (const row of sorted) {
    const key = row.category_hint ?? UNCATEGORIZED;
    (grouped[key] ??= []).push({
      id: row.id,
      url: row.url,
      title: row.title,
      summary: row.summary.slice(0, SUMMARY_LIMIT),
      publishedAt: row.published_at,
      source: row.sources?.name ?? "",
    });
  }
  return grouped;
}

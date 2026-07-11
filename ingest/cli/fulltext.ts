// Spec 011 §4 — fulltext 子命令的純邏輯（解析 URL 輸入），CLI 薄殼在 index.ts。

/**
 * 解析 URL 清單輸入：支援 JSON 陣列、`{ "urls": [...] }`、每行一個、或直接的
 * CLI 參數字串。去重、濾掉非 http(s)。
 */
export function parseUrlsInput(raw: string): string[] {
  const trimmed = raw.trim();
  let candidates: unknown[] = [];
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      candidates = parsed;
    } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as { urls?: unknown[] }).urls)) {
      candidates = (parsed as { urls: unknown[] }).urls;
    }
  } else {
    candidates = trimmed.split(/\r?\n/);
  }
  return dedupeHttpUrls(candidates.map((u) => String(u).trim()));
}

/** 去重並只保留 http(s) URL，維持原始順序。 */
export function dedupeHttpUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (/^https?:\/\//i.test(u) && !seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  return out;
}

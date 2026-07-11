// Spec 007 §6 / Spec 008 §4 — URL 正規化「單一實作」。
// 純 TS、零依賴：Edge Function（Deno）與 ingest CLI（Node，經
// ingest/gates/url.ts re-export）共用同一份程式碼，parity by construction。

/** 追蹤參數：utm_* 前綴以外的精確名單。 */
const TRACKING_EXACT = new Set([
  "fbclid",
  "gclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_src",
  "cmpid",
  "s_kwcid",
  "sr_share",
]);

function isTrackingParam(key: string): boolean {
  return key.toLowerCase().startsWith("utm_") || TRACKING_EXACT.has(key.toLowerCase());
}

/**
 * 正規化 URL 供跨日去重比對。無法解析的輸入原樣返回（由 url-format gate 攔）。
 */
export function normalizeUrl(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return raw;
  }
  const protocol = u.protocol.toLowerCase();
  const host = u.hostname.toLowerCase();
  const isDefaultPort =
    u.port === "" ||
    (protocol === "https:" && u.port === "443") ||
    (protocol === "http:" && u.port === "80");
  const port = isDefaultPort ? "" : `:${u.port}`;

  let pathname = u.pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.replace(/\/+$/, "");
  }

  const params = [...u.searchParams.entries()]
    .filter(([key]) => !isTrackingParam(key))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const query =
    params.length > 0
      ? "?" + params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
      : "";

  return `${protocol}//${host}${port}${pathname}${query}`;
}

/** sha256 hex（url_hash 用；Deno 與 Node 皆有 WebCrypto）。 */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Spec 007 §6 — URL 正規化。
// 單一實作位於 supabase/functions/_shared/normalize-url.ts（Spec 008 §4：
// Edge Function 與 ingest CLI 共用），此處僅 re-export。
export { normalizeUrl, sha256Hex } from "../../supabase/functions/_shared/normalize-url";

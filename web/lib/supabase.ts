// Phase 5（Lead 基座，Phase 6 唯讀）。前端唯讀 client：anon/publishable key + public-read RLS。
// 嚴禁在 web/ 放 service_role key（見 spec 005 §AC15）。
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "缺少 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY，請複製 .env.local.example → .env.local",
  );
}

/** 共用唯讀 Supabase client（Server Components / Client 皆可用，因僅讀 public 資料）。 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

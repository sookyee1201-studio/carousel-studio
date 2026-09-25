import { createClient } from "@supabase/supabase-js";

/** 没有配置 Supabase 时也不会崩溃：用占位地址创建客户端，登录/云端保存会自然失效，其余功能照常使用。 */
export const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
);

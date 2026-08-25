import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://GhDKDMgA6LscwrJQKZ6DsQ.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_GhDKDMgA6LscwrJQKZ6DsQ_uykAeKgy";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSupabaseHealth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    return {
      connected: !error,
      url: supabaseUrl,
      error: error ? error.message : null,
    };
  } catch (err) {
    return {
      connected: false,
      url: supabaseUrl,
      error: err.message,
    };
  }
}

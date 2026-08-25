const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL || "https://GhDKDMgA6LscwrJQKZ6DsQ.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_GhDKDMgA6LscwrJQKZ6DsQ_uykAeKgy";

let supabase = null;

try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  console.log("⚡ Supabase Client initialized successfully for:", supabaseUrl);
} catch (err) {
  console.error("⚠️ Failed to initialize Supabase client:", err.message);
}

module.exports = {
  supabase,
  supabaseUrl,
  isConfigured: !!supabase,
};

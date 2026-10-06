// ============================================================
// INVESTOPIA TRADEAI - SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL =
    "https://gefqcdrtewehrctyxkhg.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tJ-HNM8h8xbe4M1dUQrLzA_jUV1gWVn"
    ;

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
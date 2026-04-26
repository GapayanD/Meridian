import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials.
// Get them from: https://supabase.com/dashboard → Project Settings → API
const SUPABASE_URL = "";
const SUPABASE_PUBLISHABLE_KEY = "";

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const isConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_PUBLISHABLE_KEY.length > 10;

    if (!isConfigured) {
      // Return a minimal stub that won't crash the app but will fail gracefully on DB calls
      return createClient("https://placeholder.supabase.co", "placeholder-key");
    }

    supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return supabaseClient;
};

export const supabase = getSupabase();
export const isSupabaseConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_PUBLISHABLE_KEY.length > 10;

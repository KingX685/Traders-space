import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Hard-fail if env vars aren't set, but only when something tries to USE
// Supabase. Anonymous mode stays fully functional without env vars.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        // Persist session in localStorage so reload keeps user signed in
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[Traders Space] Supabase env vars missing — running in anonymous-only mode.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env to enable accounts.'
  );
}

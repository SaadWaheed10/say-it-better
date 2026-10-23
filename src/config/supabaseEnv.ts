export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

const empty: SupabasePublicEnv = {url: '', anonKey: ''};

function loadLocal(): SupabasePublicEnv {
  try {
    // Optional local file (gitignored). Falls back to empty if missing.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const local = require('./supabase.local') as {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
    return {
      url: local.SUPABASE_URL?.trim() ?? '',
      anonKey: local.SUPABASE_ANON_KEY?.trim() ?? '',
    };
  } catch {
    return empty;
  }
}

const loaded = loadLocal();

export const SUPABASE_URL = loaded.url;
export const SUPABASE_ANON_KEY = loaded.anonKey;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

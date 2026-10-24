import 'react-native-url-polyfill/auto';
import {AppState, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient, processLock, SupabaseClient} from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from '../config/supabaseEnv';

let client: SupabaseClient | null = null;
let appStateBound = false;

const authStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

function bindAppStateRefresh(supabase: SupabaseClient): void {
  if (appStateBound || Platform.OS === 'web') {
    return;
  }
  appStateBound = true;
  // Keep tokens fresh while the app is foregrounded (RN has no tab visibility).
  AppState.addEventListener('change', state => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
  void supabase.auth.startAutoRefresh();
}

/** Shared Supabase client (anon key + AsyncStorage session). Null if not configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    });
    bindAppStateRefresh(client);
  }
  return client;
}

export function isSupabaseReady(): boolean {
  return getSupabase() != null;
}

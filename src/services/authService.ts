import type {Session, User} from '@supabase/supabase-js';
import {SUPABASE_ANON_KEY, SUPABASE_URL} from '../config/supabaseEnv';
import {getSupabase, isSupabaseReady} from './supabaseClient';

export type AuthUser = {
  id: string;
  email: string | null;
};

export type SupabaseConnectionStatus =
  | 'not_configured'
  | 'checking'
  | 'connected'
  | 'unreachable';

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }
  return {id: user.id, email: user.email ?? null};
}

export async function checkSupabaseConnection(): Promise<{
  status: Exclude<SupabaseConnectionStatus, 'checking'>;
  detail: string;
}> {
  if (!isSupabaseReady()) {
    return {
      status: 'not_configured',
      detail: 'Add URL + anon key in supabase.local.ts',
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    // Auth health requires the anon apikey header (bare GET returns 401).
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      return {
        status: 'unreachable',
        detail: `Health check failed (${response.status})${
          body ? `: ${body.slice(0, 120)}` : ''
        }`,
      };
    }

    const supabase = getSupabase();
    const {error} = (await supabase?.auth.getSession()) ?? {error: null};
    if (error) {
      return {
        status: 'connected',
        detail: `Reachable · session warning: ${error.message}`,
      };
    }

    return {
      status: 'connected',
      detail: 'Project reachable · client ready',
    };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Could not reach Supabase';
    return {status: 'unreachable', detail: message};
  }
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }
  const {data, error} = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  return toAuthUser(session?.user ?? null);
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{user: AuthUser | null; needsEmailConfirm: boolean}> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured on this device.');
  }
  const trimmed = email.trim().toLowerCase();
  const {data, error} = await supabase.auth.signUp({
    email: trimmed,
    password,
  });
  if (error) {
    throw error;
  }
  const needsEmailConfirm = Boolean(data.user) && !data.session;
  return {
    user: toAuthUser(data.user),
    needsEmailConfirm,
  };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured on this device.');
  }
  const trimmed = email.trim().toLowerCase();
  const {data, error} = await supabase.auth.signInWithPassword({
    email: trimmed,
    password,
  });
  if (error) {
    throw error;
  }
  const user = toAuthUser(data.user);
  if (!user) {
    throw new Error('Sign in succeeded but no user was returned.');
  }
  return user;
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const {error} = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export function subscribeAuth(
  listener: (user: AuthUser | null) => void,
): () => void {
  const supabase = getSupabase();
  if (!supabase) {
    listener(null);
    return () => undefined;
  }

  const {data} = supabase.auth.onAuthStateChange((_event, session) => {
    listener(toAuthUser(session?.user ?? null));
  });

  getCurrentUser()
    .then(listener)
    .catch(() => listener(null));

  return () => {
    data.subscription.unsubscribe();
  };
}

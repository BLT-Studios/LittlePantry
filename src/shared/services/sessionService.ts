import { supabase } from '@shared/libs/supabaseClient';
import { store } from '@shared/stores/store';

const EXPIRY_BUFFER_SECONDS = 60;

let revolvingSession: Promise<string | null> | null = null;

function getStoreUid() {
  return store.authStore.uid ?? null;
}

async function fetchSessionUserId(): Promise<string | null> {
  if (revolvingSession) return revolvingSession;

  revolvingSession = (async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    const expiresAt =
      session.expires_at ??
      (session.expires_in
        ? Math.floor(Date.now() / 1000) + session.expires_in
        : 0);
    const now = Math.floor(Date.now() / 1000);

    if (expiresAt && expiresAt - now <= EXPIRY_BUFFER_SECONDS) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data.session?.user?.id ?? session.user?.id ?? null;
    }

    return session.user?.id ?? null;
  })()
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      revolvingSession = null;
    });

  return revolvingSession;
}

export async function ensureAuthSession(): Promise<void> {
  if (getStoreUid()) return;
  await fetchSessionUserId();
}

export async function getActiveUserId(): Promise<string | null> {
  return getStoreUid() ?? (await fetchSessionUserId());
}

export async function requireUserId(): Promise<string> {
  const uid = await getActiveUserId();
  if (!uid) throw new Error('Not Authenticated');
  return uid;
}

function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as {
    status?: number | string;
    code?: number | string;
    message?: string;
  };

  const status = err.status ?? err.code;
  if (status !== undefined) {
    const numeric = typeof status === 'string' ? Number(status) : status;
    if (!Number.isNaN(numeric) && (numeric === 401 || numeric === 403))
      return true;
  }
  const message = err.message?.toLowerCase?.() ?? '';

  return (
    message.includes('jwt') ||
    message.includes('not authenticated') ||
    message.includes('unauthorized')
  );
}

export async function withSessionRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isAuthError(error)) throw error;
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw refreshError;
    return fn();
  }
}

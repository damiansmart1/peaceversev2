// Detects a wrong device clock from a freshly issued access token (its `iat` is server time).
export const clockSkewSeconds = (accessToken: string, nowMs: number): number | null => {
  try {
    const part = accessToken.split('.')[1];
    if (!part) return null;
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof json.iat !== 'number') return null;
    return Math.round(nowMs / 1000 - json.iat);
  } catch {
    return null;
  }
};

// Sign-ins last a day, so more than 5 refreshes within a minute means something is looping.
export const isRefreshStorm = (refreshTimesMs: number[], nowMs: number): boolean =>
  refreshTimesMs.filter(x => nowMs - x < 60000).length > 5;

// Expiry expressed in the device's own clock: now + the token's real lifetime.
// Used when the device clock is wrong, so the sign-in library stops treating every fresh token as expired.
export const localExpiresAt = (accessToken: string, nowMs: number): number | null => {
  try {
    const part = accessToken.split('.')[1];
    if (!part) return null;
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof json.iat !== 'number' || typeof json.exp !== 'number') return null;
    return Math.floor(nowMs / 1000) + (json.exp - json.iat);
  } catch {
    return null;
  }
};

type AuthStorageHolder = { storage?: { getItem: (k: string) => unknown; setItem: (k: string, v: string) => unknown }; storageKey?: string };

// A wrong device clock makes every fresh sign-in look expired, so the app renews it in a loop until the
// account is blocked and the person appears signed out. Re-express the saved expiry in the device's clock.
export const correctStoredExpiry = async (auth: unknown, session: { access_token: string; expires_at?: number }, nowMs: number) => {
  const fixed = localExpiresAt(session.access_token, nowMs);
  if (fixed === null) return;
  session.expires_at = fixed;
  const { storage, storageKey } = auth as AuthStorageHolder;
  if (!storage || !storageKey) return;
  try {
    const raw = (await storage.getItem(storageKey)) as string | null;
    if (!raw) return;
    const stored = JSON.parse(raw);
    if (stored?.access_token !== session.access_token) return;
    stored.expires_at = fixed;
    await storage.setItem(storageKey, JSON.stringify(stored));
  } catch {
    // Storage can be blocked; the clock warning still tells the person what to do.
  }
};

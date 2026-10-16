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

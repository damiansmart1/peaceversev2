import { describe, expect, test, afterEach } from 'bun:test';
import { createClient } from '@supabase/supabase-js';
import { correctStoredExpiry } from '../src/lib/authHealth';

// Fake sign-in server on the real clock; the device clock runs two days ahead.
const realNow = Date.now;
const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

const setup = (withFix) => {
  let refreshes = 0;
  const serverSec = () => Math.floor(realNow() / 1000);
  const tokenBody = () => {
    const iat = serverSec();
    const user = { id: 'u1', aud: 'authenticated', role: 'authenticated', email: 'voter@example.com', app_metadata: {}, user_metadata: {}, created_at: '' };
    return {
      access_token: `${b64({ alg: 'HS256' })}.${b64({ sub: 'u1', iat, exp: iat + 86400, email: user.email })}.sig`,
      token_type: 'bearer', expires_in: 86400, expires_at: iat + 86400, refresh_token: `r${Math.random()}`, user,
    };
  };
  const fakeFetch = async (url) => {
    const u = String(url);
    if (u.includes('grant_type=refresh_token')) refreshes++;
    if (u.includes('/token')) return new Response(JSON.stringify(tokenBody()), { status: 200, headers: { 'content-type': 'application/json' } });
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const mem = new Map();
  const client = createClient('http://fake.local', 'anon', {
    global: { fetch: fakeFetch },
    auth: { storage: { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) }, autoRefreshToken: false, persistSession: true, detectSessionInUrl: false },
  });
  if (withFix) client.auth.onAuthStateChange(async (event, session) => {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) await correctStoredExpiry(client.auth, session, Date.now());
  });
  return { client, refreshes: () => refreshes };
};

afterEach(() => { Date.now = realNow; });

describe('signed-in voter with a device clock two days ahead', () => {
  const run = async (withFix) => {
    Date.now = () => realNow() + 2 * 86400 * 1000;
    const { client, refreshes } = setup(withFix);
    await client.auth.signInWithPassword({ email: 'voter@example.com', password: 'x' });
    for (let i = 0; i < 10; i++) await client.auth.getSession();
    return refreshes();
  };

  test('without the fix, every check renews the sign-in (the loop that got people blocked)', async () => {
    expect(await run(false)).toBe(10);
  });

  test('with the fix, the sign-in is kept without renewing', async () => {
    expect(await run(true)).toBe(0);
  });
});

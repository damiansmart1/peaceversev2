import { describe, expect, test, afterEach } from 'bun:test';
import { createClient } from '@supabase/supabase-js';
import { installClockSafeStorage } from '../src/lib/authHealth';

const realNow = Date.now;
const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

const run = async (offsetMs) => {
  Date.now = () => realNow() + offsetMs;
  let refreshes = 0;
  const tokenBody = () => {
    const iat = Math.floor(realNow() / 1000);
    const user = { id: 'u1', aud: 'authenticated', role: 'authenticated', email: 'v@example.com', app_metadata: {}, user_metadata: {}, created_at: '' };
    return { access_token: `${b64({ alg: 'HS256' })}.${b64({ sub: 'u1', iat, exp: iat + 3600 })}.sig`, token_type: 'bearer', expires_in: 3600, expires_at: iat + 3600, refresh_token: `r${Math.random()}`, user };
  };
  const fakeFetch = async (url) => {
    if (String(url).includes('grant_type=refresh_token')) refreshes++;
    return new Response(JSON.stringify(String(url).includes('/token') ? tokenBody() : {}), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const mem = new Map();
  const client = createClient('http://fake.local', 'anon', {
    global: { fetch: fakeFetch },
    auth: { storage: { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) }, autoRefreshToken: false, persistSession: true, detectSessionInUrl: false },
  });
  installClockSafeStorage(client.auth);
  await client.auth.signInWithPassword({ email: 'v@example.com', password: 'x' });
  let signedIn = 0;
  for (let i = 0; i < 10; i++) if ((await client.auth.getSession()).data.session) signedIn++;
  return { refreshes, signedIn };
};

afterEach(() => { Date.now = realNow; });

describe('sign-in does not depend on the device clock', () => {
  test('device clock two days ahead stays signed in without renewing', async () => {
    expect(await run(2 * 86400 * 1000)).toEqual({ refreshes: 0, signedIn: 10 });
  });
  test('device clock two days behind stays signed in without renewing', async () => {
    expect(await run(-2 * 86400 * 1000)).toEqual({ refreshes: 0, signedIn: 10 });
  });
  test('correct device clock stays signed in without renewing', async () => {
    expect(await run(0)).toEqual({ refreshes: 0, signedIn: 10 });
  });
});

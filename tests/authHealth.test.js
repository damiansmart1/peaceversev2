import { describe, expect, test } from 'bun:test';
import { clockSkewSeconds, isRefreshStorm, localExpiresAt } from '../src/lib/authHealth';

const token = (iat) => `x.${btoa(JSON.stringify({ iat })).replace(/=+$/, '')}.y`;

describe('sign-in health checks', () => {
  test('a device clock one day ahead is detected', () => {
    expect(clockSkewSeconds(token(1000), (1000 + 86400) * 1000)).toBe(86400);
  });
  test('a correct clock shows no skew', () => {
    expect(clockSkewSeconds(token(1000), 1000 * 1000)).toBe(0);
  });
  test('more than 5 refreshes in a minute counts as a loop', () => {
    const now = 100000;
    expect(isRefreshStorm([now - 5, now - 4, now - 3, now - 2, now - 1, now], now)).toBe(true);
    expect(isRefreshStorm([now - 70000, now - 2, now - 1, now], now)).toBe(false);
  });
});

describe('localExpiresAt', () => {
  const tok = (iat, exp) => `h.${btoa(JSON.stringify({ iat, exp }))}.s`;
  it('gives a device two days ahead a full 24h sign-in on its own clock', () => {
    const now = (1000 + 2 * 86400) * 1000;
    expect(localExpiresAt(tok(1000, 1000 + 86400), now)).toBe(1000 + 2 * 86400 + 86400);
  });
});

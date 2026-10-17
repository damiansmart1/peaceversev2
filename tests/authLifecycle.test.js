import { describe, expect, test } from 'bun:test';
import { createAuthLifecycle } from '../src/lib/authLifecycle';

describe('account initialization', () => {
  test('a delayed signed-out startup read cannot erase a new sign-in', () => {
    const states = [];
    const lifecycle = createAuthLifecycle(s => states.push(s));
    lifecycle.event({ user: { id: 'invited-voter' } });
    lifecycle.initial(null);
    expect(states).toEqual([{ user: { id: 'invited-voter' } }]);
  });
  test('a delayed startup account cannot undo sign-out', () => {
    const states = [];
    const lifecycle = createAuthLifecycle(s => states.push(s));
    lifecycle.event(null);
    lifecycle.initial({ user: { id: 'previous-account' } });
    expect(states).toEqual([null]);
  });
  test('an unmounted provider ignores late session results', () => {
    const states = [];
    const lifecycle = createAuthLifecycle(s => states.push(s));
    lifecycle.dispose();
    lifecycle.initial({ user: { id: 'previous-account' } });
    lifecycle.event(null);
    expect(states).toEqual([]);
  });
});
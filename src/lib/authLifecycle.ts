/** Ignore a delayed startup read after a newer auth event or unmount. */
export function createAuthLifecycle<T>(apply: (session: T | null) => void) {
  let active = true;
  let receivedEvent = false;
  return {
    event(session: T | null) {
      receivedEvent = true;
      if (active) apply(session);
    },
    initial(session: T | null) {
      if (active && !receivedEvent) apply(session);
    },
    dispose() { active = false; },
  };
}
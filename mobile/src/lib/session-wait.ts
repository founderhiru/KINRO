/**
 * Waiting for better-auth's session store to settle after a sign-in.
 *
 * After a Google/Apple sign-in or an emailed-link sign-in, the session cookie
 * is stored and the session store is told to refetch, but the refetch is
 * asynchronous. In the short gap, the store still holds the OLD signed-out
 * value, and any redirect decided in that gap sends the person back to the
 * sign-in screen. Callers that must decide right after a sign-in wait here
 * first.
 */
export type SessionAtomValue = {
  data?: unknown;
  isPending?: boolean;
  isRefetching?: boolean;
};
export type SessionAtomLike = {
  get: () => SessionAtomValue;
  listen: (cb: (value: SessionAtomValue) => void) => () => void;
};

/**
 * Resolves true as soon as a signed-in session is present, false when a
 * refetch finishes with no session (an invalid or expired cookie), or whatever
 * the store holds when `timeoutMs` runs out. Resolves true immediately if a
 * session is already there.
 */
export function waitForSignedInSession(
  atom: SessionAtomLike,
  notifyRefetch: (() => void) | null,
  timeoutMs = 8000,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (atom.get().data) {
      resolve(true);
      return;
    }
    let settled = false;
    let sawRequest = false;
    let unsubscribe: () => void = () => {};
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(ok);
    };
    const timer = setTimeout(() => finish(!!atom.get().data), timeoutMs);
    unsubscribe = atom.listen((value) => {
      if (value.data) {
        finish(true);
        return;
      }
      if (value.isPending || value.isRefetching) {
        sawRequest = true;
        return;
      }
      // A request started and finished without producing a session.
      if (sawRequest) finish(false);
    });
    // Ask for a fresh session; the listener above resolves once it arrives.
    notifyRefetch?.();
  });
}

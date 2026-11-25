/**
 * After a browser/native sign-in finishes, @better-auth/expo stores the cookie
 * and tells the session store to refetch, but the refetch is asynchronous.
 * Navigating to "/" straight away lets the redirect read the *old* signed-out
 * session (isPending is already false), which bounces the person back to the
 * sign-in screen — they have to tap Google a second time. Waiting for the
 * refreshed session before navigating removes that race.
 */
export type SessionAtomValue = { data?: unknown };
export type SessionAtomLike = {
  get: () => SessionAtomValue;
  listen: (cb: (value: SessionAtomValue) => void) => () => void;
};

export function waitForSignedInSession(
  atom: SessionAtomLike,
  notifyRefetch: () => void,
  timeoutMs = 8000,
): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
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
      if (value.data) finish(true);
    });
    // Ask for a fresh session; the listener above resolves once it arrives.
    notifyRefetch();
  });
}

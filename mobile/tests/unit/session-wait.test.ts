import { describe, expect, it, vi } from "vitest";
import {
  type SessionAtomValue,
  waitForSignedInSession,
} from "@/lib/session-wait";

function fakeAtom(initial: SessionAtomValue = { data: null }) {
  let value = initial;
  const listeners = new Set<(v: SessionAtomValue) => void>();
  return {
    get: () => value,
    listen: (cb: (v: SessionAtomValue) => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    set(next: SessionAtomValue) {
      value = next;
      for (const l of listeners) l(next);
    },
    count: () => listeners.size,
  };
}

describe("waitForSignedInSession", () => {
  it("resolves true at once when a session is already there", async () => {
    const atom = fakeAtom({ data: { user: "a" } });
    const notify = vi.fn();
    await expect(waitForSignedInSession(atom, notify)).resolves.toBe(true);
    expect(notify).not.toHaveBeenCalled();
  });

  it("resolves true once the refreshed session arrives", async () => {
    const atom = fakeAtom();
    const p = waitForSignedInSession(atom, () =>
      setTimeout(() => atom.set({ data: { user: "a" } }), 10),
    );
    await expect(p).resolves.toBe(true);
    expect(atom.count()).toBe(0);
  });

  it("resolves false when the refetch finishes without a session", async () => {
    const atom = fakeAtom();
    const p = waitForSignedInSession(atom, () => {
      atom.set({ data: null, isPending: true, isRefetching: true });
      setTimeout(
        () => atom.set({ data: null, isPending: false, isRefetching: false }),
        10,
      );
    });
    await expect(p).resolves.toBe(false);
    expect(atom.count()).toBe(0);
  });

  it("ignores an unchanged signed-out value until a request has run", async () => {
    vi.useFakeTimers();
    const atom = fakeAtom();
    const p = waitForSignedInSession(
      atom,
      () => {
        atom.set({ data: null, isPending: false, isRefetching: false });
      },
      500,
    );
    await vi.advanceTimersByTimeAsync(600);
    await expect(p).resolves.toBe(false);
    vi.useRealTimers();
  });

  it("gives up after the timeout and reports false", async () => {
    vi.useFakeTimers();
    const atom = fakeAtom();
    const p = waitForSignedInSession(atom, null, 500);
    await vi.advanceTimersByTimeAsync(600);
    await expect(p).resolves.toBe(false);
    expect(atom.count()).toBe(0);
    vi.useRealTimers();
  });
});

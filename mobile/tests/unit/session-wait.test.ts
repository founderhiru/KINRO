import { describe, expect, it, vi } from "vitest";
import {
  type SessionAtomValue,
  waitForSignedInSession,
} from "@/lib/session-wait";

function fakeAtom() {
  let value: SessionAtomValue = { data: null };
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
  it("resolves true once the refreshed session arrives", async () => {
    const atom = fakeAtom();
    const p = waitForSignedInSession(atom, () =>
      setTimeout(() => atom.set({ data: { user: "a" } }), 10),
    );
    await expect(p).resolves.toBe(true);
    expect(atom.count()).toBe(0);
  });

  it("gives up after the timeout and reports false", async () => {
    vi.useFakeTimers();
    const atom = fakeAtom();
    const p = waitForSignedInSession(atom, () => {}, 500);
    await vi.advanceTimersByTimeAsync(600);
    await expect(p).resolves.toBe(false);
    expect(atom.count()).toBe(0);
    vi.useRealTimers();
  });
});

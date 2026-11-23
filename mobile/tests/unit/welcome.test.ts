import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  data: new Map<string, string>(),
  fail: false,
}));

vi.mock("expo-secure-store", () => ({
  getItemAsync: async (key: string) => {
    if (store.fail) throw new Error("keychain unavailable");
    return store.data.get(key) ?? null;
  },
  setItemAsync: async (key: string, value: string) => {
    if (store.fail) throw new Error("keychain unavailable");
    store.data.set(key, value);
  },
}));

import { WELCOME_TIMINGS as T } from "@/lib/welcome-motion";
import { hasSeenWelcome, markWelcomeSeen } from "@/lib/welcome-seen";

describe("welcome seen flag", () => {
  beforeEach(() => {
    store.data.clear();
    store.fail = false;
  });

  it("is not seen on first open", async () => {
    expect(await hasSeenWelcome()).toBe(false);
  });

  it("is remembered once marked", async () => {
    await markWelcomeSeen();
    expect(await hasSeenWelcome()).toBe(true);
  });

  it("treats a storage failure as not seen, without throwing", async () => {
    store.fail = true;
    await expect(markWelcomeSeen()).resolves.toBeUndefined();
    expect(await hasSeenWelcome()).toBe(false);
  });
});

describe("welcome timing", () => {
  it("shows everything before moving on by itself", () => {
    expect(T.footerDelayMs + T.footerMs).toBeLessThanOrEqual(
      T.autoContinueMs + 600,
    );
  });
  it("stays short: the animation is done within about 2.5 seconds", () => {
    expect(T.footerDelayMs + T.footerMs).toBeLessThanOrEqual(2500);
    expect(T.autoContinueMs).toBeLessThanOrEqual(3500);
  });
  it("zooms gently", () => {
    expect(T.zoomTo).toBeGreaterThan(1);
    expect(T.zoomTo).toBeLessThanOrEqual(1.12);
  });
});

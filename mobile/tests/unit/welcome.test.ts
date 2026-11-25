import { describe, expect, it, vi } from "vitest";

import { WELCOME_TIMINGS as T } from "@/lib/welcome-motion";

describe("welcome seen flag", () => {
  it("plays on a fresh launch", async () => {
    vi.resetModules();
    const { hasSeenWelcome } = await import("@/lib/welcome-seen");
    expect(await hasSeenWelcome()).toBe(false);
  });

  it("is not replayed again within the same launch", async () => {
    vi.resetModules();
    const { hasSeenWelcome, markWelcomeSeen } = await import(
      "@/lib/welcome-seen"
    );
    await markWelcomeSeen();
    expect(await hasSeenWelcome()).toBe(true);
  });

  it("plays again after the app is closed and reopened", async () => {
    vi.resetModules();
    const first = await import("@/lib/welcome-seen");
    await first.markWelcomeSeen();
    vi.resetModules();
    const second = await import("@/lib/welcome-seen");
    expect(await second.hasSeenWelcome()).toBe(false);
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

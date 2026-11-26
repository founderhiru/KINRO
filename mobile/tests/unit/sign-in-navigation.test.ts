import { describe, expect, it } from "vitest";
import { shouldLeaveSignIn, stillOnSignIn } from "@/lib/sign-in-navigation";

describe("stillOnSignIn", () => {
  it("is true while the sign-in screen is showing", () => {
    expect(stillOnSignIn("/mobile-number")).toBe(true);
    expect(stillOnSignIn("/(auth)/mobile-number")).toBe(true);
  });

  it("is false elsewhere or when unknown", () => {
    expect(stillOnSignIn("/")).toBe(false);
    expect(stillOnSignIn("/home")).toBe(false);
    expect(stillOnSignIn(null)).toBe(false);
    expect(stillOnSignIn(undefined)).toBe(false);
  });
});

describe("shouldLeaveSignIn", () => {
  it("leaves once signed in while on the sign-in screen", () => {
    expect(shouldLeaveSignIn(true, "/mobile-number")).toBe(true);
  });

  it("stays while there is no session (cancelled or still waiting)", () => {
    expect(shouldLeaveSignIn(false, "/mobile-number")).toBe(false);
  });

  it("does not navigate again once the app has already moved on", () => {
    expect(shouldLeaveSignIn(true, "/home")).toBe(false);
    expect(shouldLeaveSignIn(true, "/")).toBe(false);
  });
});

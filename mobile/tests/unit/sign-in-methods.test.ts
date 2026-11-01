import { describe, expect, it } from "vitest";
import { APPLE_SIGN_IN_READY, getSignInMethods } from "@/lib/sign-in-methods";

describe("getSignInMethods", () => {
  it("does not offer Apple until Sign in with Apple is ready", () => {
    expect(APPLE_SIGN_IN_READY).toBe(false);
    expect(getSignInMethods("ios")).toEqual(["google", "email"]);
    expect(getSignInMethods("android")).toEqual(["google", "email"]);
  });

  it("offers Apple on iOS only, once it is ready", () => {
    expect(getSignInMethods("ios", true)).toEqual(["google", "apple", "email"]);
    expect(getSignInMethods("android", true)).toEqual(["google", "email"]);
  });
});

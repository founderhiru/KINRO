import { describe, expect, it } from "vitest";
import { stillOnSignIn } from "@/lib/sign-in-navigation";

describe("stillOnSignIn", () => {
  it("is true while the sign-in screen is showing", () => {
    expect(stillOnSignIn("/mobile-number")).toBe(true);
    expect(stillOnSignIn("/(auth)/mobile-number")).toBe(true);
  });

  it("is false once a deep link has already moved the app on", () => {
    expect(stillOnSignIn("/")).toBe(false);
    expect(stillOnSignIn("/home")).toBe(false);
    expect(stillOnSignIn("/profile")).toBe(false);
  });

  it("is false when the path is unknown", () => {
    expect(stillOnSignIn(null)).toBe(false);
    expect(stillOnSignIn(undefined)).toBe(false);
  });
});

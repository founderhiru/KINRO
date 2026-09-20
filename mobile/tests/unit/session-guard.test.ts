import { describe, expect, it } from "vitest";
import { ROUTES, resolveInitialRoute } from "@/lib/session-guard";

describe("resolveInitialRoute", () => {
  it("returns null while the session status is still loading (stay on splash)", () => {
    expect(resolveInitialRoute("loading")).toBeNull();
  });

  it("routes to Home when authenticated", () => {
    expect(resolveInitialRoute("authenticated")).toBe(ROUTES.home);
  });

  it("routes to Welcome when unauthenticated", () => {
    expect(resolveInitialRoute("unauthenticated")).toBe(ROUTES.welcome);
  });

  it("keeps Home and My Dogs as two different tabs", () => {
    expect(ROUTES.home).toBe("/(app)/(tabs)/home");
    expect(ROUTES.myDogs).toBe("/(app)/(tabs)/my-dog");
    expect(ROUTES.home).not.toBe(ROUTES.myDogs);
  });

  it("points the intro flow at the right screens", () => {
    expect(ROUTES.welcome).toBe("/welcome");
    expect(ROUTES.onboarding).toBe("/onboarding");
    expect(ROUTES.signIn).toBe("/(auth)/mobile-number");
  });
});

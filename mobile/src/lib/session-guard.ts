// Mobile (Phase mobile-M1) — pure routing-decision logic, deliberately kept
// free of any Expo Router / React Native import so it can be unit-tested
// directly (see tests/unit/session-guard.test.ts).

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export const ROUTES = {
  home: "/(app)/(tabs)/home",
  discover: "/(app)/(tabs)/discover",
  myDogs: "/(app)/(tabs)/my-dog",
  welcome: "/welcome",
  onboarding: "/onboarding",
  signIn: "/(auth)/mobile-number",
} as const;

/**
 * Decides where the root screen (app/index.tsx) should redirect to, given
 * the current session status. Returns null while the status is still
 * loading, meaning "stay on the splash screen — don't redirect yet".
 *
 * Everyone lands on Home after the launch splash: Home is guest-first (a
 * signed-out visitor sees the guest Home with its Sign in call to action),
 * so the Welcome/onboarding intro is no longer part of the automatic launch
 * flow. Those screens are kept (ROUTES.welcome / ROUTES.onboarding) for
 * later use.
 */
export function resolveInitialRoute(status: SessionStatus): string | null {
  if (status === "loading") {
    return null;
  }
  return ROUTES.home;
}

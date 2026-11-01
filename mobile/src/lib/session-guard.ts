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
  tour: "/(auth)/tour",
} as const;

/**
 * Decides where the root screen (app/index.tsx) should redirect to, given
 * the current session status. Returns null while the status is still
 * loading, meaning "stay on the splash screen — don't redirect yet".
 *
 * Signed-in users land on Home. Signed-out visitors land on the sign-in
 * screen (the launch splash's round arrow continues there). Guest browsing is
 * still one tap away: the sign-in screen and the tour both offer "Browse as
 * guest", which opens the guest Home (app/(app)/_layout.tsx is not gated), so
 * the app never forces an account just to look around.
 */
export function resolveInitialRoute(status: SessionStatus): string | null {
  if (status === "loading") {
    return null;
  }
  return status === "authenticated" ? ROUTES.home : ROUTES.signIn;
}

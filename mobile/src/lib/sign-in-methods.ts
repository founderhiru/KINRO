// Which "continue with" options the sign-in screen offers besides the mobile
// number. Pure so it can be unit-tested without React Native.
//
// Apple stays hidden until Sign in with Apple works end to end: the native
// handler in app/(auth)/mobile-number.tsx and the server's Apple provider
// (src/lib/auth.ts) are both in place, but they need an Apple Developer
// account, the "Sign in with Apple" capability on the app's identifier, and
// APPLE_APP_BUNDLE_IDENTIFIER set on the server (see docs/apple-sign-in.md).
// Showing a button that cannot sign anyone in is worse than not showing it,
// so the button appears only when EXPO_PUBLIC_APPLE_SIGN_IN=true is set in the
// app build (eas.json) — flip it once the server side is live.

export type SignInMethod = "google" | "apple" | "email";

export const APPLE_SIGN_IN_READY =
  process.env.EXPO_PUBLIC_APPLE_SIGN_IN === "true";

export function getSignInMethods(
  platform: string,
  appleReady: boolean = APPLE_SIGN_IN_READY,
): SignInMethod[] {
  const methods: SignInMethod[] = ["google"];
  // Sign in with Apple is offered on iOS only, and only once it works.
  if (appleReady && platform === "ios") methods.push("apple");
  methods.push("email");
  return methods;
}

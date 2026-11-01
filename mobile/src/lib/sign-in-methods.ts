// Which "continue with" options the sign-in screen offers besides the mobile
// number. Pure so it can be unit-tested without React Native.
//
// Apple is deliberately absent until Sign in with Apple actually works end to
// end (an Apple Developer account, the Apple provider configured on the
// server, and a native sign-in handler in the app). Showing a button that
// cannot sign anyone in is worse than not showing it. When that work is done,
// set APPLE_SIGN_IN_READY to true and implement the handler in
// app/(auth)/mobile-number.tsx.

export type SignInMethod = "google" | "apple" | "email";

export const APPLE_SIGN_IN_READY = false;

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

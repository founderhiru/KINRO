/**
 * After a Google sign-in, Android also delivers the return link
 * (`canidknot:///?cookie=...`) to the app as a deep link, which already moves
 * the person on. If the sign-in screen has already been left by the time the
 * sign-in call finishes, navigating again would show a second, redundant
 * refresh. Only navigate while still on the sign-in screen.
 */
export function stillOnSignIn(pathname: string | null | undefined): boolean {
  return !!pathname && pathname.includes("mobile-number");
}

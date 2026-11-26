/**
 * Where the sign-in screen sends people once they are signed in.
 *
 * The sign-in screen does not navigate after the Google/Apple call returns,
 * because that call cannot tell "signed in" from "closed the browser", and on
 * Android the return link also moves the app on by itself. Instead the screen
 * reacts to the session: as soon as a session exists and the sign-in screen is
 * still the one showing, it leaves for Home — exactly once, whichever order
 * things arrive in.
 */
export function stillOnSignIn(pathname: string | null | undefined): boolean {
  return !!pathname && pathname.includes("mobile-number");
}

export function shouldLeaveSignIn(
  hasSession: boolean,
  pathname: string | null | undefined,
): boolean {
  return hasSession && stillOnSignIn(pathname);
}

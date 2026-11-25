/**
 * The animated welcome plays on every cold launch while signed out, and not
 * again until the app is closed and reopened.
 *
 * It used to be remembered in the iOS Keychain (expo-secure-store). The Keychain
 * survives deleting and reinstalling the app, so after the first ever open the
 * welcome never played again, even on a fresh install. This keeps the
 * "once per launch" memory in the app's own memory instead: it resets on every
 * cold start and on reinstall. Signed-in people skip the welcome entirely (see
 * app/index.tsx), so it only ever appears to signed-out visitors.
 */
let shownThisLaunch = false;

export async function hasSeenWelcome(): Promise<boolean> {
  return shownThisLaunch;
}

export async function markWelcomeSeen(): Promise<void> {
  shownThisLaunch = true;
}

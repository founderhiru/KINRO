import type { AppStateStatus } from "react-native";

/**
 * Decides when the brand splash should replay as the app comes back to the
 * foreground. Pure so it can be unit-tested without React Native.
 *
 * It only fires on active after the app has really been in the background.
 * An inactive -> active round trip on its own (Control Center, a
 * notification banner, a permission or Face ID prompt) is not the app being
 * minimized, so it does not count. A cold launch never fires either, since
 * no background state has been seen yet.
 */
export function nextResumeState(
  wasBackgrounded: boolean,
  next: AppStateStatus,
): { wasBackgrounded: boolean; showSplash: boolean } {
  if (next === "background") {
    return { wasBackgrounded: true, showSplash: false };
  }
  if (next === "active") {
    return { wasBackgrounded: false, showSplash: wasBackgrounded };
  }
  // "inactive" (iOS passes through it both ways) and anything else: keep
  // waiting for the transition to settle.
  return { wasBackgrounded, showSplash: false };
}

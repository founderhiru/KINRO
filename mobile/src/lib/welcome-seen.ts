import * as SecureStore from "expo-secure-store";

/**
 * Remembers that the full animated welcome has been shown once, so returning
 * visitors go straight on instead of waiting through it again. If storage is
 * unavailable we treat the welcome as not yet seen, which is the safe side:
 * the person sees it, and it can be skipped with a tap.
 */
const KEY = "kinro_welcome_seen_v1";

export async function hasSeenWelcome(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY)) === "1";
  } catch {
    return false;
  }
}

export async function markWelcomeSeen(): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, "1");
  } catch {
    // Not being able to remember it is harmless.
  }
}

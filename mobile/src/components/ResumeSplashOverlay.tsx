import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";
import { AppLaunchSplash } from "@/components/AppLaunchSplash";
import { nextResumeState } from "@/lib/app-resume";

/**
 * Replays the KINRO brand splash (the short "resume" variant, ~800ms) when
 * the app comes back from the background. It is only an overlay on top of
 * the navigator in app/_layout.tsx: nothing underneath is unmounted or
 * navigated, so the user lands back on exactly the screen they left.
 * Cold launches are left to app/index.tsx's own launch splash.
 */
export function ResumeSplashOverlay() {
  const wasBackgrounded = useRef(false);
  // A fresh key per resume remounts the splash, so its one-shot animation
  // plays from the start each time; null means nothing is shown.
  const [splashKey, setSplashKey] = useState<number | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      const result = nextResumeState(wasBackgrounded.current, next);
      wasBackgrounded.current = result.wasBackgrounded;
      if (result.showSplash) setSplashKey((key) => (key ?? 0) + 1);
    });
    return () => subscription.remove();
  }, []);

  if (splashKey === null) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <AppLaunchSplash
        key={splashKey}
        variant="resume"
        onFinish={() => setSplashKey(null)}
      />
    </View>
  );
}

import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppLaunchSplash } from "@/components/AppLaunchSplash";
import { ResumeSplashOverlay } from "@/components/ResumeSplashOverlay";

export default function RootLayout() {
  // Cold launch only: the root layout mounts once per process.
  const [showLaunchSplash, setShowLaunchSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Both splashes are overlays above the navigator rather than inside it.
  // On launch, app/index.tsx resolves the session and redirects to Home
  // underneath the splash (the work isn't delayed, only the reveal), and the
  // fade-out reveals Home. On resume, the current route is never touched.
  return (
    <View style={styles.fill}>
      <Slot />
      {showLaunchSplash ? (
        <View style={StyleSheet.absoluteFill}>
          <AppLaunchSplash onFinish={() => setShowLaunchSplash(false)} />
        </View>
      ) : null}
      <ResumeSplashOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

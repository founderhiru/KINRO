import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme/tokens";

interface ScreenProps {
  /** For full-bleed screens (Splash/Welcome hero) that manage their own edge-to-edge layout. */
  noPadding?: boolean;
  /**
   * Which screen edges get safe-area padding. Screens inside the bottom tab
   * bar pass ["top"]: the tab bar already sits above the home indicator, so a
   * bottom inset here would only waste a strip of space above it.
   */
  edges?: readonly Edge[];
}

/** Safe-area + padded background wrapper used by every screen. */
export function Screen({
  children,
  noPadding,
  edges = ["top", "bottom"],
}: PropsWithChildren<ScreenProps>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges as Edge[]}>
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  noPadding: { paddingHorizontal: 0 },
});

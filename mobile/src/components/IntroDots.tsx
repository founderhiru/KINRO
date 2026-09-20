import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/theme/tokens";

/**
 * Page indicator for the intro flow (Splash / Welcome / Onboarding): the
 * active dot is a wider pill. `tone` picks contrast for dark photo
 * backgrounds ("light") or cream backgrounds ("dark"). Purely decorative —
 * hidden from screen readers.
 */
export function IntroDots({
  total,
  active,
  tone = "dark",
}: {
  total: number;
  active: number;
  tone?: "light" | "dark";
}) {
  return (
    <View
      style={styles.row}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={`intro-dot-${
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, never reordered.
            i
          }`}
          style={[
            styles.dot,
            tone === "light" ? styles.dotLight : styles.dotDark,
            i === active &&
              (tone === "light" ? styles.activeLight : styles.activeDark),
            i === active && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  dotActive: { width: 22 },
  dotLight: { backgroundColor: "rgba(255,255,255,0.45)" },
  dotDark: { backgroundColor: colors.borderStrong },
  activeLight: { backgroundColor: "#FFFFFF" },
  activeDark: { backgroundColor: colors.accent },
});

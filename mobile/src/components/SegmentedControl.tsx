import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme/tokens";

interface Option<T extends string> {
  value: T;
  label: string;
}

/** Two-or-three way switch in the KINRO look (sand track, white active pill). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && styles.active]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.md,
    padding: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md - 3,
  },
  active: { backgroundColor: colors.surface },
  label: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
  labelActive: { fontWeight: "700", color: colors.accentDark },
});

import { StyleSheet, Text, View } from "react-native";
import type { HealthRecordItem } from "@/lib/health-contracts";
import { passportProgress } from "@/lib/passport-progress";
import { colors, spacing, typography } from "@/theme/tokens";

/** A quiet three-segment indicator: vaccination, vet visit, document. */
export function PassportProgress({
  records,
}: {
  records: readonly HealthRecordItem[];
}) {
  const p = passportProgress(records);
  const segs = [p.vaccination, p.vetVisit, p.document];
  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`Health Passport, ${p.done} of ${p.total} complete`}
    >
      <View style={styles.bar}>
        {segs.map((on, i) => (
          <View
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed three segments
            key={i}
            style={[styles.seg, on && styles.segOn]}
          />
        ))}
      </View>
      <Text style={[typography.bodyMuted, styles.label]}>
        Passport {p.done}/{p.total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm },
  bar: { flexDirection: "row", gap: 4 },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentTint,
  },
  segOn: { backgroundColor: colors.accent },
  label: { fontSize: 11, marginTop: 4 },
});

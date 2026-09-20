import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/theme/tokens";

type Tone = "success" | "warning" | "neutral";

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: colors.successTint, fg: colors.success },
  warning: { bg: colors.warningTint, fg: colors.warning },
  neutral: { bg: colors.accentTint, fg: colors.accentDark },
};

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: Tone;
}) {
  const { bg, fg } = TONE_STYLES[tone];
  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

/**
 * Intentionally renders nothing for now. KINRO has no verification process
 * yet, so `isVerified` (which is still stored) must not be shown to people
 * as if someone had checked the dog. Call sites are left in place so the
 * badge can return, with a real meaning, once a verification workflow exists.
 */
export function VerifiedBadge() {
  return null;
}

/**
 * The owner has added at least one health record. This says records exist,
 * not that anyone (KINRO, a vet or a lab) has checked them — so the wording
 * and tone are deliberately neutral.
 */
export function HealthBadge({ hasRecords }: { hasRecords: boolean }) {
  return hasRecords ? <Badge label="Health records" tone="neutral" /> : null;
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  text: { ...typography.caption, fontWeight: "700" },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import type { CareProviderItem } from "@/lib/care-contracts";
import { colors, elevation, radius, spacing, typography } from "@/theme/tokens";

/** Honest credential label: only "verified" says Verified by KINRO. */
export function VerificationBadge({ status }: { status: string }) {
  if (status === "verified") {
    return <Badge label="Verified by KINRO" tone="success" />;
  }
  if (status === "expired") {
    return <Badge label="Verification expired" tone="warning" />;
  }
  return <Badge label="Not yet verified" tone="neutral" />;
}

export function ProviderRow({
  provider,
  onPress,
}: {
  provider: CareProviderItem;
  onPress: () => void;
}) {
  const place = [provider.locality, provider.city].filter(Boolean).join(", ");
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${provider.name}, ${place}`}
      onPress={onPress}
    >
      <Card style={styles.card}>
        <View style={styles.body}>
          <Text style={styles.name}>{provider.name}</Text>
          {provider.specialties.length > 0 ? (
            <Text style={typography.bodyMuted}>
              {provider.specialties.join(" · ")}
            </Text>
          ) : null}
          <Text style={typography.bodyMuted}>{place}</Text>
          <View style={styles.badge}>
            <VerificationBadge status={provider.verificationStatus} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    ...elevation.card,
  },
  body: { gap: 2 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  badge: { marginTop: spacing.xs },
});

import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import type { NearbyPlace } from "@/lib/care-contracts";
import { colors, elevation, radius, spacing, typography } from "@/theme/tokens";

// A listing from Google. Honest label: never "Verified by KINRO".
export function NearbyRow({ place }: { place: NearbyPlace }) {
  const rating =
    place.rating !== null
      ? `${place.rating.toFixed(1)} ★${place.ratingCount ? ` (${place.ratingCount})` : ""}`
      : null;
  const call = place.phone
    ? () => Linking.openURL(`tel:${place.phone?.replace(/[^\d+]/g, "")}`)
    : null;
  const directions = place.mapsUrl
    ? () => Linking.openURL(place.mapsUrl as string)
    : null;
  return (
    <Card style={styles.card}>
      <Text style={styles.name}>{place.name}</Text>
      {place.address ? (
        <Text style={typography.bodyMuted}>{place.address}</Text>
      ) : null}
      <View style={styles.meta}>
        {rating ? <Text style={typography.bodyMuted}>{rating}</Text> : null}
        {place.openNow !== null ? (
          <Badge
            label={place.openNow ? "Open now" : "Closed now"}
            tone={place.openNow ? "success" : "neutral"}
          />
        ) : null}
        <Badge label="Not verified by KINRO" tone="neutral" />
      </View>
      <View style={styles.actions}>
        {call ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Call ${place.name}`}
            onPress={call}
            style={styles.action}
          >
            <Text style={styles.actionText}>Call</Text>
          </Pressable>
        ) : null}
        {directions ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Directions to ${place.name}`}
            onPress={directions}
            style={styles.action}
          >
            <Text style={styles.actionText}>Directions</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    ...elevation.card,
  },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  action: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: colors.accentDark, fontWeight: "700", fontSize: 14 },
});

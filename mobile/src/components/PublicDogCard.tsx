import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { HealthBadge } from "@/components/Badge";
import { DogPhoto } from "@/components/DogPhoto";
import type { DogProfileItem } from "@/lib/discover-contracts";
import {
  colors,
  elevation,
  pressedOpacity,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

const THUMB_SIZE = 76;

/**
 * Discover list row for a PUBLIC dog profile: thumbnail, name, breed · age and
 * location. Distance is shown only when the server computed one (i.e. a city
 * was chosen). No owner actions, and no trust badge — nothing on this card
 * claims the dog or its records were verified.
 */
export function PublicDogCard({
  dog,
  onPress,
}: {
  dog: DogProfileItem;
  onPress: () => void;
}) {
  const age = `${dog.ageYears} ${dog.ageYears === 1 ? "yr" : "yrs"}`;
  const location =
    dog.distanceKm != null
      ? `${dog.city} · ${dog.distanceKm} km away`
      : dog.city;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        elevation.card,
        pressed && { opacity: pressedOpacity },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${dog.name}, ${dog.breed}, ${age}, ${location}`}
    >
      <DogPhoto
        uri={dog.coverPhotoUrl}
        breed={dog.breed}
        sampleLabel="Sample photo"
        style={styles.photo}
      />
      <View style={styles.info}>
        <Text style={typography.sectionTitle} numberOfLines={1}>
          {dog.name}
        </Text>
        <Text style={[typography.bodyMuted, styles.meta]} numberOfLines={1}>
          {dog.breed} · {age}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.accent} />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>
        <HealthBadge hasRecords={dog.hasHealthRecords} />
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.borderStrong}
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  photo: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  info: { flex: 1, gap: 2, minWidth: 0 },
  meta: { marginTop: 0 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  location: { ...typography.caption, flexShrink: 1 },
  chevron: { marginRight: spacing.xs },
});

import { Image, StyleSheet, Text, View } from "react-native";
import { getBreedSamplePhoto } from "@/lib/breed-images";
import { colors, radius, spacing, typography } from "@/theme/tokens";

const STACK = [
  "German Shepherd",
  "Beagle",
  "Golden Retriever",
  "Labrador Retriever",
] as const;

/**
 * The honest "nothing here yet" card for dog listings: shown instead of a thin
 * or empty list while a city has few real dogs. It never shows invented dogs;
 * the little photo stack is just licensed breed samples as decoration.
 */
export function FirstInCityCard({ city }: { city?: string | null }) {
  const title = city
    ? `Be one of the first in ${city}`
    : "Be one of the first on KINRO";
  return (
    <View style={styles.card}>
      <View style={styles.stack} accessibilityElementsHidden>
        {STACK.map((breed, i) => {
          const photo = getBreedSamplePhoto(breed);
          return photo ? (
            <Image
              key={breed}
              source={photo}
              style={[styles.stackPhoto, i > 0 && styles.stackOverlap]}
            />
          ) : null;
        })}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>
        KINRO is opening city by city. Dogs show up here as more owners join.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    marginTop: spacing.sm,
  },
  stack: { flexDirection: "row", marginBottom: spacing.sm + 2 },
  stackPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.backgroundAlt,
  },
  stackOverlap: { marginLeft: -12 },
  title: { ...typography.sectionTitle, textAlign: "center" },
  message: {
    ...typography.bodyMuted,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 300,
  },
});

import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Floaty } from "@/components/Floaty";
import { getBreedSamplePhoto } from "@/lib/breed-images";
import { colors, pressedOpacity, radius, spacing } from "@/theme/tokens";

const PHOTO_A = getBreedSamplePhoto("Golden Retriever");
const PHOTO_B = getBreedSamplePhoto("Beagle");

/**
 * Home's welcome card for an owner with no dog yet: a deep-green card with two
 * gently floating breed photos and one clear action. The photos are licensed
 * breed samples, not real profiles.
 */
export function FirstDogCard({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title} accessibilityRole="header">
          Add your first dog
        </Text>
        <Text style={styles.message}>
          Name, breed, city and a photo. Health records can wait.
        </Text>
      </View>

      <View style={styles.photos} accessibilityElementsHidden>
        {PHOTO_A ? (
          <Floaty rotate="-6deg" style={styles.photoA}>
            <Image source={PHOTO_A} style={styles.photo} />
          </Floaty>
        ) : null}
        {PHOTO_B ? (
          <Floaty rotate="6deg" delayMs={900} style={styles.photoB}>
            <Image source={PHOTO_B} style={styles.photo} />
          </Floaty>
        ) : null}
      </View>

      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        accessibilityLabel="Add my dog"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Add my dog</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentDark,
    borderRadius: radius.xl,
    padding: spacing.cardPadding + 2,
    minHeight: 220,
    overflow: "hidden",
  },
  copy: { width: "48%" },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.background,
  },
  message: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(251,248,243,0.86)",
  },
  photos: { position: "absolute", top: 0, right: 0, bottom: 0, width: "50%" },
  photoA: { position: "absolute", top: 24, left: 4 },
  photoB: { position: "absolute", top: 40, right: 16 },
  photo: {
    width: 82,
    height: 98,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.background,
  },
  button: {
    position: "absolute",
    left: spacing.cardPadding + 2,
    right: spacing.cardPadding + 2,
    bottom: spacing.cardPadding,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "700", color: colors.accentDark },
  pressed: { opacity: pressedOpacity },
});

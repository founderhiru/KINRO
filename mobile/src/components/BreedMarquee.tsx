import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { getBreedSamplePhoto } from "@/lib/breed-images";
import { useReduceMotion } from "@/lib/use-reduce-motion";
import { colors, spacing, typography } from "@/theme/tokens";

const BREEDS = [
  "German Shepherd",
  "Beagle",
  "Golden Retriever",
  "Labrador Retriever",
  "Pug",
  "Dachshund",
] as const;

const ITEM_WIDTH = 104;
const GAP = spacing.sm + 2;
const PHOTO = 72;
/** One full pass of the list; the strip is drawn twice so the loop has no seam. */
const CYCLE = BREEDS.length * (ITEM_WIDTH + GAP);

/**
 * A slow, endless strip of breed photos ("Pick your breed, or add your own").
 * Purely decorative: it is hidden from screen readers and holds still under
 * Reduce Motion. The photos are licensed breed samples, not real profiles.
 */
export function BreedMarquee() {
  const reduceMotion = useReduceMotion();
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      x.setValue(0);
      return;
    }
    x.setValue(0);
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: -CYCLE,
        duration: BREEDS.length * 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, x]);

  const items = [...BREEDS, ...BREEDS];

  return (
    <View
      style={styles.clip}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.row, { transform: [{ translateX: x }] }]}>
        {items.map((breed, i) => {
          const photo = getBreedSamplePhoto(breed);
          return (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed, duplicated list.
              key={`${breed}-${i}`}
              style={styles.item}
            >
              {photo ? (
                <Image source={photo} style={styles.photo} />
              ) : (
                <View style={styles.photo} />
              )}
              <Text style={styles.name} numberOfLines={1}>
                {breed}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Bleeds to the screen edges, past the screen's own horizontal padding.
  clip: { marginHorizontal: -spacing.screenPadding, overflow: "hidden" },
  row: { flexDirection: "row", gap: GAP, paddingLeft: spacing.screenPadding },
  item: { width: ITEM_WIDTH, alignItems: "center" },
  photo: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: PHOTO / 2,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.accentTint,
  },
  name: { ...typography.caption, fontWeight: "700", marginTop: 6 },
});

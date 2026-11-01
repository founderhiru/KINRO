import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Floaty } from "@/components/Floaty";
import { getBreedSamplePhoto } from "@/lib/breed-images";
import { ROUTES } from "@/lib/session-guard";
import {
  nextStoryIndex,
  prevStoryIndex,
  STORY_DURATION_MS,
  TOUR_STORIES,
  type TourStoryId,
} from "@/lib/tour-stories";
import { useReduceMotion } from "@/lib/use-reduce-motion";
import { brandField, colors, radius, spacing } from "@/theme/tokens";

/**
 * A short, auto-playing preview of KINRO shown before sign-in: four "stories"
 * (progress bars on top, tap right/left to move). The photos are licensed
 * breed samples and the cards are static illustrations of the app, nothing
 * here reads real data, and it says so on screen. Under Reduce Motion the
 * tour does not advance by itself.
 */
export default function TourScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const [index, setIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;

  const story = TOUR_STORIES[index];
  const isLast = index === TOUR_STORIES.length - 1;

  // biome-ignore lint/correctness/useExhaustiveDependencies: restarts per story.
  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    progress.setValue(0);
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const run = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    run.start(({ finished }) => {
      if (!finished) return;
      const next = nextStoryIndex(index, TOUR_STORIES.length);
      if (next !== null) setIndex(next);
    });
    return () => run.stop();
  }, [index, reduceMotion]);

  function goNext() {
    const next = nextStoryIndex(index, TOUR_STORIES.length);
    if (next !== null) setIndex(next);
  }

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.signIn);
  }

  if (!story) return null;

  const photo = getBreedSamplePhoto(story.breed);
  const photoWidth = Math.min(168, Math.round(width * 0.43));

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View
        style={[styles.bars, { top: insets.top + 8 }]}
        accessibilityElementsHidden
      >
        {TOUR_STORIES.map((s, i) => (
          <View key={s.id} style={styles.track}>
            <Animated.View
              style={[
                styles.fill,
                {
                  width:
                    i < index
                      ? "100%"
                      : i === index
                        ? progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          })
                        : "0%",
                },
              ]}
            />
          </View>
        ))}
      </View>

      <View style={[styles.topRow, { top: insets.top + 24 }]}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>PREVIEW</Text>
        </View>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close tour"
          hitSlop={8}
          style={styles.close}
        >
          <Ionicons name="close" size={22} color={brandField.text} />
        </Pressable>
      </View>

      <View style={[styles.stage, { paddingTop: insets.top + 96 }]}>
        <Animated.View
          style={[
            styles.story,
            {
              opacity: enter,
              transform: [
                {
                  translateY: enter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.art}>
            <View style={styles.halo} />
            {photo ? (
              <Floaty rotate={index % 2 === 0 ? "-4deg" : "4deg"}>
                <Image
                  source={photo}
                  style={[
                    styles.photo,
                    {
                      width: photoWidth,
                      height: Math.round(photoWidth * 1.17),
                    },
                  ]}
                  accessibilityLabel={`Sample ${story.breed} photo`}
                />
              </Floaty>
            ) : null}
            <View style={styles.glimpse}>
              <Glimpse id={story.id} />
            </View>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {story.title}
          </Text>
          <Text style={styles.subtitle}>{story.subtitle}</Text>
        </Animated.View>

        {/* Tap zones: left third goes back, the rest goes forward. */}
        <View style={styles.zones} pointerEvents="box-none">
          <Pressable
            style={styles.zoneBack}
            onPress={() => setIndex(prevStoryIndex(index))}
            accessibilityRole="button"
            accessibilityLabel="Previous"
          />
          <Pressable
            style={styles.zoneNext}
            onPress={goNext}
            accessibilityRole="button"
            accessibilityLabel="Next"
          />
        </View>
      </View>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Text style={styles.caption}>Sample photos and screens</Text>
        <Pressable
          onPress={() => router.replace(ROUTES.signIn)}
          accessibilityRole="button"
          accessibilityLabel="Sign in to get started"
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>Sign in to get started</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace(ROUTES.home)}
          accessibilityRole="button"
          accessibilityLabel="Browse as guest"
          hitSlop={8}
          style={styles.guest}
        >
          <Text style={styles.guestText}>
            {isLast ? "Or browse as a guest" : "Browse as guest"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/** A small static card that hints at the screen each story is about. */
function Glimpse({ id }: { id: TourStoryId }) {
  if (id === "dogs") {
    return (
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: colors.promoWarm }]}>
          <Ionicons name="time-outline" size={18} color={colors.text} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.gTitle}>Vaccination due soon</Text>
          <Text style={styles.gMeta}>Reminders for every dog</Text>
        </View>
      </View>
    );
  }
  if (id === "nearby") {
    return (
      <View>
        <View style={[styles.row, styles.chips]}>
          {["Breed", "City"].map((label) => (
            <View key={label} style={styles.chip}>
              <Text style={styles.chipText}>{label}</Text>
              <Ionicons
                name="chevron-down"
                size={12}
                color={colors.accentDark}
              />
            </View>
          ))}
        </View>
        <Text style={styles.gTitle}>Dogs near you</Text>
        <Text style={styles.gMeta}>Any city in India, any breed</Text>
      </View>
    );
  }
  if (id === "health") {
    return (
      <View style={styles.checks}>
        {["Vaccinations", "Vet visits", "Documents"].map((label) => (
          <View key={label} style={styles.row}>
            <View style={styles.check}>
              <Ionicons name="checkmark" size={13} color={colors.accentDark} />
            </View>
            <Text style={styles.gTitle}>{label}</Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View>
      <View style={[styles.bubble, styles.bubbleThem]}>
        <Text style={styles.bubbleText}>Would your dog like to meet?</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleMe]}>
        <Text style={[styles.bubbleText, { color: colors.accentText }]}>
          Yes, this weekend!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brandField.background },
  flex: { flex: 1 },
  bars: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 6,
    zIndex: 3,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(251,248,243,0.3)",
    overflow: "hidden",
  },
  fill: { height: 4, backgroundColor: brandField.tagline },
  topRow: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 3,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: "rgba(251,248,243,0.16)",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: brandField.tagline,
  },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(251,248,243,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  stage: { flex: 1 },
  story: { flex: 1, alignItems: "center" },
  art: {
    height: 330,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  halo: {
    position: "absolute",
    top: 24,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(251,248,243,0.07)",
  },
  photo: {
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.background,
    marginTop: 10,
  },
  glimpse: {
    position: "absolute",
    top: 190,
    width: 250,
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    marginTop: spacing.md,
    paddingHorizontal: 28,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: brandField.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    paddingHorizontal: 32,
    fontSize: 15,
    lineHeight: 22,
    color: brandField.textMuted,
    textAlign: "center",
  },
  zones: {
    ...StyleSheet.absoluteFillObject,
    top: 96,
    flexDirection: "row",
  },
  zoneBack: { flex: 1 },
  zoneNext: { flex: 2 },
  footer: { paddingHorizontal: 22, alignItems: "center" },
  caption: { fontSize: 12, color: brandField.textFaint, marginBottom: 10 },
  cta: {
    alignSelf: "stretch",
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { fontSize: 17, fontWeight: "700", color: colors.accentDark },
  guest: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  guestText: {
    fontSize: 14,
    fontWeight: "600",
    color: brandField.textMuted,
    textDecorationLine: "underline",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  gTitle: { fontSize: 13.5, fontWeight: "700", color: colors.text },
  gMeta: { fontSize: 12, color: colors.textMuted },
  chips: { marginBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accentTint,
  },
  chipText: { fontSize: 12, fontWeight: "700", color: colors.accentDark },
  checks: { gap: 6 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginVertical: 3,
    alignSelf: "flex-start",
  },
  bubbleThem: { backgroundColor: colors.backgroundAlt },
  bubbleMe: { backgroundColor: colors.accent, alignSelf: "flex-end" },
  bubbleText: { fontSize: 13, color: colors.text },
});

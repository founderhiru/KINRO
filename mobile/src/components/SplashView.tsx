import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { IntroDots } from "@/components/IntroDots";
import { BottomFade, ScrimGradient } from "@/components/ScrimGradient";
import { colors, elevation, spacing } from "@/theme/tokens";

/**
 * Number of indicator dots shown across the intro flow. Only Onboarding 1
 * exists, so the indicator is a single pill — it must not suggest further
 * stages. Raise this (and add steps in app/onboarding.tsx) when they are built.
 */
export const INTRO_DOT_COUNT = 1;

/**
 * KINRO launch screen: full-bleed golden retriever photo, dark gradient,
 * logo + tagline at the top, headline and the round "continue" arrow at the
 * bottom. While the session is still resolving `onContinue` is undefined and
 * a small spinner takes the arrow's place.
 */
/**
 * The photo takes the top part of the screen (in proportion to the screen's own
 * height, so it scales on every iPhone) and dissolves into the brand green
 * beneath it, where the headline sits. This keeps the dog at a comfortable size
 * instead of magnifying a small photo to fill the whole display.
 */
export const SPLASH_PHOTO_HEIGHT_RATIO = 0.8;
/** Where the fade into the brand green starts, as a share of the photo's height. */
const PHOTO_FADE_START = 0.55;
const BRAND_GREEN_RGB = "35,79,59"; // colors.accentDark (#234F3B)

export function SplashView({ onContinue }: { onContinue?: () => void }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const headlineSize = Math.max(26, Math.min(36, Math.round(width * 0.085)));
  const photoHeight = Math.round(height * SPLASH_PHOTO_HEIGHT_RATIO);

  return (
    <View style={styles.fill}>
      {/* An absolutely-positioned Image with explicit 100% size (rather
          than ImageBackground) so the photo fills the screen on every
          platform, including react-native-web previews. */}
      <Image
        source={require("../../assets/images/photos/splash-dog.jpg")}
        style={[styles.photo, { height: photoHeight }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <BottomFade
        top={Math.round(photoHeight * PHOTO_FADE_START)}
        height={photoHeight - Math.round(photoHeight * PHOTO_FADE_START)}
        rgb={BRAND_GREEN_RGB}
      />
      <ScrimGradient />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.lg,
          },
        ]}
      >
        <View style={styles.brand}>
          <View style={styles.logoTile}>
            {/* Plays once when the splash opens, and again on tap. */}
            <AnimatedLogo width={LOGO_WIDTH} playOnMount />
          </View>
          <Text style={styles.wordmark} accessibilityRole="header">
            KINRO
          </Text>
          <Text style={styles.tagline}>Dogs bring people closer</Text>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.headline,
              {
                fontSize: headlineSize,
                lineHeight: Math.round(headlineSize * 1.2),
              },
            ]}
          >
            A happier world for dogs and the people who love them.
          </Text>
          <View style={styles.footerRow}>
            <IntroDots total={INTRO_DOT_COUNT} active={0} tone="light" />
            {onContinue ? (
              <Pressable
                onPress={onContinue}
                accessibilityRole="button"
                accessibilityLabel="Continue"
                hitSlop={8}
                style={({ pressed }) => [
                  styles.arrow,
                  elevation.floating,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={26}
                  color={colors.accentDark}
                />
              </Pressable>
            ) : (
              <View style={styles.arrowSlot}>
                <ActivityIndicator color={colors.textOnDark} />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const ARROW_SIZE = 60;
const LOGO_WIDTH = 38;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.accentDark },
  photo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.screenPadding + 4,
  },
  brand: { alignItems: "center" },
  logoTile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FEFDFE", // matches the logo file's own background
    alignItems: "center",
    justifyContent: "center",
  },

  wordmark: {
    marginTop: spacing.sm,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.textOnDark,
  },
  tagline: {
    marginTop: 2,
    fontSize: 16,
    color: colors.textOnDark,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowRadius: 6,
  },
  footer: { gap: spacing.lg },
  headline: {
    fontWeight: "600",
    color: colors.textOnDark,
    letterSpacing: -0.3,
    maxWidth: 420,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowRadius: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  arrow: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderRadius: ARROW_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowSlot: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.8 },
});

import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet } from "react-native";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { colors, spacing } from "@/theme/tokens";

const LOGO_WIDTH = 96;
const LOGO_ENTRANCE_MS = 420;
const TAGLINE_DELAY_MS = 300;
const TAGLINE_FADE_MS = 350;
const HOLD_MS = 550;
const FADE_OUT_MS = 220;
/** Total on-screen time before handing off — within the ~1-2s the brief asks for. */
const TOTAL_MS =
  LOGO_ENTRANCE_MS + TAGLINE_DELAY_MS + TAGLINE_FADE_MS + HOLD_MS;
/** Reduce-Motion: skip the choreography, still give the brand its moment, hand off sooner. */
const REDUCED_MOTION_MS = 700;

/**
 * The short, automatic branded moment between the native iOS launch screen
 * (white background, static logo — see ios/CanidKnot/SplashScreen.storyboard)
 * and the app itself: the KINRO mark fades/scales in, breathes once (reusing
 * AnimatedLogo's existing calm pulse), the tagline fades in under it, then
 * `onFinish` fires on its own — no tap, ~1.5s total. Background matches the
 * native launch screen's white exactly so there's no color flash on handoff
 * from it, and this view fades itself out so the handoff to whatever's
 * underneath (already resolving in parallel — see app/index.tsx) is smooth
 * rather than a hard cut.
 */
export function AppLaunchSplash({ onFinish }: { onFinish: () => void }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Animated.Value refs (and their .setValue) are stable across renders and this is meant to run exactly once per mount, like a splash should.
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (cancelled) return;
        if (reduceMotion) {
          logoOpacity.setValue(1);
          logoScale.setValue(1);
          taglineOpacity.setValue(1);
          timers.push(setTimeout(finish, REDUCED_MOTION_MS));
          return;
        }

        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: LOGO_ENTRANCE_MS,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();

        timers.push(
          setTimeout(() => {
            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: TAGLINE_FADE_MS,
              useNativeDriver: true,
            }).start();
          }, TAGLINE_DELAY_MS),
        );

        timers.push(setTimeout(finish, TOTAL_MS));
      })
      .catch(() => {
        timers.push(setTimeout(finish, REDUCED_MOTION_MS));
      });

    function finish() {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }

    return () => {
      cancelled = true;
      for (const timer of timers) clearTimeout(timer);
    };
  }, []);

  return (
    <Animated.View style={[styles.fill, { opacity: containerOpacity }]}>
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      >
        <AnimatedLogo
          width={LOGO_WIDTH}
          playOnMount
          delayMs={LOGO_ENTRANCE_MS}
        />
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Better information. Healthier generations. Stronger connections.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface, // matches SplashScreenBackground (white) — no flash from the native launch screen
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  tagline: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: colors.accentDark,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
});

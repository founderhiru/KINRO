import { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, StyleSheet } from "react-native";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { colors, spacing } from "@/theme/tokens";

const LOGO_WIDTH = 96;

/**
 * "launch": the full moment on a cold start (~1.6s, with the tagline).
 * "resume": a quick ~800ms replay when the app returns from the background
 * (logo only, same motion, shorter hold) — see ResumeSplashOverlay.
 */
const TIMINGS = {
  launch: {
    logoEntranceMs: 420,
    taglineDelayMs: 300,
    taglineFadeMs: 350,
    holdMs: 550,
    fadeOutMs: 220,
    showTagline: true,
    /** Reduce-Motion: skip the choreography, still give the brand its moment, hand off sooner. */
    reducedMotionMs: 700,
  },
  resume: {
    logoEntranceMs: 260,
    taglineDelayMs: 0,
    taglineFadeMs: 0,
    holdMs: 340,
    fadeOutMs: 200,
    showTagline: false,
    reducedMotionMs: 400,
  },
} as const;

export type AppLaunchSplashVariant = keyof typeof TIMINGS;

/**
 * The short, automatic branded moment between the native iOS launch screen
 * (white background, static logo — see ios/CanidKnot/SplashScreen.storyboard)
 * and the app itself: the KINRO mark fades/scales in, breathes once (reusing
 * AnimatedLogo's existing calm pulse), the tagline fades in under it, then
 * `onFinish` fires on its own — no tap, ~1.5s total. Background matches the
 * native launch screen's white exactly so there's no color flash on handoff
 * from it, and this view fades itself out so the handoff to whatever's
 * underneath (already resolving in parallel — see app/_layout.tsx) is smooth
 * rather than a hard cut.
 */
export function AppLaunchSplash({
  onFinish,
  variant = "launch",
}: {
  onFinish: () => void;
  variant?: AppLaunchSplashVariant;
}) {
  const timing = TIMINGS[variant];
  /** Total on-screen time before handing off (the fade-out follows it). */
  const totalMs =
    timing.logoEntranceMs +
    timing.taglineDelayMs +
    timing.taglineFadeMs +
    timing.holdMs;
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
          timers.push(setTimeout(finish, timing.reducedMotionMs));
          return;
        }

        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: timing.logoEntranceMs,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();

        if (timing.showTagline) {
          timers.push(
            setTimeout(() => {
              Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: timing.taglineFadeMs,
                useNativeDriver: true,
              }).start();
            }, timing.taglineDelayMs),
          );
        }

        timers.push(setTimeout(finish, totalMs));
      })
      .catch(() => {
        timers.push(setTimeout(finish, timing.reducedMotionMs));
      });

    function finish() {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: timing.fadeOutMs,
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
          // The ~800ms breath fits the launch hold; on resume it would be
          // cut off by the fade-out, so the quick replay is fade + scale only.
          playOnMount={variant === "launch"}
          delayMs={timing.logoEntranceMs}
        />
      </Animated.View>
      {timing.showTagline ? (
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Better information. Healthier generations. Stronger connections.
        </Animated.Text>
      ) : null}
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

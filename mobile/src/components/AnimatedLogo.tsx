import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
} from "react-native";
import {
  computePieceOffsets,
  LOGO_ASPECT,
  LOGO_MOTION,
  LOGO_PIECE_KEYS,
  type LogoPieceKey,
} from "@/lib/logo-motion";

// The six shapes of the existing KINRO symbol, each on a canvas the same size as
// the full logo (see src/lib/logo-motion.ts). Stacked at rest they ARE the logo.
const PIECES: Record<LogoPieceKey, number> = {
  top: require("../../assets/images/logo/piece-top.png"),
  "left-leaf": require("../../assets/images/logo/piece-left-leaf.png"),
  "right-leaf": require("../../assets/images/logo/piece-right-leaf.png"),
  "bottom-leaf": require("../../assets/images/logo/piece-bottom-leaf.png"),
  "bottom-left": require("../../assets/images/logo/piece-bottom-left.png"),
  "bottom-right": require("../../assets/images/logo/piece-bottom-right.png"),
};

interface AnimatedLogoProps {
  /** Rendered width in points; height follows the artwork's aspect ratio. */
  width: number;
  /** Play the animation once shortly after mounting (used on the splash). */
  playOnMount?: boolean;
  /** Delay before the on-mount animation, so the screen settles first. */
  delayMs?: number;
}

/**
 * The KINRO logo. At rest it is the normal logo. Tapping it (and, optionally,
 * once on mount) plays a calm ~800 ms animation: the six shapes drift slightly
 * apart while the whole mark takes a small breath, then they settle back
 * together. Uses only React Native's built-in Animated with the native driver
 * (transform-only), so it stays smooth on iOS. Honours the system "Reduce
 * Motion" setting by not moving at all.
 */
export function AnimatedLogo({
  width,
  playOnMount = false,
  delayMs = 350,
}: AnimatedLogoProps) {
  const height = Math.round(width / LOGO_ASPECT);
  const progress = useRef(new Animated.Value(0)).current;
  const running = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        reduceMotion.current = enabled;
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        reduceMotion.current = enabled;
      },
    );
    return () => subscription.remove();
  }, []);

  const play = useCallback(() => {
    if (running.current || reduceMotion.current) return;
    running.current = true;
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: LOGO_MOTION.separateMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 0,
        duration: LOGO_MOTION.reconnectMs,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      running.current = false;
    });
  }, [progress]);

  useEffect(() => {
    if (!playOnMount) return;
    const timer = setTimeout(play, delayMs);
    return () => clearTimeout(timer);
  }, [playOnMount, delayMs, play]);

  useEffect(() => () => progress.stopAnimation(), [progress]);

  const offsets = useMemo(() => computePieceOffsets(width), [width]);
  const breath = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, LOGO_MOTION.breathe],
  });

  return (
    <Pressable
      onPress={play}
      hitSlop={12}
      accessible
      accessibilityRole="image"
      accessibilityLabel="KINRO logo"
    >
      <Animated.View
        style={[{ width, height }, { transform: [{ scale: breath }] }]}
      >
        {LOGO_PIECE_KEYS.map((key) => (
          <Animated.Image
            key={key}
            source={PIECES[key]}
            resizeMode="contain"
            style={[
              styles.piece,
              {
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, offsets[key].x],
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, offsets[key].y],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  piece: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
});

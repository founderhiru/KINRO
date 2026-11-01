import { type PropsWithChildren, useEffect, useRef } from "react";
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native";
import { useReduceMotion } from "@/lib/use-reduce-motion";

/**
 * A gently bobbing wrapper for decorative photos: it drifts up and back down
 * on a slow loop and keeps its own tilt. `delayMs` offsets the loop so a group
 * of photos doesn't move in lockstep. Stands still under Reduce Motion.
 */
export function Floaty({
  children,
  style,
  rotate = "0deg",
  delayMs = 0,
  distance = 7,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  rotate?: string;
  delayMs?: number;
  distance?: number;
}>) {
  const reduceMotion = useReduceMotion();
  const phase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      phase.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(phase, {
          toValue: 1,
          duration: 2250,
          delay: delayMs,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(phase, {
          toValue: 0,
          duration: 2250,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, delayMs, phase]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              translateY: phase.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -distance],
              }),
            },
            { rotate },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

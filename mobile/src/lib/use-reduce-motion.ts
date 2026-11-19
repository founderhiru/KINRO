import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * True when the phone's "Reduce Motion" setting is on. Decorative animation
 * (floating photos, the scrolling breed strip, the tour's auto-advance) stops
 * when it is. Starts as false and updates as soon as the setting is read.
 */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduce(value);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduce,
    );
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

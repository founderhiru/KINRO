import { StyleSheet, useWindowDimensions, View } from "react-native";

const LAYERS = 30;
const TOP_LAYERS = 12;
const BOTTOM_HEIGHT_PCT = 62;
const TOP_HEIGHT_PCT = 30;

/**
 * A dark vertical gradient laid over a photo so white text stays readable,
 * built from stacked translucent bands. (A native gradient would need a new
 * dependency such as expo-linear-gradient; this avoids adding one.) Each band
 * covers less of the screen than the one before it, so the darkness ramps up
 * smoothly toward the edge.
 */
export function ScrimGradient() {
  // Whole-pixel band heights keep the band edges on pixel boundaries, so no
  // faint seams show between bands.
  const { height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: TOP_LAYERS }).map((_, i) => (
        <View
          key={`top-${
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, never reordered.
            i
          }`}
          style={[
            styles.band,
            {
              top: 0,
              height: Math.round(
                (height * TOP_HEIGHT_PCT * (TOP_LAYERS - i)) /
                  (100 * TOP_LAYERS),
              ),
              backgroundColor: "rgba(8,20,14,0.04)",
            },
          ]}
        />
      ))}
      {Array.from({ length: LAYERS }).map((_, i) => (
        <View
          key={`bottom-${
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, never reordered.
            i
          }`}
          style={[
            styles.band,
            {
              bottom: 0,
              height: Math.round(
                (height * BOTTOM_HEIGHT_PCT * (LAYERS - i)) / (100 * LAYERS),
              ),
              backgroundColor: "rgba(8,20,14,0.055)",
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  band: { position: "absolute", left: 0, right: 0 },
});

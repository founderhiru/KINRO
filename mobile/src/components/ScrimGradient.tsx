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

/**
 * A vertical fade from transparent to a solid brand colour, drawn as thin
 * whole-pixel strips (again: no gradient dependency). Placed over the bottom of
 * a photo it lets the picture dissolve into a solid background with no visible
 * edge. `top` and `height` are in points from the top of the parent.
 */
export function BottomFade({
  top,
  height,
  rgb,
  steps = 48,
}: {
  top: number;
  height: number;
  /** "r,g,b" of the colour the photo should fade into. */
  rgb: string;
  steps?: number;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: steps }).map((_, i) => {
        const y0 = Math.round(top + (height * i) / steps);
        const y1 = Math.round(top + (height * (i + 1)) / steps);
        const t = (i + 1) / steps;
        const alpha = t * t * (3 - 2 * t); // smoothstep: gentle start, full at the end
        return (
          <View
            key={`fade-${
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, never reordered.
              i
            }`}
            style={[
              styles.band,
              {
                top: y0,
                height: Math.max(1, y1 - y0),
                backgroundColor: `rgba(${rgb},${alpha.toFixed(3)})`,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

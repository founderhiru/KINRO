import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { BreedTileSpec } from "@/lib/breed-tile";

/**
 * Fills its parent with the breed's initials on a calm colour. Used where a
 * breed has no licensed sample photo, so different breeds no longer share one
 * identical placeholder image. Sizes its lettering from its own width, so the
 * same component works as a 36px list thumbnail and a full-width card photo.
 */
export function BreedTile({
  tile,
  accessibilityLabel,
}: {
  tile: BreedTileSpec;
  accessibilityLabel?: string;
}) {
  const [size, setSize] = useState(0);
  const lettering = Math.max(11, Math.round(size * (size < 80 ? 0.4 : 0.3)));
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: tile.background }]}
      onLayout={(e) =>
        setSize(
          Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height),
        )
      }
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
    >
      <View style={styles.center}>
        {size >= 80 ? (
          <Ionicons
            name="paw"
            size={Math.round(size * 0.2)}
            color={tile.foreground}
            style={styles.paw}
          />
        ) : null}
        <Text
          style={[
            styles.initials,
            { color: tile.foreground, fontSize: lettering },
          ]}
          allowFontScaling={false}
        >
          {tile.initials}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  paw: { opacity: 0.35, marginBottom: 2 },
  initials: { fontWeight: "700", letterSpacing: 1 },
});

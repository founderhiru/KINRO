import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/theme/tokens";

/** The small green "CARE" label that marks the extension. */
export function CareTag() {
  return (
    <View style={styles.pill}>
      <Text style={styles.text}>CARE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 20,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentTint,
    justifyContent: "center",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.9,
    color: colors.accentDark,
  },
});

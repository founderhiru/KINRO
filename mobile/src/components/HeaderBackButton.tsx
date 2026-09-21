import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { ROUTES } from "@/lib/session-guard";
import { colors } from "@/theme/tokens";

/**
 * A back button for stack headers that can be reached from ANOTHER tab.
 *
 * Home lives in its own tab and pushes straight into Dog Profile, Health
 * Passport, Add Dog and Notifications, which belong to other tabs' stacks. When
 * you arrive that way the stack has no earlier screen, so the built-in back
 * arrow is missing. This button always works: it goes back to wherever you
 * came from (Home, or the previous screen in the same stack), and only falls
 * back to Home if there is nothing to go back to.
 */
export function HeaderBackButton() {
  return (
    <Pressable
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace(ROUTES.home);
        }
      }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={10}
      style={styles.button}
    >
      <Ionicons name="chevron-back" size={26} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

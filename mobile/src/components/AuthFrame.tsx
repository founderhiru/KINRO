import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { brandField, pressedOpacity } from "@/theme/tokens";

/**
 * Full-screen deep-green frame shared by sign-in and code entry: light status
 * bar, a visible Back button (only when there is somewhere to go back to), and
 * keyboard avoidance so the form is never hidden behind the keyboard.
 */
export function AuthFrame({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const canGoBack = router.canGoBack();
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {children}
      </KeyboardAvoidingView>
      {canGoBack ? (
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [
            styles.back,
            { top: insets.top + 4 },
            pressed && { opacity: pressedOpacity },
          ]}
        >
          <Ionicons
            name={Platform.OS === "ios" ? "chevron-back" : "arrow-back"}
            size={24}
            color={brandField.text}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brandField.background },
  flex: { flex: 1 },
  back: {
    position: "absolute",
    left: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

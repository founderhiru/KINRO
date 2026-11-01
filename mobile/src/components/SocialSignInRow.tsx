import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { SignInMethod } from "@/lib/sign-in-methods";
import { colors, pressedOpacity, spacing, typography } from "@/theme/tokens";

// Official Google "G" mark, used unmodified (same file as the AneviaONE app).
const GOOGLE_G = require("../../assets/auth/google-g.png");

interface SocialSignInRowProps {
  methods: readonly SignInMethod[];
  onPress: (method: SignInMethod) => void;
  /** The method currently signing in — shows a spinner; all buttons are inactive while any is busy. */
  busy?: SignInMethod | null;
  disabled?: boolean;
}

const LABELS: Record<SignInMethod, { label: string; caption: string }> = {
  google: { label: "Continue with Google", caption: "Google" },
  apple: { label: "Continue with Apple", caption: "Apple" },
  email: { label: "Continue with email", caption: "Email" },
};

/** Round provider buttons with the provider's mark and a short caption underneath. */
export function SocialSignInRow({
  methods,
  onPress,
  busy,
  disabled,
}: SocialSignInRowProps) {
  const inactive = disabled || !!busy;
  return (
    <View style={styles.row}>
      {methods.map((method) => (
        <View key={method} style={styles.item}>
          <Pressable
            onPress={() => onPress(method)}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityLabel={LABELS[method].label}
            accessibilityState={{ disabled: inactive, busy: busy === method }}
            style={({ pressed }) => [
              styles.button,
              inactive && !(busy === method) && styles.dim,
              pressed && { opacity: pressedOpacity },
            ]}
          >
            {busy === method ? (
              <ActivityIndicator color={colors.accent} />
            ) : method === "google" ? (
              <Image
                source={GOOGLE_G}
                style={styles.google}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            ) : method === "apple" ? (
              <Ionicons name="logo-apple" size={24} color="#000000" />
            ) : (
              <Ionicons name="mail-outline" size={24} color={colors.text} />
            )}
          </Pressable>
          <Text style={styles.caption}>{LABELS[method].caption}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: spacing.xl - 4 },
  item: { alignItems: "center", gap: 6 },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  dim: { opacity: 0.5 },
  google: { width: 24, height: 24 },
  caption: { ...typography.caption, fontSize: 12 },
});

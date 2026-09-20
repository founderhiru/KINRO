import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing, typography } from "@/theme/tokens";

type Variant = "primary" | "secondary" | "surface";
type IconName = ComponentProps<typeof Ionicons>["name"];

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  /** Optional Ionicons glyph shown after the label (e.g. "arrow-forward"). */
  trailingIcon?: IconName;
}

/** The one full-width CTA style used across every M1 screen — see design tokens. */
export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  trailingIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "surface" && styles.surface,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.accentText : colors.accent}
        />
      ) : (
        <>
          <Text
            style={[
              typography.button,
              variant === "secondary" && { color: colors.accent },
              variant === "surface" && { color: colors.text },
            ]}
          >
            {label}
          </Text>
          {trailingIcon ? (
            <Ionicons
              name={trailingIcon}
              size={20}
              color={variant === "primary" ? colors.accentText : colors.text}
              style={styles.trailingIcon}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  trailingIcon: { marginLeft: spacing.sm },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
});

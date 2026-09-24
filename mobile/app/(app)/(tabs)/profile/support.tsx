import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import {
  colors,
  pressedOpacity,
  spacing,
  touchTarget,
  typography,
} from "@/theme/tokens";

export const SUPPORT_EMAIL = "support@kinro.app";

const SUBJECTS = {
  support: "KINRO Support Request",
  feedback: "KINRO Feedback",
} as const;

/**
 * Opens the device mail app addressed to KINRO support. No backend or
 * third-party service — just a mailto: link. openURL is used directly (not
 * canOpenURL, which on iOS would need "mailto" in LSApplicationQueriesSchemes)
 * and a rejection — e.g. no mail account set up — falls back to showing the
 * address so the user can still reach us.
 */
export async function openSupportEmail(kind: keyof typeof SUBJECTS) {
  const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUBJECTS[kind])}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("No mail app available", `Email us at ${SUPPORT_EMAIL}`);
  }
}

function SupportRow({
  label,
  description,
  onPress,
}: {
  label: string;
  description?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.row,
        pressed ? { opacity: pressedOpacity } : null,
      ]}
    >
      <View style={styles.rowText}>
        <Text style={typography.body}>{label}</Text>
        {description ? (
          <Text style={typography.bodyMuted}>{description}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.accent} />
    </Pressable>
  );
}

/**
 * The "Support" card shown on Profile, for signed-in users and guests alike.
 * A single entry point: Contact KINRO and Send Feedback both live on the
 * Help & Support screen, so neither is duplicated here.
 */
export function SupportCard() {
  return (
    <Card style={styles.supportCard}>
      <SectionHeader title="Support" />
      <SupportRow
        label="Help & Support"
        description="Contact KINRO or send feedback."
        onPress={() => router.push("/(app)/(tabs)/profile/support")}
      />
    </Card>
  );
}

export default function HelpAndSupportScreen() {
  return (
    <Screen>
      <Text style={[typography.body, styles.intro]}>We're here to help.</Text>
      <Card>
        <SupportRow
          label="Contact KINRO"
          description="Get help with your account, dogs, or Health Passport."
          onPress={() => openSupportEmail("support")}
        />
        <View style={styles.divider} />
        <SupportRow
          label="Send Feedback"
          description="Share an idea or tell us about a problem."
          onPress={() => openSupportEmail("feedback")}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: spacing.md, marginBottom: spacing.md },
  supportCard: { marginTop: spacing.md },
  row: {
    minHeight: touchTarget.minHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  rowText: { flex: 1, marginRight: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});

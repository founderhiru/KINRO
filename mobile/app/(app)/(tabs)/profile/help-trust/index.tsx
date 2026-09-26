import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface TrustRowConfig {
  key: string;
  label: string;
  description: string;
  icon: IoniconName;
  href:
    | "/(app)/(tabs)/profile/help-trust/faq"
    | "/(app)/(tabs)/profile/help-trust/privacy"
    | "/(app)/(tabs)/profile/help-trust/security"
    | "/(app)/(tabs)/profile/help-trust/terms"
    | "/(app)/(tabs)/profile/help-trust/contact";
}

const ROWS: TrustRowConfig[] = [
  {
    key: "faq",
    label: "FAQ",
    description: "Answers to common questions about KINRO",
    icon: "help-circle-outline",
    href: "/(app)/(tabs)/profile/help-trust/faq",
  },
  {
    key: "privacy",
    label: "Privacy Policy",
    description: "How KINRO collects, uses and protects information",
    icon: "lock-closed-outline",
    href: "/(app)/(tabs)/profile/help-trust/privacy",
  },
  {
    key: "security",
    label: "Security",
    description: "How KINRO approaches account and data security",
    icon: "shield-checkmark-outline",
    href: "/(app)/(tabs)/profile/help-trust/security",
  },
  {
    key: "terms",
    label: "Terms of Service",
    description: "The terms that govern use of KINRO",
    icon: "document-text-outline",
    href: "/(app)/(tabs)/profile/help-trust/terms",
  },
  {
    key: "contact",
    label: "Contact Support",
    description: "Get help or contact the KINRO team",
    icon: "mail-outline",
    href: "/(app)/(tabs)/profile/help-trust/contact",
  },
];

function TrustRow({
  label,
  description,
  icon,
  onPress,
}: {
  label: string;
  description: string;
  icon: IoniconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={description}
      style={({ pressed }) => [
        styles.row,
        pressed ? { opacity: pressedOpacity } : null,
      ]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={typography.body}>{label}</Text>
        <Text style={typography.bodyMuted}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

/**
 * The single Profile entry point for FAQ, Privacy Policy, Security, Terms
 * of Service and Contact Support. Replaces the old standalone "Support"
 * card — there is only ever one row on Profile now.
 */
export function HelpTrustCard() {
  return (
    <Card style={styles.profileCard}>
      <SectionHeader title="Help & Trust" />
      <TrustRow
        label="Help & Trust"
        description="FAQs, privacy, security and support."
        icon="shield-checkmark-outline"
        onPress={() => router.push("/(app)/(tabs)/profile/help-trust")}
      />
    </Card>
  );
}

export default function HelpAndTrustScreen() {
  return (
    <Screen>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
      >
        <Text style={[typography.title, styles.title]}>Help & Trust</Text>
        <Text style={[typography.bodyMuted, styles.subtitle]}>
          Everything you need to understand KINRO, protect your information, and
          get help.
        </Text>
        <Card style={styles.card}>
          {ROWS.map((row, index) => (
            <View key={row.key}>
              <TrustRow
                label={row.label}
                description={row.description}
                icon={row.icon}
                onPress={() => router.push(row.href)}
              />
              {index < ROWS.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scroll: { paddingTop: spacing.md, paddingBottom: spacing.xl },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  card: {},
  profileCard: { marginTop: spacing.md },
  row: {
    minHeight: touchTarget.minHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    width: 32,
    alignItems: "center",
    marginRight: spacing.sm,
  },
  rowText: { flex: 1, marginRight: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});

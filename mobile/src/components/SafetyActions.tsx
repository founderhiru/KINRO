import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { ReportSheet } from "@/components/ReportSheet";
import { safetyErrorMessage } from "@/lib/safety";
import { blockTarget } from "@/lib/safety-api";
import type { SafetyTarget } from "@/lib/safety-contracts";
import { colors, spacing, typography } from "@/theme/tokens";

interface SafetyActionsProps {
  target: SafetyTarget;
  /** Shown in the confirmation, e.g. the owner's or dog's name. */
  subjectName: string;
  /** Called after the person is blocked — typically navigate away. */
  onBlocked: () => void;
  /** "link" is a text row under content; "menu" is a compact "⋯" for headers. */
  variant?: "link" | "menu";
}

/**
 * Report / Block entry point. Required for apps with user-generated content:
 * one tap opens Report, Block or Cancel. Blocking hides both people from each
 * other everywhere (Discover, interests, messages) and is never revealed.
 */
export function SafetyActions({
  target,
  subjectName,
  onBlocked,
  variant = "link",
}: SafetyActionsProps) {
  const [reportOpen, setReportOpen] = useState(false);

  function open() {
    Alert.alert("Report or block", `About ${subjectName}`, [
      { text: "Report", onPress: () => setReportOpen(true) },
      { text: "Block", style: "destructive", onPress: confirmBlock },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function confirmBlock() {
    Alert.alert(
      `Block ${subjectName}?`,
      "You won't see each other in Discover or Messages, and any conversation will be hidden. They won't be told. You can unblock from Profile → Blocked users.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block", style: "destructive", onPress: () => void block() },
      ],
    );
  }

  async function block() {
    try {
      await blockTarget(target);
      Alert.alert("Blocked", `${subjectName} has been blocked.`, [
        { text: "OK", onPress: onBlocked },
      ]);
    } catch (err) {
      Alert.alert(
        "Couldn't block",
        safetyErrorMessage(err, "Please check your connection and try again."),
      );
    }
  }

  return (
    <>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Report or block"
        hitSlop={8}
        style={variant === "menu" ? styles.menu : styles.link}
      >
        <Text style={variant === "menu" ? styles.menuText : styles.linkText}>
          {variant === "menu" ? "⋯" : "Report or block"}
        </Text>
      </Pressable>
      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        target={target}
      />
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: "center",
    minHeight: 44,
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  linkText: { ...typography.caption, color: colors.textMuted },
  menu: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: { fontSize: 24, color: colors.text, fontWeight: "700" },
});

import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { TextArea } from "@/components/TextArea";
import { safetyErrorMessage } from "@/lib/safety";
import { reportTarget } from "@/lib/safety-api";
import {
  REPORT_DETAILS_MAX,
  REPORT_REASON_LABELS,
  REPORT_REASONS,
  type ReportReason,
  type SafetyTarget,
} from "@/lib/safety-contracts";
import { colors, radius, spacing, typography } from "@/theme/tokens";

interface ReportSheetProps {
  visible: boolean;
  onClose: () => void;
  target: SafetyTarget;
}

/** Pick a reason, optionally add a note, send. Reports go to the KINRO team. */
export function ReportSheet({ visible, onClose, target }: ReportSheetProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setReason(null);
    setDetails("");
    setError(null);
    onClose();
  }

  async function submit() {
    if (!reason) return;
    setSending(true);
    setError(null);
    try {
      await reportTarget(target, reason, details);
      close();
      Alert.alert(
        "Report sent",
        "Thank you. The KINRO team will review it. You can also block this person so you no longer see each other.",
      );
    } catch (err) {
      setError(
        safetyErrorMessage(err, "Couldn't send your report. Please try again."),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={close} title="Report">
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[typography.bodyMuted, styles.intro]}>
          What's wrong? Your report is private; the other person isn't told who
          sent it.
        </Text>
        <View style={styles.reasons}>
          {REPORT_REASONS.map((r) => {
            const selected = r === reason;
            return (
              <Pressable
                key={r}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setReason(r)}
                style={[styles.reason, selected && styles.reasonSelected]}
              >
                <Text
                  style={[
                    typography.body,
                    selected && styles.reasonTextSelected,
                  ]}
                >
                  {REPORT_REASON_LABELS[r]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextArea
          label="Anything else we should know? (optional)"
          value={details}
          onChangeText={setDetails}
          maxLength={REPORT_DETAILS_MAX}
        />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <View style={styles.submit}>
          <Button
            label="Send report"
            onPress={submit}
            loading={sending}
            disabled={!reason || sending}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: spacing.md },
  reasons: { gap: spacing.xs, marginBottom: spacing.md },
  reason: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  reasonTextSelected: { color: colors.accent, fontWeight: "700" },
  submit: { marginTop: spacing.md },
});

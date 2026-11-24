import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { OtpInput } from "@/components/OtpInput";
import { RequireAuthScreen } from "@/components/RequireAuthScreen";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { authClient } from "@/lib/auth-client";
import {
  formatCooldown,
  RESEND_COOLDOWN_SECONDS,
  requestOtp,
  verifyOtpToLinkPhone,
} from "@/lib/auth-flows";
import { isValidIndianMobileNumber, maskPhoneForDisplay } from "@/lib/phone";
import { PHONE_LOGIN_READY } from "@/lib/sign-in-methods";
import { useCooldown } from "@/lib/use-cooldown";
import { colors, spacing, typography } from "@/theme/tokens";

type Step = "number" | "code" | "done";

function AddPhoneContent() {
  const [step, setStep] = useState<Step>("number");
  const [digits, setDigits] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { remaining: cooldown, start: startCooldown } = useCooldown(
    RESEND_COOLDOWN_SECONDS,
  );
  const submitting = useRef(false);

  const canSend = isValidIndianMobileNumber(digits) && !loading;

  async function sendCode() {
    if (!canSend) return;
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const result = await requestOtp(authClient, digits);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setCode("");
      setStep("code");
      startCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setLoading(false);
    }
  }

  async function verify(otp: string) {
    if (submitting.current) return;
    submitting.current = true;
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const result = await verifyOtpToLinkPhone(authClient, digits, otp);
      if (!result.ok) {
        setError(result.message);
        setCode("");
        return;
      }
      setStep("done");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  async function resend() {
    if (cooldown > 0 || loading) return;
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const result = await requestOtp(authClient, digits);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setCode("");
      setNotice("New code sent.");
      startCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setLoading(false);
    }
  }

  if (!PHONE_LOGIN_READY) {
    return (
      <Screen>
        <View style={styles.body}>
          <Text style={typography.body}>
            Adding a mobile number is not available yet.
          </Text>
          <Button
            label="Back"
            onPress={() => router.back()}
            variant="secondary"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          {step === "number" ? (
            <>
              <Text style={typography.body}>
                Add your mobile number so you can also log in with it. It is
                added to this account, so your dogs and records stay together.
              </Text>
              <TextField
                label="Mobile number"
                prefix="+91"
                value={digits}
                onChangeText={(text) => {
                  setDigits(text.replace(/[^0-9]/g, "").slice(0, 10));
                  if (error) setError(null);
                }}
                keyboardType="number-pad"
                autoComplete="tel"
                maxLength={10}
                editable={!loading}
                placeholder="10-digit number"
                onSubmitEditing={canSend ? sendCode : undefined}
              />
              {error ? <ErrorText>{error}</ErrorText> : null}
              <Button
                label="Send code"
                onPress={sendCode}
                disabled={!canSend}
                loading={loading}
              />
            </>
          ) : null}

          {step === "code" ? (
            <>
              <Text style={typography.body}>
                We sent a 6-digit code to {maskPhoneForDisplay(digits)}.
              </Text>
              <OtpInput
                value={code}
                onChange={setCode}
                onComplete={verify}
                disabled={loading}
              />
              {loading ? (
                <Text style={typography.bodyMuted}>Verifying…</Text>
              ) : null}
              {error ? <ErrorText>{error}</ErrorText> : null}
              {notice && !error ? (
                <Text style={typography.bodyMuted}>{notice}</Text>
              ) : null}
              <Pressable
                onPress={resend}
                disabled={cooldown > 0 || loading}
                accessibilityRole="button"
                style={styles.link}
              >
                <Text
                  style={[
                    typography.body,
                    cooldown === 0 && !loading && styles.linkText,
                  ]}
                >
                  {cooldown > 0
                    ? `Resend code in ${formatCooldown(cooldown)}`
                    : "Resend code"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setError(null);
                  setStep("number");
                }}
                accessibilityRole="button"
                style={styles.link}
              >
                <Text style={[typography.body, styles.linkText]}>
                  Change number
                </Text>
              </Pressable>
            </>
          ) : null}

          {step === "done" ? (
            <>
              <Text style={typography.body}>
                Done. {maskPhoneForDisplay(digits)} is now part of your account.
                You can log in with it, and you will land in this same account.
              </Text>
              <Button label="Back to profile" onPress={() => router.back()} />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export default function AddPhoneScreen() {
  return (
    <RequireAuthScreen>
      <AddPhoneContent />
    </RequireAuthScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingVertical: spacing.lg, gap: spacing.md },
  link: { minHeight: 44, justifyContent: "center" },
  linkText: { color: colors.accent, fontWeight: "700" },
});

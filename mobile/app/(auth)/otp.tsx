import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthFrame } from "@/components/AuthFrame";
import { OtpInput } from "@/components/OtpInput";
import { authClient } from "@/lib/auth-client";
import {
  formatCooldown,
  RESEND_COOLDOWN_SECONDS,
  requestOtp,
  verifyOtp,
} from "@/lib/auth-flows";
import { maskPhoneForDisplay } from "@/lib/phone";
import { useCooldown } from "@/lib/use-cooldown";
import { brandField, colors, radius, spacing } from "@/theme/tokens";

const SYMBOL = require("../../assets/images/kinro-symbol.png");

export default function OtpVerificationScreen() {
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const digits = phone ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // A code was sent just before this screen opened, so the cooldown starts now.
  const { remaining: cooldown, start: startCooldown } = useCooldown(
    RESEND_COOLDOWN_SECONDS,
  );
  // OtpInput fires onComplete on every change that reaches 6 digits; the ref
  // (unlike `loading` state) blocks a second submit within the same tick.
  const submitting = useRef(false);

  async function handleComplete(otp: string) {
    if (submitting.current) return;
    submitting.current = true;
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const result = await verifyOtp(authClient, digits, otp);
      if (!result.ok) {
        setError(result.message);
        setCode("");
        return;
      }
      // The session cookie is already stored and the session store signalled
      // (@better-auth/expo does both on the verify response). app/index.tsx's
      // useSession()-driven redirect only runs while mounted at "/", and we
      // navigated away from it to get here, so remount it explicitly.
      router.replace("/");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending || loading) return;
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const result = await requestOtp(authClient, digits);
      if (!result.ok) {
        // Cooldown deliberately NOT restarted: nothing was sent.
        setError(result.message);
        return;
      }
      setCode("");
      setNotice("New code sent.");
      startCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setResending(false);
    }
  }

  const canResend = cooldown === 0 && !resending && !loading;

  return (
    <AuthFrame>
      <View
        style={[
          styles.body,
          {
            paddingTop: insets.top + 56,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.logoTile}>
          <Image
            source={SYMBOL}
            style={styles.symbol}
            resizeMode="contain"
            accessibilityLabel="KINRO logo"
          />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Enter code
        </Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{" "}
          <Text style={styles.subtitleStrong}>
            {maskPhoneForDisplay(digits)}
          </Text>
          .
        </Text>

        <View style={styles.otp}>
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            disabled={loading}
            tone="onBrand"
          />
        </View>
        {loading ? <Text style={styles.status}>Verifying…</Text> : null}
        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        {notice && !error ? <Text style={styles.status}>{notice}</Text> : null}

        <View style={styles.footer}>
          <Pressable
            onPress={handleResend}
            disabled={!canResend}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canResend }}
            style={styles.footerButton}
          >
            <Text style={[styles.footerText, canResend && styles.link]}>
              {cooldown > 0
                ? `Resend code in ${formatCooldown(cooldown)}`
                : resending
                  ? "Sending…"
                  : "Resend code"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            style={styles.footerButton}
          >
            <Text style={[styles.footerText, styles.link]}>Change number</Text>
          </Pressable>
        </View>

        <Text style={styles.fine}>
          One code signs you in or creates your account. KINRO never asks for
          your code anywhere else.
        </Text>
      </View>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.screenPadding + 4 },
  logoTile: {
    width: 56,
    height: 56,
    borderRadius: radius.md + 4,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: { width: 36, height: 34 },
  title: {
    marginTop: spacing.lg - 2,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: brandField.text,
  },
  subtitle: {
    marginTop: spacing.sm + 2,
    fontSize: 16,
    lineHeight: 23,
    color: brandField.textMuted,
  },
  subtitleStrong: { color: brandField.text, fontWeight: "700" },
  otp: { marginTop: spacing.xl - 2 },
  status: { marginTop: spacing.md, fontSize: 14, color: brandField.textMuted },
  error: { marginTop: spacing.md, fontSize: 14, color: "#FFB4A8" },
  footer: { marginTop: spacing.lg, gap: spacing.xs, alignItems: "center" },
  footerButton: { minHeight: 44, justifyContent: "center" },
  footerText: { fontSize: 15, color: brandField.textMuted },
  link: { color: brandField.tagline, fontWeight: "700" },
  fine: {
    marginTop: "auto",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    color: brandField.textFaint,
  },
});

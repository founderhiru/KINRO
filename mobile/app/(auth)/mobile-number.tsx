import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthFrame } from "@/components/AuthFrame";
import { Button } from "@/components/Button";
import { ErrorText } from "@/components/ErrorText";
import { SocialSignInRow } from "@/components/SocialSignInRow";
import { authClient } from "@/lib/auth-client";
import { requestOtp } from "@/lib/auth-flows";
import { isValidIndianMobileNumber } from "@/lib/phone";
import { getSignInMethods, type SignInMethod } from "@/lib/sign-in-methods";
import { useKeyboardVisible } from "@/lib/use-keyboard-visible";
import {
  brandField,
  colors,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

const SYMBOL = require("../../assets/images/kinro-symbol.png");
// Sample breed photos shipped with the app — decoration only, not real profiles.
const PHOTO_SIDE_LEFT = require("../../assets/images/photos/dog-german-shepherd.jpg");
const PHOTO_SIDE_RIGHT = require("../../assets/images/photos/dog-beagle.jpg");
const PHOTO_CENTER = require("../../assets/images/photos/dog-golden-retriever.jpg");

/**
 * The login screen: a deep-green brand field above a white sheet holding the
 * single sign-in form — mobile number + Continue, then "or continue with"
 * Google / Email (Apple appears only once it works; see sign-in-methods.ts).
 * A known number logs in and a new one signs up, through the same code.
 *
 * Mobile OTP: requestOtp (src/lib/auth-flows.ts) calls better-auth's
 * phone-number endpoint. Real SMS delivery depends on the backend's
 * SMS_PROVIDER being configured (see /src/lib/sms.ts and /.env.example) — an
 * external setup step, not something this screen fakes.
 */
export default function MobileNumberScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const keyboardVisible = useKeyboardVisible();
  const [digits, setDigits] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyMethod, setBusyMethod] = useState<SignInMethod | null>(null);
  const [error, setError] = useState<string | null>(null);

  const methods = getSignInMethods(Platform.OS);
  const canContinue = isValidIndianMobileNumber(digits) && !loading;

  async function handleContinue() {
    if (!isValidIndianMobileNumber(digits)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await requestOtp(authClient, digits);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push({ pathname: "/(auth)/otp", params: { phone: digits } });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusyMethod("google");
    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      if (signInError) {
        setError(signInError.message ?? "Google sign-in failed, try again");
        return;
      }
      // The Google OAuth roundtrip runs entirely inside the awaited call
      // above (an in-app browser session — see @better-auth/expo's
      // expoClient plugin), so unlike a deep-link-based return, nothing
      // else ever navigates us away from this screen. By the time we get
      // here the session cookie is already stored; app/index.tsx's
      // useSession()-driven redirect only runs while mounted at "/", so
      // it needs to be explicitly remounted.
      router.replace("/");
    } catch {
      setError("Google sign-in failed, try again");
    } finally {
      setBusyMethod(null);
    }
  }

  function handleMethod(method: SignInMethod) {
    if (method === "google") {
      void handleGoogle();
    } else if (method === "email") {
      router.push("/(auth)/email-link");
    }
    // "apple" is never offered yet (see sign-in-methods.ts), so there is
    // deliberately no handler for it.
  }

  const photoWidth = Math.min(118, width * 0.3);

  return (
    <AuthFrame>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.logoTile}>
          <Image
            source={SYMBOL}
            style={styles.symbol}
            resizeMode="contain"
            accessibilityLabel="KINRO logo"
          />
        </View>
        <Text style={styles.wordmark}>KINRO</Text>
        <Text style={styles.tagline}>Genetic wellness. Brighter lives.</Text>

        {keyboardVisible ? null : (
          <View style={styles.fan} accessibilityElementsHidden>
            <Image
              source={PHOTO_SIDE_LEFT}
              style={[
                styles.photo,
                styles.photoLeft,
                { width: photoWidth, height: photoWidth * 1.17 },
              ]}
            />
            <Image
              source={PHOTO_SIDE_RIGHT}
              style={[
                styles.photo,
                styles.photoRight,
                { width: photoWidth, height: photoWidth * 1.17 },
              ]}
            />
            <Image
              source={PHOTO_CENTER}
              style={[
                styles.photo,
                styles.photoCenter,
                { width: photoWidth * 1.15, height: photoWidth * 1.35 },
              ]}
            />
          </View>
        )}
      </View>

      <View
        style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Text style={styles.sheetTitle} accessibilityRole="header">
          Log in or sign up
        </Text>

        <View style={[styles.phoneRow, error ? styles.phoneRowError : null]}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.phoneInput}
            value={digits}
            onChangeText={(text) => {
              setDigits(text.replace(/[^0-9]/g, "").slice(0, 10));
              if (error) setError(null);
            }}
            keyboardType="number-pad"
            autoComplete="tel"
            maxLength={10}
            editable={!loading}
            placeholder="Enter mobile number"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Mobile number"
            onSubmitEditing={canContinue ? handleContinue : undefined}
          />
        </View>
        {error ? <ErrorText>{error}</ErrorText> : null}

        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          loading={loading}
        />

        <View style={styles.dividerRow} accessibilityElementsHidden>
          <View style={styles.rule} />
          <Text style={styles.dividerLabel}>or continue with</Text>
          <View style={styles.rule} />
        </View>

        <SocialSignInRow
          methods={methods}
          onPress={handleMethod}
          busy={busyMethod}
          disabled={loading}
        />

        <Text style={styles.legal}>
          Your dog’s health information belongs to you. By continuing, you agree
          to our{" "}
          <Text
            style={styles.legalLink}
            accessibilityRole="link"
            onPress={() =>
              router.push("/(app)/(tabs)/profile/help-trust/terms")
            }
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            style={styles.legalLink}
            accessibilityRole="link"
            onPress={() =>
              router.push("/(app)/(tabs)/profile/help-trust/privacy")
            }
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  logoTile: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm + 2,
  },
  symbol: { width: 44, height: 41 },
  wordmark: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: 3,
    color: brandField.text,
  },
  tagline: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 18,
    fontWeight: "700",
    letterSpacing: 2.6,
    textTransform: "uppercase",
    color: brandField.tagline,
    textAlign: "center",
  },
  fan: {
    marginTop: spacing.lg,
    width: "100%",
    height: 190,
    alignItems: "center",
  },
  photo: {
    position: "absolute",
    top: 26,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "rgba(251,248,243,0.9)",
  },
  photoLeft: { left: "9%", transform: [{ rotate: "-7deg" }] },
  photoRight: { right: "9%", transform: [{ rotate: "7deg" }] },
  photoCenter: {
    top: 0,
    borderRadius: 24,
    borderColor: colors.background,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.screenPadding + 2,
    paddingTop: spacing.lg + 2,
    gap: spacing.sm + 4,
  },
  sheetTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  phoneRowError: { borderColor: colors.danger },
  prefix: {
    ...typography.body,
    fontWeight: "600",
    marginRight: spacing.sm + 4,
    paddingRight: spacing.sm + 4,
    borderRightWidth: 1.5,
    borderRightColor: colors.border,
  },
  phoneInput: { ...typography.body, fontSize: 17, flex: 1, height: "100%" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    marginTop: 2,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
  dividerLabel: { fontSize: 13, color: colors.textMuted },
  legal: {
    ...typography.caption,
    lineHeight: 17,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  legalLink: { color: colors.accent, textDecorationLine: "underline" },
});

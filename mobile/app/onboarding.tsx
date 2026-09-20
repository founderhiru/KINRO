import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { IntroDots } from "@/components/IntroDots";
import { ROUTES } from "@/lib/session-guard";
import { colors, radius, spacing, typography } from "@/theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface OnboardingStep {
  icon: IconName;
  headline: string;
  body: string;
  image: number;
  imageLabel: string;
}

/**
 * Onboarding stages. Only the first is designed so far; add the next stages
 * here (icon, headline, body, image) and Continue will walk through them
 * before moving on to sign-in. The indicator below shows one dot per stage,
 * so it only ever reflects stages that really exist. Copy must stay factual —
 * describe what the app does today, never verification or medical claims.
 */
const STEPS: OnboardingStep[] = [
  {
    icon: "document-text-outline",
    headline: "Better information for healthier dogs.",
    body: "Keep your dog’s vaccinations, vet visits and documents together in one place.",
    image: require("../assets/images/photos/dog-golden-retriever.jpg"),
    imageLabel: "A golden retriever",
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const step = STEPS[index] ?? STEPS[0];
  if (!step) return null;

  function next() {
    if (index < STEPS.length - 1) {
      setIndex(index + 1);
      return;
    }
    // Last stage done: go to the existing sign-in flow (which returns to
    // Home once signed in). Nobody is dropped into the app as a guest
    // without choosing to — that is the explicit link below.
    router.push(ROUTES.signIn);
  }

  function browseAsGuest() {
    router.replace(ROUTES.home);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.iconCircle}>
          <Ionicons name={step.icon} size={44} color={colors.accent} />
        </View>

        <Text style={styles.headline} accessibilityRole="header">
          {step.headline}
        </Text>
        <Text style={styles.body}>{step.body}</Text>

        <View style={styles.imageWrap}>
          <Image
            source={step.image}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            accessibilityLabel={step.imageLabel}
          />
        </View>

        <View style={styles.dots}>
          <IntroDots total={STEPS.length} active={index} />
        </View>

        <Button label="Continue" trailingIcon="arrow-forward" onPress={next} />
        <Pressable
          onPress={browseAsGuest}
          accessibilityRole="button"
          accessibilityLabel="Browse without an account"
          style={styles.guestLink}
        >
          <Text style={styles.guestText}>Browse without an account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    alignItems: "stretch",
    paddingHorizontal: spacing.screenPadding + 4,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  iconCircle: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
    alignSelf: "center",
    maxWidth: 320,
  },
  imageWrap: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 160,
    marginVertical: spacing.lg,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.backgroundAlt,
  },
  image: { width: "100%", height: "100%" },
  dots: { alignItems: "center", marginBottom: spacing.lg },
  guestLink: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  guestText: { ...typography.bodyMuted, fontWeight: "600" },
});

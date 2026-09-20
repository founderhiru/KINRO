import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
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
import { INTRO_DOT_COUNT } from "@/components/SplashView";
import { ROUTES } from "@/lib/session-guard";
import { colors, radius, spacing, typography } from "@/theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Short cues about what KINRO is for. Deliberately not trust or verification
// claims — nothing here says anything has been checked.
const CUES: { icon: IconName; label: string }[] = [
  { icon: "document-text-outline", label: "Health info" },
  { icon: "people-outline", label: "Connections" },
  { icon: "paw-outline", label: "Community" },
];

/**
 * Welcome: warm cream introduction. "Get Started" begins onboarding,
 * "Sign in" goes to the existing sign-in flow, and "Skip" enters the app as
 * a guest (the app is guest-first — see app/(app)/_layout.tsx).
 */
export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.replace(ROUTES.home)}
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
            hitSlop={12}
            style={styles.skip}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.copy}>
          <Text style={styles.welcomeTo}>Welcome to</Text>
          <Text style={styles.brand} accessibilityRole="header">
            KINRO
          </Text>
          <Text style={styles.supporting}>
            A safe, trusted platform for dog owners, built with care.
          </Text>
        </View>

        <View style={styles.imageWrap}>
          <Image
            source={require("../assets/images/welcome-hero.jpg")}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            accessibilityLabel="An owner and their dog"
          />
        </View>

        <View style={styles.dots}>
          <IntroDots total={INTRO_DOT_COUNT} active={0} />
        </View>

        <View style={styles.actions}>
          <Button
            label="Get Started"
            trailingIcon="arrow-forward"
            onPress={() => router.push(ROUTES.onboarding)}
          />
          <Button
            label="Sign in"
            variant="surface"
            onPress={() => router.push(ROUTES.signIn)}
          />
        </View>

        <View style={styles.cues}>
          {CUES.map((cue) => (
            <View key={cue.label} style={styles.cue}>
              <Ionicons name={cue.icon} size={18} color={colors.accent} />
              <Text style={styles.cueText}>{cue.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding + 4,
    paddingBottom: spacing.lg,
  },
  topRow: { alignItems: "flex-end", paddingTop: spacing.sm },
  skip: {
    minHeight: 44,
    minWidth: 48,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  skipText: { ...typography.bodyMuted, fontWeight: "600" },
  copy: { alignItems: "center", marginTop: spacing.md },
  welcomeTo: { fontSize: 28, fontWeight: "600", color: colors.text },
  brand: {
    fontSize: 46,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.accent,
    marginTop: 2,
  },
  supporting: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
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
  actions: { gap: spacing.md },
  cues: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.lg,
  },
  cue: { flexDirection: "row", alignItems: "center", gap: spacing.xs + 2 },
  cueText: { ...typography.caption, color: colors.textMuted },
});

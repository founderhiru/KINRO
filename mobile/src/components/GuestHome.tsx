import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { AuthPromptSheet } from "@/components/AuthPromptSheet";
import { HealthBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DogPhoto } from "@/components/DogPhoto";
import { ErrorText } from "@/components/ErrorText";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { fetchDiscoverDogs } from "@/lib/discover-api";
import type { DogProfileItem } from "@/lib/discover-contracts";
import { ROUTES } from "@/lib/session-guard";
import { useRequireAuth } from "@/lib/use-require-auth";
import { colors, elevation, radius, spacing, typography } from "@/theme/tokens";

/** How many public dogs the Home rail shows; "View all" opens the full Discover list. */
const HOME_DOG_LIMIT = 8;

/**
 * Home for someone who is not signed in (guest-first: the app is fully usable
 * without an account). Everything here is public — the same dog listings
 * Discover shows, read through the existing public endpoint with no
 * credentials. Owner-only features are still protected: "Add your dog" goes
 * through useRequireAuth, so a guest gets the sign-in prompt instead of the
 * screen, and the My Dogs / Messages / Profile tabs keep their own sign-in
 * states.
 */
export function GuestHome() {
  const { width } = useWindowDimensions();
  const { promptVisible, setPromptVisible, requireAuth } = useRequireAuth();
  const [dogs, setDogs] = useState<DogProfileItem[] | null>(null);
  const [error, setError] = useState(false);

  const cardWidth = Math.round(
    Math.min(210, Math.max(150, (width - spacing.screenPadding * 2) * 0.5)),
  );

  const load = useCallback(async () => {
    setError(false);
    try {
      const result = await fetchDiscoverDogs();
      setDogs(result.items.slice(0, HOME_DOG_LIMIT));
    } catch {
      setError(true);
    }
  }, []);

  // Refresh whenever Home regains focus, like the signed-in Home does.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          {/* The logo file has a near-white background, so it sits in a matching tile. */}
          <View style={styles.brandTile}>
            <Image
              source={require("../../assets/images/kinro-symbol.png")}
              style={styles.brandMark}
              resizeMode="contain"
              accessibilityLabel="KINRO"
            />
          </View>
          <Pressable
            onPress={() => router.push(ROUTES.signIn)}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            hitSlop={8}
            style={styles.signInPill}
          >
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.greeting}>Welcome to KINRO</Text>
          <Text style={typography.bodyMuted}>Happy dogs. Happier people.</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={typography.sectionTitle}>Dogs on KINRO</Text>
          <Pressable
            onPress={() => router.push(ROUTES.discover)}
            accessibilityRole="button"
            accessibilityLabel="View all dogs in Discover"
            hitSlop={8}
            style={styles.viewAllRow}
          >
            <Text style={styles.viewAll}>View all</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        </View>

        {dogs === null && !error ? (
          <View style={styles.railSkeleton}>
            <Skeleton width={cardWidth} height={230} borderRadius={radius.lg} />
            <Skeleton width={cardWidth} height={230} borderRadius={radius.lg} />
          </View>
        ) : error ? (
          <View style={styles.inlineError}>
            <ErrorText>Couldn't load dogs. Check your connection.</ErrorText>
            <View style={styles.retryButton}>
              <Button label="Retry" onPress={load} variant="secondary" />
            </View>
          </View>
        ) : dogs && dogs.length === 0 ? (
          <Text style={[typography.bodyMuted, styles.emptyText]}>
            No dogs are listed yet. Check back soon.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {dogs?.map((dog) => (
              <Pressable
                key={dog.id}
                onPress={() => router.push(`/(app)/(tabs)/discover/${dog.id}`)}
                style={({ pressed }) => [
                  styles.miniCard,
                  { width: cardWidth },
                  elevation.card,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${dog.name}, ${dog.breed}, ${dog.city}`}
              >
                <DogPhoto
                  uri={dog.coverPhotoUrl}
                  demoKey={dog.slug}
                  style={styles.miniPhoto}
                />
                <View style={styles.miniInfo}>
                  <Text style={typography.sectionTitle} numberOfLines={1}>
                    {dog.name}
                  </Text>
                  <Text
                    style={[typography.bodyMuted, styles.miniMeta]}
                    numberOfLines={1}
                  >
                    {dog.breed} · {dog.ageYears}{" "}
                    {dog.ageYears === 1 ? "yr" : "yrs"}
                  </Text>
                  <Text
                    style={[typography.bodyMuted, styles.miniMeta]}
                    numberOfLines={1}
                  >
                    {dog.city}
                  </Text>
                  <View style={styles.miniBadgeRow}>
                    <HealthBadge hasRecords={dog.hasHealthRecords} />
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Protected action: guests get the sign-in prompt, not the Add Dog screen. */}
        <Pressable
          onPress={() =>
            requireAuth(() => router.push("/(app)/(tabs)/my-dog/add"))
          }
          accessibilityRole="button"
          accessibilityLabel="Add your dog. Sign in required."
        >
          <Card style={styles.promptCard}>
            <View style={styles.promptIcon}>
              <Ionicons name="paw-outline" size={22} color={colors.accent} />
            </View>
            <View style={styles.promptCopy}>
              <Text style={typography.sectionTitle}>Add your dog</Text>
              <Text style={typography.bodyMuted}>
                Sign in to create their profile and keep health records in one
                place.
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.borderStrong}
            />
          </Card>
        </Pressable>

        <Pressable
          onPress={() => router.push(ROUTES.discover)}
          accessibilityRole="button"
          accessibilityLabel="Because every dog deserves a great circle. Browse the community."
          style={({ pressed }) => pressed && styles.pressed}
        >
          <View style={styles.communityCard}>
            <View style={styles.communityCopy}>
              <Text style={[typography.sectionTitle, styles.communityTitle]}>
                Because every dog deserves a great circle
              </Text>
              <View style={styles.communityCta}>
                <Text style={styles.communityCtaText}>
                  Browse the community
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={colors.accentText}
                />
              </View>
            </View>
            <Image
              source={require("../../assets/images/photos/dog-golden-retriever.jpg")}
              style={styles.communityPhoto}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          </View>
        </Pressable>
      </ScrollView>

      <AuthPromptSheet
        visible={promptVisible}
        onClose={() => setPromptVisible(false)}
        message="Sign in to add and manage your dogs."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  brandTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEFDFE", // matches the logo file's own background
    alignItems: "center",
    justifyContent: "center",
  },
  brandMark: { width: 34, height: 32 },
  signInPill: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  signInText: {
    ...typography.caption,
    color: colors.accentDark,
    fontWeight: "700",
  },
  headerCopy: { marginBottom: spacing.lg },
  greeting: { ...typography.title, marginBottom: 2 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    justifyContent: "flex-end",
  },
  viewAll: { ...typography.caption, color: colors.accent, fontWeight: "700" },
  rail: { gap: spacing.md, paddingBottom: spacing.xs },
  railSkeleton: { flexDirection: "row", gap: spacing.md },
  inlineError: { alignItems: "center", paddingVertical: spacing.lg },
  retryButton: { marginTop: spacing.md },
  emptyText: { paddingVertical: spacing.lg },
  miniCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  pressed: { opacity: 0.85 },
  miniPhoto: { width: "100%", height: 130 },
  miniInfo: { padding: spacing.sm + 2 },
  miniMeta: { marginTop: 1 },
  miniBadgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: "wrap",
    minHeight: 22,
  },
  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  promptIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.accentTint,
    alignItems: "center",
    justifyContent: "center",
  },
  promptCopy: { flex: 1 },
  communityCard: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: spacing.md,
    backgroundColor: colors.promoWarm,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  communityCopy: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.cardPadding,
    justifyContent: "center",
  },
  communityTitle: { lineHeight: 24 },
  communityCta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  communityCtaText: {
    color: colors.accentText,
    fontSize: 13,
    fontWeight: "700",
  },
  communityPhoto: { width: 110, minHeight: 120 },
});

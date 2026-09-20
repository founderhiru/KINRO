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
import { Avatar } from "@/components/Avatar";
import { HealthBadge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DogPhoto } from "@/components/DogPhoto";
import { EmptyState } from "@/components/EmptyState";
import { ErrorText } from "@/components/ErrorText";
import { Screen } from "@/components/Screen";
import { DogCardSkeleton } from "@/components/Skeleton";
import { useSession } from "@/lib/auth-client";
import type { OwnedDogProfileItem } from "@/lib/contracts";
import { listMyDogs } from "@/lib/dog-api";
import { listNotifications } from "@/lib/notification-api";
import { ROUTES } from "@/lib/session-guard";
import { useRequireAuth } from "@/lib/use-require-auth";
import { colors, elevation, radius, spacing, typography } from "@/theme/tokens";

/**
 * Home dashboard: avatar + notifications, greeting, the owner's dogs, a
 * profile-completion nudge and a community card. Everything shown here comes
 * from the signed-in user's real account (name from the session, dogs from
 * the API) — there is no sample or placeholder data on this screen. Guests
 * see a sign-in prompt instead.
 */
export default function HomeScreen() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { promptVisible, setPromptVisible } = useRequireAuth();
  const { width } = useWindowDimensions();
  const [dogs, setDogs] = useState<OwnedDogProfileItem[] | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = !!session;

  const cardWidth = Math.round(
    Math.min(210, Math.max(150, (width - spacing.screenPadding * 2) * 0.5)),
  );

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setError(null);
    try {
      const result = await listMyDogs();
      setDogs(result.items);
    } catch {
      setError("Couldn't load your dogs. Check your connection.");
    }
    // The unread dot is a nicety: a failure here must never block Home.
    try {
      const notifications = await listNotifications();
      setHasUnread(notifications.items.some((item) => !item.read));
    } catch {
      setHasUnread(false);
    }
  }, [isAuthenticated]);

  // Refetch every time this tab regains focus (e.g. returning from Add Dog
  // or Edit Dog) rather than relying on a single mount-time fetch.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const firstName = session?.user.name?.split(" ")[0];
  const greeting = greetingForNow();

  // Guest-first: Home's dog content is fundamentally an owner concept, so
  // a guest sees a sign-in prompt instead of a fetch that would just 401.
  if (!isSessionPending && !isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title="Sign in to see your dogs"
          message="Create a free account to add your dog and start building their profile."
          actionLabel="Sign In"
          onAction={() => setPromptVisible(true)}
        />
        <AuthPromptSheet
          visible={promptVisible}
          onClose={() => setPromptVisible(false)}
          message="Sign in to add and manage your dogs."
        />
      </Screen>
    );
  }

  if (dogs === null && !error) {
    return (
      <Screen>
        <View style={styles.skeletonHeader}>
          <View style={styles.skeletonGreeting} />
        </View>
        <DogCardSkeleton />
        <DogCardSkeleton />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ErrorText>{error}</ErrorText>
          <View style={styles.retryButton}>
            <Button label="Retry" onPress={load} variant="secondary" />
          </View>
        </View>
      </Screen>
    );
  }

  const hasDogs = !!dogs && dogs.length > 0;
  const primaryDog = dogs?.[0];
  const needsHealthRecords =
    !!primaryDog && primaryDog.healthRecords.length === 0;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/profile")}
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
            hitSlop={8}
          >
            <Avatar name={session?.user.name} size={44} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/profile/notifications")}
            accessibilityRole="button"
            accessibilityLabel={
              hasUnread ? "Notifications, you have unread" : "Notifications"
            }
            hitSlop={8}
            style={styles.bell}
          >
            <Ionicons
              name="notifications-outline"
              size={26}
              color={colors.text}
            />
            {hasUnread ? <View style={styles.unreadDot} /> : null}
          </Pressable>
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.greeting}>
            {greeting}
            {firstName ? `, ${firstName}` : ""}!
          </Text>
          <Text style={typography.bodyMuted}>Happy dogs. Happier people.</Text>
        </View>

        {!hasDogs ? (
          <EmptyState
            title="No dogs added yet"
            message="Add your dog to get started and unlock a world of new connections."
            actionLabel="Add Your First Dog"
            onAction={() => router.push("/(app)/(tabs)/my-dog/add")}
          />
        ) : (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={typography.sectionTitle}>
                My Dogs ({dogs?.length})
              </Text>
              <Pressable
                onPress={() => router.push(ROUTES.myDogs)}
                accessibilityRole="button"
                accessibilityLabel="View all your dogs"
                hitSlop={8}
                style={styles.viewAllRow}
              >
                <Text style={styles.viewAll}>View all</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.accent}
                />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {dogs?.map((dog, index) => (
                <Pressable
                  key={dog.id}
                  onPress={() => router.push(`/(app)/(tabs)/my-dog/${dog.id}`)}
                  style={({ pressed }) => [
                    styles.miniCard,
                    { width: cardWidth },
                    elevation.card,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${dog.name}, ${dog.breed}`}
                >
                  <DogPhoto
                    uri={
                      dog.photos.find((p) => p.position === 0)?.url ??
                      dog.photos[0]?.url
                    }
                    demoKey={dog.slug}
                    style={styles.miniPhoto}
                  />
                  {index === 0 && (dogs?.length ?? 0) > 1 ? (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  ) : null}
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
                      <HealthBadge hasRecords={dog.healthRecords.length > 0} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            {needsHealthRecords ? (
              <Pressable
                onPress={() =>
                  router.push(`/(app)/(tabs)/my-dog/${primaryDog?.id}/health`)
                }
                accessibilityRole="button"
                accessibilityLabel="Complete their profile. Add health records."
              >
                <Card style={styles.promptCard}>
                  <View style={styles.promptIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.promptCopy}>
                    <Text style={typography.sectionTitle}>
                      Complete their profile
                    </Text>
                    <Text style={typography.bodyMuted}>
                      Add health records to keep everything in one place.
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.borderStrong}
                  />
                </Card>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => router.push(ROUTES.discover)}
              accessibilityRole="button"
              accessibilityLabel="Because every dog deserves a great circle. Browse the community."
              style={({ pressed }) => pressed && styles.pressed}
            >
              <View style={styles.communityCard}>
                <View style={styles.communityCopy}>
                  <Text
                    style={[typography.sectionTitle, styles.communityTitle]}
                  >
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
                  source={require("../../../../assets/images/photos/dog-golden-retriever.jpg")}
                  style={styles.communityPhoto}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>

      <AuthPromptSheet
        visible={promptVisible}
        onClose={() => setPromptVisible(false)}
        message="Sign in to add and manage your dogs."
      />
    </Screen>
  );
}

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  retryButton: { marginTop: spacing.md },
  scroll: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  bell: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
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
  miniCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  pressed: { opacity: 0.85 },
  miniPhoto: { width: "100%", height: 130 },
  primaryBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  primaryBadgeText: {
    color: colors.accentText,
    fontSize: 11,
    fontWeight: "700",
  },
  miniInfo: { padding: spacing.sm + 2 },
  miniMeta: { marginTop: 1 },
  miniBadgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: "wrap",
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
  skeletonHeader: { marginBottom: spacing.lg, marginTop: spacing.sm },
  skeletonGreeting: {
    width: "50%",
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
});

import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AuthPromptSheet } from "@/components/AuthPromptSheet";
import { Button } from "@/components/Button";
import { DogCard } from "@/components/DogCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorText } from "@/components/ErrorText";
import { Screen } from "@/components/Screen";
import { DogCardSkeleton } from "@/components/Skeleton";
import { useSession } from "@/lib/auth-client";
import type { OwnedDogProfileItem } from "@/lib/contracts";
import { listMyDogs } from "@/lib/dog-api";
import { useRequireAuth } from "@/lib/use-require-auth";
import { colors, spacing, typography } from "@/theme/tokens";

/**
 * My Dogs tab: the signed-in owner's dogs, each opening the existing Dog
 * Profile screen. Add Dog / Edit Dog / Health live in this tab's stack. Guests
 * see a sign-in prompt (the API would just return 401).
 */
export default function MyDogsScreen() {
  const { data: session, isPending: isSessionPending } = useSession();
  const { promptVisible, setPromptVisible } = useRequireAuth();
  const [dogs, setDogs] = useState<OwnedDogProfileItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = !!session;

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setError(null);
    try {
      const result = await listMyDogs();
      setDogs(result.items);
    } catch {
      setError("Couldn't load your dogs. Check your connection.");
    }
  }, [isAuthenticated]);

  // Refetch whenever the tab regains focus (e.g. after Add Dog / Edit Dog).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!isSessionPending && !isAuthenticated) {
    return (
      <Screen edges={["top"]}>
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

  return (
    <Screen edges={["top"]}>
      <View style={styles.header}>
        <Text style={typography.title}>My Dogs</Text>
        {dogs && dogs.length > 0 ? (
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/my-dog/add")}
            accessibilityRole="button"
            accessibilityLabel="Add a dog"
            hitSlop={8}
            style={styles.addButton}
          >
            <Text style={styles.addText}>+ Add dog</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.centered}>
          <ErrorText>{error}</ErrorText>
          <View style={styles.retryButton}>
            <Button label="Retry" onPress={load} variant="secondary" />
          </View>
        </View>
      ) : dogs === null ? (
        <View>
          <DogCardSkeleton />
          <DogCardSkeleton />
        </View>
      ) : dogs.length === 0 ? (
        <EmptyState
          title="No dogs added yet"
          message="Add your dog to get started and unlock a world of new connections."
          actionLabel="Add Your First Dog"
          onAction={() => router.push("/(app)/(tabs)/my-dog/add")}
        />
      ) : (
        <FlatList
          data={dogs}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <DogCard
              dog={item}
              primary={index === 0 && dogs.length > 1}
              onPress={() => router.push(`/(app)/(tabs)/my-dog/${item.id}`)}
            />
          )}
        />
      )}

      <AuthPromptSheet
        visible={promptVisible}
        onClose={() => setPromptVisible(false)}
        message="Sign in to add and manage your dogs."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  addButton: { minHeight: 44, justifyContent: "center" },
  addText: { ...typography.caption, color: colors.accent, fontWeight: "700" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  retryButton: { marginTop: spacing.md },
  list: { paddingBottom: spacing.xl },
});

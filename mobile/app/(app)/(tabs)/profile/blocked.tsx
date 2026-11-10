import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { EmptyState } from "@/components/EmptyState";
import { ErrorText } from "@/components/ErrorText";
import { RequireAuthScreen } from "@/components/RequireAuthScreen";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { safetyErrorMessage } from "@/lib/safety";
import { listBlockedUsers, unblockUser } from "@/lib/safety-api";
import type { BlockedUserItem } from "@/lib/safety-contracts";
import { colors, spacing, typography } from "@/theme/tokens";

function BlockedUsersContent() {
  const [items, setItems] = useState<BlockedUserItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await listBlockedUsers()).items);
    } catch (err) {
      setError(safetyErrorMessage(err, "Couldn't load blocked users."));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function confirmUnblock(item: BlockedUserItem) {
    const name = item.userName ?? "this person";
    Alert.alert(`Unblock ${name}?`, "You'll be able to see each other again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unblock",
        onPress: async () => {
          try {
            await unblockUser(item.id);
            setItems(
              (current) => current?.filter((i) => i.id !== item.id) ?? null,
            );
          } catch (err) {
            Alert.alert(
              "Couldn't unblock",
              safetyErrorMessage(err, "Please try again."),
            );
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      {error ? <ErrorText>{error}</ErrorText> : null}
      {items === null && !error ? (
        <View style={styles.skeleton}>
          <Skeleton height={20} width="60%" />
        </View>
      ) : items && items.length === 0 ? (
        <EmptyState
          title="No blocked users"
          message="People you block won't see you, and you won't see them."
        />
      ) : (
        <FlatList
          data={items ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={typography.body}>
                {item.userName ?? "KINRO owner"}
              </Text>
              <Pressable
                onPress={() => confirmUnblock(item)}
                accessibilityRole="button"
                accessibilityLabel={`Unblock ${item.userName ?? "this person"}`}
                hitSlop={8}
                style={styles.unblock}
              >
                <Text style={styles.unblockText}>Unblock</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

export default function BlockedUsersScreen() {
  return (
    <RequireAuthScreen>
      <BlockedUsersContent />
    </RequireAuthScreen>
  );
}

const styles = StyleSheet.create({
  skeleton: { paddingTop: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  unblock: { minHeight: 44, justifyContent: "center" },
  unblockText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "700",
  },
});

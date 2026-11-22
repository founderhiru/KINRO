import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/Button";
import { CareTag } from "@/components/care/CareTag";
import { ProviderRow } from "@/components/care/ProviderRow";
import { EmptyState } from "@/components/EmptyState";
import { ErrorText } from "@/components/ErrorText";
import { Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
import { listCareProviders } from "@/lib/care-api";
import type { CareProviderItem } from "@/lib/care-contracts";
import { colors, radius, spacing, typography } from "@/theme/tokens";

type Kind = "vet" | "clinic";

// Shared by the Home entry and the dog-profile "Care for this Dog" entry:
// `?dogId=` pre-selects the dog for any appointment request.
export default function CareDirectoryScreen() {
  const { dogId } = useLocalSearchParams<{ dogId?: string }>();
  const [kind, setKind] = useState<Kind>("vet");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<CareProviderItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await listCareProviders({ kind, q: q.trim() || undefined });
      setItems(res.items);
    } catch {
      setError("Couldn't load vets and clinics. Check your connection.");
    }
  }, [kind, q]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen edges={[]}>
      <View style={styles.titleRow}>
        <Text style={typography.title}>Find care</Text>
        <CareTag />
      </View>
      <Text style={[typography.bodyMuted, styles.sub]}>
        Vets and clinics, with credentials checked by KINRO.
      </Text>
      <TextInput
        accessibilityLabel="Search vets or clinics"
        placeholder="Search vets or clinics"
        placeholderTextColor={colors.textMuted}
        value={q}
        onChangeText={setQ}
        onSubmitEditing={load}
        returnKeyType="search"
        style={styles.search}
      />
      <SegmentedControl
        options={[
          { value: "vet", label: "Find a Vet" },
          { value: "clinic", label: "Find a Clinic" },
        ]}
        value={kind}
        onChange={(k) => {
          setItems(null);
          setKind(k);
        }}
      />
      {error ? (
        <View style={styles.centered}>
          <ErrorText>{error}</ErrorText>
          <View style={styles.gap}>
            <Button label="Retry" onPress={load} variant="secondary" />
          </View>
        </View>
      ) : items === null ? (
        <>
          <Skeleton height={96} />
          <Skeleton height={96} style={styles.gap} />
        </>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ProviderRow
              provider={item}
              onPress={() =>
                router.push({
                  pathname: "/(app)/(tabs)/care/[id]",
                  params: dogId ? { id: item.id, dogId } : { id: item.id },
                })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title={
                kind === "vet" ? "No vets listed yet" : "No clinics listed yet"
              }
              message="We're adding verified vets and clinics in Hyderabad. Check back soon."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  sub: { marginTop: 2 },
  search: {
    ...typography.body,
    marginTop: spacing.md,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  list: { paddingBottom: spacing.xl },
  centered: { alignItems: "center", paddingTop: spacing.xl },
  gap: { marginTop: spacing.md },
});

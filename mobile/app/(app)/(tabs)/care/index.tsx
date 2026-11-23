import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/Button";
import { CareTag } from "@/components/care/CareTag";
import { NearbyRow } from "@/components/care/NearbyRow";
import { ProviderRow } from "@/components/care/ProviderRow";
import { EmptyState } from "@/components/EmptyState";
import { ErrorText } from "@/components/ErrorText";
import { Screen } from "@/components/Screen";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Skeleton } from "@/components/Skeleton";
import {
  getCareConfig,
  getNearbyVets,
  listCareProviders,
} from "@/lib/care-api";
import type { CareProviderItem, NearbyPlace } from "@/lib/care-contracts";
import { colors, radius, spacing, typography } from "@/theme/tokens";

type Kind = "vet" | "clinic" | "nearby";

// Shared by the Home entry and the dog-profile "Care for this Dog" entry:
// `?dogId=` pre-selects the dog for any appointment request.
export default function CareDirectoryScreen() {
  const { dogId } = useLocalSearchParams<{ dogId?: string }>();
  const [kind, setKind] = useState<Kind>("vet");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<CareProviderItem[] | null>(null);
  const [nearby, setNearby] = useState<NearbyPlace[] | null>(null);
  const [nearbyOn, setNearbyOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (kind === "nearby") {
        const res = await getNearbyVets(q.trim() || "Hyderabad");
        setNearby(res.items);
        return;
      }
      const res = await listCareProviders({ kind, q: q.trim() || undefined });
      setItems(res.items);
    } catch {
      setError("Couldn't load vets and clinics. Check your connection.");
    }
  }, [kind, q]);

  useEffect(() => {
    getCareConfig()
      .then((c) => setNearbyOn(c.nearby))
      .catch(() => setNearbyOn(false));
  }, []);

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
        Vets and clinics near you. Look for Verified by KINRO.
      </Text>
      <TextInput
        accessibilityLabel={
          kind === "nearby" ? "Area to search" : "Search vets or clinics"
        }
        placeholder={
          kind === "nearby" ? "Area, e.g. Madhapur" : "Search vets or clinics"
        }
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
          ...(nearbyOn ? [{ value: "nearby" as const, label: "Nearby" }] : []),
        ]}
        value={kind}
        onChange={(k) => {
          setItems(null);
          setNearby(null);
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
      ) : kind === "nearby" ? (
        nearby === null ? (
          <>
            <Skeleton height={96} />
            <Skeleton height={96} style={styles.gap} />
          </>
        ) : (
          <FlatList
            data={nearby}
            keyExtractor={(p) => p.placeId}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <Text style={[typography.bodyMuted, styles.attrib]}>
                Listings from Google Maps. KINRO has not checked these
                credentials.
              </Text>
            }
            renderItem={({ item }) => <NearbyRow place={item} />}
            ListEmptyComponent={
              <EmptyState
                title="No vets found there"
                message="Try a nearby area name."
              />
            }
          />
        )
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
              title={kind === "vet" ? "No vets listed" : "No clinics listed"}
              message="No listings match this search."
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
  attrib: { marginVertical: spacing.sm },
});

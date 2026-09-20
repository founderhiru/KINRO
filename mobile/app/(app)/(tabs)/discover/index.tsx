import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorText } from "@/components/ErrorText";
import { PublicDogCard } from "@/components/PublicDogCard";
import { Screen } from "@/components/Screen";
import { SelectBottomSheet } from "@/components/SelectBottomSheet";
import { DogCardSkeleton } from "@/components/Skeleton";
import { fetchDiscoverDogs } from "@/lib/discover-api";
import { setDiscoverCache } from "@/lib/discover-cache";
import type { DogProfileItem } from "@/lib/discover-contracts";
import {
  AGE_BANDS,
  type AgeBandId,
  ageBandLabel,
  hasActiveRefinements,
  refineDogs,
} from "@/lib/discover-filters";
import { colors, radius, spacing, typography } from "@/theme/tokens";

const HEALTH_OPTION = "Health records on file";
const CLEAR_OPTION = "Clear all filters";

/**
 * Guest-first: this screen is reachable with no session (see
 * app/(app)/_layout.tsx) and only ever calls the PUBLIC discovery
 * endpoint (skipAuth) — nothing here requires auth. Express Interest,
 * gated on Dog Detail, is the only protected action reachable from here.
 *
 * Breed and city are real server-side filters. Search, Age and "health
 * records on file" narrow the fetched list on the device (see
 * lib/discover-filters.ts). "Near me" lets you pick your city — the app does
 * not read the phone's location — and the server then adds distances.
 */
export default function DiscoverScreen() {
  const [dogs, setDogs] = useState<DogProfileItem[] | null>(null);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [breed, setBreed] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [ageBand, setAgeBand] = useState<AgeBandId | undefined>();
  const [healthRecordsOnly, setHealthRecordsOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [breedSheetOpen, setBreedSheetOpen] = useState(false);
  const [citySheetOpen, setCitySheetOpen] = useState(false);
  const [ageSheetOpen, setAgeSheetOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await fetchDiscoverDogs({ breed, city });
      setDogs(result.items);
      setBreeds(result.filters.breeds);
      setCities(result.filters.cities);
      setDiscoverCache(result.items);
    } catch {
      setError("Couldn't load dogs. Check your connection.");
    }
  }, [breed, city]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const visibleDogs = useMemo(
    () =>
      dogs ? refineDogs(dogs, { query, ageBand, healthRecordsOnly }) : null,
    [dogs, query, ageBand, healthRecordsOnly],
  );
  const anyFilter =
    !!breed ||
    !!city ||
    hasActiveRefinements({ query, ageBand, healthRecordsOnly });

  function clearAll() {
    setBreed(undefined);
    setCity(undefined);
    setAgeBand(undefined);
    setHealthRecordsOnly(false);
    setQuery("");
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Discover Dogs
        </Text>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, breed or city"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search dogs"
          />
          {query ? (
            <Pressable
              onPress={() => setQuery("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <FilterChip
            label={city ?? "Near me"}
            icon="location-outline"
            active={!!city}
            onPress={() => setCitySheetOpen(true)}
          />
          <FilterChip
            label={breed ?? "Breed"}
            active={!!breed}
            onPress={() => setBreedSheetOpen(true)}
          />
          <FilterChip
            label={ageBandLabel(ageBand) ?? "Age"}
            active={!!ageBand}
            onPress={() => setAgeSheetOpen(true)}
          />
          <FilterChip
            label="More"
            active={healthRecordsOnly}
            onPress={() => setMoreSheetOpen(true)}
          />
        </ScrollView>
      </View>

      {visibleDogs === null && !error ? (
        <View>
          <DogCardSkeleton />
          <DogCardSkeleton />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <ErrorText>{error}</ErrorText>
          <View style={styles.retryButton}>
            <Button label="Retry" onPress={load} variant="secondary" />
          </View>
        </View>
      ) : visibleDogs && visibleDogs.length === 0 ? (
        <EmptyState
          title="No dogs match yet"
          message="Try a different search, breed or city, or clear your filters."
          actionLabel={anyFilter ? "Clear filters" : undefined}
          onAction={anyFilter ? clearAll : undefined}
        />
      ) : (
        <FlatList
          data={visibleDogs ?? []}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PublicDogCard
              dog={item}
              onPress={() => router.push(`/(app)/(tabs)/discover/${item.id}`)}
            />
          )}
        />
      )}

      <SelectBottomSheet
        visible={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
        title="Show dogs near…"
        options={cities}
        value={city ?? ""}
        onSelect={(v) => setCity(v === city ? undefined : v)}
      />
      <SelectBottomSheet
        visible={breedSheetOpen}
        onClose={() => setBreedSheetOpen(false)}
        title="Filter by breed"
        options={breeds}
        value={breed ?? ""}
        onSelect={(v) => setBreed(v === breed ? undefined : v)}
        searchable
        searchPlaceholder="Search breed..."
      />
      <SelectBottomSheet
        visible={ageSheetOpen}
        onClose={() => setAgeSheetOpen(false)}
        title="Filter by age"
        options={AGE_BANDS.map((band) => band.label)}
        value={ageBandLabel(ageBand) ?? ""}
        onSelect={(label) => {
          const picked = AGE_BANDS.find((band) => band.label === label);
          setAgeBand(picked && picked.id !== ageBand ? picked.id : undefined);
        }}
      />
      <SelectBottomSheet
        visible={moreSheetOpen}
        onClose={() => setMoreSheetOpen(false)}
        title="More filters"
        options={[HEALTH_OPTION, CLEAR_OPTION]}
        value={healthRecordsOnly ? HEALTH_OPTION : ""}
        onSelect={(v) => {
          if (v === CLEAR_OPTION) clearAll();
          else setHealthRecordsOnly((current) => !current);
        }}
      />
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: "location-outline";
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label} filter`}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={15}
          color={active ? colors.accentText : colors.accentDark}
        />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.sm, marginBottom: spacing.md },
  title: { ...typography.title, textAlign: "center" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: { ...typography.body, flex: 1, paddingVertical: spacing.sm },
  chipRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.accentTint,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: {
    ...typography.caption,
    fontSize: 14,
    color: colors.accentDark,
    fontWeight: "600",
  },
  chipTextActive: { color: colors.accentText },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  retryButton: { marginTop: spacing.md },
  list: { paddingBottom: spacing.xl },
});

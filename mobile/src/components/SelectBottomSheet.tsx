import { useState } from "react";
import {
  Image,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BottomSheet } from "@/components/BottomSheet";
import { colors, radius, spacing, typography } from "@/theme/tokens";

interface OptionSection {
  title: string;
  options: readonly string[];
}

interface SelectBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** A flat option list — wrapped internally as a single untitled section. Ignored when `sections` is given. */
  options?: readonly string[];
  /** Grouped options rendered under a header per group (e.g. "Popular Cities" / "All Cities"). */
  sections?: readonly OptionSection[];
  value: string;
  onSelect: (value: string) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  /**
   * Lets the visitor submit whatever they typed even when it matches nothing
   * listed — used by pickers (city, breed) that must never trap someone
   * whose real answer isn't on the list.
   */
  allowCustom?: boolean;
  /** Optional small reference thumbnail shown before each row's label (e.g. a breed photo). */
  getOptionImage?: (option: string) => number;
}

/**
 * The reusable "Select Breed / Select City" sheet — search field (when
 * searchable), scrollable option list (optionally grouped into sections),
 * checkmark on the selected row, and an optional "use what I typed" row for
 * pickers that allow a custom answer. Selecting a row closes the sheet,
 * matching the reference interaction.
 */
export function SelectBottomSheet({
  visible,
  onClose,
  title,
  options,
  sections,
  value,
  onSelect,
  searchable,
  searchPlaceholder = "Search...",
  allowCustom,
  getOptionImage,
}: SelectBottomSheetProps) {
  const [query, setQuery] = useState("");

  const rawSections: readonly OptionSection[] = sections ?? [
    { title: "", options: options ?? [] },
  ];
  const normalizedQuery = query.trim().toLocaleLowerCase("en-IN");

  const filteredSections = rawSections
    .map((section) => ({
      title: section.title,
      data: normalizedQuery
        ? section.options.filter((o) =>
            o.toLocaleLowerCase("en-IN").includes(normalizedQuery),
          )
        : section.options,
    }))
    .filter((section) => section.data.length > 0);

  const hasExactMatch = rawSections.some((section) =>
    section.options.some(
      (o) => o.toLocaleLowerCase("en-IN") === normalizedQuery,
    ),
  );
  const showCustomRow =
    allowCustom && searchable && normalizedQuery.length > 0 && !hasExactMatch;

  function handleSelect(option: string) {
    onSelect(option);
    setQuery("");
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {searchable ? (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          autoCapitalize="none"
        />
      ) : null}
      <SectionList
        sections={filteredSections}
        keyExtractor={(item, index) => `${item}-${index}`}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const selected = item === value;
          const image = getOptionImage?.(item);
          return (
            <Pressable
              onPress={() => handleSelect(item)}
              style={styles.row}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View style={styles.rowMain}>
                {image ? (
                  <Image source={image} style={styles.optionImage} />
                ) : null}
                <Text style={typography.body}>{item}</Text>
              </View>
              {selected ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          );
        }}
        ListFooterComponent={
          showCustomRow ? (
            <Pressable
              onPress={() => handleSelect(query.trim())}
              style={styles.row}
              accessibilityRole="button"
            >
              <Text style={[typography.body, styles.customText]}>
                Use “{query.trim()}”
              </Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          showCustomRow ? null : (
            <Text style={[typography.bodyMuted, styles.empty]}>No matches</Text>
          )
        }
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  search: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  list: { maxHeight: 360 },
  sectionHeader: {
    ...typography.label,
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  optionImage: { width: 28, height: 28, borderRadius: 6 },
  check: { color: colors.accent, fontWeight: "700", fontSize: 16 },
  customText: { color: colors.accent, fontWeight: "600" },
  empty: { textAlign: "center", paddingVertical: spacing.lg },
});

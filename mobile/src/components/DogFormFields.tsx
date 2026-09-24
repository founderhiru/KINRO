import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChipSelect } from "@/components/ChipSelect";
import { ErrorText } from "@/components/ErrorText";
import { SelectBottomSheet } from "@/components/SelectBottomSheet";
import { TextField } from "@/components/TextField";
import { fetchBreedSuggestions } from "@/lib/dog-api";
import { ALL_BREEDS } from "@/lib/dog-breeds";
import {
  type DogFormErrors,
  type DogFormValues,
  SEX_OPTIONS,
} from "@/lib/dog-form";
import { OTHER_CITY_NAMES, POPULAR_CITIES } from "@/lib/india-cities";
import { colors, radius, spacing, typography } from "@/theme/tokens";

interface DogFormFieldsProps {
  values: DogFormValues;
  errors: DogFormErrors;
  onChange: (values: DogFormValues) => void;
  disabled?: boolean;
}

const CITY_SECTIONS = [
  { title: "Popular Cities", options: POPULAR_CITIES },
  { title: "All Cities", options: OTHER_CITY_NAMES },
] as const;

/**
 * The fields DogProfileWrite actually requires (see src/lib/dog-form.ts) —
 * shared between Add Dog and Edit Dog so the two forms can't drift apart.
 * City is offered as a clean picker over the small set of cities Discover's
 * existing distance search recognizes, rather than surfacing the backend's
 * internal city/coordinate mapping as a raw detail.
 */
export function DogFormFields({
  values,
  errors,
  onChange,
  disabled,
}: DogFormFieldsProps) {
  const [breedSuggestions, setBreedSuggestions] = useState<string[]>([]);
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  useEffect(() => {
    fetchBreedSuggestions()
      .then(setBreedSuggestions)
      .catch(() => {
        // Suggestions are a nicety, not required — the breed field still
        // works as free text if this fails (e.g. offline), and the local
        // catalogue below already covers common breeds without a network call.
      });
  }, []);

  function set<K extends keyof DogFormValues>(key: K, value: DogFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  // Server suggestions (real breeds already on file) plus the local
  // catalogue (see dog-breeds.ts) so autocomplete works offline too and
  // always covers breeds commonly encountered in India.
  const breedQuery = values.breed.trim().toLowerCase();
  const matchingSuggestions = Array.from(
    new Set([...breedSuggestions, ...ALL_BREEDS]),
  )
    .filter((b) => b.toLowerCase().includes(breedQuery))
    .filter((b) => b.toLowerCase() !== breedQuery)
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <TextField
        label="Dog's name"
        value={values.name}
        onChangeText={(text) => set("name", text)}
        editable={!disabled}
        placeholder="e.g. Bruno"
        maxLength={60}
      />
      {errors.name ? <ErrorText>{errors.name}</ErrorText> : null}

      <TextField
        label="Breed"
        value={values.breed}
        onChangeText={(text) => set("breed", text)}
        editable={!disabled}
        placeholder="e.g. Labrador Retriever"
        maxLength={80}
      />
      {matchingSuggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {matchingSuggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => set("breed", suggestion)}
              style={styles.suggestionChip}
              accessibilityRole="button"
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {errors.breed ? <ErrorText>{errors.breed}</ErrorText> : null}

      <View style={styles.field}>
        <ChipSelect
          label="Sex"
          options={SEX_OPTIONS}
          value={values.sex}
          onChange={(v) => set("sex", v)}
        />
        {errors.sex ? <ErrorText>{errors.sex}</ErrorText> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>City</Text>
        <Pressable
          onPress={() => setCitySheetOpen(true)}
          style={styles.pickerField}
          accessibilityRole="button"
        >
          <Text style={values.city ? typography.body : styles.placeholderText}>
            {values.city || "Select city"}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        {errors.city ? <ErrorText>{errors.city}</ErrorText> : null}
        <SelectBottomSheet
          visible={citySheetOpen}
          onClose={() => setCitySheetOpen(false)}
          title="Select City"
          sections={CITY_SECTIONS}
          value={values.city}
          onSelect={(v) => set("city", v)}
          searchable
          searchPlaceholder="Search city or town..."
          allowCustom
        />
      </View>

      <View style={styles.field}>
        <TextField
          label="Age (years)"
          value={values.ageYears}
          onChangeText={(text) =>
            set("ageYears", text.replace(/[^0-9]/g, "").slice(0, 2))
          }
          editable={!disabled}
          keyboardType="number-pad"
          placeholder="e.g. 3"
        />
        {errors.ageYears ? <ErrorText>{errors.ageYears}</ErrorText> : null}
      </View>

      <View style={styles.field}>
        <TextField
          label="About this dog"
          value={values.bio}
          onChangeText={(text) => set("bio", text)}
          editable={!disabled}
          placeholder="Temperament, routine, anything a good match should know"
          multiline
          numberOfLines={4}
          maxLength={1000}
          style={styles.multiline}
        />
        {errors.bio ? <ErrorText>{errors.bio}</ErrorText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  field: { gap: 0 },
  label: { ...typography.label, marginBottom: spacing.xs },
  pickerField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  placeholderText: { ...typography.body, color: colors.textMuted },
  chevron: { fontSize: 20, color: colors.textMuted },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  suggestionChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: { ...typography.bodyMuted, fontSize: 13 },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
});

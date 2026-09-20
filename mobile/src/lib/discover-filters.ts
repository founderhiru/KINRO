// Client-side refinements for the Discover list. The public discovery
// endpoint only filters by breed / city / radius, so the search box, the Age
// chip and the "health records on file" option narrow the already-fetched
// list here — no new backend capability.
import type { DogProfileItem } from "./discover-contracts";

export type AgeBandId = "under-2" | "2-4" | "5-plus";

export const AGE_BANDS: readonly {
  id: AgeBandId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: "under-2", label: "Under 2 years", min: 0, max: 1 },
  { id: "2-4", label: "2–4 years", min: 2, max: 4 },
  { id: "5-plus", label: "5+ years", min: 5, max: Number.POSITIVE_INFINITY },
];

export interface DiscoverRefinements {
  query?: string;
  ageBand?: AgeBandId;
  healthRecordsOnly?: boolean;
}

export function ageBandLabel(id: AgeBandId | undefined): string | undefined {
  return AGE_BANDS.find((band) => band.id === id)?.label;
}

/** True when at least one refinement is active. */
export function hasActiveRefinements(r: DiscoverRefinements): boolean {
  return Boolean(r.query?.trim() || r.ageBand || r.healthRecordsOnly);
}

export function refineDogs(
  dogs: readonly DogProfileItem[],
  refinements: DiscoverRefinements,
): DogProfileItem[] {
  const query = refinements.query?.trim().toLocaleLowerCase("en-IN") ?? "";
  const band = AGE_BANDS.find((b) => b.id === refinements.ageBand);

  return dogs.filter((dog) => {
    if (query) {
      const haystack = `${dog.name} ${dog.breed} ${dog.city}`.toLocaleLowerCase(
        "en-IN",
      );
      if (!haystack.includes(query)) return false;
    }
    if (band && (dog.ageYears < band.min || dog.ageYears > band.max)) {
      return false;
    }
    if (refinements.healthRecordsOnly && !dog.hasHealthRecords) return false;
    return true;
  });
}

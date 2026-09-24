// Mobile — the local breed catalogue for the Add/Edit Dog breed picker.
//
// The "real" breed list is server-driven (fetchBreedSuggestions in
// dog-api.ts, sourced from the public discovery endpoint's actual data), but
// that only ever contains breeds someone has already listed — a brand-new
// KINRO install has none. This static, categorized catalogue is what makes
// the breed picker usable offline and on day one, expanded to cover breeds
// commonly encountered in India (see BREED_SECTIONS). Server suggestions are
// still merged in on top wherever this is used (any real breed not already
// covered here still shows up).

export const POPULAR_BREEDS: readonly string[] = [
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd",
  "Shih Tzu",
  "Pomeranian",
  "Beagle",
  "Rottweiler",
  "French Bulldog",
  "Dachshund",
  "Cocker Spaniel",
  "Doberman",
  "Boxer",
  "Great Dane",
  "Pug",
  "Siberian Husky",
  "Chihuahua",
  "Lhasa Apso",
  "Pembroke Welsh Corgi",
  "Saint Bernard",
  "Cane Corso",
];

/** Native to, or long-established in, the Indian subcontinent. */
export const INDIAN_BREEDS: readonly string[] = [
  "Indian Pariah / Indian Native Dog",
  "Rajapalayam",
  "Mudhol Hound",
  "Chippiparai",
  "Kombai",
  "Rampur Greyhound",
  "Kanni",
  "Bakharwal Dog",
  "Himalayan Sheepdog",
  "Pandikona",
];

/** Always offered last, so a dog whose breed isn't listed — or isn't known — never gets forced into an inaccurate pick. */
export const OTHER_BREED_OPTIONS: readonly string[] = [
  "Mixed Breed",
  "Other / Unknown",
];

export interface BreedSection {
  title: string;
  options: readonly string[];
}

export const BREED_SECTIONS: readonly BreedSection[] = [
  { title: "Popular Breeds", options: POPULAR_BREEDS },
  { title: "Indian & Native Breeds", options: INDIAN_BREEDS },
  { title: "Other", options: OTHER_BREED_OPTIONS },
];

export const ALL_BREEDS: readonly string[] = [
  ...POPULAR_BREEDS,
  ...INDIAN_BREEDS,
  ...OTHER_BREED_OPTIONS,
];

/**
 * Breed sections plus any breed the server already has on file that isn't
 * already covered above (deduped case-insensitively) — used to build the
 * Select Breed sheet's options without ever showing the same breed twice.
 */
export function breedSectionsWithServerSuggestions(
  serverBreeds: readonly string[],
): readonly BreedSection[] {
  const known = new Set(ALL_BREEDS.map((b) => b.toLocaleLowerCase("en-IN")));
  const extra = serverBreeds.filter(
    (b) => !known.has(b.toLocaleLowerCase("en-IN")),
  );
  return extra.length > 0
    ? [{ title: "From the community", options: extra }, ...BREED_SECTIONS]
    : BREED_SECTIONS;
}

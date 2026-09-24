// Mobile — which breed sample photo (if any) a breed name should use. Pure
// data + lookup with no image require()s, so it can be unit-tested in plain
// Node (see tests/unit/breed-photo-keys.test.ts); the require()d images
// themselves live in breed-images.ts, keyed by the same canonical keys.

/** Lower-cased catalogue names (dog-breeds.ts) that have a photo in assets/breed-photos/. */
export const BREED_PHOTO_KEYS = [
  "labrador retriever",
  "golden retriever",
  "german shepherd",
  "shih tzu",
  "pomeranian",
  "beagle",
  "rottweiler",
  "french bulldog",
  "dachshund",
  "cocker spaniel",
  "doberman",
  "boxer",
  "great dane",
  "pug",
  "siberian husky",
  "chihuahua",
  "lhasa apso",
  "pembroke welsh corgi",
  "saint bernard",
  "cane corso",
  "indian pariah / indian native dog",
  "rajapalayam",
  "kombai",
] as const;

export type BreedPhotoKey = (typeof BREED_PHOTO_KEYS)[number];

/**
 * Other spellings of the SAME breed that owners type or the server already
 * stores (e.g. the seed data's "Indie"). Only unambiguous synonyms — never a
 * different breed that merely looks similar.
 */
const ALIASES: Readonly<Record<string, BreedPhotoKey>> = {
  labrador: "labrador retriever",
  lab: "labrador retriever",
  lebrador: "labrador retriever", // common misspelling already stored on a live profile
  golden: "golden retriever",
  "german shepherd dog": "german shepherd",
  gsd: "german shepherd",
  alsatian: "german shepherd",
  indie: "indian pariah / indian native dog",
  "indian pariah": "indian pariah / indian native dog",
  "indian pariah dog": "indian pariah / indian native dog",
  "indian native dog": "indian pariah / indian native dog",
  dobermann: "doberman",
  "doberman pinscher": "doberman",
  "st bernard": "saint bernard",
  husky: "siberian husky",
  "english cocker spaniel": "cocker spaniel",
  "welsh corgi pembroke": "pembroke welsh corgi",
  "rajapalayam hound": "rajapalayam",
  combai: "kombai",
};

const KEYS = new Set<string>(BREED_PHOTO_KEYS);

/** Case/spacing/punctuation-insensitive form: "St. Bernard" -> "st bernard", "Shih-Tzu" -> "shih tzu". */
export function normalizeBreedName(breed: string): string {
  return breed
    .toLocaleLowerCase("en-IN")
    .replace(/[.\-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The breed-photo key for a breed name, or null when there's no licensed sample for it. */
export function breedPhotoKeyFor(
  breed: string | null | undefined,
): BreedPhotoKey | null {
  if (!breed) return null;
  const name = normalizeBreedName(breed);
  if (KEYS.has(name)) return name as BreedPhotoKey;
  return ALIASES[name] ?? null;
}

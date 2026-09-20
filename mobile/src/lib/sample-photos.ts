// Which of the supplied sample photographs belongs to which SEEDED demo
// profile. Pure data + a lookup, with no image require()s, so it can be unit
// tested in plain Node (see tests/unit/sample-photos.test.ts) — the actual
// require()d images live in demo-photos.ts.
//
// Deliberately keyed by the demo profiles' exact slugs (see the seed in the
// web app's src/lib/seed.ts) and NOT by breed: a real owner's Golden
// Retriever must never be shown with a stock photo that looks like their dog.
// Real dogs without a photo keep the illustrated fallback.

export type SamplePhotoKey =
  | "golden-retriever"
  | "labrador"
  | "german-shepherd"
  | "beagle";

const SAMPLE_PROFILE_PHOTOS: Readonly<Record<string, SamplePhotoKey>> = {
  "rio-delhi-ncr": "golden-retriever",
  "nila-chennai": "golden-retriever",
  "bodhi-bengaluru": "labrador",
  "saffron-pune": "labrador",
  "atlas-mumbai": "german-shepherd",
  "pepper-mumbai": "beagle",
};

export function samplePhotoKeyForSlug(slug: string): SamplePhotoKey | null {
  return SAMPLE_PROFILE_PHOTOS[slug] ?? null;
}

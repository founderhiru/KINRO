// Mobile — breed reference thumbnails for the Select Breed sheet ONLY.
//
// This is deliberately separate from demo-photos.ts / DogPhoto.tsx, which
// exist specifically to NEVER show a stock photo that could pass as a real
// owner's actual dog (see demo-photos.ts's own comment). A small thumbnail
// next to "Golden Retriever" in a breed picker is unambiguous reference
// imagery, not a claim about anyone's dog, so it's fine to map real photos
// there — but that mapping must never be reused on an actual dog card.
//
// Only four breeds have a real (if placeholder-grade — see
// assets/images/README.md) photo in this repo today. Every other breed,
// Mixed Breed and Other / Unknown included, falls back to the same generic
// illustrated cover so the picker never shows an incorrect breed's photo.
const BREED_PHOTOS: Readonly<Record<string, number>> = {
  "labrador retriever": require("../../assets/images/photos/dog-labrador.jpg"),
  "golden retriever": require("../../assets/images/photos/dog-golden-retriever.jpg"),
  "german shepherd": require("../../assets/images/photos/dog-german-shepherd.jpg"),
  beagle: require("../../assets/images/photos/dog-beagle.jpg"),
};

const FALLBACK_BREED_IMAGE = require("../../assets/images/dog-cover-placeholder.jpg");

/** Breeds with a real reference photo available today — used by tests without needing to resolve the require()d assets. */
export const BREEDS_WITH_REAL_PHOTOS: readonly string[] = [
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd",
  "Beagle",
];

export function getBreedReferenceImage(breed: string): number {
  return (
    BREED_PHOTOS[breed.trim().toLocaleLowerCase("en-IN")] ??
    FALLBACK_BREED_IMAGE
  );
}

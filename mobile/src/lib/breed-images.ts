// Mobile — the one place dog imagery is chosen when a dog has no photo of
// its own. Used by DogPhoto (Discover, My Dogs, Dog Detail, Home) and by the
// Select Breed sheet's reference thumbnails.
//
// Priority, applied by DogPhoto: 1) the dog's own uploaded photo, 2) the
// licensed sample photo for its breed (below), 3) NEUTRAL_DOG_IMAGE. A breed
// without a sample never borrows another breed's photo, and never falls back
// to an illustration.
//
// One licensed real photograph per breed, from assets/breed-photos/ (sources,
// authors and licences in assets/breed-photos/ATTRIBUTIONS.md). Which breed
// name maps to which key (including aliases like "Indie" or "Labrador") is in
// breed-photo-keys.ts. require() paths must stay static literals for Metro.
import { type BreedPhotoKey, breedPhotoKeyFor } from "@/lib/breed-photo-keys";

const BREED_PHOTOS: Readonly<Record<BreedPhotoKey, number>> = {
  "labrador retriever": require("../../assets/breed-photos/labrador-retriever.jpg"),
  "golden retriever": require("../../assets/breed-photos/golden-retriever.jpg"),
  "german shepherd": require("../../assets/breed-photos/german-shepherd.jpg"),
  "shih tzu": require("../../assets/breed-photos/shih-tzu.jpg"),
  pomeranian: require("../../assets/breed-photos/pomeranian.jpg"),
  beagle: require("../../assets/breed-photos/beagle.jpg"),
  rottweiler: require("../../assets/breed-photos/rottweiler.jpg"),
  "french bulldog": require("../../assets/breed-photos/french-bulldog.jpg"),
  dachshund: require("../../assets/breed-photos/dachshund.jpg"),
  "cocker spaniel": require("../../assets/breed-photos/cocker-spaniel.jpg"),
  doberman: require("../../assets/breed-photos/doberman.jpg"),
  boxer: require("../../assets/breed-photos/boxer.jpg"),
  "great dane": require("../../assets/breed-photos/great-dane.jpg"),
  pug: require("../../assets/breed-photos/pug.jpg"),
  "siberian husky": require("../../assets/breed-photos/siberian-husky.jpg"),
  chihuahua: require("../../assets/breed-photos/chihuahua.jpg"),
  "lhasa apso": require("../../assets/breed-photos/lhasa-apso.jpg"),
  "pembroke welsh corgi": require("../../assets/breed-photos/pembroke-welsh-corgi.jpg"),
  "saint bernard": require("../../assets/breed-photos/saint-bernard.jpg"),
  "cane corso": require("../../assets/breed-photos/cane-corso.jpg"),
  "indian pariah / indian native dog": require("../../assets/breed-photos/indian-pariah.jpg"),
  rajapalayam: require("../../assets/breed-photos/rajapalayam.jpg"),
  kombai: require("../../assets/breed-photos/kombai.jpg"),
};

/** Plain warm surface with a small paw mark — no dog illustration. */
export const NEUTRAL_DOG_IMAGE = require("../../assets/images/dog-photo-fallback.jpg");

/** The licensed sample photo for a breed, or null when there isn't one. */
export function getBreedSamplePhoto(
  breed: string | null | undefined,
): number | null {
  const key = breedPhotoKeyFor(breed);
  return key ? BREED_PHOTOS[key] : null;
}

/** Select Breed sheet thumbnail: the breed's sample photo, else the neutral image. */
export function getBreedReferenceImage(breed: string): number {
  return getBreedSamplePhoto(breed) ?? NEUTRAL_DOG_IMAGE;
}

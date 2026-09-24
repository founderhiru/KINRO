import { describe, expect, it } from "vitest";
import {
  BREED_PHOTO_KEYS,
  breedPhotoKeyFor,
  normalizeBreedName,
} from "@/lib/breed-photo-keys";
import { ALL_BREEDS } from "@/lib/dog-breeds";

describe("breedPhotoKeyFor", () => {
  it("matches catalogue names regardless of case or spacing", () => {
    expect(breedPhotoKeyFor("German Shepherd")).toBe("german shepherd");
    expect(breedPhotoKeyFor("  labrador   retriever ")).toBe(
      "labrador retriever",
    );
    expect(breedPhotoKeyFor("Shih-Tzu")).toBe("shih tzu");
  });

  it("maps same-breed spellings used by owners and the seed data", () => {
    expect(breedPhotoKeyFor("Indie")).toBe("indian pariah / indian native dog");
    expect(breedPhotoKeyFor("Labrador")).toBe("labrador retriever");
    expect(breedPhotoKeyFor("Lebrador")).toBe("labrador retriever");
    expect(breedPhotoKeyFor("St. Bernard")).toBe("saint bernard");
    expect(breedPhotoKeyFor("Dobermann")).toBe("doberman");
    expect(breedPhotoKeyFor("Combai")).toBe("kombai");
  });

  it("never gives a breed without a sample another breed's photo", () => {
    for (const breed of [
      "Mixed Breed",
      "Other / Unknown",
      "Rampur Greyhound",
      "Kanni",
      "Bakharwal Dog",
      "Himalayan Sheepdog",
      "Pandikona",
      "Labradoodle",
      "Golden Doodle",
    ]) {
      expect(breedPhotoKeyFor(breed), breed).toBeNull();
    }
    expect(breedPhotoKeyFor("")).toBeNull();
    expect(breedPhotoKeyFor(null)).toBeNull();
    expect(breedPhotoKeyFor(undefined)).toBeNull();
  });

  it("only uses keys that are real catalogue breeds", () => {
    const catalogue = new Set(ALL_BREEDS.map(normalizeBreedName));
    for (const key of BREED_PHOTO_KEYS) {
      expect(catalogue.has(key), key).toBe(true);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  ALL_BREEDS,
  breedSectionsWithServerSuggestions,
  INDIAN_BREEDS,
  OTHER_BREED_OPTIONS,
  POPULAR_BREEDS,
} from "@/lib/dog-breeds";

describe("dog-breeds", () => {
  it("includes every required popular breed", () => {
    for (const breed of [
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
    ]) {
      expect(POPULAR_BREEDS).toContain(breed);
    }
  });

  it("includes every required Indian/native breed", () => {
    for (const breed of [
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
    ]) {
      expect(INDIAN_BREEDS).toContain(breed);
    }
  });

  it("always offers Mixed Breed and Other / Unknown", () => {
    expect(OTHER_BREED_OPTIONS).toEqual(["Mixed Breed", "Other / Unknown"]);
  });

  it("has no duplicate breeds across the catalogue", () => {
    const names = ALL_BREEDS.map((b) => b.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("merges in a server breed the catalogue doesn't already have", () => {
    const sections = breedSectionsWithServerSuggestions(["Tibetan Mastiff"]);
    expect(sections[0]).toEqual({
      title: "From the community",
      options: ["Tibetan Mastiff"],
    });
  });

  it("does not duplicate a server breed the catalogue already covers", () => {
    const sections = breedSectionsWithServerSuggestions(["golden retriever"]);
    const titles = sections.map((s) => s.title);
    expect(titles).not.toContain("From the community");
  });
});

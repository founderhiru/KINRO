import { describe, expect, it } from "vitest";
import type { DogProfileItem } from "@/lib/discover-contracts";
import {
  AGE_BANDS,
  ageBandLabel,
  hasActiveRefinements,
  refineDogs,
} from "@/lib/discover-filters";

function dog(overrides: Partial<DogProfileItem>): DogProfileItem {
  return {
    id: "1",
    slug: "x",
    name: "Bodhi",
    breed: "Labrador Retriever",
    city: "Pune",
    latitude: 0,
    longitude: 0,
    ageYears: 3,
    sex: "Male",
    bio: "",
    isVerified: false,
    distanceKm: null,
    coverPhotoUrl: null,
    hasHealthRecords: false,
    ...overrides,
  };
}

const dogs = [
  dog({ id: "1", name: "Bodhi", breed: "Labrador Retriever", ageYears: 3 }),
  dog({
    id: "2",
    name: "Rio",
    breed: "Golden Retriever",
    city: "Delhi NCR",
    ageYears: 5,
    hasHealthRecords: true,
  }),
  dog({ id: "3", name: "Pip", breed: "Beagle", city: "Mumbai", ageYears: 1 }),
];

describe("refineDogs", () => {
  it("returns everything when no refinement is set", () => {
    expect(refineDogs(dogs, {})).toHaveLength(3);
    expect(refineDogs(dogs, { query: "   " })).toHaveLength(3);
  });

  it("searches name, breed and city, case-insensitively", () => {
    expect(refineDogs(dogs, { query: "rio" }).map((d) => d.id)).toEqual(["2"]);
    expect(refineDogs(dogs, { query: "RETRIEVER" }).map((d) => d.id)).toEqual([
      "1",
      "2",
    ]);
    expect(refineDogs(dogs, { query: "mumbai" }).map((d) => d.id)).toEqual([
      "3",
    ]);
  });

  it("filters by age band, inclusive at the edges", () => {
    expect(refineDogs(dogs, { ageBand: "under-2" }).map((d) => d.id)).toEqual([
      "3",
    ]);
    expect(refineDogs(dogs, { ageBand: "2-4" }).map((d) => d.id)).toEqual([
      "1",
    ]);
    expect(refineDogs(dogs, { ageBand: "5-plus" }).map((d) => d.id)).toEqual([
      "2",
    ]);
  });

  it("filters to dogs with health records on file", () => {
    expect(
      refineDogs(dogs, { healthRecordsOnly: true }).map((d) => d.id),
    ).toEqual(["2"]);
  });

  it("combines refinements", () => {
    expect(
      refineDogs(dogs, { query: "retriever", ageBand: "5-plus" }).map(
        (d) => d.id,
      ),
    ).toEqual(["2"]);
  });

  it("never mutates the input", () => {
    const copy = [...dogs];
    refineDogs(dogs, { query: "rio" });
    expect(dogs).toEqual(copy);
  });
});

describe("helpers", () => {
  it("detects active refinements", () => {
    expect(hasActiveRefinements({})).toBe(false);
    expect(hasActiveRefinements({ query: "  " })).toBe(false);
    expect(hasActiveRefinements({ query: "a" })).toBe(true);
    expect(hasActiveRefinements({ ageBand: "2-4" })).toBe(true);
    expect(hasActiveRefinements({ healthRecordsOnly: true })).toBe(true);
  });

  it("labels age bands and covers every year of age without gaps", () => {
    expect(ageBandLabel(undefined)).toBeUndefined();
    expect(ageBandLabel("2-4")).toBe("2–4 years");
    for (let age = 0; age <= 30; age++) {
      const matches = AGE_BANDS.filter((b) => age >= b.min && age <= b.max);
      expect(matches).toHaveLength(1);
    }
  });
});

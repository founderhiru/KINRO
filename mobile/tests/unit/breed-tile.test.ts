import { describe, expect, it } from "vitest";
import { breedPhotoKeyFor } from "@/lib/breed-photo-keys";

import { breedInitials, breedTileFor } from "@/lib/breed-tile";
import { ALL_BREEDS } from "@/lib/dog-breeds";

describe("breedInitials", () => {
  it("uses the first letters of the first two words", () => {
    expect(breedInitials("Mudhol Hound")).toBe("MH");
    expect(breedInitials("Indian Pariah / Indian Native Dog")).toBe("IP");
  });
  it("uses the first two letters of a single word", () => {
    expect(breedInitials("Kanni")).toBe("KA");
  });
});

describe("breedTileFor", () => {
  it("gives no tile for a missing or generic breed", () => {
    for (const b of [
      null,
      undefined,
      "",
      "  ",
      "Mixed Breed",
      "Other / Unknown",
    ]) {
      expect(breedTileFor(b)).toBeNull();
    }
  });

  it("is stable for a breed and ignores case and spacing", () => {
    expect(breedTileFor("Chippiparai")).toEqual(breedTileFor("  chippiparai "));
  });

  it("gives every breed without a sample photo its own initials", () => {
    const without = ALL_BREEDS.filter((b) => !breedPhotoKeyFor(b));
    const tiles = without.map((b) => breedTileFor(b)).filter((t) => t !== null);
    expect(tiles.length).toBeGreaterThan(5);
    const seen = new Set(tiles.map((t) => `${t.initials}|${t.background}`));
    expect(seen.size).toBe(tiles.length);
  });
});

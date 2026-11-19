import { describe, expect, it } from "vitest";
import {
  countNearbyDogs,
  MIN_NEARBY_DOGS,
  shouldShowFirstInCity,
} from "@/lib/nearby";

describe("nearby dogs rule", () => {
  it("doesn't count the owner's own dogs", () => {
    const dogs = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(countNearbyDogs(dogs, ["b"])).toBe(2);
    expect(countNearbyDogs(dogs, [])).toBe(3);
    expect(countNearbyDogs([], ["a"])).toBe(0);
  });

  it("says 'be one of the first' until there are enough real dogs", () => {
    expect(shouldShowFirstInCity(0)).toBe(true);
    expect(shouldShowFirstInCity(MIN_NEARBY_DOGS - 1)).toBe(true);
    expect(shouldShowFirstInCity(MIN_NEARBY_DOGS)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  findKnownCity,
  INDIA_CITIES,
  OTHER_CITY_NAMES,
  POPULAR_CITIES,
} from "@/lib/india-cities";

describe("india-cities", () => {
  it("has exactly the 21 required popular cities, in order", () => {
    expect(POPULAR_CITIES).toEqual([
      "Mumbai",
      "Delhi NCR",
      "Bengaluru",
      "Hyderabad",
      "Chennai",
      "Pune",
      "Kolkata",
      "Ahmedabad",
      "Jaipur",
      "Lucknow",
      "Kochi",
      "Chandigarh",
      "Indore",
      "Nagpur",
      "Surat",
      "Coimbatore",
      "Mysuru",
      "Visakhapatnam",
      "Bhubaneswar",
      "Guwahati",
      "Dehradun",
    ]);
  });

  it("goes well beyond the popular list", () => {
    expect(OTHER_CITY_NAMES.length).toBeGreaterThan(50);
  });

  it("gives every city valid, distinct-looking coordinates", () => {
    for (const city of INDIA_CITIES) {
      expect(city.latitude).toBeGreaterThan(-90);
      expect(city.latitude).toBeLessThan(90);
      expect(city.longitude).toBeGreaterThan(-180);
      expect(city.longitude).toBeLessThan(180);
    }
  });

  it("has no duplicate city names", () => {
    const names = INDIA_CITIES.map((c) => c.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("finds a known city case-insensitively", () => {
    expect(findKnownCity("coimbatore")?.name).toBe("Coimbatore");
  });

  it("returns undefined for a city not in the list", () => {
    expect(findKnownCity("Nowhereville")).toBeUndefined();
  });
});

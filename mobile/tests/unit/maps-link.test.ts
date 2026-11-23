import { describe, expect, it } from "vitest";
import { mapsDirectionsUrl } from "@/lib/maps-link";

describe("mapsDirectionsUrl", () => {
  it("builds a keyless Google Maps search URL", () => {
    const url = mapsDirectionsUrl({
      name: "Happy Paws Clinic",
      addressLine: "Plot 4, Road 36",
      locality: "Jubilee Hills",
      city: "Hyderabad",
    });
    expect(url).toBe(
      "https://www.google.com/maps/search/?api=1&query=Happy%20Paws%20Clinic%2C%20Plot%204%2C%20Road%2036%2C%20Jubilee%20Hills%2C%20Hyderabad",
    );
    expect(url).not.toMatch(/key=/i);
  });
  it("skips missing parts", () => {
    expect(
      mapsDirectionsUrl({
        name: "Dr Rao",
        addressLine: null,
        locality: null,
        city: "Pune",
      }),
    ).toBe(
      "https://www.google.com/maps/search/?api=1&query=Dr%20Rao%2C%20Pune",
    );
  });
  it("encodes characters that would break the URL", () => {
    const url = mapsDirectionsUrl({ name: "A&B Vets #1", city: "Delhi" }) ?? "";
    expect(url).toContain("A%26B%20Vets%20%231%2C%20Delhi");
  });
  it("returns null when there is not enough to navigate to", () => {
    expect(mapsDirectionsUrl({ name: "Only a name" })).toBeNull();
    expect(mapsDirectionsUrl({ name: " ", city: " " })).toBeNull();
  });
});

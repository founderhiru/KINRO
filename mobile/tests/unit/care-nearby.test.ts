import { describe, expect, it } from "vitest";
import { NearbyPlaces } from "@/lib/care-contracts";

describe("nearby contract", () => {
  it("accepts a place with nulls and rejects missing placeId", () => {
    const ok = NearbyPlaces.safeParse({
      configured: true,
      area: "Madhapur",
      items: [
        {
          placeId: "p1",
          name: "X",
          address: null,
          phone: null,
          rating: null,
          ratingCount: null,
          openNow: null,
          mapsUrl: null,
        },
      ],
    });
    expect(ok.success).toBe(true);
    const bad = NearbyPlaces.safeParse({
      configured: true,
      area: "a",
      items: [{ name: "X" }],
    });
    expect(bad.success).toBe(false);
  });
});

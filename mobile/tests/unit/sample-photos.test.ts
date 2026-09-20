import { describe, expect, it } from "vitest";
import { samplePhotoKeyForSlug } from "@/lib/sample-photos";

describe("samplePhotoKeyForSlug", () => {
  it("maps the seeded sample profiles to the matching breed photo", () => {
    expect(samplePhotoKeyForSlug("rio-delhi-ncr")).toBe("golden-retriever");
    expect(samplePhotoKeyForSlug("nila-chennai")).toBe("golden-retriever");
    expect(samplePhotoKeyForSlug("bodhi-bengaluru")).toBe("labrador");
    expect(samplePhotoKeyForSlug("saffron-pune")).toBe("labrador");
    expect(samplePhotoKeyForSlug("atlas-mumbai")).toBe("german-shepherd");
    expect(samplePhotoKeyForSlug("pepper-mumbai")).toBe("beagle");
  });

  it("returns null for seeded profiles with no supplied photo", () => {
    expect(samplePhotoKeyForSlug("luna-hyderabad")).toBeNull();
    expect(samplePhotoKeyForSlug("miso-bengaluru")).toBeNull();
  });

  it("never gives a real owner's dog a stock photo (owner slugs end in a random suffix)", () => {
    expect(samplePhotoKeyForSlug("bruno-k3j9x2")).toBeNull();
    expect(samplePhotoKeyForSlug("golden-retriever")).toBeNull();
    expect(samplePhotoKeyForSlug("")).toBeNull();
  });
});

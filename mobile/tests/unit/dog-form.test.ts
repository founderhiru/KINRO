import { describe, expect, it } from "vitest";
import {
  type DogFormValues,
  isDogFormValid,
  resolveCity,
  validateDogForm,
} from "@/lib/dog-form";

const validValues: DogFormValues = {
  name: "Bruno",
  breed: "Labrador Retriever",
  city: "Bengaluru",
  sex: "Male",
  ageYears: "3",
  bio: "Friendly and energetic.",
};

describe("validateDogForm", () => {
  it("accepts a fully valid form", () => {
    expect(isDogFormValid(validateDogForm(validValues))).toBe(true);
  });

  it("requires a non-empty name", () => {
    const errors = validateDogForm({ ...validValues, name: "  " });
    expect(errors.name).toBeDefined();
  });

  it("rejects a name over 60 characters", () => {
    const errors = validateDogForm({ ...validValues, name: "a".repeat(61) });
    expect(errors.name).toBeDefined();
  });

  it("accepts a city outside the popular list — not restricted to a fixed set", () => {
    const errors = validateDogForm({ ...validValues, city: "Nowhereville" });
    expect(errors.city).toBeUndefined();
  });

  it("requires a non-empty city", () => {
    const errors = validateDogForm({ ...validValues, city: "  " });
    expect(errors.city).toBeDefined();
  });

  it("rejects a city name over 120 characters", () => {
    const errors = validateDogForm({ ...validValues, city: "a".repeat(121) });
    expect(errors.city).toBeDefined();
  });

  it("requires age to be a non-negative integer no greater than 30", () => {
    expect(
      validateDogForm({ ...validValues, ageYears: "" }).ageYears,
    ).toBeDefined();
    expect(
      validateDogForm({ ...validValues, ageYears: "-1" }).ageYears,
    ).toBeDefined();
    expect(
      validateDogForm({ ...validValues, ageYears: "3.5" }).ageYears,
    ).toBeDefined();
    expect(
      validateDogForm({ ...validValues, ageYears: "31" }).ageYears,
    ).toBeDefined();
    expect(
      validateDogForm({ ...validValues, ageYears: "0" }).ageYears,
    ).toBeUndefined();
    expect(
      validateDogForm({ ...validValues, ageYears: "30" }).ageYears,
    ).toBeUndefined();
  });

  it("requires a non-empty bio within 1000 characters", () => {
    expect(validateDogForm({ ...validValues, bio: " " }).bio).toBeDefined();
    expect(
      validateDogForm({ ...validValues, bio: "a".repeat(1001) }).bio,
    ).toBeDefined();
  });
});

describe("resolveCity", () => {
  it("finds an exact match's real coordinates, popular or not", () => {
    expect(resolveCity("Mumbai")).toEqual(
      expect.objectContaining({
        name: "Mumbai",
        latitude: 19.076,
        longitude: 72.8777,
      }),
    );
    expect(resolveCity("Coimbatore")).toEqual(
      expect.objectContaining({ name: "Coimbatore" }),
    );
  });

  it("matches case-insensitively", () => {
    expect(resolveCity("mumbai")?.name).toBe("Mumbai");
  });

  it("still resolves a city that isn't in the known list, rather than rejecting it", () => {
    const resolved = resolveCity("Nowhereville");
    expect(resolved).toEqual(expect.objectContaining({ name: "Nowhereville" }));
    expect(typeof resolved?.latitude).toBe("number");
    expect(typeof resolved?.longitude).toBe("number");
  });

  it("returns undefined only for an empty name", () => {
    expect(resolveCity("   ")).toBeUndefined();
  });
});

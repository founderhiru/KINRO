// Mobile (Phase mobile-M2) — pure validation, kept free of RN imports so it
// can be unit-tested directly.

import { findKnownCity, INDIA_CENTER } from "./india-cities";

export interface CityOption {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Resolves whatever the city picker produced — an exact pick from
 * src/lib/india-cities.ts, or a city typed by hand that isn't in that list —
 * into something DogProfileWrite can send. A known city gets its real
 * coordinates; an unknown one gets the typed name paired with India's
 * geographic centre as a best-effort placeholder (see india-cities.ts) so a
 * dog's city is never restricted to a fixed list. Only an empty name fails
 * to resolve, which is what validateDogForm below checks for.
 */
export function resolveCity(name: string): CityOption | undefined {
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  return findKnownCity(trimmed) ?? { name: trimmed, ...INDIA_CENTER };
}

export const SEX_OPTIONS = ["Male", "Female"] as const;
export type SexOption = (typeof SEX_OPTIONS)[number];

export interface DogFormValues {
  name: string;
  breed: string;
  city: string;
  sex: string;
  ageYears: string; // kept as the raw text-input value; parsed at validation time
  bio: string;
}

export interface DogFormErrors {
  name?: string;
  breed?: string;
  city?: string;
  sex?: string;
  ageYears?: string;
  bio?: string;
}

/**
 * Mirrors the backend's DogProfileWrite constraints (see
 * src/lib/contracts/dog-profiles.ts) so the form fails the same way the API
 * would, before ever making a network request.
 */
export function validateDogForm(values: DogFormValues): DogFormErrors {
  const errors: DogFormErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Name is required";
  else if (name.length > 60) errors.name = "Name is too long";

  const breed = values.breed.trim();
  if (!breed) errors.breed = "Breed is required";
  else if (breed.length > 80) errors.breed = "Breed is too long";

  const city = values.city.trim();
  if (!city) errors.city = "Choose a city";
  else if (city.length > 120) errors.city = "City is too long";

  const sex = values.sex.trim();
  if (!sex) errors.sex = "Sex is required";

  const age = Number(values.ageYears);
  if (values.ageYears.trim() === "" || Number.isNaN(age)) {
    errors.ageYears = "Age is required";
  } else if (!Number.isInteger(age) || age < 0) {
    errors.ageYears = "Age must be 0 or more";
  } else if (age > 30) {
    errors.ageYears = "Age is too high";
  }

  const bio = values.bio.trim();
  if (!bio) errors.bio = "Tell us a bit about your dog";
  else if (bio.length > 1000) errors.bio = "Bio is too long";

  return errors;
}

export function isDogFormValid(errors: DogFormErrors): boolean {
  return Object.keys(errors).length === 0;
}

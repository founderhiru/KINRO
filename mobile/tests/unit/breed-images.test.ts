import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_BREEDS } from "@/lib/dog-breeds";

// breed-images.ts require()s image files, which only Metro can load, so this
// reads it as text instead of importing it. That still catches the two ways
// it can break: a mistyped image path (a bundling error) and a catalogue
// breed that silently lost its photo.
const SOURCE_PATH = resolve(__dirname, "../../src/lib/breed-images.ts");
const source = readFileSync(SOURCE_PATH, "utf8");

const photoMap = source.slice(
  source.indexOf("const BREED_PHOTOS"),
  source.indexOf("/** Plain warm surface"),
);
const neutral = source.match(/NEUTRAL_DOG_IMAGE = require\("([^"]+)"\)/)?.[1];
const entries = [
  ...photoMap.matchAll(/(?:"([^"]+)"|([a-z]+)):\s*require\("([^"]+)"\)/g),
].map((m) => ({ key: m[1] ?? m[2] ?? "", path: m[3] ?? "" }));

// No single correct photo, or not in the sample pack yet: generic fallback.
const EXPECTED_FALLBACK = [
  "Mixed Breed",
  "Other / Unknown",
  "Mudhol Hound",
  "Chippiparai",
  "Rampur Greyhound",
  "Kanni",
  "Bakharwal Dog",
  "Himalayan Sheepdog",
  "Pandikona",
];

describe("breed reference images", () => {
  it("points every mapped breed at an image file that exists", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const { path } of entries) {
      expect(existsSync(resolve(dirname(SOURCE_PATH), path)), path).toBe(true);
    }
  });

  it("has a real photo for every catalogue breed except the fallback ones", () => {
    const mapped = new Set(entries.map((e) => e.key));
    for (const breed of ALL_BREEDS) {
      const key = breed.toLocaleLowerCase("en-IN");
      expect(mapped.has(key), breed).toBe(!EXPECTED_FALLBACK.includes(breed));
    }
  });

  it("uses a neutral fallback image that exists and is not an illustrated dog", () => {
    expect(neutral).toBe("../../assets/images/dog-photo-fallback.jpg");
    expect(existsSync(resolve(dirname(SOURCE_PATH), neutral ?? ""))).toBe(true);
    // The illustrated dogs must not be referenced for dog imagery anymore.
    expect(source).not.toMatch(/dog-cover-placeholder|demo-dogs/);
  });

  it("uses only the licensed breed-photos pack for breed photos", () => {
    for (const { path } of entries) {
      expect(path).toMatch(/^\.\.\/\.\.\/assets\/breed-photos\/[a-z-]+\.jpg$/);
    }
  });
});

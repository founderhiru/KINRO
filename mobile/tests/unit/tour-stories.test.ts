import { describe, expect, it } from "vitest";
import { breedPhotoKeyFor } from "@/lib/breed-photo-keys";
import {
  nextStoryIndex,
  prevStoryIndex,
  STORY_DURATION_MS,
  TOUR_STORIES,
} from "@/lib/tour-stories";

describe("tour stories", () => {
  it("has four stories with unique ids and copy on each", () => {
    expect(TOUR_STORIES).toHaveLength(4);
    expect(new Set(TOUR_STORIES.map((s) => s.id)).size).toBe(4);
    for (const story of TOUR_STORIES) {
      expect(story.title.length).toBeGreaterThan(0);
      expect(story.subtitle.length).toBeGreaterThan(0);
    }
  });

  it("only illustrates stories with breeds that have a licensed sample photo", () => {
    for (const story of TOUR_STORIES) {
      expect(breedPhotoKeyFor(story.breed)).not.toBeNull();
    }
  });

  it("never makes trust or verification claims", () => {
    const text = TOUR_STORIES.map((s) => `${s.title} ${s.subtitle}`)
      .join(" ")
      .toLowerCase();
    expect(text).not.toMatch(/verified|certified|guaranteed|trusted/);
  });

  it("advances one story at a time and stops after the last", () => {
    expect(nextStoryIndex(0, 4)).toBe(1);
    expect(nextStoryIndex(2, 4)).toBe(3);
    expect(nextStoryIndex(3, 4)).toBeNull();
  });

  it("steps back but never before the first story", () => {
    expect(prevStoryIndex(3)).toBe(2);
    expect(prevStoryIndex(0)).toBe(0);
  });

  it("keeps each story long enough to read", () => {
    expect(STORY_DURATION_MS).toBeGreaterThanOrEqual(3000);
  });
});

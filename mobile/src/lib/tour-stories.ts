// Pure data and stepping logic for the pre-login tour (app/(auth)/tour.tsx),
// kept free of React Native imports so it can be unit-tested directly.

export type TourStoryId = "dogs" | "nearby" | "health" | "chat";

export interface TourStory {
  id: TourStoryId;
  title: string;
  subtitle: string;
  /** Breed whose licensed sample photo illustrates the story. */
  breed: string;
}

/**
 * Short, honest cues about what you get after signing in. The photos are
 * licensed breed samples, not real profiles, and nothing here claims dogs or
 * records have been verified.
 */
export const TOUR_STORIES: readonly TourStory[] = [
  {
    id: "dogs",
    title: "Every dog, one home",
    subtitle: "Profiles, reminders and records together.",
    breed: "German Shepherd",
  },
  {
    id: "nearby",
    title: "Meet dogs nearby",
    subtitle: "Browse by breed and city, then say hello.",
    breed: "Golden Retriever",
  },
  {
    id: "health",
    title: "Health records, ready",
    subtitle: "Keep everything your vet asks for in one place.",
    breed: "Labrador Retriever",
  },
  {
    id: "chat",
    title: "Chat when both agree",
    subtitle: "Messages open only when both owners are interested.",
    breed: "Beagle",
  },
] as const;

/** How long each story stays on screen before the tour moves on by itself. */
export const STORY_DURATION_MS = 4500;

/** The next story's index, or null when `index` is already the last one. */
export function nextStoryIndex(index: number, count: number): number | null {
  return index + 1 < count ? index + 1 : null;
}

/** The previous story's index; the first story stays on the first story. */
export function prevStoryIndex(index: number): number {
  return Math.max(0, index - 1);
}

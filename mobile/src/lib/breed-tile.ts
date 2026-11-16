// Mobile — the stand-in shown for a breed that has no licensed sample photo.
//
// Before this, every such breed (the Indian breeds beyond the three we have
// photos for, anything owners type in, the "From the community" list) showed
// the SAME neutral image, so a grid of different breeds looked like one
// repeated picture. A breed tile is still honest — it is plainly not a photo —
// but it is different per breed: the breed's initials on one of a few calm
// colours, chosen from the breed name so a breed always gets the same colour.
//
// Pure data + lookup (no React Native), so it is unit-tested in plain Node.
import { normalizeBreedName } from "@/lib/breed-photo-keys";

export interface BreedTileSpec {
  initials: string;
  background: string;
  foreground: string;
}

/** Calm tints taken from the app palette plus a few muted neighbours; text on each is WCAG AA. */
const PALETTE: readonly { background: string; foreground: string }[] = [
  { background: "#E3EFE8", foreground: "#234F3B" }, // brand green
  { background: "#F8E9C8", foreground: "#6F4D0E" }, // warm cream
  { background: "#E6E0F0", foreground: "#43345F" }, // dusk violet
  { background: "#DCE8F1", foreground: "#244B69" }, // soft blue
  { background: "#F5DED7", foreground: "#7F3526" }, // clay
  { background: "#E8ECD3", foreground: "#4A5420" }, // olive
  { background: "#F1E3EA", foreground: "#6B2E4D" }, // rose
  { background: "#DDEBEA", foreground: "#1F5453" }, // teal
];

/** Breed entries that name no breed at all — these keep the plain neutral image. */
const GENERIC = new Set([
  "mixed breed",
  "mixed",
  "other",
  "other / unknown",
  "unknown",
]);

/** Up to two letters: first letters of the first two words, or the first two letters of a single word. */
export function breedInitials(breed: string): string {
  const words = breed
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0] ?? "";
  const second = words[1];
  const letters = second
    ? first.charAt(0) + second.charAt(0)
    : first.slice(0, 2);
  return letters.toLocaleUpperCase("en-IN");
}

/** Small stable string hash (djb2) — same breed name, same colour, on every device. */
function hash(text: string): number {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** The tile for a breed name, or null when the name is missing or names no breed. */
export function breedTileFor(
  breed: string | null | undefined,
): BreedTileSpec | null {
  if (!breed) return null;
  const name = normalizeBreedName(breed);
  if (!name || GENERIC.has(name)) return null;
  const initials = breedInitials(breed);
  if (!initials) return null;
  const colours = PALETTE[hash(name) % PALETTE.length] ?? PALETTE[0];
  return {
    initials,
    background: colours?.background ?? "#E3EFE8",
    foreground: colours?.foreground ?? "#234F3B",
  };
}

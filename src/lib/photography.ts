// Homepage photography slots.
//
// Each slot is one photo at a fixed path: /public/kinro/photography/<slot>.jpg.
// If the file exists, the homepage shows it. If it does not, the homepage shows
// the slot's on-brand fallback instead. So adding or replacing a photo is just
// "upload a JPG with the right filename" (GitHub web UI is fine) — no code change.
//
// Rules for every photo (see public/kinro/photography/README.md):
//   - Real photography, natural light, warm and calm. No illustrations.
//   - 3:2 landscape, about 1200 x 800 px, JPEG under ~200 KB.
//   - No flags, national symbols or readable brand names in the frame.
//   - Only photos KINRO owns, commissioned, or licensed for commercial use.
//
// This file is only imported by Server Components (it reads the filesystem).
import { existsSync } from 'node:fs';
import path from 'node:path';

export const PHOTO_SLOTS = {
  'lifetime-puppy': {
    alt: 'A smiling Golden Retriever puppy, close up, with soft ears and bright eyes.',
    brief:
      'Golden Retriever or Labrador puppy at a vet check-up, owner and veterinarian together. Warm and reassuring.',
  },
  'lifetime-adult': {
    alt: 'A happy adult Golden Retriever smiling in soft outdoor light.',
    brief:
      'Healthy adult dog with its family at home, children interacting with the dog. Natural light.',
  },
  'lifetime-senior': {
    alt: 'A senior Golden Retriever with a grey muzzle resting its head on its paw.',
    brief:
      'Senior Golden Retriever or Labrador in a wellness exam with a veterinarian. Care and trust.',
  },
  'pillar-health': {
    alt: 'A dog owner reviewing their dog’s vaccination and health records on a phone.',
    brief: 'Owner reviewing vaccination timeline and health records on a phone, dog beside them.',
  },
  'pillar-family': {
    alt: 'A family sharing the care of their dog at home.',
    brief: 'Family caring for their dog together at home. Shared responsibility.',
  },
  'pillar-identity': {
    alt: 'Side profile of a cream Labrador Retriever against soft green foliage.',
    brief: 'Premium dog portrait; ideally a parent and puppy together.',
  },
  'pillar-community': {
    alt: 'Several dogs playing together in a park while their owners chat.',
    brief: 'Several dogs interacting in a park, owners meeting. Natural light.',
  },
  'pillar-vet': {
    alt: 'A veterinarian examining a dog in a bright, modern clinic.',
    brief: 'Veterinarian examining a dog in a modern clinic.',
  },
  'pillar-ai': {
    alt: 'A clean phone dashboard showing a dog’s wellness summary.',
    brief:
      'Premium phone showing a calm, modern dog wellness dashboard. Do not show invented user data.',
  },
} as const;

export type PhotoSlot = keyof typeof PHOTO_SLOTS;

const PHOTO_DIR = path.join(process.cwd(), 'public', 'kinro', 'photography');

/** Public URL of the slot's photo, or null when no photo has been added yet. */
export function photoSrc(slot: PhotoSlot): string | null {
  return existsSync(path.join(PHOTO_DIR, `${slot}.jpg`)) ? `/kinro/photography/${slot}.jpg` : null;
}

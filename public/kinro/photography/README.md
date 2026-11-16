# KINRO homepage photography

The homepage shows a photo for each slot below **if the file exists**. If it
does not, it shows an on-brand fallback (an app-screen crop or a soft icon tile).
So to add or replace a photo, upload a JPG with the exact filename into this
folder (GitHub web UI is fine). No code change is needed.

## Specs (every photo)

- Real photography. Natural light, warm and calm. No illustrations or cartoons.
- 3:2 landscape, about **1200 x 800 px**, JPEG, under ~200 KB.
- Keep the subject in the centre: cards crop slightly on mobile and desktop.
- No flags, national symbols, readable brand names, or watermarks in the frame.
- Only photos KINRO owns, has commissioned, or has a licence to use commercially.
  Record the source and licence in `ATTRIBUTIONS.md` in this folder.
- Do not reuse one photo in two slots.

## Slots

| File | Where it appears | Shot brief |
|---|---|---|
| `lifetime-puppy.jpg` | A dog's lifetime: Puppy | Golden Retriever or Labrador puppy at a vet check-up, owner and veterinarian together. Warm, reassuring. |
| `lifetime-adult.jpg` | A dog's lifetime: Adult | Healthy adult dog with its family at home, children interacting with the dog. |
| `lifetime-senior.jpg` | A dog's lifetime: Senior | Senior Golden Retriever or Labrador in a wellness exam with a veterinarian. Care and trust. |
| `pillar-health.jpg` | Pillar 1: Dog Health Intelligence | Owner reviewing vaccination timeline and health records on a phone, dog beside them. |
| `pillar-family.jpg` | Pillar 2: Family Dog Management | Family caring for their dog together at home. |
| `pillar-identity.jpg` | Pillar 3: Dog Identity & Lineage | Premium dog portrait, ideally parent and puppy. |
| `pillar-community.jpg` | Pillar 4: Community & Connections | Several dogs in a park, owners meeting. |
| `pillar-vet.jpg` | Pillar 5: Vet & Pet Care Network | Veterinarian examining a dog in a modern clinic. |
| `pillar-ai.jpg` | Pillar 6: AI Dog Wellness Intelligence | Premium phone showing a calm dog wellness dashboard. Never show invented user data. |

Alt text for each slot lives in `src/lib/photography.ts`. Update it if a photo's
content differs from the brief.

## Current state

Interim AI-generated images are in place for `lifetime-puppy`, `lifetime-adult` and `lifetime-senior`, and an interim licensed photo for `pillar-identity`. The other slots use fallbacks until photos are added. Replace the interim images with commissioned or licensed photography when available.

# Image assets

Every file in this folder is currently **stylized flat-illustration
artwork** — genuinely recognizable as a dog (simple sitting-dog
character, brand-colored collar), not a photograph and not an abstract
gradient. There is no image-generation tool or licensed photo source
available in this project's environment, so hand-drawn illustration is
the honest option that's actually achievable here — a real photo still
needs to come from you (owned, commissioned, or properly licensed).

| File / folder | Used by | Notes |
|---|---|---|
| `splash-hero.jpg` | `app/index.tsx` (`LoadingSplash`, via `HeroImage`) | Full-bleed portrait; a single dog illustration on a dark-to-warm vertical gradient so light text reads at the bottom |
| `welcome-hero.jpg` | `app/welcome.tsx` (via `HeroImage`) | Same treatment, dog + a simple abstract owner silhouette reaching toward it |
| `dog-cover-placeholder.jpg` | `src/components/DogPhoto.tsx` (final fallback tier) | Landscape; shown only when a dog has no `demoKey` at all (see `src/lib/demo-photos.ts`) |
| `demo-dogs/demo-dog-1.jpg` … `demo-dog-6.jpg` | `src/lib/demo-photos.ts` | Six visually-distinct illustrated dogs (different coat colors/ear styles), deterministically assigned per dog by `getDemoPhotoForKey()` — same dog always gets the same one |
| `kinro-symbol.png`, `kinro-app-icon.png`, `kinro-android-adaptive-icon.png` | Home header (`my-dog/index.tsx`), `app.json` (`icon`, `android.adaptiveIcon.foregroundImage`) | **Real brand artwork**, not illustration — cropped directly from the approved KINRO logo file, pixels untouched. The iOS app icon and native splash logo (`ios/CanidKnot/Images.xcassets/`) are separate crops of the same source file, not re-derived from these. |

## Swapping in real photography

Each file is loaded via a static `require()` at a fixed path — replace
the file in place (same filename, same folder) and no code changes are
needed anywhere. Keep the same aspect ratio so existing crops/
`resizeMode="cover"` layouts don't shift:

- `splash-hero.jpg` / `welcome-hero.jpg`: portrait, ~750×1334
- `dog-cover-placeholder.jpg` / `demo-dogs/*.jpg`: landscape, ~800×600

You can replace anywhere from one to all six `demo-dogs/*.jpg` files
independently — `getDemoPhotoForKey()` doesn't care what's actually in
each file, only that all six exist.

Only use images you have the rights to (owned, commissioned, or under a
license that permits commercial app use) — do not substitute images
sourced without a clear license.

## KINRO photo pack (`photos/`) — placeholder-grade

Added from `KINRO_JPEG_Asset_Pack.zip`. **These are crops from design
boards, not production exports** (the pack's own README says so), so they
are small and will look soft on a full-screen phone display. Replace each
with an optimized original at the same filename when available.

| File | Source in pack | Size now | Used by | Wanted for production |
|---|---|---|---|---|
| `splash-dog.jpg` | `marketing/hero_dog.jpg` | 194×299 | Splash (`src/components/SplashView.tsx`) | ~1170×2532 portrait |
| `dog-golden-retriever.jpg` | `dog_photos/` | 152×144 | Onboarding 1, Home community card, sample profiles Rio + Nila, Select Breed picker (Golden Retriever) | ≥ 800×600 |
| `dog-labrador.jpg` | `dog_photos/` | 152×144 | Sample profiles Bodhi + Saffron, Select Breed picker (Labrador Retriever) | ≥ 800×600 |
| `dog-german-shepherd.jpg` | `dog_photos/` | 153×144 | Sample profile Atlas, Select Breed picker (German Shepherd) | ≥ 800×600 |
| `dog-beagle.jpg` | `dog_photos/` | 152×144 | Sample profile Pepper, Select Breed picker (Beagle) | ≥ 800×600 |

### Breed reference thumbnails (`src/lib/breed-images.ts`)

The Select Breed sheet (Add Dog, and anywhere else `SelectBottomSheet` is
given `getOptionImage`) shows a small reference photo next to a breed name
when one of the four real photos above matches it. This is deliberately
separate from `demo-photos.ts`/`DogPhoto.tsx`, which must never show a stock
photo that could pass as a real owner's actual dog — a labeled thumbnail in
a *picker* is unambiguous reference imagery, not a claim about anyone's dog.

Every other breed in the catalogue (`src/lib/dog-breeds.ts`), including
Mixed Breed and Other / Unknown, falls back to `dog-cover-placeholder.jpg`.
**Real photos are still needed** for the other 30+ catalogued breeds —
Labrador, Golden Retriever, German Shepherd and Beagle are the only ones
with one today.

Not used, on purpose: `marketing/splash_dog.jpg` and `marketing/hero_group.jpg`
have KINRO text and taglines baked into the picture, so they would print
duplicate text over the app's own headline. The pack has no dog-and-owner
photo or puppy photo, so Welcome still uses the illustrated `welcome-hero.jpg`.

The photos are only ever shown for the **seeded sample profiles**
(`src/lib/sample-photos.ts`, keyed by exact slug). A real owner's dog with no
photo still gets an illustrated fallback — never a stock photo that could be
mistaken for their dog.

`splash-hero.jpg` (illustration) is no longer used by the app.

# KINRO product gap assessment

**Positioning:** KINRO, The Digital Life Record for Every Dog.
**Audited:** 16 Nov 2026, from the code on `main` (web, API, Prisma schema, Expo mobile app).
**Rule:** the website only presents what this audit found in code. Anything else is labelled
"Coming soon" on the homepage. Update both this file and `src/app/(setup)/page.tsx` when a feature ships.

## 1. Feature matrix (what actually exists)

| Feature | Existing today (evidence) | Enhancement required | New development |
|---|---|---|---|
| Dog profiles | `DogProfile` (name, breed, city, lat/long, age in whole years, sex, bio), `DogPhoto` (R2), owner profile. Web `/dogs/*`, `/discover/*`; mobile My Dogs add, edit, detail, photos. | Store date of birth instead of `ageYears` (age-based care needs it). Microchip / registration number field. | None |
| Health records | `HealthRecord` (type `vaccination` \| `vetVisit` \| `other`, title, date, vet name, notes) and `HealthDocument` (private R2 bucket, short-lived signed download). Mobile list, add, edit. | Structured fields per type (next due date, batch no., dose). A timeline view across record types. | Allergies and medical conditions model. |
| Vaccination records | Logged as `type = vaccination`. No due date. | `nextDueOn` and a dedicated vaccination form. | Reminders (see below). |
| Deworming | Not modelled (could only be filed under `other`). | None | `deworming` record type with schedule. |
| Medication records | Not modelled. | None | `medication` record type: dose, frequency, start and end. |
| Reminders | None. No scheduler, no push tokens. `NotificationEvent` is a generic in-app event log. | None | Render Cron Job, `expo-notifications`, due-date queries. |
| Family sharing | None. A dog has one `ownerId`. | None | `DogMember` (role, permissions), invitations, activity log, permission checks on every dog and health route. |
| Dog lineage | None. No parent, pedigree or registration fields. | None | Parent link (sire / dam, self-relation or external), pedigree and registration documents, breeding records. Always shown as owner-submitted. |
| Discover | Public web and mobile Discover. Breed and city filters, Indian metro city picker, dog detail. | Optional: breed communities. | None for the core. |
| Messaging | Interest, then mutual `Match`, then `Conversation` / `Message`. Report and block (`/api/reports`, `/api/blocks`). | None | None for the core. |
| Vet directory | None. Only a free-text `vetName` on a record. | None | `Clinic` and `VetProfile` models, search, contact details, verification workflow. |
| AI health intelligence | None. No LLM calls anywhere in the code. | None | Document summarisation service, consent flow, safety guardrails (no diagnosis, no prescribing). |
| Trust and safety | Private health documents, account deletion removes dogs, photos, records and files (`src/lib/account-deletion.ts`), report and block, `isVerified` flag (hidden in UI). | A real verification workflow before any badge is shown. | Moderation tooling and admin review queue. |

## 2. Pillar status

**Homepage policy (16 Nov 2026):** the homepage shows only shipped features. It has no status labels and no "coming soon" items. Pillars 1, 3 and 4 appear (as Dog Health Records, Dog Identity, Community & Connections). Pillars 2, 5 and 6 are left off until they ship. When a feature ships, add it to `src/app/(setup)/page.tsx` and update this table.

| Pillar | Status shown | Live now | Coming soon |
|---|---|---|---|
| 1. Dog Health Intelligence | Partly available | Vaccinations, vet visits, private documents | Deworming, medication, allergies, reminders |
| 2. Family Dog Management | Coming soon | None | All |
| 3. Dog Identity & Lineage | Partly available | Dog profile | Parent profiles, pedigree, registration, breeding records |
| 4. Community & Connections | Available | Discover, mutual-interest chat, report and block | Breed communities |
| 5. Vet & Pet Care Network | Partly available | Vet name on a visit record | Clinic discovery, record sharing, verified badges |
| 6. AI Dog Wellness Intelligence | Coming soon | None | All |

## 3. Recommended build order

Ranked by value to an owner against effort. Effort: S under 1 week, M 1 to 3 weeks, L over 3 weeks.

| # | Work | Value | Effort | Why this order |
|---|---|---|---|---|
| 1 | Date of birth, `nextDueOn`, deworming and medication record types, allergies and conditions | High | S to M | Mostly additive columns and forms on the existing health-record flow. Unlocks Pillar 1 fully. |
| 2 | Health timeline view (web and mobile) | High | S | Pure presentation over existing data. It is the visible "life record". |
| 3 | Reminders (vaccination, deworming, medication) | High | M | Biggest retention driver. Needs a cron job and push tokens, so it comes after #1. |
| 4 | Lineage fields: parent link, registration number, pedigree documents | Medium | M | Differentiator. Label as owner-submitted until verification exists. |
| 5 | Family sharing (members, roles, invitations) | High | L | Touches auth checks on every dog route. Do it once the data model from #1 is stable. |
| 6 | Vet directory and owner-authorised record sharing | Medium | L | Needs a verification process and a time-limited share link design. |
| 7 | AI summaries of documents | Medium | L | Needs consent, cost controls, and clear "not veterinary advice" handling. Last, after records are structured. |

## 4. Backend, database and mobile changes by pillar

- **Pillar 1:** Prisma migration (new `type` values, `nextDueOn`, allergy and condition tables, DOB). Extend `src/lib/contracts/health-records.ts`. Mobile: new forms under `my-dog/[id]/health`.
- **Pillar 2:** New `DogMember` and `DogInvite` models. Replace `ownerId` checks with a membership permission helper across all `/api/dog-profiles/*` routes. Mobile: invite and manage-members screens.
- **Pillar 3:** Parent relation on `DogProfile`, registration number, pedigree document type. Do not call lineage "verified" until a verification step exists.
- **Pillar 4:** Already shipped. Breed communities need a `Community` model and moderation.
- **Pillar 5:** `Clinic`, `VetProfile`, `RecordShare` (scoped, expiring, revocable). Verification workflow and admin tool before any badge.
- **Pillar 6:** Server-side job that reads a document, calls an LLM, and stores a summary linked to the record. Explicit owner consent per document, visible disclaimer, no diagnosis or prescribing.

## 5. Responsible breeding and regulation

Breeding-related features (lineage, breeding records, breeder registration) should be reviewed against the
applicable Indian rules for dog breeders before launch. Confirm the current requirements with a qualified
adviser. KINRO must not present itself as a veterinary authority or as government-certified.

## 6. Known gaps in the current repository (not product features)

- `npm run typecheck` and `next build` need the Prisma client. They cannot be run in an environment that blocks `binaries.prisma.sh`.
- `tests/unit/lib/storage.test.ts` has one Biome formatting error on `main` (indentation of `R2_PHOTOS_BUCKET_NAME`).
- Homepage photography: only `pillar-identity.jpg` is a real photo. The other eight slots show on-brand fallbacks until photos are added (see `public/kinro/photography/README.md`).

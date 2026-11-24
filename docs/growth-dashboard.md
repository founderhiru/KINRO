# Founder Growth Dashboard (Phase 1)

Founder-only page at `/admin/growth`. Everyone else, signed in or not, gets a 404.

## Access
Set `isFounder = true` on your own `user` row in the database. There is no UI for this on purpose.

## Where each number comes from
| Number | Source |
|---|---|
| Registrations, total users | `user` table (founders and `GROWTH_EXCLUDE_USER_IDS` left out) |
| Dog profiles, owners with a dog | `dog_profile` (dogs without an owner, i.e. demo dogs, are not counted) |
| Interests, matches, messages | `interest`, `match`, `message` |
| Care requests and outcomes | `care_appointment` by status; providers from `care_provider` |
| Cities | owner profile city, grouped through the known-city list, otherwise "Other" |
| Website download clicks | `download_click`, written when `/get/ios` or `/get/android` is opened |
| Store downloads | `store_snapshot`, typed in by hand each week from App Store Connect and Play Console |
| First app opens | **Not measured yet** (Phase 2) |

Store downloads, website clicks, first opens and registrations are different things. They are shown side by side and never added together or turned into conversion percentages.

## Weekly routine
1. In App Store Connect and Play Console, read last week's figures (whole weeks).
2. On the dashboard, use "Add store figures": week ending, store, figure, number. Re-entering the same week and figure overwrites it.

## Things to know
- Dates are reported in IST. Timestamps are stored in UTC.
- Counts are live. If an account is deleted, past numbers shrink. There is no daily snapshot table in Phase 1.
- Groups smaller than 5 show as "<5".
- Click logging stores only platform, a short source tag (`web`, `qr`, `direct`) and time. No IP, device or user id.
- Optional env: `GROWTH_EXCLUDE_USER_IDS`, `GROWTH_LAUNCH_DATE`.

## Migration
`prisma/migrations/20261123120000_add_growth_dashboard` adds two new tables (`download_click`, `store_snapshot`). Nothing existing is altered. It was written by hand, so run `prisma migrate diff` against a copy of the schema before deploying. Back up the database first.

## Phase 2 (not built)
First opens, sessions, platform and app version from the mobile app. Needs an updated privacy policy and Apple/Google privacy declarations first.

// Shared contract for the Founder Growth Dashboard: the report the founder-only API
// returns and the store-figure form it accepts. Aggregates only; nothing in here
// identifies a person.
import { z } from 'zod';

/** A count that is hidden below 5 so small groups cannot point at one person. */
export const SuppressedCount = z.object({
  count: z.number().int().nonnegative().nullable(), // null = fewer than 5
});
export type SuppressedCount = z.infer<typeof SuppressedCount>;

const DayCount = z.object({ day: z.string(), count: z.number().int().nonnegative() });

export const STORE_METRICS = {
  ios: ['page_views', 'first_time_downloads', 'redownloads'],
  android: ['page_views', 'installs'],
} as const;

export const StorePlatform = z.enum(['ios', 'android']);
export type StorePlatform = z.infer<typeof StorePlatform>;

export const StoreMetric = z.enum([
  'page_views',
  'first_time_downloads',
  'redownloads',
  'installs',
]);
export type StoreMetric = z.infer<typeof StoreMetric>;

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)), 'Not a real date');

/** POST /api/admin/growth/store-snapshots */
export const StoreSnapshotWrite = z
  .object({
    weekEnding: dateOnly,
    platform: StorePlatform,
    metric: StoreMetric,
    value: z.number().int().min(0).max(100_000_000),
  })
  .refine((v) => (STORE_METRICS[v.platform] as readonly string[]).includes(v.metric), {
    message: 'That figure does not exist for this store',
    path: ['metric'],
  });
export type StoreSnapshotWrite = z.infer<typeof StoreSnapshotWrite>;

const StoreEntry = z.object({
  weekEnding: z.string(),
  platform: StorePlatform,
  metric: StoreMetric,
  value: z.number().int(),
  enteredAt: z.string(),
});

export const GrowthReport = z.object({
  generatedAt: z.string(),
  range: z.object({
    days: z.number().int(),
    startDay: z.string(),
    endDay: z.string(),
    /** Set when GROWTH_LAUNCH_DATE cuts off earlier data. */
    launchDay: z.string().nullable(),
  }),
  /** Accounts left out of every count (founders plus GROWTH_EXCLUDE_USER_IDS). */
  excludedAccounts: z.number().int(),

  totals: z.object({
    users: z.number().int(),
    dogs: z.number().int(),
    ownersWithDog: z.number().int(),
  }),

  period: z.object({
    registrations: z.number().int(),
    dogs: z.number().int(),
    interestsSent: z.number().int(),
    interestsAccepted: z.number().int(),
    interestsDeclined: z.number().int(),
    matches: z.number().int(),
    messages: z.number().int(),
    conversationsWithMessages: z.number().int(),
    usersWhoMessaged: z.number().int(),
  }),

  care: z.object({
    requests: z.number().int(),
    requested: z.number().int(), // waiting for the provider
    confirmed: z.number().int(), // confirmed or completed
    declined: z.number().int(),
    cancelled: z.number().int(),
    /** confirmed / (confirmed + declined); null until a provider has answered one. */
    confirmRate: z.number().min(0).max(1).nullable(),
    providersPublished: z.number().int(),
    providersVerified: z.number().int(),
  }),

  series: z.object({
    registrations: z.array(DayCount),
    downloadClicks: z.array(DayCount),
  }),

  /** Website visits to /get/ios and /get/android. Not downloads. */
  downloadClicks: z.object({
    total: z.number().int(),
    ios: z.number().int(),
    android: z.number().int(),
    bySource: z.array(z.object({ source: z.string(), count: z.number().int().nullable() })),
  }),

  /** Figures typed in by hand from App Store Connect and Play Console. */
  store: z.object({
    weeksEntered: z.number().int(),
    lastEnteredAt: z.string().nullable(),
    ios: z.object({
      pageViews: z.number().int(),
      firstTimeDownloads: z.number().int(),
      redownloads: z.number().int(),
    }),
    android: z.object({ pageViews: z.number().int(), installs: z.number().int() }),
    entries: z.array(StoreEntry),
  }),

  cities: z.array(z.object({ city: z.string(), count: z.number().int().nullable() })),
});
export type GrowthReport = z.infer<typeof GrowthReport>;

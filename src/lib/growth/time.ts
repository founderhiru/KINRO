// Reporting days for the Founder Growth Dashboard. KINRO reports in India Standard
// Time (UTC+05:30, no daylight saving). Timestamps stay in UTC in the database; this
// only decides which calendar day an instant belongs to.
//
// Apple's App Analytics works in UTC, so a store "day" and a KINRO "day" can differ by
// up to 5.5 hours. The dashboard therefore takes store figures as whole weeks.

const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const GROWTH_RANGES = [7, 30, 90] as const;
export type GrowthRangeDays = (typeof GROWTH_RANGES)[number];

/** 'YYYY-MM-DD' of the IST calendar day that contains this instant. */
export function istDayKey(instant: Date): string {
  return new Date(instant.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The UTC instant at which an IST calendar day starts. */
export function istDayStart(dayKey: string): Date {
  return new Date(Date.parse(`${dayKey}T00:00:00.000Z`) - IST_OFFSET_MS);
}

/** Moves a 'YYYY-MM-DD' key by whole days. */
export function addDays(dayKey: string, days: number): string {
  return new Date(Date.parse(`${dayKey}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export type ReportRange = {
  days: GrowthRangeDays;
  /** First and last IST day shown (the last is today). */
  startDay: string;
  endDay: string;
  /** Inclusive start, exclusive end, as UTC instants. */
  start: Date;
  end: Date;
  /** Every IST day in the range, oldest first. */
  dayKeys: string[];
};

/** The last `days` IST days up to and including today. */
export function reportRange(days: GrowthRangeDays, now: Date): ReportRange {
  const endDay = istDayKey(now);
  const startDay = addDays(endDay, -(days - 1));
  const dayKeys: string[] = [];
  for (let i = 0; i < days; i += 1) dayKeys.push(addDays(startDay, i));
  return {
    days,
    startDay,
    endDay,
    start: istDayStart(startDay),
    end: istDayStart(addDays(endDay, 1)),
    dayKeys,
  };
}

/** Counts instants per IST day, returning one entry per day in the range (zeros included). */
export function bucketByIstDay(
  instants: Date[],
  dayKeys: string[],
): { day: string; count: number }[] {
  const counts = new Map<string, number>(dayKeys.map((day) => [day, 0]));
  for (const instant of instants) {
    const key = istDayKey(instant);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return dayKeys.map((day) => ({ day, count: counts.get(day) ?? 0 }));
}

/** Parses a range query value; anything unexpected falls back to 30 days. */
export function parseRangeDays(value: string | null | undefined): GrowthRangeDays {
  const n = Number(value);
  return (GROWTH_RANGES as readonly number[]).includes(n) ? (n as GrowthRangeDays) : 30;
}

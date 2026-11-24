// Optional dashboard settings, read straight from the environment so no framework-owned
// file (src/lib/env.ts) has to change. Both are optional; the dashboard works without them.
//
//   GROWTH_EXCLUDE_USER_IDS  comma-separated user ids to leave out of every count
//                            (your own, QA and tester accounts). Founder accounts
//                            (isFounder = true) are always left out as well.
//   GROWTH_LAUNCH_DATE       YYYY-MM-DD (IST). When set, nothing created before that day
//                            is counted, so pre-launch testing never shows up.

export type GrowthConfig = {
  excludeUserIds: string[];
  launchDay: string | null;
};

export function growthConfig(env: NodeJS.ProcessEnv = process.env): GrowthConfig {
  const excludeUserIds = (env.GROWTH_EXCLUDE_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const raw = (env.GROWTH_LAUNCH_DATE ?? '').trim();
  const launchDay = /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(Date.parse(raw)) ? raw : null;
  return { excludeUserIds, launchDay };
}

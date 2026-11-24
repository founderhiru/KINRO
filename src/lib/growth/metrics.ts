// Builds the Founder Growth Dashboard report from tables KINRO already has, plus the two
// Phase 1 tables (website download clicks and hand-entered store figures).
//
// Everything returned is an aggregate. Counts are live: when someone deletes their account
// their rows disappear, so past figures can shrink slightly. (Phase 1 does not freeze daily
// snapshots; see docs/growth-dashboard.md.)
import 'server-only';

import type { GrowthReport } from '@/lib/contracts/growth';
import { prisma } from '@/lib/db';
import { growthConfig } from '@/lib/growth/config';
import { bucketByIstDay, type GrowthRangeDays, istDayStart, reportRange } from '@/lib/growth/time';
import { findKnownCity } from '@/lib/india-cities';

const SMALL_GROUP = 5;

/** Hides counts below 5 (returns null) so a tiny group cannot point at one person. */
export function suppress(count: number): number | null {
  return count >= SMALL_GROUP ? count : null;
}

/** Groups declared cities through KINRO's own city list; anything unknown is 'Other'. */
export function groupCities(rows: { city: string; count: number }[]) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const name = findKnownCity(row.city)?.name ?? 'Other';
    totals.set(name, (totals.get(name) ?? 0) + row.count);
  }
  return [...totals.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => (a.city === 'Other' ? 1 : b.city === 'Other' ? -1 : b.count - a.count))
    .map(({ city, count }) => ({ city, count: suppress(count) }));
}

/** confirmed / (confirmed + declined), or null while no provider has answered. */
export function confirmRate(confirmed: number, declined: number): number | null {
  const answered = confirmed + declined;
  return answered === 0 ? null : confirmed / answered;
}

type StatusCount = { status: string; _count: { _all: number } };

/** Folds care appointment statuses into the buckets the dashboard shows. */
export function summariseCare(rows: StatusCount[]) {
  const by = (...statuses: string[]) =>
    rows.filter((r) => statuses.includes(r.status)).reduce((sum, r) => sum + r._count._all, 0);
  const confirmed = by('confirmed', 'completed');
  const declined = by('declined');
  return {
    requests: rows.reduce((sum, r) => sum + r._count._all, 0),
    requested: by('requested'),
    confirmed,
    declined,
    cancelled: by('cancelled'),
    confirmRate: confirmRate(confirmed, declined),
  };
}

export async function getGrowthReport(
  days: GrowthRangeDays,
  now: Date = new Date(),
): Promise<GrowthReport> {
  const config = growthConfig();
  const range = reportRange(days, now);

  // Accounts that must never be counted: every founder, plus any listed in the environment.
  const founders = await prisma.user.findMany({ where: { isFounder: true }, select: { id: true } });
  const excluded = [...new Set([...config.excludeUserIds, ...founders.map((f) => f.id)])];

  // Nothing before the launch day is counted, when one is set.
  const launchStart = config.launchDay ? istDayStart(config.launchDay) : null;
  const periodStart = launchStart && launchStart > range.start ? launchStart : range.start;
  const inPeriod = { gte: periodStart, lt: range.end };
  const sinceLaunch = launchStart ? { gte: launchStart } : undefined;

  const notInternal = { notIn: excluded };
  const ownedDog = { ownerId: { not: null, ...notInternal } } as const;
  const messageScope = { senderId: notInternal, createdAt: inPeriod };
  const careScope = { relationship: { ownerId: notInternal }, createdAt: inPeriod };
  const storeFrom = new Date(`${range.startDay}T00:00:00.000Z`);
  const storeTo = new Date(`${range.endDay}T00:00:00.000Z`);

  const [
    totalUsers,
    registrationRows,
    totalDogs,
    ownerGroups,
    dogsInPeriod,
    interestsSent,
    interestsAccepted,
    interestsDeclined,
    matches,
    messages,
    conversationGroups,
    senderGroups,
    careRows,
    providersPublished,
    providersVerified,
    cityRows,
    clickRows,
    storeRows,
  ] = await Promise.all([
    prisma.user.count({ where: { id: notInternal, createdAt: sinceLaunch } }),
    prisma.user.findMany({
      where: { id: notInternal, createdAt: inPeriod },
      select: { createdAt: true },
    }),
    prisma.dogProfile.count({ where: { ...ownedDog, createdAt: sinceLaunch } }),
    prisma.dogProfile.groupBy({ by: ['ownerId'], where: { ...ownedDog, createdAt: sinceLaunch } }),
    prisma.dogProfile.count({ where: { ...ownedDog, createdAt: inPeriod } }),
    prisma.interest.count({ where: { senderId: notInternal, createdAt: inPeriod } }),
    prisma.interest.count({
      where: { senderId: notInternal, createdAt: inPeriod, status: 'accepted' },
    }),
    prisma.interest.count({
      where: { senderId: notInternal, createdAt: inPeriod, status: 'declined' },
    }),
    prisma.match.count({
      where: { senderId: notInternal, receiverId: notInternal, createdAt: inPeriod },
    }),
    prisma.message.count({ where: messageScope }),
    prisma.message.groupBy({ by: ['conversationId'], where: messageScope }),
    prisma.message.groupBy({ by: ['senderId'], where: messageScope }),
    prisma.careAppointment.groupBy({
      by: ['status'],
      where: careScope,
      _count: { _all: true },
    }),
    prisma.careProvider.count({ where: { listingStatus: 'published' } }),
    prisma.careProvider.count({
      where: { listingStatus: 'published', verificationStatus: 'verified' },
    }),
    prisma.ownerProfile.groupBy({
      by: ['city'],
      where: { userId: notInternal, createdAt: sinceLaunch },
      _count: { _all: true },
    }),
    prisma.downloadClick.findMany({
      where: { createdAt: inPeriod },
      select: { platform: true, source: true, createdAt: true },
    }),
    prisma.storeSnapshot.findMany({
      where: { weekEnding: { gte: storeFrom, lte: storeTo } },
      orderBy: [{ weekEnding: 'desc' }, { platform: 'asc' }, { metric: 'asc' }],
    }),
  ]);

  // Website clicks by platform and by source tag.
  const clicksByPlatform = { ios: 0, android: 0 };
  const clicksBySource = new Map<string, number>();
  for (const click of clickRows) {
    if (click.platform === 'ios') clicksByPlatform.ios += 1;
    else if (click.platform === 'android') clicksByPlatform.android += 1;
    clicksBySource.set(click.source, (clicksBySource.get(click.source) ?? 0) + 1);
  }

  // Store figures: add up the weeks entered inside the range, per figure.
  const storeTotal = (platform: string, metric: string) =>
    storeRows
      .filter((r) => r.platform === platform && r.metric === metric)
      .reduce((sum, r) => sum + r.value, 0);
  const lastEntered = storeRows.reduce<Date | null>(
    (latest, r) => (!latest || r.enteredAt > latest ? r.enteredAt : latest),
    null,
  );

  return {
    generatedAt: now.toISOString(),
    range: {
      days,
      startDay: range.startDay,
      endDay: range.endDay,
      launchDay: config.launchDay,
    },
    excludedAccounts: excluded.length,
    totals: {
      users: totalUsers,
      dogs: totalDogs,
      ownersWithDog: ownerGroups.length,
    },
    period: {
      registrations: registrationRows.length,
      dogs: dogsInPeriod,
      interestsSent,
      interestsAccepted,
      interestsDeclined,
      matches,
      messages,
      conversationsWithMessages: conversationGroups.length,
      usersWhoMessaged: senderGroups.length,
    },
    care: {
      ...summariseCare(careRows),
      providersPublished,
      providersVerified,
    },
    series: {
      registrations: bucketByIstDay(
        registrationRows.map((r) => r.createdAt),
        range.dayKeys,
      ),
      downloadClicks: bucketByIstDay(
        clickRows.map((c) => c.createdAt),
        range.dayKeys,
      ),
    },
    downloadClicks: {
      total: clickRows.length,
      ios: clicksByPlatform.ios,
      android: clicksByPlatform.android,
      bySource: [...clicksBySource.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([source, count]) => ({ source, count: suppress(count) })),
    },
    store: {
      weeksEntered: new Set(storeRows.map((r) => r.weekEnding.toISOString().slice(0, 10))).size,
      lastEnteredAt: lastEntered ? lastEntered.toISOString() : null,
      ios: {
        pageViews: storeTotal('ios', 'page_views'),
        firstTimeDownloads: storeTotal('ios', 'first_time_downloads'),
        redownloads: storeTotal('ios', 'redownloads'),
      },
      android: {
        pageViews: storeTotal('android', 'page_views'),
        installs: storeTotal('android', 'installs'),
      },
      entries: storeRows.slice(0, 60).map((r) => ({
        weekEnding: r.weekEnding.toISOString().slice(0, 10),
        platform: r.platform as 'ios' | 'android',
        metric: r.metric as GrowthReport['store']['entries'][number]['metric'],
        value: r.value,
        enteredAt: r.enteredAt.toISOString(),
      })),
    },
    cities: groupCities(cityRows.map((r) => ({ city: r.city, count: r._count._all }))),
  };
}

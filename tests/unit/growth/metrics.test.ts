// @vitest-environment node
// The numbers on the dashboard: exclusions, counting, grouping and hiding small groups.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const db = vi.hoisted(() => ({
  user: { count: vi.fn(), findMany: vi.fn() },
  dogProfile: { count: vi.fn(), groupBy: vi.fn() },
  interest: { count: vi.fn() },
  match: { count: vi.fn() },
  message: { count: vi.fn(), groupBy: vi.fn() },
  careAppointment: { groupBy: vi.fn() },
  careProvider: { count: vi.fn() },
  ownerProfile: { groupBy: vi.fn() },
  downloadClick: { findMany: vi.fn() },
  storeSnapshot: { findMany: vi.fn() },
}));
vi.mock('@/lib/db', () => ({ prisma: db }));

import { GrowthReport } from '@/lib/contracts/growth';
import {
  confirmRate,
  getGrowthReport,
  groupCities,
  summariseCare,
  suppress,
} from '@/lib/growth/metrics';

const NOW = new Date('2026-11-23T10:00:00.000Z'); // 23 Nov, 15:30 IST

function stage(overrides: Partial<Record<string, unknown>> = {}) {
  db.user.findMany.mockImplementation(async (args: { where: { isFounder?: boolean } }) =>
    args.where.isFounder ? [{ id: 'founder_1' }] : (overrides.registrations ?? []),
  );
  db.user.count.mockResolvedValue(overrides.totalUsers ?? 0);
  db.dogProfile.count
    .mockResolvedValueOnce(overrides.totalDogs ?? 0)
    .mockResolvedValueOnce(overrides.dogsInPeriod ?? 0);
  db.dogProfile.groupBy.mockResolvedValue(overrides.owners ?? []);
  db.interest.count.mockResolvedValueOnce(10).mockResolvedValueOnce(4).mockResolvedValueOnce(2);
  db.match.count.mockResolvedValue(3);
  db.message.count.mockResolvedValue(25);
  db.message.groupBy
    .mockResolvedValueOnce([{ conversationId: 'c1' }, { conversationId: 'c2' }])
    .mockResolvedValueOnce([{ senderId: 'a' }, { senderId: 'b' }, { senderId: 'c' }]);
  db.careAppointment.groupBy.mockResolvedValue(overrides.care ?? []);
  db.careProvider.count.mockResolvedValueOnce(8).mockResolvedValueOnce(5);
  db.ownerProfile.groupBy.mockResolvedValue(overrides.cities ?? []);
  db.downloadClick.findMany.mockResolvedValue(overrides.clicks ?? []);
  db.storeSnapshot.findMany.mockResolvedValue(overrides.store ?? []);
}

beforeEach(() => {
  for (const table of Object.values(db)) for (const fn of Object.values(table)) fn.mockReset();
  delete process.env.GROWTH_EXCLUDE_USER_IDS;
  delete process.env.GROWTH_LAUNCH_DATE;
});
afterEach(() => {
  delete process.env.GROWTH_EXCLUDE_USER_IDS;
  delete process.env.GROWTH_LAUNCH_DATE;
});

describe('small helpers', () => {
  it('hides counts below 5', () => {
    expect(suppress(0)).toBeNull();
    expect(suppress(4)).toBeNull();
    expect(suppress(5)).toBe(5);
  });

  it('groups declared cities through the known-city list, with unknown cities as Other', () => {
    const out = groupCities([
      { city: 'hyderabad', count: 4 },
      { city: 'Hyderabad ', count: 3 },
      { city: 'Mumbai', count: 9 },
      { city: 'Smallville', count: 2 },
      { city: 'Nowhere', count: 7 },
    ]);
    expect(out).toEqual([
      { city: 'Mumbai', count: 9 },
      { city: 'Hyderabad', count: 7 },
      { city: 'Other', count: 9 },
    ]);
  });

  it('hides a city until it has 5 owners', () => {
    expect(groupCities([{ city: 'Chennai', count: 4 }])).toEqual([
      { city: 'Chennai', count: null },
    ]);
  });

  it('computes the confirmation rate from confirmed and declined only', () => {
    expect(confirmRate(0, 0)).toBeNull();
    expect(confirmRate(3, 1)).toBe(0.75);
    expect(confirmRate(0, 2)).toBe(0);
  });

  it('folds appointment statuses into dashboard buckets', () => {
    const out = summariseCare([
      { status: 'requested', _count: { _all: 4 } },
      { status: 'confirmed', _count: { _all: 3 } },
      { status: 'completed', _count: { _all: 2 } },
      { status: 'declined', _count: { _all: 1 } },
      { status: 'cancelled', _count: { _all: 1 } },
    ]);
    expect(out).toEqual({
      requests: 11,
      requested: 4,
      confirmed: 5,
      declined: 1,
      cancelled: 1,
      confirmRate: 5 / 6,
    });
  });
});

describe('getGrowthReport', () => {
  it('leaves out founders and listed accounts from every count', async () => {
    process.env.GROWTH_EXCLUDE_USER_IDS = 'tester_1, tester_2';
    stage();
    const report = await getGrowthReport(30, NOW);
    expect(report.excludedAccounts).toBe(3);
    const excluded = ['tester_1', 'tester_2', 'founder_1'];
    expect(db.user.count.mock.calls[0]?.[0].where.id).toEqual({ notIn: excluded });
    expect(db.dogProfile.count.mock.calls[0]?.[0].where.ownerId).toEqual({
      not: null,
      notIn: excluded,
    });
    expect(db.interest.count.mock.calls[0]?.[0].where.senderId).toEqual({ notIn: excluded });
    expect(db.message.count.mock.calls[0]?.[0].where.senderId).toEqual({ notIn: excluded });
    expect(db.careAppointment.groupBy.mock.calls[0]?.[0].where.relationship).toEqual({
      ownerId: { notIn: excluded },
    });
  });

  it('counts only dogs that have an owner (demo dogs have none)', async () => {
    stage();
    await getGrowthReport(30, NOW);
    expect(db.dogProfile.count.mock.calls[0]?.[0].where.ownerId.not).toBeNull();
  });

  it('counts registrations per IST day across the midnight boundary', async () => {
    stage({
      totalUsers: 120,
      registrations: [
        { createdAt: new Date('2026-11-22T18:29:00Z') }, // 22 Nov IST
        { createdAt: new Date('2026-11-22T18:31:00Z') }, // 23 Nov IST
        { createdAt: new Date('2026-11-23T04:00:00Z') }, // 23 Nov IST
      ],
    });
    const report = await getGrowthReport(7, NOW);
    expect(report.totals.users).toBe(120);
    expect(report.period.registrations).toBe(3);
    const byDay = Object.fromEntries(report.series.registrations.map((p) => [p.day, p.count]));
    expect(byDay['2026-11-22']).toBe(1);
    expect(byDay['2026-11-23']).toBe(2);
    expect(report.series.registrations).toHaveLength(7);
  });

  it('adds up connections, messages and Care outcomes', async () => {
    stage({
      care: [
        { status: 'requested', _count: { _all: 2 } },
        { status: 'confirmed', _count: { _all: 3 } },
        { status: 'declined', _count: { _all: 1 } },
      ],
    });
    const report = await getGrowthReport(30, NOW);
    expect(report.period).toMatchObject({
      interestsSent: 10,
      interestsAccepted: 4,
      interestsDeclined: 2,
      matches: 3,
      messages: 25,
      conversationsWithMessages: 2,
      usersWhoMessaged: 3,
    });
    expect(report.care).toMatchObject({
      requests: 6,
      confirmed: 3,
      declined: 1,
      confirmRate: 0.75,
      providersPublished: 8,
      providersVerified: 5,
    });
  });

  it('counts owners with a dog from the distinct owners', async () => {
    stage({ totalDogs: 5, owners: [{ ownerId: 'a' }, { ownerId: 'b' }, { ownerId: 'c' }] });
    const report = await getGrowthReport(30, NOW);
    expect(report.totals).toMatchObject({ dogs: 5, ownersWithDog: 3 });
  });

  it('counts website clicks by platform and hides small sources', async () => {
    const at = new Date('2026-11-23T05:00:00Z');
    const click = (platform: string, source: string) => ({ platform, source, createdAt: at });
    stage({
      clicks: [
        ...Array.from({ length: 6 }, () => click('ios', 'qr')),
        click('android', 'web'),
        click('android', 'web'),
      ],
    });
    const report = await getGrowthReport(30, NOW);
    expect(report.downloadClicks).toMatchObject({ total: 8, ios: 6, android: 2 });
    expect(report.downloadClicks.bySource).toEqual([
      { source: 'qr', count: 6 },
      { source: 'web', count: null },
    ]);
  });

  it('keeps store figures separate and adds up only the weeks entered', async () => {
    const row = (weekEnding: string, platform: string, metric: string, value: number) => ({
      weekEnding: new Date(`${weekEnding}T00:00:00Z`),
      platform,
      metric,
      value,
      enteredAt: new Date('2026-11-22T08:00:00Z'),
    });
    stage({
      registrations: [{ createdAt: new Date('2026-11-23T04:00:00Z') }],
      store: [
        row('2026-11-15', 'ios', 'first_time_downloads', 40),
        row('2026-11-08', 'ios', 'first_time_downloads', 25),
        row('2026-11-15', 'ios', 'redownloads', 5),
        row('2026-11-15', 'android', 'installs', 30),
        row('2026-11-15', 'ios', 'page_views', 900),
      ],
    });
    const report = await getGrowthReport(30, NOW);
    expect(report.store.ios).toEqual({ pageViews: 900, firstTimeDownloads: 65, redownloads: 5 });
    expect(report.store.android).toEqual({ pageViews: 0, installs: 30 });
    expect(report.store.weeksEntered).toBe(2);
    // Store numbers never leak into KINRO's own counts.
    expect(report.period.registrations).toBe(1);
    expect(report.totals.users).toBe(0);
  });

  it('cuts off everything before the launch day', async () => {
    process.env.GROWTH_LAUNCH_DATE = '2026-11-20';
    stage();
    const report = await getGrowthReport(30, NOW);
    const launchStart = new Date('2026-11-19T18:30:00.000Z');
    expect(report.range.launchDay).toBe('2026-11-20');
    expect(db.user.count.mock.calls[0]?.[0].where.createdAt).toEqual({ gte: launchStart });
    expect(
      db.user.findMany.mock.calls.find((c) => !c[0].where.isFounder)?.[0].where.createdAt.gte,
    ).toEqual(launchStart);
    expect(db.downloadClick.findMany.mock.calls[0]?.[0].where.createdAt.gte).toEqual(launchStart);
  });

  it('does not clamp the range when the launch day is older than it', async () => {
    process.env.GROWTH_LAUNCH_DATE = '2026-01-01';
    stage();
    await getGrowthReport(7, NOW);
    expect(db.downloadClick.findMany.mock.calls[0]?.[0].where.createdAt.gte).toEqual(
      new Date('2026-11-16T18:30:00.000Z'),
    );
  });

  it('produces a report that satisfies the shared contract', async () => {
    stage({ cities: [{ city: 'Mumbai', _count: { _all: 12 } }] });
    const report = await getGrowthReport(30, NOW);
    expect(() => GrowthReport.parse(report)).not.toThrow();
    expect(report.cities).toEqual([{ city: 'Mumbai', count: 12 }]);
  });
});

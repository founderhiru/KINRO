// @vitest-environment node
// Founder-only access: the dashboard report, the store-figure form and the page.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const h = vi.hoisted(() => {
  class FakeAuthError extends Error {
    readonly status = 401;
  }
  return {
    FakeAuthError,
    requireAuthenticatedUser: vi.fn(),
    getGrowthReport: vi.fn(),
    upsert: vi.fn(),
  };
});

vi.mock('@/lib/auth', () => ({
  AuthError: h.FakeAuthError,
  requireAuthenticatedUser: h.requireAuthenticatedUser,
}));
vi.mock('@/lib/db', () => ({ prisma: { storeSnapshot: { upsert: h.upsert } } }));
vi.mock('@/lib/growth/metrics', () => ({ getGrowthReport: h.getGrowthReport }));

import { GET } from '@/app/api/admin/growth/route';
import { POST } from '@/app/api/admin/growth/store-snapshots/route';

const FOUNDER = { id: 'u_founder', isFounder: true };
const MEMBER = { id: 'u_member', isFounder: false };

const emptyReport = {
  generatedAt: '2026-11-23T10:00:00.000Z',
  range: { days: 30, startDay: '2026-10-25', endDay: '2026-11-23', launchDay: null },
  excludedAccounts: 1,
  totals: { users: 0, dogs: 0, ownersWithDog: 0 },
  period: {
    registrations: 0,
    dogs: 0,
    interestsSent: 0,
    interestsAccepted: 0,
    interestsDeclined: 0,
    matches: 0,
    messages: 0,
    conversationsWithMessages: 0,
    usersWhoMessaged: 0,
  },
  care: {
    requests: 0,
    requested: 0,
    confirmed: 0,
    declined: 0,
    cancelled: 0,
    confirmRate: null,
    providersPublished: 0,
    providersVerified: 0,
  },
  series: { registrations: [], downloadClicks: [] },
  downloadClicks: { total: 0, ios: 0, android: 0, bySource: [] },
  store: {
    weeksEntered: 0,
    lastEnteredAt: null,
    ios: { pageViews: 0, firstTimeDownloads: 0, redownloads: 0 },
    android: { pageViews: 0, installs: 0 },
    entries: [],
  },
  cities: [],
};

const post = (body: unknown) =>
  POST(
    new Request('http://x/api/admin/growth/store-snapshots', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );
const validBody = {
  weekEnding: '2026-11-15',
  platform: 'ios',
  metric: 'first_time_downloads',
  value: 42,
};

beforeEach(() => {
  h.requireAuthenticatedUser.mockReset();
  h.getGrowthReport.mockReset().mockResolvedValue(emptyReport);
  h.upsert.mockReset().mockResolvedValue({});
});

describe('GET /api/admin/growth', () => {
  it('returns 404 to a visitor who is not signed in, and computes nothing', async () => {
    h.requireAuthenticatedUser.mockRejectedValue(new h.FakeAuthError('Authentication required'));
    const res = await GET(new Request('http://x/api/admin/growth'));
    expect(res.status).toBe(404);
    expect(h.getGrowthReport).not.toHaveBeenCalled();
  });

  it('returns 404 to a signed-in user who is not a founder, and computes nothing', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(MEMBER);
    const res = await GET(new Request('http://x/api/admin/growth'));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
    expect(h.getGrowthReport).not.toHaveBeenCalled();
  });

  it('returns the report to a founder, never cached', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    const res = await GET(new Request('http://x/api/admin/growth?range=7'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(h.getGrowthReport).toHaveBeenCalledWith(7);
  });

  it('falls back to 30 days for an unexpected range', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    await GET(new Request('http://x/api/admin/growth?range=9999'));
    expect(h.getGrowthReport).toHaveBeenCalledWith(30);
  });

  it('reports a server fault as 500 without leaking details', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    h.getGrowthReport.mockImplementation(() => {
      throw new Error('secret db detail');
    });
    const res = await GET(new Request('http://x/api/admin/growth'));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('secret');
  });

  it('contains no personal fields', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    const body = JSON.stringify(await (await GET(new Request('http://x/api/admin/growth'))).json());
    for (const key of ['email', 'phone', 'name', 'userId', 'ownerId', 'body']) {
      expect(body).not.toContain(`"${key}":`);
    }
  });
});

describe('POST /api/admin/growth/store-snapshots', () => {
  it('returns 404 to visitors and non-founders and writes nothing', async () => {
    h.requireAuthenticatedUser.mockRejectedValue(new h.FakeAuthError('Authentication required'));
    expect((await post(validBody)).status).toBe(404);
    h.requireAuthenticatedUser.mockResolvedValue(MEMBER);
    expect((await post(validBody)).status).toBe(404);
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it('saves a figure for a founder, replacing the same week if it exists', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    const res = await post(validBody);
    expect(res.status).toBe(200);
    const week = new Date('2026-11-15T00:00:00.000Z');
    expect(h.upsert).toHaveBeenCalledWith({
      where: {
        weekEnding_platform_metric: {
          weekEnding: week,
          platform: 'ios',
          metric: 'first_time_downloads',
        },
      },
      create: { weekEnding: week, platform: 'ios', metric: 'first_time_downloads', value: 42 },
      update: { value: 42 },
    });
  });

  it('rejects a figure that does not exist for that store', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    const res = await post({ ...validBody, platform: 'android', metric: 'redownloads' });
    expect(res.status).toBe(400);
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it.each([
    ['a negative number', { value: -1 }],
    ['a decimal', { value: 1.5 }],
    ['text', { value: '12' }],
    ['a badly formed date', { weekEnding: '15/11/2026' }],
    ['an impossible date', { weekEnding: '2026-02-31x' }],
    ['an unknown store', { platform: 'windows' }],
  ])('rejects %s', async (_label, patch) => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    const res = await post({ ...validBody, ...patch });
    expect(res.status).toBe(400);
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it('rejects a week that has not ended yet', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    const res = await post({ ...validBody, weekEnding: '2999-01-01' });
    expect(res.status).toBe(400);
    expect((await res.json()).errors.weekEnding).toMatch(/future/);
    expect(h.upsert).not.toHaveBeenCalled();
  });

  it('rejects a body that is not JSON', async () => {
    h.requireAuthenticatedUser.mockResolvedValue(FOUNDER);
    const res = await POST(new Request('http://x', { method: 'POST', body: 'nope' }));
    expect(res.status).toBe(400);
  });
});

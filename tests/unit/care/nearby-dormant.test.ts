// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { envMock, searchNearbyVets, AuthError } = vi.hoisted(() => ({
  envMock: {} as { GOOGLE_PLACES_API_KEY?: string; CARE_NEARBY_ENABLED?: string },
  searchNearbyVets: vi.fn(),
  AuthError: class AuthError extends Error {},
}));
vi.mock('@/lib/env', () => ({ env: envMock }));
vi.mock('@/lib/care/google-places', () => ({ searchNearbyVets }));
vi.mock('@/lib/auth', () => ({
  AuthError,
  requireAuthenticatedUser: vi.fn(async () => ({ id: 'u1' })),
}));

import { GET as getConfig } from '@/app/api/care/config/route';
import { GET as getNearby } from '@/app/api/care/nearby/route';

const req = (area = 'Hyderabad') =>
  new Request(`https://kinro.test/api/care/nearby?area=${encodeURIComponent(area)}`);

describe('Nearby on Google is dormant unless explicitly enabled', () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    envMock.GOOGLE_PLACES_API_KEY = undefined;
    envMock.CARE_NEARBY_ENABLED = undefined;
    searchNearbyVets.mockReset();
    fetchSpy.mockReset();
    vi.stubGlobal('fetch', fetchSpy);
  });

  it('is off with nothing configured', async () => {
    expect(await (await getConfig()).json()).toEqual({ nearby: false });
    const body = await (await getNearby(req())).json();
    expect(body).toEqual({ configured: false, area: 'Hyderabad', items: [] });
    expect(searchNearbyVets).not.toHaveBeenCalled();
  });

  it('stays off when a key is present but the switch is not set', async () => {
    envMock.GOOGLE_PLACES_API_KEY = 'AIza-test';
    expect(await (await getConfig()).json()).toEqual({ nearby: false });
    const res = await getNearby(req());
    expect((await res.json()).configured).toBe(false);
    expect(searchNearbyVets).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('stays off for any switch value other than exactly "true"', async () => {
    envMock.GOOGLE_PLACES_API_KEY = 'AIza-test';
    for (const v of ['1', 'TRUE', 'yes', 'false', '']) {
      envMock.CARE_NEARBY_ENABLED = v;
      await getNearby(req());
    }
    expect(searchNearbyVets).not.toHaveBeenCalled();
  });

  it('stays off when the switch is set but there is no key', async () => {
    envMock.CARE_NEARBY_ENABLED = 'true';
    expect(await (await getConfig()).json()).toEqual({ nearby: false });
    await getNearby(req());
    expect(searchNearbyVets).not.toHaveBeenCalled();
  });

  it('can be reactivated later with both switch and key', async () => {
    envMock.GOOGLE_PLACES_API_KEY = 'AIza-test';
    envMock.CARE_NEARBY_ENABLED = 'true';
    searchNearbyVets.mockResolvedValue([]);
    expect(await (await getConfig()).json()).toEqual({ nearby: true });
    const body = await (await getNearby(req('Madhapur'))).json();
    expect(body.configured).toBe(true);
    expect(searchNearbyVets).toHaveBeenCalledWith('Madhapur', 'AIza-test');
  });
});

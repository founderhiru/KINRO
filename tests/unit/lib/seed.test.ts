// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { upsertMock } = vi.hoisted(() => ({ upsertMock: vi.fn() }));
vi.mock('@/lib/db', () => ({
  prisma: { dogProfile: { upsert: upsertMock } },
}));

import { seed, shouldSeedDemoProfiles } from '@/lib/seed';

describe('demo profile seeding', () => {
  beforeEach(() => {
    upsertMock.mockReset();
    vi.unstubAllEnvs();
  });

  it('is off unless SEED_DEMO_PROFILES is exactly "true"', () => {
    expect(shouldSeedDemoProfiles({})).toBe(false);
    expect(shouldSeedDemoProfiles({ SEED_DEMO_PROFILES: 'false' })).toBe(false);
    expect(shouldSeedDemoProfiles({ SEED_DEMO_PROFILES: '1' })).toBe(false);
    expect(shouldSeedDemoProfiles({ SEED_DEMO_PROFILES: 'true' })).toBe(true);
  });

  it('writes nothing to the database by default', async () => {
    await seed();
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('upserts the demo profiles only when the flag is on', async () => {
    vi.stubEnv('SEED_DEMO_PROFILES', 'true');
    await seed();
    expect(upsertMock).toHaveBeenCalled();
  });
});

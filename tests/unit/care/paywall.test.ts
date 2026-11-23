// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { isPaywallLive } from '@/lib/paywall';

describe('isPaywallLive', () => {
  afterEach(() => {
    delete process.env.PAYWALL_LIVE;
  });
  it('is off unless PAYWALL_LIVE=true', () => {
    expect(isPaywallLive()).toBe(false);
    process.env.PAYWALL_LIVE = 'true';
    expect(isPaywallLive()).toBe(true);
  });
});

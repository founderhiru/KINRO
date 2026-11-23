// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/env', () => ({ env: { SESSION_SECRET: 'x'.repeat(40) } }));
vi.mock('@/lib/email', () => ({ sendAuthEmail: vi.fn() }));
vi.mock('@/lib/site', () => ({ siteUrl: 'https://kinro.test' }));

import { createResponseToken, verifyResponseToken } from '@/lib/care/appointment-response';

describe('response token', () => {
  it('round-trips the appointment id', () => {
    expect(verifyResponseToken(createResponseToken('appt_1'))).toBe('appt_1');
  });
  it('rejects a tampered token', () => {
    const t = createResponseToken('appt_1');
    const [payload, sig] = t.split('.');
    const other = Buffer.from(JSON.stringify({ a: 'appt_2', e: Date.now() + 1e9 })).toString(
      'base64url',
    );
    expect(verifyResponseToken(`${other}.${sig}`)).toBeNull();
    expect(verifyResponseToken(`${payload}.bad`)).toBeNull();
    expect(verifyResponseToken('garbage')).toBeNull();
  });
  it('expires after 14 days', () => {
    const t = createResponseToken('appt_1', Date.now() - 15 * 24 * 3600 * 1000);
    expect(verifyResponseToken(t)).toBeNull();
  });
});

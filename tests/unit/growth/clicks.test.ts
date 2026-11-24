// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@/lib/db', () => ({ prisma: { downloadClick: { create } } }));

import { recordDownloadClick, sanitizeSource } from '@/lib/growth/clicks';

describe('sanitizeSource', () => {
  it('keeps short lowercase tags', () => {
    expect(sanitizeSource('qr')).toBe('qr');
    expect(sanitizeSource(' Poster-01 ')).toBe('poster-01');
    expect(sanitizeSource('a_b-9')).toBe('a_b-9');
  });

  it('turns anything else into "direct"', () => {
    expect(sanitizeSource(null)).toBe('direct');
    expect(sanitizeSource('')).toBe('direct');
    expect(sanitizeSource('a'.repeat(33))).toBe('direct');
    expect(sanitizeSource('hello world')).toBe('direct');
    expect(sanitizeSource('<script>')).toBe('direct');
    expect(sanitizeSource('a@b.com')).toBe('direct');
  });
});

describe('recordDownloadClick', () => {
  beforeEach(() => {
    create.mockReset();
  });

  it('stores only the platform and a sanitised source', async () => {
    create.mockResolvedValue({});
    await recordDownloadClick('ios', 'QR');
    expect(create).toHaveBeenCalledWith({ data: { platform: 'ios', source: 'qr' } });
  });

  it('never throws when the database fails', async () => {
    create.mockImplementation(() => {
      throw new Error('db down');
    });
    await expect(recordDownloadClick('android', null)).resolves.toBeUndefined();
  });
});

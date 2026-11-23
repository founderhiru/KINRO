// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock('@/lib/db', () => ({ prisma: { careProvider: { findMany } } }));

import { GET } from '@/app/api/care/providers/route';

const call = (qs: string) => GET(new Request(`https://kinro.test/api/care/providers${qs}`));

describe('directory search', () => {
  beforeEach(() => {
    findMany.mockReset();
    findMany.mockResolvedValue([]);
  });

  it('matches name, city, locality and address for free text', async () => {
    await call('?q=Madhapur');
    const where = findMany.mock.calls[0]?.[0]?.where;
    expect(where.OR).toEqual([
      { name: { contains: 'Madhapur', mode: 'insensitive' } },
      { city: { contains: 'Madhapur', mode: 'insensitive' } },
      { locality: { contains: 'Madhapur', mode: 'insensitive' } },
      { addressLine: { contains: 'Madhapur', mode: 'insensitive' } },
    ]);
  });

  it('still only lists published, non-suspended, non-rejected providers', async () => {
    await call('?q=Hyderabad&kind=vet');
    const where = findMany.mock.calls[0]?.[0]?.where;
    expect(where.listingStatus).toBe('published');
    expect(where.verificationStatus).toEqual({ notIn: ['suspended', 'rejected'] });
    expect(where.kind).toBe('vet');
  });

  it('keeps the exact city filter working', async () => {
    await call('?city=Pune');
    const where = findMany.mock.calls[0]?.[0]?.where;
    expect(where.city).toEqual({ equals: 'Pune', mode: 'insensitive' });
    expect(where.OR).toBeUndefined();
  });

  it('adds no text filter without a query', async () => {
    await call('');
    expect(findMany.mock.calls[0]?.[0]?.where.OR).toBeUndefined();
  });
});

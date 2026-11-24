// The /admin/growth page: only a founder gets past the server-side gate.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const h = vi.hoisted(() => ({ getFounderOrNull: vi.fn(), notFound: vi.fn() }));
vi.mock('@/lib/growth/founder', () => ({ getFounderOrNull: h.getFounderOrNull }));
vi.mock('next/navigation', () => ({ notFound: h.notFound }));
vi.mock('@/components/custom/growth/growth-dashboard', () => ({
  GrowthDashboard: () => null,
}));

import AdminGrowthPage, { metadata } from '@/app/(custom)/admin/growth/page';

beforeEach(() => {
  h.getFounderOrNull.mockReset();
  h.notFound.mockReset().mockImplementation(() => {
    throw new Error('NEXT_NOT_FOUND');
  });
});

describe('/admin/growth page', () => {
  it('shows the normal 404 to anyone who is not a founder', async () => {
    h.getFounderOrNull.mockResolvedValue(null);
    await expect(AdminGrowthPage()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(h.notFound).toHaveBeenCalled();
  });

  it('renders the dashboard for a founder', async () => {
    h.getFounderOrNull.mockResolvedValue({ id: 'f', isFounder: true });
    const element = await AdminGrowthPage();
    expect(element).toBeTruthy();
    expect(h.notFound).not.toHaveBeenCalled();
  });

  it('asks search engines not to index it', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/app-links', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/app-links')>();
  return { ...actual, appLinks: { ios: 'https://apps.apple.com/in/app/kinro/id1', android: null } };
});
const { recordDownloadClick } = vi.hoisted(() => ({ recordDownloadClick: vi.fn() }));
vi.mock('@/lib/growth/clicks', () => ({ recordDownloadClick }));

import { GET } from '@/app/get/[platform]/route';

const call = (platform: string, query = '') =>
  GET(new Request(`http://localhost:3000/get/${platform}${query}`), {
    params: Promise.resolve({ platform }),
  });
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('GET /get/[platform] click counting', () => {
  beforeEach(() => {
    recordDownloadClick.mockReset().mockResolvedValue(undefined);
  });

  it('counts a visit with its source tag and still redirects the same way', async () => {
    const res = await call('ios', '?src=qr');
    await settle();
    expect(recordDownloadClick).toHaveBeenCalledWith('ios', 'qr');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://apps.apple.com/in/app/kinro/id1');
  });

  it('counts a visit with no tag as a null source', async () => {
    await call('android');
    await settle();
    expect(recordDownloadClick).toHaveBeenCalledWith('android', null);
  });

  it('still redirects when counting fails', async () => {
    recordDownloadClick.mockImplementation(() => {
      throw new Error('boom');
    });
    const res = await call('ios');
    await settle();
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://apps.apple.com/in/app/kinro/id1');
  });

  it('does not count unknown platforms', async () => {
    const res = await call('windows');
    await settle();
    expect(res.status).toBe(404);
    expect(recordDownloadClick).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Keep the real safeStoreUrl; swap appLinks for a mutable copy the tests control.
vi.mock('@/lib/app-links', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/app-links')>();
  return { ...actual, appLinks: { ios: null, android: null } };
});

import { GET } from '@/app/get/[platform]/route';
import { appLinks } from '@/lib/app-links';

const call = (platform: string) =>
  GET(new Request(`http://localhost:3000/get/${platform}`), {
    params: Promise.resolve({ platform }),
  });

describe('GET /get/[platform]', () => {
  beforeEach(() => {
    appLinks.ios = null;
    appLinks.android = null;
  });

  it('sends visitors to the download page while the app is unpublished', async () => {
    for (const platform of ['ios', 'android']) {
      const res = await call(platform);
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe('http://localhost:3000/download');
    }
  });

  it('redirects straight to the store once a real https link is set', async () => {
    appLinks.ios = 'https://apps.apple.com/in/app/kinro/id1234567890';
    appLinks.android = 'https://play.google.com/store/apps/details?id=app.kinro';
    expect((await call('ios')).headers.get('location')).toBe(appLinks.ios);
    expect((await call('android')).headers.get('location')).toBe(appLinks.android);
  });

  it('never redirects to a non-https link', async () => {
    appLinks.ios = 'http://insecure.example.com/app';
    appLinks.android = 'javascript:alert(1)';
    expect((await call('ios')).headers.get('location')).toBe('http://localhost:3000/download');
    expect((await call('android')).headers.get('location')).toBe('http://localhost:3000/download');
  });

  it('is not cached, so a newly added store link takes effect immediately', async () => {
    expect((await call('ios')).headers.get('cache-control')).toBe('no-store');
  });

  it('returns 404 for an unknown platform', async () => {
    expect((await call('windows')).status).toBe(404);
  });
});

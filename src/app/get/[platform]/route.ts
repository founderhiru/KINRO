// Stable "get the app" links, the target of every download QR code:
//   /get/ios      /get/android
// Each redirects to the real store URL from src/lib/app-links.ts once it is set,
// and to the /download page until then. The QR codes never change; only this
// redirect does. A temporary (302) redirect so it can be updated at any time.
//
// Each visit is also counted (platform and a short ?src= tag only; see
// src/lib/growth/clicks.ts) for the Founder Growth Dashboard. Counting is
// fire-and-forget: it cannot delay or break the redirect.

import { NextResponse } from 'next/server';
import { appLinks, safeStoreUrl } from '@/lib/app-links';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

type RouteParams = { params: Promise<{ platform: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { platform } = await params;
  if (platform !== 'ios' && platform !== 'android') {
    return new NextResponse('Not found', { status: 404 });
  }
  // Loaded lazily and never awaited, so a counting problem can never affect the redirect.
  import('@/lib/growth/clicks')
    .then((m) => m.recordDownloadClick(platform, new URL(request.url).searchParams.get('src')))
    .catch(() => {});
  const target = safeStoreUrl(appLinks[platform]) ?? `${siteUrl}/download`;
  const response = NextResponse.redirect(target, 302);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

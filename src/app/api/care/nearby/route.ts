// KINRO Care — "Nearby on Google". Signed-in users only (each call costs
// money), a small per-user rate limit, and nothing is stored.
import 'server-only';

import { NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';
import { searchNearbyVets } from '@/lib/care/google-places';
import { NearbyPlaces } from '@/lib/contracts/care';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function limited(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(userId, recent);
    return true;
  }
  recent.push(now);
  hits.set(userId, recent);
  return false;
}

export async function GET(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const raw = new URL(request.url).searchParams.get('area')?.trim().slice(0, 80);
    const area = raw && /^[\p{L}\p{N} ,.'-]+$/u.test(raw) ? raw : 'Hyderabad';

    const key = env.GOOGLE_PLACES_API_KEY;
    if (!key) {
      return NextResponse.json(NearbyPlaces.parse({ configured: false, area, items: [] }));
    }
    if (limited(user.id)) {
      return NextResponse.json({ error: 'Too many searches. Try again shortly.' }, { status: 429 });
    }
    const items = await searchNearbyVets(area, key);
    return NextResponse.json(NearbyPlaces.parse({ configured: true, area, items }));
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Unable to load nearby vets' }, { status: 502 });
  }
}

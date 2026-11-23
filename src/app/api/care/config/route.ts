// KINRO Care — which optional parts are switched on, so the app shows only
// what works. Costs nothing and exposes no key.
import 'server-only';

import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ nearby: !!env.GOOGLE_PLACES_API_KEY });
}

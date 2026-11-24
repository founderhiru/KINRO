// GET /api/admin/growth?range=7|30|90 — the Founder Growth Dashboard report.
// Founder only (User.isFounder). Aggregates only: never a name, email, phone, dog,
// message or document.
import 'server-only';

import { NextResponse } from 'next/server';
import { GrowthReport } from '@/lib/contracts/growth';
import { getFounderOrNull } from '@/lib/growth/founder';
import { getGrowthReport } from '@/lib/growth/metrics';
import { parseRangeDays } from '@/lib/growth/time';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    if (!(await getFounderOrNull())) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_STORE });
    }
    const days = parseRangeDays(new URL(request.url).searchParams.get('range'));
    const report = await getGrowthReport(days);
    return NextResponse.json(GrowthReport.parse(report), { status: 200, headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { error: 'Unable to load the growth report' },
      { status: 500, headers: NO_STORE },
    );
  }
}

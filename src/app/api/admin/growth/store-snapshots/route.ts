// POST /api/admin/growth/store-snapshots — the founder types in one weekly figure copied
// from App Store Connect or Play Console. Saving the same week, store and figure again
// replaces the earlier value, which is how a typo is corrected. Founder only.
// Nothing here is ever added to KINRO's own counts.
import 'server-only';

import { NextResponse } from 'next/server';
import { StoreSnapshotWrite } from '@/lib/contracts/growth';
import { prisma } from '@/lib/db';
import { getFounderOrNull } from '@/lib/growth/founder';
import { istDayKey } from '@/lib/growth/time';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!(await getFounderOrNull())) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const parsed = StoreSnapshotWrite.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        const message = messages?.[0];
        if (message) errors[field] = message;
      }
      return NextResponse.json(
        { errors: Object.keys(errors).length ? errors : { value: 'Invalid figure' } },
        { status: 400 },
      );
    }
    const { weekEnding, platform, metric, value } = parsed.data;

    // A week that has not ended yet cannot have a store figure; this catches a mistyped year.
    if (weekEnding > istDayKey(new Date())) {
      return NextResponse.json(
        { errors: { weekEnding: 'This date is in the future' } },
        { status: 400 },
      );
    }

    const week = new Date(`${weekEnding}T00:00:00.000Z`);
    await prisma.storeSnapshot.upsert({
      where: { weekEnding_platform_metric: { weekEnding: week, platform, metric } },
      create: { weekEnding: week, platform, metric, value },
      update: { value },
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Unable to save this figure' }, { status: 500 });
  }
}

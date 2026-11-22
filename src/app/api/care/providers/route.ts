// KINRO Care — the directory. Public listing of published providers only;
// suspended and rejected providers are never shown. Never returns full
// registration numbers.
import 'server-only';

import { NextResponse } from 'next/server';
import { toProviderItem } from '@/lib/care/provider-mapper';
import { CareProviderList } from '@/lib/contracts/care';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kind = url.searchParams.get('kind');
    const city = url.searchParams.get('city')?.trim();
    const q = url.searchParams.get('q')?.trim().slice(0, 80);

    const providers = await prisma.careProvider.findMany({
      where: {
        listingStatus: 'published',
        verificationStatus: { notIn: ['suspended', 'rejected'] },
        ...(kind === 'vet' || kind === 'clinic' ? { kind } : {}),
        ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: [{ verificationStatus: 'asc' }, { name: 'asc' }],
      take: 50,
    });

    return NextResponse.json(CareProviderList.parse({ items: providers.map(toProviderItem) }));
  } catch {
    return NextResponse.json({ error: 'Unable to load providers' }, { status: 500 });
  }
}

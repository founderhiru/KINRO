import 'server-only';

import { NextResponse } from 'next/server';
import { toProviderItem } from '@/lib/care/provider-mapper';
import { CareProviderDetail } from '@/lib/contracts/care';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const p = await prisma.careProvider.findUnique({
      where: { id },
      include: {
        parent: true,
        vets: {
          where: {
            listingStatus: 'published',
            verificationStatus: { notIn: ['suspended', 'rejected'] },
          },
        },
      },
    });
    if (
      !p ||
      p.listingStatus !== 'published' ||
      p.verificationStatus === 'suspended' ||
      p.verificationStatus === 'rejected'
    ) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }
    return NextResponse.json(
      CareProviderDetail.parse({
        ...toProviderItem(p),
        addressLine: p.addressLine,
        registrationCouncil: p.registrationCouncil,
        registrationLast4: p.registrationLast4,
        verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
        clinic: p.parent ? { id: p.parent.id, name: p.parent.name } : null,
        vets: p.vets.map(toProviderItem),
        phone: p.contactPhone,
        canRequest: !!p.contactEmail,
      }),
    );
  } catch {
    return NextResponse.json({ error: 'Unable to load provider' }, { status: 500 });
  }
}

// KINRO Care — the owner's Care relationships and appointments (the Messages
// "Care" segment). Scoped to requireAuthenticatedUser().id only. Never reads
// Match / Conversation / Message: dog connections and veterinary care stay
// separate.
import 'server-only';

import { NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';
import { CareConnections } from '@/lib/contracts/care';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const now = new Date();

    const relationships = await prisma.careRelationship.findMany({
      where: { ownerId: user.id, status: 'active' },
      include: {
        provider: true,
        dog: true,
        appointments: { orderBy: { createdAt: 'desc' } },
        shareGrants: {
          where: { revokedAt: null, expiresAt: { gt: now } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const appointments = relationships.flatMap((rel) =>
      rel.appointments.map((a) => ({
        id: a.id,
        relationshipId: rel.id,
        providerId: rel.providerId,
        providerName: rel.provider.name,
        dogId: rel.dogId,
        dogName: rel.dog.name,
        mode: a.mode,
        reason: a.reason,
        preferredDay: a.preferredDay,
        status: a.status,
        scheduledAt: a.scheduledAt ? a.scheduledAt.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
      })),
    );
    appointments.sort((x, y) => y.createdAt.localeCompare(x.createdAt));

    return NextResponse.json(
      CareConnections.parse({
        appointments,
        relationships: relationships.map((rel) => {
          const grant = rel.shareGrants[0];
          return {
            id: rel.id,
            providerId: rel.providerId,
            providerName: rel.provider.name,
            providerKind: rel.provider.kind,
            dogId: rel.dogId,
            dogName: rel.dog.name,
            visitCount: rel.appointments.filter((a) => a.status === 'completed').length,
            activeShare: grant
              ? {
                  id: grant.id,
                  categories: grant.categories,
                  expiresAt: grant.expiresAt.toISOString(),
                }
              : null,
          };
        }),
      }),
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unable to load care connections' }, { status: 500 });
  }
}

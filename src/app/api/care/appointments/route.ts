// KINRO Care — request an appointment. The owner must own the dog; the
// provider must be a published listing. mode=online is accepted only when the
// provider has opted in (offersOnline). No video exists in this release: the
// request is confirmed and run by the provider. No health records are shared
// by creating an appointment — sharing is a separate, explicit owner action.
import 'server-only';

import { NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';
import { AppointmentWrite } from '@/lib/contracts/care';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const parsed = AppointmentWrite.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const [field, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
        const message = messages?.[0];
        if (message) errors[field] = message;
      }
      return NextResponse.json({ errors }, { status: 400 });
    }
    const { providerId, dogId, mode, reason, preferredDay, note } = parsed.data;

    // Owner-only: the dog must belong to the caller. Anything else looks
    // like a missing dog.
    const dog = await prisma.dogProfile.findUnique({ where: { id: dogId } });
    if (!dog || dog.ownerId !== user.id) {
      return NextResponse.json({ error: 'Dog profile not found' }, { status: 404 });
    }

    const provider = await prisma.careProvider.findUnique({ where: { id: providerId } });
    if (!provider || provider.listingStatus !== 'published') {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }
    if (provider.verificationStatus === 'suspended' || provider.verificationStatus === 'rejected') {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }
    if (mode === 'online' && !provider.offersOnline) {
      return NextResponse.json(
        { errors: { mode: 'This provider does not offer online consultation yet' } },
        { status: 400 },
      );
    }

    const relationship = await prisma.careRelationship.upsert({
      where: { ownerId_dogId_providerId: { ownerId: user.id, dogId, providerId } },
      create: { ownerId: user.id, dogId, providerId },
      update: { status: 'active' },
    });

    const appointment = await prisma.careAppointment.create({
      data: {
        relationshipId: relationship.id,
        mode,
        reason,
        preferredDay: preferredDay ?? null,
        note: note || null,
      },
    });

    return NextResponse.json(
      { id: appointment.id, relationshipId: relationship.id, status: appointment.status },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unable to request appointment' }, { status: 500 });
  }
}

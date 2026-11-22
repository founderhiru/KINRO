// KINRO Care — the owner can cancel their own appointment request. Confirming
// or declining is the provider's action and is not part of this release.
import 'server-only';

import { NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';
import { AppointmentCancel } from '@/lib/contracts/care';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (!AppointmentCancel.safeParse(body).success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const appointment = await prisma.careAppointment.findUnique({
      where: { id },
      include: { relationship: true },
    });
    if (!appointment || appointment.relationship.ownerId !== user.id) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    if (appointment.status !== 'requested' && appointment.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'This appointment can no longer be cancelled' },
        { status: 409 },
      );
    }

    const updated = await prisma.careAppointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });
    return NextResponse.json({ id: updated.id, status: updated.status }, { status: 200 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unable to update appointment' }, { status: 500 });
  }
}

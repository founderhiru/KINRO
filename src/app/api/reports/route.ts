// @polsia:user-owned — report a dog profile or the person in a conversation.
// The reporter is always the session user; the reported user is resolved
// server-side from the dog/conversation reference (see src/lib/safety.ts).
// Reports are stored for KINRO to review (status "open") and the support
// inbox is emailed on a best-effort basis.
import 'server-only';

import { NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';
import { REPORT_REASON_LABELS, ReportWrite } from '@/lib/contracts/safety';
import { prisma } from '@/lib/db';
import { sendAuthEmail } from '@/lib/email';
import { resolveTarget, SafetyTargetError } from '@/lib/safety';
import { SUPPORT_EMAIL } from '@/lib/support';

export const dynamic = 'force-dynamic';

const MAX_REPORTS_PER_DAY = 20;

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();

    const parsed = ReportWrite.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid report' }, { status: 400 });
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.report.count({
      where: { reporterId: user.id, createdAt: { gte: since } },
    });
    if (recent >= MAX_REPORTS_PER_DAY) {
      return NextResponse.json(
        { error: 'You have sent a lot of reports today. Please try again tomorrow.' },
        { status: 429 },
      );
    }

    const target = await resolveTarget(parsed.data, user.id);

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetUserId: target.userId,
        targetDogId: target.dogId,
        reason: parsed.data.reason,
        details: parsed.data.details || null,
      },
    });

    // Best-effort: the report is already saved, so an email failure must
    // never fail the request.
    try {
      await sendAuthEmail(
        SUPPORT_EMAIL,
        `KINRO report: ${REPORT_REASON_LABELS[parsed.data.reason]}`,
        [
          `Report ${report.id}`,
          `Reason: ${REPORT_REASON_LABELS[parsed.data.reason]}`,
          `Reported user: ${target.userId}`,
          `Reported dog: ${target.dogId ?? '—'}`,
          `Reporter: ${user.id}`,
          `Details: ${parsed.data.details || '—'}`,
        ].join('\n'),
      );
    } catch {
      // Saved in the database; reviewable there.
    }

    return NextResponse.json({ id: report.id }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof SafetyTargetError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Unable to send report' }, { status: 500 });
  }
}

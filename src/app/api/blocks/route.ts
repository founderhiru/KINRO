// @polsia:user-owned — block a user (named via a dog profile or a
// conversation) and list the people you have blocked. See src/lib/safety.ts.
import 'server-only';

import { NextResponse } from 'next/server';
import { AuthError, requireAuthenticatedUser } from '@/lib/auth';
import { BlockedUserList, BlockWrite } from '@/lib/contracts/safety';
import { prisma } from '@/lib/db';
import { resolveTarget, SafetyTargetError } from '@/lib/safety';

export const dynamic = 'force-dynamic';

function fail(err: unknown, fallback: string) {
  if (err instanceof AuthError || err instanceof SafetyTargetError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const blocks = await prisma.block.findMany({
      where: { blockerId: user.id },
      include: { blocked: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(
      BlockedUserList.parse({
        items: blocks.map(
          (b: { id: string; createdAt: Date; blocked: { name: string | null } }) => ({
            id: b.id,
            userName: b.blocked.name,
            createdAt: b.createdAt.toISOString(),
          }),
        ),
      }),
    );
  } catch (err) {
    return fail(err, 'Unable to load blocked users');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthenticatedUser();
    const parsed = BlockWrite.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const target = await resolveTarget(parsed.data, user.id);
    const block = await prisma.block.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: target.userId } },
      create: { blockerId: user.id, blockedId: target.userId },
      update: {},
    });
    return NextResponse.json({ id: block.id }, { status: 201 });
  } catch (err) {
    return fail(err, 'Unable to block this user');
  }
}

// @polsia:user-owned — the one place that decides who is hidden from whom.
// A block hides BOTH users from each other (discover, interests, matches,
// chat). It is never revealed to the blocked person: every blocked lookup
// behaves exactly like "not found".
import 'server-only';

import { prisma } from '@/lib/db';

export class SafetyTargetError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404,
  ) {
    super(message);
  }
}

/** Ids of every user the given user has blocked or been blocked by. */
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const rows = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const pairs: { blockerId: string; blockedId: string }[] = rows;
  return [...new Set(pairs.map((r) => (r.blockerId === userId ? r.blockedId : r.blockerId)))];
}

export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const count = await prisma.block.count({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
  });
  return count > 0;
}

/** The other participant's user id, or null if the caller isn't in the conversation. */
async function loadOtherParticipant(
  conversationId: string,
  userId: string,
): Promise<string | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { match: true },
  });
  if (!conversation) return null;
  const { senderId, receiverId } = conversation.match;
  if (senderId !== userId && receiverId !== userId) return null;
  return senderId === userId ? receiverId : senderId;
}

export interface ResolvedTarget {
  userId: string;
  dogId: string | null;
}

/** Resolves a dog or conversation reference to the OTHER user, server-side. */
export async function resolveTarget(
  ref: { dogId?: string; conversationId?: string },
  callerId: string,
): Promise<ResolvedTarget> {
  let target: ResolvedTarget;
  if (ref.dogId) {
    const dog = await prisma.dogProfile.findUnique({
      where: { id: ref.dogId },
      select: { id: true, ownerId: true },
    });
    if (!dog?.ownerId) throw new SafetyTargetError('Not found', 404);
    target = { userId: dog.ownerId, dogId: dog.id };
  } else if (ref.conversationId) {
    const other = await loadOtherParticipant(ref.conversationId, callerId);
    if (!other) throw new SafetyTargetError('Not found', 404);
    target = { userId: other, dogId: null };
  } else {
    throw new SafetyTargetError('Not found', 404);
  }
  if (target.userId === callerId) {
    throw new SafetyTargetError("You can't do this to yourself", 400);
  }
  return target;
}

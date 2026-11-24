// Simple per-person caps so one account cannot flood the platform with
// interests or messages. Counted straight from the existing tables (no new
// database table, no migration). Adjust the numbers here; they are the only
// place the limits live.
import 'server-only';

import { prisma } from '@/lib/db';

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

export const MAX_INTERESTS_PER_DAY = 20;
export const MAX_MESSAGES_PER_MINUTE = 30;
export const MAX_MESSAGES_PER_DAY = 300;

export const INTEREST_LIMIT_MESSAGE =
  "You've reached today's limit for sending interests. Please try again tomorrow.";
export const MESSAGE_LIMIT_MESSAGE =
  "You're sending messages very quickly. Please slow down and try again in a moment.";

export async function interestLimitReached(userId: string): Promise<boolean> {
  const sent = await prisma.interest.count({
    where: { senderId: userId, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
  });
  return sent >= MAX_INTERESTS_PER_DAY;
}

export async function messageLimitReached(userId: string): Promise<boolean> {
  const now = Date.now();
  const [lastMinute, lastDay] = await Promise.all([
    prisma.message.count({
      where: { senderId: userId, createdAt: { gte: new Date(now - MINUTE_MS) } },
    }),
    prisma.message.count({
      where: { senderId: userId, createdAt: { gte: new Date(now - DAY_MS) } },
    }),
  ]);
  return lastMinute >= MAX_MESSAGES_PER_MINUTE || lastDay >= MAX_MESSAGES_PER_DAY;
}

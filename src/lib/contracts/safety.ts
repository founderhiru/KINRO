// @polsia:user-owned — client-safe contracts for reporting, blocking and
// account deletion. Keep free of Prisma/server-only imports; the mobile app
// keeps a mirror of this file (mobile/src/lib/safety-contracts.ts).
import { z } from 'zod';

export const REPORT_REASONS = [
  'spam',
  'inappropriate',
  'fake_or_misleading',
  'harassment',
  'unsafe_or_illegal',
  'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam or scam',
  inappropriate: 'Inappropriate content',
  fake_or_misleading: 'Fake or misleading',
  harassment: 'Harassment or abuse',
  unsafe_or_illegal: 'Unsafe or illegal',
  other: 'Something else',
};

// Who is being reported/blocked is always named indirectly — by a dog profile
// or a conversation the caller can already see — and resolved server-side, so
// the client never needs (or learns) another user's id.
const target = {
  dogId: z.string().trim().min(1).optional(),
  conversationId: z.string().trim().min(1).optional(),
};
const exactlyOneTarget = (v: { dogId?: string; conversationId?: string }) =>
  Number(!!v.dogId) + Number(!!v.conversationId) === 1;

export const ReportWrite = z
  .object({
    ...target,
    reason: z.enum(REPORT_REASONS),
    details: z.string().trim().max(500, 'Keep it under 500 characters').optional(),
  })
  .refine(exactlyOneTarget, { message: 'Provide a dog or a conversation to report' });
export type ReportWrite = z.infer<typeof ReportWrite>;

export const BlockWrite = z
  .object(target)
  .refine(exactlyOneTarget, { message: 'Provide a dog or a conversation to block' });
export type BlockWrite = z.infer<typeof BlockWrite>;

export const BlockedUserItem = z.object({
  id: z.string(),
  userName: z.string().nullable(),
  createdAt: z.string(),
});
export type BlockedUserItem = z.infer<typeof BlockedUserItem>;
export const BlockedUserList = z.object({ items: z.array(BlockedUserItem) });
export type BlockedUserList = z.infer<typeof BlockedUserList>;

/** DELETE /api/account — the literal word guards against an accidental call. */
export const AccountDeleteWrite = z.object({ confirm: z.literal('DELETE') });
export type AccountDeleteWrite = z.infer<typeof AccountDeleteWrite>;

// Mobile — client-side mirror of the backend's safety contracts
// (src/lib/contracts/safety.ts). Describes the request/response shapes of
// /api/reports, /api/blocks and /api/account. Another user is only ever named
// indirectly (a dog profile or a conversation you can already see).
import { z } from "zod";

export const REPORT_REASONS = [
  "spam",
  "inappropriate",
  "fake_or_misleading",
  "harassment",
  "unsafe_or_illegal",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam or scam",
  inappropriate: "Inappropriate content",
  fake_or_misleading: "Fake or misleading",
  harassment: "Harassment or abuse",
  unsafe_or_illegal: "Unsafe or illegal",
  other: "Something else",
};

export const REPORT_DETAILS_MAX = 500;

/** Exactly one of dogId / conversationId. */
export type SafetyTarget = { dogId: string } | { conversationId: string };

export const ReportCreated = z.object({ id: z.string() });
export const BlockCreated = z.object({ id: z.string() });

export const BlockedUserItem = z.object({
  id: z.string(),
  userName: z.string().nullable(),
  createdAt: z.string(),
});
export type BlockedUserItem = z.infer<typeof BlockedUserItem>;
export const BlockedUserList = z.object({ items: z.array(BlockedUserItem) });
export type BlockedUserList = z.infer<typeof BlockedUserList>;

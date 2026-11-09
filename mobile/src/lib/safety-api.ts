// Mobile — thin typed wrappers around /api/reports, /api/blocks and
// /api/account. All rules (who can be reported, rate limits, what a block
// hides) are enforced server-side; this only sends requests.
import { apiFetch } from "./api-client";
import {
  BlockCreated,
  BlockedUserList,
  ReportCreated,
  type ReportReason,
  type SafetyTarget,
} from "./safety-contracts";

export async function reportTarget(
  target: SafetyTarget,
  reason: ReportReason,
  details?: string,
): Promise<void> {
  const trimmed = details?.trim();
  await apiFetch("/api/reports", {
    method: "POST",
    body: JSON.stringify({
      ...target,
      reason,
      ...(trimmed ? { details: trimmed } : {}),
    }),
    schema: ReportCreated,
  });
}

export async function blockTarget(target: SafetyTarget): Promise<void> {
  await apiFetch("/api/blocks", {
    method: "POST",
    body: JSON.stringify(target),
    schema: BlockCreated,
  });
}

export async function listBlockedUsers(): Promise<BlockedUserList> {
  return apiFetch("/api/blocks", { schema: BlockedUserList });
}

export async function unblockUser(blockId: string): Promise<void> {
  await apiFetch(`/api/blocks/${encodeURIComponent(blockId)}`, {
    method: "DELETE",
  });
}

/** Permanently deletes the signed-in account and its data. */
export async function deleteMyAccount(): Promise<void> {
  await apiFetch("/api/account", {
    method: "DELETE",
    body: JSON.stringify({ confirm: "DELETE" }),
  });
}

// Pure helpers for the report / block / delete-account UI (kept free of
// React Native imports so they can be unit-tested).
import { ApiError } from "./api-client";

/** The backend's `{ error: string }` message when there is one, else the fallback. */
export function safetyErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const body = err.body as { error?: unknown } | null;
    if (typeof body?.error === "string" && body.error) return body.error;
  }
  return fallback;
}

export const DELETE_ACCOUNT_WARNING =
  "This permanently deletes your profile, your dogs and their photos and health records, and your conversations. It can't be undone.";

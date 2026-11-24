// Founder-only gate shared by the growth routes and page. Anyone who is not a signed-in
// founder gets the same "not found" as a page that does not exist, so the dashboard's
// existence is not revealed.
import 'server-only';

import { AuthError } from '@/lib/auth';
import { requireAdmin } from '@/lib/require-admin';

/** Returns the founder user, or null when the caller is not signed in or not a founder. */
export async function getFounderOrNull() {
  try {
    return await requireAdmin();
  } catch (err) {
    if (err instanceof AuthError) return null;
    throw err;
  }
}

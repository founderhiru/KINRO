// Website-to-store click counting for /get/ios and /get/android.
import 'server-only';

import { prisma } from '@/lib/db';

export const DOWNLOAD_PLATFORMS = ['ios', 'android'] as const;
export type DownloadPlatform = (typeof DOWNLOAD_PLATFORMS)[number];

/**
 * Turns the ?src= value into a short, safe tag. Anything that is not 1 to 32 characters
 * of a-z, 0-9, '_' or '-' (after lower-casing) is stored as 'direct', so a crafted link
 * cannot put free text into the table.
 */
export function sanitizeSource(raw: string | null | undefined): string {
  const value = (raw ?? '').trim().toLowerCase();
  return /^[a-z0-9_-]{1,32}$/.test(value) ? value : 'direct';
}

/** Records one click. Never throws: counting must never get in the way of the redirect. */
export async function recordDownloadClick(
  platform: DownloadPlatform,
  rawSource: string | null | undefined,
): Promise<void> {
  try {
    await prisma.downloadClick.create({
      data: { platform, source: sanitizeSource(rawSource) },
    });
  } catch {
    // Best-effort by design.
  }
}

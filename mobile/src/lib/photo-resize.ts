/** Longest edge, in pixels, for ordinary dog photos. */
export const MAX_PHOTO_EDGE = 1280;
/** JPEG quality used when re-encoding dog photos. */
export const PHOTO_JPEG_QUALITY = 0.7;

/**
 * Returns the resize target for a photo, or null when it is already small
 * enough. Only the longest side is constrained; the other side is scaled by
 * the platform so the aspect ratio is kept. Never upscales.
 */
export function resizeTarget(
  width: number,
  height: number,
  maxEdge: number = MAX_PHOTO_EDGE,
): { width: number } | { height: number } | null {
  if (!(width > 0) || !(height > 0)) return null;
  if (Math.max(width, height) <= maxEdge) return null;
  return width >= height ? { width: maxEdge } : { height: maxEdge };
}

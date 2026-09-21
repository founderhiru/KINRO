// Motion design for the KINRO logo, kept as plain data + pure functions so it can
// be unit-tested without React Native.
//
// The logo (assets/images/kinro-symbol.png, 240x223) is made of six separate
// shapes. assets/images/logo/piece-*.png are those same shapes cut out of the
// existing artwork onto transparent canvases of the SAME size, so stacking them
// reproduces the original logo pixel-for-pixel (max difference 4/255). Nothing
// was redrawn. The animation nudges each piece a few points away from the logo's
// centre and back — a restrained "breathing" separation and re-assembly.

export const LOGO_CANVAS = { width: 240, height: 223 } as const;
export const LOGO_ASPECT = LOGO_CANVAS.width / LOGO_CANVAS.height;

/** Centre of the logo's bounding box, in canvas pixels. */
export const LOGO_CENTER = { x: 121, y: 111 } as const;

export type LogoPieceKey =
  | "top"
  | "left-leaf"
  | "right-leaf"
  | "bottom-leaf"
  | "bottom-left"
  | "bottom-right";

/** Where each piece's centre of mass sits on the canvas (measured from the art). */
export const LOGO_PIECE_CENTROIDS: Readonly<
  Record<LogoPieceKey, { x: number; y: number }>
> = {
  top: { x: 123.1, y: 35.6 },
  "left-leaf": { x: 68.6, y: 98.2 },
  "right-leaf": { x: 159.7, y: 123.0 },
  "bottom-leaf": { x: 115.4, y: 180.5 },
  "bottom-left": { x: 38.5, y: 186.2 },
  "bottom-right": { x: 203.0, y: 186.9 },
};

export const LOGO_PIECE_KEYS = Object.keys(
  LOGO_PIECE_CENTROIDS,
) as LogoPieceKey[];

export const LOGO_MOTION = {
  /** Pieces drift apart… */
  separateMs: 320,
  /** …then settle back together, a little slower so it reads as calm. */
  reconnectMs: 480,
  /** How far each piece travels, as a fraction of the rendered logo width. */
  spread: 0.14,
  /** Whole-logo "breath" at the moment of maximum separation. */
  breathe: 1.03,
} as const;

export const LOGO_TOTAL_MS = LOGO_MOTION.separateMs + LOGO_MOTION.reconnectMs;

/**
 * Translation (in points) for each piece at full separation, for a logo rendered
 * `width` points wide. Every piece moves the same distance, directly away from
 * the logo's centre, so the mark opens up evenly rather than scattering.
 */
export function computePieceOffsets(
  width: number,
): Record<LogoPieceKey, { x: number; y: number }> {
  const scale = width / LOGO_CANVAS.width;
  const distance = width * LOGO_MOTION.spread;
  const result = {} as Record<LogoPieceKey, { x: number; y: number }>;
  for (const key of LOGO_PIECE_KEYS) {
    const c = LOGO_PIECE_CENTROIDS[key];
    const dx = (c.x - LOGO_CENTER.x) * scale;
    const dy = (c.y - LOGO_CENTER.y) * scale;
    const length = Math.hypot(dx, dy) || 1;
    result[key] = { x: (dx / length) * distance, y: (dy / length) * distance };
  }
  return result;
}

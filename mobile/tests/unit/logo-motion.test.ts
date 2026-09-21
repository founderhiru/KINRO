import { describe, expect, it } from "vitest";
import {
  computePieceOffsets,
  LOGO_ASPECT,
  LOGO_CENTER,
  LOGO_MOTION,
  LOGO_PIECE_CENTROIDS,
  LOGO_PIECE_KEYS,
  LOGO_TOTAL_MS,
} from "@/lib/logo-motion";

describe("logo motion", () => {
  it("stays within the requested 700-900 ms window", () => {
    expect(LOGO_TOTAL_MS).toBeGreaterThanOrEqual(700);
    expect(LOGO_TOTAL_MS).toBeLessThanOrEqual(900);
  });

  it("uses the artwork's own proportions", () => {
    expect(LOGO_ASPECT).toBeCloseTo(240 / 223, 5);
  });

  it("has all six pieces", () => {
    expect(LOGO_PIECE_KEYS).toHaveLength(6);
  });

  it("moves every piece the same modest distance, away from the centre", () => {
    const width = 100;
    const offsets = computePieceOffsets(width);
    for (const key of LOGO_PIECE_KEYS) {
      const o = offsets[key];
      expect(Math.hypot(o.x, o.y)).toBeCloseTo(width * LOGO_MOTION.spread, 5);
      const c = LOGO_PIECE_CENTROIDS[key];
      const outward = (c.x - LOGO_CENTER.x) * o.x + (c.y - LOGO_CENTER.y) * o.y;
      expect(outward).toBeGreaterThan(0);
    }
  });

  it("scales with the rendered size and stays subtle", () => {
    const small = computePieceOffsets(40).top;
    const large = computePieceOffsets(80).top;
    expect(Math.hypot(large.x, large.y)).toBeCloseTo(
      2 * Math.hypot(small.x, small.y),
      5,
    );
    expect(LOGO_MOTION.spread).toBeLessThanOrEqual(0.2);
    expect(LOGO_MOTION.breathe).toBeLessThanOrEqual(1.06);
  });
});

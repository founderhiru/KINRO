import { describe, expect, it } from "vitest";
import { MAX_PHOTO_EDGE, resizeTarget } from "@/lib/photo-resize";

describe("resizeTarget", () => {
  it("constrains the width of a large landscape photo", () => {
    expect(resizeTarget(4032, 3024)).toEqual({ width: MAX_PHOTO_EDGE });
  });
  it("constrains the height of a large portrait photo", () => {
    expect(resizeTarget(3024, 4032)).toEqual({ height: MAX_PHOTO_EDGE });
  });
  it("treats a large square as landscape", () => {
    expect(resizeTarget(3000, 3000)).toEqual({ width: MAX_PHOTO_EDGE });
  });
  it("never upscales a small photo", () => {
    expect(resizeTarget(800, 600)).toBeNull();
    expect(resizeTarget(1280, 1280)).toBeNull();
  });
  it("ignores invalid dimensions", () => {
    expect(resizeTarget(0, 100)).toBeNull();
    expect(resizeTarget(Number.NaN, 100)).toBeNull();
  });
});

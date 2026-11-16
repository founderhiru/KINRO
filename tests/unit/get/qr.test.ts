import { describe, expect, it } from 'vitest';
import { qrPath } from '@/lib/qr';

describe('qrPath', () => {
  it('draws a square code with a 4-module quiet zone on each side', () => {
    const { size, d } = qrPath('https://example.com/get/ios');
    // Version 3 (29 modules) + 2 * 4 quiet zone = 37.
    expect(size).toBe(37);
    expect(d.startsWith('M')).toBe(true);
    expect(d.length).toBeGreaterThan(200);
  });

  it('is deterministic and differs for different text', () => {
    const a = qrPath('https://example.com/get/ios');
    expect(qrPath('https://example.com/get/ios')).toEqual(a);
    expect(qrPath('https://example.com/get/android').d).not.toBe(a.d);
  });

  it('keeps every drawn rectangle inside the viewBox', () => {
    const { size, d } = qrPath('https://example.com/get/android');
    for (const m of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
      const [x, y, w] = [Number(m[1]), Number(m[2]), Number(m[3])];
      expect(x).toBeGreaterThanOrEqual(4);
      expect(y).toBeGreaterThanOrEqual(4);
      expect(x + w).toBeLessThanOrEqual(size - 4);
      expect(y + 1).toBeLessThanOrEqual(size - 4);
    }
  });
});

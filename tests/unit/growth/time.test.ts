import { describe, expect, it } from 'vitest';
import {
  addDays,
  bucketByIstDay,
  istDayKey,
  istDayStart,
  parseRangeDays,
  reportRange,
} from '@/lib/growth/time';

describe('IST reporting days', () => {
  it('moves to the next IST day at 18:30 UTC', () => {
    expect(istDayKey(new Date('2026-11-23T18:29:59.999Z'))).toBe('2026-11-23');
    expect(istDayKey(new Date('2026-11-23T18:30:00.000Z'))).toBe('2026-11-24');
  });

  it('handles month and year boundaries', () => {
    expect(istDayKey(new Date('2026-12-31T18:30:00.000Z'))).toBe('2027-01-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2027-03-01', -1)).toBe('2027-02-28');
  });

  it('istDayStart is the UTC instant when the IST day begins', () => {
    expect(istDayStart('2026-11-24').toISOString()).toBe('2026-11-23T18:30:00.000Z');
  });

  it('builds a range ending today with the right number of days', () => {
    const range = reportRange(7, new Date('2026-11-23T10:00:00Z'));
    expect(range.endDay).toBe('2026-11-23');
    expect(range.startDay).toBe('2026-11-17');
    expect(range.dayKeys).toHaveLength(7);
    expect(range.start.toISOString()).toBe('2026-11-16T18:30:00.000Z');
    expect(range.end.toISOString()).toBe('2026-11-23T18:30:00.000Z');
  });

  it('buckets instants into IST days, keeping empty days as zero', () => {
    const range = reportRange(3 as never, new Date('2026-11-23T10:00:00Z'));
    const out = bucketByIstDay(
      [
        new Date('2026-11-22T18:29:00Z'), // 22 Nov IST, late evening
        new Date('2026-11-22T18:31:00Z'), // 23 Nov IST, just after midnight
        new Date('2026-11-23T05:00:00Z'), // 23 Nov IST
        new Date('2026-11-01T05:00:00Z'), // outside the range
      ],
      range.dayKeys,
    );
    expect(out).toEqual([
      { day: '2026-11-21', count: 0 },
      { day: '2026-11-22', count: 1 },
      { day: '2026-11-23', count: 2 },
    ]);
  });

  it('only accepts 7, 30 or 90 days', () => {
    expect(parseRangeDays('7')).toBe(7);
    expect(parseRangeDays('90')).toBe(90);
    expect(parseRangeDays('15')).toBe(30);
    expect(parseRangeDays('abc')).toBe(30);
    expect(parseRangeDays(null)).toBe(30);
  });
});

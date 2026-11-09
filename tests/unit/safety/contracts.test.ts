import { describe, expect, it } from 'vitest';
import { AccountDeleteWrite, BlockWrite, ReportWrite } from '@/lib/contracts/safety';

describe('safety contracts', () => {
  it('a report names exactly one target', () => {
    expect(ReportWrite.safeParse({ dogId: 'd1', reason: 'spam' }).success).toBe(true);
    expect(ReportWrite.safeParse({ conversationId: 'c1', reason: 'harassment' }).success).toBe(
      true,
    );
    expect(ReportWrite.safeParse({ reason: 'spam' }).success).toBe(false);
    expect(
      ReportWrite.safeParse({ dogId: 'd1', conversationId: 'c1', reason: 'spam' }).success,
    ).toBe(false);
  });

  it('rejects an unknown reason and over-long details', () => {
    expect(ReportWrite.safeParse({ dogId: 'd1', reason: 'because' }).success).toBe(false);
    expect(
      ReportWrite.safeParse({ dogId: 'd1', reason: 'other', details: 'x'.repeat(501) }).success,
    ).toBe(false);
  });

  it('a block names exactly one target', () => {
    expect(BlockWrite.safeParse({ dogId: 'd1' }).success).toBe(true);
    expect(BlockWrite.safeParse({}).success).toBe(false);
  });

  it('account deletion needs the literal word DELETE', () => {
    expect(AccountDeleteWrite.safeParse({ confirm: 'DELETE' }).success).toBe(true);
    expect(AccountDeleteWrite.safeParse({ confirm: 'delete' }).success).toBe(false);
    expect(AccountDeleteWrite.safeParse({}).success).toBe(false);
  });
});

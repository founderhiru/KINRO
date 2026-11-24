import { describe, expect, it } from 'vitest';
import { describeAddPhoneError } from '@/lib/phone';

describe('describeAddPhoneError', () => {
  it('explains that the number already belongs to another account', () => {
    expect(describeAddPhoneError('PHONE_NUMBER_EXIST')).toMatch(
      /already used by another KINRO account/,
    );
  });

  it('gives actionable text for a wrong or expired code', () => {
    expect(describeAddPhoneError('INVALID_OTP')).toMatch(/incorrect/);
    expect(describeAddPhoneError('OTP_EXPIRED')).toMatch(/expired/);
  });

  it('falls back to a safe message, never a raw error', () => {
    expect(describeAddPhoneError(undefined)).toBe('Something went wrong. Please try again.');
    expect(describeAddPhoneError('SOMETHING_ELSE')).toBe('Something went wrong. Please try again.');
  });
});

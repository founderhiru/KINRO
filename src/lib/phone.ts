// Web sign-in phone helper. The server (@/lib/auth) accepts exactly
// "+91" + a 10-digit number starting 6-9 (E.164, no spaces). The web form is
// free text, so normalise what people naturally type before sending.

/**
 * "98765 43210", "+91 98765-43210", "919876543210" → "+919876543210".
 * Anything that isn't recognisably an Indian mobile number is returned
 * stripped of formatting and left for the server to reject with a clear error.
 */
export function normalizeIndianPhone(input: string): string {
  const stripped = input.replace(/[\s\-().]/g, '');
  if (/^[6-9]\d{9}$/.test(stripped)) return `+91${stripped}`;
  if (/^91[6-9]\d{9}$/.test(stripped)) return `+${stripped}`;
  return stripped;
}

/**
 * Plain-language message for a failed "add this number to my account" step.
 * PHONE_NUMBER_EXIST means another KINRO account already owns the number, which
 * the server refuses so nobody ends up with two accounts sharing one number.
 */
export function describeAddPhoneError(code: string | undefined): string {
  switch (code) {
    case 'PHONE_NUMBER_EXIST':
      return 'This number is already used by another KINRO account. Sign in with that number to use that account, or contact support to combine them.';
    case 'INVALID_PHONE_NUMBER':
      return 'Enter a valid 10-digit Indian mobile number.';
    case 'INVALID_OTP':
      return 'That code is incorrect. Check it and try again.';
    case 'OTP_EXPIRED':
    case 'OTP_NOT_FOUND':
      return 'That code has expired. Request a new code.';
    case 'TOO_MANY_ATTEMPTS':
      return 'Too many incorrect attempts. Request a new code.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/** The website's switch for mobile-number features (off until SMS is approved). */
export const PHONE_LOGIN_ENABLED = process.env.NEXT_PUBLIC_PHONE_LOGIN === 'true';

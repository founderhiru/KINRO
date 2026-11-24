// Turns better-auth errors into copy a person can act on. Pure (no RN/Expo
// imports) so it is unit-tested directly — see tests/unit/auth-errors.test.ts.
//
// Error codes come from better-auth's phone-number plugin
// (INVALID_OTP, OTP_EXPIRED, OTP_NOT_FOUND, TOO_MANY_ATTEMPTS,
// INVALID_PHONE_NUMBER) and from its magic-link verify redirect
// (?error=INVALID_TOKEN, ...).

export interface AuthErrorLike {
  code?: string;
  message?: string;
  status?: number;
}

export const NETWORK_MESSAGE =
  "Can't reach KINRO. Check your internet connection and try again.";
const RATE_LIMIT_MESSAGE =
  "Too many requests. Please wait a minute and try again.";

/** True for the "request never reached the server" failures fetch throws in React Native. */
export function isNetworkFailure(error: unknown): boolean {
  if (!error) return false;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error);
  return /network request failed|failed to fetch|network error|timed out|timeout/i.test(
    message,
  );
}

function statusOf(error: AuthErrorLike | null | undefined): number | undefined {
  return typeof error?.status === "number" ? error.status : undefined;
}

/** Errors shared by every auth request (rate limit, server down, offline). */
function describeCommonError(
  error: AuthErrorLike | null | undefined,
  serverFallback: string,
): string | null {
  if (isNetworkFailure(error)) return NETWORK_MESSAGE;
  const status = statusOf(error);
  if (status === 429) return RATE_LIMIT_MESSAGE;
  if (status !== undefined && status >= 500) return serverFallback;
  return null;
}

export function describeOtpSendError(
  error: AuthErrorLike | null | undefined,
): string {
  const fallback = "We couldn't send the code right now. Please try again.";
  if (error?.code === "INVALID_PHONE_NUMBER") {
    return "Enter a valid 10-digit Indian mobile number.";
  }
  return describeCommonError(error, fallback) ?? fallback;
}

export function describeOtpVerifyError(
  error: AuthErrorLike | null | undefined,
): string {
  switch (error?.code) {
    case "INVALID_OTP":
      return "That code is incorrect. Check it and try again.";
    case "OTP_EXPIRED":
    case "OTP_NOT_FOUND":
      return "That code has expired. Request a new code.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many incorrect attempts. Request a new code.";
  }
  const fallback = "We couldn't verify the code right now. Please try again.";
  return describeCommonError(error, fallback) ?? fallback;
}

/**
 * Verify errors when a signed-in person is ADDING a number to their existing
 * account (not signing in). The one extra case: the number already belongs to
 * another KINRO account, which the server refuses so nobody ends up with two
 * accounts sharing a number.
 */
export function describeOtpLinkError(
  error: AuthErrorLike | null | undefined,
): string {
  if (error?.code === "PHONE_NUMBER_EXIST") {
    return "This number is already used by another KINRO account. Sign in with that number to use that account, or contact support to combine them.";
  }
  return describeOtpVerifyError(error);
}

export function describeMagicLinkSendError(
  error: AuthErrorLike | null | undefined,
): string {
  const fallback = "We couldn't send the sign-in link. Please try again.";
  return describeCommonError(error, fallback) ?? fallback;
}

/**
 * The `?error=` code the server puts on the deep link when it could not sign
 * the user in from an emailed link (expired, already used, ...).
 */
export function describeMagicLinkCallbackError(
  code: string | null | undefined,
): string {
  switch ((code ?? "").toLowerCase()) {
    case "invalid_token":
    case "token_expired":
    case "expired_token":
      return "This sign-in link has expired or was already used. Request a new one.";
    default:
      return "We couldn't sign you in from that link. Request a new one.";
  }
}

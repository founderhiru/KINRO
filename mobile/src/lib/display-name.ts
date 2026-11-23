// Phone sign-in stores the phone number as the account name until the owner
// sets a real one. Never show that as a name.
const PHONE_LIKE = /^\+?[\d\s().-]{6,}$/;

/** The owner's real name, or null when it is empty or just a phone number. */
export function realName(name: string | null | undefined): string | null {
  const n = name?.trim();
  return n && !PHONE_LIKE.test(n) ? n : null;
}

export function firstNameOf(name: string | null | undefined): string | null {
  return realName(name)?.split(/\s+/)[0] ?? null;
}

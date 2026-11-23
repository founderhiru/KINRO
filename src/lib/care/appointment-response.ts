// KINRO Care — how a vet or clinic answers a visit request without needing an
// account: the request email carries signed, expiring links to a page where
// they confirm or decline. Nothing here reads health records.
import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { sendAuthEmail } from '@/lib/email';
import { env } from '@/lib/env';
import { siteUrl } from '@/lib/site';

const TTL_MS = 14 * 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return createHmac('sha256', env.SESSION_SECRET)
    .update(`care-appt:${payload}`)
    .digest('base64url');
}

export function createResponseToken(appointmentId: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ a: appointmentId, e: now + TTL_MS })).toString(
    'base64url',
  );
  return `${payload}.${sign(payload)}`;
}

/** Returns the appointment id for a valid, unexpired token; otherwise null. */
export function verifyResponseToken(token: string, now = Date.now()): string | null {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { a: id, e } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      a?: string;
      e?: number;
    };
    return typeof id === 'string' && typeof e === 'number' && e > now ? id : null;
  } catch {
    return null;
  }
}

const REASON: Record<string, string> = {
  check_up: 'Check-up',
  vaccination: 'Vaccination',
  skin_ears: 'Skin or ears',
  follow_up: 'Follow-up',
  other: 'Other',
};
const DAY: Record<string, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  this_week: 'This week',
};

export async function sendProviderRequestEmail(params: {
  to: string;
  providerName: string;
  appointmentId: string;
  ownerName: string | null;
  ownerPhone: string;
  dog: { name: string; breed: string; ageYears: number };
  mode: string;
  reason: string;
  preferredDay: string | null;
  note: string | null;
}): Promise<void> {
  const link = `${siteUrl}/api/care/appointments/respond?token=${encodeURIComponent(
    createResponseToken(params.appointmentId),
  )}`;
  const lines = [
    `New visit request for ${params.providerName} on KINRO.`,
    '',
    `Dog: ${params.dog.name}, ${params.dog.breed}, ${params.dog.ageYears} yr`,
    `Owner: ${params.ownerName ?? 'KINRO member'}, ${params.ownerPhone}`,
    `Type: ${params.mode === 'online' ? 'Online consultation' : 'Visit in person'}`,
    `Reason: ${REASON[params.reason] ?? params.reason}`,
    `Preferred time: ${(params.preferredDay && DAY[params.preferredDay]) || 'Not specified'}`,
    ...(params.note ? ['', `Message: ${params.note}`] : []),
    '',
    'Confirm or decline here (the link works for 14 days):',
    link,
    '',
    'After you confirm, please contact the owner on the number above to agree the time.',
    'No health records are shared with this request.',
  ];
  await sendAuthEmail(params.to, `KINRO visit request for ${params.dog.name}`, lines.join('\n'));
}

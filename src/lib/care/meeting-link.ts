// KINRO Care — validates the video-call link a vet supplies when confirming an
// online consultation. KINRO never hosts, sees or records the call; it only
// passes on a link to a well-known third-party service. Anything else is
// rejected so the field cannot be used to send owners to arbitrary sites.

const ALLOWED_HOSTS = [
  'meet.google.com',
  'zoom.us',
  'teams.microsoft.com',
  'teams.live.com',
  'call.whatsapp.com',
  'whereby.com',
  'meet.jit.si',
  'join.skype.com',
];

const MAX_LENGTH = 300;

function hostAllowed(host: string): boolean {
  return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

/** The cleaned https link, or null when it is not an accepted video link. */
export function parseMeetingUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const text = input.trim();
  if (!text || text.length > MAX_LENGTH) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (!hostAllowed(url.hostname.toLowerCase())) return null;
  return url.toString();
}

export const MEETING_LINK_HELP =
  'Use a link from Google Meet, Zoom, WhatsApp, Microsoft Teams, Whereby, Jitsi or Skype.';

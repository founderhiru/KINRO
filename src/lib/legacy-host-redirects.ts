/**
 * Older app builds were baked with the Render address (canidknot-web.onrender.com)
 * as their API URL, while Google sign-in returns to the real site (kinro.in).
 * The sign-in "state" cookie is set by the host that serves the start page, so it
 * must be set on the real site or the return from Google fails
 * (state_security_mismatch). This sends only that one start page to the real site.
 * Relative imports only: next.config.ts cannot resolve "@/".
 */
const LEGACY_HOSTS = ['canidknot-web.onrender.com'];
const PROXY_PATH = '/api/auth/expo-authorization-proxy';

export type LegacyHostRedirect = {
  source: string;
  has: { type: 'host'; value: string }[];
  destination: string;
  permanent: false;
};

export function legacyHostRedirects(appUrl: string | undefined): LegacyHostRedirect[] {
  if (!appUrl) return [];
  let origin: URL;
  try {
    origin = new URL(appUrl);
  } catch {
    return [];
  }
  if (origin.protocol !== 'https:') return [];
  return LEGACY_HOSTS.filter((host) => host !== origin.hostname).map((host) => ({
    source: PROXY_PATH,
    has: [{ type: 'host' as const, value: host }],
    destination: `${origin.origin}${PROXY_PATH}`,
    permanent: false as const,
  }));
}

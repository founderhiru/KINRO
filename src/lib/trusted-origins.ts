// Pure helper (no server-only import so it can be unit-tested).
//
// better-auth rejects state-changing requests (sign-out, sign-in, magic link)
// whose Origin header is not the configured base URL or a trusted origin. The
// same site is often reachable both with and without "www." (kinro.in and
// www.kinro.in); a visitor on the variant that does not match
// NEXT_PUBLIC_APP_URL would otherwise get a silent 403 on Sign out.
//
// Returns the origins that should be trusted for a public base URL: the
// origin itself plus its "www." / non-"www." counterpart. Local development
// hosts, IP addresses and anything that is not http(s) get no counterpart.
export function webOriginVariants(baseUrl: string | undefined): string[] {
  if (!baseUrl) return [];
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return [];
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return [];

  const origin = url.origin;
  const host = url.hostname;
  const isLocalOrIp =
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    /^[\d.]+$/.test(host) ||
    host.includes(':');
  if (isLocalOrIp) return [origin];

  const counterpartHost = host.startsWith('www.') ? host.slice(4) : `www.${host}`;
  // A bare label such as "www.com" has no meaningful counterpart.
  if (!counterpartHost.includes('.')) return [origin];

  const counterpart = `${url.protocol}//${counterpartHost}${url.port ? `:${url.port}` : ''}`;
  return [origin, counterpart];
}

// Cookie domain that lets the sign-in cookies be sent to both "kinro.in" and
// "www.kinro.in". Google sign-in sets a short-lived security cookie on one host
// and checks it when Google sends the person back; if the two hosts differ
// (apex vs www) the check fails with state_security_mismatch. A cookie scoped
// to ".kinro.in" is sent to both.
//
// Returns undefined (cookies stay host-only) for local development, IP
// addresses and shared hosting domains such as onrender.com, where a
// domain-wide cookie is either pointless or rejected by browsers.
const SHARED_HOSTING_SUFFIXES = ['onrender.com', 'vercel.app', 'netlify.app', 'herokuapp.com'];

export function sharedCookieDomain(baseUrl: string | undefined): string | undefined {
  if (!baseUrl) return undefined;
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return undefined;
  }
  if (url.protocol !== 'https:') return undefined;

  const host = url.hostname;
  if (host === 'localhost' || host.endsWith('.localhost') || /^[\d.]+$/.test(host)) {
    return undefined;
  }
  if (host.includes(':')) return undefined;

  const bare = host.startsWith('www.') ? host.slice(4) : host;
  // Need a real registrable-looking name such as "kinro.in", not a bare label.
  if (!bare.includes('.')) return undefined;
  if (SHARED_HOSTING_SUFFIXES.some((s) => bare === s || bare.endsWith(`.${s}`))) {
    return undefined;
  }
  return `.${bare}`;
}

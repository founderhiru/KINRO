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

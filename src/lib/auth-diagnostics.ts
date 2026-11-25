/**
 * Temporary sign-in diagnostics for Render's logs. Names and shapes only —
 * never cookie values, tokens, codes or query strings. Remove once the app's
 * Google sign-in is confirmed working.
 */
export function cookieNames(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(/,(?=\s*[A-Za-z0-9_.-]+=)|;\s*/)
    .map((part) => part.trim())
    .filter((part) => part.includes('=') && !/^(path|domain|expires|max-age|samesite)=/i.test(part))
    .map((part) => part.split('=')[0] ?? '');
}

export function describeRequest(request: Request): string | null {
  const url = new URL(request.url);
  if (
    !/\/api\/auth\/(callback|expo-authorization-proxy|get-session|sign-in\/social)/.test(
      url.pathname,
    )
  ) {
    return null;
  }
  return `[auth-diag] req ${request.method} host=${url.host} path=${url.pathname} cookies=[${cookieNames(request.headers.get('cookie')).join(',')}] expo-origin=${request.headers.get('expo-origin') ?? '-'}`;
}

export function describeResponse(response: Response): string | null {
  const location = response.headers.get('location');
  const setCookie = response.headers.get('set-cookie');
  if (!location && !setCookie) return null;
  let where = '-';
  let hasCookieParam = false;
  if (location) {
    try {
      const u = new URL(location, 'https://placeholder.invalid');
      hasCookieParam = u.searchParams.has('cookie');
      where = `${u.protocol}//${u.host}${u.pathname}${u.searchParams.has('error') ? '?error=' + u.searchParams.get('error') : ''}`;
    } catch {
      where = 'unparseable';
    }
  }
  return `[auth-diag] res status=${response.status} location=${where} cookieParam=${hasCookieParam} set-cookie=[${cookieNames(setCookie).join(',')}]`;
}

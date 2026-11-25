import { describe, expect, it } from 'vitest';
import { cookieNames, describeRequest, describeResponse } from '../../../src/lib/auth-diagnostics';

describe('auth diagnostics never expose values', () => {
  it('lists cookie names only', () => {
    expect(cookieNames('a=1; __Secure-better-auth.session_token=SECRET')).toEqual([
      'a',
      '__Secure-better-auth.session_token',
    ]);
    expect(cookieNames('x=1; Path=/; Expires=Thu, 25 Dec 2026 00:00:00 GMT, y=2; Path=/')).toEqual([
      'x',
      'y',
    ]);
  });

  it('describes a callback request without cookie values', () => {
    const line = describeRequest(
      new Request('https://kinro.in/api/auth/callback/google?code=SECRETCODE&state=S', {
        headers: { cookie: 'better-auth.state=SECRET' },
      }),
    );
    expect(line).toContain('callback/google');
    expect(line).not.toContain('SECRET');
  });

  it('ignores unrelated requests', () => {
    expect(describeRequest(new Request('https://kinro.in/api/dogs'))).toBeNull();
  });

  it('describes a redirect to the app without the cookie value', () => {
    const res = new Response(null, {
      status: 302,
      headers: { location: 'canidknot:///?cookie=SECRETVALUE' },
    });
    const line = describeResponse(res) ?? '';
    expect(line).toContain('cookieParam=true');
    expect(line).not.toContain('SECRETVALUE');
  });
});

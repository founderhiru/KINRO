import { describe, expect, it } from 'vitest';
import { sharedCookieDomain, webOriginVariants } from '@/lib/trusted-origins';

describe('webOriginVariants', () => {
  it('trusts the bare domain and its www counterpart', () => {
    expect(webOriginVariants('https://kinro.in')).toEqual([
      'https://kinro.in',
      'https://www.kinro.in',
    ]);
  });

  it('works the other way round, and ignores a path or trailing slash', () => {
    expect(webOriginVariants('https://www.kinro.in/')).toEqual([
      'https://www.kinro.in',
      'https://kinro.in',
    ]);
  });

  it('gives local development and IP hosts no counterpart', () => {
    expect(webOriginVariants('http://localhost:3000')).toEqual(['http://localhost:3000']);
    expect(webOriginVariants('http://127.0.0.1:3000')).toEqual(['http://127.0.0.1:3000']);
  });

  it('returns nothing for a missing, malformed or non-web value', () => {
    expect(webOriginVariants(undefined)).toEqual([]);
    expect(webOriginVariants('www.kinro.in')).toEqual([]);
    expect(webOriginVariants('canidknot://')).toEqual([]);
  });
});

describe('sharedCookieDomain', () => {
  it('scopes cookies to the bare domain so apex and www both receive them', () => {
    expect(sharedCookieDomain('https://kinro.in')).toBe('.kinro.in');
    expect(sharedCookieDomain('https://www.kinro.in/')).toBe('.kinro.in');
  });

  it('keeps cookies host-only for local dev, IPs and shared hosting domains', () => {
    expect(sharedCookieDomain('http://localhost:3000')).toBeUndefined();
    expect(sharedCookieDomain('https://127.0.0.1')).toBeUndefined();
    expect(sharedCookieDomain('https://kinro-web.onrender.com')).toBeUndefined();
    expect(sharedCookieDomain('http://kinro.in')).toBeUndefined();
  });

  it('returns undefined for a missing or malformed value', () => {
    expect(sharedCookieDomain(undefined)).toBeUndefined();
    expect(sharedCookieDomain('www.kinro.in')).toBeUndefined();
    expect(sharedCookieDomain('https://intranet')).toBeUndefined();
  });
});

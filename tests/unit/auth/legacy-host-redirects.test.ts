import { describe, expect, it } from 'vitest';
import { legacyHostRedirects } from '../../../src/lib/legacy-host-redirects';

describe('legacyHostRedirects', () => {
  it('sends the app sign-in start page from the old Render host to the real site', () => {
    expect(legacyHostRedirects('https://kinro.in')).toEqual([
      {
        source: '/api/auth/expo-authorization-proxy',
        has: [{ type: 'host', value: 'canidknot-web.onrender.com' }],
        destination: 'https://kinro.in/api/auth/expo-authorization-proxy',
        permanent: false,
      },
    ]);
  });

  it('does nothing without an https site address', () => {
    expect(legacyHostRedirects(undefined)).toEqual([]);
    expect(legacyHostRedirects('http://localhost:3000')).toEqual([]);
    expect(legacyHostRedirects('not a url')).toEqual([]);
  });

  it('does not redirect to itself', () => {
    expect(legacyHostRedirects('https://canidknot-web.onrender.com')).toEqual([]);
  });
});

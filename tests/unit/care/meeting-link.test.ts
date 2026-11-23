import { describe, expect, it } from 'vitest';
import { parseMeetingUrl } from '@/lib/care/meeting-link';

describe('parseMeetingUrl', () => {
  it('accepts links from known video services', () => {
    for (const u of [
      'https://meet.google.com/abc-defg-hij',
      'https://us02web.zoom.us/j/123456789?pwd=abc',
      'https://teams.microsoft.com/l/meetup-join/xyz',
      'https://call.whatsapp.com/video/abc123',
      'https://whereby.com/some-room',
      'https://meet.jit.si/KinroRoom',
    ]) {
      expect(parseMeetingUrl(u)).toBe(new URL(u).toString());
    }
  });

  it('trims whitespace', () => {
    expect(parseMeetingUrl('  https://meet.google.com/abc-defg-hij \n')).toBe(
      'https://meet.google.com/abc-defg-hij',
    );
  });

  it('rejects other sites, look-alike hosts and plain http', () => {
    for (const u of [
      'https://example.com/meet',
      'https://meet.google.com.evil.com/abc',
      'https://evilzoom.us/j/1',
      'http://meet.google.com/abc',
      'javascript:alert(1)',
      'ftp://meet.google.com/abc',
      'https://user:pass@meet.google.com/abc',
    ]) {
      expect(parseMeetingUrl(u)).toBeNull();
    }
  });

  it('rejects empty, non-text and over-long input', () => {
    expect(parseMeetingUrl('')).toBeNull();
    expect(parseMeetingUrl('not a url')).toBeNull();
    expect(parseMeetingUrl(undefined)).toBeNull();
    expect(parseMeetingUrl(42)).toBeNull();
    expect(parseMeetingUrl(`https://meet.google.com/${'a'.repeat(400)}`)).toBeNull();
  });
});

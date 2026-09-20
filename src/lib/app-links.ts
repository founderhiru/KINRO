// Where to download the KINRO mobile app.
//
// Every value starts as `null` on purpose: the app is not published yet, and
// we never invent store links. When a store listing goes live, paste its real
// URL here (one line each) — the /download page and the homepage pick it up
// automatically, no other code changes needed.
//
//   ios:     the App Store URL, e.g. 'https://apps.apple.com/...'
//   android: the Google Play URL, e.g. 'https://play.google.com/store/apps/details?id=...'
//   qrImage: path to a QR-code image in /public (for desktop visitors to scan
//            with their phone), e.g. '/kinro/download-qr.png'. Leave null until
//            the store links exist; the QR should point at the /download page.

export const appLinks: {
  ios: string | null;
  android: string | null;
  qrImage: string | null;
} = {
  ios: null,
  android: null,
  qrImage: null,
};

/** Only ever render a store link that is a real https URL. */
export function safeStoreUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

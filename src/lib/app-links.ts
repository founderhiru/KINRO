// Where to download the KINRO mobile app.
//
// Both values start as `null` on purpose: the app is not published yet, and we
// never invent store links. When a store listing goes live, paste its real URL
// here (one line each). Nothing else needs to change:
//   - the /download page and the homepage show a store button,
//   - every QR code on the site already points at /get/ios or /get/android,
//     which now redirect straight to the store.
//
//   ios:     an App Store URL, 'https://apps.apple.com/...', or a public
//            TestFlight link, 'https://testflight.apple.com/join/...'
//   android: a Google Play URL, 'https://play.google.com/store/apps/details?id=...',
//            or a Play testing opt-in link

export const appLinks: {
  ios: string | null;
  android: string | null;
} = {
  ios: null,
  android: null,
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

// @polsia:user-owned — brand identity. Edit freely. `site.ts` re-exports
// siteName/siteDescription; `manifest.ts` + `opengraph-image.tsx` read `brandVisual`.

export const siteName = 'KINRO';
export const siteDescription =
  'The Digital Life Record for Every Dog: health records, a lasting dog profile and trusted connections, in one mobile-first app.';

// PWA + social-share colors. HEX only (the oklch() tokens in globals.css aren't
// readable here) — set to match your brand seed.
export const brandVisual = {
  /** PWA browser-UI / status-bar color. */
  themeColor: '#2F6B4F',
  /** PWA splash + install background. */
  backgroundColor: '#FBF8F3',
  /** Social-share (OG/Twitter) image. */
  og: {
    background: '#262A28',
    foreground: '#FBF8F3',
    /** Second line under the site name; '' hides it. */
    tagline: 'The Digital Life Record for Every Dog',
  },
} as const;

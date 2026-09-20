// @polsia:user-owned — brand identity. Edit freely. `site.ts` re-exports
// siteName/siteDescription; `manifest.ts` + `opengraph-image.tsx` read `brandVisual`.

export const siteName = 'KINRO';
export const siteDescription =
  'A mobile-first platform for responsible dog owners in India: better information, healthier decisions, and trusted connections.';

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
    tagline: 'Better information. Healthier generations. Stronger connections.',
  },
} as const;

/**
 * Timing for the animated first-open welcome (the hero photo screen).
 * All values in milliseconds, measured from when the welcome becomes visible
 * (after the short branded launch splash that plays on top of it).
 */
export const WELCOME_TIMINGS = {
  /** Brand block (logo, name, tagline) fades and rises in. */
  brandDelayMs: 150,
  brandMs: 650,
  /** Headline and the continue arrow follow. */
  footerDelayMs: 900,
  footerMs: 650,
  /** Slow zoom on the photo for the whole time the screen is up. */
  zoomMs: 6000,
  zoomTo: 1.08,
  /** Moves on by itself if the person doesn't tap. */
  autoContinueMs: 3000,
} as const;

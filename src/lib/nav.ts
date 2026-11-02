// @polsia:user-owned — app navigation rendered by SiteNav/SiteFooter and read by
// the sitemap. Edit it as pages are added or removed.
// This list is a convenience, not module registration.

export type NavGroup = 'primary' | 'secondary' | 'footer';

export interface NavItem {
  /** Visible link text. */
  label: string;
  /** App route, e.g. '/' or '/dashboard'. */
  href: string;
  /** Where it renders: top-nav 'primary'/'secondary', or 'footer'. */
  group: NavGroup;
  /** Group `primary` items into a dropdown: items sharing a `menu` value collapse
   *  into one "<menu> ⌄" top-bar slot (e.g. `menu: 'Resources'` on Blog/Docs/
   *  Changelog). Keeps the bar short. Ignored for 'secondary'/'footer'. */
  menu?: string;
  /** When true, render only if a session exists (see site-nav.tsx). */
  requiresAuth?: boolean;
  /** Sort key within a group (ascending); unordered items fall to the end. */
  order?: number;
  /** Footer only: the column heading this link sits under. */
  section?: string;
}

// Keep the bar short: ~3-5 primary slots, group the tail with `menu`, push the
// rest to 'footer' (SiteNav overflows extras into a "More" dropdown). Example:
//   { label: 'Pricing', href: '/pricing', group: 'primary' },
//   { label: 'Blog',    href: '/blog',    group: 'primary', menu: 'Resources' },
//   { label: 'Docs',    href: '/docs',    group: 'primary', menu: 'Resources' },
//   { label: 'Sign in', href: '/login',   group: 'secondary' },
export const navItems: NavItem[] = [
  { label: 'Why KINRO', href: '/#features', group: 'primary', order: 1 },
  { label: 'How it works', href: '/#how-it-works', group: 'primary', order: 2 },
  { label: 'Discover', href: '/discover', group: 'primary', order: 3 },
  { label: 'FAQ', href: '/faq', group: 'primary', order: 4 },
  { label: 'Download', href: '/download', group: 'primary', order: 5 },
  // 'Sign in' is rendered by SiteNav's AccountControl (it is an action, not a
  // nav entry). Only rendered once a session exists (see requiresAuth handling
  // in site-nav.tsx); these sit in 'secondary' next to the sign-in/out control.
  { label: 'Your dogs', href: '/dogs', group: 'secondary', requiresAuth: true, order: 1 },
  { label: 'Your profile', href: '/profile', group: 'secondary', requiresAuth: true, order: 2 },
  // Footer columns, in reading order. `section` is the column heading.
  { label: 'Download the app', href: '/download', group: 'footer', section: 'KINRO', order: 1 },
  { label: 'Browse dogs', href: '/discover', group: 'footer', section: 'KINRO', order: 2 },
  { label: 'Why KINRO', href: '/#features', group: 'footer', section: 'KINRO', order: 3 },
  { label: 'How it works', href: '/#how-it-works', group: 'footer', section: 'KINRO', order: 4 },
  { label: 'Trust and transparency', href: '/#trust', group: 'footer', section: 'Trust', order: 5 },
  { label: 'Security', href: '/security', group: 'footer', section: 'Trust', order: 6 },
  { label: 'FAQ', href: '/faq', group: 'footer', section: 'Help', order: 7 },
  { label: 'Contact Support', href: '/contact', group: 'footer', section: 'Help', order: 8 },
  { label: 'Privacy Policy', href: '/privacy', group: 'footer', section: 'Legal', order: 9 },
  { label: 'Terms of Service', href: '/terms', group: 'footer', section: 'Legal', order: 10 },
];

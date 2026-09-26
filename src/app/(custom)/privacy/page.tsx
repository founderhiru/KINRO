import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '@/lib/support';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How KINRO collects, uses and protects information.',
  alternates: { canonical: '/privacy' },
};

const EFFECTIVE_DATE = 'September 25, 2026';

interface Section {
  heading: string;
  paragraphs: string[];
}

const SECTIONS: Section[] = [
  {
    heading: 'Introduction',
    paragraphs: [
      `KINRO ("KINRO", "we", "us", or "our") respects your privacy. This Privacy Policy explains what information we collect through the KINRO mobile app and website, how we use it, when we may share it, how we protect it, and the choices available to you.`,
    ],
  },
  {
    heading: 'Account information',
    paragraphs: [
      'When you sign in with Google, a mobile OTP, or an email magic link, we receive the information needed to create and secure your account — your name and email (for Google or email sign-in), your phone number (for mobile OTP), and account identifiers we generate ourselves. KINRO does not use passwords, so we never store a password for your account.',
    ],
  },
  {
    heading: 'Dog information',
    paragraphs: [
      "Dog profiles you create may include a dog's name, breed, sex, age, city, a bio, and photos. If you use the Health Passport feature, we also store the health records and documents you choose to upload for your dog.",
    ],
  },
  {
    heading: 'Photos and user content',
    paragraphs: [
      "We store the photos and health documents you upload so they can be shown back to you (and, for dog photos, to other users browsing Discover). You retain your rights to content you upload, and you're responsible for making sure you have the right to share anything you upload.",
    ],
  },
  {
    heading: 'Usage and device information',
    paragraphs: [
      'Like most apps, our servers and infrastructure providers automatically log basic technical information needed to operate and secure the service, such as request and error logs. KINRO does not currently use a separate analytics or tracking service.',
    ],
  },
  {
    heading: 'How we use information',
    paragraphs: [
      "We use your information to operate KINRO — creating and securing your account, showing your dog's profile in Discover, connecting you with other owners, delivering messages, sending sign-in codes and account-related emails, and keeping the platform safe and working correctly.",
    ],
  },
  {
    heading: 'Information displayed to other users',
    paragraphs: [
      "Your dog's name, breed, city, age, sex, bio, and photos are visible to anyone browsing Discover. Discover also shows whether a dog has a health record on file, but never the record's contents — only you can view your dog's health documents.",
      "If another user sends your dog a connection request and you accept (or vice versa), you're matched, and your name becomes visible to that person so you can message each other. Your email address and phone number are never shown to other users.",
    ],
  },
  {
    heading: 'Location information',
    paragraphs: [
      "KINRO does not collect your device's precise GPS location. Discovery and distance filtering are based on the city you enter for your dog's profile, matched against the approximate coordinates of that city — not your device's real-time location.",
    ],
  },
  {
    heading: 'Third-party service providers',
    paragraphs: [
      'We rely on a small number of service providers to run KINRO: Google, for Google sign-in; an email provider, for magic-link sign-in and account emails; an SMS provider, for mobile OTP sign-in; Cloudflare R2, for storing photos and health documents; and our hosting and database providers, for running the app and its database. Each provider only receives the information it needs to perform its function.',
      "We do not sell your personal information, and we don't share it with advertisers.",
    ],
  },
  {
    heading: 'Data security',
    paragraphs: [
      'KINRO uses reasonable technical measures designed to protect your information, including secure transport (HTTPS) for data in transit, HttpOnly and secure session cookies, and server-side session validation on every request. Health documents are stored privately and are only ever retrieved through a short-lived, authenticated link generated at the moment you request it — they are never made public.',
      'See our Security page for more detail.',
    ],
  },
  {
    heading: 'Data retention',
    paragraphs: [
      "We keep your account and dog-profile information for as long as your account is active, so the app keeps working the way you expect. If you'd like your data removed sooner, contact support (see below).",
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      "You can update your owner profile and your dogs' profiles at any time from within the app. For anything you can't change yourself yet — including removing a dog profile or closing your account — contact KINRO support and we'll help.",
    ],
  },
  {
    heading: 'Account deletion',
    paragraphs: [
      'There\'s no self-serve "Delete account" button in the app today. To close your account, contact KINRO support and we\'ll take care of it for you.',
    ],
  },
  {
    heading: "Children's privacy",
    paragraphs: [
      'KINRO is not directed to children, and we do not knowingly collect information from anyone under the age of 18. If you believe a child has provided us with information, please contact us and we will remove it.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      "We may update this Privacy Policy from time to time as KINRO evolves. We'll update the effective date below when we do.",
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [`Questions about this policy? Email us at ${SUPPORT_EMAIL}.`],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main>
      <section className="border-b border-border bg-gradient-to-br from-brand-100/70 via-background to-background">
        <div className="container-page py-16 md:py-20">
          <p className="text-eyebrow mb-4">Legal</p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl">
          {SECTIONS.map((section) => (
            <div key={section.heading} className="mb-10">
              <h2 className="mb-3 font-display text-xl font-semibold">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="mb-3 text-body text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

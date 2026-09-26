import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '@/lib/support';

export const metadata: Metadata = {
  title: 'Security',
  description: 'How KINRO approaches account and data security.',
  alternates: { canonical: '/security' },
};

interface Section {
  heading: string;
  paragraphs: string[];
}

const SECTIONS: Section[] = [
  {
    heading: 'Account security',
    paragraphs: [
      'KINRO has no passwords to steal or leak — you sign in with Google, a one-time code sent to your phone, or a magic link sent to your email. Every sign-in method confirms you control the account (your Google account, your phone number, or your email inbox) before granting access.',
    ],
  },
  {
    heading: 'Data protection',
    paragraphs: [
      "Traffic between the app and our servers is encrypted in transit (HTTPS). Your session is a secure, HttpOnly cookie that's revalidated against our database on every request, so signing out — or us revoking a session — takes effect immediately, rather than a token that keeps working until it expires on its own.",
      "Health documents you upload are stored privately and are never given a public URL. Retrieving one requires you to be signed in as the profile's owner, and access is granted through a link that expires a few minutes after it's generated.",
    ],
  },
  {
    heading: 'Access controls',
    paragraphs: [
      'Every request that reads or changes your data is checked against your signed-in session on our servers — we never trust an identifier sent from the client to decide whose data to show or change. Dog profiles, health records, and messages are only readable and editable by their owner or, for messages, the two matched participants.',
    ],
  },
  {
    heading: 'Monitoring & logging',
    paragraphs: [
      'Our hosting and database providers maintain standard operational logs used to keep the service running and to investigate problems. KINRO does not currently run a dedicated 24/7 security operations center.',
    ],
  },
  {
    heading: 'Secure development',
    paragraphs: [
      "KINRO is built with strict typing throughout, and every data-changing request is validated against a shared schema before it's accepted. Application dependencies are kept up to date as part of ongoing development.",
    ],
  },
  {
    heading: 'Incident response',
    paragraphs: [
      'If we become aware of a security incident affecting your information, we will investigate, take reasonable steps to contain and remediate it, and notify affected users as appropriate and as required by law.',
    ],
  },
  {
    heading: 'Keeping your account secure',
    paragraphs: [
      'A few things help keep your account safe: never share a sign-in code with anyone (KINRO will never ask you for one), keep your device and the KINRO app up to date, and be cautious of messages asking you to click a link or share information outside the app.',
    ],
  },
  {
    heading: 'Report a security issue',
    paragraphs: [
      `If you believe you've found a security issue with KINRO, please email us at ${SUPPORT_EMAIL} with the subject line "Security" and as much detail as you can share. We'll follow up as quickly as we can.`,
    ],
  },
];

export default function SecurityPage() {
  return (
    <main>
      <section className="border-b border-border bg-gradient-to-br from-brand-100/70 via-background to-background">
        <div className="container-page py-16 md:py-20">
          <p className="text-eyebrow mb-4">Legal</p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            Security
          </h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">Your trust matters.</p>
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

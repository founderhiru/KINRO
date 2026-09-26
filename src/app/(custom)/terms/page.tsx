import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '@/lib/support';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern use of KINRO.',
  alternates: { canonical: '/terms' },
};

const EFFECTIVE_DATE = 'September 25, 2026';

interface Section {
  heading: string;
  paragraphs: string[];
}

const SECTIONS: Section[] = [
  {
    heading: 'Acceptance of terms',
    paragraphs: [
      "By creating a KINRO account or using the KINRO app or website, you agree to these Terms of Service. If you don't agree, please don't use KINRO.",
    ],
  },
  {
    heading: 'Eligibility',
    paragraphs: [
      'KINRO is intended for adults. You must be at least 18 years old to create an account.',
    ],
  },
  {
    heading: 'Your account',
    paragraphs: [
      "You're responsible for the information in your profile and your dogs' profiles, and for keeping your sign-in method (your Google account, phone number, or email) secure. Let us know right away if you think someone else has accessed your account.",
    ],
  },
  {
    heading: 'Your content',
    paragraphs: [
      "You keep ownership of the photos, bios, health documents, and other content you upload. By uploading content, you give KINRO permission to display and store it as needed to operate the app — for example, showing your dog's photos in Discover. You're responsible for having the right to share anything you upload.",
    ],
  },
  {
    heading: 'Acceptable use',
    paragraphs: [
      "Use KINRO respectfully and honestly. Don't post false or misleading information about yourself or your dog, impersonate anyone, harass other users, or use KINRO for any unlawful purpose.",
    ],
  },
  {
    heading: 'Connections are not guarantees',
    paragraphs: [
      "KINRO helps you discover and connect with other dog owners. A connection request, a match, or a conversation is not a verification of the other party's identity or trustworthiness, and is never a recommendation, guarantee, or endorsement — including for any breeding, sale, or purchase decision. You're responsible for exercising your own judgment and for verifying anything important independently.",
    ],
  },
  {
    heading: 'Not veterinary advice',
    paragraphs: [
      "KINRO is not a veterinary service. Nothing in the app is medical or veterinary advice. Always consult a qualified veterinarian about your dog's health.",
    ],
  },
  {
    heading: 'Connection Service',
    paragraphs: [
      'Some extended messaging currently requires the Connection Service. Purchasing the Connection Service is not available yet in this version of the app, so no payment can currently be taken from you. If and when in-app purchases become available, updated terms covering pricing, billing, and refunds will apply.',
    ],
  },
  {
    heading: 'Termination',
    paragraphs: [
      'You may stop using KINRO at any time; contact support to close your account. We may suspend or terminate accounts that violate these terms or that we believe pose a risk to other users or to KINRO.',
    ],
  },
  {
    heading: 'Disclaimers',
    paragraphs: [
      'KINRO is provided "as is." We don\'t guarantee that the app will always be available, error-free, or that it will meet your expectations.',
    ],
  },
  {
    heading: 'Limitation of liability',
    paragraphs: [
      'To the fullest extent permitted by law, KINRO is not liable for any indirect, incidental, or consequential damages arising from your use of the app, including from your interactions or connections with other users.',
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: [
      "We may update these Terms of Service as KINRO evolves. We'll update the effective date below when we do.",
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [`Questions about these terms? Email us at ${SUPPORT_EMAIL}.`],
  },
];

export default function TermsOfServicePage() {
  return (
    <main>
      <section className="border-b border-border bg-gradient-to-br from-brand-100/70 via-background to-background">
        <div className="container-page py-16 md:py-20">
          <p className="text-eyebrow mb-4">Legal</p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            Terms of Service
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

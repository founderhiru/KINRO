import type { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SUPPORT_EMAIL } from '@/lib/support';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about KINRO.',
  alternates: { canonical: '/faq' },
};

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const SECTIONS: FaqSection[] = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What is KINRO?',
        a: 'KINRO is a verified, health-first platform for dog owners — a place to build a profile for your dog, keep track of health information, discover other dogs and owners nearby, and make trusted connections.',
      },
      {
        q: 'Is KINRO free?',
        a: "Yes. Creating an owner and dog profile, browsing Discover, and sending and receiving connection requests are all free. Once you're matched with someone, the first few messages in that conversation are free too. Continuing a conversation beyond that currently requires the Connection Service — purchasing it isn't available yet in this version of the app, so nothing can be charged to you today.",
      },
      {
        q: 'Can I connect with other dogs or owners for free?',
        a: "Yes. Sending a connection request and getting matched is part of KINRO's free, core experience.",
      },
      {
        q: 'How does connecting work?',
        a: "When you find a dog or owner you're interested in, you can send a connection request from their profile. If they accept, you're matched and a conversation opens up. A match is not an agreement to breed, sell, buy, or complete any other transaction — it's simply an introduction.",
      },
    ],
  },
  {
    title: 'Dogs & profiles',
    items: [
      {
        q: 'What information can I add about my dog?',
        a: "You can add your dog's name, breed, sex, age, city, a bio, photos, and health records (with supporting documents). KINRO may add more fields, such as pedigree or genetic information, as the platform evolves.",
      },
      {
        q: 'Can I add more than one dog?',
        a: "Your account can include the dog profiles supported by the current KINRO experience. There's no fixed number built into the app today — KINRO may adjust this as the platform grows.",
      },
      {
        q: "Is my dog's information public?",
        a: "A dog's name, breed, city, age, sex, bio, and photos are visible to anyone browsing Discover — that's how other owners find and connect with your dog. Health record documents are private: Discover only shows whether a dog has a health record on file, never the record itself or its contents. That's visible only to you, the profile owner.",
      },
      {
        q: 'Can I delete my dog profile?',
        a: "There's no self-serve delete button for a dog profile in the app today. If you'd like a dog profile removed, contact KINRO support and we'll take care of it.",
      },
    ],
  },
  {
    title: 'Connections & safety',
    items: [
      {
        q: "Does KINRO guarantee another user's identity or trustworthiness?",
        a: "No. KINRO does not currently verify user or dog identities, and a connection or match is not an endorsement of the other party. Use your own judgment, meet safely, and verify important details independently — especially anything related to your dog's health or a breeding decision.",
      },
      {
        q: 'Can I report another user?',
        a: "There's no in-app report button today. If you run into a problem with another user, please contact KINRO support directly and we'll look into it.",
      },
      {
        q: 'Can I block someone?',
        a: "There's no in-app block feature yet. If someone is bothering you, contact KINRO support and we'll help.",
      },
      {
        q: 'What happens when I send a connection request?',
        a: "The dog's owner is notified and can accept or decline. If they accept, you're matched and can start messaging. If they decline or don't respond, no further information is shared.",
      },
    ],
  },
  {
    title: 'Privacy',
    items: [
      {
        q: 'Does KINRO sell my personal information?',
        a: 'No. KINRO does not sell your personal information.',
      },
      {
        q: 'Does KINRO share my information?',
        a: "KINRO shares information only with the service providers that help run the app — for things like authentication, email, storage, and hosting — and where necessary to comply with the law, protect users, or keep the platform secure. Your dog's public profile fields are visible to other users browsing Discover; your own contact details (email/phone) are never shown to other users.",
      },
      {
        q: 'What happens to my photos and documents?',
        a: "You keep the rights to what you upload. Dog photos are used to show your dog's profile in Discover. Health documents are kept private and are only ever accessible to you — they're never made public or shown to other users.",
      },
      {
        q: 'Can I delete my account?',
        a: 'There\'s no self-serve "Delete account" option in the app today. Contact KINRO support and we\'ll help you close your account.',
      },
    ],
  },
  {
    title: 'Health & breeding',
    items: [
      {
        q: 'Is KINRO a veterinary service?',
        a: "No. KINRO is not a veterinary service, and nothing in the app is veterinary diagnosis or medical advice. Always consult a qualified veterinarian about your dog's health.",
      },
      {
        q: 'Can I use KINRO for breeding?',
        a: 'KINRO can help you discover and connect with other dog owners, including for breeding-related conversations, but a connection or match is never a recommendation or guarantee that two dogs should be bred.',
      },
      {
        q: 'Does KINRO recommend that two dogs should be bred?',
        a: "No. KINRO doesn't evaluate or recommend breeding matches. Owners should independently consider health, pedigree, temperament, and welfare, and consult qualified professionals where appropriate.",
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        q: 'How can I contact KINRO?',
        a: `Use the Contact Support page, or email us directly at ${SUPPORT_EMAIL}.`,
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main>
      <section className="border-b border-border bg-gradient-to-br from-brand-100/70 via-background to-background">
        <div className="container-page py-16 md:py-20">
          <p className="text-eyebrow mb-4">Help & Trust</p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            Frequently asked questions
          </h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
            Answers to common questions about using KINRO.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-10">
              <h2 className="mb-2 font-display text-xl font-semibold">{section.title}</h2>
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, index) => (
                  <AccordionItem key={item.q} value={`${section.title}-${index}`}>
                    <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

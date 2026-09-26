import { Mail, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SUPPORT_EMAIL } from '@/lib/support';

export const metadata: Metadata = {
  title: 'Contact Support',
  description: 'Get help or contact the KINRO team.',
  alternates: { canonical: '/contact' },
};

const OPTIONS = [
  {
    key: 'support',
    icon: Mail,
    label: 'Contact KINRO',
    description: 'Get help with your account, dogs, or Health Passport.',
    subject: 'KINRO Support Request',
  },
  {
    key: 'feedback',
    icon: MessageCircle,
    label: 'Send Feedback',
    description: 'Share an idea or tell us about a problem.',
    subject: 'KINRO Feedback',
  },
] as const;

export default function ContactSupportPage() {
  return (
    <main>
      <section className="border-b border-border bg-gradient-to-br from-brand-100/70 via-background to-background">
        <div className="container-page py-16 md:py-20">
          <p className="text-eyebrow mb-4">Help & Trust</p>
          <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
            Contact Support
          </h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">We're here to help.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid max-w-3xl gap-6 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <Card key={option.key} className="border-border">
              <CardContent className="flex flex-col gap-4 p-6">
                <option.icon className="size-6 text-brand-600" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-lg font-semibold">{option.label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Button asChild variant="secondary" className="mt-auto w-fit">
                  <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(option.subject)}`}>
                    Email us
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
          <p className="text-sm text-muted-foreground md:col-span-2">
            You can also reach us directly at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-4">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

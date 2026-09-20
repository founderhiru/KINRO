// KINRO homepage. KINRO is mobile-first: this page introduces the brand, builds
// trust, supports SEO and public discovery, and sends people to the app.
//
// Copy rule: only describe what the product does today. Anything planned lives
// in the clearly labelled "Coming next" section and is never presented as live.

import {
  ArrowRight,
  Check,
  ClipboardList,
  Download,
  Flag,
  HeartPulse,
  MapPin,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Keep this a Server Component so it can export metadata.
export const metadata: Metadata = {
  title: { absolute: 'KINRO — Better information. Healthier generations.' },
  description:
    'KINRO is a mobile-first platform for responsible dog owners in India: keep your dog’s health information together, discover dogs nearby, and make trusted connections.',
  // Do not export an explicit openGraph object here; that suppresses the
  // file-based opengraph-image.tsx for the home route.
  alternates: { canonical: '/' },
};

const signals = [
  { icon: HeartPulse, label: 'Dog health information' },
  { icon: PawPrint, label: 'Responsible ownership' },
  { icon: Users, label: 'Trusted connections' },
];

const pillars = [
  {
    number: '01',
    title: 'Dog health information',
    description:
      'Keep vaccinations, vet visits and supporting documents for each dog in one place. Detailed records and documents stay private to your account.',
    icon: HeartPulse,
  },
  {
    number: '02',
    title: 'Responsible ownership',
    description:
      'Give every dog a clear profile with photos, breed, age and location, so the people you meet know who they are talking about.',
    icon: PawPrint,
  },
  {
    number: '03',
    title: 'Trusted connections',
    description:
      'Find dogs and owners nearby by breed and distance. Conversations open only when both sides have shown interest.',
    icon: Users,
  },
  {
    number: '04',
    title: 'Responsible breeding, in context',
    description:
      'For owners who choose to breed, better information supports better decisions for the dogs, the families and the puppies involved.',
    icon: ShieldCheck,
  },
];

const workflow = [
  [
    '01',
    'Create your profile',
    'Sign in with Google, your mobile number or an email link, then add yourself and your dog.',
  ],
  [
    '02',
    'Keep health information together',
    'Log vaccinations and vet visits and attach documents. Only you can see the details.',
  ],
  [
    '03',
    'Discover and connect',
    'Browse dogs nearby, show interest, and start a conversation when the interest is mutual.',
  ],
];

const honestyPoints = [
  'Records are added by owners. KINRO does not verify them, and veterinarians have not reviewed them.',
  'Detailed health records and documents are private to your account.',
  'Conversations begin only when both people have shown interest.',
  'KINRO is not a veterinary service and does not give medical advice or diagnoses.',
];

const comingNext = [
  {
    icon: ClipboardList,
    status: 'Planned',
    title: 'Verification',
    description:
      'A clear process for checking owner identity and health documents, with a visible status so you can see what has and has not been reviewed.',
  },
  {
    icon: Flag,
    status: 'Planned',
    title: 'Moderation and reporting',
    description:
      'Tools to report concerning profiles or behaviour, and a review process to act on those reports.',
  },
  {
    icon: Stethoscope,
    status: 'Exploring',
    title: 'Veterinary collaboration',
    description:
      'We would like to work with veterinary professionals to make health information more reliable. Nothing is in place today.',
  },
];

export default function KinroHome() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative isolate border-b border-border bg-gradient-to-br from-brand-100/70 via-background to-background">
        <div className="container-page relative grid min-h-[calc(100svh-3.5rem)] items-center gap-14 py-16 md:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] md:gap-10 md:py-24 lg:py-28">
          <div className="relative z-10 max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Badge
              variant="outline"
              className="mb-7 gap-2 rounded-full border-brand-300 bg-background/70 px-3 py-1 text-brand-700"
            >
              <span className="size-1.5 rounded-full bg-brand-600" aria-hidden="true" />
              Mobile-first · Built for responsible dog owners
            </Badge>
            <h1 className="font-display text-[clamp(2.6rem,6.2vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-foreground">
              Better information.
              <span className="block text-brand-700">Healthier generations.</span>
              <span className="block">Stronger connections.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
              Built for responsible dog owners and breeders in India, with a focus on better
              information, healthier decisions, and trusted connections.
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild size="lg" className="h-12 rounded-full px-6 shadow-brand">
                <Link href="/download">
                  <Download className="size-4" aria-hidden="true" />
                  Download KINRO App
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6">
                <Link href="/discover">
                  Browse dogs <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/80 pt-5 text-sm text-muted-foreground">
              {signals.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-brand-600" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Illustrative example only — not a real or verified profile. */}
          <div className="relative mx-auto w-full max-w-[28rem] animate-in fade-in zoom-in-95 duration-1000 md:translate-y-6">
            <div
              className="absolute -right-8 -top-8 size-28 rounded-full border border-brand-300/70 bg-brand-100/40 blur-sm"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-10 -left-6 size-40 rounded-full border border-brand-200/80"
              aria-hidden="true"
            />
            <Card className="relative overflow-hidden border-brand-200/80 bg-card/90 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div>
                  <p className="text-caption font-semibold uppercase tracking-[0.14em] text-brand-600">
                    A dog profile on KINRO
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Illustrative example</p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-full bg-card shadow-brand">
                  {/* biome-ignore lint/performance/noImgElement: static public/ asset, not an optimizable remote image */}
                  <img
                    src="/kinro/symbol.png"
                    alt=""
                    aria-hidden="true"
                    className="size-7 object-contain"
                  />
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-muted text-primary">
                    <span className="font-display text-4xl font-semibold">B</span>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold">Bodhi</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Labrador Retriever · 3 years
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700">
                      <MapPin className="size-3.5" aria-hidden="true" /> Pune · 8 km away
                    </p>
                  </div>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-2 text-sm">
                  {[
                    'Health records on file',
                    'Photos and profile details',
                    'Found by breed and distance',
                    'Connect when both are interested',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2 rounded-lg bg-muted/70 px-3 py-3 text-muted-foreground"
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-brand-600"
                        aria-hidden="true"
                      />
                      <span className="leading-5">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                  Example for illustration. Not a real profile.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why KINRO */}
      <section id="features" className="section-lg scroll-mt-14">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div className="max-w-md">
              <p className="text-eyebrow">Why KINRO</p>
              <h2 className="mt-4 font-display text-h2 text-foreground">
                Clearer information for
                <span className="text-brand-700"> every dog and every owner.</span>
              </h2>
              <p className="mt-6 text-body-lg text-muted-foreground">
                KINRO starts with the dog: their health information, their people, and the community
                around them. Breeding is one part of that picture, not the whole of it.
              </p>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {pillars.map(({ number, title, description, icon: Icon }) => (
                <article
                  key={number}
                  className="group grid gap-5 py-8 transition-colors duration-200 hover:bg-muted/40 sm:grid-cols-[4rem_3rem_1fr] sm:items-start sm:gap-3 sm:px-5"
                >
                  <p className="font-mono text-sm text-brand-600">{number}</p>
                  <Icon
                    className="size-6 text-brand-600 transition-transform duration-200 ease-out group-hover:scale-110"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-h4 text-foreground">{title}</h3>
                    <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-14 border-y border-border bg-muted/40">
        <div className="container-page grid gap-12 py-20 md:grid-cols-[0.8fr_1.2fr] md:items-end md:py-28">
          <div>
            <p className="text-eyebrow">How it works</p>
            <h2 className="mt-4 max-w-lg font-display text-h2 text-foreground">
              Simple by design. Made for your phone.
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              The app is the main KINRO experience. You can also browse public dog profiles on this
              website at any time.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3 md:gap-5">
            {workflow.map(([number, title, description]) => (
              <li
                key={number}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-transform duration-200 ease-out hover:-translate-y-1"
              >
                <span className="font-mono text-xs font-semibold text-brand-600">{number}</span>
                <h3 className="mt-8 font-display text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust and transparency */}
      <section id="trust" className="section scroll-mt-14">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[calc(var(--radius)*1.6)] bg-primary p-8 text-primary-foreground shadow-xl md:p-12 lg:p-16">
            <div
              className="absolute -right-10 -top-20 size-64 rounded-full border border-primary-foreground/15"
              aria-hidden="true"
            />
            <div
              className="absolute -right-2 -top-12 size-40 rounded-full border border-primary-foreground/15"
              aria-hidden="true"
            />
            <div className="relative grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
              <div className="max-w-xl">
                <Badge
                  variant="outline"
                  className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                >
                  Trust and transparency
                </Badge>
                <h2 className="mt-5 font-display text-h2">
                  Clear about what KINRO is, and what it is not.
                </h2>
                <p className="mt-5 text-lg leading-8 text-primary-foreground/75">
                  Trust starts with honesty. Here is exactly what to expect today.
                </p>
              </div>
              <ul className="grid gap-4 border-t border-primary-foreground/20 pt-6 text-sm md:border-l md:border-t-0 md:pl-8 md:pt-0">
                {honestyPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-6">
                    <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Coming next — plans only, never presented as live */}
      <section id="coming-next" className="section-lg scroll-mt-14 border-t border-border">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-eyebrow">Coming next</p>
            <h2 className="mt-4 font-display text-h2 text-foreground">Where we are heading.</h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              These are plans, not current features. We will announce each one when it is ready.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {comingNext.map(({ icon: Icon, status, title, description }) => (
              <Card key={title} className="border-dashed border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Icon className="size-6 text-brand-600" strokeWidth={1.6} aria-hidden="true" />
                    <Badge variant="outline" className="rounded-full text-[0.7rem]">
                      {status}
                    </Badge>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Timing may change. Until a feature is announced as available, please do not assume it
            exists.
          </p>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="border-t border-border bg-gradient-to-t from-brand-100/60 to-background">
        <div className="container-page flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-24">
          <div className="max-w-2xl">
            {/* biome-ignore lint/performance/noImgElement: static public/ asset, not an optimizable remote image */}
            <img src="/kinro/symbol.png" alt="" aria-hidden="true" className="mb-6 h-12 w-auto" />
            <h2 className="font-display text-h2">
              Take KINRO
              <br />
              <span className="text-brand-700">with you.</span>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Get the app to keep your dog’s health information together and connect with trusted
              owners nearby.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6 shadow-brand">
              <Link href="/download">
                <Download className="size-4" aria-hidden="true" />
                Download KINRO App
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6">
              <Link href="/discover">
                Browse dogs <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

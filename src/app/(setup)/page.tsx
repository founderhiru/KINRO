// KINRO homepage. KINRO is mobile-first: this page introduces the brand, builds
// trust, supports SEO and public discovery, and sends people to the app.
//
// Copy rule: only describe what the product does today. Keep lines short, and
// never present anything planned as live.

import {
  ArrowRight,
  Check,
  Download,
  HeartPulse,
  PawPrint,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { DiscoverScreen, HealthScreen, HomeScreen } from '@/components/custom/app-mockups';
import { QrSlot } from '@/components/custom/qr-slot';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Keep this a Server Component so it can export metadata.
export const metadata: Metadata = {
  title: { absolute: 'KINRO — Genetic Wellness. Brighter Lives.' },
  description:
    'KINRO is a mobile-first app for responsible dog owners. Keep health records together, discover dogs nearby, connect with trust.',
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
      'Vaccinations, vet visits and documents in one place. Details stay private to you.',
    icon: HeartPulse,
  },
  {
    number: '02',
    title: 'Responsible ownership',
    description: 'A clear profile for every dog: photos, breed, age and location.',
    icon: PawPrint,
  },
  {
    number: '03',
    title: 'Trusted connections',
    description: 'Find dogs and owners nearby. Chat opens when both sides are interested.',
    icon: Users,
  },
  {
    number: '04',
    title: 'Responsible breeding',
    description: 'Better information for better decisions, for dogs, families and puppies.',
    icon: ShieldCheck,
  },
];

const workflow = [
  ['01', 'Create your profile', 'Sign in, then add yourself and your dog.'],
  [
    '02',
    'Keep health together',
    'Log vaccinations and vet visits. Attach documents. Only you see them.',
  ],
  ['03', 'Discover and connect', 'Browse nearby dogs. Chat when interest is mutual.'],
];

const honestyPoints = [
  'Records are added by owners. They are not verified or vet-reviewed.',
  'Health records and documents stay private to you.',
  'Chat opens only when both sides are interested.',
  'Not a veterinary service. No medical advice.',
];

const appScreens = [
  {
    Screen: HomeScreen,
    title: 'Home',
    description: 'Your dogs, one tap from Discover.',
  },
  {
    Screen: DiscoverScreen,
    title: 'Discover',
    description: 'Browse dogs by breed and distance. No account needed.',
  },
  {
    Screen: HealthScreen,
    title: 'Health',
    description: 'Vaccinations, vet visits, documents. Private to you.',
  },
];

function StoreCtas() {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <Button asChild size="lg" className="h-12 rounded-full px-6 text-base font-bold shadow-brand">
        <Link href="/download">
          <Download className="size-4" aria-hidden="true" />
          Download KINRO App
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="h-12 rounded-full bg-card px-6 text-base font-bold"
      >
        <Link href="/discover">
          Browse dogs <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

export default function KinroHome() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative isolate border-b border-border bg-background">
        <div
          className="absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-accent/60 to-transparent"
          aria-hidden="true"
        />
        <div className="container-page grid items-center gap-14 py-14 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-8 md:py-20">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            <span className="app-chip mb-6">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Mobile-first · For responsible dog owners
            </span>
            <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
              Genetic Wellness.
              <span className="block text-primary">Brighter Lives.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
              Health records, nearby dogs and trusted connections, in one app.
            </p>
            <div className="mt-8">
              <StoreCtas />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-foreground underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-sm font-medium text-muted-foreground">
              {signals.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Illustrative app screens — sample dogs and photos, not real profiles. */}
          <figure className="relative mx-auto w-full max-w-[26rem] animate-in fade-in zoom-in-95 duration-1000">
            <div
              className="absolute left-1/2 top-1/2 -z-10 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="absolute -left-10 top-10 hidden w-[62%] -rotate-6 opacity-95 sm:block">
                <DiscoverScreen />
              </div>
              <div className="relative mx-auto w-[16rem] sm:ml-auto sm:w-[68%] sm:min-w-[15rem] sm:rotate-3">
                <HomeScreen />
              </div>
            </div>
            <figcaption className="mt-6 text-center text-xs text-muted-foreground">
              Illustrative app screens. Sample dogs and photos, not real profiles.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* The app */}
      <section id="the-app" className="section-lg scroll-mt-14 bg-secondary/60">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow">The KINRO app</p>
            <h2 className="mt-4 font-display text-h2 text-foreground">One calm, simple app.</h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              The app is the full KINRO experience. Public dog profiles are open to browse here too.
            </p>
          </div>
          <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {appScreens.map(({ Screen, title, description }) => (
              <figure key={title} className="text-center">
                <div className="mx-auto w-full max-w-[17rem]">
                  <Screen />
                </div>
                <figcaption className="mt-6">
                  <p className="font-display text-xl font-bold text-foreground">{title}</p>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-12 text-center text-xs text-muted-foreground">
            Illustrative screens. Sample dogs and photos. The app may differ in detail.
          </p>
        </div>
      </section>

      {/* Why KINRO */}
      <section id="features" className="section-lg scroll-mt-14">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-eyebrow">Why KINRO</p>
            <h2 className="mt-4 font-display text-h2 text-foreground">
              Clearer information for
              <span className="text-primary"> every dog.</span>
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              KINRO starts with the dog: health, people and community. Breeding is one part of it.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {pillars.map(({ number, title, description, icon: Icon }) => (
              <article key={number} className="app-card lift p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">{number}</span>
                </div>
                <h3 className="mt-6 font-display text-h4 font-bold text-foreground">{title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section-lg scroll-mt-14 bg-secondary/60">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-eyebrow">How it works</p>
            <h2 className="mt-4 font-display text-h2 text-foreground">Simple by design.</h2>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {workflow.map(([number, title, description]) => (
              <li key={number} className="app-card lift p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {number}
                </span>
                <h3 className="mt-6 font-display text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust and transparency */}
      <section id="trust" className="section scroll-mt-14">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-primary p-8 text-primary-foreground shadow-xl md:p-12 lg:p-14">
            <div
              className="absolute -right-10 -top-20 size-64 rounded-full border border-primary-foreground/15"
              aria-hidden="true"
            />
            <div
              className="absolute -right-2 -top-12 size-40 rounded-full border border-primary-foreground/15"
              aria-hidden="true"
            />
            <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
              <div className="max-w-xl">
                <Badge
                  variant="outline"
                  className="rounded-full border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                >
                  Trust and transparency
                </Badge>
                <h2 className="mt-5 font-display text-h2 font-bold">
                  Clear about what KINRO is, and isn’t.
                </h2>
                <p className="mt-5 text-lg leading-8 text-primary-foreground/80">
                  Honest about what to expect today.
                </p>
              </div>
              <ul className="grid gap-3 text-sm md:pl-4">
                {honestyPoints.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl bg-primary-foreground/10 px-4 py-3 leading-6"
                  >
                    <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Closing call to action — the app's warm promo card, scaled up. The right
          column is reserved for the QR code (desktop visitors scan with a phone). */}
      <section className="py-section">
        <div className="container-page">
          <div className="grid gap-10 rounded-[1.75rem] bg-[#f8e9c8] p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-14 md:p-12">
            <div className="max-w-xl">
              {/* biome-ignore lint/performance/noImgElement: static public/ asset, not an optimizable remote image */}
              <img src="/kinro/symbol.png" alt="" aria-hidden="true" className="mb-5 h-12 w-auto" />
              <h2 className="font-display text-h2 font-bold">
                Take KINRO <span className="text-primary">with you.</span>
              </h2>
              <p className="mt-4 text-foreground/75">
                Health records and trusted owners nearby, in your pocket.
              </p>
              <div className="mt-8">
                <StoreCtas />
              </div>
            </div>
            <div className="hidden md:block">
              <QrSlot />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

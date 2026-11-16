// KINRO homepage. KINRO is mobile-first: this page introduces the brand, builds
// trust, supports SEO and public discovery, and sends people to the app.
//
// Positioning: "The Digital Life Record for Every Dog".
//
// Copy rule: only describe what the product does today. Anything planned is
// labelled "Coming soon" and is never presented as live. Keep lines short.
// Status labels below were set from an audit of the web app, API and mobile app
// (see docs/PRODUCT_GAP_ASSESSMENT.md). Update them when features ship.

import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  Clock,
  Download,
  Fingerprint,
  HeartPulse,
  Home,
  MessageCircle,
  PawPrint,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { DiscoverScreen, HealthScreen, HomeScreen } from '@/components/custom/app-mockups';
import { IconTile, PhotoFrame, ScreenCrop } from '@/components/custom/photo-frame';
import { QrSlot } from '@/components/custom/qr-slot';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PhotoSlot } from '@/lib/photography';
import { cn } from '@/lib/utils';

// Keep this a Server Component so it can export metadata.
export const metadata: Metadata = {
  title: { absolute: 'KINRO — The Digital Life Record for Every Dog' },
  description:
    'KINRO keeps your dog’s vaccinations, vet visits and documents in one trusted place, from puppy to senior. Meet responsible dog owners nearby.',
  // Do not export an explicit openGraph object here; that suppresses the
  // file-based opengraph-image.tsx for the home route.
  alternates: { canonical: '/' },
};

type Status = 'live' | 'partial' | 'soon';

const statusLabel: Record<Status, string> = {
  live: 'Available',
  partial: 'Partly available',
  soon: 'Coming soon',
};

interface Feature {
  text: string;
  /** false = planned, shown with a "Coming soon" tag. */
  live: boolean;
}

function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="space-y-2.5 text-sm leading-6">
      {items.map(({ text, live }) => (
        <li key={text} className="flex items-start gap-2.5">
          {live ? (
            <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <span className={cn('min-w-0', live ? 'text-foreground' : 'text-muted-foreground')}>
            {text}
            {live ? null : (
              <>
                {/* A real space gives the browser a place to wrap the tag onto its own line. */}{' '}
                <span className="inline-flex whitespace-nowrap rounded-full border border-border px-2 py-0.5 align-middle text-[0.6rem] font-semibold uppercase leading-none tracking-wide">
                  Coming soon
                </span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

const problems = [
  {
    icon: BookOpen,
    title: 'Paper booklets get lost',
    text: 'The vaccination card is never in the bag when the vet asks for it.',
  },
  {
    icon: MessageCircle,
    title: 'Records live in chat threads',
    text: 'Prescriptions and reports are buried in WhatsApp and photo galleries.',
  },
  {
    icon: Building2,
    title: 'Every clinic has its own file',
    text: 'Switch vets, move cities or share care, and the history stays behind.',
  },
];

const stages: {
  slot: PhotoSlot;
  stage: string;
  title: string;
  icon: LucideIcon;
  features: Feature[];
}[] = [
  {
    slot: 'lifetime-puppy',
    stage: 'Puppy',
    title: 'A healthy start',
    icon: PawPrint,
    features: [
      { text: 'Log each vaccination as it happens', live: true },
      { text: 'Keep vet notes and certificates together', live: true },
      { text: 'Deworming schedules and growth tracking', live: false },
    ],
  },
  {
    slot: 'lifetime-adult',
    stage: 'Adult',
    title: 'Everyday life, organised',
    icon: Home,
    features: [
      { text: 'Vet visits and documents in one place', live: true },
      { text: 'A clear profile with photos, breed and age', live: true },
      { text: 'Meet responsible dog owners nearby', live: true },
    ],
  },
  {
    slot: 'lifetime-senior',
    stage: 'Senior',
    title: 'Care that remembers',
    icon: Stethoscope,
    features: [
      { text: 'The full history, ready for every vet visit', live: true },
      { text: 'Medication records', live: false },
      { text: 'Preventive-care reminders', live: false },
    ],
  },
];

interface Pillar {
  number: string;
  title: string;
  description: string;
  status: Status;
  slot: PhotoSlot;
  visual: 'health' | 'community' | { icon: LucideIcon };
  visualLabel?: string;
  features: Feature[];
}

const pillars: Pillar[] = [
  {
    number: '01',
    title: 'Dog Health Intelligence',
    description: 'Vaccinations, vet visits and documents, kept together and private to you.',
    status: 'partial',
    slot: 'pillar-health',
    visual: 'health',
    visualLabel: 'App screen showing a dog’s vaccination, vet visit and document records.',
    features: [
      { text: 'Vaccination records', live: true },
      { text: 'Vet visit history', live: true },
      { text: 'Private health documents, such as lab reports and prescriptions', live: true },
      { text: 'Deworming, medication and allergy records', live: false },
      { text: 'Vaccination and medication reminders', live: false },
    ],
  },
  {
    number: '02',
    title: 'Family Dog Management',
    description: 'One dog, the whole family. Share care with permissions you control.',
    status: 'soon',
    slot: 'pillar-family',
    visual: { icon: Users },
    features: [
      { text: 'Several family members on one dog', live: false },
      { text: 'Permission-based shared access', live: false },
      { text: 'Shared care history', live: false },
    ],
  },
  {
    number: '03',
    title: 'Dog Identity & Lineage',
    description: 'A lasting profile for every dog, with its story building over time.',
    status: 'partial',
    slot: 'pillar-identity',
    visual: { icon: Fingerprint },
    features: [
      { text: 'Dog profile with photos, breed, age, sex and city', live: true },
      { text: 'Parent dog profiles and lineage', live: false },
      { text: 'Pedigree and registration documents', live: false },
      { text: 'Responsible breeding records', live: false },
    ],
  },
  {
    number: '04',
    title: 'Community & Connections',
    description: 'Meet responsible dog owners nearby. Chat opens when both sides are interested.',
    status: 'live',
    slot: 'pillar-community',
    visual: 'community',
    visualLabel: 'App screen showing nearby dogs to discover.',
    features: [
      { text: 'Discover dogs by breed and city', live: true },
      { text: 'Show interest, then chat when it is mutual', live: true },
      { text: 'Owner profiles, with report and block', live: true },
      { text: 'Breed-based communities', live: false },
    ],
  },
  {
    number: '05',
    title: 'Vet & Pet Care Network',
    description: 'Your vet, in your dog’s record. Shared only when you say so.',
    status: 'partial',
    slot: 'pillar-vet',
    visual: { icon: Stethoscope },
    features: [
      { text: 'Vet name noted on each visit record', live: true },
      { text: 'Veterinary clinic discovery', live: false },
      { text: 'Share records with your vet, only with your permission', live: false },
      { text: 'Verified vet badges, where verification exists', live: false },
    ],
  },
  {
    number: '06',
    title: 'AI Dog Wellness Intelligence',
    description:
      'Helps you understand your dog’s records. Never diagnoses, never replaces your vet.',
    status: 'soon',
    slot: 'pillar-ai',
    visual: { icon: Sparkles },
    features: [
      { text: 'Plain-language summaries of prescriptions and lab reports', live: false },
      { text: 'Spot missing or incomplete records', live: false },
      { text: 'Prepare questions for your vet visit', live: false },
      { text: 'Age-based preventive-care reminders', live: false },
    ],
  },
];

const workflow = [
  ['01', 'Create your profile', 'Sign in, then add yourself and your dog.'],
  [
    '02',
    'Build the record',
    'Log vaccinations and vet visits. Attach documents. Only you see them.',
  ],
  ['03', 'Meet owners nearby', 'Browse nearby dogs. Chat when interest is mutual.'],
];

const trustPoints = [
  'Your dog’s records are private to your account, and removed when you delete it.',
  'Records are added by owners. They are not verified or vet-reviewed.',
  'Chat opens only when both sides are interested. Report or block anyone, any time.',
  'No badge says “verified” until real verification exists.',
  'KINRO is not a veterinary service or authority, and is not government-certified. No medical advice.',
];

const signals = [
  { icon: HeartPulse, label: 'Health records' },
  { icon: PawPrint, label: 'Dog profiles' },
  { icon: Users, label: 'Trusted connections' },
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

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide',
        status === 'live' && 'bg-primary text-primary-foreground',
        status === 'partial' && 'bg-accent text-accent-foreground',
        status === 'soon' && 'border border-border text-muted-foreground',
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

function pillarFallback(pillar: Pillar) {
  if (pillar.visual === 'health') {
    return (
      <ScreenCrop label={pillar.visualLabel ?? ''}>
        <HealthScreen />
      </ScreenCrop>
    );
  }
  if (pillar.visual === 'community') {
    return (
      <ScreenCrop label={pillar.visualLabel ?? ''}>
        <DiscoverScreen />
      </ScreenCrop>
    );
  }
  return <IconTile icon={pillar.visual.icon} />;
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
              The Digital Life Record for Every Dog
            </span>
            <h1 className="font-display text-[clamp(2.2rem,3.6vw,3.1rem)] font-bold leading-[1.02] tracking-[-0.03em] text-foreground">
              Every pawprint.
              <span className="block">Every milestone.</span>
              <span className="block text-primary">One life story.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
              From identity and health to photos and connections, give your dog one trusted digital
              home for every stage of life.
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
                <HomeScreen />
              </div>
              <div className="relative mx-auto w-[16rem] sm:ml-auto sm:w-[68%] sm:min-w-[15rem] sm:rotate-3">
                <HealthScreen />
              </div>
            </div>
            <figcaption className="mt-6 text-center text-xs text-muted-foreground">
              Illustrative app screens. Sample dogs and photos, not real profiles.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Why KINRO */}
      <section id="why" className="section-lg scroll-mt-14">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-eyebrow">Why KINRO</p>
            <h2 className="mt-4 font-display text-h2 text-foreground">
              A dog’s life leaves a long
              <span className="text-primary"> paper trail.</span>
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              Most of it ends up scattered. KINRO brings it together in one record that you own.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {problems.map(({ icon: Icon, title, text }) => (
              <article key={title} className="app-card p-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* A dog's lifetime */}
      <section id="lifetime" className="section-lg scroll-mt-14 bg-secondary/60">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow">A dog’s lifetime</p>
            <h2 className="mt-4 font-display text-h2 text-foreground">
              One record that grows with your dog.
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              Every moment. Every milestone. Every health record. One place.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {stages.map(({ slot, stage, title, icon, features }) => (
              <article key={stage} className="app-card lift overflow-hidden p-3">
                <PhotoFrame slot={slot} fallback={<IconTile icon={icon} />} />
                <div className="p-4 pb-3">
                  <p className="text-eyebrow">{stage}</p>
                  <h3 className="mt-2 font-display text-h4 font-bold text-foreground">{title}</h3>
                  <div className="mt-4">
                    <FeatureList items={features} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Six pillars */}
      <section id="pillars" className="section-lg scroll-mt-14">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-eyebrow">What KINRO is building</p>
            <h2 className="mt-4 font-display text-h2 text-foreground">
              Six pillars for
              <span className="text-primary"> every dog’s life.</span>
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              Some of this is in the app today. The rest is on the way, and we mark it clearly.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.number} className="app-card lift flex flex-col p-3">
                <PhotoFrame slot={pillar.slot} fallback={pillarFallback(pillar)} />
                <div className="flex flex-1 flex-col p-4 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-muted-foreground">{pillar.number}</span>
                    <StatusBadge status={pillar.status} />
                  </div>
                  <h3 className="mt-3 font-display text-h4 font-bold text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{pillar.description}</p>
                  <div className="mt-5 border-t border-border pt-5">
                    <FeatureList items={pillar.features} />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-10 text-center text-xs text-muted-foreground">
            App screens are illustrative, with sample dogs and photos. The app may differ in detail.
          </p>
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

      {/* Responsible ownership and trust */}
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
                  Responsible ownership and trust
                </Badge>
                <h2 className="mt-5 font-display text-h2 font-bold">
                  Your dog’s records stay yours.
                </h2>
                <p className="mt-5 text-lg leading-8 text-primary-foreground/80">
                  Clear about what KINRO is today, and what it is not.
                </p>
              </div>
              <ul className="grid gap-3 text-sm md:pl-4">
                {trustPoints.map((item) => (
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

      {/* Community and connections */}
      <section id="community" className="section scroll-mt-14">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div className="max-w-xl">
            <p className="text-eyebrow">Community and connections</p>
            <h2 className="mt-4 font-display text-h2 text-foreground">
              Meet responsible dog owners
              <span className="text-primary"> nearby.</span>
            </h2>
            <p className="mt-5 text-body-lg text-muted-foreground">
              Browse dogs by breed and city, no account needed. Show interest, and chat opens when
              both sides are interested. Breeding is one part of it, not the whole of KINRO.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base font-bold">
                <Link href="/discover">
                  Browse dogs <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          <figure className="mx-auto w-full max-w-[17rem]">
            <DiscoverScreen />
            <figcaption className="mt-5 text-center text-xs text-muted-foreground">
              Illustrative app screen. Sample dogs, not real profiles.
            </figcaption>
          </figure>
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
                Create your dog’s <span className="text-primary">digital life record.</span>
              </h2>
              <p className="mt-4 text-foreground/75">
                Start with one vaccination. Add the rest as you go.
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

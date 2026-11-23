// Static, decorative recreations of KINRO app screens for the marketing site.
// They mirror the mobile app's layout and tokens (cream background, white 20px
// cards, forest-green accent, charcoal text) but are not live: the dogs, places
// and records are SAMPLE content, and the photos in /public/kinro/samples are
// the app's sample breed photos. Callers must caption them as illustrative.

import {
  ChevronRight,
  Compass,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  PawPrint,
  Stethoscope,
  Syringe,
  User,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', icon: Home },
  { label: 'Discover', icon: Compass },
  { label: 'My Dogs', icon: PawPrint },
  { label: 'Messages', icon: MessageCircle },
  { label: 'Profile', icon: User },
] as const;

export type TabLabel = (typeof tabs)[number]['label'];

/** Phone body with a status-bar notch, a scrolling-screen area and the 5-tab bar. */
export function PhoneFrame({
  active,
  children,
  className,
}: {
  active: TabLabel;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative mx-auto flex aspect-[9/18.5] text-left w-full max-w-[17rem] flex-col overflow-hidden rounded-[2.6rem] border-[9px] border-foreground bg-background shadow-2xl',
        className,
      )}
    >
      <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-foreground" />
      <div className="relative flex-1 overflow-hidden px-3.5 pt-9">{children}</div>
      <div className="flex items-end justify-between border-t border-border bg-card px-2 pb-3 pt-2">
        {tabs.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 text-[0.55rem] font-semibold transition-colors duration-300',
              label === active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-4" strokeWidth={label === active ? 2.4 : 1.8} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {/* biome-ignore lint/performance/noImgElement: static public/ asset */}
      <img src="/kinro/symbol.png" alt="" className="h-5 w-auto" />
      <p className="text-sm font-bold tracking-tight text-foreground">{title}</p>
    </div>
  );
}

function Thumb({ src, className }: { src: string; className?: string }) {
  return (
    // biome-ignore lint/performance/noImgElement: static public/ asset
    <img
      src={src}
      alt=""
      className={cn('shrink-0 rounded-xl object-cover', className)}
      width={56}
      height={56}
    />
  );
}

const dogs = [
  {
    name: 'Bodhi',
    meta: 'Labrador Retriever · 3 yrs',
    place: 'Pune · 8 km away',
    photo: '/kinro/samples/dog-labrador.jpg',
    records: true,
  },
  {
    name: 'Rio',
    meta: 'Golden Retriever · 2 yrs',
    place: 'Mumbai · 12 km away',
    photo: '/kinro/samples/dog-golden-retriever.jpg',
    records: true,
  },
  {
    name: 'Pepper',
    meta: 'Beagle · 4 yrs',
    place: 'Hyderabad · 5 km away',
    photo: '/kinro/samples/dog-beagle.jpg',
    records: false,
  },
] as const;

export function HomeBody({ showCare = false }: { showCare?: boolean }) {
  return (
    <>
      <Header title="KINRO" />
      <p className="text-base font-bold leading-tight tracking-tight">Welcome back</p>
      <p className="mt-0.5 text-[0.65rem] text-muted-foreground">Your dogs, in one place.</p>

      <p className="mb-1.5 mt-4 text-xs font-bold">My Dogs</p>
      <div className="app-card flex items-center gap-2.5 p-2.5">
        <Thumb src="/kinro/samples/dog-labrador.jpg" className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">Bodhi</p>
          <p className="truncate text-[0.6rem] text-muted-foreground">Labrador Retriever · 3 yrs</p>
          <span className="app-chip mt-1 !px-2 !py-0.5 !text-[0.55rem]">Health records</span>
        </div>
        <ChevronRight className="size-4 text-input" />
      </div>

      {showCare ? (
        <div className="app-card mt-3 flex items-center gap-2 p-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Stethoscope className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-bold">
              Find Veterinary Care <CareTag />
            </p>
            <p className="truncate text-[0.55rem] text-muted-foreground">
              Vets and clinics near you.
            </p>
          </div>
          <ChevronRight className="size-4 text-input" />
        </div>
      ) : null}

      <div className="mt-3 rounded-xl bg-[#f8e9c8] p-3">
        <p className="text-xs font-bold">Meet dogs nearby</p>
        <p className="mt-0.5 text-[0.6rem] leading-snug text-foreground/70">
          Browse by breed and distance. Chat opens when both sides are interested.
        </p>
        <span className="mt-2 flex w-fit items-center rounded-full bg-primary px-3 py-1 text-[0.6rem] font-bold leading-none text-primary-foreground">
          Discover
        </span>
      </div>
    </>
  );
}

export function DiscoverBody() {
  return (
    <>
      <Header title="Discover" />
      <div className="mb-2.5 flex gap-1.5">
        {['All breeds', 'Near me'].map((chip, i) => (
          <span
            key={chip}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[0.6rem] font-bold',
              i === 0
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="space-y-2">
        {dogs.map((dog) => (
          <div key={dog.name} className="app-card flex items-center gap-2.5 p-2">
            <Thumb src={dog.photo} className="size-14" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{dog.name}</p>
              <p className="truncate text-[0.6rem] text-muted-foreground">{dog.meta}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[0.58rem] font-medium text-muted-foreground">
                <MapPin className="size-3 shrink-0 text-primary" />
                {dog.place}
              </p>
              {dog.records ? (
                <span className="app-chip mt-1 !px-2 !py-0.5 !text-[0.55rem]">Health records</span>
              ) : null}
            </div>
            <ChevronRight className="size-4 text-input" />
          </div>
        ))}
      </div>
    </>
  );
}

const records = [
  { icon: Syringe, title: 'Vaccination', note: 'Rabies · added by owner' },
  { icon: Stethoscope, title: 'Vet visit', note: 'Annual check-up · added by owner' },
  { icon: FileText, title: 'Document', note: 'Private to your account' },
] as const;

export function HealthBody() {
  return (
    <>
      <Header title="Health" />
      <div className="mb-3 flex items-center gap-2.5">
        <Thumb src="/kinro/samples/dog-labrador.jpg" className="size-11 !rounded-full" />
        <div>
          <p className="text-sm font-bold">Bodhi</p>
          <p className="text-[0.6rem] text-muted-foreground">Labrador Retriever · 3 yrs</p>
        </div>
      </div>
      <div className="space-y-2">
        {records.map(({ icon: Icon, title, note }) => (
          <div key={title} className="app-card flex items-center gap-2.5 p-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{title}</p>
              <p className="truncate text-[0.58rem] text-muted-foreground">{note}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.55rem] leading-snug text-muted-foreground">
        Records are added by owners and are not verified by KINRO.
      </p>
    </>
  );
}

/** The small green "CARE" label that marks the extension in the app. */
function CareTag() {
  return (
    <span className="rounded-full bg-accent px-1.5 py-px text-[0.45rem] font-bold uppercase tracking-wider text-accent-foreground">
      Care
    </span>
  );
}

/** The Care request flow: no real or invented vets, only the app's own labels. */
export function CareBody() {
  const chip = (label: string, on = false) => (
    <span
      key={label}
      className={cn(
        'whitespace-nowrap rounded-full border px-2 py-1 text-[0.55rem] font-bold',
        on
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground',
      )}
    >
      {label}
    </span>
  );
  return (
    <>
      <div className="mb-1 flex items-center gap-1.5">
        <p className="text-base font-bold leading-tight tracking-tight">Request a visit</p>
        <CareTag />
      </div>
      <p className="mb-3 text-[0.6rem] text-muted-foreground">
        With a vet near you, in a few taps.
      </p>

      <div className="mb-3 flex items-center gap-2 rounded-xl bg-accent p-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card text-accent-foreground">
          <Stethoscope className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.6rem] font-bold text-accent-foreground">Verified by KINRO</p>
          <p className="text-[0.5rem] leading-snug text-accent-foreground/80">
            Credentials checked before they are listed.
          </p>
        </div>
      </div>

      <p className="mb-1 text-[0.6rem] font-bold">Which dog?</p>
      <div className="mb-2.5 flex gap-1.5">{[chip('Bodhi', true)]}</div>
      <p className="mb-1 text-[0.6rem] font-bold">Reason</p>
      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {[chip('Check-up', true), chip('Vaccination'), chip('Skin or ears')]}
      </div>
      <p className="mb-1 text-[0.6rem] font-bold">Preferred time</p>
      <div className="mb-3 flex gap-1.5">
        {[chip('Today'), chip('Tomorrow', true), chip('This week')]}
      </div>

      <div className="mb-3 rounded-xl bg-secondary p-2.5 text-[0.52rem] leading-snug text-foreground/80">
        Your health records stay private.
      </div>
      <span className="flex w-full items-center justify-center rounded-xl bg-primary py-2 text-[0.65rem] font-bold text-primary-foreground">
        Send request
      </span>
    </>
  );
}

export function HomeScreen({ showCare = false }: { showCare?: boolean }) {
  return (
    <PhoneFrame active="Home">
      <HomeBody showCare={showCare} />
    </PhoneFrame>
  );
}

export function DiscoverScreen() {
  return (
    <PhoneFrame active="Discover">
      <DiscoverBody />
    </PhoneFrame>
  );
}

export function HealthScreen() {
  return (
    <PhoneFrame active="My Dogs">
      <HealthBody />
    </PhoneFrame>
  );
}

export function CareScreen() {
  return (
    <PhoneFrame active="Home">
      <CareBody />
    </PhoneFrame>
  );
}

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

type TabLabel = (typeof tabs)[number]['label'];

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
      <div className="flex-1 overflow-hidden px-3.5 pt-9">{children}</div>
      <div className="flex items-end justify-between border-t border-border bg-card px-2 pb-3 pt-2">
        {tabs.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 text-[0.55rem] font-semibold',
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

export function HomeScreen() {
  return (
    <PhoneFrame active="Home">
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

      <div className="mt-3 rounded-xl bg-[#f8e9c8] p-3">
        <p className="text-xs font-bold">Meet dogs nearby</p>
        <p className="mt-0.5 text-[0.6rem] leading-snug text-foreground/70">
          Browse by breed and distance. Chat opens when both sides are interested.
        </p>
        <span className="mt-2 flex w-fit items-center rounded-full bg-primary px-3 py-1 text-[0.6rem] font-bold leading-none text-primary-foreground">
          Discover
        </span>
      </div>
    </PhoneFrame>
  );
}

export function DiscoverScreen() {
  return (
    <PhoneFrame active="Discover">
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
    </PhoneFrame>
  );
}

const records = [
  { icon: Syringe, title: 'Vaccination', note: 'Rabies · added by owner' },
  { icon: Stethoscope, title: 'Vet visit', note: 'Annual check-up · added by owner' },
  { icon: FileText, title: 'Document', note: 'Private to your account' },
] as const;

export function HealthScreen() {
  return (
    <PhoneFrame active="My Dogs">
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
    </PhoneFrame>
  );
}

// Download QR codes for iPhone and Android, plus the phone-friendly buttons.
//
// Each QR encodes a stable address on KINRO's own site — /get/ios or /get/android —
// not a store URL. Those routes (src/app/get/[platform]/route.ts) send the visitor
// to the real store link from src/lib/app-links.ts once it exists, and to the
// /download page until then. So a code printed or posted today keeps working,
// and no store link is ever invented.
//
// Pure component (no hooks), so server and client components can both render it.

import { Smartphone } from 'lucide-react';
import { QrCode } from '@/components/custom/qr-code';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const stores = [
  { key: 'ios', label: 'iPhone & iPad', store: 'App Store' },
  { key: 'android', label: 'Android', store: 'Google Play' },
] as const;

type Store = (typeof stores)[number];

const qrSize = { sm: 'size-24', md: 'size-32', lg: 'size-40' } as const;

export function StoreQr({
  platform,
  origin,
  size = 'md',
}: {
  platform: Store;
  /** Public https origin of the site, e.g. https://kinro.example. */
  origin: string;
  size?: keyof typeof qrSize;
}) {
  const path = `/get/${platform.key}`;
  return (
    <figure className="flex flex-col items-center text-center">
      <a
        href={path}
        aria-label={`Open the KINRO ${platform.store} link`}
        className="rounded-2xl border border-border bg-white p-2 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <QrCode
          value={`${origin}${path}`}
          label={`QR code for KINRO on the ${platform.store}`}
          className={cn('block', qrSize[size])}
        />
      </a>
      <figcaption className="mt-2.5 text-sm font-semibold leading-tight text-foreground">
        {platform.label}
      </figcaption>
      <span className="text-xs text-muted-foreground">{platform.store}</span>
    </figure>
  );
}

/** Both codes side by side. */
export function StoreQrs({ origin, size = 'md' }: { origin: string; size?: keyof typeof qrSize }) {
  return (
    <div className="flex items-start gap-5">
      {stores.map((platform) => (
        <StoreQr key={platform.key} platform={platform} origin={origin} size={size} />
      ))}
    </div>
  );
}

/** Two small buttons for phones, where scanning your own screen makes no sense. */
export function StoreButtons({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {stores.map((platform) => (
        <Button
          key={platform.key}
          asChild
          variant="outline"
          size="sm"
          className="h-10 rounded-full bg-card px-4"
        >
          <a href={`/get/${platform.key}`}>
            <Smartphone className="size-4" aria-hidden="true" />
            {platform.store}
          </a>
        </Button>
      ))}
    </div>
  );
}

/** Footer block: QR codes on larger screens, store buttons on phones. */
export function GetTheApp({ origin }: { origin: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-foreground">Get the app</p>
      {origin ? (
        <>
          <div className="mt-4 hidden md:block">
            <StoreQrs origin={origin} size="sm" />
          </div>
          <StoreButtons className="mt-4 md:hidden" />
        </>
      ) : (
        <StoreButtons className="mt-4" />
      )}
    </div>
  );
}

/** Hero block: a compact "scan to download" card. Desktop and tablet only. */
export function ScanToDownload({ origin }: { origin: string }) {
  if (!origin) return null;
  return (
    <div className="hidden items-center gap-6 rounded-3xl border border-border bg-card/80 p-4 pr-6 shadow-sm backdrop-blur md:inline-flex">
      <StoreQrs origin={origin} size="sm" />
      <div className="max-w-[13rem]">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Scan to download</p>
        <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
          Point your phone camera at the code for your iPhone or Android.
        </p>
      </div>
    </div>
  );
}

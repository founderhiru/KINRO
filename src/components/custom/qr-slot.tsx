// QR code panel for desktop visitors. Fixed size so the layout around it never
// shifts. Shows the real QR once `appLinks.qrImage` is set; until then it holds
// the space with a clearly labelled placeholder (we never invent a code).

import { QrCode } from 'lucide-react';
import { appLinks } from '@/lib/app-links';

export function QrSlot() {
  return (
    <figure className="flex w-44 flex-col items-center text-center">
      <div className="flex size-44 items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-sm">
        {appLinks.qrImage ? (
          // biome-ignore lint/performance/noImgElement: static public/ asset, not an optimizable remote image
          <img
            src={appLinks.qrImage}
            alt="QR code that opens the KINRO download page on your phone"
            width={152}
            height={152}
            className="size-full"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input text-muted-foreground">
            <QrCode className="size-9" aria-hidden="true" />
            <span className="text-xs font-medium">QR code soon</span>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-sm font-semibold text-foreground">
        Scan to get the app
      </figcaption>
      <p className="mt-1 text-xs text-muted-foreground">Point your phone camera here.</p>
    </figure>
  );
}

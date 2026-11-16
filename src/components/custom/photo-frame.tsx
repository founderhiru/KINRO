// A fixed-ratio, rounded media frame used by the homepage lifetime and pillar
// cards. It shows the slot's real photo when one has been added (see
// src/lib/photography.ts), and otherwise the `fallback` the caller passes
// (an app-screen mockup or an on-brand tile). Same ratio and radius either way,
// so the cards stay visually consistent.

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { PHOTO_SLOTS, type PhotoSlot, photoSrc } from '@/lib/photography';
import { cn } from '@/lib/utils';

export function PhotoFrame({
  slot,
  fallback,
  className,
}: {
  slot: PhotoSlot;
  fallback: ReactNode;
  className?: string;
}) {
  const src = photoSrc(slot);
  return (
    <div
      className={cn(
        'relative aspect-[3/2] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 to-accent',
        className,
      )}
    >
      {src ? (
        // biome-ignore lint/performance/noImgElement: static public/ asset, not an optimizable remote image
        <img
          src={src}
          alt={PHOTO_SLOTS[slot].alt}
          width={1200}
          height={800}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : (
        fallback
      )}
    </div>
  );
}

/** On-brand fallback: a soft icon medallion. Decorative; the card text carries the meaning. */
export function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-full items-center justify-center" aria-hidden="true">
      <span className="flex size-24 items-center justify-center rounded-full bg-card/80 text-primary shadow-sm ring-8 ring-card/40">
        <Icon className="size-10" strokeWidth={1.6} />
      </span>
    </div>
  );
}

/** Fallback that shows a (cropped) app screen inside the frame. `label` describes it for screen readers. */
export function ScreenCrop({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div role="img" aria-label={label} className="size-full">
      <div className="absolute inset-x-0 top-5 mx-auto w-[62%] min-w-[10rem]">{children}</div>
    </div>
  );
}

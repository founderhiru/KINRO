'use client';

// Hero "product tour". ONE still phone (bezel, notch and tab bar never move) whose
// screen quickly flashes through the key app screens as soon as the page loads,
// then loops. Only the screen content cross-fades, so nothing shifts or jitters.
// Decorative: the screens are sample content, so the phone is hidden from
// assistive tech and the caption says so. With reduced motion it does not
// auto-play; the progress bars step through manually.

import { type ReactNode, useEffect, useState } from 'react';
import { PhoneFrame, type TabLabel } from '@/components/custom/app-mockups';
import { cn } from '@/lib/utils';

export interface ShowcaseScreen {
  label: string;
  active: TabLabel;
  body: ReactNode;
}

const STEP_MS = 2400;

export function HeroShowcase({ screens }: { screens: ShowcaseScreen[] }) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(query.matches);
    const onChange = () => setReduceMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Re-arming on every index change also restarts the timer after a manual pick.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `index` re-arms the timer on purpose.
  useEffect(() => {
    if (reduceMotion || screens.length < 2) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % screens.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [index, reduceMotion, screens.length]);

  const current = screens[index];

  return (
    <div className="mx-auto w-full max-w-[17rem]">
      <div className="animate-in fade-in duration-700">
        <PhoneFrame active={current?.active ?? 'Home'}>
          {screens.map((screen, i) => (
            <div
              key={screen.label}
              className={cn(
                'absolute inset-x-3.5 top-9 bottom-0 transition-opacity duration-300 ease-out',
                i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              {screen.body}
            </div>
          ))}
        </PhoneFrame>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm font-semibold text-foreground" aria-live="polite">
          {current?.label}
        </p>
        {/* Story-style progress: the active bar fills over the time the screen is shown. */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {screens.map((screen, i) => (
            <button
              key={screen.label}
              type="button"
              aria-label={`Show: ${screen.label}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="flex h-6 w-10 items-center"
            >
              <span className="relative block h-1 w-full overflow-hidden rounded-full bg-border">
                <span
                  key={i === index ? `on-${index}` : `off-${i}`}
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full bg-primary',
                    i < index || (reduceMotion && i === index) ? 'w-full' : 'w-0',
                    i === index && !reduceMotion && 'w-full animate-[hero-fill_2400ms_linear]',
                  )}
                />
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Illustrative app screens. Sample dogs and photos, not real profiles.
        </p>
      </div>
    </div>
  );
}

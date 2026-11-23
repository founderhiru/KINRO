'use client';

// Hero "product tour": one phone that flashes through the key app screens as soon
// as the page loads, then loops. Decorative: the screens are sample content, so the
// phone is hidden from assistive tech and the caption says so. With reduced
// motion it stays on the first screen and the dots step through manually.

import { type ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ShowcaseScreen {
  label: string;
  node: ReactNode;
}

const STEP_MS = 2600;

export function HeroShowcase({ screens }: { screens: ShowcaseScreen[] }) {
  const [index, setIndex] = useState(0);
  // Restart the timer whenever the visitor picks a dot.
  const [tick, setTick] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(query.matches);
    const onChange = () => setReduceMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `tick` restarts the timer on a manual pick.
  useEffect(() => {
    if (reduceMotion || screens.length < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % screens.length), STEP_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, screens.length, tick]);

  const current = screens[index];

  return (
    <div className="mx-auto w-full max-w-[17rem]">
      <div className="relative aspect-[9/18.5] animate-in fade-in zoom-in-95 duration-1000">
        {screens.map((screen, i) => (
          <div
            key={screen.label}
            aria-hidden="true"
            className={cn(
              'absolute inset-0 transition-all duration-700 ease-out',
              i === index
                ? 'translate-y-0 scale-100 opacity-100'
                : 'pointer-events-none translate-y-4 scale-[0.97] opacity-0',
            )}
          >
            {screen.node}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm font-semibold text-foreground" aria-live="polite">
          {current?.label}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          {screens.map((screen, i) => (
            <button
              key={screen.label}
              type="button"
              aria-label={`Show: ${screen.label}`}
              aria-current={i === index}
              onClick={() => {
                setIndex(i);
                setTick((t) => t + 1);
              }}
              className="flex size-6 items-center justify-center"
            >
              <span
                className={cn(
                  'block h-1.5 rounded-full transition-all duration-500',
                  i === index ? 'w-6 bg-primary' : 'w-1.5 bg-border',
                )}
              />
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

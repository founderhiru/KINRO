// @polsia:user-owned — searchable picker with optional "use what I typed".
'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type PickerSection = { title: string; options: readonly string[] };

type SearchablePickerProps = {
  id: string;
  /** Currently chosen value; '' means "no filter". */
  value: string;
  onChange: (value: string) => void;
  /** Label of the "no filter" row and the closed-state placeholder, e.g. "All breeds". */
  emptyLabel: string;
  searchPlaceholder: string;
  sections: readonly PickerSection[];
  /** Quick-pick chips shown above the list while the search box is empty (e.g. the major metros). */
  quickPicks?: readonly string[];
  /** Offer a "Use “…”" row when the typed text matches nothing listed. */
  allowCustom?: boolean;
  customHint?: string;
};

const norm = (text: string) => text.trim().toLocaleLowerCase('en-IN');

export function SearchablePicker({
  id,
  value,
  onChange,
  emptyLabel,
  searchPlaceholder,
  sections,
  quickPicks,
  allowCustom,
  customHint,
}: SearchablePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const listId = useId();
  const q = norm(query);

  const filtered = useMemo(
    () =>
      sections
        .map((section) => ({
          title: section.title,
          options: q
            ? section.options.filter((option) => norm(option).includes(q))
            : section.options,
        }))
        .filter((section) => section.options.length > 0),
    [sections, q],
  );
  const exact = sections.some((section) => section.options.some((option) => norm(option) === q));
  const showCustom = Boolean(allowCustom && q && !exact);

  function choose(next: string) {
    onChange(next);
    setQuery('');
    setOpen(false);
  }

  const rowClass = (selected: boolean) =>
    cn(
      'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
      selected && 'bg-accent font-semibold text-accent-foreground',
    );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background/70 px-3 text-left text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className={cn('truncate', !value && 'text-foreground')}>{value || emptyLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={12}
        className="max-h-[var(--radix-popover-content-available-height)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto p-3"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            // biome-ignore lint/a11y/noAutofocus: the search box is the point of opening the picker
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && showCustom) {
                event.preventDefault();
                choose(query.trim());
              }
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {quickPicks && !q ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {quickPicks.map((pick) => (
              <button
                key={pick}
                type="button"
                onClick={() => choose(pick)}
                className={cn(
                  'h-9 rounded-full border px-3 text-xs font-semibold transition-colors',
                  value === pick
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:bg-accent',
                )}
              >
                {pick}
              </button>
            ))}
          </div>
        ) : null}

        <div
          id={listId}
          role="listbox"
          aria-label={searchPlaceholder}
          className="mt-3 max-h-52 overflow-y-auto"
        >
          {!q ? (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => choose('')}
              className={rowClass(!value)}
            >
              {emptyLabel}
              {!value ? <Check className="size-4" aria-hidden="true" /> : null}
            </button>
          ) : null}
          {showCustom ? (
            <button
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => choose(query.trim())}
              className="flex w-full flex-col rounded-lg bg-accent px-3 py-2.5 text-left text-sm font-semibold text-accent-foreground"
            >
              Use “{query.trim()}”
              {customHint ? <span className="text-xs font-normal">{customHint}</span> : null}
            </button>
          ) : null}
          {filtered.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              {section.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  onClick={() => choose(option)}
                  className={rowClass(option === value)}
                >
                  {option}
                  {option === value ? <Check className="size-4" aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          ))}
          {!filtered.length && !showCustom ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No matches</p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

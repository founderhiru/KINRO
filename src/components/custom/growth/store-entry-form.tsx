'use client';

// Weekly store figures, typed in by hand from App Store Connect / Play Console.
// Saving the same week, store and figure again replaces the earlier value.

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api-client';
import { STORE_METRICS, type StoreMetric, type StorePlatform } from '@/lib/contracts/growth';

const METRIC_LABEL: Record<StoreMetric, string> = {
  page_views: 'Product page views',
  first_time_downloads: 'First-time downloads',
  redownloads: 'Redownloads',
  installs: 'Installs',
};

const selectClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function StoreEntryForm({
  defaultWeekEnding,
  onSaved,
}: {
  defaultWeekEnding: string;
  onSaved: () => void;
}) {
  const [weekEnding, setWeekEnding] = useState(defaultWeekEnding);
  const [platform, setPlatform] = useState<StorePlatform>('ios');
  const [metric, setMetric] = useState<StoreMetric>('first_time_downloads');
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metrics = STORE_METRICS[platform];

  function changePlatform(next: StorePlatform) {
    setPlatform(next);
    const allowed = STORE_METRICS[next] as readonly string[];
    if (!allowed.includes(metric)) setMetric(allowed[0] as StoreMetric);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const number = Number(value);
    if (value.trim() === '' || !Number.isInteger(number) || number < 0) {
      setError('Enter a whole number, 0 or more.');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/api/admin/growth/store-snapshots', {
        method: 'POST',
        body: JSON.stringify({ weekEnding, platform, metric, value: number }),
      });
      toast.success('Saved');
      setValue('');
      onSaved();
    } catch (err) {
      const cause = (err as { cause?: { errors?: Record<string, string> } }).cause;
      setError(
        (cause?.errors ? Object.values(cause.errors)[0] : undefined) ??
          'Could not save. Check the details.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-5 sm:items-end" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="store-week">Week ending</Label>
        <Input
          id="store-week"
          type="date"
          value={weekEnding}
          onChange={(e) => setWeekEnding(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="store-platform">Store</Label>
        <select
          id="store-platform"
          className={selectClass}
          value={platform}
          onChange={(e) => changePlatform(e.target.value as StorePlatform)}
        >
          <option value="ios">App Store (iOS)</option>
          <option value="android">Google Play (Android)</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="store-metric">Figure</Label>
        <select
          id="store-metric"
          className={selectClass}
          value={metric}
          onChange={(e) => setMetric(e.target.value as StoreMetric)}
        >
          {metrics.map((m) => (
            <option key={m} value={m}>
              {METRIC_LABEL[m]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="store-value">Number</Label>
        <Input
          id="store-value"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
        />
      </div>
      <Button type="submit" disabled={saving} className="h-10">
        {saving ? 'Saving…' : 'Save figure'}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive sm:col-span-5">
          {error}
        </p>
      ) : null}
    </form>
  );
}

export { METRIC_LABEL };

'use client';

// Founder Growth Dashboard. Aggregates only. Every figure says where it comes from, and
// store figures (typed in by hand), website clicks and KINRO's own counts are never
// added together or turned into conversion rates.

import { useCallback, useEffect, useState } from 'react';
import { BarChart } from '@/components/custom/growth/bar-chart';
import { METRIC_LABEL, StoreEntryForm } from '@/components/custom/growth/store-entry-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api-client';
import { GrowthReport } from '@/lib/contracts/growth';
import { addDays } from '@/lib/growth/time';

const RANGES = [7, 30, 90] as const;
const number = new Intl.NumberFormat('en-IN');

const fmt = (n: number) => number.format(n);
const fmtSmall = (n: number | null) => (n === null ? '<5' : number.format(n));
const fmtPercent = (n: number | null) => (n === null ? '–' : `${Math.round(n * 100)}%`);

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <div>
        <p className="text-sm">{label}</p>
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Origin({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="outline" className="rounded-full px-2 py-0 text-[0.7rem] font-normal">
      {children}
    </Badge>
  );
}

export function GrowthDashboard() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [report, setReport] = useState<GrowthReport | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      setReport(
        await apiFetch(`/api/admin/growth?range=${days}`, {
          schema: GrowthReport,
          cache: 'no-store',
        }),
      );
    } catch {
      setFailed(true);
    }
  }, [days]);

  useEffect(() => {
    setReport(null);
    void load();
  }, [load]);

  return (
    <main className="container-page space-y-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">KINRO Growth</h1>
          <p className="text-sm text-muted-foreground">
            Founder view. Totals only, no individual users. Days are counted in India time (IST).
          </p>
        </div>
        <fieldset className="flex gap-2">
          <legend className="sr-only">Date range</legend>
          {RANGES.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={r === days ? 'default' : 'outline'}
              aria-pressed={r === days}
              onClick={() => setDays(r)}
              className="rounded-full"
            >
              {r} days
            </Button>
          ))}
        </fieldset>
      </header>

      {failed ? (
        <Card>
          <CardContent className="space-y-3 p-6">
            <p>The report could not be loaded.</p>
            <Button variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : !report ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <Report report={report} onSaved={() => void load()} />
      )}
    </main>
  );
}

function Report({ report, onSaved }: { report: GrowthReport; onSaved: () => void }) {
  const { totals, period, care, downloadClicks, store, cities, series } = report;
  const label = `${report.range.startDay} to ${report.range.endDay}`;
  const yesterday = addDays(report.range.endDay, -1);

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Showing {label}
        {report.range.launchDay ? `, counting from the launch day ${report.range.launchDay}` : ''}.{' '}
        {report.excludedAccounts} internal account{report.excludedAccounts === 1 ? '' : 's'} left
        out. Updated {new Date(report.generatedAt).toLocaleTimeString('en-IN')}.
      </p>

      <section aria-label="Key numbers" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="Registered users"
          value={fmt(totals.users)}
          hint="All time, internal accounts excluded"
        />
        <Tile
          label="New registrations"
          value={fmt(period.registrations)}
          hint={`In the last ${report.range.days} days`}
        />
        <Tile
          label="Dog profiles"
          value={fmt(totals.dogs)}
          hint={`${fmt(totals.ownersWithDog)} owners · ${fmt(period.dogs)} new in range`}
        />
        <Tile
          label="Messages"
          value={fmt(period.messages)}
          hint={`${fmt(period.usersWhoMessaged)} people in ${fmt(period.conversationsWithMessages)} conversations`}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>From the website to a dog profile</CardTitle>
          <CardDescription>
            Each line is counted by a different system and is not a strict funnel. They are never
            added together.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Row
            label="Visits to the store link on the website"
            value={fmt(downloadClicks.total)}
            note={`iOS ${fmt(downloadClicks.ios)} · Android ${fmt(downloadClicks.android)}. A visit is not a download.`}
          />
          <Row
            label="App Store first-time downloads"
            value={store.weeksEntered ? fmt(store.ios.firstTimeDownloads) : 'Not entered'}
            note={`Entered by you from App Store Connect. Redownloads: ${fmt(store.ios.redownloads)}. Counted per Apple ID.`}
          />
          <Row
            label="Google Play installs"
            value={store.weeksEntered ? fmt(store.android.installs) : 'Not entered'}
            note="Entered by you from Play Console. Counted per device."
          />
          <Row
            label="First app opens"
            value="Not measured yet"
            note="Arrives with the mobile tracking release. Not estimated from downloads."
          />
          <Row
            label="New registrations"
            value={fmt(period.registrations)}
            note="Accounts created in KINRO. A person can download and open the app without registering."
          />
          <Row
            label="Dog profiles created"
            value={fmt(period.dogs)}
            note={`${fmt(totals.ownersWithDog)} owners have at least one dog in total.`}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New registrations per day</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart points={series.registrations} label="New registrations per day" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Website visits to the store link per day</CardTitle>
            <CardDescription>
              Counted by KINRO <Origin>website</Origin>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              points={series.downloadClicks}
              label="Website visits to the store link per day"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connections and messages</CardTitle>
            <CardDescription>Interests are counted by the day they were sent.</CardDescription>
          </CardHeader>
          <CardContent>
            <Row label="Interests sent" value={fmt(period.interestsSent)} />
            <Row label="Accepted" value={fmt(period.interestsAccepted)} />
            <Row label="Declined" value={fmt(period.interestsDeclined)} />
            <Row label="Matches made" value={fmt(period.matches)} />
            <Row label="Messages sent" value={fmt(period.messages)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KINRO Care requests</CardTitle>
            <CardDescription>
              Visit requests only. Searches and profile views are not measured yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Row label="Requests sent" value={fmt(care.requests)} />
            <Row label="Waiting for the provider" value={fmt(care.requested)} />
            <Row label="Confirmed" value={fmt(care.confirmed)} />
            <Row label="Declined" value={fmt(care.declined)} />
            <Row label="Cancelled" value={fmt(care.cancelled)} />
            <Row
              label="Confirmation rate"
              value={fmtPercent(care.confirmRate)}
              note="Confirmed out of confirmed plus declined."
            />
            <Row
              label="Providers listed"
              value={`${fmt(care.providersPublished)} (${fmt(care.providersVerified)} verified)`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Where visits come from</CardTitle>
            <CardDescription>
              Source tag on the link: <code>qr</code> is the QR code, <code>web</code> the button,{' '}
              <code>direct</code> no tag. Groups under 5 show as &lt;5.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {downloadClicks.bySource.length === 0 ? (
              <p className="text-sm text-muted-foreground">No visits in this range.</p>
            ) : (
              downloadClicks.bySource.map((s) => (
                <Row key={s.source} label={s.source} value={fmtSmall(s.count)} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cities</CardTitle>
            <CardDescription>
              The city owners typed into their profile, all time. Groups under 5 show as &lt;5.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No owner profiles yet.</p>
            ) : (
              cities
                .slice(0, 12)
                .map((c) => <Row key={c.city} label={c.city} value={fmtSmall(c.count)} />)
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store figures</CardTitle>
          <CardDescription>
            Copy these once a week from App Store Connect and Play Console. They come from Apple and
            Google, not from KINRO, and are shown on their own. Weeks that end inside the range are
            added up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                App Store <Origin>entered by you</Origin>
              </p>
              <Row label="Product page views" value={fmt(store.ios.pageViews)} />
              <Row label="First-time downloads" value={fmt(store.ios.firstTimeDownloads)} />
              <Row label="Redownloads" value={fmt(store.ios.redownloads)} />
            </div>
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
                Google Play <Origin>entered by you</Origin>
              </p>
              <Row label="Product page views" value={fmt(store.android.pageViews)} />
              <Row label="Installs" value={fmt(store.android.installs)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {store.weeksEntered} week{store.weeksEntered === 1 ? '' : 's'} entered in this range
            {store.lastEnteredAt
              ? `. Last entry saved ${new Date(store.lastEnteredAt).toLocaleDateString('en-IN')}.`
              : '. Nothing entered yet.'}{' '}
            Apple reports in UTC, so its days can differ from India days by up to 5.5 hours.
          </p>

          <StoreEntryForm defaultWeekEnding={yesterday} onSaved={onSaved} />

          {store.entries.length > 0 ? (
            <details>
              <summary className="cursor-pointer text-sm font-medium">
                Entries in this range ({store.entries.length})
              </summary>
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="py-1 pr-3">Week ending</th>
                    <th className="py-1 pr-3">Store</th>
                    <th className="py-1 pr-3">Figure</th>
                    <th className="py-1 text-right">Number</th>
                  </tr>
                </thead>
                <tbody>
                  {store.entries.map((e) => (
                    <tr
                      key={`${e.weekEnding}-${e.platform}-${e.metric}`}
                      className="border-t border-border/60"
                    >
                      <td className="py-1 pr-3">{e.weekEnding}</td>
                      <td className="py-1 pr-3">
                        {e.platform === 'ios' ? 'App Store' : 'Google Play'}
                      </td>
                      <td className="py-1 pr-3">{METRIC_LABEL[e.metric]}</td>
                      <td className="py-1 text-right tabular-nums">{fmt(e.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What these numbers mean</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Registered users</strong> are accounts. Someone who
            signs in with a phone number and later with Google becomes two accounts, so this can be
            slightly higher than the number of people.
          </p>
          <p>
            <strong className="text-foreground">Counts are live.</strong> When someone deletes their
            account their rows go, so earlier days can shrink a little.
          </p>
          <p>
            <strong className="text-foreground">Website visits</strong> include anyone who opens the
            link, including link previews and bots. They are a rough signal, not downloads.
          </p>
          <p>
            <strong className="text-foreground">Not measured yet:</strong> first app opens, daily
            and monthly active users, retention, platform and app version, Care searches and views.
            These need the mobile tracking release.
          </p>
        </CardContent>
      </Card>
    </>
  );
}

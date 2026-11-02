// Download landing page. KINRO is mobile-first: this page is where the website
// sends people to get the app. Store links live in src/lib/app-links.ts and are
// null until the app is published — this page never invents a store URL.

import { ArrowRight, Download, Smartphone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { QrSlot } from '@/components/custom/qr-slot';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { appLinks, safeStoreUrl } from '@/lib/app-links';

export const metadata: Metadata = {
  title: 'Download the KINRO app',
  description: 'KINRO is built for your phone. Get the app for iOS and Android.',
  alternates: { canonical: '/download' },
};

const platforms = [
  { key: 'ios', name: 'iPhone & iPad', store: 'App Store', url: safeStoreUrl(appLinks.ios) },
  {
    key: 'android',
    name: 'Android',
    store: 'Google Play',
    url: safeStoreUrl(appLinks.android),
  },
] as const;

export default function DownloadPage() {
  const anyAvailable = platforms.some((platform) => platform.url);

  return (
    <main className="overflow-hidden">
      <section className="border-b border-border bg-gradient-to-br from-brand-100/70 via-background to-background">
        <div className="container-page py-16 md:py-24">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-6 gap-2 rounded-full border-brand-300 bg-background/70 px-3 py-1 text-brand-700"
            >
              <Smartphone className="size-3.5" aria-hidden="true" />
              Mobile-first
            </Badge>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              KINRO is built
              <span className="block text-brand-700">for your phone.</span>
            </h1>
            <p className="mt-6 max-w-xl text-body-lg text-muted-foreground">
              Health records, nearby dogs and trusted connections, in one app.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {platforms.map((platform) => (
            <Card key={platform.key} className="border-border">
              <CardContent className="flex h-full flex-col gap-5 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Smartphone className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold">{platform.name}</h2>
                    <p className="text-sm text-muted-foreground">{platform.store}</p>
                  </div>
                </div>
                {platform.url ? (
                  <Button asChild size="lg" className="mt-auto h-12 rounded-full px-6">
                    <a href={platform.url} target="_blank" rel="noopener noreferrer">
                      <Download className="size-4" aria-hidden="true" />
                      Get KINRO on {platform.store}
                    </a>
                  </Button>
                ) : (
                  <p className="mt-auto rounded-lg bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
                    Not published yet. The {platform.store} link will appear here as soon as the app
                    is available.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="section border-t border-border bg-muted/40">
        <div className="container-page grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
          <QrSlot />
          <div className="max-w-xl">
            <h2 className="font-display text-h4">On a computer?</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {appLinks.qrImage
                ? 'Scan the code with your phone camera to open this page and get the app.'
                : 'A QR code will appear here once the app is published. Until then, explore KINRO on the web.'}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline" className="h-11 rounded-full px-5">
                <Link href="/discover">
                  Browse dogs <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="h-11 rounded-full px-5">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {!anyAvailable ? (
        <section className="section border-t border-border">
          <div className="container-page">
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              KINRO is being prepared for iOS and Android. A store link appears here only once it is
              live.
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}

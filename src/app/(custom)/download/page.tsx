// Download landing page. KINRO is mobile-first: this page is where the website
// sends people to get the app. Store links live in src/lib/app-links.ts and are
// null until the app is published. Unpublished platforms are not shown at all.
// Each platform card also shows a QR code (desktop only) that opens the same
// download link on a phone, via the stable /get/ios and /get/android routes.

import { ArrowRight, Download, Smartphone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StoreQr, stores } from '@/components/custom/store-qrs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { appLinks, safeStoreUrl } from '@/lib/app-links';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Download the KINRO app',
  description: 'KINRO is built for your phone. Get the app for iOS and Android.',
  alternates: { canonical: '/download' },
};

export default function DownloadPage() {
  const platforms = stores.map((platform) => ({
    ...platform,
    url: safeStoreUrl(appLinks[platform.key]),
  }));
  const available = platforms.filter((platform) => platform.url);
  const anyAvailable = available.length > 0;

  return (
    <main className="overflow-hidden">
      <section className="border-b border-border bg-gradient-to-br from-brand-100/70 via-background to-background">
        <div className="container-page py-14 md:py-20">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-6 gap-2 rounded-full border-brand-300 bg-background/70 px-3 py-1 text-brand-700"
            >
              <Smartphone className="size-3.5" aria-hidden="true" />
              Mobile-first
            </Badge>
            <h1 className="font-display text-[clamp(2.25rem,5.5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
              KINRO is built
              <span className="block text-brand-700">for your phone.</span>
            </h1>
            <p className="mt-6 max-w-xl text-body-lg text-muted-foreground">
              Your dog’s whole life, in one safe place: health records, a lasting profile and
              trusted connections.
            </p>
          </div>
        </div>
      </section>

      {anyAvailable ? (
        <section className="section">
          <div className="container-page">
            <div className="grid gap-6 md:grid-cols-2">
              {available.map((platform) => (
                <Card key={platform.key} className="border-border">
                  <CardContent className="flex h-full flex-col gap-6 p-6 md:p-8">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                        <Smartphone className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h2 className="font-display text-xl font-semibold">{platform.label}</h2>
                        <p className="text-sm text-muted-foreground">{platform.store}</p>
                      </div>
                    </div>

                    {/* Scan with a phone. Hidden on phones, where you can just tap the button. */}
                    <div className="hidden justify-center rounded-2xl bg-muted/50 py-6 md:flex">
                      <StoreQr platform={platform} origin={siteUrl} size="lg" />
                    </div>

                    <Button asChild size="lg" className="mt-auto h-12 rounded-full px-6">
                      <a href={`/get/${platform.key}?src=web`}>
                        <Download className="size-4" aria-hidden="true" />
                        Get KINRO on {platform.store}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-6 hidden text-center text-sm text-muted-foreground md:block">
              On a computer? Point your phone camera at the code for your phone.
            </p>
          </div>
        </section>
      ) : null}

      <section className="section border-t border-border bg-muted/40">
        <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-h4">Want a look first?</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Browse dogs by breed and city on the web, no account needed.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
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
      </section>
    </main>
  );
}

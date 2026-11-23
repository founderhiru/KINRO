// Messaging paywall switch. No payment provider is connected, so by default
// messaging between matches is free and unlimited and the app shows no
// purchase option. Set PAYWALL_LIVE=true only after a real provider exists
// (see src/lib/payments/provider.ts).
import 'server-only';

export function isPaywallLive(): boolean {
  return process.env.PAYWALL_LIVE === 'true';
}

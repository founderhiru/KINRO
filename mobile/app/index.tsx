import { getSetCookie, storageAdapter } from "@better-auth/expo/client";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { SplashView } from "@/components/SplashView";
import { SESSION_COOKIE_STORAGE_KEY, useSession } from "@/lib/auth-client";
import {
  ROUTES,
  resolveInitialRoute,
  type SessionStatus,
} from "@/lib/session-guard";

/**
 * The KINRO launch screen (photo, logo, headline). While the session is
 * still resolving it shows a spinner; once we know the visitor is signed
 * out, the same screen offers the round arrow that continues to Welcome.
 */
function LoadingSplash() {
  return <SplashView />;
}

/**
 * Reads useSession() and redirects once we know whether there's a valid
 * session. Split out from Index below so it never mounts (and so
 * useSession() never fires its underlying /get-session fetch) until any
 * incoming `cookie` param has already been written to storage — otherwise
 * that fetch could race the write and read the stored cookie before it
 * exists.
 */
function SessionRedirect() {
  const { data: session, isPending } = useSession();
  const status: SessionStatus = isPending
    ? "loading"
    : session
      ? "authenticated"
      : "unauthenticated";
  const target = resolveInitialRoute(status);

  if (!target) {
    // Rendered as <SplashView /> directly (not via LoadingSplash) so React keeps
    // the same instance when the signed-out state arrives and the logo
    // animation is not restarted by a remount.
    return <SplashView />;
  }

  // Signed-out visitors see the splash and tap the arrow to continue to
  // Welcome (Splash -> Welcome). Signed-in users skip straight to Home.
  if (target === ROUTES.welcome) {
    return <SplashView onContinue={() => router.replace(ROUTES.welcome)} />;
  }

  return <Redirect href={target} />;
}

/**
 * The app's initial route — and the deep-link landing point every
 * mobile sign-in flow's callbackURL/newUserCallbackURL points at ("/",
 * which @better-auth/expo's client resolves to this app's own
 * `<scheme>://` root; see mobile-number.tsx, otp.tsx, email-link.tsx).
 *
 * Google and Mobile OTP finish entirely inside an awaited authClient call
 * (an in-app browser session for Google, a plain fetch for OTP) — for
 * those, @better-auth/expo's client plugin already stores the session
 * cookie itself, and the screens that trigger them explicitly
 * `router.replace("/")` afterward to land here.
 *
 * Email magic-link is different: the user taps the link from OUTSIDE the
 * app (Mail -> a browser), so verification happens on a completely
 * separate HTTP exchange the app's own authClient never sees — nothing
 * would otherwise persist that session. The server's `expo()` plugin
 * (see /src/lib/auth.ts) already appends the resulting session cookie as
 * a `?cookie=` query param on the deep-link redirect for exactly this
 * reason; the missing piece was reading it. This does that: if the app
 * was opened with a `cookie` param, persist it to the same SecureStore
 * key @better-auth/expo's expoClient plugin itself uses (via that
 * plugin's own exported helpers — no separate storage scheme), then let
 * useSession() below pick it up on its normal initial fetch.
 */
export default function Index() {
  const { cookie } = useLocalSearchParams<{ cookie?: string }>();
  const [ready, setReady] = useState(!cookie);

  useEffect(() => {
    if (!cookie) return;
    let active = true;
    (async () => {
      try {
        const storage = storageAdapter(SecureStore);
        const current = await storage.getItemAsync(SESSION_COOKIE_STORAGE_KEY);
        const merged = getSetCookie(cookie, current ?? undefined);
        await storage.setItemAsync(SESSION_COOKIE_STORAGE_KEY, merged);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [cookie]);

  if (!ready) {
    return <LoadingSplash />;
  }

  return <SessionRedirect />;
}

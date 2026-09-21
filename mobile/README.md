# Kinro Mobile (Phase mobile-M1)

Expo (React Native) foundation + authentication session bridge to the
existing Kinro Next.js/better-auth backend. **M1 scope only** — see
`/canidknot-mobile-implementation-roadmap.md` at the repo root for what
later phases add.

## Setup

```bash
cd mobile
npm install
cp .env.example .env.local   # point EXPO_PUBLIC_API_URL at your backend
npm run ios      # or: npm run android
```

The backend (repo root) must be running with `MOBILE_APP_SCHEME` set to the
same value as this app's `EXPO_PUBLIC_APP_SCHEME` / `app.json` `scheme`
(default on both sides: `canidknot`).

## Authentication architecture

Same better-auth instance as the web app (`/src/lib/auth.ts`) — no second
auth system, no JWT. The only thing that differs on mobile is **session
transport**:

- **Web:** the browser stores the session cookie and sends it automatically.
- **Mobile:** `@better-auth/expo`'s `expoClient` plugin (see
  `src/lib/auth-client.ts`) intercepts the `Set-Cookie` response header from
  every request made *through* `authClient` and writes it into
  **`expo-secure-store`** — iOS Keychain / Android Keystore-backed encrypted
  storage. It is never written to `AsyncStorage` or a plain file.
- That stored cookie is re-attached automatically to further `authClient`
  requests (sign-in, `useSession()`, sign-out).
- For our own `/api/*` calls that do **not** go through `authClient`
  (dog/health/discovery endpoints in later phases), `src/lib/api-client.ts`
  fetches the stored cookie via `authClient.getCookie()` and attaches it as
  a plain `Cookie` header.
- **Refresh:** unchanged from the web app — better-auth re-validates the
  session against the `Session` row in Postgres on every request
  (`cookieCache: { enabled: false }` in `auth.ts`), and rolls the expiry
  forward at most once/day (`updateAge`). Nothing mobile-specific to
  refresh.
- **Logout:** `authClient.signOut()` (see `app/(app)/(tabs)/profile.tsx`)
  calls better-auth's sign-out endpoint, which revokes the `Session` row
  server-side; the Expo plugin then clears the SecureStore-persisted cookie
  on a successful response. `useSession()` picks up the cleared session and
  `(app)/_layout.tsx`'s guard redirects to `/welcome`.

## Mobile OTP — external dependency, not a code gap

The phone-number sign-in screens (`app/(auth)/mobile-number.tsx`,
`app/(auth)/otp.tsx`) call the real, fully-implemented better-auth
phone-number endpoints. They will not deliver a real SMS until the backend's
`SMS_PROVIDER` is configured (see `/src/lib/sms.ts` at the repo root) — in
development the code is logged to the **server** console instead; in
production the sign-in attempt fails until a real vendor is wired in. No
mobile-side change is needed when that happens.

## Scripts

- `npm start` / `npm run ios` / `npm run android` — Expo dev server
- `npm run ios:dev` — start Metro if needed and open the app in the booted
  simulator; `npm run start:dev` / `npm run ios:open` are its two halves
  (see *Running on Xcode 27* above)
- `npm run lint` — Biome (this project's own `biome.json`, independent of
  the root web app's)
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — Vitest, logic-only unit tests (`tests/unit/`) — auth/RN/Expo
  modules are mocked the same way the web app's own tests mock better-auth,
  so these run without a simulator or device.

## Running on Xcode 27 (Device Hub)

Xcode 27 removed `Simulator.app`; its replacement is **Device Hub**
(`DeviceHub.app`, bundle id `com.apple.dt.Devices`). Expo CLI 0.22.28 — the
version Expo SDK 52 pins — only knows about `Simulator.app`, so on Xcode 27
`expo start` (press `i`) and `expo run:ios` stop with
`Can't determine id of Simulator app`.

**What we do about it.** Expo fixed this upstream for SDK 56+
([expo/expo#46757](https://github.com/expo/expo/pull/46757),
[#46809](https://github.com/expo/expo/pull/46809)) but is not backporting to
SDK 52. `patches/@expo+cli+0.22.28.patch` is a small backport of that change,
applied automatically by `patch-package` on every `npm install`
(`postinstall`). It does three things and leaves Xcode 26 behaviour unchanged:

- `SimulatorAppPrerequisite`: accepts Simulator *or* Device Hub.
- `ensureSimulatorAppRunning`: counts either process; if `open -a Simulator`
  fails, opens `devices://device/open?id=<udid>` (or `open -a DeviceHub`).
- `AppleDeviceManager.activateWindowAsync`: raises whichever app exists.

**Daily workflow**

```bash
npm install          # applies the patch; you should see "@expo/cli@0.22.28 ✔"
npm run ios:dev      # starts Metro if needed, then opens the app in the booted simulator
```

`npm run ios:dev` keeps Metro attached in that terminal (reload the app with
Cmd+R in the simulator, stop everything with Ctrl+C). If you prefer to run Metro
yourself: `npm run start:dev` in one terminal, then `npm run ios:open` in another.
Pressing `i` in the Metro terminal also works now, thanks to the patch.

**Red screen "No script URL provided ... unsanitizedScriptURLString = (null)".**
This is a plain React Native debug build (no `expo-dev-client`): at launch it
asks Metro on `localhost:8081` for the JavaScript. The message means **Metro was
not running (or not on port 8081) when the app started**, not that the app is
broken. Start Metro (`npm run start:dev`) and press Cmd+R in the simulator, or
just use `npm run ios:dev`. If port 8081 is taken by another project's Metro,
stop that one first (`lsof -i :8081`).

`ios:open` / `ios:dev` only use `simctl` and Device Hub's `devices://` link and
never need the Simulator app, so they keep working however Apple changes the
simulator UI. They refuse to launch the app when Metro is down and say why.

**Use an iOS 26.x simulator, not iOS 27.** Apps built with the iOS 27 SDK must
adopt the UIKit scene lifecycle, and Expo has no supported way to do that on
SDK 52 (tracked in [expo/expo#46664](https://github.com/expo/expo/issues/46664)).
Pick an iOS 26.x device (for example *iPhone 17 Pro, iOS 26.5*) in Device Hub.

**Never run `npx expo@latest ...` in this project.** It downloads a CLI for a
newer SDK and Metro then fails with
`Failed to replace react-native/Libraries/Utilities/HMRClient.js`. Always use
the project's own CLI (`npx expo ...` or the npm scripts above).

**Removing the patch.** When the project moves to Expo SDK 56 or newer, delete
`patches/@expo+cli+0.22.28.patch` (and `patch-package` plus the `postinstall`
script if no other patches remain). `patch-package` will warn if `@expo/cli`
changes version while the patch is still present.

## Known limitations (M1)

- No app icon/splash image assets yet — Expo's defaults are used.
- Welcome screen is typography-only; hero photography is a design asset
  gap, not a code gap.
- Web target (`expo start --web`) is not supported — `expo-secure-store`
  has no web implementation, and M1's scope is iOS + Android only, per the
  project brief.
- Full `expo-doctor` / real bundling could not be validated in the sandbox
  this was built in (no iOS/Android toolchain or simulator available there)
  — `tsc`, Biome, and Vitest were run directly and are the source of truth
  for this phase's validation.

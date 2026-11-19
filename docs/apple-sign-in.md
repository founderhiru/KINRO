# Sign in with Apple

The code for Sign in with Apple is in place (iOS app and server) but switched
off, because it needs things only you can set up with Apple. Nothing is shown
in the app until every step below is done. Google and email keep working
either way.

Apple's App Store rule 4.8 requires Sign in with Apple whenever an iOS app
offers another third-party sign-in such as Google, so this needs to be on
before the app is submitted to the App Store.

## What you do (about 20 minutes)

1. **Apple Developer account** (paid programme). In
   [Certificates, Identifiers & Profiles → Identifiers](https://developer.apple.com/account/resources/identifiers/list),
   open the App ID `com.canidknot.app`, tick **Sign in with Apple**, Save.
   (If the identifier does not exist yet, EAS creates it on the first iOS
   build; tick the capability after that.)
2. **Server**: on Render, set
   `APPLE_APP_BUNDLE_IDENTIFIER=com.canidknot.app` and redeploy. This registers
   the Apple provider. Leave it unset and Apple stays off.
3. **App build**: add `EXPO_PUBLIC_APPLE_SIGN_IN=true` to the `env` of the
   build profile in `mobile/eas.json`, then make a new iOS build
   (`eas build --platform ios`). It is a native change (new module and the
   `usesAppleSignIn` entitlement), so it cannot ship as an over-the-air update.
4. **Test on a real iPhone** with a TestFlight or development build. It does
   not work in Expo Go or the simulator without an Apple ID signed in.

## How it works

The Apple button opens Apple's own sheet. Apple returns a signed identity
token; the app sends it to our server, which checks it against Apple's public
keys with our bundle identifier as the expected audience, then creates or finds
the account (linked by verified email, like Google) and starts the session.
No Apple client secret is needed for this native flow.

Apple shares the person's name only the first time they sign in, and may give a
private relay email (`...@privaterelay.appleid.com`). Both are normal.

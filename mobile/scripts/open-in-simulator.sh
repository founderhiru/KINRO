#!/usr/bin/env bash
# Opens the KINRO development build in a booted iOS simulator and points it at
# the running Metro server. Works with both Simulator.app (Xcode 26 and earlier)
# and Device Hub (Xcode 27+), because it only uses `simctl` and the devices://
# URL scheme — it never needs the Simulator app itself.
#
#   npm run ios:open                # uses the first booted simulator
#   npm run ios:open -- <UDID>      # or a specific one (xcrun simctl list devices)
#
# Start Metro first, in another terminal:   npx expo start --dev-client --localhost
set -euo pipefail

BUNDLE_ID="${KINRO_BUNDLE_ID:-com.canidknot.app}"   # app.json -> expo.ios.bundleIdentifier
SCHEME="${KINRO_SCHEME:-com.canidknot.app}"          # dev-client deep link scheme
METRO_URL="${KINRO_METRO_URL:-http://127.0.0.1:8081}"

UDID="${1:-}"
if [[ -z "$UDID" ]]; then
  UDID="$(xcrun simctl list devices booted | grep -Eo '[0-9A-Fa-f]{8}(-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}' | head -n 1 || true)"
fi
if [[ -z "$UDID" ]]; then
  echo "No booted simulator found. Boot one first, for example:" >&2
  echo "  xcrun simctl list devices available | grep 'iOS 26'" >&2
  echo "  xcrun simctl boot <UDID>" >&2
  exit 1
fi

# Bring the device to the front. Best effort: the app can run without a window.
if [[ "$(uname)" == "Darwin" ]]; then
  if open "devices://device/open?id=${UDID}" 2>/dev/null; then
    :  # Xcode 27+: Device Hub
  else
    open -a Simulator --args -CurrentDeviceUDID "$UDID" 2>/dev/null || true  # Xcode 26 and earlier
  fi
fi

# URL-encode the Metro address for the dev-client link.
ENCODED_URL="$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$METRO_URL")"

xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl openurl "$UDID" "${SCHEME}://expo-development-client/?url=${ENCODED_URL}"
echo "Opened ${BUNDLE_ID} on ${UDID}, connected to ${METRO_URL}"

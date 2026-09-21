#!/usr/bin/env bash
# Opens the KINRO debug build in a booted iOS simulator, with Metro running.
# Works with both Simulator.app (Xcode 26 and earlier) and Device Hub (Xcode 27+),
# because it only uses `simctl` and the devices:// URL scheme.
#
#   npm run ios:dev                   # start Metro if needed, then open the app  <- normal use
#   npm run ios:open                  # open the app; Metro must already be running
#   npm run ios:dev -- <UDID>         # a specific simulator (xcrun simctl list devices)
#
# WHY METRO MUST BE RUNNING: this is a plain React Native debug build (no
# expo-dev-client). At launch it asks Metro on localhost:8081 for the JavaScript
# bundle. If Metro is not reachable the app shows the red screen
# "No script URL provided ... unsanitizedScriptURLString = (null)".
set -euo pipefail

BUNDLE_ID="${KINRO_BUNDLE_ID:-com.canidknot.app}"   # app.json -> expo.ios.bundleIdentifier
METRO_URL="${KINRO_METRO_URL:-http://127.0.0.1:8081}"
METRO_LOG="${TMPDIR:-/tmp}/kinro-metro.log"

START_METRO=0
UDID=""
for arg in "$@"; do
  case "$arg" in
    --start-metro) START_METRO=1 ;;
    *) UDID="$arg" ;;
  esac
done

metro_running() {
  curl -fsS --max-time 2 "${METRO_URL}/status" 2>/dev/null | grep -q "packager-status:running"
}

METRO_PID=""
cleanup() {
  if [[ -n "$METRO_PID" ]]; then kill "$METRO_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT INT TERM

PORT="${METRO_URL##*:}"; PORT="${PORT%%/*}"
if [[ "$PORT" != "8081" ]]; then
  echo "Warning: the app looks for Metro on port 8081 by default; ${PORT} will not be found." >&2
fi

if ! metro_running; then
  if [[ "$START_METRO" == "1" ]]; then
    echo "Starting Metro on port ${PORT} (log: ${METRO_LOG}) ..."
    # shellcheck disable=SC2086
    ${KINRO_METRO_CMD:-npx expo start --localhost --non-interactive} --port "$PORT" >"$METRO_LOG" 2>&1 &
    METRO_PID=$!
    waited=0
    until metro_running; do
      waited=$((waited + 1))
      if [[ "$waited" -gt 90 ]] || ! kill -0 "$METRO_PID" 2>/dev/null; then
        echo "Metro did not start. Last lines of ${METRO_LOG}:" >&2
        tail -n 15 "$METRO_LOG" >&2 || true
        echo "If port ${PORT} is busy, stop the other Metro first:  lsof -i :${PORT}" >&2
        exit 1
      fi
      sleep 1
    done
  else
    echo "Metro is not running at ${METRO_URL}, so the app would show \"No script URL provided\"." >&2
    echo "Start it in another terminal:   npm run start:dev" >&2
    echo "or let this script do it:       npm run ios:dev" >&2
    exit 1
  fi
fi
echo "Metro is running at ${METRO_URL}."

if [[ -z "$UDID" ]]; then
  UDID="$(xcrun simctl list devices booted | grep -Eo '[0-9A-Fa-f]{8}(-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}' | head -n 1 || true)"
fi
if [[ -z "$UDID" ]]; then
  echo "No booted simulator found. Boot an iOS 26.x one first, for example:" >&2
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

xcrun simctl terminate "$UDID" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl launch "$UDID" "$BUNDLE_ID"
echo "Launched ${BUNDLE_ID} on ${UDID}."

if [[ -n "$METRO_PID" ]]; then
  echo "Metro is running for you. Reload the app with Cmd+R in the simulator. Press Ctrl+C here to stop Metro."
  wait "$METRO_PID" || true
fi

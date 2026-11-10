#!/usr/bin/env bash
# Deploys the latest GitHub build into ONE fixed folder without building on the server.
# The new build is unpacked next to the live one and swapped in with a rename, so the running
# app is never half-overwritten. Only one backup (<app>.prev) is kept for quick rollback.
#
#   APP_DIR    target folder        (default: $HOME/onlinescore)
#   PM2_NAME   if set, runs `pm2 reload $PM2_NAME` after the swap
#   RELEASE_URL  override the build tarball URL (default: GitHub "latest" release)
#
# Rollback: mv "$APP_DIR" "$APP_DIR.bad" && mv "$APP_DIR.prev" "$APP_DIR" && restart the app.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/onlinescore}"
URL="${RELEASE_URL:-https://github.com/keanu-stitch8/djarumbadminton-onlinescore/releases/download/latest/onlinescore-standalone.tar.gz}"
NEW="$APP_DIR.new"
PREV="$APP_DIR.prev"
TARBALL="$(mktemp)"
trap 'rm -f "$TARBALL"' EXIT

echo "Downloading latest build..."
curl -fL --retry 3 -o "$TARBALL" "$URL"

rm -rf "$NEW"
mkdir -p "$NEW"
tar -xzf "$TARBALL" -C "$NEW"
[ -f "$NEW/server.js" ] || { echo "server.js missing from build, aborting (live app untouched)"; rm -rf "$NEW"; exit 1; }

rm -rf "$PREV"
[ -d "$APP_DIR" ] && mv "$APP_DIR" "$PREV"
mv "$NEW" "$APP_DIR"
echo "Deployed revision $(cat "$APP_DIR/REVISION" 2>/dev/null || echo unknown) to $APP_DIR"

if [ -n "${PM2_NAME:-}" ]; then
  pm2 reload "$PM2_NAME"
else
  echo "Restart the app to load the new build, e.g.: pm2 reload <name>"
  echo "Start command: cd $APP_DIR && PORT=3006 HOSTNAME=0.0.0.0 node server.js"
fi

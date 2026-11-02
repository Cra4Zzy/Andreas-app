#!/usr/bin/env bash
# Creates a signed iOS archive for TestFlight preparation on an authorized Mac.
# Upload is deliberately performed by the app owner in Xcode Organizer.
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "A Mac with Xcode is required for signed TestFlight archives." >&2
  exit 1
fi
: "${APPLE_TEAM_ID:?Set APPLE_TEAM_ID to the customer's Apple Developer Team ID (do not commit credentials).}"
command -v xcodebuild >/dev/null
xcode_version="$(xcodebuild -version | awk '/^Xcode / { print $2 }')"
xcode_major="${xcode_version%%.*}"
if [[ ! "$xcode_major" =~ ^[0-9]+$ ]] || (( xcode_major < 26 )); then
  echo "Xcode 26 or newer is required. Found: $xcode_version" >&2
  exit 1
fi

node scripts/check-mobile-release-id.cjs
npm ci
npm test
npm run native:sync

mkdir -p build/testflight
xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -archivePath "$PWD/build/testflight/Abbate-Lernraum.xcarchive" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  archive

echo "Signed archive prepared at build/testflight/Abbate-Lernraum.xcarchive"
echo "In Xcode: Window > Organizer > Archives > Distribute App > App Store Connect > Upload."
echo "An Apple Developer team, registered Bundle ID, valid signing, App Store Connect app record, and approval are required."

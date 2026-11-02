'use strict';
// Release gate: the configured Android/iOS identities must match and must not
// be temporary preview identifiers. This is intentionally read-only.
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
const gradle = fs.readFileSync('android/app/build.gradle', 'utf8');
const xcode = fs.readFileSync('ios/App/App.xcodeproj/project.pbxproj', 'utf8');
const androidIds = [...gradle.matchAll(/applicationId\\s+["']([^"']+)["']/g)].map(m => m[1]);
const iosIds = [...xcode.matchAll(/PRODUCT_BUNDLE_IDENTIFIER\\s*=\\s*([^;\\s]+)\\s*;/g)].map(m => m[1].replaceAll('"', ''));
const id = config.appId;
const valid = /^[a-z][a-z0-9]*(?:\\.[a-z][a-z0-9]*){2,}$/i.test(id);
if (!valid || /(?:^|\\.)preview(?:\\.|$)/i.test(id) ||
    androidIds.length !== 1 || androidIds[0] !== id ||
    iosIds.length === 0 || iosIds.some(v => v !== id)) {
  console.error('Store release blocked: use one confirmed, non-preview app ID across Capacitor, Android applicationId and iOS PRODUCT_BUNDLE_IDENTIFIER.');
  console.error(JSON.stringify({ capacitor: id, android: androidIds, ios: iosIds }));
  process.exit(1);
}
console.log('Store app identifier validated:', id);

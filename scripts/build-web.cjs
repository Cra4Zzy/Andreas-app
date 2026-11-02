'use strict';
const { build } = require('esbuild');
const { copyFileSync, mkdirSync } = require('node:fs');
const { dirname, join } = require('node:path');
async function main() {
  mkdirSync('dist/vendor', { recursive: true });
  await build({ entryPoints: [require.resolve('qrcode/lib/browser.js')], bundle: true,
    platform: 'browser', format: 'iife', globalName: 'AbbateQR', minify: true,
    outfile: 'dist/vendor/qrcode.js', legalComments: 'linked' });
  copyFileSync(join(dirname(require.resolve('qrcode/package.json')), 'license'), 'dist/vendor/qrcode-LICENSE.txt');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

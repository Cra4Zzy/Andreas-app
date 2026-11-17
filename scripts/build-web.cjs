'use strict';
const { build } = require('esbuild');
const { copyFileSync, mkdirSync, mkdtempSync, rmSync, cpSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const { tmpdir } = require('node:os');
const { dirname, join } = require('node:path');
// Fetch the pinned browser distribution during build, never at runtime.
function buildPdfPreview(){
  const temp=mkdtempSync(join(tmpdir(),'abbate-pdfjs-'));
  try{
    const args=['pack','pdfjs-dist@5.4.624','--ignore-scripts','--json','--pack-destination',temp];
    const output=process.env.npm_execpath
      ?execFileSync(process.execPath,[process.env.npm_execpath,...args],{encoding:'utf8'})
      :execFileSync(process.platform==='win32'?'npm.cmd':'npm',args,{encoding:'utf8',shell:process.platform==='win32'});
    const pkg=JSON.parse(output)[0];
    if(pkg.version!=='5.4.624'||!pkg.integrity||pkg.filename!=='pdfjs-dist-5.4.624.tgz')throw Error('Unexpected PDF.js package');
    execFileSync('tar',['-xzf',join(temp,pkg.filename),'-C',temp]);
    const root=join(temp,'package'),dest='dist/vendor/pdfjs';
    mkdirSync(dest,{recursive:true});
    for(const file of ['pdf.min.mjs','pdf.worker.min.mjs'])copyFileSync(join(root,'legacy/build',file),join(dest,file));
    for(const dir of ['standard_fonts','wasm'])cpSync(join(root,dir),join(dest,dir),{recursive:true});
    copyFileSync(join(root,'LICENSE'),join(dest,'LICENSE'));
  }finally{rmSync(temp,{recursive:true,force:true});}
}
async function main() {
  buildPdfPreview();
  mkdirSync('dist/vendor', { recursive: true });
  await build({ entryPoints: [require.resolve('qrcode/lib/browser.js')], bundle: true,
    platform: 'browser', format: 'iife', globalName: 'AbbateQR', minify: true,
    outfile: 'dist/vendor/qrcode.js', legalComments: 'linked' });
  await build({ entryPoints: ['@supabase/supabase-js'], bundle: true, platform: 'browser', format: 'iife', globalName: 'AbbateSupabase', minify: true, outfile: 'dist/vendor/supabase.js', legalComments: 'linked' });
  copyFileSync(join(dirname(dirname(require.resolve('@supabase/supabase-js'))), 'LICENSE'), 'dist/vendor/supabase-LICENSE.txt');
  copyFileSync(join(dirname(require.resolve('qrcode/package.json')), 'license'), 'dist/vendor/qrcode-LICENSE.txt');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

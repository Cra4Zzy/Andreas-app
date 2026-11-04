'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {buildManifest}=require('../scripts/make-desktop-update-feed.cjs');
const source=fs.readFileSync(path.join(__dirname,'../src-tauri/src/main.rs'),'utf8');
const config=JSON.parse(fs.readFileSync(path.join(__dirname,'../src-tauri/tauri.stable.conf.json'),'utf8'));
const cargo=fs.readFileSync(path.join(__dirname,'../src-tauri/Cargo.toml'),'utf8');
const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/desktop-updates.yml'),'utf8');

test('stable builds require a real key, immutable channel and opt-in feature',()=>{
  assert.equal(config.bundle.createUpdaterArtifacts,true);
  assert.match(config.version,/^\d+\.\d+\.\d+$/);
  assert.equal(config.build.frontendDist,'https://app.gabelstaplerfahrschule-andreas.de/dist/');
  const caps=JSON.parse(fs.readFileSync(path.join(__dirname,'../src-tauri/capabilities/default.json'),'utf8'));
  assert.equal(caps.remote,undefined,'The remotely hosted frontend must never receive local Tauri IPC capabilities');
  assert.match(cargo,/desktop-auto-update = \["dep:tauri-plugin-updater"\]/);
  assert.match(source,/env!\("ABBATE_UPDATER_PUBLIC_KEY"\)/);
  assert.match(source,/desktop-update-feed\/latest\.json/);
  assert.match(source,/download_and_install/);
  assert.match(source,/darwin-universal/);
  assert.match(workflow,/workflow_dispatch:/);
  assert.match(workflow,/TAURI_SIGNING_PRIVATE_KEY/);
  assert.match(workflow,/APPLE_CERTIFICATE/);
  assert.doesNotMatch(workflow,/on:\s*\n\s*push:/);
});

test('release manifest references versioned assets and their original signatures',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'abbate-feed-'));
  try{
    for(const f of ['Abbate-Lernraum-Windows-Setup.exe','Abbate-Lernraum-macOS-Universal.app.tar.gz']){
      fs.writeFileSync(path.join(dir,f),'binary fixture');
      fs.writeFileSync(path.join(dir,f+'.sig'),'A'.repeat(96));
    }
    const manifest=buildManifest({version:'0.2.0',assetDirectory:dir});
    assert.equal(manifest.version,'0.2.0');
    assert.match(manifest.platforms['windows-x86_64'].url,/desktop-v0\.2\.0\/Abbate-Lernraum-Windows-Setup\.exe$/);
    assert.match(manifest.platforms['darwin-universal'].url,/desktop-v0\.2\.0\/Abbate-Lernraum-macOS-Universal\.app\.tar\.gz$/);
    assert.equal(manifest.platforms['windows-x86_64'].signature,'A'.repeat(96));
    assert.throws(()=>buildManifest({version:'0.2.0-beta.1',assetDirectory:dir}),/SemVer/);
    fs.unlinkSync(path.join(dir,'Abbate-Lernraum-Windows-Setup.exe.sig'));
    assert.throws(()=>buildManifest({version:'0.2.0',assetDirectory:dir}),/ENOENT/);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

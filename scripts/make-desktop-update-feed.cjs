'use strict';
// Build a Tauri v2 static update feed only from verified, signed release assets.
// GitHub Actions uploads each binary under an immutable versioned release tag;
// updating the tiny desktop-update-feed/latest.json file is the final step.
const fs=require('node:fs');
const path=require('node:path');

function readSignature(file) {
  const signature=fs.readFileSync(file,'utf8').trim();
  if(!/^[A-Za-z0-9+/=]{60,}$/.test(signature))throw Error('Invalid Tauri update signature: '+file);
  return signature;
}
function buildManifest({version,repo='Cra4Zzy/Andreas-app',assetDirectory='release',notes='Abbate Lernraum – neue Version'}) {
  if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Release version must be SemVer (x.y.z)');
  if(!/^[\w.-]+\/[\w.-]+$/.test(repo))throw Error('Invalid GitHub repository');
  const assets={
    windows:'Abbate-Lernraum-Windows-Setup.exe',
    mac:'Abbate-Lernraum-macOS-Universal.app.tar.gz'
  };
  const base='https://github.com/'+repo+'/releases/download/desktop-v'+version+'/';
  const platforms={};
  for(const [platform,file] of [
    ['windows-x86_64',assets.windows],
    ['darwin-universal',assets.mac]
  ]) {
    const full=path.join(assetDirectory,file);
    if(!fs.statSync(full).isFile()||fs.statSync(full).size===0)throw Error('Empty update package: '+full);
    platforms[platform]={url:base+file,signature:readSignature(full+'.sig')};
  }
  return {version,notes,platforms};
}
function main(){
  const cfg=JSON.parse(fs.readFileSync('src-tauri/tauri.stable.conf.json','utf8'));
  const version=cfg.version;
  const repo=process.env.GH_REPO||'Cra4Zzy/Andreas-app';
  const manifest=buildManifest({version,repo});
  // Installer and tarball signatures have to match this exact release version.
  if(!fs.existsSync('release/Abbate-Lernraum-macOS-Universal.dmg'))throw Error('Mac installer missing');
  fs.writeFileSync('release/latest.json',JSON.stringify(manifest,null,2)+'\n');
  process.stdout.write('Update feed generated for '+version+' ('+Object.keys(manifest.platforms).join(', ')+')\n');
}
if(require.main===module)main();
module.exports={buildManifest,readSignature};

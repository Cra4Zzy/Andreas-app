'use strict';
// Generate a Tauri v2 updater config at BUILD time, without committing keys.
// The public verification key is safe to ship; the private signing key is never read.
const fs=require('node:fs');
const path=require('node:path');

const ENDPOINT='https://github.com/Cra4Zzy/Andreas-app/releases/download/desktop-update-feed/latest.json';
const SOURCE=path.join(__dirname,'..','src-tauri','tauri.stable.conf.json');
const OUTPUT=path.join(__dirname,'..','src-tauri','tauri.stable.generated.conf.json');

function prepare(config, publicKey) {
  const key=typeof publicKey==='string'?publicKey.trim():'';
  if(key.length<40||/[\0]/.test(key))
    throw new Error('ABBATE_UPDATER_PUBLIC_KEY is missing or invalid. Set the public .pub file in GitHub Actions Variables.');
  if(config?.bundle?.createUpdaterArtifacts!==true)
    throw new Error('Signed desktop release must enable bundle.createUpdaterArtifacts');
  if(config.version!=='0.2.0'&&!/^\d+\.\d+\.\d+$/.test(config.version))
    throw new Error('Invalid desktop release version');
  return {...config,plugins:{...config.plugins,updater:{
    pubkey:key,
    endpoints:[ENDPOINT],
    windows:{installMode:'passive'}
  }}};
}

function main(){
  const config=JSON.parse(fs.readFileSync(SOURCE,'utf8'));
  const ready=prepare(config,process.env.ABBATE_UPDATER_PUBLIC_KEY);
  fs.writeFileSync(OUTPUT,JSON.stringify(ready,null,2)+'\n',{mode:0o600});
  console.log('Signed Tauri updater configuration prepared for version '+ready.version+' (public key and endpoint set).');
}
if(require.main===module)main();
module.exports={prepare,ENDPOINT};

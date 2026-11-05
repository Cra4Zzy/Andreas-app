'use strict';
// Shared, public login QR for printed Abbate student cards.
// No account identifiers, session tokens or environment-dependent URLs.
(() => {
  const target='https://app.gabelstaplerfahrschule-andreas.de/dist/konto.html';
  const options=Object.freeze({errorCorrectionLevel:'Q',margin:4,color:{dark:'#000000',light:'#ffffff'}});
  const previewWidth=240, printWidth=2048;

  function encoder() {
    if(!globalThis.AbbateQR||typeof globalThis.AbbateQR.toCanvas!=='function')
      throw new Error('QR-Code-Bibliothek nicht geladen.');
    return globalThis.AbbateQR;
  }
  function saveFile(href,name){
    const link=document.createElement('a');
    link.href=href;
    link.download=name;
    link.style.display='none';
    document.body.appendChild(link);
    try {link.click();} finally {link.remove();}
  }
  function saveBlob(blob,name){
    const url=URL.createObjectURL(blob);
    try {saveFile(url,name);}
    finally {setTimeout(()=>URL.revokeObjectURL(url),60000);}
  }
  async function render(canvas){
    if(!canvas)throw new Error('QR-Code-Vorschau fehlt.');
    await encoder().toCanvas(canvas,target,{...options,width:previewWidth});
    return canvas;
  }
  async function downloadPng(){
    // Never download the 240px preview: render a fresh, high-resolution QR.
    const canvas=document.createElement('canvas');
    await encoder().toCanvas(canvas,target,{...options,width:printWidth});
    if(canvas.width!==printWidth||canvas.height!==printWidth)
      throw new Error('QR-Code wurde nicht in voller Auflösung erstellt.');
    if(typeof canvas.toBlob==='function'){
      const blob=await new Promise((resolve,reject)=>
        canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG konnte nicht erzeugt werden.')),'image/png'));
      saveBlob(blob,'abbate-karten-qr-2048px.png');
    }else{
      saveFile(canvas.toDataURL('image/png'),'abbate-karten-qr-2048px.png');
    }
  }
  async function downloadSvg(){
    const qr=encoder();
    if(typeof qr.toString!=='function')throw new Error('Vektor-QR-Code wird nicht unterstützt.');
    const svg=await qr.toString(target,{...options,type:'svg',width:1024});
    if(!/^<svg[\s>]/.test(svg))throw new Error('Vektor-QR-Code konnte nicht erzeugt werden.');
    saveBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),'abbate-karten-qr-druck.svg');
  }
  globalThis.AbbateCardQR=Object.freeze({target,previewWidth,printWidth,render,downloadPng,downloadSvg});
})();

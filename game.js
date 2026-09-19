(()=>{'use strict';
const current=document.currentScript;
const fallbackVersion=(()=>{try{return new URL(current&&current.src||location.href).searchParams.get('v')||'dev';}catch{return'dev';}})();
function appendScript(src,onload,onerror){
 const script=document.createElement('script');
 script.src=src;
 script.async=false;
 script.onload=onload||null;
 script.onerror=onerror||null;
 document.body.appendChild(script);
 return script;
}
function loadRuntime(version){
 const v=encodeURIComponent(version||fallbackVersion);
 const startRuntime=()=>appendScript(`src/game-runtime.js?v=${v}`,null,()=>{
  const message=document.querySelector('#loadMsg');
  if(message)message.textContent='Lỗi tải GAME runtime';
  console.error('[Bootstrap] Không tải được src/game-runtime.js');
 });
 appendScript(`src/npc-identity-system.js?v=${v}`,startRuntime,()=>{
  console.warn('[Bootstrap] Không tải được NPC Identity System, tiếp tục runtime gốc');
  startRuntime();
 });
}
fetch(`build.json?t=${Date.now()}`,{cache:'no-store'})
 .then(r=>r.ok?r.json():Promise.reject(new Error('build.json '+r.status)))
 .then(meta=>loadRuntime(meta&&meta.buildVersion||fallbackVersion))
 .catch(error=>{console.warn('[Bootstrap] Dùng runtime version fallback',error);loadRuntime(fallbackVersion);});
})();

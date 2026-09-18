(()=>{'use strict';
const current=document.currentScript;
const fallbackVersion=(()=>{try{return new URL(current&&current.src||location.href).searchParams.get('v')||'dev';}catch{return'dev';}})();
function loadRuntime(version){
 const script=document.createElement('script');
 script.src=`src/game-runtime.js?v=${encodeURIComponent(version||fallbackVersion)}`;
 script.async=false;
 script.onerror=()=>{
  const message=document.querySelector('#loadMsg');
  if(message)message.textContent='Lỗi tải GAME runtime';
  console.error('[Bootstrap] Không tải được src/game-runtime.js');
 };
 document.body.appendChild(script);
}
fetch(`build.json?t=${Date.now()}`,{cache:'no-store'})
 .then(r=>r.ok?r.json():Promise.reject(new Error('build.json '+r.status)))
 .then(meta=>loadRuntime(meta&&meta.buildVersion||fallbackVersion))
 .catch(error=>{console.warn('[Bootstrap] Dùng runtime version fallback',error);loadRuntime(fallbackVersion);});
})();

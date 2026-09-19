(()=>{'use strict';
const current=document.currentScript;
const fallbackVersion=(()=>{try{return new URL(current&&current.src||location.href).searchParams.get('v')||'dev';}catch{return'dev';}})();
function appendScript(src,onload,onerror){const script=document.createElement('script');script.src=src;script.async=false;script.onload=onload||null;script.onerror=onerror||null;document.body.appendChild(script);return script;}
function startRuntime(version){const v=encodeURIComponent(version||fallbackVersion);appendScript(`src/game-runtime.js?v=${v}`,null,()=>{const message=document.querySelector('#loadMsg');if(message)message.textContent='Lỗi tải GAME runtime';console.error('[Bootstrap] Không tải được src/game-runtime.js');});}
function loadRuntime(version){const v=encodeURIComponent(version||fallbackVersion);appendScript(`src/runtime/runtime-module-loader.js?v=${v}`,async()=>{try{if(window.RuntimeModuleLoader)await window.RuntimeModuleLoader.load(version);}catch(error){console.warn('[Bootstrap] Module loader lỗi, tiếp tục runtime',error);}startRuntime(version);},()=>{console.warn('[Bootstrap] Không tải được module loader, tiếp tục runtime');startRuntime(version);});}
fetch(`build.json?t=${Date.now()}`,{cache:'no-store'})
 .then(r=>r.ok?r.json():Promise.reject(new Error('build.json '+r.status)))
 .then(meta=>loadRuntime(meta&&meta.buildVersion||fallbackVersion))
 .catch(error=>{console.warn('[Bootstrap] Dùng runtime version fallback',error);loadRuntime(fallbackVersion);});
})();

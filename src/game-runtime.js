(()=>{'use strict';
const current=document.currentScript;
const version=(()=>{try{return new URL(current&&current.src||location.href).searchParams.get('v')||'dev';}catch{return'dev';}})();
function appendScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>resolve(src);s.onerror=()=>reject(new Error('Không tải được '+src));document.body.appendChild(s);});}
async function boot(){
 try{
  await appendScript(`src/runtime/legacy-runtime.js?v=${encodeURIComponent(version)}`);
  window.GameEvents&&window.GameEvents.emit('legacyRuntimeReady',{version});
  if(window.RuntimeCoordinator)window.RuntimeCoordinator.start();
  window.GameEvents&&window.GameEvents.emit('runtimeReady',{version,mode:'modular-with-legacy-compat'});
 }catch(error){
  console.error('[GameRuntime]',error);
  const message=document.querySelector('#loadMsg');
  if(message)message.textContent='Lỗi tải GAME runtime';
 }
}
window.GameRuntime={version,boot};
boot();
})();

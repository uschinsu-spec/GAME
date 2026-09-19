(()=>{'use strict';
let bound=false,unsubs=[],attempts=0,raf=0;
function bindScene(){if(bound)return true;const ctx=window.RuntimeContext&&window.RuntimeContext.discover();if(!ctx||!ctx.scene||!ctx.engine)return false;bound=true;
 if(window.EnemySystem&&ctx.actors)window.EnemySystem.bind(ctx.actors,ctx.boss||null);
 if(window.RuntimeCoordinator){
  unsubs.push(window.RuntimeCoordinator.add('actors','modern-culling',(dt,c)=>{const snap=window.RuntimeContext&&window.RuntimeContext.snapshot();if(!snap||!snap.actors||!window.CullingSystem)return;const viewer=snap.player&&snap.player.position?snap.player.position:snap.player;if(!viewer)return;for(const actor of snap.actors)window.CullingSystem.setActorVisible(actor,viewer,180,70);},90));
  unsubs.push(window.RuntimeCoordinator.add('vfx','modern-projectiles',(dt)=>window.ProjectileSystem&&window.ProjectileSystem.update(dt),10));
  unsubs.push(window.RuntimeCoordinator.add('vfx','modern-vfx',(dt)=>window.VfxRuntime&&window.VfxRuntime.update(dt),20));
  if(!window.RuntimeCoordinator.started)window.RuntimeCoordinator.start();
 }
 window.GameEvents&&window.GameEvents.emit('modernRuntimeBound',{scene:ctx.scene,engine:ctx.engine,actors:(ctx.actors||[]).length,npcs:(ctx.npcs||[]).length});return true;
}
function scheduleBind(){cancelAnimationFrame(raf);attempts=0;const step=()=>{if(bindScene())return;if(++attempts<180)raf=requestAnimationFrame(step);else console.warn('[ModernRuntimeBridge] Scene chưa sẵn sàng sau 180 frame');};raf=requestAnimationFrame(step);}
function dispose(){cancelAnimationFrame(raf);for(const off of unsubs.splice(0)){try{off&&off();}catch(e){}}bound=false;attempts=0;}
window.GameEvents&&window.GameEvents.on('legacyRuntimeReady',scheduleBind);
window.GameEvents&&window.GameEvents.on('runtimeReady',scheduleBind);
window.ModernRuntimeBridge={bind:bindScene,scheduleBind,dispose,get bound(){return bound;}};
})();
(()=>{'use strict';
let bound=false,unsubs=[];
function bindScene(){if(bound)return;const ctx=window.RuntimeContext&&window.RuntimeContext.discover();if(!ctx||!ctx.scene||!ctx.engine)return;bound=true;
 if(window.EnemySystem&&ctx.actors)window.EnemySystem.bind(ctx.actors,ctx.boss||null);
 if(window.RuntimeCoordinator){
  unsubs.push(window.RuntimeCoordinator.add('actors','modern-culling',(dt,c)=>{const snap=window.RuntimeContext&&window.RuntimeContext.snapshot();if(!snap||!snap.actors||!window.CullingSystem)return;const viewer=snap.player&&snap.player.position?snap.player.position:snap.player;if(!viewer)return;for(const actor of snap.actors)window.CullingSystem.setActorVisible(actor,viewer,180,70);},90));
  unsubs.push(window.RuntimeCoordinator.add('vfx','modern-projectiles',(dt)=>window.ProjectileSystem&&window.ProjectileSystem.update(dt),10));
  unsubs.push(window.RuntimeCoordinator.add('vfx','modern-vfx',(dt)=>window.VfxRuntime&&window.VfxRuntime.update(dt),20));
  if(!window.RuntimeCoordinator.started)window.RuntimeCoordinator.start();
 }
 window.GameEvents&&window.GameEvents.emit('modernRuntimeBound',{scene:ctx.scene,engine:ctx.engine,actors:(ctx.actors||[]).length,npcs:(ctx.npcs||[]).length});
}
function dispose(){for(const off of unsubs.splice(0)){try{off&&off();}catch(e){}}bound=false;}
window.GameEvents&&window.GameEvents.on('legacyRuntimeReady',()=>requestAnimationFrame(()=>requestAnimationFrame(bindScene)));
window.GameEvents&&window.GameEvents.on('runtimeReady',()=>requestAnimationFrame(bindScene));
window.ModernRuntimeBridge={bind:bindScene,dispose,get bound(){return bound;}};
})();
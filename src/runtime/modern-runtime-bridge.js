(()=>{'use strict';
let bound=false,unsubs=[],attempts=0,raf=0,sceneObserver=null,boundScene=null,shadowT=0;
function claim(system){return !window.RuntimeOwnership||window.RuntimeOwnership.claim(system,'modern');}
function release(system){if(window.RuntimeOwnership)window.RuntimeOwnership.release(system,'modern');}
function coordinatorTick(ctx){if(!window.RuntimeCoordinator||!ctx||!ctx.engine)return;const dt=Math.min(.05,Math.max(0,(ctx.engine.getDeltaTime?ctx.engine.getDeltaTime():16.67)/1000));window.RuntimeCoordinator.tick(dt,{scene:ctx.scene,engine:ctx.engine,player:ctx.player,actors:ctx.actors,boss:ctx.boss,npcs:ctx.npcs});shadowT+=dt;if(shadowT>=.5){shadowT=0;if(window.MigrationShadow){window.MigrationShadow.sampleEnemyAI(ctx);window.MigrationShadow.sampleAnimation(ctx);}}}
function bindScene(){if(bound)return true;const ctx=window.RuntimeContext&&window.RuntimeContext.discover();if(!ctx||!ctx.scene||!ctx.engine)return false;bound=true;boundScene=ctx.scene;
 if(window.EnemySystem&&ctx.actors)window.EnemySystem.bind(ctx.actors,ctx.boss||null);
 if(window.RuntimeCoordinator){
  if(claim('culling'))unsubs.push(window.RuntimeCoordinator.add('actors','modern-culling',()=>{const snap=window.RuntimeContext&&window.RuntimeContext.snapshot();if(!snap||!snap.actors||!window.CullingSystem)return;const viewer=snap.player&&snap.player.position?snap.player.position:snap.player;if(!viewer)return;for(const actor of snap.actors)window.CullingSystem.setActorVisible(actor,viewer,180,70);},90));
  if(claim('projectiles'))unsubs.push(window.RuntimeCoordinator.add('vfx','modern-projectiles',(dt)=>window.ProjectileSystem&&window.ProjectileSystem.update(dt),10));
  if(claim('vfx'))unsubs.push(window.RuntimeCoordinator.add('vfx','modern-vfx',(dt)=>window.VfxRuntime&&window.VfxRuntime.update(dt),20));
  if(!window.RuntimeCoordinator.started)window.RuntimeCoordinator.start();
  if(ctx.scene.onBeforeRenderObservable){sceneObserver=ctx.scene.onBeforeRenderObservable.add(()=>coordinatorTick(window.RuntimeContext&&window.RuntimeContext.snapshot()));}
 }
 window.GameEvents&&window.GameEvents.emit('modernRuntimeBound',{scene:ctx.scene,engine:ctx.engine,actors:(ctx.actors||[]).length,npcs:(ctx.npcs||[]).length,ownership:window.RuntimeOwnership&&window.RuntimeOwnership.snapshot(),shadow:true});return true;
}
function scheduleBind(){cancelAnimationFrame(raf);attempts=0;const step=()=>{if(bindScene())return;if(++attempts<180)raf=requestAnimationFrame(step);else console.warn('[ModernRuntimeBridge] Scene chưa sẵn sàng sau 180 frame');};raf=requestAnimationFrame(step);}
function dispose(){cancelAnimationFrame(raf);if(boundScene&&sceneObserver&&boundScene.onBeforeRenderObservable)try{boundScene.onBeforeRenderObservable.remove(sceneObserver);}catch(e){}sceneObserver=null;boundScene=null;for(const off of unsubs.splice(0)){try{off&&off();}catch(e){}}for(const system of ['culling','projectiles','vfx'])release(system);bound=false;attempts=0;shadowT=0;}
window.GameEvents&&window.GameEvents.on('legacyRuntimeReady',scheduleBind);
window.GameEvents&&window.GameEvents.on('runtimeReady',scheduleBind);
window.ModernRuntimeBridge={bind:bindScene,scheduleBind,dispose,get bound(){return bound;},shadowSnapshot:()=>window.MigrationShadow&&window.MigrationShadow.snapshot()};
})();
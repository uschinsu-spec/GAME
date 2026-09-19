(()=>{'use strict';
let bound=false;
function bindScene(){if(bound)return;const ctx=window.RuntimeContext&&window.RuntimeContext.discover();if(!ctx||!ctx.scene||!ctx.engine)return;bound=true;
 if(window.SpriteRenderer&&ctx.scene)window.GameEvents&&window.GameEvents.emit('rendererReady',{scene:ctx.scene,renderer:window.SpriteRenderer});
 if(window.EnemySystem&&ctx.actors)window.EnemySystem.bind(ctx.actors,ctx.boss||null);
 if(window.PanelSystem&&window.PanelSystem.bind)window.PanelSystem.bind(document);
 if(window.MobileInput&&window.MobileInput.bind)window.MobileInput.bind(document);
 if(window.RuntimeCoordinator&&!window.RuntimeCoordinator.started)window.RuntimeCoordinator.start();
 window.GameEvents&&window.GameEvents.emit('modernRuntimeBound',{scene:ctx.scene,engine:ctx.engine});
}
window.GameEvents&&window.GameEvents.on('legacyRuntimeReady',()=>requestAnimationFrame(()=>requestAnimationFrame(bindScene)));
window.GameEvents&&window.GameEvents.on('runtimeReady',()=>requestAnimationFrame(bindScene));
window.ModernRuntimeBridge={bind:bindScene,get bound(){return bound;}};
})();
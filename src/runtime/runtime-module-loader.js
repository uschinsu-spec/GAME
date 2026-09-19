(()=>{'use strict';
function appendScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>resolve(src);s.onerror=()=>reject(new Error('Không tải được '+src));document.body.appendChild(s);});}
async function load(version){const v=encodeURIComponent(version||'dev');const modules=[
 'src/audio/audio-system.js',
 'src/combat/realm-system.js',
 'src/combat/status-effect-system.js',
 'src/combat/damage-system.js',
 'src/player/player-progression.js',
 'src/player/player-combat.js',
 'src/player/player-controller.js',
 'src/world/world-system.js',
 'src/world/map-loader.js',
 'src/world/map-renderer.js',
 'src/enemy/enemy-spawn-system.js',
 'src/enemy/enemy-system.js',
 'src/enemy/enemy-ai.js',
 'src/enemy/boss-system.js',
 'src/render/sprite-renderer.js',
 'src/render/animation-system.js',
 'src/render/culling-system.js',
 'src/render/vfx-runtime.js',
 'src/skills/projectile-system.js',
 'src/skills/skill-runtime.js',
 'src/runtime/game-loop-system.js',
 'src/runtime/runtime-coordinator.js',
 'src/ui/floating-text-system.js',
 'src/ui/minimap-system.js',
 'src/ui/hud-system.js',
 'src/ui/mobile-input.js',
 'src/ui/panel-system.js',
 'src/npc/npc-skills.js',
 'src/npc/npc-ai.js',
 'src/npc/npc-system.js',
 'src/npc-identity-system.js'
 ];
 for(const path of modules){try{await appendScript(`${path}?v=${v}`);}catch(error){console.warn('[RuntimeModules]',error);}}
 window.GameEvents&&window.GameEvents.emit('runtimeModulesReady',{version});
 return true;
}
window.RuntimeModuleLoader={load};
})();

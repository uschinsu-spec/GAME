(()=>{'use strict';
function appendScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>resolve(src);s.onerror=()=>reject(new Error('Không tải được '+src));document.body.appendChild(s);});}
async function load(version){const v=encodeURIComponent(version||'dev');const modules=[
 'src/audio/audio-system.js',
 'src/combat/realm-system.js',
 'src/combat/status-effect-system.js',
 'src/combat/damage-system.js',
 'src/player/player-progression.js',
 'src/world/world-system.js',
 'src/enemy/enemy-system.js',
 'src/render/culling-system.js',
 'src/ui/floating-text-system.js',
 'src/ui/minimap-system.js',
 'src/npc/npc-skills.js',
 'src/npc/npc-ai.js',
 'src/npc/npc-system.js',
 'src/npc-identity-system.js'
 ];
 for(const path of modules){try{await appendScript(`${path}?v=${v}`);}catch(error){console.warn('[RuntimeModules]',error);}}
 return true;
}
window.RuntimeModuleLoader={load};
})();

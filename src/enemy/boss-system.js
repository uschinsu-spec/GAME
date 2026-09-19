(()=>{'use strict';
const state={boss:null,lastSpawnAt:0};
function shouldSpawn(gameState,boss){return !boss&&gameState&&Number(gameState.questKills||0)>=20;}
function buildSpec(region,player,bound=500){const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const x=clamp((player&&player.x||0)+12,-bound,bound),z=clamp((player&&player.z||0)+8,-bound,bound);return{type:region&&region.bossType||'shadow',name:region&&region.boss||'Xích Viêm Ma Lang',x,z,hpMult:5.5,atkMult:1.8,size:4.8};}
function set(actor){state.boss=actor||null;if(window.EnemySystem)window.EnemySystem.setBoss(state.boss);return state.boss;}
function clear(){return set(null);}
function markSpawn(){state.lastSpawnAt=Date.now();}
window.BossSystem={shouldSpawn,buildSpec,set,clear,markSpawn,get current(){return state.boss;},get lastSpawnAt(){return state.lastSpawnAt;}};
})();
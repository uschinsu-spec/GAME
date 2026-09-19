(()=>{'use strict';
function distance2(a,b){const dx=(a.x||0)-(b.x||0),dz=(a.z||0)-(b.z||0);return dx*dx+dz*dz;}
function shouldUpdate(actor,player,profile,boss){const d2=distance2(actor,player);if(d2>22500&&actor!==boss)return{active:false,d2,hz:0};const hz=!profile?60:(d2<=900?profile.enemyNearHz:d2<=6400?profile.enemyMidHz:profile.enemyFarHz);return{active:true,d2,hz};}
function movementIntent(actor,target,{safeZone}={}){if(!actor||!target)return{kind:'idle'};const dx=target.x-actor.x,dz=target.z-actor.z,dist=Math.max(.001,Math.hypot(dx,dz));if(safeZone&&safeZone(target.x,target.z))return{kind:'idle',dist};return{kind:'approach',dist,nx:dx/dist,nz:dz/dist};}
function tickCooldowns(actor,dt){if(!actor)return;actor.attackCd=Math.max(0,(actor.attackCd||0)-dt);actor.bossSkillCd=Math.max(0,(actor.bossSkillCd||0)-dt);actor.stunT=Math.max(0,(actor.stunT||0)-dt);}
window.EnemyAI={distance2,shouldUpdate,movementIntent,tickCooldowns};
})();
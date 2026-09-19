(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function chooseTarget(npc,actors,isSafe,range=35,retain=42){let best=null,bestD2=range*range;if(npc&&npc.target&&!npc.target.dead&&!isSafe(npc.target.x,npc.target.z)){const dx=npc.target.x-npc.x,dz=npc.target.z-npc.z,d2=dx*dx+dz*dz;if(d2<=retain*retain)best=npc.target;}if(best)return best;for(const a of actors||[]){if(!a||a.dead||isSafe(a.x,a.z))continue;const dx=a.x-npc.x,dz=a.z-npc.z,d2=dx*dx+dz*dz;if(d2<bestD2){bestD2=d2;best=a;}}return best;}
function combatIntent(npc,target){if(!npc||!target)return{kind:'idle'};const dx=target.x-npc.x,dz=target.z-npc.z,dist=Math.max(.01,Math.hypot(dx,dz)),nx=dx/dist,nz=dz/dist;if(dist<=14&&(npc.skillCd||0)<=0)return{kind:'skill',dist,nx,nz};if(dist>10)return{kind:'approach',dist,nx,nz};if(dist<4.5)return{kind:'retreat',dist,nx,nz};if((npc.attackCd||0)<=0)return{kind:'basic',dist,nx,nz};return{kind:'hold',dist,nx,nz};}
function move(npc,intent,dt,bound){if(!npc||!intent)return;if(intent.kind==='approach'||intent.kind==='retreat'){const sign=intent.kind==='retreat'?-0.48:1;npc.x=clamp(npc.x+intent.nx*npc.speed*sign*dt,-bound,bound);npc.z=clamp(npc.z+intent.nz*npc.speed*sign*dt,-bound,bound);npc.facing=intent.nx<-.05?'left':'right';npc.state='run';}else if(intent.kind==='hold')npc.state='idle';}
window.NpcAI={chooseTarget,combatIntent,move};
})();

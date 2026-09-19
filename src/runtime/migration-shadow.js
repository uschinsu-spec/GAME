(()=>{'use strict';
const state={enemyAI:{samples:0,active:0,idle:0,last:null},animation:{samples:0,last:null}};
function sampleEnemyAI(ctx){if(!ctx||!ctx.actors||!ctx.player||!window.EnemyAI)return;let active=0,idle=0;for(const actor of ctx.actors){if(!actor||actor.dead)continue;const intent=window.EnemyAI.movementIntent(actor,ctx.player,{});if(intent.kind==='idle')idle++;else active++;}state.enemyAI.samples++;state.enemyAI.active=active;state.enemyAI.idle=idle;state.enemyAI.last=performance.now();}
function sampleAnimation(ctx){if(!ctx)return;let count=0;const inspect=a=>{if(!a||a.dead)return;count++;};(ctx.actors||[]).forEach(inspect);(ctx.npcs||[]).forEach(inspect);state.animation.samples++;state.animation.last={time:performance.now(),actors:count,player:!!ctx.player};}
function snapshot(){return JSON.parse(JSON.stringify(state));}
window.MigrationShadow={sampleEnemyAI,sampleAnimation,snapshot};
})();

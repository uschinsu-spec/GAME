(()=>{'use strict';
const state={enemyAI:{samples:0,active:0,idle:0,attack:0,home:0,last:null},animation:{samples:0,advance:0,last:null}};
function sampleEnemyAI(ctx){if(!ctx||!ctx.actors||!window.EnemyLegacyAdapter)return;let active=0,idle=0,attack=0,home=0;for(const actor of ctx.actors){if(!actor||actor.dead)continue;const intent=window.EnemyLegacyAdapter.intent(actor,ctx);if(intent.kind==='idle')idle++;else{active++;if(intent.kind==='attack')attack++;if(intent.kind==='home')home++;}}state.enemyAI.samples++;Object.assign(state.enemyAI,{active,idle,attack,home,last:performance.now()});}
function sampleAnimation(ctx,dt=.11){if(!ctx||!window.EnemyLegacyAdapter)return;let count=0,advance=0;for(const actor of ctx.actors||[]){if(!actor||actor.dead)continue;count++;if(window.EnemyLegacyAdapter.animationFrame(actor,dt).advance)advance++;}state.animation.samples++;state.animation.advance=advance;state.animation.last={time:performance.now(),actors:count,player:!!ctx.player};}
function snapshot(){return JSON.parse(JSON.stringify(state));}
window.MigrationShadow={sampleEnemyAI,sampleAnimation,snapshot};
})();
(()=>{'use strict';
const phases=new Map([['pre',[]],['player',[]],['actors',[]],['combat',[]],['vfx',[]],['ui',[]],['post',[]]]);let started=false;
function add(phase,id,fn,order=0){if(!phases.has(phase))phases.set(phase,[]);const list=phases.get(phase);const old=list.findIndex(x=>x.id===id);if(old>=0)list.splice(old,1);list.push({id,fn,order:Number(order)||0});list.sort((a,b)=>a.order-b.order);return()=>remove(phase,id);}
function remove(phase,id){const list=phases.get(phase)||[],i=list.findIndex(x=>x.id===id);if(i>=0)list.splice(i,1);}
function runPhase(phase,dt,ctx){for(const task of (phases.get(phase)||[]).slice()){try{task.fn&&task.fn(dt,ctx);}catch(error){console.error('[RuntimeCoordinator]',phase,task.id,error);}}}
function tick(dt,ctx={}){for(const phase of ['pre','player','actors','combat','vfx','ui','post'])runPhase(phase,dt,ctx);if(window.GameLoopSystem)window.GameLoopSystem.tick(dt,ctx);}
function start(){started=true;window.GameEvents&&window.GameEvents.emit('runtimeCoordinatorStarted',{});}
function stop(){started=false;}
function stats(){return{started,phases:Object.fromEntries([...phases].map(([k,v])=>[k,v.length]))};}
window.RuntimeCoordinator={add,remove,runPhase,tick,start,stop,stats,get started(){return started;}};
})();
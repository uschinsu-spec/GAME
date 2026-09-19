(()=>{'use strict';
const state={actors:[],boss:null,map:null};
function bind(actors,boss=null){state.actors=actors||[];state.boss=boss;return state;}
function all(){return state.actors;}
function living(){return state.actors.filter(a=>a&&!a.dead);}
function nearest(x,z,range=Infinity,filter=null){let best=null,bd2=range*range;for(const a of state.actors){if(!a||a.dead||(filter&&!filter(a)))continue;const dx=a.x-x,dz=a.z-z,d2=dx*dx+dz*dz;if(d2<bd2){bd2=d2;best=a;}}return best;}
function setBoss(actor){state.boss=actor||null;return state.boss;}
function setMap(map){state.map=map||null;return state.map;}
function spawnPlan(map=state.map,bound=500){return window.EnemySpawnSystem?window.EnemySpawnSystem.build(map||{},bound):[];}
function rebuild({map=state.map,bound=500,disposeActor,createActor}={}){for(const actor of state.actors.slice()){try{disposeActor&&disposeActor(actor);}catch(e){console.warn('[EnemySystem] dispose',e);}}state.actors.length=0;state.boss=null;setMap(map);const plan=spawnPlan(map,bound);for(const row of plan){const actor=createActor&&createActor(row);if(actor&&!state.actors.includes(actor))state.actors.push(actor);}window.GameEvents&&window.GameEvents.emit('enemyPopulationReady',{map,plan,actors:state.actors});return state.actors;}
function remove(actor){const i=state.actors.indexOf(actor);if(i>=0)state.actors.splice(i,1);if(state.boss===actor)state.boss=null;}
window.EnemySystem={bind,all,living,nearest,setBoss,setMap,spawnPlan,rebuild,remove,get boss(){return state.boss;},get map(){return state.map;}};
})();
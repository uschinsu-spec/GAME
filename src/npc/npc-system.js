(()=>{'use strict';
const state={npcs:[]};
function register(npc){if(!npc)return npc;if(!state.npcs.includes(npc))state.npcs.push(npc);window.GameEvents&&window.GameEvents.emit('npcRegistered',{npc});return npc;}
function unregister(npc){const i=state.npcs.indexOf(npc);if(i>=0)state.npcs.splice(i,1);}
function clear(){state.npcs.length=0;}
function all(){return state.npcs;}
function assignSkill(npc,index){if(!npc||!window.NpcSkillCatalog)return npc;npc.assignedSkill=window.NpcSkillCatalog.get(index);return npc;}
function decorate(npc){return window.NpcIdentitySystem&&window.NpcIdentitySystem.decorateNpc?window.NpcIdentitySystem.decorateNpc(npc):npc;}
window.NpcSystem={register,unregister,clear,all,assignSkill,decorate};
})();

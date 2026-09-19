(()=>{'use strict';
const cooldown={1:0,2:0,3:0,4:0};let autoSlot=1,nextAutoAt=0;
function setCooldown(slot,value){cooldown[slot]=Math.max(0,Number(value)||0);return cooldown[slot];}
function getCooldown(slot){return Math.max(0,Number(cooldown[slot])||0);}
function tick(dt){dt=Math.max(0,Number(dt)||0);for(let i=1;i<=4;i++)cooldown[i]=Math.max(0,cooldown[i]-dt);}
function reset(){for(let i=1;i<=4;i++)cooldown[i]=0;autoSlot=1;nextAutoAt=0;}
function chooseAuto(state,getSkill,hasTarget,now=performance.now()){if(!state||!state.auto||now<nextAutoAt)return null;for(let tried=0;tried<4;tried++){const slot=autoSlot;autoSlot=autoSlot%4+1;const id=state.equippedSkills&&state.equippedSkills[slot-1];if(!id)continue;const skill=getSkill&&getSkill(id);if(!skill)continue;if(Number(state.mp||0)<Number(skill.mp||0)||getCooldown(slot)>0)continue;if(hasTarget&&!hasTarget(skill,slot))continue;return{slot,skill};}nextAutoAt=now+400;return null;}
function commitAuto(delayMs=1000,now=performance.now()){nextAutoAt=now+Math.max(0,Number(delayMs)||0);}
function snapshot(){return{cooldown:{...cooldown},autoSlot,nextAutoAt};}
window.SkillRuntime={setCooldown,getCooldown,tick,reset,chooseAuto,commitAuto,snapshot};
})();
(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const now=()=>performance.now();
function ensure(actor){if(!actor)return null;if(!actor.skillStatus||typeof actor.skillStatus!=='object')actor.skillStatus={};if(!actor.skillDots||typeof actor.skillDots!=='object')actor.skillDots={};return actor;}
function setTimed(actor,key,amount,duration){if(!ensure(actor)||actor.dead)return;const end=now()+Math.max(0,Number(duration)||0)*1000,old=actor.skillStatus[key];if(old&&old.end>end&&Number(old.amount)>=Number(amount||0))return;actor.skillStatus[key]={amount:Number(amount)||0,end};}
function amount(actor,key){const s=actor&&actor.skillStatus&&actor.skillStatus[key];if(!s||s.end<=now())return 0;return Number(s.amount)||0;}
function stun(actor,duration){if(actor&&!actor.dead)actor.stunT=Math.max(Number(actor.stunT)||0,Math.max(0,Number(duration)||0));}
function root(actor,duration){setTimed(actor,'root',1,duration);}
function slow(actor,value,duration){setTimed(actor,'slow',clamp(Number(value)||0,0,.85),duration);}
function moveMultiplier(actor){if(!actor)return 1;if(amount(actor,'root')>0||amount(actor,'freeze')>0)return 0;return Math.max(.15,1-amount(actor,'slow'));}
function attackIntervalMultiplier(actor){const v=amount(actor,'attackSlow');return v>0?1/Math.max(.2,1-v):1;}
function incomingMultiplier(actor,type='physical'){if(!actor)return 1;let mult=1;mult*=1+amount(actor,'shock');if(type==='Hỏa')mult*=1+amount(actor,'fireTaken');const all=amount(actor,'shredAll'),phys=amount(actor,'shredPhysical'),kim=amount(actor,'shredKim');if(all>0)mult*=1+all;if(type==='physical'&&phys>0)mult*=1+phys;if(type==='Kim'&&kim>0)mult*=1+kim;return mult;}
function dot(actor,key,type,dps,duration,maxStacks=1){if(!ensure(actor)||actor.dead)return;const t=now(),old=actor.skillDots[key];let stacks=1;if(old&&old.end>t)stacks=Math.min(Math.max(1,maxStacks||1),(old.stacks||1)+1);actor.skillDots[key]={type,dps:Math.max(Number(dps)||0,old&&old.end>t?Number(old.dps)||0:0),stacks,end:t+Math.max(.1,Number(duration)||1)*1000,next:old&&old.end>t?Math.min(old.next||t+1000,t+1000):t+1000};}
function tick(actor,onDot){if(!actor||actor.dead)return;const t=now();if(actor.skillStatus)for(const [k,v] of Object.entries(actor.skillStatus))if(!v||v.end<=t)delete actor.skillStatus[k];if(actor.skillDots)for(const [k,d] of Object.entries(actor.skillDots)){if(!d||d.end<=t){delete actor.skillDots[k];continue;}if(t>=d.next){d.next+=1000;onDot&&onDot(actor,Math.max(1,(d.dps||0)*(d.stacks||1)),d.type);if(actor.dead)return;}}}
window.StatusEffectSystem={ensure,setTimed,amount,stun,root,slow,moveMultiplier,attackIntervalMultiplier,incomingMultiplier,dot,tick,now};
})();
(()=>{'use strict';
function calculate({raw=0,defense=0,attackerRealm=null,defenderRealm=null,incomingMultiplier=1,variance=1,min=1}={}){let realmFactor=1;if(attackerRealm&&defenderRealm&&window.RealmSystem)realmFactor=window.RealmSystem.compare(attackerRealm,defenderRealm).factor;return Math.max(min,Math.round(Math.max(0,raw)*realmFactor*Math.max(0,incomingMultiplier)-Math.max(0,defense)*Math.max(0,variance)));}
function apply(target,options={}){if(!target||target.dead)return{damage:0,killed:false};const damage=calculate(options);target.hp=(Number(target.hp)||0)-damage;const killed=target.hp<=0;window.GameEvents&&window.GameEvents.emit('damageApplied',{target,damage,killed,type:options.type||'physical',source:options.source||null});return{damage,killed};}
window.DamageSystem={calculate,apply};
})();

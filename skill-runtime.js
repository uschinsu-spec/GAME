/* Skill runtime patch generated from GAME_MASTER_144_SKILL_FULL.xlsx — 2026-09-18 */
(()=>{'use strict';
function replaceOrThrow(src,pattern,replacement,label){const next=src.replace(pattern,replacement);if(next===src)throw new Error('[SkillPatch] Không tìm thấy đoạn cần patch: '+label);return next;}

function buildSkillCore(){
  return `// ==========================================
  // HỆ THỐNG KỸ NĂNG — MASTER DATA TỪ EXCEL
  // 144 skill / 9 hệ / 4 cấp / 4 phẩm. VFX path giữ nguyên.
  // ==========================================
  const SKILL_MASTER=window.TuTienSkillMaster;
  if(!SKILL_MASTER||!SKILL_MASTER.elements||SKILL_MASTER.skillCount!==144){
    throw new Error('Skill master data chưa tải hoặc không đủ 144 skill');
  }
  const SKILL_TIERS=SKILL_MASTER.tiers;
  const SKILL_RANKS=SKILL_MASTER.ranks;
  const ELEMENT_SKILL_NAMES=Object.fromEntries(Object.entries(SKILL_MASTER.elements).map(([name,e])=>[name,e.names]));
  function getElementKey(elemName){const e=SKILL_MASTER.elements[elemName];return e?e.key:'kiem';}
  function getElementNameFromKey(key){for(const [name,e] of Object.entries(SKILL_MASTER.elements))if(e.key===key)return name;return 'Kiếm';}
  function getElementColorByName(elemName){return {Kim:'#ffd86b',Hỏa:'#ff6b3d',Thủy:'#64cfff',Thổ:'#c9a56b',Mộc:'#68df8b',Phong:'#a7f3dc',Lôi:'#9d8cff',Kiếm:'#7ceaff',Đao:'#ff776d'}[elemName]||'#7ceaff';}
  function getSkillId(elemName,tierIdx,rankIdx){return getElementKey(elemName)+'_'+tierIdx+'_'+rankIdx;}
  function getSkillBalance(tierIdx,rankIdx){return SKILL_MASTER.balance[tierIdx*4+rankIdx]||null;}
  function getSkillDef(skillId){
    if(!skillId)return null;
    const parts=skillId.split('_');if(parts.length<3)return null;
    const elemKey=parts[0],tierIdx=parseInt(parts[1],10),rankIdx=parseInt(parts[2],10);
    if(!Number.isFinite(tierIdx)||!Number.isFinite(rankIdx)||tierIdx<0||tierIdx>3||rankIdx<0||rankIdx>3)return null;
    const element=getElementNameFromKey(elemKey),edata=SKILL_MASTER.elements[element],bal=getSkillBalance(tierIdx,rankIdx);
    if(!edata||!bal)return null;
    const tier=SKILL_TIERS[tierIdx],rank=SKILL_RANKS[rankIdx],flat=tierIdx*4+rankIdx,profile=edata.profiles[rankIdx]||{};
    const name=edata.names[flat]||('Bí Kíp '+tierIdx+'-'+rankIdx);
    return {
      id:skillId,name,element,elemKey,tierIdx,rankIdx,tierId:tier.id,rankId:rank.id,tierName:tier.name,rankName:rank.name,tierColor:tier.color,
      badge:(tier.badge||tier.name||'')+'·'+String(rank.name||'').charAt(0),
      minRealm:bal.minRealm,minLevel:bal.minLevel,mult:bal.mult,mp:bal.mp,cd:bal.cd,aoe:bal.aoe,hits:bal.hits,targetRange:bal.targetRange,
      forceCritAoE:!!bal.forceCritAoE,spiritScaling:!!edata.spiritScaling,costStones:bal.costStones,costCult:bal.costCult,upgradeCosts:bal.upgradeCosts,
      icon:'assets/skills/'+elemKey+'/'+tier.id+'_'+rank.id+'.png',
      vfx:'assets/vfx/skills/'+elemKey+'/'+tier.id+'_'+rank.id+'/vfx_sheet.png',
      role:profile.role||'',mechanicText:name+': '+(profile.mechanic||''),statusText:profile.status||'',effect:profile.effect||null
    };
  }
  function getSkillUpgradeCost(skill,curLv){
    if(!skill||curLv>=5)return null;
    const list=skill.upgradeCosts||[],c=list[curLv-1];
    return c?{stones:Number(c.stones)||0,cult:Number(c.cult)||0,toLevel:Number(c.toLevel)||curLv+1}:null;
  }
`;
}

function combatHelpers(){
  return `
  const SKILL_RUNTIME={swordIntent:0,swordIntentExpire:0};
  function nowMs(){return performance.now();}
  function getSwordIntentStacks(){if(SKILL_RUNTIME.swordIntentExpire<=nowMs()){SKILL_RUNTIME.swordIntent=0;SKILL_RUNTIME.swordIntentExpire=0;}return SKILL_RUNTIME.swordIntent||0;}
  function addSwordIntent(stacks=1,duration=4){SKILL_RUNTIME.swordIntent=Math.min(3,getSwordIntentStacks()+Math.max(0,stacks||0));SKILL_RUNTIME.swordIntentExpire=nowMs()+Math.max(0,duration||4)*1000;}
  function consumeSwordIntent(){const n=getSwordIntentStacks();SKILL_RUNTIME.swordIntent=0;SKILL_RUNTIME.swordIntentExpire=0;return n;}
  function actorSkillState(a){if(!a.skillStatus||typeof a.skillStatus!=='object')a.skillStatus={};if(!a.skillDots||typeof a.skillDots!=='object')a.skillDots={};return a.skillStatus;}
  function timedStatus(a,key,amount,duration){if(!a||a.dead)return;const s=actorSkillState(a),end=nowMs()+Math.max(0,duration||0)*1000,old=s[key];if(old&&old.end>end&&Number(old.amount)>=Number(amount||0))return;s[key]={amount:Number(amount)||0,end};}
  function statusAmount(a,key){const s=a&&a.skillStatus&&a.skillStatus[key];if(!s||s.end<=nowMs())return 0;return Number(s.amount)||0;}
  function applyStun(a,duration){if(a&&!a.dead)a.stunT=Math.max(Number(a.stunT)||0,Math.max(0,Number(duration)||0));}
  function applyRoot(a,duration){timedStatus(a,'root',1,duration);}
  function applySlow(a,amount,duration){timedStatus(a,'slow',clamp(Number(amount)||0,0,.85),duration);}
  function getActorMoveMultiplier(a){if(!a)return 1;if(statusAmount(a,'root')>0||statusAmount(a,'freeze')>0)return 0;return Math.max(.15,1-statusAmount(a,'slow'));}
  function getActorAttackIntervalMultiplier(a){const slow=statusAmount(a,'attackSlow');return slow>0?1/Math.max(.2,1-slow):1;}
  function getActorIncomingMultiplier(a,type='physical'){
    if(!a)return 1;type=normalizeDamageType(type);let mult=1;
    mult*=1+statusAmount(a,'shock');
    if(type==='Hỏa')mult*=1+statusAmount(a,'fireTaken');
    const all=statusAmount(a,'shredAll'),phys=statusAmount(a,'shredPhysical'),kim=statusAmount(a,'shredKim');
    if(all>0)mult*=1+all;if(type==='physical'&&phys>0)mult*=1+phys;if(type==='Kim'&&kim>0)mult*=1+kim;
    return mult;
  }
  function applyDot(a,key,type,dps,duration,maxStacks=1){
    if(!a||a.dead)return;actorSkillState(a);const now=nowMs(),old=a.skillDots[key];let stacks=1;
    if(old&&old.end>now)stacks=Math.min(Math.max(1,maxStacks||1),(old.stacks||1)+1);
    a.skillDots[key]={type:normalizeDamageType(type),dps:Math.max(Number(dps)||0,old&&old.end>now?Number(old.dps)||0:0),stacks,end:now+Math.max(.1,Number(duration)||1)*1000,next:old&&old.end>now?Math.min(old.next||now+1000,now+1000):now+1000};
  }
  function processActorSkillEffects(a){
    if(!a||a.dead)return;const now=nowMs();
    if(a.skillStatus)for(const [k,v] of Object.entries(a.skillStatus))if(!v||v.end<=now)delete a.skillStatus[k];
    if(a.skillDots)for(const [k,dot] of Object.entries(a.skillDots)){if(!dot||dot.end<=now){delete a.skillDots[k];continue;}if(now>=dot.next){dot.next+=1000;damage(a,Math.max(1,(dot.dps||0)*(dot.stacks||1)),false,dot.type,true);if(a.dead)return;}}
  }
  function moveActorRadial(a,cx,cz,distance,pull=true){
    if(!a||a.dead)return;let dx=a.x-cx,dz=a.z-cz,len=Math.hypot(dx,dz)||1,sign=pull?-1:1;
    let nx=clamp(a.x+dx/len*distance*sign,-MAP_BOUND,MAP_BOUND),nz=clamp(a.z+dz/len*distance*sign,-MAP_BOUND,MAP_BOUND);
    if(isVillageSafe(nx,nz)){const p=clampToEllipse(nx,nz,VILLAGE_WALL_RX+2,VILLAGE_WALL_RZ+2,1.02);nx=p.x;nz=p.z;}a.x=nx;a.z=nz;
  }
  function healPlayerPct(pct,label='Hồi phục'){const heal=Math.max(1,Math.round((S.maxHp||1)*Math.max(0,Number(pct)||0))),before=S.hp;S.hp=Math.min(S.maxHp,S.hp+heal);const gained=Math.max(0,Math.round(S.hp-before));if(gained>0&&player&&player.mesh)floatText(player.mesh.position,'+'+gained+' '+label,'#7dff9c');return gained;}
  function findWindPierceTarget(primary,range=6,dotMin=.55){
    if(!primary||!player)return null;const vx=primary.x-player.x,vz=primary.z-player.z,vl=Math.hypot(vx,vz)||1,ux=vx/vl,uz=vz/vl;let best=null,bd=Infinity;
    for(const a of actors){if(!a||a===primary||a.dead||isVillageSafe(a.x,a.z))continue;const wx=a.x-primary.x,wz=a.z-primary.z,d=Math.hypot(wx,wz);if(d<=.05||d>range)continue;const dot=(wx/d)*ux+(wz/d)*uz;if(dot>=dotMin&&d<bd){best=a;bd=d;}}
    return best;
  }
  function applySkillStatus(target,skill,dealt,ctx={}){
    if(!target||target.dead||!skill||!skill.effect)return;const e=skill.effect,k=e.kind;
    switch(k){
      case 'sword_intent': addSwordIntent(e.stackPerHit||1,e.duration||4); break;
      case 'shred': for(const t of (e.types||['all'])){const key=t==='all'?'shredAll':t==='physical'?'shredPhysical':t==='Kim'?'shredKim':'shredAll';timedStatus(target,key,e.amount||0,e.duration||3);} break;
      case 'sword_field': if((ctx.pulse||0)===0)applyRoot(target,e.root||.35); break;
      case 'bleed': applyDot(target,'bleed','physical',dealt*(e.pctPerSec||.12),e.duration||3,e.maxStacks||1); break;
      case 'burn': applyDot(target,'burn','Hỏa',dealt*(e.pctPerSec||.1),e.duration||3,e.maxStacks||1); break;
      case 'burn_vulnerability': applyDot(target,'burn','Hỏa',dealt*(e.pctPerSec||.1),e.duration||4,e.maxStacks||1);timedStatus(target,'fireTaken',e.fireTaken||.08,e.duration||4); break;
      case 'burn_explode': applyDot(target,'burn','Hỏa',dealt*(e.pctPerSec||.1),e.duration||5,1);target.skillBurnExplode={damage:dealt*(e.explodeRatio||.5),radius:e.radius||4.8,end:nowMs()+(e.duration||5)*1000}; break;
      case 'chance_stun': if(Math.random()<(e.chance||0))applyStun(target,e.duration||.3); break;
      case 'shock': timedStatus(target,'shock',e.damageTaken||.06,e.duration||3); break;
      case 'shock_stun': timedStatus(target,'shock',e.damageTaken||.1,e.duration||3);applyStun(target,e.stun||.5); break;
      case 'slow': applySlow(target,e.amount||.18,e.duration||2.5); break;
      case 'slow_freeze': applySlow(target,e.slow||.25,e.duration||3);if(Math.random()<(e.freezeChance||.12)){timedStatus(target,'freeze',1,e.freeze||.6);applyStun(target,e.freeze||.6);} break;
      case 'chill_stack': {actorSkillState(target);const now=nowMs(),old=target.skillStatus.chill;let stacks=old&&old.end>now?Math.min(e.maxStacks||3,(old.stacks||0)+1):1;target.skillStatus.chill={amount:e.slow||.35,stacks,end:now+(e.duration||4)*1000};applySlow(target,e.slow||.35,e.duration||4);if(stacks>=(e.maxStacks||3)){timedStatus(target,'freeze',1,e.freeze||.8);applyStun(target,e.freeze||.8);delete target.skillStatus.chill;}break;}
      case 'freeze': if(target===boss)applySlow(target,e.bossSlow||.3,e.bossSlowDuration||3);else{timedStatus(target,'freeze',1,e.duration||1);applyStun(target,e.duration||1);} break;
      case 'poison': applyDot(target,'poison','Mộc',dealt*(e.pctPerSec||.07),e.duration||4,e.maxStacks||1); break;
      case 'root': if(target===boss)applySlow(target,e.bossSlow||.2,e.bossSlowDuration||2);else applyRoot(target,e.duration||.6); break;
      case 'root_heal': applyRoot(target,e.root||.8); break;
      case 'pull_slow': moveActorRadial(target,player.x,player.z,e.pullDistance||1.5,true);applySlow(target,e.slow||.15,e.slowDuration||2); break;
      case 'knockback': if(!(target===boss&&e.bossImmune))moveActorRadial(target,player.x,player.z,e.distance||2.2,false); break;
      case 'pull_push': moveActorRadial(target,player.x,player.z,e.pullDistance||2.5,true);setTimeout(()=>{if(target&&!target.dead)moveActorRadial(target,player.x,player.z,e.pushDistance||3.2,false);},Math.max(50,(e.pullDuration||.6)*1000)); break;
      case 'stun': if(!(target===boss&&e.bossImmune))applyStun(target,e.duration||.45); break;
      case 'attack_slow': timedStatus(target,'attackSlow',e.amount||.1,e.duration||3); break;
      case 'stun_boss_slow': if(target===boss)applySlow(target,e.bossSlow||.25,e.bossSlowDuration||3);else applyStun(target,e.stun||.8); break;
    }
  }
  function triggerSkillDeathEffect(a){
    if(!a||!a.skillBurnExplode||a.skillBurnExplode.end<=nowMs())return;const info=a.skillBurnExplode;a.skillBurnExplode=null;
    const nearby=actors.filter(x=>x&&!x.dead&&x!==a&&Math.hypot(x.x-a.x,x.z-a.z)<=info.radius);
    ring(a.x,a.z,'#ff6b22',Math.max(2.5,info.radius*.7));burst(a.x,a.z,'#ff7a18',24,Math.max(3,info.radius));
    for(const t of nearby)damage(t,info.damage,false,'Hỏa',true);
  }
`;
}

function TuTienSkillPatch(src){
  if(typeof src!=='string'||!src.includes('HỆ THỐNG KỸ NĂNG'))throw new Error('[SkillPatch] game.js không hợp lệ');
  const core=buildSkillCore();
  src=replaceOrThrow(src,/\/\/ ==========================================\n\/\/ HỆ THỐNG KỸ NĂNG:[\s\S]*?\nconst defaultState=/,core+'\nconst defaultState=','master skill config');
  src=replaceOrThrow(src,"const MATCHING_DAMAGE_MULT=2.0;","const MATCHING_DAMAGE_MULT=2.0;"+combatHelpers(),'combat helpers');
  src=replaceOrThrow(src,/function getSkillPower\(skill,mult=1,crit=false\)\{[\s\S]*?\n\}\n\nfunction takePlayerDamage/,"function getSkillPower(skill,mult=1,crit=false){\n  let rawType=skill&&skill.element?skill.element:'physical';\n  let type=normalizeDamageType(rawType);\n  let base=getPlayerDamageStat(type);\n  const heartFx=getHeartMethodEffects();\n  let spiritMult=skill&&skill.spiritScaling?(1+(Math.max(0,S.spiritSense||0)*heartFx.spirit)/1000):1;\n  let petMult=S.pet?1.08:1.0;\n  let critMult=crit?(S.critDamage||1.8):1;\n  let realmMult=getRealmPowerMultiplier();\n  let swordMult=skill&&skill.element==='Kiếm'?(1+getSwordIntentStacks()*.04):1;\n  return base*realmMult*mult*spiritMult*petMult*critMult*swordMult*rnd(.92,1.08);\n}\n\nfunction takePlayerDamage",'getSkillPower');
  src=replaceOrThrow(src,/function damage\(a,d,crit=false,type='physical'\)\{[\s\S]*?\n\}\n\nfunction damageFromRealmSource/,"function damage(a,d,crit=false,type='physical',fromStatus=false){\n  if(!a||a.dead)return 0;\n  type=normalizeDamageType(type);\n  const suppression=getPlayerSuppressionVsActor(a);\n  d*=getActorIncomingMultiplier(a,type);\n  d=Math.max(1,Math.round(d*suppression));\n  a.hp-=d;\n  sfx(crit?'slash':'hit');\n  floatText(a.mesh.position,`${crit?'Bạo ':''}-${d} ${DAMAGE_LABELS[type]||''}`,crit?'#fff08b':(DAMAGE_COLORS[type]||'#ffd08a'));\n  flash(a.mesh);\n  if(a===boss)$('#bossFill').style.width=clamp(a.hp/a.maxHp*100,0,100)+'%';\n  if(a.hp<=0){triggerSkillDeathEffect(a);kill(a);}\n  return d;\n}\n\nfunction damageFromRealmSource",'damage');
  src=replaceOrThrow(src,/function skillAttack\(target,skill,mult=1,forceCrit=false\)\{[\s\S]*?\n\}\n\nfunction nearest/,"function skillAttack(target,skill,mult=1,forceCrit=false,ctx={}){\n  if(!target||!skill||target.dead)return 0;\n  const e=skill.effect||{};\n  if(e.kind==='execute'&&target.maxHp>0&&target.hp/target.maxHp<(e.threshold||.25))mult*=1+(e.bonus||.2);\n  if(e.kind==='instant_pierce')mult*=1+(e.amount||.18);\n  let crit=forceCrit||Math.random()<(S.critChance||0);\n  let d=getSkillPower(skill,mult,crit);\n  const dealt=damage(target,d,crit,normalizeDamageType(skill.element));\n  applySkillStatus(target,skill,dealt,ctx);\n  return dealt;\n}\n\nfunction nearest",'skillAttack');
  src=replaceOrThrow(src,/function useSkill\(n\)\{[\s\S]*?\n\}\n\nfunction useDash\(\)/,"function useSkill(n){\n  if(paused||cooldown[n]>0)return;\n  let slotIdx=n-1,skillId=(S.equippedSkills&&S.equippedSkills[slotIdx])||null;\n  if(!skillId){toast('Ô kỹ năng '+n+' chưa trang bị bí tịch!');return;}\n  let skill=getSkillDef(skillId);if(!skill)return;\n  if(S.mp<skill.mp){toast(`Linh lực không đủ (${Math.round(S.mp)}/${skill.mp} MP)!`);return;}\n  S.mp=Math.max(0,S.mp-skill.mp);\n  cooldown[n]=skill.cd/Math.max(0.35,(S.castSpeed||1)*getHeartMethodEffects().cast);\n  triggerPlayerAttack();\n  let lv=(S.learnedSkills&&S.learnedSkills[skillId])||1;\n  let dmgMult=skill.mult*(1+(lv-1)*0.15),effect=skill.effect||{};\n  if(effect.kind==='sword_ultimate'){\n    const stacks=getSwordIntentStacks();\n    if(stacks>0){dmgMult*=1+stacks*(effect.bonusPerStack||.08);consumeSwordIntent();toast('⚔ Kiếm Ý bộc phát ×'+stacks+'!');}\n  }\n  let ec=getElementColorByName(skill.element);sfx('skill'+Math.min(4,skill.tierIdx+1));\n  if(skill.aoe===0){\n    let t=nearest(skill.targetRange||11);\n    if(t){\n      const baseHit=dmgMult/2.4;let weights=[1,1,1];\n      if(effect.kind==='bleed'&&Array.isArray(effect.hitWeights))weights=effect.hitWeights;\n      for(let i=0;i<3;i++)setTimeout(()=>{if(t&&!t.dead)skillAttack(t,skill,baseHit*(weights[i]||1),false,{hit:i,isFinal:i===2});},i*75);\n      if(effect.kind==='pierce_secondary'){\n        const second=findWindPierceTarget(t,effect.maxDistance||6,effect.coneDot||.55);\n        if(second)for(let i=0;i<3;i++)setTimeout(()=>{if(second&&!second.dead)skillAttack(second,skill,baseHit*(effect.secondaryRatio||.6),false,{hit:i,isSecondary:true,isFinal:i===2});},i*75+30);\n      }\n      playSkillVfx(skill,t.x,t.z,3.4+skill.tierIdx*0.45,t.x-player.x,t.z-player.z,false);slash(t.x,t.z,ec);\n    }\n  }else{\n    let range=skill.aoe;\n    let targets=actors.filter(a=>!a.dead&&!isVillageSafe(a.x,a.z)&&Math.hypot(a.x-player.x,a.z-player.z)<range);\n    playSkillVfx(skill,player.x,player.z,Math.max(4.2,Math.min(10,range*0.95)),0,0,true);\n    ring(player.x,player.z,ec,range*0.65);\n    let particleCount=skill.tierIdx===3?60:skill.tierIdx===2?40:24;burst(player.x,player.z,ec,particleCount,range*0.75);\n    if(skill.tierIdx>=2&&camera){let ox=camera.position.x,oz=camera.position.z,mag=skill.tierIdx===3?0.38:0.18;camera.position.x+=rnd(-mag,mag);camera.position.z+=rnd(-mag,mag);setTimeout(()=>{if(camera){camera.position.x=ox;camera.position.z=oz;}},120);}\n    let isCrit=skill.forceCritAoE||Math.random()<(S.critChance||0);\n    if(effect.kind==='sword_field'&&effect.pulses>1){\n      const pulses=Math.max(1,effect.pulses|0),gap=Math.max(80,effect.pulseGapMs||180);\n      for(let p=0;p<pulses;p++)setTimeout(()=>{for(const a of targets)if(a&&!a.dead)skillAttack(a,skill,dmgMult/pulses,isCrit,{pulse:p,isFinal:p===pulses-1});},p*gap);\n    }else{\n      targets.forEach((a,i)=>setTimeout(()=>{if(a&&!a.dead)skillAttack(a,skill,dmgMult,isCrit,{isFinal:true});},i*22));\n    }\n    if(effect.kind==='heal_pulse'){\n      const pulses=Math.max(1,effect.pulses||3),gap=Math.max(80,effect.pulseGapMs||240);\n      for(let p=0;p<pulses;p++)setTimeout(()=>{healPlayerPct(effect.healPct||.02,'Sinh lực');updateHUD();},p*gap);\n    }else if(effect.kind==='root_heal'){healPlayerPct(effect.healPct||.06,'Sinh lực');}\n  }\n  updateHUD();updateCooldownUI();\n}\n\nfunction useDash()",'useSkill');
  src=replaceOrThrow(src,"function updateActor(a,dt){\n  if(a.dead)return;","function updateActor(a,dt){\n  if(a.dead)return;\n  processActorSkillEffects(a);\n  if(a.dead)return;",'updateActor status tick');
  src=replaceOrThrow(src,"let playerSafe=isVillageSafe(player.x,player.z);\n  let dx=player.x-a.x,dz=player.z-a.z,d=Math.hypot(dx,dz)||1;","let playerSafe=isVillageSafe(player.x,player.z);\n  let moveMult=getActorMoveMultiplier(a);\n  let dx=player.x-a.x,dz=player.z-a.z,d=Math.hypot(dx,dz)||1;",'updateActor move multiplier');
  src=replaceOrThrow(src,"let nextX=a.x+dx/d*a.speed*dt;\n    let nextZ=a.z+dz/d*a.speed*dt;","let nextX=a.x+dx/d*a.speed*moveMult*dt;\n    let nextZ=a.z+dz/d*a.speed*moveMult*dt;",'updateActor slow movement');
  src=replaceOrThrow(src,"a.attackCd=1.2+rnd(0,.4);","a.attackCd=(1.2+rnd(0,.4))*getActorAttackIntervalMultiplier(a);",'enemy attack slow');
  src=replaceOrThrow(src,"let upCostStones = Math.round(sk.costStones * 0.75 * Math.max(1, lv));\n        let upCostCult = Math.round(sk.costCult * 0.85 * Math.max(1, lv));","let upCost = getSkillUpgradeCost(sk,Math.max(1,lv));\n        let upCostStones = upCost ? upCost.stones : 0;\n        let upCostCult = upCost ? upCost.cult : 0;",'skill panel upgrade cost');
  src=replaceOrThrow(src,"☯ Yêu cầu: <b>${realms[sk.minRealm]} (Lv.${sk.minLevel}+)</b>","☯ Yêu cầu: <b>${realms[sk.minRealm]} (Lv.${sk.minLevel}+)</b><br>🧩 Vai trò: <b>${sk.role||'Kỹ năng chiến đấu'}</b><br>✨ Hiệu ứng: <b>${sk.statusText||'Không'}</b>",'skill panel mechanic text');
  src=replaceOrThrow(src,"let upCostStones = Math.round(sk.costStones * 0.75 * curLv);\n          let upCostCult = Math.round(sk.costCult * 0.85 * curLv);","let upCost = getSkillUpgradeCost(sk,curLv);\n          if(!upCost) return toast('Không có dữ liệu nâng cấp cho kỹ năng này');\n          let upCostStones = upCost.stones;\n          let upCostCult = upCost.cult;",'upgrade handler Excel cost');
  console.info('[SkillPatch] Đã đồng bộ '+(window.TuTienSkillMaster&&window.TuTienSkillMaster.skillCount||0)+' skill từ Excel');
  return src;
}
window.TuTienSkillPatch=TuTienSkillPatch;
})();

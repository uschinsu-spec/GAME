# -*- coding: utf-8 -*-

with open('src/game-runtime.js', 'r', encoding='utf-8') as f:
    text = f.read()

clean_middle = r'''function spawnBoss(){
  if(boss||S.questKills<20)return;
  let bx=clamp(player.x+12,-MAP_BOUND,MAP_BOUND);
  let bz=clamp(player.z+8,-MAP_BOUND,MAP_BOUND);
  if(isVillageSafe(bx,bz)){
    // Nếu player đang trong thôn, boss xuất hiện ngoài cổng Nam thay vì bên trong khu an toàn.
    bx=0;
    bz=VILLAGE_WALL_RZ+12;
  }
  const bossRegion=region();
  const bossType=bossRegion.bossType||'shadow';
  boss=makeActor(bossType,bx,bz,true);
  const baseBossName=bossRegion.boss||'Xích Viêm Ma Lang';
  boss.name='【Thống Lĩnh】 '+baseBossName+' ['+boss.realmInfo.displayName+']';
  boss.maxHp*=5.5;
  boss.hp=boss.maxHp;
  boss.atk*=1.8;
  boss.size=4.8;
  boss.mesh.scaling.scaleInPlace(1.4);
  if(boss.shadow)boss.shadow.scaling.scaleInPlace(1.4);
  if($('#bossBar')) $('#bossBar').hidden=false;
  if($('#bossName')) $('#bossName').textContent=boss.name;
  toast('⚠ Boss xuất hiện: '+boss.name+'!');
  sfx('breakthrough');
}

const COMBAT_DAMAGE_TYPES=['physical','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi'];
const DAMAGE_LABELS={
  physical:'Vật lý',Kim:'Kim',Hỏa:'Hỏa',Thủy:'Thủy',Mộc:'Mộc',
  Thổ:'Thổ',Phong:'Phong',Lôi:'Lôi'
};
const DAMAGE_COLORS={
  physical:'#ffd08a',Kim:'#ffd86b',Hỏa:'#ff6b3d',Thủy:'#64cfff',Mộc:'#68df8b',
  Thổ:'#c9a56b',Phong:'#a7f3dc',Lôi:'#9d8cff'
};

function normalizeDamageType(type='physical'){
  return type==='Kiếm'||type==='Đao'?'physical':type;
}

const MATCHING_DAMAGE_MULT=1.35;
const SKILL_RUNTIME={swordIntent:0,swordIntentExpire:0};
function nowMs(){return performance.now();}
function getSwordIntentStacks(){if(SKILL_RUNTIME.swordIntentExpire<=nowMs()){SKILL_RUNTIME.swordIntent=0;SKILL_RUNTIME.swordIntentExpire=0;}return SKILL_RUNTIME.swordIntent||0;}
function addSwordIntent(stacks=1,duration=4){SKILL_RUNTIME.swordIntent=Math.min(3,getSwordIntentStacks()+Math.max(0,stacks||0));SKILL_RUNTIME.swordIntentExpire=nowMs()+Math.max(0,duration||4)*1000;}
function consumeSwordIntent(){const n=getSwordIntentStacks();SKILL_RUNTIME.swordIntent=0;SKILL_RUNTIME.swordIntentExpire=0;return n;}
function actorSkillState(a){if(!a.skillStatus||typeof a.skillStatus!=='object')a.skillStatus={};if(!a.skillDots||typeof a.skillDots!=='object')a.skillDots={};return a.skillStatus;}
function timedStatus(a,key,amount,duration){if(!a||a.dead)return;const s=actorSkillState(a),end=nowMs()+Math.max(0,duration||0)*1000,old=s[key];if(old&&old.end>end&&Number(old.amount)>=Number(amount||0))return;s[key]={amount:Number(amount||0),end};}
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

function getDamageComponent(type='physical'){
  type=normalizeDamageType(type);
  const base=Math.max(0,(S.damage&&Number(S.damage[type]))||0);
  return base*getTechniqueStatMultiplier(type);
}

function getTotalDamage(){
  return COMBAT_DAMAGE_TYPES.reduce((sum,t)=>sum+getDamageComponent(t),0);
}

function getPlayerDamageStat(type='physical'){
  type=normalizeDamageType(type);
  const total=getTotalDamage();
  const matching=getDamageComponent(type);
  return total + matching*(MATCHING_DAMAGE_MULT-1);
}

function getPlayerDefenseStat(type='physical'){
  type=normalizeDamageType(type);
  const base=Math.max(0,(S.defense&&Number(S.defense[type]))||0);
  const systemDef=window.TuTienSystems?window.TuTienSystems.getDefenseMultiplier(S,player):1;
  return base*getTechniqueStatMultiplier(type)*getRealmPowerMultiplier()*getHeartMethodEffects().defense*systemDef;
}

function getSkillPower(skill,mult=1,crit=false){
  let rawType=skill&&skill.element?skill.element:'physical';
  let type=normalizeDamageType(rawType);
  let base=getPlayerDamageStat(type);
  const heartFx=getHeartMethodEffects();
  let spiritMult=skill&&skill.spiritScaling?(1+(Math.max(0,S.spiritSense||0)*heartFx.spirit)/1000):1;
  let petMult=S.pet?1.08:1.0;
  let critMult=crit?(S.critDamage||1.8):1;
  let realmMult=getRealmPowerMultiplier();
  let swordMult=skill&&skill.element==='Kiếm'?(1+getSwordIntentStacks()*.04):1;
  return base*realmMult*mult*spiritMult*petMult*critMult*swordMult*rnd(.92,1.08);
}

function takePlayerDamage(raw,type='physical',attacker=null){
  let defense=getPlayerDefenseStat(type);
  const enemySuppress=getActorSuppressionVsPlayer(attacker);
  const playerSuppress=getPlayerSuppressionVsActor(attacker);
  let realmFactor=enemySuppress/Math.max(1,playerSuppress);
  if(window.TuTienSystems&&attacker){
    const ward=window.TuTienSystems.getWardInfo(S);
    if(ward){
      const info=attacker.realmInfo||getEnemyRealmInfo(attacker.enemyLv||1);
      const wardSuppress=getRealmSuppressionByScores(ward.score,ward.major,info.score,info.major);
      const enemyVsWard=getRealmSuppressionByScores(info.score,info.major,ward.score,ward.major);
      realmFactor*=enemyVsWard/Math.max(1,wardSuppress);
      realmFactor/=Math.max(1,ward.quality||1);
    }
  }
  let reduced=Math.max(1,raw*realmFactor-defense*rnd(.65,1.0));
  S.hp-=reduced;
  sfx('hit');
  floatText(player.mesh.position, '-'+Math.round(reduced)+' '+(DAMAGE_LABELS[type]||type), DAMAGE_COLORS[type]||'#ff776d');
  if(S.hp<=0)playerDeath();
  return reduced;
}

function damage(a,d,crit=false,type='physical',fromStatus=false,source='player'){
  if(!a||a.dead)return 0;
  type=normalizeDamageType(type);
  const suppression=source==='player'?getPlayerSuppressionVsActor(a):1.0;
  d*=getActorIncomingMultiplier(a,type);
  d=window.DamageSystem?window.DamageSystem.apply(a,{raw:d,incomingMultiplier:suppression,type,source}).damage:Math.max(1,Math.round(d*suppression));
  if(!window.DamageSystem)a.hp-=d;
  sfx(crit?'slash':'hit');
  const headY=(a.size?a.size*0.95:2.4);
  floatText({x:a.x,y:headY,z:a.z}, (crit?'Bạo ':'')+'-'+d+' '+(DAMAGE_LABELS[type]||''), crit?'#fff08b':(DAMAGE_COLORS[type]||'#ffd08a'), crit);
  flash(a.mesh);
  if(a===boss&&$('#bossFill'))$('#bossFill').style.width=clamp(a.hp/a.maxHp*100,0,100)+'%';
  if(a.hp<=0){triggerSkillDeathEffect(a);kill(a,source);}
  return d;
}

function damageFromRealmSource(a,d,sourceMajor,type='physical',crit=false,label=''){
  if(!a||a.dead)return;
  type=normalizeDamageType(type);
  sourceMajor=clamp(Number(sourceMajor)||0,0,realms.length-1);
  const sourceScore=sourceMajor===0?11:12+(sourceMajor-1)*4+3;
  const info=a.realmInfo||getEnemyRealmInfo(a.enemyLv||1);
  const sourceSuppress=getRealmSuppressionByScores(sourceScore,sourceMajor,info.score,info.major);
  const defenderSuppress=getRealmSuppressionByScores(info.score,info.major,sourceScore,sourceMajor);
  d=Math.max(1,Math.round(d*sourceSuppress/Math.max(1,defenderSuppress)));
  a.hp-=d;
  sfx(crit?'slash':'hit');
  const headY=(a.size?a.size*0.95:2.4);
  floatText({x:a.x,y:headY,z:a.z},(label?label+' ':'')+'-'+d+' '+(DAMAGE_LABELS[type]||''),crit?'#fff08b':(DAMAGE_COLORS[type]||'#ffd08a'),crit);
  flash(a.mesh);
  if(a===boss&&$('#bossFill'))$('#bossFill').style.width=clamp(a.hp/a.maxHp*100,0,100)+'%';
  if(a.hp<=0)kill(a,'player');
}

function getSystemContext(){
  return {
    save,updateHUD,toast,sfx,openPanel,closePanel,
    getActors:()=>actors,
    getPlayer:()=>player,
    realmDamage:damageFromRealmSource,
    burst,ring,slash
  };
}

function kill(a,source='player'){
  a.dead=true;
  a.mesh.setEnabled(false);
  if(a.shadow)a.shadow.setEnabled(false);
  if(source==='player'){
    S.kills++;
    S.questKills++;
    gainXP(a.xp);
  }
  const formationCult=window.TuTienSystems?window.TuTienSystems.getCultivationMultiplier(S,player):1;
  const killMeta={boss:a===boss,enemyLv:a.enemyLv||1,realmInfo:a.realmInfo,damageType:a.damageType||'physical',actor:a,state:S,ctx:getSystemContext(),source};
  if(source==='player'){
    if(window.TuTienSystems)window.TuTienSystems.onKill(S,killMeta,getSystemContext());
    if(window.GameEvents)window.GameEvents.emit(a===boss?'bossKilled':'enemyKilled',killMeta);
    if(a===boss){
      S.bossKills++;
      toast('🏆 Đã tiêu diệt Boss!');
      sfx('breakthrough');
      boss=null;
      if($('#bossBar')) $('#bossBar').hidden=true;
      S.questKills=0;
    }
  }
  if(a.fixedSpawn){
    const respawnMs=Math.max(8000,(a.respawnDelay||15)*1000);
    if(window.GameScheduler)window.GameScheduler.schedule(respawnMs/1000,()=>respawnFixedEnemy(a),'enemy-respawn');
    else setTimeout(()=>respawnFixedEnemy(a),respawnMs);
  }else{
    setTimeout(()=>{
      if(a.mesh)a.mesh.dispose();
      if(a.shadow)a.shadow.dispose();
      actors=actors.filter(x=>x!==a);
    },800);
  }
  if(source==='player'){
    save();
    updateHUD();
  }
}

function gainXP(v){
  S.xp+=v;
  while(S.xp>=S.xpNeed){
    S.xp-=S.xpNeed;
    S.level++;
    S.xpNeed=Math.round(S.xpNeed*1.22);
    // Mỗi cấp nhân vật tăng vừa phải để đảm bảo cân bằng thời gian chiến đấu (TTK) toàn cảnh giới
    S.maxHp+=40;
    S.maxMp+=15;
    for(const t of COMBAT_DAMAGE_TYPES){
      if(t==='physical') S.damage[t]=(S.damage[t]||0)+1.8;
      else S.damage[t]=(S.damage[t]||0)+0.6;
      S.defense[t]=(S.defense[t]||0)+0.4;
    }
    S.spiritSense+=2;
    S.critChance=Math.min(.75,(S.critChance||0)+.001);
    S.critDamage=Math.min(3.5,(S.critDamage||1.6)+.005);
    S.moveSpeed=Math.min(10,(S.moveSpeed||6.2)+.005);
    S.attackSpeed=Math.min(2.5,(S.attackSpeed||1)+.003);
    S.castSpeed=Math.min(2.5,(S.castSpeed||1)+.003);
    S.hpRegenPct=Math.min(.08,(S.hpRegenPct||0)+.0002);
    S.mpRegenPct=Math.min(.12,(S.mpRegenPct||0)+.0003);
    S.hp=S.maxHp;
    S.mp=S.maxMp;
    toast('✨ Đột phá cấp độ Lv.'+S.level+'!');
    sfx('levelUp');
    burst(player.x,player.z,'#7eeaff',24,5);
  }
  updateHUD();
}

function addItem(n,q=1){
  if(!S.items||typeof S.items!=='object')S.items={};
  S.items[n]=(S.items[n]||0)+q;
}

const gearNames=['Thanh Vân Kiếm','Huyền Thiết Giáp','Ngọc Linh Giới','Băng Tâm Kiếm','Xích Viêm Bào'];
function dropEquipment(){
  return;
}

function playerAttack(target,mult=1){
  if(!target)return;
  triggerPlayerAttack();
  let crit=Math.random()<(S.critChance||0);
  let d=getSkillPower({element:'physical'},mult,crit);
  slash(target.x,target.z,crit?'#ffe777':'#78dfff');
  damage(target,d,crit,'physical');
}

function skillAttack(target,skill,mult=1,forceCrit=false,ctx={}){
  if(!target||!skill||target.dead)return 0;
  const e=skill.effect||{};
  if(e.kind==='execute'&&target.maxHp>0&&target.hp/target.maxHp<(e.threshold||.25))mult*=1+(e.bonus||.2);
  if(e.kind==='instant_pierce')mult*=1+(e.amount||.18);
  let crit=forceCrit||Math.random()<(S.critChance||0);
  let d=getSkillPower(skill,mult,crit);
  const dealt=damage(target,d,crit,normalizeDamageType(skill.element));
  applySkillStatus(target,skill,dealt,ctx);
  return dealt;
}

function nearest(range=9){
  let best=null,bd2=range*range;
  for(let a of actors){
    if(a.dead||isVillageSafe(a.x,a.z))continue;
    let dx=a.x-player.x,dz=a.z-player.z,d2=dx*dx+dz*dz;
    if(d2<bd2){bd2=d2;best=a}
  }
  return best;
}

function countEnemiesInRange(range,limit=Infinity){
  const r2=range*range;
  let count=0;
  for(let i=0;i<actors.length;i++){
    const a=actors[i];
    if(!a||a.dead)continue;
    const dx=a.x-player.x,dz=a.z-player.z;
    if(dx*dx+dz*dz<r2&&++count>=limit)return count;
  }
  return count;
}

function getElementColor(){
  return {
    Kim:'#ffd86b',Hỏa:'#ff6b3d',Thủy:'#64cfff',
    Thổ:'#c9a56b',Mộc:'#68df8b',Phong:'#a7f3dc',
    Lôi:'#9d8cff',Kiếm:'#7ceaff',Đao:'#ff776d'
  }[S.skillElement]||'#7ceaff';
}

function useSkill(n){
  if(paused||cooldown[n]>0)return;
  let slotIdx=n-1,skillId=(S.equippedSkills&&S.equippedSkills[slotIdx])||null;
  if(!skillId){toast('Ô kỹ năng '+n+' chưa trang bị bí tịch!');return;}
  let skill=getSkillDef(skillId);if(!skill)return;
  if(S.mp<skill.mp){toast('Linh lực không đủ ('+Math.round(S.mp)+'/'+skill.mp+' MP)!');return;}
  S.mp=Math.max(0,S.mp-skill.mp);
  cooldown[n]=skill.cd/Math.max(0.35,(S.castSpeed||1)*getHeartMethodEffects().cast);
  triggerPlayerAttack();
  let lv=(S.learnedSkills&&S.learnedSkills[skillId])||1;
  let dmgMult=skill.mult*(1+(lv-1)*0.15),effect=skill.effect||{};
  if(effect.kind==='sword_ultimate'){
    const stacks=getSwordIntentStacks();
    if(stacks>0){dmgMult*=1+stacks*(effect.bonusPerStack||.08);consumeSwordIntent();toast('⚔ Kiếm Ý bộc phát ×'+stacks+'!');}
  }
  let ec=getElementColorByName(skill.element);sfx('skill'+Math.min(4,skill.tierIdx+1));

  let t=skill.aoe===0?nearest(skill.targetRange||11):null;
  let range=skill.aoe||0;
  let targets=range>0?actors.filter(a=>!a.dead&&!isVillageSafe(a.x,a.z)&&Math.hypot(a.x-player.x,a.z-player.z)<range):[];
  let aoeTargetX,aoeTargetZ;
  if(targets.length>0){
    let cx=0,cz=0;
    targets.forEach(a=>{cx+=a.x;cz+=a.z;});
    aoeTargetX=cx/targets.length; aoeTargetZ=cz/targets.length;
  }else if(t){
    aoeTargetX=t.x; aoeTargetZ=t.z;
  }else{
    let facingDx=player.facing==='left'?-1:1;
    aoeTargetX=player.x+facingDx*Math.max(4,range*0.7);
    aoeTargetZ=player.z;
  }
  launchSkillProjectile(skill, aoeTargetX, aoeTargetZ, range>0, range, t||targets, dmgMult, effect);
  updateHUD();updateCooldownUI();
}'''

idx1 = text.find('function spawnBoss(){')
idx2 = text.find('function useDash(){')

if idx1 != -1 and idx2 != -1:
    new_text = text[:idx1] + clean_middle.strip() + '\n\n' + text[idx2:]
    with open('src/game-runtime.js', 'w', encoding='utf-8') as f:
        f.write(new_text)
    print('Successfully updated cleanly! Length:', len(new_text))
else:
    print('Could not find markers:', idx1, idx2)

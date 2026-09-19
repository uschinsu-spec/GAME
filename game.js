(()=>{'use strict';
const current=document.currentScript;
const fallbackVersion=(()=>{try{return new URL(current&&current.src||location.href).searchParams.get('v')||'dev';}catch{return'dev';}})();
function appendScript(src,onload,onerror){
 const script=document.createElement('script');
 script.src=src;
 script.async=false;
 script.onload=onload||null;
 script.onerror=onerror||null;
 document.body.appendChild(script);
 return script;
}
function appendInline(code,sourceName='runtime-patched'){
 const script=document.createElement('script');
 script.textContent=code+`\n//# sourceURL=${sourceName}.js`;
 document.body.appendChild(script);
 return script;
}
function patchRuntime(source){
 let out=source;
 const oldDamage=`function damage(a,d,crit=false,type='physical',fromStatus=false,source='player'){
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
}`;
 const newDamage=`function damage(a,d,crit=false,type='physical',fromStatus=false,source='player'){
  if(!a||a.dead)return 0;
  type=normalizeDamageType(type);
  const suppression=source==='player'?getPlayerSuppressionVsActor(a):1.0;
  d*=getActorIncomingMultiplier(a,type);
  if(source==='npc'){
    d=Math.max(1,Math.round(d));
    a.hp=Math.max(0,(Number(a.hp)||0)-d);
  }else{
    d=window.DamageSystem?window.DamageSystem.apply(a,{raw:d,incomingMultiplier:suppression,type,source}).damage:Math.max(1,Math.round(d*suppression));
    if(!window.DamageSystem)a.hp-=d;
  }
  sfx(crit?'slash':'hit');
  const headY=(a.size?a.size*0.95:2.4);
  const npcPrefix=source==='npc'?'NPC ':'';
  floatText({x:a.x,y:headY,z:a.z},npcPrefix+(crit?'Bạo ':'')+'-'+d+' '+(DAMAGE_LABELS[type]||''),crit?'#fff08b':(DAMAGE_COLORS[type]||'#ffd08a'),crit);
  flash(a.mesh);
  if(a===boss&&$('#bossFill'))$('#bossFill').style.width=clamp(a.hp/a.maxHp*100,0,100)+'%';
  if(a.hp<=0){triggerSkillDeathEffect(a);kill(a,source);}
  return d;
}`;
 if(out.includes(oldDamage))out=out.replace(oldDamage,newDamage);else console.warn('[RuntimePatch] Không tìm thấy damage() gốc');

 const oldCombat=`        // THI TRIỂN SKILL HOÀNG CẤP HẠ PHẨM (TẦM XA 3.5m - 14m)
        if(dist <= 14.0 && dist >= 3.2 && npc.skillCd <= 0){
          npc.skillCd = rnd(2.2, 4.0);
          npc.state = 'attack';
          npc.frame = 0;
          npc.animTimer = 0;
          launchAlliedNpcSkill(npc, bestTarget);
        } else if(dist > 2.6){
          // Di chuyển áp sát quái vật
          const nx = tdx / dist, nz = tdz / dist;
          npc.x = clamp(npc.x + nx * npc.speed * dt, -MAP_BOUND, MAP_BOUND);
          npc.z = clamp(npc.z + nz * npc.speed * dt, -MAP_BOUND, MAP_BOUND);
          npc.facing = nx < -0.05 ? 'left' : 'right';
          npc.state = 'run';
        } else {
          // Trong tầm cận chiến: chém kiếm khí / đao khí
          if(npc.attackCd <= 0){
            npc.attackCd = 0.95 + rnd(-0.15, 0.2);
            npc.state = 'attack';
            npc.frame = 0;
            npc.animTimer = 0;
            const slashColor = (npc.assignedSkill && npc.assignedSkill.color) || '#7eeaff';
            slash(bestTarget.x, bestTarget.z, slashColor);
            sfx(npc.assignedSkill ? npc.assignedSkill.sfx : 'slash');
            const isCrit = Math.random() < 0.22;
            damage(bestTarget, npc.atk, isCrit, npc.assignedSkill ? npc.assignedSkill.elem : 'physical', false, 'npc');
          }
        }`;
 const newCombat=`        // GIỮ CỰ LY CHIẾN ĐẤU 5-10m ĐỂ NPC THỰC SỰ DÙNG SKILL CÁC HỆ
        const preferredRange = 7.0;
        if(dist <= 14.0 && npc.skillCd <= 0){
          npc.skillCd = rnd(1.6, 2.8);
          npc.state = 'attack';
          npc.frame = 0;
          npc.animTimer = 0;
          launchAlliedNpcSkill(npc, bestTarget);
        } else if(dist > 10.0){
          const nx = tdx / dist, nz = tdz / dist;
          npc.x = clamp(npc.x + nx * npc.speed * dt, -MAP_BOUND, MAP_BOUND);
          npc.z = clamp(npc.z + nz * npc.speed * dt, -MAP_BOUND, MAP_BOUND);
          npc.facing = nx < -0.05 ? 'left' : 'right';
          npc.state = 'run';
        } else if(dist < 4.5){
          // Lùi nhẹ để không kẹt vĩnh viễn ở cận chiến và mất điều kiện dùng skill.
          const nx = tdx / dist, nz = tdz / dist;
          npc.x = clamp(npc.x - nx * npc.speed * 0.48 * dt, -MAP_BOUND, MAP_BOUND);
          npc.z = clamp(npc.z - nz * npc.speed * 0.48 * dt, -MAP_BOUND, MAP_BOUND);
          npc.state = 'run';
        } else {
          npc.state = 'idle';
          // Đòn đánh thường xen kẽ trong lúc chờ hồi skill.
          if(npc.attackCd <= 0){
            npc.attackCd = 1.05 + rnd(-0.12, 0.18);
            npc.state = 'attack';
            npc.frame = 0;
            npc.animTimer = 0;
            const slashColor = (npc.assignedSkill && npc.assignedSkill.color) || '#7eeaff';
            slash(bestTarget.x, bestTarget.z, slashColor);
            sfx(npc.assignedSkill ? npc.assignedSkill.sfx : 'slash');
            const isCrit = Math.random() < 0.22;
            damage(bestTarget, Math.round(npc.atk * 0.72), isCrit, npc.assignedSkill ? npc.assignedSkill.elem : 'physical', false, 'npc');
          }
        }`;
 if(out.includes(oldCombat))out=out.replace(oldCombat,newCombat);else console.warn('[RuntimePatch] Không tìm thấy combat block gốc');

 // Làm projectile skill rõ hơn trên màn hình mobile.
 out=out.replace("const speed = 10.0;","const speed = 12.5;");
 out=out.replace("{ diameter: 0.52, segments: 4 }","{ diameter: 0.78, segments: 8 }");
 return out;
}
async function startPatchedRuntime(version){
 const v=encodeURIComponent(version||fallbackVersion);
 try{
  const response=await fetch(`src/game-runtime.js?v=${v}`,{cache:'no-store'});
  if(!response.ok)throw new Error('game-runtime.js '+response.status);
  const source=await response.text();
  appendInline(patchRuntime(source),'game-runtime-patched');
  console.info('[Bootstrap] Runtime NPC combat patch active');
 }catch(error){
  console.warn('[Bootstrap] Runtime patch lỗi, dùng runtime gốc',error);
  appendScript(`src/game-runtime.js?v=${v}`,null,()=>{
   const message=document.querySelector('#loadMsg');
   if(message)message.textContent='Lỗi tải GAME runtime';
  });
 }
}
function loadRuntime(version){
 const v=encodeURIComponent(version||fallbackVersion);
 const startRuntime=()=>startPatchedRuntime(version);
 appendScript(`src/npc-identity-system.js?v=${v}`,startRuntime,()=>{
  console.warn('[Bootstrap] Không tải được NPC Identity System, tiếp tục runtime');
  startRuntime();
 });
}
fetch(`build.json?t=${Date.now()}`,{cache:'no-store'})
 .then(r=>r.ok?r.json():Promise.reject(new Error('build.json '+r.status)))
 .then(meta=>loadRuntime(meta&&meta.buildVersion||fallbackVersion))
 .catch(error=>{console.warn('[Bootstrap] Dùng runtime version fallback',error);loadRuntime(fallbackVersion);});
})();

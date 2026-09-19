# -*- coding: utf-8 -*-

with open('src/game-runtime.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update launchVltkElementalBasic to trigger damage on impact
old_elem_basic = '''function launchVltkElementalBasic(skill, tx, tz, target, dmgMult, effect){
  const cfg=ELEMENTAL_BASIC_FLIPBOOK[skill.id]||{color:getElementColorByName(skill.element),size:1.6,burst:7,radius:0.8};
  const dx=tx-player.x,dz=tz-player.z;
  const dist=Math.max(0.1,Math.hypot(dx,dz));
  const ndx=dx/dist,ndz=dz/dist;
  const angle=Math.atan2(dz,dx);
  const speed=skill.elemKey==='tho'?8.5:10.5;
  const travelTime=Math.max(0.28,dist/speed);

  // Hạ Phẩm là liên kích 3 nhịp; cùng một flipbook được phát lại lệch nhịp.
  for(let hit=0;hit<3;hit++){
    setTimeout(()=>{
      if(!scene||!player)return;
      createVltkSpriteSheetEffect({
        texturePath:`assets/vfx/skills/${skill.elemKey}/hoang_ha/vfx_sheet.png`,
        cols:5, rows:5, totalFrames:25,
        size:cfg.size,
        x:player.x+ndx*0.65,
        y:1.35,
        z:player.z+ndz*0.65,
        isBillboard:true,
        rotZ:angle,
        vx:ndx*speed,
        vz:ndz*speed,
        duration:travelTime,
        skill,
        color:cfg.color,
        hasTrail:true,
        onComplete:()=>{
          burst(tx,tz,cfg.color,cfg.burst,cfg.radius);
          if(hit===2) ring(tx,tz,cfg.color,0.9);
        }
      });
    },hit*140);
  }
}'''

new_elem_basic = '''function launchVltkElementalBasic(skill, tx, tz, target, dmgMult, effect){
  const cfg=ELEMENTAL_BASIC_FLIPBOOK[skill.id]||{color:getElementColorByName(skill.element),size:1.6,burst:7,radius:0.8};
  const baseHit=(dmgMult||skill.mult)/2.4;
  let weights=[0.9,1.0,1.3];
  if(effect&&effect.kind==='bleed'&&Array.isArray(effect.hitWeights)) weights=effect.hitWeights;

  // Hạ Phẩm là liên kích 3 nhịp; cùng một flipbook được phát lại lệch nhịp, chạm quái là nổ damage ngay!
  for(let hit=0;hit<3;hit++){
    setTimeout(()=>{
      if(!scene||!player)return;
      const curTx = target && !target.dead ? target.x : tx;
      const curTz = target && !target.dead ? target.z : tz;
      const dx=curTx-player.x,dz=curTz-player.z;
      const dist=Math.max(0.1,Math.hypot(dx,dz));
      const ndx=dx/dist,ndz=dz/dist;
      const angle=Math.atan2(dz,dx);
      const speed=skill.elemKey==='tho'?8.5:10.5;
      const travelTime=Math.max(0.24,dist/speed);

      let hitRegistered=false;
      const triggerHit=(hx,hz)=>{
        if(hitRegistered)return;
        hitRegistered=true;
        burst(hx,hz,cfg.color,cfg.burst,cfg.radius);
        if(hit===2) ring(hx,hz,cfg.color,1.0);
        sfx('hit');

        // Gây sát thương và trừ máu quái NGAY LẬP TỨC khi chạm đích
        if(target && !target.dead){
          skillAttack(target, skill, baseHit*(weights[hit]||1), false, { hit, isFinal: hit===2 });
        }
      };

      createVltkSpriteSheetEffect({
        texturePath:`assets/vfx/skills/${skill.elemKey}/hoang_ha/vfx_sheet.png`,
        cols:5, rows:5, totalFrames:25,
        size:cfg.size,
        x:player.x+ndx*0.65,
        y:1.35,
        z:player.z+ndz*0.65,
        isBillboard:true,
        rotZ:angle,
        vx:ndx*speed,
        vz:ndz*speed,
        duration:travelTime,
        skill,
        color:cfg.color,
        hasTrail:true,
        onStep:(curX, curZ)=>{
          if(!hitRegistered && target && !target.dead){
            const tdx=curX-target.x, tdz=curZ-target.z;
            if(tdx*tdx + tdz*tdz <= 1.44){
              triggerHit(target.x, target.z);
            }
          }
        },
        onComplete:()=>{
          triggerHit(curTx, curTz);
        }
      });
    },hit*150);
  }
}'''

text = text.replace(old_elem_basic, new_elem_basic)

# 2. Update launchSkillProjectile fallback for other skills
old_fallback = '''  // Nếu là hệ Hỏa / hệ khác: dùng đạn đạo Hỏa Long VLTK
  const ec=getElementColorByName(skill.element)||'#ff6b3d';
  const dx=targetX-player.x, dz=targetZ-player.z;
  const dist=Math.max(0.1,Math.hypot(dx,dz));
  const ndx=dx/dist, ndz=dz/dist;
  const speed=12.0;
  const travelTime=dist/speed;

  const fireball=BABYLON.MeshBuilder.CreateSphere('vltk_fb_'+Date.now(),{diameter:isAoe?0.85:0.6,segments:6},scene);
  fireball.position.set(player.x+ndx*0.6,1.35,player.z+ndz*0.6);
  fireball.material=glowMat('vltk_fb_'+ec,ec,0.95,3.0,true);

  ring(player.x,player.z,ec,1.6);
  burst(player.x+ndx*0.6,player.z+ndz*0.6,ec,10,0.8);

  effects.push({
    vltkSword:fireball,
    t:travelTime,
    max:travelTime,
    vx:ndx*speed,
    vz:ndz*speed,
    targetX:targetX,
    targetZ:targetZ,
    color:ec,
    skill:skill,
    isFinalSword:true,
    trailTimer:0,
    trailInterval:0.02
  });'''

new_fallback = '''  // Nếu là hệ Hỏa / hệ khác: dùng đạn đạo Hỏa Long VLTK chạm quái nổ sát thương tức thì
  const ec=getElementColorByName(skill.element)||'#ff6b3d';
  const curTx = (targetOrTargets && !Array.isArray(targetOrTargets) && !targetOrTargets.dead) ? targetOrTargets.x : targetX;
  const curTz = (targetOrTargets && !Array.isArray(targetOrTargets) && !targetOrTargets.dead) ? targetOrTargets.z : targetZ;
  const dx=curTx-player.x, dz=curTz-player.z;
  const dist=Math.max(0.1,Math.hypot(dx,dz));
  const ndx=dx/dist, ndz=dz/dist;
  const speed=12.0;
  const travelTime=dist/speed;

  const fireball=BABYLON.MeshBuilder.CreateSphere('vltk_fb_'+Date.now(),{diameter:isAoe?0.85:0.6,segments:6},scene);
  fireball.position.set(player.x+ndx*0.6,1.35,player.z+ndz*0.6);
  fireball.material=glowMat('vltk_fb_'+ec,ec,0.95,3.0,true);

  ring(player.x,player.z,ec,1.6);
  burst(player.x+ndx*0.6,player.z+ndz*0.6,ec,10,0.8);

  let hitRegistered = false;
  const triggerImpact = (hx, hz) => {
    if(hitRegistered) return;
    hitRegistered = true;
    try{ fireball.dispose(); }catch(e){}
    explodeVltkSwordImpact(skill, hx, hz, isAoe, aoeRange || 5.0, ec);
    burst(hx, hz, ec, 16, 1.4);
    sfx('hit');

    if(isAoe){
      const effTargets = Array.isArray(targetOrTargets) ? targetOrTargets : actors.filter(a=>!a.dead&&!isVillageSafe(a.x,a.z)&&Math.hypot(a.x-hx,a.z-hz)<=(aoeRange||5.0));
      const isCrit = skill.forceCritAoE || Math.random() < (S.critChance || 0);
      effTargets.forEach(a => {
        if(a && !a.dead){
          skillAttack(a, skill, dmgMult || skill.mult, isCrit, { isFinal: true });
        }
      });
    } else {
      const tgt = targetOrTargets;
      if(tgt && !tgt.dead){
        skillAttack(tgt, skill, dmgMult || skill.mult, false, { isFinal: true });
      }
    }
  };

  effects.push({
    vltkSword:fireball,
    t:travelTime,
    max:travelTime,
    vx:ndx*speed,
    vz:ndz*speed,
    targetX:curTx,
    targetZ:curTz,
    color:ec,
    skill:skill,
    onStep: (curX, curZ) => {
      if(!isAoe && targetOrTargets && !targetOrTargets.dead){
        const tdx = curX - targetOrTargets.x, tdz = curZ - targetOrTargets.z;
        if(tdx * tdx + tdz * tdz <= 1.44){
          triggerImpact(targetOrTargets.x, targetOrTargets.z);
        }
      }
    },
    onComplete: () => {
      triggerImpact(curTx, curTz);
    },
    isFinalSword:true,
    trailTimer:0,
    trailInterval:0.02
  });'''

text = text.replace(old_fallback, new_fallback)

# 3. Update launchAlliedNpcSkill for instant contact detection
old_npc_skill = '''  effects.push({
    mesh: proj,
    t: travelTime,
    max: travelTime,
    vx: ndx * speed,
    vz: ndz * speed,
    targetX: target.x,
    targetZ: target.z,
    onComplete: () => {
      try{ proj.dispose(); }catch(e){}
      if(target && !target.dead){
        burst(target.x, target.z, sk.color, 14, 1.2);
        ring(target.x, target.z, sk.color, 1.4);
        const isCrit = Math.random() < 0.25;
        const dealt = Math.round(npc.atk * sk.mult * (isCrit ? 1.6 : 1.0));
        // NPC tiêu diệt quái vật -> source: 'npc' (Player không được EXP / kill)
        damage(target, dealt, isCrit, sk.elem, false, 'npc');
      }
    }
  });'''

new_npc_skill = '''  let hitRegistered = false;
  const triggerHit = (hx, hz) => {
    if(hitRegistered) return;
    hitRegistered = true;
    try{ proj.dispose(); }catch(e){}
    if(target && !target.dead){
      burst(hx, hz, sk.color, 14, 1.2);
      ring(hx, hz, sk.color, 1.4);
      const isCrit = Math.random() < 0.25;
      const dealt = Math.round(npc.atk * sk.mult * (isCrit ? 1.6 : 1.0));
      // NPC tiêu diệt quái vật -> source: 'npc' (Player không được EXP / kill)
      damage(target, dealt, isCrit, sk.elem, false, 'npc');
    }
  };

  effects.push({
    mesh: proj,
    t: travelTime,
    max: travelTime,
    vx: ndx * speed,
    vz: ndz * speed,
    targetX: target.x,
    targetZ: target.z,
    onStep: (curX, curZ) => {
      if(!hitRegistered && target && !target.dead){
        const tdx = curX - target.x, tdz = curZ - target.z;
        if(tdx * tdx + tdz * tdz <= 1.44){
          triggerHit(target.x, target.z);
        }
      }
    },
    onComplete: () => {
      triggerHit(target.x, target.z);
    }
  });'''

text = text.replace(old_npc_skill, new_npc_skill)

# 4. In updateEffects, ensure onStep and onComplete are processed for vltkSword and generic mesh
old_sword_loop = '''    // --- VLTK 1: Phi Kiếm 3D bay ngang / Phi kiếm hình quạt ---
    if(e.vltkSword&&!e.vltkDone){
      e.vltkSword.position.x+=e.vx*dt;
      e.vltkSword.position.z+=e.vz*dt;
      
      // Đồng bộ ánh sáng dynamic light
      if(e.light){
        e.light.position.x=e.vltkSword.position.x;
        e.light.position.y=e.vltkSword.position.y;
        e.light.position.z=e.vltkSword.position.z;
      }

      // Vệt tia tàn kiếm khí phát quang Additive phụt ra từ chuôi kiếm
      e.trailTimer-=dt;
      if(e.trailTimer<=0){
        e.trailTimer=e.trailInterval||0.02;
        if(effects.length<180){
          const spColor=e.color||'#7ceaff';
          const sm=BABYLON.MeshBuilder.CreateSphere('sword_spark',{diameter:rnd(0.08,0.18),segments:3},scene);
          sm.position.set(
            e.vltkSword.position.x+rnd(-0.1,0.1),
            e.vltkSword.position.y+rnd(-0.08,0.08),
            e.vltkSword.position.z+rnd(-0.1,0.1)
          );
          sm.material=glowMat('sp_'+spColor,spColor,0.92,2.2,true);
          sm.isPickable=false;
          const vLen=Math.hypot(e.vx,e.vz)||1;
          effects.push({mesh:sm,t:rnd(0.14,0.26),max:0.26,vx:-(e.vx/vLen)*rnd(1.0,2.5),vz:-(e.vz/vLen)*rnd(1.0,2.5),vy:rnd(0.3,1.2)});
        }
      }

      // Đâm trúng mục tiêu -> Nổ kiếm khí
      if(e.t<=0&&!e.vltkDone){
        e.vltkDone=true;
        if(e.light) e.light.dispose();
        explodeVltkSwordImpact(e.skill,e.targetX,e.targetZ,!!e.isFanSword,6.0,e.color);
        try{ e.vltkSword.dispose(); }catch(err){}
      }
      continue;
    }'''

new_sword_loop = '''    // --- VLTK 1: Phi Kiếm 3D bay ngang / Phi kiếm hình quạt ---
    if(e.vltkSword&&!e.vltkDone){
      e.vltkSword.position.x+=e.vx*dt;
      e.vltkSword.position.z+=e.vz*dt;
      
      // Đồng bộ ánh sáng dynamic light
      if(e.light){
        e.light.position.x=e.vltkSword.position.x;
        e.light.position.y=e.vltkSword.position.y;
        e.light.position.z=e.vltkSword.position.z;
      }

      // Vệt tia tàn kiếm khí phát quang Additive phụt ra từ chuôi kiếm
      e.trailTimer-=dt;
      if(e.trailTimer<=0){
        e.trailTimer=e.trailInterval||0.02;
        if(effects.length<180){
          const spColor=e.color||'#7ceaff';
          const sm=BABYLON.MeshBuilder.CreateSphere('sword_spark',{diameter:rnd(0.08,0.18),segments:3},scene);
          sm.position.set(
            e.vltkSword.position.x+rnd(-0.1,0.1),
            e.vltkSword.position.y+rnd(-0.08,0.08),
            e.vltkSword.position.z+rnd(-0.1,0.1)
          );
          sm.material=glowMat('sp_'+spColor,spColor,0.92,2.2,true);
          sm.isPickable=false;
          const vLen=Math.hypot(e.vx,e.vz)||1;
          effects.push({mesh:sm,t:rnd(0.14,0.26),max:0.26,vx:-(e.vx/vLen)*rnd(1.0,2.5),vz:-(e.vz/vLen)*rnd(1.0,2.5),vy:rnd(0.3,1.2)});
        }
      }

      // Quét va chạm thời gian thực (vừa chạm quái là nổ)
      if(e.onStep){
        e.onStep(e.vltkSword.position.x, e.vltkSword.position.z, e, dt);
      }

      // Đâm trúng mục tiêu -> Nổ kiếm khí
      if(e.t<=0&&!e.vltkDone){
        e.vltkDone=true;
        if(e.light) e.light.dispose();
        if(e.onComplete) e.onComplete();
        explodeVltkSwordImpact(e.skill,e.targetX,e.targetZ,!!e.isFanSword,6.0,e.color);
        try{ e.vltkSword.dispose(); }catch(err){}
      }
      continue;
    }'''

text = text.replace(old_sword_loop, new_sword_loop)

# 5. Generic mesh loop
old_mesh_loop = '''    if(e.vx!=null){
      e.mesh.position.x+=e.vx*dt;
      e.mesh.position.z+=e.vz*dt;
      e.mesh.position.y+=e.vy*dt;
      e.vy-=3*dt;
      e.mesh.scaling.scaleInPlace(.97);
    }
    if(e.grow){
      let k=1+(1-e.t/e.max)*e.grow;
      e.mesh.scaling.setAll(k);
    }
    if(e.t<=0){
      e.mesh.dispose();
    }'''

new_mesh_loop = '''    if(e.vx!=null){
      e.mesh.position.x+=e.vx*dt;
      e.mesh.position.z+=e.vz*dt;
      e.mesh.position.y+=e.vy*dt;
      e.vy-=3*dt;
      e.mesh.scaling.scaleInPlace(.97);
      if(e.onStep){
        e.onStep(e.mesh.position.x, e.mesh.position.z, e, dt);
      }
    }
    if(e.grow){
      let k=1+(1-e.t/e.max)*e.grow;
      e.mesh.scaling.setAll(k);
    }
    if(e.t<=0){
      if(e.onComplete) e.onComplete();
      try{ e.mesh.dispose(); }catch(err){}
    }'''

text = text.replace(old_mesh_loop, new_mesh_loop)

with open('src/game-runtime.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated all projectile real-time impact logic!')

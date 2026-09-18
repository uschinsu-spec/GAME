(()=>{'use strict';
const BOOT_VERSION='20260918-v13';
const GAME_VERSION='34';
const WORLD_VERSION='5';
const SKILL_VERSION='2';

function validateSource(src,stage){
  try{
    new Function(src);
    console.info('[Boot/Audit] '+stage+': syntax OK');
    return {ok:true,error:null};
  }catch(error){
    console.error('[Boot/Audit] '+stage+': syntax FAIL',error);
    return {ok:false,error};
  }
}

function isMobileRuntime(){
  const ua=navigator.userAgent||'';
  const touch=(navigator.maxTouchPoints||0)>1;
  return /iPhone|iPad|iPod|Android|Mobile/i.test(ua)||touch||Math.min(innerWidth||9999,innerHeight||9999)<820;
}

function sanitizeGameSource(src){
  if(typeof src!=='string')return src;
  let changed=false;

  // game.js từng bị chèn nhầm output của công cụ vào đầu file.
  const preamble=/^\uFEFF?Warning:\s*truncated output[^\n]*\nTotal output lines:\s*\d+\s*\n+/;
  if(preamble.test(src)){
    src=src.replace(preamble,'');
    changed=true;
    console.warn('[Boot/Audit] Đã loại bỏ preamble rác khỏi game.js.');
  }

  // Commit refactor map từng chèn marker truncate vào giữa combat.
  // Khôi phục nguyên block chuẩn trước khi compile.
  const brokenCombat=/const sourceSuppress=getRealmSuppressionByScores\(sourceScore,sourceMa…310 tokens truncated…tem\('Linh Thạch',1\);/;
  if(brokenCombat.test(src)){
    src=src.replace(brokenCombat,`const sourceSuppress=getRealmSuppressionByScores(sourceScore,sourceMajor,info.score,info.major);
  const defenderSuppress=getRealmSuppressionByScores(info.score,info.major,sourceScore,sourceMajor);
  d=Math.max(1,Math.round(d*sourceSuppress/Math.max(1,defenderSuppress)));
  a.hp-=d;
  sfx(crit?'slash':'hit');
  floatText(a.mesh.position,(label?label+' ':'')+'-'+d+' '+(DAMAGE_LABELS[type]||''),crit?'#fff08b':(DAMAGE_COLORS[type]||'#ffd08a'));
  flash(a.mesh);
  if(a===boss)$('#bossFill').style.width=clamp(a.hp/a.maxHp*100,0,100)+'%';
  if(a.hp<=0)kill(a);
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

function kill(a){
  a.dead=true;
  a.mesh.setEnabled(false);
  if(a.shadow)a.shadow.setEnabled(false);
  S.kills++;
  S.questKills++;
  gainXP(a.xp);
  const formationCult=window.TuTienSystems?window.TuTienSystems.getCultivationMultiplier(S,player):1;
  S.cultivation+=Math.round(a.xp*.85*getHeartMethodEffects().cultivation*getTechniqueCultivationMultiplier()*formationCult);
  
  // Loot
  if(Math.random()<.75){
    let g=Math.round(rnd(6,25)*(1+S.level*.05));
    S.gold+=g;
    if(Math.random()<.2){
      S.stones++;
      addItem('Linh Thạch',1);`);
    changed=true;
    console.warn('[Boot/Audit] Đã phục hồi block combat bị truncate trong game.js.');
  }

  if(changed)console.info('[Boot/Audit] game.js đã được repair trước compile.');
  return src;
}

function validateSkillMaster(){
  const m=window.TuTienSkillMaster;
  if(!m||m.skillCount!==144||!m.elements)throw new Error('Skill master không đủ 144 skill');
  const elements=Object.values(m.elements);
  if(elements.length!==9)throw new Error('Skill master phải có đúng 9 hệ');
  const total=elements.reduce((n,e)=>n+(Array.isArray(e.names)?e.names.length:0),0);
  if(total!==144)throw new Error('Skill master names không đủ 144 skill ('+total+')');
  if(!Array.isArray(m.balance)||m.balance.length!==16)throw new Error('Skill balance phải có 16 tổ hợp cấp/phẩm');
  console.info('[Skill/Audit] 144 skill / 9 hệ / 16 bậc: OK');
}

function replaceIfFound(src,from,to,label){
  const next=src.replace(from,to);
  if(next!==src)console.info('[Perf] '+label);
  return next;
}

function optimizeGameSource(src){
  const mobile=isMobileRuntime();
  console.info('[Perf] Runtime profile:',mobile?'MOBILE':'DESKTOP');

  // Không preload toàn bộ 7×16 enemy texture. spriteFrames() sẽ lazy-load theo loại quái xuất hiện.
  src=replaceIfFound(src,/\n\s*preloadEnemySprites\(\);[^\n]*/,'\n  // Enemy textures: lazy-load theo loại quái đang xuất hiện','enemy lazy-load');

  // Giảm burst spawn ban đầu và khi đổi map, vẫn giữ giới hạn actor đủ đông để combat.
  src=replaceIfFound(src,'for(let i=0;i<16;i++)spawnPack();',`for(let i=0;i<${mobile?4:8};i++)spawnPack();`,'initial enemy packs');
  src=replaceIfFound(src,'for(let i=0;i<12;i++)spawnPack();',`for(let i=0;i<${mobile?5:8};i++)spawnPack();`,'map-change enemy packs');
  if(mobile)src=replaceIfFound(src,'if(actors.filter(a=>!a.dead).length>30)return;','if(actors.filter(a=>!a.dead).length>22)return;','mobile actor cap');

  // Giảm số mesh môi trường ngẫu nhiên trên mobile. Công trình/map landmark giữ nguyên.
  if(mobile){
    src=replaceIfFound(src,'const count=240; // khoảng cách ~1.08 world-unit, đủ kín cả ở frame cạnh mỏng.','const count=156; // mobile: giảm draw calls nhưng vẫn giữ vòng tường liên tục.','mobile village wall density');
    src=replaceIfFound(src,"for(let i=0;i<(cfg.treeCount||400);i++){","for(let i=0;i<Math.min((cfg.treeCount||400),180);i++){",'mobile tree cap');
    src=replaceIfFound(src,"for(let i=0;i<(cfg.rockCount||220);i++){","for(let i=0;i<Math.min((cfg.rockCount||220),105);i++){",'mobile rock cap');
    src=replaceIfFound(src,"for(let i=0;i<(cfg.grassCount||140);i++){","for(let i=0;i<Math.min((cfg.grassCount||140),75);i++){",'mobile grass cap');
    src=replaceIfFound(src,"if(!propDef.noShadow){","if(!propDef.noShadow && (Math.hypot(x,z)<82 || name.includes('village') || name.includes('gate'))){",'mobile shadow culling');
    src=replaceIfFound(src,'gt.anisotropicFilteringLevel=8;','gt.anisotropicFilteringLevel=2;','mobile anisotropic filtering');
    src=replaceIfFound(src,'let dpr=Math.min(window.devicePixelRatio||1, 2.0);','let dpr=Math.min(window.devicePixelRatio||1, 1.5);','mobile render scale cap');
    src=replaceIfFound(src,'antialias:true,','antialias:false,','mobile engine antialias');
    src=replaceIfFound(src,'await new Promise(r=>setTimeout(r,250));','await new Promise(r=>setTimeout(r,60));','shorter startup wait');
    src=replaceIfFound(src,'let particleCount=skill.tierIdx===3?60:skill.tierIdx===2?40:24;','let particleCount=skill.tierIdx===3?36:skill.tierIdx===2?26:18;','mobile skill particles');
  }else{
    src=replaceIfFound(src,'gt.anisotropicFilteringLevel=8;','gt.anisotropicFilteringLevel=4;','desktop anisotropic filtering');
    src=replaceIfFound(src,'await new Promise(r=>setTimeout(r,250));','await new Promise(r=>setTimeout(r,100));','shorter startup wait');
  }

  // Không cần pointer picking liên tục trong game canvas; giảm CPU main-thread.
  src=replaceIfFound(src,"scene=new BABYLON.Scene(engine);","scene=new BABYLON.Scene(engine);\n  scene.skipPointerMovePicking=true;\n  scene.constantlyUpdateMeshUnderPointer=false;",'scene pointer picking off');

  return src;
}

async function fetchText(url,label){
  // URL luôn có version; cho browser tái sử dụng cache thay vì no-store mỗi lần mở GAME.
  const res=await fetch(url,{cache:'default'});
  if(!res.ok)throw new Error('Không tải được '+label+' ('+res.status+')');
  return res.text();
}

async function boot(){
  const msg=document.querySelector('#loadMsg');
  try{
    if(msg)msg.textContent='Đang kiểm tra và tối ưu GAME…';

    // Tải song song để giảm thời gian boot trên mạng di động.
    const gamePromise=fetchText('./game.js?v='+GAME_VERSION,'game.js');
    const worldPromise=fetchText('./world-runtime.js?v='+WORLD_VERSION,'world-runtime.js').catch(error=>({__error:error}));
    const masterPromise=fetchText('./skill-master-data.js?v='+SKILL_VERSION,'skill-master-data.js').catch(error=>({__error:error}));
    const runtimePromise=fetchText('./skill-runtime.js?v='+SKILL_VERSION,'skill-runtime.js').catch(error=>({__error:error}));

    let rawSrc=await gamePromise;
    rawSrc=sanitizeGameSource(rawSrc);
    const rawCheck=validateSource(rawSrc,'game.js sau repair');
    if(!rawCheck.ok)throw new Error('game.js lỗi cú pháp sau repair: '+rawCheck.error.message);
    let src=rawSrc;

    // WORLD patch độc lập: lỗi thì rollback riêng world, không kéo sập GAME.
    try{
      const worldText=await worldPromise;
      if(!worldText||worldText.__error)throw (worldText&&worldText.__error)||new Error('world-runtime trống');
      const worldRuntimeCheck=validateSource(worldText,'world-runtime.js');
      if(!worldRuntimeCheck.ok)throw new Error('world-runtime.js lỗi cú pháp: '+worldRuntimeCheck.error.message);
      (0,eval)(worldText+'\n//# sourceURL=world-runtime.js');
      if(typeof window.TuTienWorldPatch==='function'){
        const beforeWorldPatch=src;
        const worldPatched=window.TuTienWorldPatch(src);
        const worldOutputCheck=validateSource(worldPatched,'game.js sau WORLD patch');
        if(worldOutputCheck.ok){
          src=worldPatched;
          console.info('[Boot/Audit] WORLD patch hợp lệ.',window.TuTienWorldPatchErrors||[]);
        }else{
          src=beforeWorldPatch;
          console.error('[Boot/Audit] WORLD patch tạo source lỗi — rollback WORLD:',worldOutputCheck.error);
          if(msg)msg.textContent='Đang vào GAME (đã cô lập lỗi world/map)…';
        }
      }
    }catch(worldErr){
      console.error('[Boot/Audit] World runtime fallback:',worldErr);
      if(msg)msg.textContent='Đang vào GAME (world/map mở rộng tạm bỏ qua)…';
    }

    // SKILL patch: master Excel + runtime combat. Không đụng asset VFX.
    try{
      const [masterText,runtimeText]=await Promise.all([masterPromise,runtimePromise]);
      if(!masterText||masterText.__error)throw (masterText&&masterText.__error)||new Error('skill master trống');
      if(!runtimeText||runtimeText.__error)throw (runtimeText&&runtimeText.__error)||new Error('skill runtime trống');
      const masterCheck=validateSource(masterText,'skill-master-data.js');
      if(!masterCheck.ok)throw new Error('skill-master-data.js lỗi cú pháp: '+masterCheck.error.message);
      const runtimeCheck=validateSource(runtimeText,'skill-runtime.js');
      if(!runtimeCheck.ok)throw new Error('skill-runtime.js lỗi cú pháp: '+runtimeCheck.error.message);
      (0,eval)(masterText+'\n//# sourceURL=skill-master-data.js');
      validateSkillMaster();
      (0,eval)(runtimeText+'\n//# sourceURL=skill-runtime.js');
      if(typeof window.TuTienSkillPatch!=='function')throw new Error('TuTienSkillPatch không tồn tại');
      const beforeSkillPatch=src;
      const skillPatched=window.TuTienSkillPatch(src);
      const skillOutputCheck=validateSource(skillPatched,'game.js sau SKILL patch');
      if(skillOutputCheck.ok){
        src=skillPatched;
        console.info('[Boot/Audit] SKILL Excel 144/144 hợp lệ.');
      }else{
        src=beforeSkillPatch;
        console.error('[Boot/Audit] SKILL patch tạo source lỗi — rollback SKILL:',skillOutputCheck.error);
        if(msg)msg.textContent='Đang vào GAME (đã cô lập lỗi skill mở rộng)…';
      }
    }catch(skillErr){
      console.error('[Boot/Audit] Skill runtime fallback:',skillErr);
      if(msg)msg.textContent='Đang vào GAME (skill mở rộng tạm bỏ qua)…';
    }

    src=optimizeGameSource(src);

    const finalCheck=validateSource(src,'GAME cuối cùng');
    if(!finalCheck.ok)throw new Error('GAME cuối cùng lỗi cú pháp: '+finalCheck.error.message);
    if(msg)msg.textContent='Đang vào tiên đồ…';
    console.info('[Boot] '+BOOT_VERSION+' ready');
    (0,eval)(src+'\n//# sourceURL=game.optimized.js');
  }catch(err){
    console.error('Boot error:',err);
    if(msg)msg.textContent='Lỗi tải GAME: '+err.message;
  }
}
boot();
})();

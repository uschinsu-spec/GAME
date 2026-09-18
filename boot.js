(()=>{'use strict';
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

  // Commit refactor map 524c98a6 đã vô tình chèn marker truncate vào GIỮA code,
  // làm mất phần cuối damageFromRealmSource(), getSystemContext() và đầu kill().
  // Khôi phục nguyên đoạn chuẩn từ parent commit 75221256 trước khi parse source.
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
async function fetchText(url,label){
  const res=await fetch(url,{cache:'no-store'});
  if(!res.ok)throw new Error('Không tải được '+label+' ('+res.status+')');
  return res.text();
}
async function boot(){
  const msg=document.querySelector('#loadMsg');
  try{
    if(msg)msg.textContent='Đang kiểm tra toàn bộ GAME…';

    let rawSrc=await fetchText('./game.js?v=33','game.js');
    rawSrc=sanitizeGameSource(rawSrc);
    const rawCheck=validateSource(rawSrc,'game.js sau repair');
    if(!rawCheck.ok)throw new Error('game.js lỗi cú pháp sau repair: '+rawCheck.error.message);
    let src=rawSrc;

    try{
      const worldText=await fetchText('./world-runtime.js?v=5','world-runtime.js');
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
          if(msg)msg.textContent='Đang khởi động GAME (đã cô lập lỗi world/map)…';
        }
      }
    }catch(worldErr){
      console.error('[Boot/Audit] World runtime fallback:',worldErr);
      src=rawSrc;
      if(msg)msg.textContent='Đang khởi động GAME (world/map tạm bỏ qua)…';
    }

    try{
      const [masterText,runtimeText]=await Promise.all([
        fetchText('./skill-master-data.js?v=2','skill-master-data.js'),
        fetchText('./skill-runtime.js?v=2','skill-runtime.js')
      ]);
      const masterCheck=validateSource(masterText,'skill-master-data.js');
      if(!masterCheck.ok)throw new Error('skill-master-data.js lỗi cú pháp: '+masterCheck.error.message);
      const runtimeCheck=validateSource(runtimeText,'skill-runtime.js');
      if(!runtimeCheck.ok)throw new Error('skill-runtime.js lỗi cú pháp: '+runtimeCheck.error.message);
      (0,eval)(masterText+'\n//# sourceURL=skill-master-data.js');
      (0,eval)(runtimeText+'\n//# sourceURL=skill-runtime.js');
      if(typeof window.TuTienSkillPatch!=='function')throw new Error('TuTienSkillPatch không tồn tại');
      const beforeSkillPatch=src;
      const skillPatched=window.TuTienSkillPatch(src);
      const skillOutputCheck=validateSource(skillPatched,'game.js sau SKILL patch');
      if(skillOutputCheck.ok){
        src=skillPatched;
        console.info('[Boot/Audit] SKILL patch hợp lệ.');
      }else{
        src=beforeSkillPatch;
        console.error('[Boot/Audit] SKILL patch tạo source lỗi — rollback SKILL:',skillOutputCheck.error);
        if(msg)msg.textContent='Đang khởi động GAME (đã cô lập lỗi skill)…';
      }
    }catch(skillErr){
      console.error('[Boot/Audit] Skill runtime fallback:',skillErr);
      if(msg)msg.textContent='Đang khởi động GAME (skill mở rộng tạm bỏ qua)…';
    }

    src=src.replace(/\n\s*preloadEnemySprites\(\);[^\n]*/,'\n  // Enemy textures: lazy-load theo loại quái đang xuất hiện');
    src=src.replace('for(let i=0;i<16;i++)spawnPack();','for(let i=0;i<4;i++)spawnPack();');

    const finalCheck=validateSource(src,'GAME cuối cùng');
    if(!finalCheck.ok)throw new Error('GAME cuối cùng lỗi cú pháp: '+finalCheck.error.message);
    if(msg)msg.textContent='Đang vào tiên đồ…';
    (0,eval)(src+'\n//# sourceURL=game.optimized.js');
  }catch(err){
    console.error('Boot error:',err);
    if(msg)msg.textContent='Lỗi tải GAME: '+err.message;
  }
}
boot();
})();

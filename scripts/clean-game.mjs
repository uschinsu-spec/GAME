import fs from 'node:fs';
import vm from 'node:vm';

const read=p=>fs.readFileSync(p,'utf8');
const write=(p,s)=>fs.writeFileSync(p,s,'utf8');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const syntax=(src,label)=>{try{new Function(src);console.log('✓',label);return true}catch(e){console.error('✗',label,e);throw e}};

function repair(src){
  src=src.replace(/^\uFEFF?Warning:\s*truncated output[^\n]*\nTotal output lines:\s*\d+\s*\n+/,'');
  const broken=/const sourceSuppress=getRealmSuppressionByScores\(sourceScore,sourceMa…310 tokens truncated…tem\('Linh Thạch',1\);/;
  if(broken.test(src)){
    src=src.replace(broken,`const sourceSuppress=getRealmSuppressionByScores(sourceScore,sourceMajor,info.score,info.major);
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
  }
  assert(!/truncated output|tokens truncated/.test(src),'game.js vẫn còn marker truncate');
  syntax(src,'game.js repaired');
  return src;
}

function loadPatcher(file,exportName){
  const context={window:{},console,setTimeout,clearTimeout,performance:{now:()=>Date.now()}};
  context.window.window=context.window;
  vm.createContext(context);
  vm.runInContext(read(file),context,{filename:file});
  const fn=context.window[exportName];
  assert(typeof fn==='function',`${exportName} không tồn tại trong ${file}`);
  return fn;
}

function applyOnce(src,from,to,label){
  const out=src.replace(from,to);
  if(out===src)console.warn('! không tìm thấy:',label);
  else console.log('✓ optimize:',label);
  return out;
}

function optimize(src){
  if(!src.includes('const MOBILE_RUNTIME=')){
    src=src.replace("(()=>{'use strict';",`(()=>{'use strict';\nconst MOBILE_RUNTIME=/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent||'')||(navigator.maxTouchPoints||0)>1||Math.min(innerWidth||9999,innerHeight||9999)<820;`);
  }

  // Thanh Vân Thôn: khi người chơi còn ở khu an toàn, quái tuần tra quanh cổng/vòng ngoài
  // thay vì bị đẩy ngẫu nhiên sang đoạn tường xa. Khi ra khỏi thôn, spawn gần người chơi hơn.
  src=applyOnce(src,/function spawnPack\(\)\{[\s\S]*?\n\}\n\nfunction spawnBoss\(\)\{/,
`function spawnPack(){
  if(actors.filter(a=>!a.dead).length>(MOBILE_RUNTIME?22:30))return;
  let rr=region(), pool=rr.enemy, type=pool[Math.floor(Math.random()*pool.length)];
  let baseX=player.x,baseZ=player.z;

  if(rr.id==='thanh_van_thon'&&isVillageSafe(player.x,player.z)){
    const patrols=[
      {x:-7,z:-(VILLAGE_WALL_RZ+7)},{x:7,z:-(VILLAGE_WALL_RZ+7)},
      {x:-7,z:(VILLAGE_WALL_RZ+7)},{x:7,z:(VILLAGE_WALL_RZ+7)},
      {x:-(VILLAGE_WALL_RX+7),z:-12},{x:(VILLAGE_WALL_RX+7),z:12}
    ];
    const p=patrols[Math.floor(Math.random()*patrols.length)];
    baseX=p.x;baseZ=p.z;
  }else{
    let ang=rnd(0,Math.PI*2),r=rnd(MOBILE_RUNTIME?13:16,MOBILE_RUNTIME?22:28);
    baseX=clamp(player.x+Math.cos(ang)*r,-MAP_BOUND,MAP_BOUND);
    baseZ=clamp(player.z+Math.sin(ang)*r,-MAP_BOUND,MAP_BOUND);
  }

  const packSize=(type==='wolf'||type==='boar')?3:2;
  for(let i=0;i<packSize;i++){
    let spawnX=clamp(baseX+rnd(-3.2,3.2),-MAP_BOUND,MAP_BOUND);
    let spawnZ=clamp(baseZ+rnd(-3.2,3.2),-MAP_BOUND,MAP_BOUND);
    if(isVillageSafe(spawnX,spawnZ)){
      let a=Math.atan2(spawnZ,spawnX);
      if(!Number.isFinite(a))a=0;
      spawnX=clamp(Math.cos(a)*(VILLAGE_WALL_RX+6),-MAP_BOUND,MAP_BOUND);
      spawnZ=clamp(Math.sin(a)*(VILLAGE_WALL_RZ+6),-MAP_BOUND,MAP_BOUND);
    }
    makeActor(type,spawnX,spawnZ,Math.random()<.08);
  }
}

function spawnBoss(){`, 'Thanh Van Thon patrol spawn');

  src=applyOnce(src,/\n\s*preloadEnemySprites\(\);[^\n]*/,'\n  // Enemy texture lazy-load theo loại quái thực tế xuất hiện','enemy lazy-load');
  src=applyOnce(src,'for(let i=0;i<16;i++)spawnPack();','for(let i=0;i<(MOBILE_RUNTIME?6:10);i++)spawnPack();','initial spawn');
  src=applyOnce(src,'for(let i=0;i<12;i++)spawnPack();','for(let i=0;i<(MOBILE_RUNTIME?6:9);i++)spawnPack();','map spawn');
  src=applyOnce(src,'if(actors.filter(a=>!a.dead).length>30)return;','if(actors.filter(a=>!a.dead).length>(MOBILE_RUNTIME?22:30))return;','actor cap');
  src=applyOnce(src,'const count=240; // khoảng cách ~1.08 world-unit, đủ kín cả ở frame cạnh mỏng.','const count=MOBILE_RUNTIME?156:240; // adaptive wall density','wall density');
  src=applyOnce(src,"for(let i=0;i<(cfg.treeCount||400);i++){","for(let i=0;i<(MOBILE_RUNTIME?Math.min((cfg.treeCount||400),180):(cfg.treeCount||400));i++){",'tree cap');
  src=applyOnce(src,"for(let i=0;i<(cfg.rockCount||220);i++){","for(let i=0;i<(MOBILE_RUNTIME?Math.min((cfg.rockCount||220),105):(cfg.rockCount||220));i++){",'rock cap');
  src=applyOnce(src,"for(let i=0;i<(cfg.grassCount||140);i++){","for(let i=0;i<(MOBILE_RUNTIME?Math.min((cfg.grassCount||140),75):(cfg.grassCount||140));i++){",'grass cap');
  src=applyOnce(src,"if(!propDef.noShadow){","if(!propDef.noShadow && (!MOBILE_RUNTIME || Math.hypot(x,z)<82 || name.includes('village') || name.includes('gate'))){",'shadow culling');
  src=applyOnce(src,'gt.anisotropicFilteringLevel=8;','gt.anisotropicFilteringLevel=MOBILE_RUNTIME?2:4;','anisotropic');
  src=applyOnce(src,'let dpr=Math.min(window.devicePixelRatio||1, 2.0);','let dpr=Math.min(window.devicePixelRatio||1, MOBILE_RUNTIME?1.5:2.0);','render scale');
  src=applyOnce(src,'antialias:true,','antialias:!MOBILE_RUNTIME,','antialias');
  src=applyOnce(src,'await new Promise(r=>setTimeout(r,250));','await new Promise(r=>setTimeout(r,MOBILE_RUNTIME?60:100));','startup delay');
  src=applyOnce(src,'let particleCount=skill.tierIdx===3?60:skill.tierIdx===2?40:24;','let particleCount=MOBILE_RUNTIME?(skill.tierIdx===3?36:skill.tierIdx===2?26:18):(skill.tierIdx===3?60:skill.tierIdx===2?40:24);','skill particles');
  src=applyOnce(src,"scene=new BABYLON.Scene(engine);","scene=new BABYLON.Scene(engine);\n  scene.skipPointerMovePicking=true;\n  scene.constantlyUpdateMeshUnderPointer=false;",'pointer picking');
  return src;
}

let src=repair(read('game.js'));
const worldPatch=loadPatcher('world-runtime.js','TuTienWorldPatch');
src=worldPatch(src);
syntax(src,'game.js + world');
const skillPatch=loadPatcher('skill-runtime.js','TuTienSkillPatch');
src=skillPatch(src);
syntax(src,'game.js + 144 skill');
src=optimize(src);
src=src.replace(/[ \t]+$/gm,'');
syntax(src,'game.js final optimized');
assert(src.includes('const SKILL_MASTER=window.TuTienSkillMaster'),'skill master chưa được tích hợp');
assert(src.includes("rr.id==='thanh_van_thon'&&isVillageSafe(player.x,player.z)"),'Thanh Vân Thôn patrol spawn chưa được tích hợp');
assert(!src.includes('…310 tokens truncated…'),'corruption vẫn còn');
write('game.js',src);

let index=read('index.html');
index=index.replace(/<script src="boot\.js\?v=\d+"><\/script>/,`<script>\nwindow.addEventListener('error',function(e){var m=document.getElementById('loadMsg');if(m)m.textContent='Lỗi GAME: '+(e.message||'Không xác định');});\n<\/script>\n<script src="skill-master-data.js?v=3"><\/script>\n<script src="game.js?v=36"><\/script>`);
index=index.replace(/game\.js\?v=\d+/,'game.js?v=36');
assert(index.includes('skill-master-data.js?v=3')&&index.includes('game.js?v=36'),'Không cập nhật được index.html');
write('index.html',index);

console.log('✓ CLEAN BUILD hoàn tất: game.js không còn runtime source patch/eval');

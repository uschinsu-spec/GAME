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

  // ===== FIXED WORLD ENEMY POPULATION =====
  // Tọa độ được sinh deterministically theo map id + slot id. Không phụ thuộc player.
  // Thanh Vân Thôn: vùng gần safe-zone thưa; càng xa trung tâm mật độ càng cao.
  src=applyOnce(src,/function spawnPack\(\)\{[\s\S]*?\n\}\n\nfunction spawnBoss\(\)\{/,
`function enemySeedHash(text){
  let h=2166136261>>>0;
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}
function enemySeedRand(seed){
  seed=(seed+0x6D2B79F5)>>>0;
  let t=seed;
  t=Math.imul(t^(t>>>15),t|1);
  t^=t+Math.imul(t^(t>>>7),t|61);
  return {seed,value:((t^(t>>>14))>>>0)/4294967296};
}
function buildFixedEnemySpawns(){
  const rr=region();
  const isVillage=rr.id==='thanh_van_thon';
  const bands=isVillage?[
    {min:56,max:120,count:6},
    {min:120,max:240,count:16},
    {min:240,max:360,count:28},
    {min:360,max:470,count:46}
  ]:[
    {min:35,max:150,count:12},
    {min:150,max:280,count:22},
    {min:280,max:390,count:28},
    {min:390,max:470,count:34}
  ];
  const pool=(rr.enemy&&rr.enemy.length)?rr.enemy:['boar'];
  const points=[];
  let slot=0;
  for(let bi=0;bi<bands.length;bi++){
    const b=bands[bi];
    for(let i=0;i<b.count;i++,slot++){
      let seed=enemySeedHash(rr.id+':'+bi+':'+i);
      let r1=enemySeedRand(seed);seed=r1.seed;
      let r2=enemySeedRand(seed);seed=r2.seed;
      let r3=enemySeedRand(seed);seed=r3.seed;
      let r4=enemySeedRand(seed);
      const angle=((i+r1.value*.72)/b.count)*Math.PI*2 + bi*.31;
      const radius=Math.sqrt(b.min*b.min+r2.value*(b.max*b.max-b.min*b.min));
      let x=Math.cos(angle)*radius;
      let z=Math.sin(angle)*radius;
      x=clamp(x,-MAP_BOUND,MAP_BOUND);
      z=clamp(z,-MAP_BOUND,MAP_BOUND);
      if(isVillageSafe(x,z)){
        const p=clampToEllipse(x||1,z||1,VILLAGE_WALL_RX+8,VILLAGE_WALL_RZ+8,1.02);
        x=p.x;z=p.z;
      }
      points.push({
        id:rr.id+'_mob_'+slot,
        x,z,
        type:pool[Math.floor(r3.value*pool.length)%pool.length],
        elite:r4.value<(.025+bi*.012),
        band:bi
      });
    }
  }
  return points;
}
function initializeFixedEnemies(){
  for(const a of actors){
    try{if(a.mesh)a.mesh.dispose();}catch(e){}
    try{if(a.shadow)a.shadow.dispose();}catch(e){}
  }
  actors=[];
  boss=null;
  const points=buildFixedEnemySpawns();
  for(const p of points){
    const a=makeActor(p.type,p.x,p.z,p.elite);
    a.fixedSpawn=true;
    a.spawnId=p.id;
    a.spawnBand=p.band;
    a.homeX=p.x;
    a.homeZ=p.z;
    a.respawnDelay=12+p.band*3;
  }
  console.info('[EnemyPopulation] '+region().name+': '+points.length+' fixed spawn points');
}
function respawnFixedEnemy(a){
  if(!a||!a.fixedSpawn)return;
  a.x=a.homeX;a.z=a.homeZ;
  a.hp=a.maxHp;
  a.dead=false;
  a.attackCd=rnd(.2,.8);
  a.stunT=0;
  a.skillStatus={};a.skillDots={};a.skillBurnExplode=null;
  if(a.mesh){a.mesh.position.set(a.x,a.size*.48,a.z);a.mesh.setEnabled(true);}
  if(a.shadow){a.shadow.position.x=a.x;a.shadow.position.z=a.z;a.shadow.setEnabled(true);}
}

function spawnBoss(){`, 'fixed coordinate enemy population');

  // Quái cố định quay về home khi không giao chiến; không kéo quái xuyên nửa bản đồ.
  src=applyOnce(src,
`  if(!playerSafe && d>1.7 && (d<24 || a===boss)){
    let oldX=a.x, oldZ=a.z;`,
`  if(a.fixedSpawn && (playerSafe || d>=24)){
    const hdx=a.homeX-a.x, hdz=a.homeZ-a.z, hd=Math.hypot(hdx,hdz);
    if(hd>.35){
      const homeStep=Math.min(hd,a.speed*.65*dt);
      a.x+=hdx/Math.max(.001,hd)*homeStep;
      a.z+=hdz/Math.max(.001,hd)*homeStep;
    }
  }

  if(!playerSafe && d>1.7 && (d<24 || a===boss)){
    let oldX=a.x, oldZ=a.z;`, 'fixed enemy leash');

  // Quái cố định chết sẽ hồi sinh ở đúng spawn point thay vì bị xóa khỏi world.
  src=applyOnce(src,
`  setTimeout(()=>{
    if(a.mesh)a.mesh.dispose();
    if(a.shadow)a.shadow.dispose();
    actors=actors.filter(x=>x!==a);
  },800);`,
`  if(a.fixedSpawn){
    const respawnMs=Math.max(8000,(a.respawnDelay||15)*1000);
    setTimeout(()=>respawnFixedEnemy(a),respawnMs);
  }else{
    setTimeout(()=>{
      if(a.mesh)a.mesh.dispose();
      if(a.shadow)a.shadow.dispose();
      actors=actors.filter(x=>x!==a);
    },800);
  }`, 'fixed enemy respawn');

  // Không sinh quái động quanh player trong auto-combat.
  src=applyOnce(src,'    else if(actors.length<10)spawnPack();','    // Enemy population is fixed by map coordinates.','remove auto player spawn');

  // Không sinh pack định kỳ. Chỉ giữ kiểm tra boss theo quest.
  src=applyOnce(src,
`    spawnTimer-=dt;
    if(spawnTimer<=0){
      spawnTimer=2.2;
      spawnPack();
      spawnBoss();
    }`,
`    spawnTimer-=dt;
    if(spawnTimer<=0){
      spawnTimer=2.2;
      spawnBoss();
    }`, 'remove periodic player spawn');

  // Đổi map: dựng lại toàn bộ population cố định của map mới.
  src=applyOnce(src,'        for(let i=0;i<(MOBILE_RUNTIME?5:8);i++)spawnPack();','        initializeFixedEnemies();','map fixed population');

  // Khởi tạo: dựng quái toàn bản đồ một lần, không spawn quanh người chơi.
  src=applyOnce(src,'  for(let i=0;i<(MOBILE_RUNTIME?4:8);i++)spawnPack();','  initializeFixedEnemies();','initial fixed population');

  src=applyOnce(src,/\n\s*preloadEnemySprites\(\);[^\n]*/,'\n  // Enemy texture lazy-load theo loại quái thực tế xuất hiện','enemy lazy-load');
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
const alreadyCompiled=src.includes('const SKILL_MASTER=window.TuTienSkillMaster');
if(!alreadyCompiled){
  const worldPatch=loadPatcher('world-runtime.js','TuTienWorldPatch');
  src=worldPatch(src);
  syntax(src,'game.js + world');
  const skillPatch=loadPatcher('skill-runtime.js','TuTienSkillPatch');
  src=skillPatch(src);
  syntax(src,'game.js + 144 skill');
}else{
  console.log('✓ game.js đã compile world + skill trước đó; bỏ qua patch build-time lặp lại');
}
src=optimize(src);
src=src.replace(/[ \t]+$/gm,'');
syntax(src,'game.js final optimized');
assert(src.includes('const SKILL_MASTER=window.TuTienSkillMaster'),'skill master chưa được tích hợp');
assert(src.includes('function buildFixedEnemySpawns()'),'fixed enemy population chưa được tích hợp');
assert(src.includes('initializeFixedEnemies();'),'map chưa gọi fixed enemy population');
assert(!src.includes('…310 tokens truncated…'),'corruption vẫn còn');
write('game.js',src);

let index=read('index.html');
index=index.replace(/<script src="boot\.js\?v=\d+"><\/script>/,`<script>\nwindow.addEventListener('error',function(e){var m=document.getElementById('loadMsg');if(m)m.textContent='Lỗi GAME: '+(e.message||'Không xác định');});\n<\/script>\n<script src="skill-master-data.js?v=3"><\/script>\n<script src="game.js?v=37"><\/script>`);
index=index.replace(/game\.js\?v=\d+/,'game.js?v=37');
assert(index.includes('skill-master-data.js?v=3')&&index.includes('game.js?v=37'),'Không cập nhật được index.html');
write('index.html',index);

console.log('✓ CLEAN BUILD hoàn tất: fixed-coordinate enemy population active');

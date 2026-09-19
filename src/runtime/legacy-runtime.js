(()=>{'use strict';
const MOBILE_RUNTIME=/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent||'')||(navigator.maxTouchPoints||0)>1||Math.min(innerWidth||9999,innerHeight||9999)<820;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#renderCanvas'), loading=$('#loading'), loadMsg=$('#loadMsg'), loadBar=$('#loadBar'), startBtn=$('#startBtn'), hud=$('#hud');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rnd=(a,b)=>a+Math.random()*(b-a), dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const SAVE='tutien_chilo_save_v2';

// Audio được quản lý bởi src/audio/audio-system.js
function getAudio(){return window.AudioSystem?window.AudioSystem.getAudio():null;}
function sfx(type){return window.AudioSystem?window.AudioSystem.sfx(type):undefined;}

const realms=['Luyện Khí','Trúc Cơ','Kết Đan','Nguyên Anh','Hóa Thần'];
const periods=['Sơ Kỳ','Trung Kỳ','Hậu Kỳ','Đỉnh Phong'];
const ENEMY_GRADES=['Nhất Phẩm','Nhị Phẩm','Tam Phẩm','Tứ Phẩm','Ngũ Phẩm'];
const ENEMY_PERIODS=['Sơ Kỳ','Trung Kỳ','Hậu Kỳ','Đỉnh Phong'];

// ===== CẢNH GIỚI + ÁP CHẾ CẢNH GIỚI =====
// Stat nền tăng theo cảnh giới. Chênh lệch thật sự đến từ "Áp Chế Cảnh Giới".
const REALM_BASE_POWER=[1,2.5,6,15,36];
const REALM_MINOR_MULT=1.25;
const QI_STAGE_MULT=1.08;

function getRealmPowerMultiplier(){
  if((S.realm||0)===0){
    return Math.pow(QI_STAGE_MULT,Math.max(0,(S.realmStage||1)-1));
  }
  const realmIdx=clamp(S.realm||0,1,REALM_BASE_POWER.length-1);
  const minor=clamp(S.period||0,0,3);
  return REALM_BASE_POWER[realmIdx]*Math.pow(REALM_MINOR_MULT,minor);
}

function getRealmPowerText(){
  return getRealmPowerMultiplier().toFixed(2)+'×';
}

// Điểm cảnh giới của người chơi (0..19): Mỗi Đại cảnh giới gồm 4 Tiểu cảnh giới (Sơ, Trung, Hậu, Đỉnh Phong)
function getPlayerRealmScore(){
  if((S.realm||0)===0){
    const stage=clamp(S.realmStage||1,1,12);
    return Math.min(3, Math.floor((stage-1)/3));
  }
  const r=clamp(S.realm||0,1,realms.length-1);
  const p=clamp(S.period||0,0,3);
  return r*4 + p;
}

function getPlayerMajorRealmIndex(){
  return clamp(S.realm||0,0,realms.length-1);
}

// Phân chia phẩm cấp Yêu Thú / Enemy:
// - Nhất Phẩm (Luyện Khí) -> Ngũ Phẩm (Hóa Thần)
// - Mỗi Phẩm cấp chia thành 4 tiểu cảnh giới: Sơ Kỳ, Trung Kỳ, Hậu Kỳ, Đỉnh Phong
function getEnemyRealmInfo(enemyLv=1){
  const lv=Math.max(1,Math.round(enemyLv||1));
  let grade=0, period=0;
  if(lv<=12){
    grade=0; // Nhất Phẩm
    period=Math.min(3, Math.floor((lv-1)/3));
  } else {
    const rem=lv-13;
    grade=clamp(1+Math.floor(rem/16), 1, ENEMY_GRADES.length-1);
    period=clamp(Math.floor((rem%16)/4), 0, 3);
  }
  const score=grade*4 + period;
  return {
    major:grade,
    minor:period,
    grade,
    period,
    score,
    gradeName:ENEMY_GRADES[grade],
    periodName:ENEMY_PERIODS[period],
    displayName:`${ENEMY_GRADES[grade]} · ${ENEMY_PERIODS[period]}`
  };
}

// Sát thương của Player đánh vào Enemy:
// - Cùng cảnh giới (diff=0): Quái vật luôn MẠNH HƠN player (quái trâu, player gây 0.70x damage -> cần vài chục chiêu)
// - Player hơn >= 1 tiểu cảnh giới (diff >= 1): Quái vật lập tức YẾU HƠN player (player gây 1.85x - 6.0x damage)
// - Player hơn >= 1 đại cảnh giới (diff >= 4): Chỉ cần 2 - 3 hit là diệt quái dưới 1 cảnh giới
function getPlayerSuppressionVsActor(actor){
  if(!actor)return 1;
  const info=actor.realmInfo||getEnemyRealmInfo(actor.enemyLv||1);
  const pScore=getPlayerRealmScore();
  const eScore=info.score;
  const diff=pScore - eScore;
  if(diff===0){
    return 0.70; // Cùng cảnh giới: Quái vật trâu bò, chiếm thế thượng phong
  }
  if(diff===1) return 1.85; // Hơn 1 tiểu cảnh giới: Quái yếu hơn player rõ rệt
  if(diff===2) return 3.50;
  if(diff===3) return 6.00;
  if(diff>=4){
    // Hơn >= 1 Đại Cảnh Giới: Chỉ cần 2 - 3 hit là diệt quái dưới 1 cảnh giới
    return 8.5 * Math.pow(1.40, diff - 4);
  }
  // Kém cảnh giới: Bị quái vật áp chế nặng nề
  if(diff===-1) return 0.40;
  if(diff===-2) return 0.20;
  if(diff===-3) return 0.08;
  return Math.max(0.02, 0.03 / Math.pow(1.45, Math.abs(diff) - 4));
}

// Sát thương của Enemy đánh vào Player:
// - Cùng cảnh giới (diff=0): Quái vật gây 1.30x damage -> Quái LUÔN MẠNH HƠN player cùng cảnh giới
// - Quái kém >= 1 tiểu cảnh giới (diff <= -1): Quái vật YẾU HƠN player (sát thương quái bị triệt tiêu còn 0.40x trở xuống)
// - Quái hơn >= 1 đại cảnh giới (diff >= 4): Quái đánh 2 - 3 đòn là player tử trận
function getActorSuppressionVsPlayer(actor){
  if(!actor)return 1;
  const info=actor.realmInfo||getEnemyRealmInfo(actor.enemyLv||1);
  const pScore=getPlayerRealmScore();
  const eScore=info.score;
  const diff=eScore - pScore;
  if(diff===0){
    return 1.30; // Cùng cảnh giới: Quái vật cuồng bạo, mạnh hơn player
  }
  if(diff===1) return 1.90;
  if(diff===2) return 3.60;
  if(diff===3) return 6.20;
  if(diff>=4){
    // Quái hơn 1 Đại Cảnh Giới: Đánh 2 - 3 đòn là player tử nạn
    return 8.5 * Math.pow(1.40, diff - 4);
  }
  // Quái kém player: Quái yếu hơn player rất nhiều
  if(diff===-1) return 0.40; // Kém 1 tiểu cảnh giới: Quái yếu hơn player
  if(diff===-2) return 0.20;
  if(diff===-3) return 0.08;
  return Math.max(0.02, 0.03 / Math.pow(1.45, Math.abs(diff) - 4));
}

function getRealmSuppressionByScores(attackerScore,attackerMajor,defenderScore,defenderMajor){
  const diff=attackerScore-defenderScore;
  if(diff===0)return 1.0;
  if(diff===1) return 1.85;
  if(diff===2) return 3.50;
  if(diff===3) return 6.00;
  if(diff>=4) return 8.5 * Math.pow(1.40, diff - 4);
  if(diff===-1) return 0.40;
  if(diff===-2) return 0.20;
  if(diff===-3) return 0.08;
  return Math.max(0.02, 0.03 / Math.pow(1.45, Math.abs(diff) - 4));
}

const CULTIVATION_TECH_TYPES=['physical','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi'];
const CULTIVATION_TECH_LABELS={
  physical:'Thể Tu / Vật lý',Kim:'Kim',Hỏa:'Hỏa',Thủy:'Thủy',Mộc:'Mộc',Thổ:'Thổ',Phong:'Phong',Lôi:'Lôi'
};
const TECHNIQUE_GRADES=[
  {id:'hoang',name:'Hoàng',minRealm:0,cultivation:1.00,stat:1.10,unlockCost:0},
  {id:'huyen',name:'Huyền',minRealm:1,cultivation:1.55,stat:1.35,unlockCost:120},
  {id:'dia',name:'Địa',minRealm:2,cultivation:2.40,stat:1.75,unlockCost:420},
  {id:'thien',name:'Thiên',minRealm:3,cultivation:3.60,stat:2.30,unlockCost:1200}
];
const TECHNIQUE_RANKS=[
  {id:'ha',name:'Hạ phẩm',cultivation:1.00,stat:1.00},
  {id:'trung',name:'Trung phẩm',cultivation:1.18,stat:1.12},
  {id:'thuong',name:'Thượng phẩm',cultivation:1.42,stat:1.28},
  {id:'cuc',name:'Cực phẩm',cultivation:1.75,stat:1.50}
];
const TECHNIQUE_NAMES={
  physical:['Luyện Thể Quyết','Huyền Cương Bá Thể','Địa Sát Luyện Thể Kinh','Thiên Cương Bất Diệt Thể'],
  Kim:['Kim Linh Quyết','Huyền Kim Chân Kinh','Địa Kim Thần Điển','Thiên Kim Vạn Kiếp Kinh'],
  Hỏa:['Xích Hỏa Quyết','Huyền Hỏa Chân Kinh','Địa Viêm Thần Điển','Thiên Hỏa Phần Thế Kinh'],
  Thủy:['Hàn Thủy Quyết','Huyền Thủy Chân Kinh','Địa Hải Thần Điển','Thiên Hà Vạn Thủy Kinh'],
  Mộc:['Thanh Mộc Quyết','Huyền Mộc Chân Kinh','Địa Mạch Sinh Linh Kinh','Thiên Mộc Trường Sinh Kinh'],
  Thổ:['Hậu Thổ Quyết','Huyền Thổ Chân Kinh','Địa Nhạc Thần Điển','Thiên Sơn Trấn Giới Kinh'],
  Phong:['Thanh Phong Quyết','Huyền Phong Chân Kinh','Địa Phong Vô Ảnh Kinh','Thiên Phong Cửu Tiêu Kinh'],
  Lôi:['Dẫn Lôi Quyết','Huyền Lôi Chân Kinh','Địa Lôi Thần Điển','Thiên Lôi Vạn Kiếp Kinh']
};
function makeDefaultTechniqueCultivation(){
  const out={};
  for(const type of CULTIVATION_TECH_TYPES)out[type]={grade:0,rank:0};
  return out;
}
function normalizeTechniqueType(type='physical'){
  type=normalizeDamageType(type);
  return CULTIVATION_TECH_TYPES.includes(type)?type:'physical';
}
function getTechniqueState(type='physical'){
  type=normalizeTechniqueType(type);
  if(!S.cultivationTechniques||typeof S.cultivationTechniques!=='object')S.cultivationTechniques=makeDefaultTechniqueCultivation();
  if(!S.cultivationTechniques[type]||typeof S.cultivationTechniques[type]!=='object')S.cultivationTechniques[type]={grade:0,rank:0};
  const st=S.cultivationTechniques[type];
  if(typeof st.rank!=='number'){
    const oldLv=Math.max(1,Number(st.level)||1);
    st.rank=oldLv>=8?3:oldLv>=5?2:oldLv>=3?1:0;
    delete st.level;
  }
  st.grade=clamp(Number(st.grade)||0,0,TECHNIQUE_GRADES.length-1);
  st.rank=clamp(Number(st.rank)||0,0,TECHNIQUE_RANKS.length-1);
  return st;
}
function getTechniqueDef(type='physical'){
  type=normalizeTechniqueType(type);
  const st=getTechniqueState(type);
  return {
    type,gradeIndex:st.grade,rankIndex:st.rank,
    grade:TECHNIQUE_GRADES[st.grade],rank:TECHNIQUE_RANKS[st.rank],
    name:(TECHNIQUE_NAMES[type]||TECHNIQUE_NAMES.physical)[st.grade]
  };
}
function getActiveTechniqueType(){return normalizeTechniqueType(S.activeCultivationTechnique||'physical')}
function getActiveTechnique(){return getTechniqueDef(getActiveTechniqueType())}
function getTechniqueCultivationMultiplier(type=getActiveTechniqueType()){
  const t=getTechniqueDef(type);
  return t.grade.cultivation*t.rank.cultivation;
}
function isTechniqueRealmAllowed(type='physical'){
  const t=getTechniqueDef(type);
  return (S.realm||0)>=t.grade.minRealm;
}
function getTechniqueStatMultiplier(type='physical'){
  type=normalizeTechniqueType(type);
  if(getActiveTechniqueType()!==type)return 1;
  const t=getTechniqueDef(type);
  if((S.realm||0)<t.grade.minRealm)return 1;
  return t.grade.stat*t.rank.stat;
}
function getTechniqueStatText(type=getActiveTechniqueType()){
  return getTechniqueStatMultiplier(type).toFixed(2)+'×';
}
function techniqueRankUpgradeCost(type='physical'){
  const t=getTechniqueDef(type);
  return {cult:Math.round(300*Math.pow(2,t.rankIndex)*(1+t.gradeIndex*2.2)),stones:Math.round(10*Math.pow(1.7,t.rankIndex)*(1+t.gradeIndex*1.6))};
}
function canBreakTechniqueGrade(type='physical'){
  const t=getTechniqueDef(type);
  if(t.gradeIndex>=TECHNIQUE_GRADES.length-1)return false;
  return t.rankIndex===TECHNIQUE_RANKS.length-1&&(S.realm||0)>=TECHNIQUE_GRADES[t.gradeIndex+1].minRealm;
}
function techniqueBreakthroughCost(type='physical'){
  const t=getTechniqueDef(type);
  if(t.gradeIndex>=TECHNIQUE_GRADES.length-1)return null;
  const next=TECHNIQUE_GRADES[t.gradeIndex+1];
  return {cult:Math.round(3000*Math.pow(4,t.gradeIndex)),stones:next.unlockCost};
}

const heartMethods=[
  {id:'duong_khi',grade:'Hoàng',name:'Dưỡng Khí Tâm Pháp',minRealm:0,regen:1.15,spirit:1.05,move:1.00,attack:1.00,cast:1.00,cultivation:1.10,defense:1.03,perLevel:0.018,desc:'Ôn dưỡng khí hải, tăng hồi phục và tốc độ tích lũy tu vi.'},
  {id:'tinh_tam',grade:'Huyền',name:'Tĩnh Tâm Huyền Pháp',minRealm:1,regen:1.25,spirit:1.12,move:1.02,attack:1.03,cast:1.06,cultivation:1.18,defense:1.08,perLevel:0.024,desc:'Tâm như chỉ thủy, tăng Thần thức và tốc độ thi triển.'},
  {id:'kim_cang',grade:'Địa',name:'Kim Cang Hộ Tâm Kinh',minRealm:2,regen:1.35,spirit:1.16,move:1.02,attack:1.05,cast:1.05,cultivation:1.25,defense:1.18,perLevel:0.030,desc:'Tâm mạch như kim cang, tăng mạnh phòng thủ và hồi phục.'},
  {id:'thai_thuong',grade:'Thiên',name:'Thái Thượng Vong Tình Quyết',minRealm:3,regen:1.48,spirit:1.28,move:1.05,attack:1.08,cast:1.12,cultivation:1.38,defense:1.25,perLevel:0.038,desc:'Tâm cảnh siêu nhiên, toàn diện tăng tốc độ và tu luyện.'},
  {id:'vo_cuc_tam',grade:'Tiên',name:'Vô Cực Đạo Tâm',minRealm:4,regen:1.65,spirit:1.45,move:1.08,attack:1.12,cast:1.18,cultivation:1.55,defense:1.35,perLevel:0.05,desc:'Đạo tâm vô cực, tâm pháp tối thượng của Hóa Thần.'}
];

function getHeartMethodDef(){return heartMethods[clamp(S.heartMethod||0,0,heartMethods.length-1)]||heartMethods[0]}
function getTechniqueLevel(i=S.technique||0){return Math.max(1,Number((S.techniqueLevels||{})[i])||1)}
function getHeartMethodLevel(i=S.heartMethod||0){return Math.max(1,Number((S.heartMethodLevels||{})[i])||1)}



function getHeartMethodEffects(){
  const h=getHeartMethodDef(),lv=getHeartMethodLevel();
  const grow=1+(lv-1)*h.perLevel;
  return {
    regen:h.regen*grow,
    spirit:h.spirit*grow,
    move:1+(h.move-1)*grow,
    attack:1+(h.attack-1)*grow,
    cast:1+(h.cast-1)*grow,
    cultivation:h.cultivation*grow,
    defense:h.defense*grow
  };
}

function heartUpgradeCost(i=S.heartMethod||0){
  const lv=getHeartMethodLevel(i),h=heartMethods[i]||heartMethods[0];
  return {cult:Math.round(260*Math.pow(1.8,lv)*(1+h.minRealm*1.9)),stones:Math.round(10*Math.pow(1.45,lv)*(1+h.minRealm))};
}
const elements=[
  ['Kim','⚜'],['Hỏa','🔥'],['Thủy','💧'],
  ['Thổ','⛰'],['Mộc','🌿'],['Phong','🌪'],
  ['Lôi','⚡'],['Kiếm','劍'],['Đao','刀']
];
// Dữ liệu map nằm trong /maps để game.js luôn gọn khi có hàng trăm bản đồ.
const MAP_DATA_VERSION='20260918-2';
const DEFAULT_MAP_ID='thanh_van_thon';
const DEFAULT_REGION={id:DEFAULT_MAP_ID,name:'Thanh Vân Thôn',kind:'Thôn',min:1,max:12,color:'#668071',enemy:['boar','archer'],file:'maps/thanh_van_thon.json'};
let regions=[DEFAULT_REGION];
let mapManifest={schemaVersion:1,defaultMap:DEFAULT_MAP_ID,maps:regions};
const MAP_CONFIGS=Object.create(null);
let mapLoadToken=0;

async function fetchMapJson(url){
  if(typeof url === 'string'){
    let cleanUrl = url.split('?')[0];
    let match = cleanUrl.match(/maps\/([^/]+)\.json$/);
    if(match && match[1]){
      let customKey = 'tutien_custom_map_' + match[1];
      let customData = localStorage.getItem(customKey);
      if(customData){
        try {
          let parsed = JSON.parse(customData);
          console.log('[Map] Nạp map tùy chỉnh từ Editor:', match[1]);
          return parsed;
        } catch(e){}
      }
    }
  }
  if(window.AssetManager)return window.AssetManager.loadJSON(url);
  const res=await fetch(url,{cache:'default'});
  if(!res.ok)throw new Error('Không tải được '+url+' ('+res.status+')');
  return res.json();
}

async function loadMapManifest(){
  try{
    const root=await fetchMapJson('maps/manifest.json');
    let allMaps=Array.isArray(root.maps)?root.maps:[];
    if(allMaps.length===0&&Array.isArray(root.catalogs)&&root.catalogs.length){
      const catalogs=await Promise.all(root.catalogs.map(file=>fetchMapJson(file)));
      allMaps=catalogs.flatMap(c=>Array.isArray(c.maps)?c.maps:[]);
    }
    if(allMaps.length===0)throw new Error('Danh mục map trống');
    mapManifest={...root,maps:allMaps};
    regions=allMaps;

    const legacyRegionIds=['thanh_van_thon','linh_son_ngoai_vi','bach_ngoc_thanh','thanh_van_tong','van_dam_sa_mac','yeu_vuc','cam_dia_han_uyen','ma_vuc'];
    const legacyIndex=Number.isInteger(S.region)?clamp(S.region,0,legacyRegionIds.length-1):0;
    const legacyId=legacyRegionIds[legacyIndex]||root.defaultMap||DEFAULT_MAP_ID;
    const requestedId=(typeof S.regionId==='string'&&S.regionId)?S.regionId:legacyId;
    const resolvedId=regions.some(r=>r.id===requestedId)?requestedId:(root.defaultMap||DEFAULT_MAP_ID);
    const resolvedIndex=Math.max(0,regions.findIndex(r=>r.id===resolvedId));
    S.region=resolvedIndex;
    S.regionId=resolvedId;
  }catch(err){
    console.warn('Dùng danh mục map dự phòng:',err);
    mapManifest={schemaVersion:1,defaultMap:DEFAULT_MAP_ID,maps:[DEFAULT_REGION]};
    regions=mapManifest.maps;
    S.region=0;
    S.regionId=DEFAULT_MAP_ID;
  }
}

function normalizeMapConfig(cfg,id,meta={}){
  if(!cfg||typeof cfg!=='object')throw new Error('Dữ liệu map '+id+' không hợp lệ');
  cfg.id=cfg.id||id;
  cfg.name=cfg.name||cfg.id;
  cfg.trees=Array.isArray(cfg.trees)?cfg.trees:[];
  cfg.rocks=Array.isArray(cfg.rocks)?cfg.rocks:[];
  cfg.decor=Array.isArray(cfg.decor)?cfg.decor:[];
  cfg.villageProps=Array.isArray(cfg.villageProps)?cfg.villageProps:[];
  cfg.lanternPosts=Array.isArray(cfg.lanternPosts)?cfg.lanternPosts:[];
  cfg.specialSpawns=Array.isArray(cfg.specialSpawns)?cfg.specialSpawns:[];
  if(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)){
    cfg.treeCount=Math.min(cfg.treeCount||400,90);
    cfg.rockCount=Math.min(cfg.rockCount||220,50);
    cfg.grassCount=Math.min(cfg.grassCount||140,80);
  }
  return window.WorldSystem?window.WorldSystem.normalize(cfg,{...meta,id}):cfg;
}

async function getMapConfig(id){
  let customKey = 'tutien_custom_map_' + id;
  let customData = localStorage.getItem(customKey);
  if(customData){
    try {
      let parsed = JSON.parse(customData);
      const meta = regions.find(r=>r.id===id);
      let cfg = normalizeMapConfig(parsed, id, meta||{});
      MAP_CONFIGS[id] = cfg;
      console.log('[Map] Nạp map tùy chỉnh từ LocalStorage:', id);
      return cfg;
    } catch(e){}
  }
  if(MAP_CONFIGS[id])return MAP_CONFIGS[id];
  const meta=regions.find(r=>r.id===id);
  const file=(meta&&meta.file)||('maps/'+id+'.json');
  try{
    const raw=await fetchMapJson(file);
    let cfg=raw;
    if(raw&&raw.extends){
      const base=await fetchMapJson(raw.extends);
      cfg={...base,...raw,...(raw.overrides||{})};
      delete cfg.extends;
      delete cfg.overrides;
    }
    cfg=normalizeMapConfig(cfg,id,meta||{});
    MAP_CONFIGS[id]=cfg;
    return cfg;
  }catch(err){
    if(id===DEFAULT_MAP_ID)throw err;
    console.warn('Map '+id+' chưa có file riêng, dùng '+DEFAULT_MAP_ID,err);
    const fallback=await getMapConfig(DEFAULT_MAP_ID);
    const cfg={...fallback,id,name:(meta&&meta.name)||id,specialSpawns:[]};
    MAP_CONFIGS[id]=cfg;
    return cfg;
  }
}

// Bản đồ thế giới mở rộng 100 lần (1000m x 1000m = 1.000.000 m²)
const MAP_SIZE = 1000;
const MAP_HALF = MAP_SIZE / 2; // 500
const MAP_BOUND = MAP_HALF - 15; // 485
const RADAR_RANGE = 140; // Minimap: đủ rộng để nhìn thấy các bãi quái lân cận

// ==========================================
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
    if(window.SkillSystem)return window.SkillSystem.get(skillId);
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

const defaultState={
  name:'Linh Phong',level:1,xp:0,xpNeed:120,
  hp:950,maxHp:950,mp:500,maxMp:500,
  // Hệ thuộc tính chiến đấu chính thức — sát thương giảm xuống thấp (đánh cùng cấp cần vài chục chiêu)
  damage:{physical:16,Kim:0,Hỏa:6,Thủy:0,Mộc:0,Thổ:0,Phong:0,Lôi:0},
  defense:{physical:6,Kim:0,Hỏa:3,Thủy:0,Mộc:0,Thổ:0,Phong:0,Lôi:0},
  critChance:.15,critDamage:1.6,
  spiritSense:100,moveSpeed:6.2,attackSpeed:1.0,castSpeed:1.0,
  hpRegenPct:0.015,mpRegenPct:0.06,
  gold:5000,stones:2000,
  realm:0,realmStage:1,cultivation:0,
  kills:0,questKills:0,bossKills:0,
  auto:true,quality:'HIGH',daily:false,pet:false,
  items:{'Linh Thạch':20,'Hồi Khí Đan':10},
  equipment:{weapon:null,armor:null,ring:null},
  period:0,cultivationTechniques:makeDefaultTechniqueCultivation(),activeCultivationTechnique:'Kiếm',heartMethod:0,heartMethodLevels:{0:1},region:0,skillElement:'Kiếm',
  equippedSkills:['kiem_0_0','kiem_0_1','kiem_0_2','kiem_0_3'],
  learnedSkills:{
    'kiem_0_0':1,'kiem_0_1':1,'kiem_0_2':1,'kiem_0_3':1,
    'kiem_1_0':1,'kiem_1_1':1,'kiem_1_2':1,'kiem_1_3':1,
    'kiem_2_0':1,'kiem_2_1':1,'kiem_2_2':1,'kiem_2_3':1,
    'kiem_3_0':1,'kiem_3_1':1,'kiem_3_2':1,'kiem_3_3':1,
    'hoa_0_0':1,'hoa_0_1':1,'hoa_0_2':1,'hoa_0_3':1,
    'hoa_1_0':1,'hoa_1_1':1,'hoa_1_2':1,'hoa_1_3':1,
    'hoa_2_0':1,'hoa_2_1':1,'hoa_2_2':1,'hoa_2_3':1,
    'hoa_3_0':1,'hoa_3_1':1,'hoa_3_2':1,'hoa_3_3':1
  },
  skillTierTab:0,
  pills:{1:3,2:0,3:0,4:0,5:0},
  talismans:{1:1,2:0,3:0,4:0,5:0},
  artifacts:{1:0,2:0,3:0,4:0,5:0},
  progressionSystems:(window.TuTienSystems?window.TuTienSystems.defaultState():{})
};

let S;
try{
  let parsed=JSON.parse(localStorage.getItem(SAVE)||'{}');
  S=Object.assign({},defaultState,parsed);
  if(!S.items||typeof S.items!=='object'||Array.isArray(S.items)){
    S.items={'Linh Thạch':20,'Hồi Khí Đan':10};
  }
  if(!S.equipment||typeof S.equipment!=='object'){
    S.equipment={weapon:null,armor:null,ring:null};
  }
  // Đảm bảo trang bị sẵn 4 skill Kiếm đầy đủ VFX cho người chơi test
  S.skillElement='Kiếm';
  S.equippedSkills=['kiem_0_0','kiem_0_1','kiem_0_2','kiem_0_3'];
  if(!S.learnedSkills||typeof S.learnedSkills!=='object'||Array.isArray(S.learnedSkills)){
    S.learnedSkills={};
  }
  ['kiem_0_0','kiem_0_1','kiem_0_2','kiem_0_3','kiem_1_0','kiem_1_1','kiem_1_2','kiem_1_3','kiem_2_0','kiem_2_1','kiem_2_2','kiem_2_3','kiem_3_0','kiem_3_1','kiem_3_2','kiem_3_3','hoa_0_0','hoa_0_1','hoa_0_2','hoa_0_3'].forEach(id=>{
    if(!S.learnedSkills[id])S.learnedSkills[id]=1;
  });
  if(S.mp<200) S.mp=500;
  if(S.maxMp<500) S.maxMp=500;
  if(typeof S.skillTierTab!=='number')S.skillTierTab=0;

  // Migration save cũ -> damage thành phần; Damage Tổng được tính bằng tổng các thành phần.
  const statTypes=['physical','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi'];
  const legacyAtk=typeof S.atk==='number'?S.atk:16;
  const legacyDef=typeof S.def==='number'?S.def:6;
  const legacyCrit=typeof S.crit==='number'?S.crit:.15;
  const legacyDamageBonus=(S.damageBonus&&typeof S.damageBonus==='object')?S.damageBonus:{};
  const legacyDefenseBonus=(S.defenseBonus&&typeof S.defenseBonus==='object')?S.defenseBonus:{};
  const oldDamage=(S.damage&&typeof S.damage==='object')?{...S.damage}:null;

  if(!S.damage||typeof S.damage!=='object')S.damage={};

  // Nếu save đang ở bản "Damage Tổng + % hệ" trước đó, quy đổi về damage phẳng:
  if(oldDamage&&typeof oldDamage.total==='number'){
    const oldTotal=Math.max(1,oldDamage.total);
    S.damage.physical=oldTotal;
    for(const t of statTypes){
      if(t==='physical')continue;
      const pct=Number(oldDamage[t])||0;
      S.damage[t]=Math.max(0,oldTotal*pct/100);
    }
    delete S.damage.total;
  }else{
    for(const t of statTypes){
      if(typeof S.damage[t]!=='number'){
        if(t==='physical')S.damage[t]=legacyAtk+(Number(legacyDamageBonus.physical)||0);
        else S.damage[t]=Math.max(0,Number(legacyDamageBonus[t])||0);
      }
    }
  }

  if(!S.defense||typeof S.defense!=='object')S.defense={};
  for(const t of statTypes){
    if(typeof S.defense[t]!=='number')S.defense[t]=(t==='physical'?legacyDef:0)+(Number(legacyDefenseBonus[t])||0);
  }

  // Cân đối lại chỉ số từ save cũ để đồng bộ chuẩn TTK mới (giảm sức đánh, cùng cấp đánh vài chục chiêu)
  const expectedTotalDmg = 22 + (Math.max(1, S.level||1) - 1) * 1.8;
  const curTotalDmg = statTypes.reduce((sum,t)=>sum+(Number(S.damage[t])||0), 0);
  if(curTotalDmg > expectedTotalDmg * 1.8){
    const ratio = expectedTotalDmg / Math.max(1, curTotalDmg);
    for(const t of statTypes){
      if(S.damage[t]) S.damage[t] = Math.max(0, Math.round(S.damage[t] * ratio * 10) / 10);
      if(S.defense[t]) S.defense[t] = Math.max(0, Math.round(S.defense[t] * ratio * 10) / 10);
    }
    if(!S.damage.physical || S.damage.physical < 12) S.damage.physical = 16;
  }
  if(!S.maxHp || S.maxHp < 750){
    S.maxHp = 950 + (Math.max(1, S.level||1) - 1) * 30;
    S.hp = S.maxHp;
  }

  // Kiếm/Đao dùng Vật lý, không có damage/phòng thủ riêng.
  delete S.damage.Kiếm;
  delete S.damage.Đao;
  delete S.defense.Kiếm;
  delete S.defense.Đao;

  if(typeof S.critChance!=='number')S.critChance=legacyCrit;
  if(typeof S.critDamage!=='number')S.critDamage=1.6;
  if(typeof S.spiritSense!=='number')S.spiritSense=100;
  if(typeof S.moveSpeed!=='number')S.moveSpeed=6.2;
  if(typeof S.castSpeed!=='number')S.castSpeed=1.0;
  if(typeof S.hpRegenPct!=='number')S.hpRegenPct=0.015;
  if(typeof S.mpRegenPct!=='number')S.mpRegenPct=0.04;
  // Migration công pháp cũ -> hệ công pháp riêng theo từng hệ.
  if(!S.cultivationTechniques||typeof S.cultivationTechniques!=='object'){
    S.cultivationTechniques=makeDefaultTechniqueCultivation();
    const oldGrade=clamp(Number(S.technique)||0,0,TECHNIQUE_GRADES.length-1);
    const oldLv=Math.max(1,Number((S.techniqueLevels||{})[S.technique])||1);
    S.cultivationTechniques.physical={grade:oldGrade,level:Math.min(10,oldLv)};
  }
  for(const type of CULTIVATION_TECH_TYPES)getTechniqueState(type);
  delete S.technique;
  delete S.techniqueLevels;
  if(typeof S.activeCultivationTechnique!=='string')S.activeCultivationTechnique='physical';
  S.activeCultivationTechnique=normalizeTechniqueType(S.activeCultivationTechnique);
  for(const type of CULTIVATION_TECH_TYPES)getTechniqueState(type);
  if(!isTechniqueRealmAllowed(S.activeCultivationTechnique)){
    const fallback=CULTIVATION_TECH_TYPES.find(t=>isTechniqueRealmAllowed(t))||'physical';
    S.activeCultivationTechnique=fallback;
  }
  if(typeof S.heartMethod!=='number')S.heartMethod=0;
  if(!S.heartMethodLevels||typeof S.heartMethodLevels!=='object')S.heartMethodLevels={0:1};
  if(typeof S.heartMethodLevels[S.heartMethod]!=='number')S.heartMethodLevels[S.heartMethod]=1;
  if(window.TuTienSystems)window.TuTienSystems.migrate(S);

  delete S.atk;
  delete S.def;
  delete S.crit;
  delete S.damageBonus;
  delete S.defenseBonus;
}catch(e){
  S=structuredClone(defaultState);
}

if(window.GameStateService){S=window.GameStateService.adopt(S);}
if(window.InventorySystem)window.InventorySystem.attach(S);
if(window.SaveService)window.SaveService.configure({stateGetter:()=>S,delay:900});
const save=(force=false)=>{
  if(window.SaveService){if(force)return window.SaveService.forceSave('game-force');window.SaveService.markDirty('game-state');return;}
  try{localStorage.setItem(SAVE,JSON.stringify(S));}catch(e){}
};

let engine,scene,camera,player,petActor=null,actors=[],projectiles=[],effects=[],decor=[],boss=null;
let worldGround=null,worldRiver=null;
let last=performance.now(),spawnTimer=0,autoTimer=0,regenTimer=0,miniTimer=0,cooldownUiTimer=0,gameStarted=false,paused=false;
const keys={}, joy={x:0,y:0,active:false,pid:null}, cooldown=[0,0,0,0,0], dashCd={t:0};
const spriteMats={}, matCache={}, mapPropMaterials={}, skillVfxMats={};
if(window.RuntimeTelemetry)window.RuntimeTelemetry.register('runtime',()=>({
 fps:engine?Math.round(engine.getFps()):0,frameMs:engine?Number((1000/Math.max(1,engine.getFps())).toFixed(1)):0,
 actors:actors.length,activeEnemy:actors.reduce((n,a)=>n+(!a.dead?1:0),0),activeVfx:effects.length,
 activeMeshes:scene?scene.getActiveMeshes().length:0,textures:scene?scene.textures.length:0,materials:scene?scene.materials.length:0,
 map:S&&S.regionId,renderScale:engine?Number(engine.getHardwareScalingLevel().toFixed(2)):0,quality:window.PerformanceProfile&&window.PerformanceProfile.name,
 scheduled:window.GameScheduler?window.GameScheduler.count():0,assets:window.AssetManager&&window.AssetManager.stats()
}));

// ===== VLTK-STYLE CAMERA STANDARD =====
// Toàn bộ sprite/prop dùng chung một projection: orthographic 3/4 top-down,
// góc nhìn 50°, không perspective scaling, hướng nhìn từ Nam lên Bắc.
const CAMERA_STD={
  elevationDeg:50,
  distance:40,
  viewHeight:38
};

function updateOrthoCameraBounds(){
  if(!camera||!engine)return;
  const aspect=Math.max(0.45,engine.getRenderWidth()/Math.max(1,engine.getRenderHeight()));
  const halfH=CAMERA_STD.viewHeight*0.5;
  camera.orthoTop=halfH;
  camera.orthoBottom=-halfH;
  camera.orthoLeft=-halfH*aspect;
  camera.orthoRight=halfH*aspect;
}

function placeStandardCamera(x,z){
  if(!camera)return;
  const elev=CAMERA_STD.elevationDeg*Math.PI/180;
  const horizontal=Math.cos(elev)*CAMERA_STD.distance;
  const height=Math.sin(elev)*CAMERA_STD.distance;
  camera.position.set(x,height,z-horizontal);
  camera.setTarget(new BABYLON.Vector3(x,0,z));
}

// ===== THANH VÂN THÔN — CURVED WALL COLLISION & SAFE ZONE =====
// Vòng tường bo cong dạng oval quanh thôn; cổng Bắc/Nam là lối ra vào duy nhất.
const VILLAGE_WALL_RX=43.0;
const VILLAGE_WALL_RZ=40.0;
const VILLAGE_SAFE_RX=40.5;
const VILLAGE_SAFE_RZ=37.5;
const VILLAGE_GATE_HALF_WIDTH=4.6;

function ellipseNorm(x,z,rx,rz){
  return Math.sqrt((x*x)/(rx*rx)+(z*z)/(rz*rz));
}
function isVillageSafe(x,z){
  const current=regions&&regions.length?(regions[S.region||0]||regions[0]):null;
  if(!current||current.id!==DEFAULT_MAP_ID)return false;
  const currentCfg=MAP_CONFIGS[current.id];
  if(!currentCfg||!Array.isArray(currentCfg.specialSpawns)||!currentCfg.specialSpawns.includes('villageCurvedWall')){
    return false;
  }
  return ellipseNorm(x,z,VILLAGE_SAFE_RX,VILLAGE_SAFE_RZ)<1;
}
function isVillageGateLane(x,z){
  return Math.abs(x)<=VILLAGE_GATE_HALF_WIDTH && Math.abs(z)>=VILLAGE_WALL_RZ-4.0;
}
function clampToEllipse(x,z,rx,rz,scaleBias=1){
  let n=ellipseNorm(x,z,rx,rz);
  if(n<0.0001)return {x:0,z:rz*scaleBias};
  let s=scaleBias/n;
  return {x:x*s,z:z*s};
}
function resolveVillageWallMove(fromX,fromZ,toX,toZ){
  const current=regions&&regions.length?(regions[S.region||0]||regions[0]):null;
  if(!current||current.id!==DEFAULT_MAP_ID)return {x:toX,z:toZ};
  const currentCfg=MAP_CONFIGS[current.id];
  // Nếu map không có vòng tường 'villageCurvedWall' thì không chặn va chạm vô hình
  if(!currentCfg||!Array.isArray(currentCfg.specialSpawns)||!currentCfg.specialSpawns.includes('villageCurvedWall')){
    return {x:toX,z:toZ};
  }
  const fromN=ellipseNorm(fromX,fromZ,VILLAGE_WALL_RX,VILLAGE_WALL_RZ);
  const toN=ellipseNorm(toX,toZ,VILLAGE_WALL_RX,VILLAGE_WALL_RZ);
  const crossing=(fromN<1&&toN>=1)||(fromN>=1&&toN<1);
  if(!crossing)return {x:toX,z:toZ};

  if(isVillageGateLane(toX,toZ)||isVillageGateLane(fromX,fromZ)){
    return {x:toX,z:toZ};
  }

  if(fromN<1){
    return clampToEllipse(toX,toZ,VILLAGE_WALL_RX,VILLAGE_WALL_RZ,0.992);
  }
  return clampToEllipse(toX,toZ,VILLAGE_WALL_RX,VILLAGE_WALL_RZ,1.008);
}
function ejectEnemyFromVillage(a){
  if(!a||!isVillageSafe(a.x,a.z))return;
  let x=a.x,z=a.z;
  if(Math.abs(x)<0.01&&Math.abs(z)<0.01)z=1;
  let p=clampToEllipse(x,z,VILLAGE_WALL_RX+3,VILLAGE_WALL_RZ+3,1.02);
  a.x=p.x;a.z=p.z;
}

function realmName(){return S.realm===0?`Luyện Khí Tầng ${S.realmStage}`:`${realms[S.realm]} · ${periods[S.period||0]}`}
function gradeForLevel(){return clamp(1+Math.floor((S.level-1)/25),1,5)}
function regionIndexById(id){
  if(!id)return -1;
  return regions.findIndex(r=>r.id===id);
}
function region(){
  const byId=regionIndexById(S.regionId);
  if(byId>=0){
    S.region=byId;
    return regions[byId];
  }
  const byIndex=regions[S.region||0]||regions[0]||DEFAULT_REGION;
  if(byIndex)S.regionId=byIndex.id;
  return byIndex;
}
function mapRealmLabel(r){
  const a=realms[clamp(Number(r.minRealm)||0,0,realms.length-1)]||realms[0];
  const b=realms[clamp(Number(r.maxRealm??r.minRealm)||0,0,realms.length-1)]||a;
  return a===b?a:(a+' → '+b);
}
function isMapAccessible(r){
  if(!r)return false;
  if(r.id===S.regionId||r===regions[S.region||0])return true;
  const minRealm=Number(r.minRealm)||0;
  const minLevel=Number(r.min)||1;
  return (S.realm||0)>=minRealm && (S.level||1)>=minLevel;
}
function enemyDisplayName(id){
  return ({boar:'Sơn Trư',archer:'Tiễn Thủ',bandit:'Đạo Tặc',tiger:'Hổ Thần',skeleton:'Khô Cốt',undead:'Bạo Thi',ice_wolf:'Băng Lang',wolf:'Ma Lang',fox:'Linh Hồ',golem:'Thạch Khôi',shadow:'Ảnh Thú'})[id]||id;
}
function renderWorldMapCards(){
  const groups=new Map();
  regions.forEach((r,i)=>{
    const key=r.continentName||'Khu vực khác';
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push({r,i});
  });
  let html=`<div class="card"><b>🌏 Nhân Giới</b><p>11 đại châu/vực · 22 khu vực · ${regions.length} map. Map mở theo cảnh giới và cấp độ nhân vật.</p><div class="stat"><span>Hiện tại</span><b>${realmName()} · Lv.${S.level}</b></div></div>`;
  for(const [continent,items] of groups){
    const first=items[0]&&items[0].r;
    html+=`<div class="card" style="margin-top:8px"><b>🗺 ${continent}</b><p>${first&&first.element?'Thuộc tính: '+first.element:''} ${first&&first.faction?'· '+first.faction:''}</p></div><div class="cards">`;
    for(const {r,i} of items){
      const current=(r.id===S.regionId)||i===S.region;
      const unlocked=isMapAccessible(r);
      const status=current?'Đang ở đây':unlocked?'Dịch chuyển':`Yêu cầu ${mapRealmLabel(r)} · Lv.${r.min}`;
      html+=`<div class="card">
        <b>${r.kind} · ${r.name}</b>
        <p>${r.regionName||''}</p>
        <p><b>${mapRealmLabel(r)}</b> · Lv.${r.min}–${r.max}</p>
        <p>${r.element?'Hệ '+r.element+' · ':''}${r.faction||'Trung lập'}</p>
        <p>${(r.enemy||[]).map(enemyDisplayName).join(', ')}</p>
        <small>${(r.features||[]).join(' · ')}</small>
        <button data-region="${i}" ${unlocked?'':'disabled'}>${status}</button>
      </div>`;
    }
    html+='</div>';
  }
  return html;
}
function progress(p,msg){loadBar.style.width=p+'%';loadMsg.textContent=msg}

// Material Pool / Cache to prevent memory leaks
function mat(name,color,alpha=1){
  let key=`${name}_${color}_${alpha}`;
  if(matCache[key])return matCache[key];
  let m=new BABYLON.StandardMaterial(key,scene);
  m.diffuseColor=BABYLON.Color3.FromHexString(color);
  m.emissiveColor=m.diffuseColor.scale(.25);
  m.alpha=alpha;
  m.specularColor=BABYLON.Color3.Black();
  matCache[key]=m;
  return m;
}

function drawProceduralCanvas(ctx, type, frame){
  ctx.clearRect(0,0,128,128);
  const bob=Math.sin(frame*0.8)*3;
  if(type==='player'){
    ctx.fillStyle='rgba(60,180,240,0.85)';
    ctx.beginPath();ctx.arc(64,64+bob,38,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f5e4c3';
    ctx.beginPath();ctx.arc(64,48+bob,18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2a4b7c';
    ctx.beginPath();ctx.arc(64,88+bob,28,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#7ef5ff';ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(90,20+bob);ctx.lineTo(105,75+bob);ctx.stroke();
  }else if(type==='wolf'){
    ctx.fillStyle='rgba(180,40,50,0.85)';
    ctx.beginPath();ctx.arc(64,68+bob,32,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff3b30';
    ctx.beginPath();ctx.arc(58,50+bob,4,0,Math.PI*2);ctx.arc(70,50+bob,4,0,Math.PI*2);ctx.fill();
  }else if(type==='fox'){
    ctx.fillStyle='rgba(255,145,45,0.9)';
    ctx.beginPath();ctx.arc(64,66+bob,28,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4dd8ff';
    ctx.beginPath();ctx.arc(92,50+bob,10,0,Math.PI*2);ctx.fill();
  }else if(type==='golem'){
    ctx.fillStyle='rgba(95,115,105,0.95)';
    ctx.fillRect(36,36+bob,56,60);
    ctx.fillStyle='#7effc5';
    ctx.fillRect(60,56+bob,8,16);
  }else{
    ctx.fillStyle='rgba(80,45,110,0.9)';
    ctx.beginPath();ctx.arc(64,64+bob,36,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#b46aff';
    ctx.beginPath();ctx.arc(58,56+bob,5,0,Math.PI*2);ctx.arc(70,56+bob,5,0,Math.PI*2);ctx.fill();
  }
}

function makeSpriteMaterial(url, key){
  if(spriteMats[key])return spriteMats[key];
  let m=new BABYLON.StandardMaterial('sm_'+key,scene);
  let t=new BABYLON.Texture(url, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  t.hasAlpha=true;
  m.diffuseTexture=t;
  m.emissiveTexture=t;
  m.useAlphaFromDiffuseTexture=true;
  m.emissiveColor=new BABYLON.Color3(1.0,1.0,1.0);
  m.specularColor=BABYLON.Color3.Black();
  m.disableLighting=true;
  m.backFaceCulling=false;
  m.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;
  spriteMats[key]=m;
  return m;
}

// Một số actor đặc biệt (pet/boss cũ) chưa có bộ PNG 16 frame riêng.
// Dùng texture procedural thay vì cố tải file không tồn tại khiến actor bị vô hình
// và tạo hàng loạt lỗi 404 trên trình duyệt.
function makeProceduralSpriteMaterial(type,frame,key){
  if(spriteMats[key])return spriteMats[key];
  let m=new BABYLON.StandardMaterial('sm_'+key,scene);
  let t=new BABYLON.DynamicTexture('dt_'+key,{width:128,height:128},scene,false);
  t.hasAlpha=true;
  drawProceduralCanvas(t.getContext(),type,frame);
  t.update(false);
  m.diffuseTexture=t;
  m.emissiveTexture=t;
  m.useAlphaFromDiffuseTexture=true;
  m.emissiveColor=new BABYLON.Color3(1.0,1.0,1.0);
  m.specularColor=BABYLON.Color3.Black();
  m.disableLighting=true;
  m.backFaceCulling=false;
  m.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;
  spriteMats[key]=m;
  return m;
}

const PLAYER_ANIMS = {
  idle: { frames: 4, fps: 6, loop: true },
  run: { frames: 4, fps: 10, loop: true },
  attack: { frames: 8, fps: 12, loop: false }
};

// Player uses one physical sprite set only (RIGHT).
// LEFT is rendered by mirroring the billboard at runtime to halve player texture downloads/memory.
const playerMaterials = { idle: [], run: [], attack: [] };

function preloadPlayerMaterials(){
  ['idle','run','attack'].forEach(state=>{
    let n = PLAYER_ANIMS[state].frames;
    for(let i=0; i<n; i++){
      let s = String(i).padStart(2,'0');
      let url = `assets/player/right/${state}/${s}.png?v=5`;
      let key = `player_right_${state}_${s}`;
      let m = new BABYLON.StandardMaterial('sm_'+key, scene);
      let t = new BABYLON.Texture(url, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
      t.hasAlpha = true;
      m.diffuseTexture = t;
      m.emissiveTexture = t;
      m.useAlphaFromDiffuseTexture = true;
      m.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
      m.specularColor = BABYLON.Color3.Black();
      m.disableLighting = true;
      m.backFaceCulling = false;
      m.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
      playerMaterials[state].push(m);
    }
  });
}

function playerAnimMat(direction, state, frame){
  let st = (state === 'idle' || state === 'run' || state === 'attack') ? state : 'idle';
  let list = playerMaterials[st];
  if(!list || list.length === 0) return null;
  let idx = Math.min(Math.max(0, Math.floor(frame)), list.length - 1);
  return list[idx] || list[0];
}

function applyPlayerFacing(){
  if(!player || !player.mesh) return;
  let sx = Math.abs(player.mesh.scaling.x) || 1;
  player.mesh.scaling.x = player.facing === 'left' ? -sx : sx;
}

// Enemy sprites: 16 frames per type (00-07 = right, 08-15 = left mirrored)
const FILE_SPRITE_TYPES=new Set(['archer','bandit','boar','ice_wolf','skeleton','tiger','undead']);
function spriteFrames(type){
  let n = 16, arr = [];
  for(let i=0; i<n; i++){
    let key=type+i;
    if(FILE_SPRITE_TYPES.has(type)){
      arr.push(makeSpriteMaterial(`assets/sprites/${type}_${String(i).padStart(2,'0')}.png?v=6`,key));
    }else{
      arr.push(makeProceduralSpriteMaterial(type,i,key));
    }
  }
  return arr;
}

// Preload all new enemy sprites into spriteMats cache
function preloadEnemySprites(){
  const enemyTypes=['archer','bandit','boar','ice_wolf','skeleton','tiger','undead'];
  for(let t of enemyTypes) spriteFrames(t);
}

// ============================================================================
// HỆ THỐNG ASSET & HOẠT HỌA ĐỒNG MINH / ĐỆ TỬ ĐỒNG MÔN NPC 1 (FLIP GIỐNG PLAYER)
// ============================================================================
const npc1Materials = { idle: [], run: [], attack: [] };
let alliedNpcs = [];

function preloadNpc1Materials(){
  ['idle','run','attack'].forEach(state=>{
    let n = PLAYER_ANIMS[state].frames;
    for(let i=0; i<n; i++){
      let s = String(i).padStart(2,'0');
      let url = `assets/npcs/npc_01/right/${state}/${s}.png?v=71`;
      let key = `npc1_right_${state}_${s}`;
      let m = new BABYLON.StandardMaterial('sm_'+key, scene);
      let t = new BABYLON.Texture(url, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
      t.hasAlpha = true;
      m.diffuseTexture = t;
      m.emissiveTexture = t;
      m.useAlphaFromDiffuseTexture = true;
      m.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
      m.specularColor = BABYLON.Color3.Black();
      m.disableLighting = true;
      m.backFaceCulling = false;
      m.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
      npc1Materials[state].push(m);
    }
  });
}

function npc1AnimMat(state, frame){
  let st = (state === 'idle' || state === 'run' || state === 'attack') ? state : 'idle';
  let list = npc1Materials[st];
  if(!list || list.length === 0) return null;
  let idx = Math.min(Math.max(0, Math.floor(frame)), list.length - 1);
  return list[idx] || list[0];
}

function makeBillboard(name,type,size,x,z){
  let p=BABYLON.MeshBuilder.CreatePlane(name,{size},scene);
  p.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;
  p.position.set(x,size*.48,z);
  p.isPickable=false;
  if(type==='player'){
    p.material=playerAnimMat('right','idle',0);
  }else if(type==='npc1'){
    p.material=npc1AnimMat('idle',0);
  }else{
    p.material=spriteFrames(type)[0];
  }
  return p;
}

let softShadowMat = null;
function getSoftShadowMaterial(){
  if(softShadowMat) return softShadowMat;
  softShadowMat = new BABYLON.StandardMaterial('soft_shadow_mat', scene);
  let t = new BABYLON.Texture('assets/maps/common/grounds/soft_shadow.png', scene, false, true);
  t.hasAlpha = true;
  softShadowMat.diffuseTexture = t;
  softShadowMat.emissiveTexture = t;
  softShadowMat.useAlphaFromDiffuseTexture = true;
  softShadowMat.emissiveColor = new BABYLON.Color3(0.75, 0.75, 0.75);
  softShadowMat.specularColor = BABYLON.Color3.Black();
  softShadowMat.disableLighting = true;
  softShadowMat.alpha = 0.62;
  softShadowMat.zOffset = -2;
  softShadowMat.backFaceCulling = false;
  softShadowMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  return softShadowMat;
}

function getMapPropMaterial(url){
  if(mapPropMaterials[url])return mapPropMaterials[url];
  let m=new BABYLON.StandardMaterial('prop_'+url,scene);
  let t=new BABYLON.Texture(url,scene,false,true,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  t.hasAlpha=true;
  m.diffuseTexture=t;
  m.emissiveTexture=t;
  m.useAlphaFromDiffuseTexture=true;
  m.emissiveColor=new BABYLON.Color3(1.0,1.0,1.0);
  m.specularColor=BABYLON.Color3.Black();
  m.disableLighting=true;
  m.backFaceCulling=false;
  m.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;
  mapPropMaterials[url]=m;
  return m;
}

function spawnMapProp(name,propDef,x,z,sizeVariance=0.2){
  let isPatch = propDef.isGroundPatch || (propDef.file && propDef.file.includes('/grounds/')) || propDef.file === '__void__';
  let scale = isPatch ? 1.0 : (1.0 + rnd(-sizeVariance, sizeVariance));
  let w = propDef.width * scale;
  let h = propDef.height * scale;
  let p = BABYLON.MeshBuilder.CreatePlane(name, {width: w, height: h}, scene);

  if(isPatch){
    p.rotation.x = Math.PI / 2;
    p.position.set(x, 0.03 + (propDef.layer || 0) * 0.001, z);
    p.billboardMode = BABYLON.Mesh.BILLBOARDMODE_NONE;
  } else {
    p.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    p.position.set(x, h * 0.5, z);
  }

  p.material = getMapPropMaterial(propDef.file);
  p.isPickable = false;

  if(!isPatch && !propDef.noShadow && (!MOBILE_RUNTIME || Math.hypot(x,z)<82 || name.includes('village') || name.includes('gate') || name.includes('fence'))){
    let shadowSize = Math.max(w * 0.82, 1.2);
    let sh = BABYLON.MeshBuilder.CreatePlane(name + '_sh', {width: shadowSize, height: shadowSize * 0.62}, scene);
    sh.rotation.x = Math.PI / 2;
    sh.position.set(x, 0.02, z + 0.1);
    sh.material = getSoftShadowMaterial();
    sh.isPickable = false;
    decor.push(p, sh);
  } else {
    decor.push(p);
  }
  return p;
}

function spawnVillageCurvedWall(){
  // Bộ 9 PNG tường đá đã chuẩn hóa cùng canvas + cùng baseline,
  // render sẵn đúng camera orthographic elevation 50° của GAME.
  const wallFiles=[
    'assets/maps/common/fences_gates/stone_wall_50deg_00.png',
    'assets/maps/common/fences_gates/stone_wall_50deg_01.png',
    'assets/maps/common/fences_gates/stone_wall_50deg_02.png',
    'assets/maps/common/fences_gates/stone_wall_50deg_03.png',
    'assets/maps/common/fences_gates/stone_wall_50deg_04.png',
    'assets/maps/common/fences_gates/stone_wall_50deg_05.png',
    'assets/maps/common/fences_gates/stone_wall_50deg_06.png',
    'assets/maps/common/fences_gates/stone_wall_50deg_07.png',
    'assets/maps/common/fences_gates/stone_wall_50deg_08.png'
  ];

  // Tên file được tạo theo lô, không phải thứ tự góc nhìn liên tục.
  // Sắp lại theo silhouette: cạnh mỏng -> chéo phải -> chính diện
  // -> chéo trái -> cạnh mỏng, tương ứng -90°..+90°.
  const wallFrameOrder=[6,5,2,1,4,0,7,3,8];

  const rx=43.0,rz=40.0;
  const count=MOBILE_RUNTIME?156:240; // adaptive wall density

  // Góc tiếp tuyến ellipse -> frame gần nhất trong 9 hướng (-90°..+90°, bước 22.5°).
  function frameForTangent(a){
    const tx=-rx*Math.sin(a);
    const tz= rz*Math.cos(a);
    let deg=Math.atan2(tz,tx)*180/Math.PI;
    while(deg>90)deg-=180;
    while(deg<-90)deg+=180;
    return Math.max(0,Math.min(8,Math.round((deg+90)/22.5)));
  }

  for(let i=0;i<count;i++){
    const a=(i/count)*Math.PI*2;
    const x=Math.cos(a)*rx;
    const z=Math.sin(a)*rz;

    // Chừa hai lối cổng Bắc/Nam, các đoạn còn lại nối liên tục quanh trấn.
    if(Math.abs(x)<7.0 && Math.abs(z)>rz-4.6)continue;

    const fi=wallFrameOrder[frameForTangent(a)];
    spawnMapProp(
      'village_curve_wall_'+i,
      {
        file:wallFiles[fi],
        // Asset dùng canvas vuông 256x256. Giữ plane gần vuông để không ép
        // chiều ngang thành những cột đá mảnh như bản cũ.
        width:3.35,
        height:3.35,
        noShadow:true
      },
      x,z,0.0
    );
  }

  // Hai cổng chính giữ nguyên.
  spawnMapProp('village_gate_north',
    {file:'assets/maps/common/fences_gates/gate_ornate_01.png',width:5.8,height:5.4},
    0,-rz,0.01);
  spawnMapProp('village_gate_south',
    {file:'assets/maps/common/fences_gates/gate_wood_01.png',width:5.0,height:4.6},
    0,rz,0.01);

  const lamp={file:'assets/maps/common/lanterns/lantern_tall_wood_01.png',width:2.0,height:3.6};
  spawnMapProp('gate_n_l',lamp,-6.2,-rz,0.01);
  spawnMapProp('gate_n_r',lamp, 6.2,-rz,0.01);
  spawnMapProp('gate_s_l',lamp,-6.2, rz,0.01);
  spawnMapProp('gate_s_r',lamp, 6.2, rz,0.01);
}

let villageFormationMesh = null;
let villageDomeMesh = null;
let formationTexUrl = null;
let rainbowDomeTexUrl = null;

function getFormationTextureUrl(){
  if(formationTexUrl) return formationTexUrl;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const cx = 512, cy = 512;

    ctx.clearRect(0, 0, 1024, 1024);

    // Không dùng mảng vàng đặc lớn để tránh làm thôn có cảm giác bị nâng bổng / đang bay trên đĩa!
    // 1. Vòng chỉ vàng chính viền sắc nét, thanh thoát (Outer Crisp Golden Rings)
    ctx.strokeStyle = '#ffe875';
    ctx.lineWidth = 4.5;
    ctx.shadowColor = '#ffbb00';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, 488, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffc83b';
    ctx.lineWidth = 2.0;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, 464, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 440, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Ký tự phù văn cổ Bát Quái Tiên Hiệp thanh thoát (Ancient Formation Runes)
    ctx.font = 'bold 22px "Cinzel", "Noto Serif", serif';
    ctx.fillStyle = '#fff4b8';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const runes = ['乾', '☰', '坎', '☵', '艮', '☶', '震', '☳', '巽', '☴', '離', '☲', '坤', '☷', '兌', '☱', 
                   '金', '✦', '木', '✦', '水', '✦', '火', '✦', '土', '✦', '陰', '☯', '陽', '☯', '護', '陣'];
    const runeCount = 32;
    for(let i = 0; i < runeCount; i++){
      const angle = (i / runeCount) * Math.PI * 2;
      ctx.save();
      ctx.translate(cx + Math.cos(angle) * 452, cy + Math.sin(angle) * 452);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(runes[i % runes.length], 0, 0);
      ctx.restore();
    }

    // 3. Hoa văn sao Bát Giác & Đồ án Tiên Đạo tinh mỹ (8-Point Sacred Geometry)
    ctx.strokeStyle = 'rgba(255, 215, 80, 0.42)';
    ctx.lineWidth = 2.0;
    ctx.shadowBlur = 6;
    for(let i = 0; i < 8; i++){
      let a1 = (i / 8) * Math.PI * 2;
      let a2 = ((i + 3) / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * 440, cy + Math.sin(a1) * 440);
      ctx.lineTo(cx + Math.cos(a2) * 440, cy + Math.sin(a2) * 440);
      ctx.stroke();
    }

    // 4. Vòng cung hoa văn cánh sen đan xen (Sacred Lotus Arcs)
    ctx.strokeStyle = 'rgba(120, 255, 220, 0.35)'; // Ánh lam ngọc tiên khí điểm xuyết
    ctx.lineWidth = 1.6;
    for(let i = 0; i < 16; i++){
      let a = (i / 16) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * 380, cy + Math.sin(a) * 380, 60, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 5. Vòng tròn tâm nhỏ Bát Quái Cửu Cung
    ctx.strokeStyle = '#ffd866';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 320, 0, Math.PI * 2);
    ctx.stroke();

    formationTexUrl = canvas.toDataURL('image/png');
  } catch(e){
    console.warn('Không thể tạo texture trận pháp:', e);
  }
  return formationTexUrl;
}

function getRainbowDomeTextureUrl(){
  if(rainbowDomeTexUrl) return rainbowDomeTexUrl;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);

    // 1. Dải quang phổ Cầu Vồng Ngũ Sắc dọc theo vòm trời (Rainbow Celestial Aurora)
    // Trục dọc Y đại diện từ chân vòm (y = 512) lên đỉnh vòm trời (y = 0)
    let grad = ctx.createLinearGradient(0, 512, 0, 0);
    grad.addColorStop(0.00, 'rgba(255, 120, 150, 0.00)'); // Chân vòm tiếp đất trong suốt
    grad.addColorStop(0.15, 'rgba(255, 100, 120, 0.28)'); // Hồng ngọc đào hoa
    grad.addColorStop(0.32, 'rgba(255, 175, 50, 0.40)');  // Vàng kim triều dương
    grad.addColorStop(0.50, 'rgba(70, 240, 160, 0.45)');  // Lục bích tiên thảo
    grad.addColorStop(0.68, 'rgba(50, 210, 255, 0.50)');  // Lam ngọc thanh vân
    grad.addColorStop(0.85, 'rgba(175, 95, 255, 0.52)');  // Tím tử khí đông lai
    grad.addColorStop(1.00, 'rgba(255, 245, 220, 0.65)'); // Đỉnh quang kim nhật nguyệt
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Những luồng sóng ánh sáng tiên đạo & tia quang phổ lượn sóng
    for(let i = 0; i < 8; i++){
      let gradWave = ctx.createLinearGradient(i * 64, 0, (i + 1) * 64, 512);
      gradWave.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      gradWave.addColorStop(0.5, 'rgba(120, 240, 255, 0.18)');
      gradWave.addColorStop(1, 'rgba(255, 200, 100, 0.08)');
      ctx.fillStyle = gradWave;
      ctx.fillRect(i * 64, 0, 32, 512);
    }

    // 3. Vòng đai tinh tú và phù văn ánh sáng bay lượn trên đỉnh vòm
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.bezierCurveTo(170, 110, 340, 50, 512, 80);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 230, 120, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.bezierCurveTo(170, 230, 340, 170, 512, 200);
    ctx.stroke();

    rainbowDomeTexUrl = canvas.toDataURL('image/png');
  } catch(e){
    console.warn('Không thể tạo texture cầu vồng:', e);
  }
  return rainbowDomeTexUrl;
}

function spawnVillageFormationRing(cfg){
  let groundUrl = getFormationTextureUrl();
  let rainbowUrl = getRainbowDomeTextureUrl();
  if(!groundUrl) return null;

  // 1. Tính toán tâm chân tường thành của Thôn (khớp góc nhìn Isometric 2.5D)
  let centerX = -1.0;
  let centerZ = -10.8; // Khớp chuẩn xác chân tường thành đá
  let widthX = 23.8;
  let depthZ = 19.2;

  if(cfg && Array.isArray(cfg.villageProps) && cfg.villageProps.length > 0){
    let mainProps = cfg.villageProps.filter(p => (p.width || 0) > 6 || (p.height || 0) > 6);
    if(mainProps.length > 0){
      let p = mainProps[0];
      centerX = p.x || -1.0;
      centerZ = (p.z || -15.0) + (p.height || 24.8) * 0.17;
      widthX = (p.width || 24.8) * 0.96;
      depthZ = (p.height || 24.8) * 0.774;
    }
  }

  // 2. Vòng Trận Đồ Bát Quái Khắc Nét Dưới Mặt Đất (Ground Magic Runic Array)
  let p = BABYLON.MeshBuilder.CreatePlane('village_formation_ring', {width: widthX, height: depthZ}, scene);
  p.rotation.x = Math.PI / 2;
  p.position.set(centerX, 0.035, centerZ);
  p.billboardMode = BABYLON.Mesh.BILLBOARDMODE_NONE;

  let mat = new BABYLON.StandardMaterial('mat_village_formation', scene);
  let tex = new BABYLON.Texture(groundUrl, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  tex.hasAlpha = true;
  mat.diffuseTexture = tex;
  mat.emissiveTexture = tex;
  mat.opacityTexture = tex;
  mat.useAlphaFromDiffuseTexture = true;
  mat.emissiveColor = new BABYLON.Color3(1.0, 0.88, 0.45);
  mat.specularColor = BABYLON.Color3.Black();
  mat.disableLighting = true;
  mat.alpha = 0.88;
  mat.backFaceCulling = false;
  mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  p.material = mat;
  p.isPickable = false;
  villageFormationMesh = p;
  decor.push(p);

  // 3. Màn Chắn Vòm Cầu Vồng Ngũ Sắc Trên Không (3D Ethereal Rainbow Canopy Dome)
  if(rainbowUrl){
    let dome = BABYLON.MeshBuilder.CreateSphere('village_formation_dome', {
      diameterX: widthX + 1.2,
      diameterZ: depthZ + 1.2,
      diameterY: 25.0, // Vòm cao tỏa lên đỉnh bầu trời bao phủ cả mái đình thôn
      slice: 0.5,
      segments: 32
    }, scene);
    dome.position.set(centerX, 0.04, centerZ);
    dome.isPickable = false;

    let matDome = new BABYLON.StandardMaterial('mat_village_dome', scene);
    let rTex = new BABYLON.Texture(rainbowUrl, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
    rTex.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    rTex.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    matDome.diffuseTexture = rTex;
    matDome.emissiveTexture = rTex;
    matDome.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    matDome.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    matDome.alpha = 0.52;
    matDome.backFaceCulling = false;
    matDome.disableLighting = true;
    matDome.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    // Hiệu ứng phát sáng lấp lánh ở mép viền cầu vồng (Rainbow Edge Fresnel)
    matDome.emissiveFresnelParameters = new BABYLON.FresnelParameters();
    matDome.emissiveFresnelParameters.leftColor = new BABYLON.Color3(0.9, 0.95, 1.0);
    matDome.emissiveFresnelParameters.rightColor = new BABYLON.Color3(0.2, 0.25, 0.3);
    matDome.emissiveFresnelParameters.power = 1.8;
    matDome.emissiveFresnelParameters.bias = 0.15;

    dome.material = matDome;
    villageDomeMesh = dome;
    decor.push(dome);
  }

  return p;
}

const MAP_SPECIAL_SPAWNERS={
  villageCurvedWall: spawnVillageCurvedWall,
  villageFormationRing: spawnVillageFormationRing
};

async function loadMap(regionIdx){
  const token=++mapLoadToken;
  let reg=regions[regionIdx]||regions[0]||DEFAULT_REGION;
  const previousMapId=S.regionId;
  let cfg=await getMapConfig(reg.id);
  if(token!==mapLoadToken)return false;

  decor.forEach(m=>{
    try{
      if(m&&!m.isDisposed()){
        m.dispose();
      }
    }catch(e){}
  });
  decor=[];

  let sceneColor=reg.color?BABYLON.Color4.FromHexString(reg.color+'ff'):BABYLON.Color4.FromHexString(cfg.clearColor+'ff');
  scene.clearColor=sceneColor;
  scene.fogMode=BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogColor=new BABYLON.Color3(sceneColor.r,sceneColor.g,sceneColor.b);
  scene.fogStart=cfg.fogStart||45;
  scene.fogEnd=cfg.fogEnd||95;

  if(worldGround){
    const previousMaterial=worldGround.material;
    let gm=new BABYLON.StandardMaterial('groundMat_'+reg.id,scene);
    if(cfg.groundTexture){
      let gt=new BABYLON.Texture(cfg.groundTexture,scene,false,true,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
      let gScale=cfg.groundScale||80;
      gt.uScale=gScale;
      gt.vScale=gScale;
      gt.wrapU=BABYLON.Texture.WRAP_ADDRESSMODE;
      gt.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;
      gt.anisotropicFilteringLevel=MOBILE_RUNTIME?2:4;
      gm.diffuseTexture=gt;
      gm.specularColor=BABYLON.Color3.Black();
      gm.backFaceCulling=false;
    }
    worldGround.material=gm;
    if(previousMaterial&&previousMaterial!==gm){try{previousMaterial.dispose(true,true);}catch(e){}}
  }

  if(worldRiver){
    try{worldRiver.dispose();}catch(e){}
    worldRiver=null;
  }

  // Cây cối PNG (Trees)
  const vcx=cfg.villageClearX||14, vcz=cfg.villageClearZ||16;
  if(cfg.trees&&cfg.trees.length>0){
    for(let i=0;i<(MOBILE_RUNTIME?Math.min((cfg.treeCount||400),180):(cfg.treeCount||400));i++){
      let x=rnd(-MAP_BOUND,MAP_BOUND),z=rnd(-MAP_BOUND,MAP_BOUND);
      if(Math.abs(x)<vcx&&Math.abs(z)<vcz)continue;
      if(cfg.river&&cfg.river.enabled&&Math.abs(x-cfg.river.x)<14)continue;
      let treeDef=cfg.trees[Math.floor(Math.random()*cfg.trees.length)];
      spawnMapProp('tree_'+i,treeDef,x,z,0.22);
    }
  }

  // Đá PNG (Rocks)
  if(cfg.rocks&&cfg.rocks.length>0){
    for(let i=0;i<(MOBILE_RUNTIME?Math.min((cfg.rockCount||220),105):(cfg.rockCount||220));i++){
      let x=rnd(-MAP_BOUND,MAP_BOUND),z=rnd(-MAP_BOUND,MAP_BOUND);
      if(Math.abs(x)<vcx&&Math.abs(z)<vcz)continue;
      if(cfg.river&&cfg.river.enabled&&Math.abs(x-cfg.river.x)<12)continue;
      let rockDef=cfg.rocks[Math.floor(Math.random()*cfg.rocks.length)];
      spawnMapProp('rock_'+i,rockDef,x,z,0.2);
    }
  }

  // Đèn lồng PNG (Lanterns)
  if(cfg.lanternPosts&&cfg.decor&&cfg.decor[0]){
    let lanternDef=cfg.decor[0];
    cfg.lanternPosts.forEach((pt,i)=>{
      spawnMapProp('lantern_'+i,lanternDef,pt.x,pt.z,0.05);
    });
  }

  // Linh thảo / Bụi cỏ & Bụi hoa PNG (Grass, Bush, Flowers)
  let grassPool=(cfg.decor||[]).slice(1);
  if(grassPool.length>0){
    for(let i=0;i<(MOBILE_RUNTIME?Math.min((cfg.grassCount||140),75):(cfg.grassCount||140));i++){
      let x=rnd(-MAP_BOUND,MAP_BOUND),z=rnd(-MAP_BOUND,MAP_BOUND);
      if(Math.abs(x)<vcx&&Math.abs(z)<vcz)continue;
      let gDef=grassPool[Math.floor(Math.random()*grassPool.length)];
      spawnMapProp('grass_'+i,gDef,x,z,0.22);
    }
  }

  // Cảnh quan Thôn Làng (Village Landmarks)
  if(cfg.villageProps&&cfg.villageProps.length>0){
    cfg.villageProps.forEach((vp,i)=>{
      spawnMapProp('village_prop_'+i,vp,vp.x,vp.z,0.0);
    });
  }

  for(const name of cfg.specialSpawns){
    const spawn=MAP_SPECIAL_SPAWNERS[name];
    if(spawn)spawn(cfg);
    else console.warn('Chưa đăng ký map special spawn:',name);
  }

  // Tự động kích hoạt Vòng Trận Pháp Kim Quang Hộ Thôn cho Thanh Vân Thôn
  if(reg.id === 'thanh_van_thon' || reg.id === DEFAULT_MAP_ID || (cfg.specialSpawns && cfg.specialSpawns.includes('villageFormationRing'))){
    spawnVillageFormationRing(cfg);
  }
  S.regionId=reg.id;
  if(S.world)S.world.mapId=reg.id;
  if(window.AssetManager&&previousMapId&&previousMapId!==reg.id)window.AssetManager.releaseMap(previousMapId);
  if(window.GameEvents)window.GameEvents.emit('mapChanged',{from:previousMapId,to:reg.id,config:cfg});
  return true;
}

async function createWorld(){
  scene=new BABYLON.Scene(engine);
  scene.skipPointerMovePicking=true;
  scene.constantlyUpdateMeshUnderPointer=false;
  camera=new BABYLON.FreeCamera('cam',BABYLON.Vector3.Zero(),scene);
  camera.mode=BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ=.1;
  camera.maxZ=180;
  camera.inputs.clear();
  placeStandardCamera(0,0);
  updateOrthoCameraBounds();

  // Ánh sáng tổng thể thống nhất: từ trên-trái xuống.
  // Asset PNG đã bake ánh sáng vẫn disableLighting để giữ màu gốc.
  let light=new BABYLON.HemisphericLight('sky',new BABYLON.Vector3(-.45,1,-.35),scene);
  light.intensity=1.12;
  light.diffuse=new BABYLON.Color3(1.0,.98,.93);
  light.groundColor=new BABYLON.Color3(.36,.44,.38);

  worldGround=BABYLON.MeshBuilder.CreateGround('ground',{width:MAP_SIZE,height:MAP_SIZE,subdivisions:6},scene);

  // Hậu kỳ phát quang cao cấp (BABYLON.GlowLayer) - CHỈ ÁP DỤNG CHO KIẾM KHÍ & PHÁP TRẬN (Player & Enemy không bị chói sáng)
  try{
    if(typeof BABYLON.GlowLayer==='function'){
      const glow=new BABYLON.GlowLayer('vltkGlow',scene,{
        mainTextureFixedSize:MOBILE_RUNTIME?256:512,
        blurKernelSize:MOBILE_RUNTIME?16:32
      });
      glow.intensity=0.85;

      // Bộ lọc phát quang độc quyền: Chỉ cho phép vật liệu VFX Skill (vltk_, rune_mat_, sp_, npc_proj_mat_) phát sáng,
      // triệt tiêu phát sáng trên Player, Đồng Môn NPC 1, Quái vật (Enemy), Địa hình (Map) và Cây cối.
      glow.customEmissiveColorSelector = (mesh, subMesh, material, result) => {
        if(material && material.name && (
          material.name.startsWith('vltk_') ||
          material.name.startsWith('rune_mat_') ||
          material.name.startsWith('sp_') ||
          material.name.startsWith('npc_proj_mat_')
        )){
          if(material.emissiveColor){
            result.set(material.emissiveColor.r, material.emissiveColor.g, material.emissiveColor.b, material.alpha||1);
            return;
          }
        }
        // Toàn bộ Player, NPC 1, Enemy, Map, Props trả về 0 -> Giữ màu sắc gốc rõ nét, tuyệt đối không bị cháy sáng
        result.set(0, 0, 0, 0);
      };
    }
  }catch(e){
    console.warn('[GlowLayer] Không hỗ trợ GlowLayer:',e);
  }

  await loadMap(S.region||0);
}

function makeActor(type,x,z,elite=false){
  // 7 loại quái mới từ assets/sprites/{type}_00-15.png
  let defs={
    // Cấp thấp — ngoại ô, rừng núi (Luyện Khí Sơ Kỳ)
    boar:    {hp:1350, atk:22, speed:2.3,  size:2.6, xp:25, name:'Sơn Trư'},
    archer:  {hp:1100, atk:28, speed:1.9,  size:2.4, xp:28, name:'Tiễn Thủ'},
    // Cấp giữa — nhân loại tà ác, thú mạnh
    bandit:  {hp:1650, atk:35, speed:2.0,  size:2.5, xp:35, name:'Đạo Tặc'},
    tiger:   {hp:2100, atk:45, speed:2.6,  size:3.0, xp:45, name:'Hổ Thần'},
    // Cấp cao — bất tử, băng hệ
    skeleton:{hp:2600, atk:52, speed:1.5,  size:2.8, xp:55, name:'Khô Cốt'},
    undead:  {hp:2800, atk:60, speed:1.8,  size:2.9, xp:65, name:'Bạo Thi'},
    ice_wolf:{hp:3400, atk:70, speed:2.8,  size:3.1, xp:78, name:'Băng Lang'},
    // Legacy placeholders
    wolf:    {hp:1400, atk:25, speed:2.15, size:2.5, xp:26, name:'Ma Lang'},
    fox:     {hp:1600, atk:30, speed:1.9,  size:2.7, xp:32, name:'Linh Hồ'},
    golem:   {hp:3200, atk:42, speed:1.15, size:3.3, xp:50, name:'Thạch Khôi'},
    shadow:  {hp:2400, atk:48, speed:2.35, size:2.8, xp:46, name:'Ảnh Thú'}
  };
  let d=defs[type]||defs['wolf'];
  let rr=region(), enemyLv=Math.max(rr.min,Math.min(rr.max,Math.round(S.level+rnd(-2,3))));
  let rInfo=getEnemyRealmInfo(enemyLv);

  // Hệ số phẩm cấp Yêu Thú: Nhất Phẩm -> Ngũ Phẩm (tương thích từ Luyện Khí đến Hóa Thần)
  const GRADE_BASE_POWER = [1.0, 2.5, 6.2, 16.0, 42.0];
  const gradeBase = GRADE_BASE_POWER[rInfo.grade] || 1.0;
  const periodMult = Math.pow(1.22, rInfo.minor);
  const realmScale = gradeBase * periodMult;

  const eliteHpMult = elite ? 2.2 : 1.0;
  const eliteAtkMult = elite ? 1.35 : 1.0;

  let a={
    id:Math.random(),type,x,z,
    hp:Math.round(d.hp * realmScale * eliteHpMult),
    maxHp:Math.round(d.hp * realmScale * eliteHpMult),
    atk:Math.round(d.atk * realmScale * eliteAtkMult),
    speed:d.speed,
    size:d.size*(elite?1.22:1),xp:Math.round(d.xp * realmScale),
    name:(elite?'【Tinh Anh】 ':'')+d.name+' ['+rInfo.displayName+']',
    enemyLv,elite,dead:false,
    realmInfo:rInfo,
    damageType:({ice_wolf:'Thủy',fox:'Hỏa',golem:'Thổ',shadow:'Lôi',undead:'Mộc'}[type]||'physical'),
    attackCd:rnd(0,.7),bossSkillCd:4.5,
    frame:0,frameT:0
  };
  a.mesh=makeBillboard('enemy',type,a.size,x,z);
  let shW=a.size*0.85, shH=a.size*0.52;
  a.shadow=BABYLON.MeshBuilder.CreatePlane('sh_'+a.id,{width:shW,height:shH},scene);
  a.shadow.rotation.x=Math.PI/2;
  a.shadow.position.set(x,0.018,z);
  a.shadow.material=getSoftShadowMaterial();
  a.shadow.isPickable=false;

  actors.push(a);
  if(window.EnemySystem)window.EnemySystem.bind(actors,boss);
  return a;
}

function createPlayer(){
  player={
    x:0,z:0,
    mesh:makeBillboard('player','player',3.4,0,0),
    facing:'right',
    state:'idle',
    frame:0,
    animTimer:0,
    invuln:0
  };
  player.mesh.material=playerAnimMat(player.facing,'idle',0);
  player.shadow=BABYLON.MeshBuilder.CreatePlane('player_sh',{width:2.2,height:1.35},scene);
  player.shadow.rotation.x=Math.PI/2;
  player.shadow.position.set(0,0.019,0);
  player.shadow.material=getSoftShadowMaterial();
  player.shadow.isPickable=false;

  applyPlayerFacing();
  syncPet();
  updateHUD();
}

function triggerPlayerAttack(){
  if(!player)return;
  player.state='attack';
  player.frame=0;
  player.animTimer=0;
  if(player.mesh){
    player.mesh.material=playerAnimMat(player.facing,'attack',0);
  }
}

function syncPet(){
  if(S.pet){
    if(!petActor){
      petActor={
        x:player.x-1.5,z:player.z-1.5,
        mesh:makeBillboard('petFox','fox',2.0,player.x-1.5,player.z-1.5),
        frame:0,frameT:0,shootCd:1.8
      };
      petActor.mesh.scaling.setAll(0.72);
      petActor.shadow=BABYLON.MeshBuilder.CreatePlane('pet_sh',{width:1.5,height:0.95},scene);
      petActor.shadow.rotation.x=Math.PI/2;
      petActor.shadow.position.set(petActor.x,0.019,petActor.z);
      petActor.shadow.material=getSoftShadowMaterial();
      petActor.shadow.isPickable=false;
    }
  }else if(petActor){
    if(petActor.mesh)petActor.mesh.dispose();
    if(petActor.shadow)petActor.shadow.dispose();
    petActor=null;
  }
}

function enemySeedHash(text){
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
  
  if(isVillage){
    const points=[];
    let slot=0;

    // BAND 0: GẦN THÔN (52m - 115m) -> CHỈ XUẤT HIỆN LẺ 1 CON SƠN TRƯ (boar), TUYỆT ĐỐI KHÔNG THEO NHÓM
    const nearBoarCount = 36;
    for(let i=0;i<nearBoarCount;i++,slot++){
      let seed=enemySeedHash(rr.id+':solitary_boar:'+i);
      let r1=enemySeedRand(seed);seed=r1.seed;
      let r2=enemySeedRand(seed);
      // Rải đều 360 độ quanh thôn, mỗi con đứng một mình thong thả
      const angle=((i + r1.value * 0.45) / nearBoarCount) * Math.PI * 2;
      const radius=Math.sqrt(52*52 + r2.value * (115*115 - 52*52));
      let x=clamp(Math.cos(angle)*radius, -MAP_BOUND, MAP_BOUND);
      let z=clamp(Math.sin(angle)*radius, -MAP_BOUND, MAP_BOUND);
      if(isVillageSafe(x,z)){
        const p=clampToEllipse(x||1,z||1,VILLAGE_WALL_RX+8,VILLAGE_WALL_RZ+8,1.02);
        x=p.x;z=p.z;
      }
      points.push({
        id:rr.id+'_mob_'+slot, x, z,
        type:'boar', elite:false, band:0, campId:'solitary_'+i
      });
    }

    // CÁC BAND XA HƠN: Càng đi xa thôn mới xuất hiện theo bầy đàn / nhóm quái
    const outerBands=[
      // Band 1: Rừng trung (115m - 220m) -> Nhóm nhỏ 2-3 con
      {min:115, max:220, count:120, camps:40, types:['boar','archer'], eliteChance:0.02},
      // Band 2: Vùng sâu (220m - 340m) -> Nhóm vừa 4-5 con
      {min:220, max:340, count:280, camps:56, types:['bandit','tiger','wolf','fox'], eliteChance:0.04},
      // Band 3: Vùng biên ải / cấm địa (340m - 475m) -> Bầy lớn 6-8 con
      {min:340, max:475, count:480, camps:60, types:['skeleton','undead','ice_wolf','tiger','golem','shadow'], eliteChance:0.07}
    ];

    for(let bi=0;bi<outerBands.length;bi++){
      const b=outerBands[bi], campCenters=[];
      const bandIdx = bi + 1;
      for(let ci=0;ci<b.camps;ci++){
        let seed=enemySeedHash(rr.id+':camp:'+bandIdx+':'+ci);
        let r1=enemySeedRand(seed);seed=r1.seed;
        let r2=enemySeedRand(seed);
        const angle=((ci+r1.value*.55)/b.camps)*Math.PI*2+bi*.27;
        const radius=Math.sqrt(b.min*b.min+r2.value*(b.max*b.max-b.min*b.min));
        campCenters.push({x:Math.cos(angle)*radius,z:Math.sin(angle)*radius});
      }
      for(let i=0;i<b.count;i++,slot++){
        const ci=i%b.camps,center=campCenters[ci];
        let seed=enemySeedHash(rr.id+':mob:'+bandIdx+':'+i);
        let r1=enemySeedRand(seed);seed=r1.seed;
        let r2=enemySeedRand(seed);seed=r2.seed;
        let r3=enemySeedRand(seed);seed=r3.seed;
        let r4=enemySeedRand(seed);
        // Tụ bầy quái quanh tâm camp
        const spread=6+r1.value*7;
        const angle=r2.value*Math.PI*2;
        const radius=Math.sqrt(r3.value)*spread;
        let x=clamp(center.x+Math.cos(angle)*radius,-MAP_BOUND,MAP_BOUND);
        let z=clamp(center.z+Math.sin(angle)*radius,-MAP_BOUND,MAP_BOUND);
        if(isVillageSafe(x,z)){
          const p=clampToEllipse(x||1,z||1,VILLAGE_WALL_RX+8,VILLAGE_WALL_RZ+8,1.02);
          x=p.x;z=p.z;
        }
        const mobType = b.types[Math.floor(r4.value*b.types.length)%b.types.length];
        points.push({
          id:rr.id+'_mob_'+slot,x,z,
          type:mobType,
          elite:r1.value<b.eliteChance,band:bandIdx,campId:bandIdx+'_'+ci
        });
      }
    }
    return points;
  }

  // Các map khác (không phải Thôn)
  const bands=[
    {min:45,max:150,count:120,camps:12},
    {min:150,max:280,count:220,camps:22},
    {min:280,max:390,count:280,camps:28},
    {min:390,max:465,count:340,camps:34}
  ];
  const pool=(rr.enemy&&rr.enemy.length)?rr.enemy:['boar'];
  const points=[];
  let slot=0;
  for(let bi=0;bi<bands.length;bi++){
    const b=bands[bi],campCenters=[];
    for(let ci=0;ci<b.camps;ci++){
      let seed=enemySeedHash(rr.id+':camp:'+bi+':'+ci);
      let r1=enemySeedRand(seed);seed=r1.seed;
      let r2=enemySeedRand(seed);
      const angle=((ci+r1.value*.55)/b.camps)*Math.PI*2+bi*.27;
      const radius=Math.sqrt(b.min*b.min+r2.value*(b.max*b.max-b.min*b.min));
      campCenters.push({x:Math.cos(angle)*radius,z:Math.sin(angle)*radius});
    }
    for(let i=0;i<b.count;i++,slot++){
      const ci=i%b.camps,center=campCenters[ci];
      let seed=enemySeedHash(rr.id+':mob:'+bi+':'+i);
      let r1=enemySeedRand(seed);seed=r1.seed;
      let r2=enemySeedRand(seed);seed=r2.seed;
      let r3=enemySeedRand(seed);seed=r3.seed;
      let r4=enemySeedRand(seed);
      const spread=8+r1.value*6;
      const angle=r2.value*Math.PI*2;
      const radius=Math.sqrt(r3.value)*spread;
      let x=clamp(center.x+Math.cos(angle)*radius,-MAP_BOUND,MAP_BOUND);
      let z=clamp(center.z+Math.sin(angle)*radius,-MAP_BOUND,MAP_BOUND);
      points.push({
        id:rr.id+'_mob_'+slot,x,z,
        type:pool[Math.floor(r4.value*pool.length)%pool.length],
        elite:r1.value<(.025+bi*.012),band:bi,campId:bi+'_'+ci
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

// ============================================================================
// HỆ THỐNG ĐỒNG MINH / ĐỆ TỬ ĐỒNG MÔN NPC 1 (HÀNG TRĂM TIÊN NHÂN DIỆT QUÁI)
// ============================================================================

// Danh mục skill NPC nằm tại src/npc/npc-skills.js
const ALLIED_HOANG_HA_SKILLS=(window.NpcSkillCatalog&&window.NpcSkillCatalog.all)||[];

function launchAlliedNpcSkill(npc, target){
  if(!npc || !target || target.dead || !scene) return;
  const dx = target.x - npc.x, dz = target.z - npc.z;
  const dist = Math.max(0.1, Math.hypot(dx, dz));
  const ndx = dx / dist, ndz = dz / dist;
  const speed = 10.0;
  const travelTime = dist / speed;

  // Sử dụng tuyệt kỹ Hoàng Cấp Hạ Phẩm được chỉ định riêng cho từng NPC
  const sk = npc.assignedSkill || ALLIED_HOANG_HA_SKILLS[0];

  // Tạo đạn đạo phi kiếm / pháp bảo / chưởng pháp Hoàng Cấp Hạ Phẩm
  const proj = BABYLON.MeshBuilder.CreateSphere('npc_proj_' + Date.now(), { diameter: 0.52, segments: 4 }, scene);
  proj.position.set(npc.x + ndx * 0.6, 1.35, npc.z + ndz * 0.6);
  proj.material = glowMat('npc_proj_mat_' + sk.color, sk.color, 0.92, 2.5, true);
  proj.isPickable = false;

  burst(npc.x + ndx * 0.6, npc.z + ndz * 0.6, sk.color, 6, 0.6);
  sfx(sk.sfx);

  let hitRegistered = false;
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
  });
}

function damageAlliedNpc(npc, rawDmg, type='physical'){
  if(!npc || npc.dead) return;
  const reduced = Math.max(1, Math.round(rawDmg * rnd(0.75, 1.05) - 4));
  npc.hp -= reduced;
  floatText({ x: npc.x, y: 1.3, z: npc.z }, `-${reduced}`, '#ff5252');
  flash(npc.mesh);

  if(npc.hp <= 0){
    npc.hp = 0;
    npc.dead = true;
    npc.state = 'idle';
    npc.target = null;
    npc.respawnTimer = 4.5; // Hồi sinh sau 4.5 giây
    if(npc.mesh) npc.mesh.setEnabled(false);
    if(npc.shadow) npc.shadow.setEnabled(false);
    burst(npc.x, npc.z, '#7ceaff', 18, 1.6);
  }
}

function initializeAlliedNpcs(){
  for(const npc of alliedNpcs){
    try{if(npc.mesh)npc.mesh.dispose();}catch(e){}
    try{if(npc.shadow)npc.shadow.dispose();}catch(e){}
  }
  alliedNpcs = [];

  const rr = region();
  const isVillage = rr.id === 'thanh_van_thon';
  if(!isVillage) return;

  // Hàng trăm đệ tử đồng môn NPC 1 (100 người) tu vi Luyện Khí Sơ Kỳ, chia đều 9 hệ Hoàng Cấp Hạ Phẩm
  const npcCount = 100;
  for(let i = 0; i < npcCount; i++){
    let seed = enemySeedHash(rr.id + ':ally_npc1:' + i);
    let r1 = enemySeedRand(seed); seed = r1.seed;
    let r2 = enemySeedRand(seed); seed = r2.seed;
    let r3 = enemySeedRand(seed);

    // Phân bố rộng khắp toàn bộ bản đồ ngoại vi (bán kính từ 55m đến 380m)
    const angle = ((i + r1.value * 0.45) / npcCount) * Math.PI * 2;
    const radius = Math.sqrt(55 * 55 + r2.value * (380 * 380 - 55 * 55));
    let x = clamp(Math.cos(angle) * radius, -MAP_BOUND, MAP_BOUND);
    let z = clamp(Math.sin(angle) * radius, -MAP_BOUND, MAP_BOUND);
    if(isVillageSafe(x, z)){
      const p = clampToEllipse(x || 1, z || 1, VILLAGE_WALL_RX + 9, VILLAGE_WALL_RZ + 9, 1.03);
      x = p.x; z = p.z;
    }

    const size = 3.2 + (r3.value * 0.25 - 0.12);
    const mesh = makeBillboard('ally_npc1_' + i, 'npc1', size, x, z);
    const shW = size * 0.85, shH = size * 0.52;
    const shadow = BABYLON.MeshBuilder.CreatePlane('ally_sh_' + i, { width: shW, height: shH }, scene);
    shadow.rotation.x = Math.PI / 2;
    shadow.position.set(x, 0.019, z);
    shadow.material = getSoftShadowMaterial();
    shadow.isPickable = false;

    // Cổng làng thoát ra ngoài gần nhất
    const gates = [
      { x: 0, z: VILLAGE_WALL_RZ + 12 },    // Cổng Nam
      { x: 0, z: -VILLAGE_WALL_RZ - 12 },   // Cổng Bắc
      { x: VILLAGE_WALL_RX + 12, z: 0 },    // Cổng Đông
      { x: -VILLAGE_WALL_RX - 12, z: 0 }    // Cổng Tây
    ];
    const gateTarget = gates[i % gates.length];

    // Gán 1 bí tịch Hoàng Cấp Hạ Phẩm cố định cho từng NPC (phân bố đều toàn bộ 9 hệ)
    const assignedSkill = window.NpcSkillCatalog?window.NpcSkillCatalog.get(i):ALLIED_HOANG_HA_SKILLS[i % ALLIED_HOANG_HA_SKILLS.length];

    const npcRecord={
      id: 'ally_' + i,
      name: `【Đồng Môn · ${assignedSkill.faction}】 Tiên Hiệp [Luyện Khí · Sơ Kỳ]`,
      realm: 'Luyện Khí · Sơ Kỳ',
      level: 1 + Math.floor(r1.value * 3), // Luyện Khí Tầng 1 - 3
      assignedSkill,
      x, z,
      homeX: x, homeZ: z,
      targetX: x, targetZ: z,
      size,
      speed: 5.2 + r1.value * 0.8, // Tốc độ chạy nhanh nhẹn
      atk: Math.round(rnd(34, 46)),
      hp: 1600, maxHp: 1600,
      mp: 500, maxMp: 500,
      dead: false,
      respawnTimer: 0,
      exitingVillage: false,
      gateTarget: gateTarget,
      state: 'idle',
      facing: r2.value > 0.5 ? 'right' : 'left',
      frame: Math.floor(r1.value * 4),
      animTimer: r2.value * 0.5,
      attackCd: rnd(0.2, 1.0),
      skillCd: rnd(1.0, 3.0),
      patrolAngle: r3.value * Math.PI * 2,
      patrolTimer: rnd(3.0, 8.0),
      patrolWait: rnd(0.5, 2.0),
      target: null,
      mesh, shadow
    };
    alliedNpcs.push(npcRecord);
    if(window.NpcSystem)window.NpcSystem.register(npcRecord);
  }
  console.info(`[AlliedNPC] Khởi tạo ${alliedNpcs.length} Đệ Tử Đồng Môn [Luyện Khí · Sơ Kỳ] sử dụng toàn bộ 9 hệ kỹ năng Hoàng Cấp Hạ Phẩm.`);
}

function updateAlliedNpcs(dt){
  if(!alliedNpcs || alliedNpcs.length === 0) return;

  for(let i = 0; i < alliedNpcs.length; i++){
    const npc = alliedNpcs[i];

    // XỬ LÝ HỒI SINH TRONG THÔN RỒI XUẤT PHÁT RA NGOÀI
    if(npc.dead){
      npc.respawnTimer -= dt;
      if(npc.respawnTimer <= 0){
        // Hồi sinh tại quảng trường trung tâm Thanh Vân Thôn
        npc.dead = false;
        npc.hp = npc.maxHp;
        npc.mp = npc.maxMp;
        npc.x = rnd(-6, 6);
        npc.z = rnd(0, 8);
        npc.exitingVillage = true; // Trạng thái xuất thôn
        npc.state = 'run';
        npc.target = null;

        // Chọn 1 trong 4 cổng làng để chạy ra
        const gates = [
          { x: 0, z: VILLAGE_WALL_RZ + 14 },
          { x: 0, z: -VILLAGE_WALL_RZ - 14 },
          { x: VILLAGE_WALL_RX + 14, z: 0 },
          { x: -VILLAGE_WALL_RX - 14, z: 0 }
        ];
        npc.gateTarget = gates[Math.floor(Math.random() * gates.length)];

        if(npc.mesh){
          npc.mesh.position.set(npc.x, npc.size * 0.48, npc.z);
          npc.mesh.setEnabled(true);
        }
        if(npc.shadow){
          npc.shadow.position.set(npc.x, 0.019, npc.z);
          npc.shadow.setEnabled(true);
        }
        burst(npc.x, npc.z, '#7eeaff', 20, 2.0);
        sfx('levelUp');
      }
      continue;
    }

    const pdx = player.x - npc.x, pdz = player.z - npc.z;
    const distToPlayer2 = pdx * pdx + pdz * pdz;

    // Tối ưu hóa culling: nếu gần người chơi thì hiển thị 3D & bóng
    const isNearPlayer = window.CullingSystem?window.CullingSystem.setActorVisible(npc,player,180,70):(distToPlayer2 < 32400);
    if(!window.CullingSystem){if(npc.mesh)npc.mesh.setEnabled(isNearPlayer);if(npc.shadow)npc.shadow.setEnabled(distToPlayer2<4900);}

    // TRƯỜNG HỢP 1: ĐANG CHẠY TỪ TRONG THÔN RA NGOÀI CỔNG LÀNG
    if(npc.exitingVillage){
      const gdx = npc.gateTarget.x - npc.x, gdz = npc.gateTarget.z - npc.z;
      const gdist = Math.max(0.1, Math.hypot(gdx, gdz));
      if(gdist > 2.0){
        const nx = gdx / gdist, nz = gdz / gdist;
        npc.x += nx * npc.speed * dt;
        npc.z += nz * npc.speed * dt;
        npc.facing = nx < -0.05 ? 'left' : 'right';
        npc.state = 'run';
      } else {
        // Đã ra khỏi thôn an toàn, hòa vào đại quân săn quái khắp map
        npc.exitingVillage = false;
        npc.homeX = npc.x;
        npc.homeZ = npc.z;
      }
    } else {
      // TRƯỜNG HỢP 2: TỰ ĐỘNG QUÉT QUÁI VẬT TOÀN MAP (AGGRO RADAR 35m)
      let bestTarget = null;
      let bestD2 = 35.0 * 35.0; // Tầm phát hiện quái vật 35m
      if(npc.target && !npc.target.dead && !isVillageSafe(npc.target.x, npc.target.z)){
        const tdx = npc.target.x - npc.x, tdz = npc.target.z - npc.z;
        const td2 = tdx * tdx + tdz * tdz;
        if(td2 <= 42.0 * 42.0) bestTarget = npc.target;
      }

      if(!bestTarget){
        for(let j = 0; j < actors.length; j++){
          const a = actors[j];
          if(!a || a.dead || isVillageSafe(a.x, a.z)) continue;
          const adx = a.x - npc.x, adz = a.z - npc.z;
          const ad2 = adx * adx + adz * adz;
          if(ad2 < bestD2){
            bestD2 = ad2;
            bestTarget = a;
          }
        }
        npc.target = bestTarget;
      }

      // HÀNH ĐỘNG TỰ ĐỘNG ĐÁNH ENEMY KHI NHÌN THẤY
      if(bestTarget){
        const tdx = bestTarget.x - npc.x, tdz = bestTarget.z - npc.z;
        const dist = Math.max(0.01, Math.hypot(tdx, tdz));
        npc.facing = tdx < 0 ? 'left' : 'right';

        if(window.NpcAI){
          window.NpcAI.tickCombat(npc,bestTarget,dt,{
            bound:MAP_BOUND,
            skillCooldown:()=>rnd(1.6,2.8),
            attackCooldown:()=>1.05+rnd(-0.12,0.18),
            castSkill:launchAlliedNpcSkill,
            basicAttack:(unit,target)=>{
              const slashColor=(unit.assignedSkill&&unit.assignedSkill.color)||'#7eeaff';
              slash(target.x,target.z,slashColor);
              sfx(unit.assignedSkill?unit.assignedSkill.sfx:'slash');
              damage(target,Math.round(unit.atk*.72),Math.random()<.22,unit.assignedSkill?unit.assignedSkill.elem:'physical',false,'npc');
            }
          });
        }else if(dist>2.6){
          const nx=tdx/dist,nz=tdz/dist;
          npc.x=clamp(npc.x+nx*npc.speed*dt,-MAP_BOUND,MAP_BOUND);
          npc.z=clamp(npc.z+nz*npc.speed*dt,-MAP_BOUND,MAP_BOUND);
          npc.state='run';
        }
      } else {
        // CHẠY KHẮP MAP ĐI TÌM QUÁI VẬT (MAP-WIDE EXPLORATION)
        npc.patrolTimer = (npc.patrolTimer || 0) - dt;
        if(npc.patrolTimer <= 0 || !npc.targetX){
          // Chọn một vùng săn quái mới trên bản đồ cách đó 40m - 100m
          const roamAngle = Math.random() * Math.PI * 2;
          const roamRadius = rnd(60, 380);
          npc.targetX = clamp(Math.cos(roamAngle) * roamRadius, -MAP_BOUND, MAP_BOUND);
          npc.targetZ = clamp(Math.sin(roamAngle) * roamRadius, -MAP_BOUND, MAP_BOUND);
          if(isVillageSafe(npc.targetX, npc.targetZ)){
            const p = clampToEllipse(npc.targetX || 1, npc.targetZ || 1, VILLAGE_WALL_RX + 12, VILLAGE_WALL_RZ + 12, 1.05);
            npc.targetX = p.x; npc.targetZ = p.z;
          }
          npc.patrolTimer = rnd(8.0, 18.0);
        }

        const mdx = npc.targetX - npc.x, mdz = npc.targetZ - npc.z;
        const mdist = Math.max(0.1, Math.hypot(mdx, mdz));
        if(mdist > 2.0){
          const nx = mdx / mdist, nz = mdz / mdist;
          npc.x = clamp(npc.x + nx * (npc.speed * 0.85) * dt, -MAP_BOUND, MAP_BOUND);
          npc.z = clamp(npc.z + nz * (npc.speed * 0.85) * dt, -MAP_BOUND, MAP_BOUND);
          npc.facing = nx < -0.05 ? 'left' : 'right';
          npc.state = 'run';
        } else {
          npc.state = 'idle';
        }
      }

      // Đẩy NPC ra ngoài nếu lọt vào an toàn thôn
      if(isVillageSafe(npc.x, npc.z)){
        const p = clampToEllipse(npc.x || 1, npc.z || 1, VILLAGE_WALL_RX + 8, VILLAGE_WALL_RZ + 8, 1.02);
        npc.x = p.x; npc.z = p.z;
      }
    }

    // ĐỒNG BỘ HOẠT HỌA & FLIP HÌNH ẢNH SPRITE (GIỐNG PLAYER)
    if(isNearPlayer && npc.mesh){
      const animDef = PLAYER_ANIMS[npc.state] || PLAYER_ANIMS['idle'];
      npc.animTimer = (npc.animTimer || 0) + dt;
      if(npc.animTimer >= 1.0 / animDef.fps){
        npc.animTimer = 0;
        npc.frame++;
        if(npc.frame >= animDef.frames){
          if(animDef.loop){
            npc.frame = 0;
          } else {
            npc.state = 'idle';
            npc.frame = 0;
          }
        }
      }

      npc.mesh.material = npc1AnimMat(npc.state, npc.frame);
      const absSx = Math.abs(npc.mesh.scaling.x) || 1;
      npc.mesh.scaling.x = (npc.facing === 'left') ? -absSx : absSx;
      npc.mesh.position.set(npc.x, npc.size * 0.48, npc.z);

      if(npc.shadow){
        npc.shadow.position.x = npc.x;
        npc.shadow.position.z = npc.z;
      }
    }
  }
}

function spawnBoss(){
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
  if(window.EnemySystem)window.EnemySystem.setBoss(boss);
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
      if(window.EnemySystem)window.EnemySystem.setBoss(null);
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
}

function useDash(){
  if(paused||dashCd.t>0)return;
  dashCd.t=1.5;
  sfx('dash');
  let mx=joy.x+(keys['a']||keys['arrowleft']?-1:0)+(keys['d']||keys['arrowright']?1:0);
  let mz=joy.y+(keys['w']||keys['arrowup']?1:0)+(keys['s']||keys['arrowdown']?-1:0);
  let l=Math.hypot(mx,mz);
  if(l<0.05){mx=player.facing==='left'?-1:1;mz=0;}else{mx/=l;mz/=l;}

  let dashX=clamp(player.x+mx*6.5,-MAP_BOUND,MAP_BOUND);
  let dashZ=clamp(player.z+mz*6.5,-MAP_BOUND,MAP_BOUND);
  let dashMove=resolveVillageWallMove(player.x,player.z,dashX,dashZ);
  player.x=dashMove.x;
  player.z=dashMove.z;
  player.invuln=0.45;
  burst(player.x,player.z,'#a8fce4',18,4);
  updateCooldownUI();
}

function flash(mesh){
  let s=mesh.scaling.clone();
  mesh.scaling.scaleInPlace(1.12);
  setTimeout(()=>{if(!mesh.isDisposed())mesh.scaling.copyFrom(s)},75);
}

function slash(x,z,color){
  burst(x,z,color,6,0.9);
}

function ring(x,z,color,r=4){
  burst(x,z,color,8,Math.min(2.5,(r||4)*0.35));
}

function burst(x,z,color,count=18,r=5){
  const profile=window.PerformanceProfile&&window.PerformanceProfile.current;
  if(profile)count=Math.max(4,Math.round(count*profile.particleScale));
  const maxVfx=profile?profile.maxVfx:100;
  if(effects.length>=maxVfx)return;
  count=Math.min(count,maxVfx-effects.length);
  let cnt=Math.min(count,S.quality?50:24);
  let m=mat('fx_burst',color,.9);
  for(let i=0;i<cnt;i++){
    let s=BABYLON.MeshBuilder.CreateSphere('p',{diameter:rnd(.06,.16),segments:3},scene);
    s.position.set(x+rnd(-.4,.4),rnd(.2,1.4),z+rnd(-.4,.4));
    s.material=m;
    let a=rnd(0,6.28),sp=rnd(2,r);
    effects.push({mesh:s,t:rnd(.3,.6),max:.6,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:rnd(.3,1.8)});
  }
}

function vfxDirectionCell(dx,dz,center=false){
  // Sprite sheet 3x3:
  // NW | N | NE
  // W  | C | E
  // SW | S | SE
  if(center)return {row:1,col:1,key:'c'};
  let len=Math.hypot(dx,dz);
  if(len<0.001)return {row:1,col:1,key:'c'};
  dx/=len; dz/=len;
  const t=0.38;
  let col=dx<-t?0:(dx>t?2:1);
  let row=dz>t?0:(dz<-t?2:1);
  const keys=[
    ['nw','n','ne'],
    ['w','c','e'],
    ['sw','s','se']
  ];
  return {row,col,key:keys[row][col]};
}

function glowMat(name,color,alpha=1,emissiveBoost=1.5,isAdditive=true){
  let key=`vltk_${name}_${color}_${alpha}_${emissiveBoost}_${isAdditive}`;
  if(matCache[key])return matCache[key];
  let m=new BABYLON.StandardMaterial(key,scene);
  const c=BABYLON.Color3.FromHexString(color);
  m.diffuseColor=c;
  m.emissiveColor=c.scale(emissiveBoost);
  m.alpha=alpha;
  m.specularColor=BABYLON.Color3.Black();
  m.disableLighting=true;
  m.backFaceCulling=false;
  m.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;
  if(isAdditive) m.alphaMode=BABYLON.Engine.ALPHA_ADD;
  matCache[key]=m;
  return m;
}

// ============================================================================
// HỆ THỐNG HIỆU ỨNG CHIÊU THỨC VÕ LÂM TRUYỀN KỲ CỰC PHẨM (VLTK / JX MARTIAL ARTS)
// ============================================================================

// Bộ nhớ đệm Canvas Texture cho Pháp Trận Bát Quái / Thất Tinh Đạo Pháp
const daoistTexCache = {};

function createDaoistFormationTexture(runeType='bagua', mainColor='#7ceaff', glowColor='#ffffff'){
  const key=`rune_${runeType}_${mainColor}_${glowColor}`;
  if(daoistTexCache[key]) return daoistTexCache[key];

  const cv=document.createElement('canvas');
  cv.width=512; cv.height=512;
  const ctx=cv.getContext('2d');
  const w=512, h=512, cx=256, cy=256, r=236;
  ctx.clearRect(0,0,w,h);

  // Vầng hào quang tỏa sáng mềm mại (Outer Radial Bloom)
  const grad=ctx.createRadialGradient(cx,cy,r*0.15,cx,cy,r*1.06);
  grad.addColorStop(0,'rgba(0,0,0,0)');
  grad.addColorStop(0.65,mainColor+'18');
  grad.addColorStop(0.92,mainColor+'40');
  grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grad;
  ctx.beginPath(); ctx.arc(cx,cy,r*1.06,0,Math.PI*2); ctx.fill();

  ctx.strokeStyle=mainColor;
  ctx.lineWidth=4;
  ctx.shadowColor=mainColor;
  ctx.shadowBlur=16;

  // Các vòng tròn đồng tâm trận pháp
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,r*0.89,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,r*0.66,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,r*0.38,0,Math.PI*2); ctx.stroke();

  // Bát Quái Cổ Trận (☰ ☱ ☲ ☳ ☴ ☵ ☶ ☷)
  const trigrams=['☰','☱','☲','☳','☴','☵','☶','☷'];
  ctx.font='bold 34px sans-serif';
  ctx.fillStyle=glowColor;
  ctx.textAlign='center';
  ctx.textBaseline='middle';

  for(let i=0;i<8;i++){
    const a=(i/8)*Math.PI*2;
    // Rãnh phân cung
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a)*(r*0.89), cy+Math.sin(a)*(r*0.89));
    ctx.lineTo(cx+Math.cos(a)*r, cy+Math.sin(a)*r);
    ctx.stroke();

    // Khắc quẻ Bát Quái
    const textR=r*0.77;
    const tx=cx+Math.cos(a+Math.PI/8)*textR;
    const ty=cy+Math.sin(a+Math.PI/8)*textR;
    ctx.save();
    ctx.translate(tx,ty);
    ctx.rotate(a+Math.PI/8+Math.PI/2);
    ctx.fillText(trigrams[i],0,0);
    ctx.restore();
  }

  // Sao Trận Đồ: Thất Tinh (7 cánh) hoặc Bát Trận (8 cánh)
  ctx.beginPath();
  const starR=r*0.66;
  const count=runeType==='seven_star'?7:8;
  const step=runeType==='seven_star'?3:3;
  for(let i=0;i<count;i++){
    const idx=(i*step)%count;
    const a=(idx/count)*Math.PI*2 - Math.PI/2;
    const px=cx+Math.cos(a)*starR;
    const py=cy+Math.sin(a)*starR;
    if(i===0) ctx.moveTo(px,py);
    else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.stroke();

  // Thái Cực Lưỡng Nghi (Yin-Yang Core)
  const taijiR=r*0.38;
  ctx.beginPath(); ctx.arc(cx,cy,taijiR,0,Math.PI*2); ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy-taijiR/2, taijiR/2, Math.PI/2, Math.PI*1.5);
  ctx.arc(cx, cy+taijiR/2, taijiR/2, Math.PI*1.5, Math.PI/2);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy-taijiR/2, taijiR*0.18, 0, Math.PI*2); ctx.fillStyle=mainColor; ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy+taijiR/2, taijiR*0.18, 0, Math.PI*2); ctx.fillStyle=glowColor; ctx.fill();

  const dt=new BABYLON.DynamicTexture(key,{width:512,height:512},scene,false);
  dt.hasAlpha=true;
  const dtCtx=dt.getContext();
  dtCtx.drawImage(cv,0,0);
  dt.update();

  daoistTexCache[key]=dt;
  return dt;
}

// Tạo Pháp Trận Bát Quái / Thất Tinh phát quang xoay tròn trên mặt đất
function createDaoistGroundRune(runeType='bagua', x=0, z=0, radius=5.0, mainColor='#7ceaff', glowColor='#ffffff', duration=2.0, rotSpeed=0.45){
  if(!scene)return null;
  const disc=BABYLON.MeshBuilder.CreateDisc('ground_rune_'+Date.now(),{radius:radius,tessellation:36},scene);
  disc.position.set(x,0.024,z);
  disc.rotation.x=Math.PI/2;
  disc.isPickable=false;

  const mat=new BABYLON.StandardMaterial('rune_mat_'+Date.now(),scene);
  const tex=createDaoistFormationTexture(runeType,mainColor,glowColor);
  mat.diffuseTexture=tex;
  mat.opacityTexture=tex;
  mat.emissiveColor=BABYLON.Color3.FromHexString(mainColor).scale(2.2);
  mat.disableLighting=true;
  mat.backFaceCulling=false;
  mat.alphaMode=BABYLON.Engine.ALPHA_ADD;
  mat.alpha=0.92;
  disc.material=mat;

  effects.push({
    groundRune:disc,
    mat:mat,
    baseAlpha:0.92,
    rotSpeed:rotSpeed,
    t:duration,
    max:duration
  });
  return disc;
}

// 1. Tạo mô hình Phi Kiếm Tiên Đạo 3D Cực Phẩm (Exquisite Celestial Daoist Sword)
function createVltkSwordMesh(name, color='#7ceaff', scale=1.0, isGiant=false){
  const root=new BABYLON.TransformNode(name||'vltk_sword_'+Date.now(),scene);
  const bladeH=(isGiant?7.2:2.5)*scale;
  const bladeW=(isGiant?0.95:0.28)*scale;

  // A. Thân Kiếm Cắt Cạnh Kim Cương Siêu Sắc Bén (Diamond-Honed Razor Blade)
  const blade=BABYLON.MeshBuilder.CreateCylinder('blade',{
    height:bladeH,
    diameterTop:0.012,
    diameterBottom:bladeW,
    tessellation:4
  },scene);
  blade.parent=root;
  blade.scaling.set(1.0, 1.0, 0.24); // Ép dẹp thành lưỡi kiếm 2 lưỡi bén ngót
  blade.rotation.x=Math.PI/2;
  blade.rotation.z=Math.PI/4; // Cạnh cắt hướng về 2 bên
  blade.position.z=bladeH*0.42;
  blade.material=glowMat('vltk_blade_'+color,color,0.96,isGiant?3.8:2.6,true);
  blade.isPickable=false;

  // B. Lõi Tinh Thạch Sống Kiếm Sáng Trắng Cực Điểm (White-Hot Crystal Spine)
  const core=BABYLON.MeshBuilder.CreateCylinder('core',{
    height:bladeH*0.94,
    diameter:(isGiant?0.22:0.07)*scale,
    tessellation:4
  },scene);
  core.parent=root;
  core.scaling.set(0.6, 1.0, 0.6);
  core.rotation.x=Math.PI/2;
  core.rotation.z=Math.PI/4;
  core.position.z=bladeH*0.42;
  core.material=glowMat('vltk_core_white','#ffffff',0.98,4.2,true);
  core.isPickable=false;

  // C. Long Hổ Hộ Thủ Đôi Cánh Phượng (Winged Golden Crossguard)
  const guardL=BABYLON.MeshBuilder.CreateBox('guard_l',{
    width:(isGiant?1.0:0.42)*scale,
    height:(isGiant?0.2:0.06)*scale,
    depth:(isGiant?0.28:0.1)*scale
  },scene);
  guardL.parent=root;
  guardL.position.set(-(isGiant?0.48:0.2)*scale, 0, -(isGiant?0.08:0.03)*scale);
  guardL.rotation.y=-0.35; // Cánh vát cong về sau
  guardL.material=glowMat('vltk_guard_gold','#ffdf70',0.95,2.4,true);
  guardL.isPickable=false;

  const guardR=BABYLON.MeshBuilder.CreateBox('guard_r',{
    width:(isGiant?1.0:0.42)*scale,
    height:(isGiant?0.2:0.06)*scale,
    depth:(isGiant?0.28:0.1)*scale
  },scene);
  guardR.parent=root;
  guardR.position.set((isGiant?0.48:0.2)*scale, 0, -(isGiant?0.08:0.03)*scale);
  guardR.rotation.y=0.35;
  guardR.material=glowMat('vltk_guard_gold','#ffdf70',0.95,2.4,true);
  guardR.isPickable=false;

  // Ngọc bội trung tâm hộ thủ
  const gem=BABYLON.MeshBuilder.CreateSphere('guard_gem',{diameter:(isGiant?0.36:0.14)*scale,segments:6},scene);
  gem.parent=root;
  gem.material=glowMat('vltk_gem_'+color,isGiant?'#ffd700':color,0.98,3.2,true);
  gem.isPickable=false;

  // D. Vòng Trận Phù Xoay Quanh Chuôi Kiếm (Orbiting Rune Seal Disc)
  const runeDisc=BABYLON.MeshBuilder.CreateDisc('rune_seal',{radius:(isGiant?1.1:0.38)*scale,tessellation:24},scene);
  runeDisc.parent=root;
  runeDisc.rotation.x=Math.PI/2;
  runeDisc.material=glowMat('vltk_seal_'+color,color,0.78,2.8,true);
  runeDisc.isPickable=false;

  // E. Cán Kiếm Bọc Lụa Vân Vàng & Hoa Sen Chuôi Kiếm (Braided Grip & Lotus Pommel)
  const hilt=BABYLON.MeshBuilder.CreateCylinder('hilt',{
    height:(isGiant?1.3:0.52)*scale,
    diameter:(isGiant?0.15:0.055)*scale,
    tessellation:8
  },scene);
  hilt.parent=root;
  hilt.rotation.x=Math.PI/2;
  hilt.position.z=-(isGiant?0.65:0.26)*scale;
  hilt.material=glowMat('vltk_hilt_dark','#1f2430',0.95,1.0,false);
  hilt.isPickable=false;

  const pommel=BABYLON.MeshBuilder.CreateTorus('pommel',{
    diameter:(isGiant?0.32:0.12)*scale,
    thickness:(isGiant?0.08:0.03)*scale,
    tessellation:12
  },scene);
  pommel.parent=root;
  pommel.rotation.x=Math.PI/2;
  pommel.position.z=-(isGiant?1.3:0.52)*scale;
  pommel.material=glowMat('vltk_pommel_gold','#ffdf70',0.95,2.0,true);
  pommel.isPickable=false;

  // F. Song Hào Quang Kiếm Khí Đa Hướng (Dual-Cross Aura Planes `+`)
  const aura1=BABYLON.MeshBuilder.CreatePlane('aura1',{
    width:(isGiant?1.8:0.65)*scale,
    height:bladeH*1.12,
    sideOrientation:BABYLON.Mesh.DOUBLESIDE
  },scene);
  aura1.parent=root;
  aura1.rotation.x=Math.PI/2;
  aura1.position.z=bladeH*0.42;
  aura1.material=glowMat('vltk_aura_'+color,color,0.72,2.4,true);
  aura1.isPickable=false;

  const aura2=BABYLON.MeshBuilder.CreatePlane('aura2',{
    width:(isGiant?1.8:0.65)*scale,
    height:bladeH*1.12,
    sideOrientation:BABYLON.Mesh.DOUBLESIDE
  },scene);
  aura2.parent=root;
  aura2.rotation.x=Math.PI/2;
  aura2.rotation.y=Math.PI/2;
  aura2.position.z=bladeH*0.42;
  aura2.material=glowMat('vltk_aura_'+color,color,0.72,2.4,true);
  aura2.isPickable=false;

  return root;
}

// 2. Vụ nổ va chạm Kiếm Khí (Sword Impact Blast)
function explodeVltkSwordImpact(skill, tx, tz, isAoe, aoeRange, customColor){
  if(!scene)return;
  const ec=customColor||getElementColorByName(skill.element)||'#7ceaff';

  // Chớp sáng bùng nổ tức thì (Soft Point Light)
  if(!MOBILE_RUNTIME||skill.tierIdx>=1){
    try{
      const expLight=new BABYLON.PointLight('vltk_lt_'+Date.now(),new BABYLON.Vector3(tx,1.6,tz),scene);
      expLight.diffuse=BABYLON.Color3.FromHexString(ec);
      expLight.range=isAoe?(8+skill.tierIdx*2.0):(5.0+skill.tierIdx*1.0);
      expLight.intensity=isAoe?(3.2+skill.tierIdx*1.0):(2.0+skill.tierIdx*0.6);
      effects.push({light:expLight,t:0.25,max:0.25,isLightFade:true,baseIntensity:expLight.intensity});
    }catch(err){}
  }

  // Tia tàn kiếm khí phát quang văng tung tóe (Soft Energy Sparks)
  const pc=MOBILE_RUNTIME?(isAoe?14:8):(isAoe?24:12);
  burst(tx,tz,ec,pc,isAoe?2.4:1.2);
  burst(tx,tz,'#ffffff',Math.round(pc*0.35),isAoe?1.6:0.8);

  if(camera){
    const mag=skill.tierIdx===3?0.25:skill.tierIdx===2?0.15:0.08;
    const ox=camera.position.x,oz=camera.position.z;
    camera.position.x+=rnd(-mag,mag);camera.position.z+=rnd(-mag,mag);
    setTimeout(()=>{if(camera){camera.position.x=ox;camera.position.z=oz;}},80);
  }
}

// ============================================================================
// HỆ THỐNG PHÁT HOẠT HỌA VFX SPRITE SHEET ĐA KHUNG HÌNH (FLIPBOOK VLTK)
// ============================================================================

function createVltkSpriteSheetEffect(config){
  if(!scene)return null;
  const root=new BABYLON.TransformNode('vltk_root_'+Date.now(),scene);
  root.position.set(config.x,config.y!==undefined?config.y:1.35,config.z);
  if(config.isBillboard){
    root.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;
  }

  const plane=BABYLON.MeshBuilder.CreatePlane('vltk_vfx_'+Date.now(),{
    width:config.width||config.size||2.8,
    height:config.height||config.size||2.8,
    sideOrientation:BABYLON.Mesh.DOUBLESIDE
  },scene);
  plane.parent=root;
  plane.position.set(0,0,0);
  if(config.rotZ!==undefined) plane.rotation.z=config.rotZ;
  if(config.rotY!==undefined) plane.rotation.y=config.rotY;
  if(config.rotX!==undefined) plane.rotation.x=config.rotX;
  plane.isPickable=false;

  const matKey=`sheet_mat_${config.texturePath}_${Date.now()}`;
  const mat=new BABYLON.StandardMaterial(matKey,scene);
  const tex=new BABYLON.Texture(config.texturePath,scene,true,false);
  tex.uScale=1.0/config.cols;
  tex.vScale=1.0/config.rows;
  tex.uOffset=0;
  tex.vOffset=1.0 - 1.0/config.rows;
  mat.diffuseTexture=tex;
  mat.opacityTexture=tex;
  mat.emissiveTexture=tex;
  mat.disableLighting=true;
  mat.backFaceCulling=false;
  if(config.isAdditive!==false) mat.alphaMode=BABYLON.Engine.ALPHA_ADD;
  plane.material=mat;

  const eff={
    vltkSheet:root,
    plane:plane,
    tex:tex,
    mat:mat,
    cols:config.cols,
    rows:config.rows,
    totalFrames:config.totalFrames||(config.cols*config.rows),
    t:config.duration,
    max:config.duration,
    vx:config.vx||0,
    vz:config.vz||0,
    vy:config.vy||0,
    targetX:config.targetX,
    targetZ:config.targetZ,
    hasTrail:!!config.hasTrail,
    trailTimer:0,
    skill:config.skill,
    color:config.color||'#7ceaff',
    onStep:config.onStep||null,
    onImpact:config.onImpact||null,
    impactTime:config.impactTime!==undefined?config.impactTime:0,
    impactTriggered:false,
    onComplete:config.onComplete||null
  };
  effects.push(eff);
  return eff;
}

// 3. CHIÊU 1: THANH PHONG KIẾM THỨC (Tam Kiếm Xuất Khiếu - Dynamic 360° Tracking - 5x5 Sprite Sheet)
function launchVltkThanhPhongKiem(skill, tx, tz, target, dmgMult, effect){
  const ec='#7ceaff';
  
  // Pháp Trận Thái Cực tụ khí phong lôi dưới chân
  createDaoistGroundRune('bagua', player.x, player.z, 1.7, ec, '#ffffff', 1.4, 0.9);
  burst(player.x, player.z, '#a5f3fc', 10, 0.8);

  const baseHit = (dmgMult || skill.mult) / 2.4;
  let weights = [0.9, 1.0, 1.3]; // Đòn 3 (Chủ Kiếm) uy lực bộc phá mạnh nhất
  if(effect && effect.kind === 'bleed' && Array.isArray(effect.hitWeights)) weights = effect.hitWeights;

  // Đội hình Tam Kiếm: Tả Kiếm (trái), Hữu Kiếm (phải), Chủ Kiếm (trung tâm)
  const offsets = [
    { name: 'Tả Kiếm', side: -0.42, y: 1.30, size: 1.85, speed: 6.2 },
    { name: 'Hữu Kiếm', side: 0.42, y: 1.38, size: 1.85, speed: 6.2 },
    { name: 'Chủ Kiếm', side: 0.0,  y: 1.48, size: 2.10, speed: 6.8 }
  ];

  offsets.forEach((cfg, i) => {
    setTimeout(() => {
      if(!scene || !player) return;

      // Xác định vị trí mục tiêu thời gian thực (tracking động nếu quái di chuyển)
      const curTx = target && !target.dead ? target.x : tx;
      const curTz = target && !target.dead ? target.z : tz;

      const baseDx = curTx - player.x;
      const baseDz = curTz - player.z;
      const baseDist = Math.max(0.1, Math.hypot(baseDx, baseDz));
      const ndx = baseDx / baseDist, ndz = baseDz / baseDist;

      // Vector pháp tuyến vuông góc tạo độ lệch trái / phải theo góc nhìn
      const perpX = -ndz, perpZ = ndx;
      const startX = player.x + ndx * 0.55 + perpX * cfg.side;
      const startZ = player.z + ndz * 0.55 + perpZ * cfg.side;

      // Hướng bay từ điểm phóng tới mục tiêu
      const flyDx = curTx - startX;
      const flyDz = curTz - startZ;
      const flyDist = Math.max(0.1, Math.hypot(flyDx, flyDz));
      const nFlyDx = flyDx / flyDist;
      const nFlyDz = flyDz / flyDist;

      const travelTime = flyDist / cfg.speed;
      const screenAngle = Math.atan2(flyDz, flyDx);

      sfx('slash');

      let hitRegistered = false;
      const triggerHit = (hx, hz) => {
        if(hitRegistered) return;
        hitRegistered = true;
        const isFinal = (i === 2);
        explodeVltkSwordImpact(skill, hx, hz, false, isFinal ? 2.2 : 1.6, ec);

        // GÂY SÁT THƯƠNG VÀ NHẢY SỐ DAMAGE TỨC THÌ NGAY KHOẢNH KHẮC MŨI KIẾM CHẠM QUÁI
        if(target && !target.dead){
          skillAttack(target, skill, baseHit * (weights[i] || 1), false, { hit: i, isFinal: isFinal });
        }

        if(effect && effect.kind === 'pierce_secondary' && isFinal && target){
          const second = findWindPierceTarget(target, effect.maxDistance || 6, effect.coneDot || .55);
          if(second && !second.dead){
            skillAttack(second, skill, baseHit * (effect.secondaryRatio || .6), false, { hit: i, isSecondary: true, isFinal: true });
          }
        }
      };

      createVltkSpriteSheetEffect({
        texturePath: 'assets/vfx/skills/kiem/hoang_ha/vfx_sheet.png',
        cols: 5,
        rows: 5,
        totalFrames: 22,
        size: cfg.size,
        x: startX,
        y: cfg.y,
        z: startZ,
        isBillboard: true,
        rotZ: screenAngle, // Mũi kiếm hướng 100% chuẩn xác vào mục tiêu
        vx: nFlyDx * cfg.speed,
        vz: nFlyDz * cfg.speed,
        duration: travelTime,
        skill: skill,
        color: ec,
        hasTrail: true, // Vệt khí kiếm phong rực rỡ lướt theo sau
        onStep: (curX, curZ, eff) => {
          // Va chạm thời gian thực: khi mũi kiếm bay tới quái trong cự ly 1.2m lập tức trúng đích!
          if(!hitRegistered && target && !target.dead){
            const tdx = curX - target.x, tdz = curZ - target.z;
            if(tdx * tdx + tdz * tdz <= 1.44){ // 1.2m
              triggerHit(target.x, target.z);
            }
          }
        },
        onComplete: () => {
          triggerHit(curTx, curTz);
        }
      });
    }, i * 220); // Giãn cách 220ms nhịp nhàng
  });
}

// 4. CHIÊU 2: LƯU VÂN KIẾM KHÍ (Tam Hoàn Quy Nguyệt - Cung Kiếm Quét Hướng Mục Tiêu - 4x4 Sprite Sheet)
function launchVltkLuuVanKiem(skill, tx, tz, aoeRange, targets, dmgMult, effect){
  const ec='#a7f3dc';
  const dx=tx-player.x, dz=tz-player.z;
  const dist=Math.max(0.1,Math.hypot(dx,dz));
  const baseAngle=Math.atan2(dz, dx);
  const speed=5.6; // Tốc độ quét kiếm thư thái, lộng lẫy

  // Pháp Trận Thái Cực tụ khí gió
  createDaoistGroundRune('bagua', player.x, player.z, 2.2, ec, '#ffffff', 1.4, 0.8);

  // Quét 5 luồng kiếm khí hình quạt hoạt họa
  const spreadAngles=[-0.36, -0.18, 0, 0.18, 0.36];
  const hitEnemies=new Set();

  spreadAngles.forEach((offsetAngle,idx)=>{
    const angle=baseAngle+offsetAngle;
    const vx=Math.cos(angle)*speed;
    const vz=Math.sin(angle)*speed;
    const travelTime=(dist*1.25)/speed;
    const destX=tx+Math.cos(angle)*2.4;
    const destZ=tz+Math.sin(angle)*2.4;

    createVltkSpriteSheetEffect({
      texturePath:'assets/vfx/skills/kiem/hoang_trung/vfx_sheet.png',
      cols:4,
      rows:4,
      totalFrames:16,
      size:2.1,
      x:player.x+Math.cos(angle)*0.6,
      y:1.35,
      z:player.z+Math.sin(angle)*0.6,
      isBillboard:true,
      rotZ:angle, // Cung kiếm xoay đúng theo hướng bay
      vx:vx,
      vz:vz,
      duration:travelTime,
      skill:skill,
      color:ec,
      onStep:(curX, curZ, eff)=>{
        // Kiếm khí quét qua đâu, quái vật chạm phải LẬP TỨC mất máu & nhảy số damage tại đó
        const hitR2 = 2.0 * 2.0;
        for(let a of actors){
          if(!a||a.dead||isVillageSafe(a.x,a.z))continue;
          const adx=a.x-curX, adz=a.z-curZ;
          if(adx*adx+adz*adz<=hitR2 && !hitEnemies.has(a)){
            hitEnemies.add(a);
            explodeVltkSwordImpact(skill, a.x, a.z, false, 1.8, ec);
            skillAttack(a, skill, dmgMult||skill.mult, false, { isFinal: true });
          }
        }
      },
      onComplete:()=>{
        explodeVltkSwordImpact(skill,destX,destZ,true,2.5,ec);
      }
    });
  });
}

// 5. CHIÊU 3: TẬT ĐIỆN KIẾM THỨC (Thất Tinh Lôi Kiếm Trận - 6x6 Sprite Sheet Mưa Sét Cắm Đất)
function launchVltkTatDienKiem(skill, tx, tz, aoeRange, targets, dmgMult, effect){
  const ec='#9d8cff';
  const r=aoeRange||7.0;

  // Cổ Trận Thất Tinh Lôi Trận phát quang xoay tròn dưới mặt đất
  createDaoistGroundRune('seven_star', tx, tz, r*0.85, ec, '#ffffff', 2.8, 0.5);

  // 7 đạo thiên lôi kiếm giáng thế lần lượt, hoành tráng
  const count=7;
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      if(!scene)return;
      const angle=(i/count)*Math.PI*2;
      const radius=i===0?0:rnd(r*0.25,r*0.65);
      const strikeX=tx+Math.cos(angle)*radius;
      const strikeZ=tz+Math.sin(angle)*radius;

      createVltkSpriteSheetEffect({
        texturePath:'assets/vfx/skills/kiem/hoang_thuong/vfx_sheet.png',
        cols:6,
        rows:6,
        totalFrames:36,
        size:2.5,
        x:strikeX,
        y:1.6,
        z:strikeZ,
        isBillboard:true,
        duration:1.4, // Lưu ảnh sét trên đất
        impactTime:0.06, // Sét vừa chạm đất: gây sát thương và mất máu NGAY TỨC THÌ
        skill:skill,
        color:ec,
        onImpact:()=>{
          burst(strikeX,strikeZ,ec,14,1.2);
          sfx('thunder');
          // Gây sát thương và mất máu tức thì ngay khoảnh khắc sét cắm đất
          const hitR2=2.4*2.4;
          for(let a of actors){
            if(!a||a.dead||isVillageSafe(a.x,a.z))continue;
            const adx=a.x-strikeX,adz=a.z-strikeZ;
            if(adx*adx+adz*adz<=hitR2){
              skillAttack(a,skill,(dmgMult||skill.mult)/3.5,false,{hit:i,isFinal:i===count-1});
            }
          }
        }
      });
    },i*220); // Giãn cách 220ms giữa mỗi đạo lôi kiếm
  }
}

// 6. CHIÊU 4: HỒI PHONG KIẾM QUYẾT / VẠN KIẾM QUY TÔNG (Cự Kiếm Tru Tiên - 5x5 Sprite Sheet)
function launchVltkSupremeKiem(skill, tx, tz, aoeRange, targets, dmgMult, effect){
  const ec='#ffd700';
  const r=aoeRange||9.0;
  const isCrit=skill.forceCritAoE||Math.random()<(S.critChance||0);

  // 1. Tụ khí chân nhân
  createDaoistGroundRune('bagua', player.x, player.z, 2.6, '#ffd700', '#ffffff', 1.8, 0.9);
  burst(player.x,player.z,'#ffe57f',24,1.8);

  // 2. Đại Cổ Trận Bát Quái Tru Tiên (8m)
  createDaoistGroundRune('bagua', tx, tz, r*0.85, '#ffd700', '#ffffff', 3.2, 0.35);

  // 3. Cự Kiếm Hoàng Kim giáng thế hoạt họa 5x5 uy nghiêm
  createVltkSpriteSheetEffect({
    texturePath:'assets/vfx/skills/kiem/hoang_cuc/vfx_sheet.png',
    cols:5,
    rows:5,
    totalFrames:25,
    size:5.2,
    x:tx,
    y:2.2,
    z:tz,
    isBillboard:true,
    duration:1.95,
    impactTime:0.20, // Cự kiếm chạm đất gây sát thương bộc phá NGAY LẬP TỨC
    skill:skill,
    color:'#ffd700',
    onImpact:()=>{
      explodeVltkSwordImpact(skill,tx,tz,true,r,'#ffd700');
      burst(tx,tz,'#ffe57f',32,2.8);
      sfx('breakthrough');

      // Toàn bộ quái vật trong phạm vi LẬP TỨC mất máu và nổ số damage khủng
      const r2=r*r;
      for(let a of actors){
        if(!a||a.dead||isVillageSafe(a.x,a.z))continue;
        const adx=a.x-tx,adz=a.z-tz;
        if(adx*adx+adz*adz<=r2){
          skillAttack(a,skill,dmgMult||skill.mult,isCrit,{isFinal:true});
        }
      }
    }
  });
}

// Flipbook riêng cho 8 skill Hoàng/Hạ Phẩm ngoài hệ Kiếm.
// Mỗi sheet là 5x5 = 25 frame, thay cho quy ước sprite 3x3 cũ.
const ELEMENTAL_BASIC_FLIPBOOK = {
  dao_0_0: { color:'#ff776d', size:1.85, burst:8, radius:0.9 },
  hoa_0_0: { color:'#ff6b3d', size:1.65, burst:10, radius:0.8 },
  loi_0_0: { color:'#9d8cff', size:1.55, burst:8, radius:0.75 },
  thuy_0_0: { color:'#64cfff', size:1.55, burst:7, radius:0.75 },
  moc_0_0: { color:'#68df8b', size:1.55, burst:7, radius:0.8 },
  phong_0_0: { color:'#a7f3dc', size:1.45, burst:6, radius:0.7 },
  tho_0_0: { color:'#c9a56b', size:1.8, burst:9, radius:0.95 },
  kim_0_0: { color:'#ffd86b', size:1.45, burst:7, radius:0.7 }
};

function launchVltkElementalBasic(skill, tx, tz, target, dmgMult, effect){
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
}

// 7. ROUTER: Điều hướng toàn bộ chiêu thức VLTK
function launchSkillProjectile(skill, targetX, targetZ, isAoe, aoeRange, targetOrTargets, dmgMult, effect){
  if(!skill||!player)return;
  const id=skill.id||'';

  // Hệ Kiếm VLTK
  if(id==='kiem_0_0') return launchVltkThanhPhongKiem(skill,targetX,targetZ,targetOrTargets,dmgMult,effect);
  if(id==='kiem_0_1') return launchVltkLuuVanKiem(skill,targetX,targetZ,aoeRange,targetOrTargets,dmgMult,effect);
  if(id==='kiem_0_2') return launchVltkTatDienKiem(skill,targetX,targetZ,aoeRange,targetOrTargets,dmgMult,effect);
  if(id==='kiem_0_3') return launchVltkSupremeKiem(skill,targetX,targetZ,aoeRange,targetOrTargets,dmgMult,effect);

  // Fallback chung cho các hệ khác (Hỏa, Lôi, v.v.)
  if(id.startsWith('kiem_')){
    if(skill.aoe>0) return launchVltkLuuVanKiem(skill,targetX,targetZ,aoeRange,targetOrTargets,dmgMult,effect);
    return launchVltkThanhPhongKiem(skill,targetX,targetZ,targetOrTargets,dmgMult,effect);
  }

  if(ELEMENTAL_BASIC_FLIPBOOK[id]){
    return launchVltkElementalBasic(skill,targetX,targetZ,targetOrTargets,dmgMult,effect);
  }

  // Nếu là hệ Hỏa / hệ khác: dùng đạn đạo Hỏa Long VLTK chạm quái nổ sát thương tức thì
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
  });
}

function explodeSkillVfx(skill, tx, tz, isAoe, aoeRange){
  explodeVltkSwordImpact(skill, tx, tz, isAoe, aoeRange);
}

// Alias cho AoE (gọi launchSkillProjectile với flag isAoe=true)
function launchAoeProjectile(skill,targetX,targetZ,aoeRange){
  launchSkillProjectile(skill,targetX,targetZ,true,aoeRange);
}


function floatText(pos,text,color,isCrit=false){
  if(!scene||!camera||!engine||!pos)return;
  const offX=rnd(-0.35,0.35), offZ=rnd(-0.35,0.35);
  const posY=(pos.y!==undefined?pos.y:1.2)+rnd(0.7,1.1);
  const worldPos=new BABYLON.Vector3(pos.x+offX, posY, pos.z+offZ);
  const p=BABYLON.Vector3.Project(worldPos,BABYLON.Matrix.Identity(),scene.getTransformMatrix(),camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()));
  if(p.z<0||p.z>1)return; // Đằng sau camera
  const fl=$('#floatLayer');
  if(!fl)return;
  const e=document.createElement('div');
  const isCritical=isCrit||(typeof text==='string'&&(text.includes('Bạo')||text.includes('CRIT')));
  e.className='float'+(isCritical?' crit':'');
  e.textContent=text;
  if(color)e.style.color=color;
  e.style.left=Math.round(p.x)+'px';
  e.style.top=Math.round(p.y)+'px';
  fl.appendChild(e);
  setTimeout(()=>e.remove(),isCritical?1050:850);
}

function toast(t){
  let e=document.createElement('div');
  e.textContent=t;
  $('#lootToast').appendChild(e);
  setTimeout(()=>e.remove(),2200);
}

function updateActor(a,dt){
  if(a.dead)return;
  processActorSkillEffects(a);
  if(a.dead)return;
  if((a.stunT||0)>0){
    a.stunT=Math.max(0,(a.stunT||0)-dt);
    return;
  }

  // Khu an toàn tuyệt đối: actor nào lọt vào sẽ bị đẩy ra ngoài ngay.
  ejectEnemyFromVillage(a);

  let playerSafe=isVillageSafe(player.x,player.z);
  let moveMult=getActorMoveMultiplier(a);
  a.attackCd-=dt;
  a.bossSkillCd=(a.bossSkillCd||4.5)-dt;

  // Boss AoE Attack
  if(a===boss&&a.bossSkillCd<=0){
    a.bossSkillCd=6.0;
    ring(player.x,player.z,'#ff3322',5);
    toast('⚠ Boss phát động Xích Viêm Trận!');
    setTimeout(()=>{
      if(!a.dead&&!isVillageSafe(player.x,player.z)&&dist(player,{x:player.x,z:player.z})<4.5){
        if(player.invuln<=0){
          takePlayerDamage(a.atk*1.6,'Hỏa',a);
        }
      }
    },1100);
  }

  // TÌM MỤC TIÊU CHO QUÁI VẬT: Player hoặc Đệ Tử Đồng Môn (Allied NPC) gần nhất
  let targetType = null; // 'player' | 'npc'
  let targetObj = null;
  let minD2 = 24.0 * 24.0; // Tầm aggro quái vật 24m (Boss toàn màn hình)
  if(a === boss) minD2 = 45.0 * 45.0;

  // 1. Xét Player
  if(!playerSafe){
    const pdx = player.x - a.x, pdz = player.z - a.z;
    const pd2 = pdx * pdx + pdz * pdz;
    if(pd2 < minD2){
      minD2 = pd2;
      targetType = 'player';
      targetObj = player;
    }
  }

  // 2. Xét Đệ Tử Đồng Môn NPC 1 lân cận
  if(alliedNpcs && alliedNpcs.length > 0){
    for(let j = 0; j < alliedNpcs.length; j++){
      const ally = alliedNpcs[j];
      if(!ally || ally.dead || ally.exitingVillage || isVillageSafe(ally.x, ally.z)) continue;
      const adx = ally.x - a.x, adz = ally.z - a.z;
      const ad2 = adx * adx + adz * adz;
      if(ad2 < minD2){
        minD2 = ad2;
        targetType = 'npc';
        targetObj = ally;
      }
    }
  }

  // NẾU CÓ MỤC TIÊU (Player hoặc Allied NPC)
  if(targetObj){
    const tx = targetObj.x, tz = targetObj.z;
    const tdx = tx - a.x, tdz = tz - a.z;
    const td = Math.max(0.01, Math.hypot(tdx, tdz));

    if(td > 1.7){
      let oldX = a.x, oldZ = a.z;
      let nextX = a.x + (tdx / td) * a.speed * moveMult * dt;
      let nextZ = a.z + (tdz / td) * a.speed * moveMult * dt;

      if(!isVillageSafe(nextX, nextZ)){
        a.x = nextX;
        a.z = nextZ;
      }else{
        a.x = oldX;
        a.z = oldZ;
      }
    } else if(a.attackCd <= 0){
      a.attackCd = (1.15 + rnd(0, 0.35)) * getActorAttackIntervalMultiplier(a);
      if(targetType === 'player'){
        if(player.invuln <= 0){
          takePlayerDamage(a.atk, a.damageType || 'physical', a);
        }
      } else if(targetType === 'npc'){
        damageAlliedNpc(targetObj, a.atk, a.damageType || 'physical');
      }
    }

    // Cập nhật hướng quay mặt theo mục tiêu
    a._facingDx = tdx;
  } else {
    // KHÔNG CÓ MỤC TIÊU: Quái quay về lãnh địa gốc (homeX, homeZ)
    if(a.fixedSpawn){
      const hdx = a.homeX - a.x, hdz = a.homeZ - a.z;
      const hd = Math.hypot(hdx, hdz);
      if(hd > 0.35){
        const homeStep = Math.min(hd, a.speed * 0.65 * dt);
        a.x += (hdx / Math.max(0.001, hd)) * homeStep;
        a.z += (hdz / Math.max(0.001, hd)) * homeStep;
        a._facingDx = hdx;
      }
    }
  }

  a.frameT += dt;
  if(a.frameT > 0.11){
    a.frameT = 0;
    a.frame = (a.frame + 1) % 8;
    let facingDx = a._facingDx != null ? a._facingDx : (player.x - a.x);
    let frameIdx = facingDx < 0 ? (a.frame + 8) : a.frame;
    if(spriteMats[a.type + frameIdx]) a.mesh.material = spriteMats[a.type + frameIdx];
    else if(spriteMats[a.type + a.frame]) a.mesh.material = spriteMats[a.type + a.frame];
  }
  a.mesh.position.x = a.x;
  a.mesh.position.z = a.z;
  a.mesh.position.y = a.size * 0.48;
  if(a.shadow){
    a.shadow.position.x = a.x;
    a.shadow.position.z = a.z;
  }
  a.mesh.scaling.setAll(1);
}

function playerDeath(){
  S.hp=0;
  updateHUD();
  paused=true;
  toast('💀 Đạo thể tan vỡ… đang ngưng tụ linh hồn');
  setTimeout(()=>{
    S.hp=S.maxHp;
    S.mp=S.maxMp;
    player.x=0;
    player.z=0;
    if(player.mesh)player.mesh.position.set(0,1.62,0);
    if(player.shadow){
      player.shadow.position.x=0;
      player.shadow.position.z=0;
    }
    if(camera){
      placeStandardCamera(0,0);
    }
    if(petActor){
      petActor.x=-1.5; petActor.z=-1.5;
      if(petActor.mesh)petActor.mesh.position.set(-1.5,petActor.mesh.position.y,-1.5);
      if(petActor.shadow)petActor.shadow.position.set(-1.5,0.019,-1.5);
    }
    player.facing='right';
    player.state='idle';
    player.frame=0;
    player.animTimer=0;
    player.invuln=3.5;
    if(player.mesh){
      player.mesh.material=playerAnimMat('right','idle',0);
      applyPlayerFacing();
    }
    paused=false;
    toast('☯ Đã hồi sinh tại trung tâm Thanh Vân Thôn');
    updateHUD();
  },2200);
}

function updatePlayer(dt){
  player.invuln=Math.max(0,player.invuln-dt);
  let mx=joy.x+(keys['a']||keys['arrowleft']?-1:0)+(keys['d']||keys['arrowright']?1:0);
  let mz=joy.y+(keys['w']||keys['arrowup']?1:0)+(keys['s']||keys['arrowdown']?-1:0);
  let l=Math.hypot(mx,mz);

  if(mx>0.05){
    player.facing='right';
  }else if(mx<-0.05){
    player.facing='left';
  }

  if(l>.05){
    player.moveAngle=Math.atan2(mz,mx);
    let nx=mx/Math.max(1,l);
    let nz=mz/Math.max(1,l);
    let systemMove=window.TuTienSystems?window.TuTienSystems.getMoveMultiplier(S):1;
    let sp=Math.max(2.5,(S.moveSpeed||6.2)*getHeartMethodEffects().move*systemMove);
    let nextX=clamp(player.x+nx*sp*dt,-MAP_BOUND,MAP_BOUND);
    let nextZ=clamp(player.z+nz*sp*dt,-MAP_BOUND,MAP_BOUND);
    let wallMove=resolveVillageWallMove(player.x,player.z,nextX,nextZ);
    player.x=wallMove.x;
    player.z=wallMove.z;
  }

  // Animation State Priority: Attack cannot be interrupted by run or idle
  if(player.state==='attack'){
    let anim=PLAYER_ANIMS.attack;
    player.animTimer+=dt;
    let step=1.0/(anim.fps*Math.max(0.35,(S.attackSpeed||1)*getHeartMethodEffects().attack));
    if(player.animTimer>=step){
      player.animTimer-=step;
      player.frame++;
      if(player.frame>=anim.frames){
        player.state=l>.05?'run':'idle';
        player.frame=0;
        player.animTimer=0;
      }
    }
  }else{
    let nextState=l>.05?'run':'idle';
    if(player.state!==nextState){
      player.state=nextState;
      player.frame=0;
      player.animTimer=0;
    }else{
      let anim=PLAYER_ANIMS[player.state];
      player.animTimer+=dt;
      let step=1.0/anim.fps;
      if(player.animTimer>=step){
        player.animTimer-=step;
        player.frame=(player.frame+1)%anim.frames;
      }
    }
  }

  player.mesh.position.set(player.x,1.62,player.z);
  if(player.shadow){
    player.shadow.position.x=player.x;
    player.shadow.position.z=player.z;
  }
  player.mesh.material=playerAnimMat(player.facing,player.state,player.frame);
  applyPlayerFacing(); // RIGHT = +X, LEFT = mirrored -X

  // Camera lock — mobile anti-jitter.
  // Bám trực tiếp vị trí player mỗi frame, không có inertia/lerp nên khi thả joystick
  // tuyệt đối không còn 1-2 frame "đuổi theo" làm map xê dịch.
  const elev=CAMERA_STD.elevationDeg*Math.PI/180;
  const horizontal=Math.cos(elev)*CAMERA_STD.distance;
  const height=Math.sin(elev)*CAMERA_STD.distance;
  camera.position.x=player.x;
  camera.position.y=height;
  camera.position.z=player.z-horizontal;
  camera.setTarget(new BABYLON.Vector3(player.x,0,player.z));

  // Kiểm tra khu vực Thanh Vân Thôn: Tự động bước vào toàn cảnh thôn khi tiến vào vùng hào quang trận pháp
  if(villageExitCd > 0) villageExitCd -= dt;

  let curReg = (typeof regions !== 'undefined' && regions.length) ? (regions[S.region || 0] || regions[0]) : null;
  let isVillageMap = curReg && (curReg.id === 'thanh_van_thon' || curReg.id === (typeof DEFAULT_MAP_ID !== 'undefined' ? DEFAULT_MAP_ID : 'thanh_van_thon'));
  let distToVillage = Math.hypot(player.x - (-1.0), player.z - (-10.8));

  if(!inVillageTown && villageExitCd <= 0 && isVillageMap && distToVillage <= 12.5){
    enterVillageTown();
  }

  // Update Companion Pet
  if(petActor&&petActor.mesh){
    let petOffsetX = player.facing==='left' ? 1.2 : -1.2;
    petActor.x+=(player.x+petOffsetX-petActor.x)*dt*3.5;
    petActor.z+=(player.z-1.0-petActor.z)*dt*3.5;
    petActor.mesh.position.set(petActor.x,1.0,petActor.z);
    if(petActor.shadow){
      petActor.shadow.position.x=petActor.x;
      petActor.shadow.position.z=petActor.z;
    }
    petActor.mesh.scaling.x=Math.abs(petActor.mesh.scaling.x)*(player.facing==='left'?-1:1);
    petActor.frameT+=dt;
    if(petActor.frameT>.12){
      petActor.frameT=0;
      petActor.frame=(petActor.frame+1)%8;
      if(spriteMats['fox'+petActor.frame])petActor.mesh.material=spriteMats['fox'+petActor.frame];
    }
    petActor.shootCd-=dt;
    if(petActor.shootCd<=0){
      petActor.shootCd=2.0;
      let target=nearest(8);
      if(target){
        slash(target.x,target.z,'#ff9944');
        damage(target,getPlayerDamageStat('physical')*0.45,false,'physical');
      }
    }
  }
}

function updateEffects(dt){
  for(let e of effects){
    e.t-=dt;

    // --- Dynamic Light fade-out cho vụ nổ ---
    if(e.isLightFade&&e.light){
      e.light.intensity=e.baseIntensity*Math.max(0,e.t/(e.max||0.32));
      if(e.t<=0) e.light.dispose();
      continue;
    }

    // --- Ground Scorch Decal fade-out ---
    if(e.groundFade&&e.mesh){
      const p=clamp(e.t/(e.max||1.2),0,1);
      e.mesh.visibility=p*0.75;
      if(e.t<=0) e.mesh.dispose();
      continue;
    }

    // --- Ground Daoist Formation Runes (Pháp Trận Bát Quái / Thất Tinh xoay & mờ dần) ---
    if(e.groundRune){
      if(e.rotSpeed) e.groundRune.rotation.y += e.rotSpeed * dt;
      if(e.mat){
        const p = clamp(e.t / (e.max || 1.5), 0, 1);
        const fadeP = p < 0.25 ? (p / 0.25) : (p > 0.85 ? (1.0 - (p - 0.85)/0.15) : 1.0);
        e.mat.alpha = (e.baseAlpha || 0.92) * fadeP;
      }
      if(e.t <= 0){
        try{ e.groundRune.dispose(); }catch(err){}
      }
      continue;
    }

    // --- VLTK Sprite Sheet Flipbook Animation (Khung hình hoạt họa 4x4, 5x5, 6x6) ---
    if(e.vltkSheet){
      const p = clamp(1.0 - (e.t / (e.max || 0.5)), 0, 0.999);
      const frame = Math.floor(p * e.totalFrames);
      const col = frame % e.cols;
      const row = Math.floor(frame / e.cols);
      e.tex.uOffset = col / e.cols;
      e.tex.vOffset = 1.0 - (row + 1) / e.rows;

      if(e.vx || e.vz || e.vy){
        e.vltkSheet.position.x += (e.vx || 0) * dt;
        e.vltkSheet.position.y += (e.vy || 0) * dt;
        e.vltkSheet.position.z += (e.vz || 0) * dt;

        if(e.hasTrail){
          e.trailTimer = (e.trailTimer || 0) - dt;
          if(e.trailTimer <= 0){
            e.trailTimer = 0.06;
            burst(e.vltkSheet.position.x, e.vltkSheet.position.z, e.color || '#7ceaff', 2, 0.35);
          }
        }
      }

      // Xử lý va chạm quét thời gian thực (trên từng frame bay)
      if(e.onStep){
        e.onStep(e.vltkSheet.position.x, e.vltkSheet.position.z, e, dt);
      }

      // Kích hoạt sát thương tức thì khi tiếp đất / va chạm (ngay impactTime)
      if(e.onImpact && !e.impactTriggered){
        const elapsed = (e.max || 0.5) - e.t;
        if(elapsed >= (e.impactTime || 0)){
          e.impactTriggered = true;
          e.onImpact(e.vltkSheet.position.x, e.vltkSheet.position.z, e);
        }
      }

      if(e.t <= 0){
        if(e.onImpact && !e.impactTriggered){
          e.impactTriggered = true;
          e.onImpact(e.vltkSheet.position.x, e.vltkSheet.position.z, e);
        }
        if(e.onComplete) e.onComplete();
        try{ if(e.plane) e.plane.dispose(); }catch(err){}
        try{ e.vltkSheet.dispose(); }catch(err){}
        try{ e.mat.dispose(); }catch(err){}
        try{ e.tex.dispose(); }catch(err){}
      }
      continue;
    }

    // --- VLTK 1: Phi Kiếm 3D bay ngang / Phi kiếm hình quạt ---
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
    }

    // --- VLTK 2: Mưa Kiếm từ trời rơi xuống (Sky Sword Rain & Ground Sticking) ---
    if(e.vltkSkySword){
      if(!e.sticking){
        // Đang rơi từ trên trời xuống
        e.vltkSkySword.position.y+=e.vy*dt;
        if(e.vltkSkySword.position.y<=0.1){
          // Cắm vào mặt đất!
          e.sticking=true;
          e.vltkSkySword.position.y=0.0;
          e.t=e.stickDuration||1.4;
          e.max=e.t;

          // Sấm chớp nổ tại điểm cắm kiếm
          ring(e.strikeX,e.strikeZ,e.color||'#9d8cff',1.8);
          ring(e.strikeX,e.strikeZ,'#ffffff',0.9);
          burst(e.strikeX,e.strikeZ,e.color||'#9d8cff',12,1.2);
          slash(e.strikeX,e.strikeZ,e.color||'#9d8cff');
        }
      }else{
        // Kiếm đang cắm trên mặt đất phát quang và mờ dần
        const p=clamp(e.t/(e.max||1.4),0,1);
        if(e.t<=0){
          burst(e.strikeX,e.strikeZ,e.color||'#9d8cff',6,0.6); // Tan biến thành luồng sáng
          try{ e.vltkSkySword.dispose(); }catch(err){}
        }
      }
      continue;
    }

    // --- VLTK 3: Cự Kiếm Thiên Phạt Hoàng Kim (Colossal Divine Sword Heaven Strike) ---
    if(e.vltkGiantSword){
      if(!e.sticking){
        // Rơi từ hư không xuống
        e.vltkGiantSword.position.y+=e.vy*dt;
        
        // Xoay 8 phi kiếm hộ thể xung quanh
        if(e.orbitSwords){
          const orbitR=2.4;
          const orbitSpeed=performance.now()*0.008;
          e.orbitSwords.forEach((oSword,idx)=>{
            const a=orbitSpeed+(idx/8)*Math.PI*2;
            oSword.position.set(
              e.vltkGiantSword.position.x+Math.cos(a)*orbitR,
              e.vltkGiantSword.position.y+Math.sin(a*2)*0.5,
              e.vltkGiantSword.position.z+Math.sin(a)*orbitR
            );
            oSword.rotation.y=a+Math.PI/2;
          });
        }

        if(e.vltkGiantSword.position.y<=0.15){
          // Cự Kiếm cắm thẳng vào tâm đất!
          e.sticking=true;
          e.vltkGiantSword.position.y=0.0;
          e.t=e.stickDuration||2.0;
          e.max=e.t;

          // Vụ nổ chấn thiên động địa
          explodeVltkSwordImpact(e.skill,e.strikeX,e.strikeZ,true,10.0,'#ffd700');
          ring(e.strikeX,e.strikeZ,'#ffd700',9.0);
          ring(e.strikeX,e.strikeZ,'#7ceaff',6.0);
          ring(e.strikeX,e.strikeZ,'#ffffff',3.5);
          burst(e.strikeX,e.strikeZ,'#ffe57f',40,3.5);

          // 8 kiếm hộ thể cắm xung quanh theo hình Bát Quái
          if(e.orbitSwords){
            const ringR=3.6;
            e.orbitSwords.forEach((oSword,idx)=>{
              const a=(idx/8)*Math.PI*2;
              oSword.position.set(e.strikeX+Math.cos(a)*ringR,0.0,e.strikeZ+Math.sin(a)*ringR);
              oSword.rotation.x=-Math.PI*0.42;
              oSword.rotation.y=a+Math.PI;
              ring(oSword.position.x,oSword.position.z,'#7ceaff',1.2);
            });
          }
        }
      }else{
        // Cự kiếm cắm uy nghiêm giữa trận địa
        if(Math.random()<0.3){
          ring(e.strikeX,e.strikeZ,'#ffd700',rnd(2.0,5.0)); // Sóng năng lượng vàng tỏa ra theo chu kỳ
        }
        if(e.t<=0){
          burst(e.strikeX,e.strikeZ,'#ffd700',25,2.0);
          try{ e.vltkGiantSword.dispose(); }catch(err){}
          if(e.orbitSwords){
            e.orbitSwords.forEach(s=>{try{s.dispose();}catch(err){}});
          }
        }
      }
      continue;
    }

    // --- Trail plane fade out ---
    if(e.trailFade&&e.mesh){
      const p=clamp(e.t/(e.max||0.18),0,1);
      e.mesh.visibility=p;
      e.mesh.scaling.setAll(p*0.5);
      if(e.t<=0) e.mesh.dispose();
      continue;
    }

    // --- Center explosion / Skill VFX bloom animation ---
    if(e.skillVfx&&e.mesh){
      const p=1-clamp(e.t/e.max,0,1);
      const scaleEase=p<0.25?(0.25+0.75*(p/0.25)):(1.0+0.35*Math.sin((p-0.25)/0.75*Math.PI*0.5));
      e.mesh.scaling.setAll((e.baseScale||1)*scaleEase);
      e.mesh.visibility=p<0.60?1.0:clamp(1.0-(p-0.60)/0.40,0,1);
    }
    if(e.vx!=null){
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
    }
  }
  // Compact in place
  let write=0;
  for(let read=0;read<effects.length;read++){
    const e=effects[read];
    if(e&&e.t>0)effects[write++]=e;
  }
  effects.length=write;
}

// --- Auto combat state ---
let _autoSkillSlot=1;         // slot đang xét (1-4)
let _autoNextSkillAt=0;       // thời gian (ms) được phép bắn skill tiếp

function autoCombat(dt){
  if(!S.auto)return;
  const now=performance.now();

  // Chờ đến lượt bắn tiếp theo (sau khi projectile của skill trước bay xong)
  if(now<_autoNextSkillAt)return;

  // Tìm slot tiếp theo có thể dùng (xoay vòng 1→2→3→4→1)
  let tried=0;
  while(tried<4){
    const slot=_autoSkillSlot;
    const skillId=(S.equippedSkills&&S.equippedSkills[slot-1])||null;

    // Tăng slot cho lần sau (luôn tăng dù có dùng hay không để xoay vòng)
    _autoSkillSlot=(_autoSkillSlot%4)+1;
    tried++;

    if(!skillId)continue;
    const sk=getSkillDef(skillId);
    if(!sk)continue;
    if(S.mp<sk.mp)continue;      // không đủ MP → bỏ, thử slot tiếp
    if(cooldown[slot]>0)continue; // đang cooldown → bỏ, thử slot tiếp

    // Kiểm tra có target không
    const hasTarget=sk.aoe===0
      ?!!nearest(sk.targetRange||11)
      :(countEnemiesInRange(sk.aoe,1)>=1||(boss&&dist(boss,player)<sk.aoe));
    if(!hasTarget)continue;

    // Bắn skill
    useSkill(slot);

    // Tính thời gian bay projectile (sync với speed mới chậm hơn)
    let travelDelay=0;
    if(sk.aoe===0){
      const tgt=nearest(sk.targetRange||11);
      if(tgt){
        const d=Math.hypot(tgt.x-player.x,tgt.z-player.z);
        const spd=6+sk.tierIdx*1.5; // sync với launchSkillProjectile
        travelDelay=(d/spd)*1000; // ms
      }
    }else{
      // AoE: tính khoảng cách đến centroid enemy
      const targets=actors.filter(a=>!a.dead&&!isVillageSafe(a.x,a.z)&&Math.hypot(a.x-player.x,a.z-player.z)<sk.aoe);
      if(targets.length>0){
        let cx=0,cz=0;targets.forEach(a=>{cx+=a.x;cz+=a.z;});
        const d=Math.hypot(cx/targets.length-player.x,cz/targets.length-player.z);
        const spd=5+sk.tierIdx*1.5; // sync với launchAoeProjectile
        travelDelay=(d/spd)*1000;
      }
    }

    // Delay = thời gian bay + 1000ms (khoảng nghỉ thư thái giữa các đòn đánh)
    _autoNextSkillAt=now+travelDelay+1000;
    return; // đã bắn 1 skill, chờ đến lượt tiếp
  }

  // Không có skill nào dùng được → thử lại sau 400ms
  _autoNextSkillAt=now+400;
}


function tick(){
  let now=performance.now();
  const targetFps=window.PerformanceProfile?window.PerformanceProfile.current.targetFps:60;
  if(now-last<(1000/targetFps)*.92)return;
  let dt=Math.min(.05,(now-last)/1000);
  last=now;
  const profile=window.PerformanceProfile?window.PerformanceProfile.sample(dt):null;
  if(window.GameScheduler)window.GameScheduler.update(now);
  if(gameStarted&&!paused){
    updatePlayer(dt);
    for(let i=0;i<actors.length;i++){
      const a=actors[i];if(!a||a.dead)continue;
      const dx=a.x-player.x,dz=a.z-player.z,d2=dx*dx+dz*dz;
      if(d2>22500&&a!==boss)continue;
      const hz=!profile?60:(d2<=900?profile.enemyNearHz:d2<=6400?profile.enemyMidHz:profile.enemyFarHz);
      a._updateAcc=(a._updateAcc||0)+dt;
      if(a._updateAcc>=1/hz){const actorDt=Math.min(.25,a._updateAcc);a._updateAcc=0;updateActor(a,actorDt);}
      if(a.mesh)a.mesh.setEnabled(d2<28900||a===boss);
      const shadowDistance=profile?profile.shadowDistance:55;
      if(a.shadow)a.shadow.setEnabled((d2<shadowDistance*shadowDistance)||a===boss);
    }
    updateEffects(dt);
    updateAlliedNpcs(dt);
    if(villageFormationMesh && !villageFormationMesh.isDisposed()){
      villageFormationMesh.rotation.z += dt * 0.024;
      if(villageFormationMesh.material){
        villageFormationMesh.material.alpha = 0.80 + Math.sin(now * 0.0022) * 0.12;
      }
    }
    if(villageDomeMesh && !villageDomeMesh.isDisposed()){
      villageDomeMesh.rotation.y += dt * 0.018;
      if(villageDomeMesh.material){
        villageDomeMesh.material.alpha = 0.46 + Math.sin(now * 0.0018) * 0.08;
        if(villageDomeMesh.material.emissiveTexture){
          villageDomeMesh.material.emissiveTexture.uOffset += dt * 0.012;
        }
      }
    }
    for(let i=1;i<=4;i++)cooldown[i]=Math.max(0,cooldown[i]-dt);
    dashCd.t=Math.max(0,dashCd.t-dt);
    autoCombat(dt);
    if(window.TuTienSystems)window.TuTienSystems.update(S,dt,getSystemContext());

    // Passive HP/MP Regen
    regenTimer-=dt;
    if(regenTimer<=0){
      regenTimer=1.2;
      const heartFx=getHeartMethodEffects();
      S.hp=Math.min(S.maxHp,S.hp+(S.maxHp*Math.max(0,S.hpRegenPct||0)+2)*heartFx.regen);
      S.mp=Math.min(S.maxMp,S.mp+(S.maxMp*Math.max(0,S.mpRegenPct||0)+3)*heartFx.regen);
      updateHUD();
    }

    spawnTimer-=dt;
    if(spawnTimer<=0){
      spawnTimer=2.2;
      spawnBoss();
    }
    miniTimer-=dt;
    if(miniTimer<=0){
      miniTimer=.25;
      drawMini();
      updateHUD();
    }
    cooldownUiTimer-=dt;
    if(cooldownUiTimer<=0){
      cooldownUiTimer=0.05;
      updateCooldownUI();
    }
  }
  scene.render();
}

function updateCooldownUI(){
  for(let i=1;i<=4;i++){
    let e=$('#cd'+i);
    if(e)e.textContent=cooldown[i]>0?cooldown[i].toFixed(cooldown[i]<1?1:0):'';
  }
  let d=$('#cdDash');
  if(d)d.textContent=dashCd.t>0?dashCd.t.toFixed(dashCd.t<1?1:0):'';
}

function updateHUD(){
  S.hp=clamp(S.hp,0,S.maxHp);
  S.mp=clamp(S.mp,0,S.maxMp);
  $('#pname').textContent=S.name;
  $('#realm').textContent=realmName()+' · '+region().name;
  $('#level').textContent=S.level;
  $('#hpFill').style.width=(S.hp/S.maxHp*100)+'%';
  $('#hpText').textContent=`${Math.round(S.hp)}/${S.maxHp}`;
  $('#mpFill').style.width=(S.mp/S.maxMp*100)+'%';
  $('#xpFill').style.width=(S.xp/S.xpNeed*100)+'%';
  let elGold=$('#gold'); if(elGold) elGold.textContent=Math.floor(S.gold).toLocaleString();
  let elStones=$('#stones'); if(elStones) elStones.textContent=S.stones.toLocaleString();
  let petMult=S.pet?1.08:1.0;
  let defScore=COMBAT_DAMAGE_TYPES.reduce((v,t)=>v+Math.max(0,(S.defense&&S.defense[t])||0),0);
  let heartPower=getHeartMethodEffects().defense;
  let elPower=$('#power'); if(elPower) elPower.textContent=Math.round((S.maxHp*1.2+S.maxMp*.8+S.spiritSense*4+getTotalDamage()*45+defScore*18)*getRealmPowerMultiplier()*petMult*heartPower).toLocaleString();
  if($('#questText')) $('#questText').innerHTML=`[Chính] Diệt Yêu Thú <span>${Math.min(20,S.questKills)}/20</span>`;
  if($('#autoBtn')) $('#autoBtn').classList.toggle('on',S.auto);
  if($('#miniName')) $('#miniName').textContent=region().name;

  // Cập nhật các nút kỹ năng chiến đấu (HUD) - 4 ô xếp ngang tương ứng 4 nút điều hướng bên dưới
  for(let i=1;i<=4;i++){
    let btn=document.querySelector(`.skill[data-skill="${i}"]`);
    if(btn){
      let skillId=(S.equippedSkills&&S.equippedSkills[i-1])||null;
      let sk=skillId?getSkillDef(skillId):null;
      let img=btn.querySelector('img.skill-icon-img');
      let cdSpan=btn.querySelector('span[id^="cd"]');
      if(!cdSpan){
        btn.innerHTML+=`<span id="cd${i}"></span>`;
      }
      if(sk){
        if(!img){
          btn.innerHTML=`<img src="${sk.icon}" class="skill-icon-img" alt="${sk.name}" onerror="this.style.display='none'"><span id="cd${i}"></span>`;
        }else if(img.getAttribute('src')!==sk.icon){
          img.src=sk.icon;
          img.style.display='block';
        }
      }else{
        let emptyLabel = i === 4 ? 'Tuyệt' : `${i}`;
        let numSpan = btn.querySelector('.emptySkillSlotNum');
        if(!numSpan || img){
          btn.innerHTML=`<span class="emptySkillSlotNum">${emptyLabel}</span><span id="cd${i}"></span>`;
        }
      }
      btn.title=sk?`[${sk.tierName} · ${sk.rankName}] ${sk.name} (${sk.mp} MP) - Phím ${i}`:`Ô ${i} [Chưa trang bị] - Phím ${i}`;
      btn.style.opacity=(sk&&S.mp<sk.mp)?'0.45':'1';
    }
  }
}

function drawMini(){
  if(!player)return;
  let c=$('#mini');
  if(!c)return;
  let x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);

  let cx=c.width/2, cy=c.height/2;
  let rx=c.width*0.44, ry=c.height*0.44;

  // Nền Radar Tiên Giới
  let bgGrad=x.createRadialGradient(cx,cy,5,cx,cy,rx);
  bgGrad.addColorStop(0,'#273934');
  bgGrad.addColorStop(0.85,'#182622');
  bgGrad.addColorStop(1,'#101b18');
  x.fillStyle=bgGrad;
  x.beginPath();
  x.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
  x.fill();

  // Vòng quét Radar
  x.strokeStyle='rgba(117, 233, 255, 0.18)';
  x.lineWidth=1;
  x.beginPath();
  x.ellipse(cx,cy,rx*0.5,ry*0.5,0,0,Math.PI*2);
  x.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
  x.stroke();

  // Quái vật & Boss
  for(let a of actors){
    if(a.dead)continue;
    let dx=a.x-player.x, dz=a.z-player.z;
    let d=Math.hypot(dx,dz);
    if(d<=RADAR_RANGE){
      let projected=window.MinimapSystem?window.MinimapSystem.project(dx,dz,RADAR_RANGE,cx,cy,rx,ry):{x:cx+(dx/RADAR_RANGE)*rx,y:cy-(dz/RADAR_RANGE)*ry};
      let px=projected.x,py=projected.y;
      if(a===boss){
        x.fillStyle='#ffd700';
        x.shadowColor='#ffd700';
        x.shadowBlur=8;
        x.beginPath();
        x.arc(px,py,4.5,0,Math.PI*2);
        x.fill();
        x.shadowBlur=0;
      }else{
        x.fillStyle='#e53e3e';
        x.beginPath();
        x.arc(px,py,2.2,0,Math.PI*2);
        x.fill();
      }
    }else if(a===boss){
      // Con trỏ hướng Boss khi ở xa
      let angle=Math.atan2(-dz,dx);
      let edgeX=cx+Math.cos(angle)*(rx-4);
      let edgeY=cy+Math.sin(angle)*(ry-4);
      x.fillStyle='#ff9800';
      x.beginPath();
      x.arc(edgeX,edgeY,3.5,0,Math.PI*2);
      x.fill();
    }
  }

  // Mũi tên tam giác đầu nhọn thể hiện hướng nhân vật đang di chuyển / đối mặt
  let moveAngle=player.moveAngle!=null?player.moveAngle:(player.facing==='left'?Math.PI:0);
  let rot=-moveAngle; // Trục Y Canvas hướng xuống

  x.save();
  x.translate(cx,cy);
  x.rotate(rot);

  // Hiệu ứng phát sáng Tiên Hiệp rực rỡ
  x.shadowColor='#00f7ff';
  x.shadowBlur=10;

  // Vẽ hình tam giác đầu nhọn kiểu phi kiếm / mũi tên tiên tiễn
  x.beginPath();
  x.moveTo(11, 0);       // Đầu nhọn phía trước
  x.lineTo(-7, -6);      // Cánh trái tam giác
  x.lineTo(-3.5, 0);     // Đáy hõm vào giữa tạo thế sắc sảo
  x.lineTo(-7, 6);       // Cánh phải tam giác
  x.closePath();

  // Gradient thân mũi tên từ trắng sáng sang xanh ngọc tiên giới
  let arrowGrad=x.createLinearGradient(11,0,-7,0);
  arrowGrad.addColorStop(0,'#ffffff');
  arrowGrad.addColorStop(0.35,'#38bdf8');
  arrowGrad.addColorStop(1,'#0284c7');
  x.fillStyle=arrowGrad;
  x.fill();

  // Viền sắc nét cho mũi tên
  x.lineWidth=1.2;
  x.strokeStyle='#e0f2fe';
  x.stroke();

  // Điểm ngọc năng lượng ở tâm
  x.beginPath();
  x.arc(0,0,2.2,0,Math.PI*2);
  x.fillStyle='#ffffff';
  x.fill();

  x.restore();

  // Tọa độ người chơi & Kích thước bản đồ
  x.fillStyle='rgba(255,255,255,0.75)';
  x.font='9px sans-serif';
  x.textAlign='center';
  x.fillText(`X:${Math.round(player.x)} Z:${Math.round(player.z)} (1000m)`,cx,c.height-3);
}

let inVillageTown = false;
let villageExitCd = 0;

function enterVillageTown(){
  if(inVillageTown) return;
  inVillageTown = true;
  paused = true;
  joy.active = false;
  joy.x = 0;
  joy.y = 0;
  let joyElem = $('#joy');
  if(joyElem) joyElem.style.display = 'none';

  let townScreen = $('#villageTownScreen');
  if(townScreen){
    townScreen.style.display = 'block';
  }
  let vPrompt = $('#villageEnterPrompt');
  if(vPrompt) vPrompt.style.display = 'none';

  toast('🏰 Đã tiến vào Thanh Vân Thôn! Đại trận bảo hộ an toàn.');
  sfx('breakthrough');
}

function leaveVillageTown(){
  inVillageTown = false;
  villageExitCd = 3.5; // 3.5s cooldown
  paused = false;

  let townScreen = $('#villageTownScreen');
  if(townScreen) townScreen.style.display = 'none';
  closePanel();

  // Đưa player ra vị trí cách cổng thôn một khoảng nhỏ (cổng Nam: z = -23.2)
  player.x = -1.0;
  player.z = -23.2;
  player.facing = 'down';
  if(player.mesh) player.mesh.position.set(player.x, 1.62, player.z);
  if(player.shadow) player.shadow.position.set(player.x, 0.02, player.z);

  // Update camera
  const elev=CAMERA_STD.elevationDeg*Math.PI/180;
  const horizontal=Math.cos(elev)*CAMERA_STD.distance;
  const height=Math.sin(elev)*CAMERA_STD.distance;
  camera.position.x=player.x;
  camera.position.y=height;
  camera.position.z=player.z-horizontal;
  camera.setTarget(new BABYLON.Vector3(player.x,0,player.z));

  toast('🚪 Đã rời Thanh Vân Thôn! Cẩn thận yêu thú ngoại vi.');
  sfx('dash');
}

function setupInput(){
  window.addEventListener('keydown',e=>{
    let k=e.key.toLowerCase();
    keys[k]=true;
    if(['1','2','3','4'].includes(k))useSkill(+k);
    if(k===' '||k==='spacebar'){e.preventDefault();useDash();}
    if(k==='q'){$('#autoBtn').click();}
  });
  window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

  // ===== DYNAMIC FLOATING VIRTUAL JOYSTICK =====
  let j=$('#joy'), k=$('#joyKnob');
  let joyStartX=0, joyStartY=0;
  const JOY_MAX_DIST=46;
  const JOY_DEADZONE=0.12;

  function handleJoyMove(clientX, clientY){
    if(!joy.active) return;
    let dx = clientX - joyStartX;
    let dy = clientY - joyStartY;
    let m = Math.hypot(dx, dy);
    if(m > JOY_MAX_DIST){
      dx = (dx / m) * JOY_MAX_DIST;
      dy = (dy / m) * JOY_MAX_DIST;
    }

    let nx = dx / JOY_MAX_DIST;
    let ny = -dy / JOY_MAX_DIST; // Screen Y is downwards, in Babylon Z+ is north
    let nm = Math.hypot(nx, ny);

    if(nm < JOY_DEADZONE){
      joy.x = 0;
      joy.y = 0;
      if(k) k.style.transform = 'translate(0px, 0px)';
    } else {
      let scaled = (nm - JOY_DEADZONE) / (1 - JOY_DEADZONE);
      joy.x = (nx / nm) * scaled;
      joy.y = (ny / nm) * scaled;
      if(k) k.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }

  function handleJoyStart(e){
    if(joy.active) return;
    if(e.target && e.target.closest('#hudSkillClusterWrap, #hudBottomNavWrap, #hudSkillCluster, #hudBottomNav, .hudRowToggleBtn, #hudTopRight, #hudProfile, #panel, .panel, .villagePrompt, #villageTownScreen, .townPin, .townTopBar, .townBottomBar, button, input, select, textarea, canvas#mini, [data-panel], [data-hub], [data-skill]')){
      return;
    }
    if(e.pointerType === 'mouse' && e.button !== 0) return;

    joy.active = true;
    joy.pid = e.pointerId;
    joyStartX = e.clientX;
    joyStartY = e.clientY;

    if(j){
      j.style.left = `${joyStartX}px`;
      j.style.top = `${joyStartY}px`;
      j.style.display = 'block';
    }
    if(k) k.style.transform = 'translate(0px, 0px)';
    handleJoyMove(e.clientX, e.clientY);
  }

  function handleJoyEnd(e){
    if(!joy.active || (e && e.pointerId !== joy.pid)) return;
    joy.active = false;
    joy.pid = null;
    joy.x = 0;
    joy.y = 0;
    if(j) j.style.display = 'none';
    if(k) k.style.transform = '';
  }

  window.addEventListener('pointerdown', handleJoyStart, { passive: true });
  window.addEventListener('pointermove', e => {
    if(joy.active && e.pointerId === joy.pid){
      handleJoyMove(e.clientX, e.clientY);
    }
  }, { passive: true });
  window.addEventListener('pointerup', handleJoyEnd, { passive: true });
  window.addEventListener('pointercancel', handleJoyEnd, { passive: true });

  // ===== UNIFIED GLOBAL EVENT DELEGATION (HUD & THANH VÂN THÔN HOTSPOTS) =====
  document.addEventListener('click', (e) => {
    // 1. Data panel clicks (Character, Inventory, Skills, Equipment, Settings...)
    let panelElem = e.target.closest('[data-panel]');
    if(panelElem){
      e.stopPropagation();
      openPanel(panelElem.dataset.panel);
      return;
    }

    // 2. Data hub clicks (Thanh Vân Thôn hotspot pins, station cards, quick buttons)
    let hubElem = e.target.closest('[data-hub]');
    if(hubElem){
      e.stopPropagation();
      let target = hubElem.dataset.hub;
      if(target === 'close') leaveVillageTown();
      else openPanel(target);
      return;
    }

    // 3. Leave village town button
    let leaveBtn = e.target.closest('#btnLeaveVillageTown, .townLeaveBtn');
    if(leaveBtn){
      e.stopPropagation();
      leaveVillageTown();
      return;
    }

    // 4. Open village prompt button
    let vBtn = e.target.closest('#btnOpenVillageHub, .villagePromptBtn, #villageEnterPrompt');
    if(vBtn){
      e.stopPropagation();
      openPanel('village');
      return;
    }

    // 5. Toggle Row buttons (Skill Row / Nav Row)
    let toggleSkills = e.target.closest('#btnToggleSkills');
    if(toggleSkills){
      e.stopPropagation();
      let wrap = $('#hudSkillClusterWrap');
      if(wrap){
        let isCollapsed = wrap.classList.toggle('collapsed');
        toast(isCollapsed ? '◀ Đã thu gọn hàng Kỹ Năng' : '▶ Đã mở rộng hàng Kỹ Năng');
      }
      return;
    }

    let toggleNav = e.target.closest('#btnToggleNav');
    if(toggleNav){
      e.stopPropagation();
      let wrap = $('#hudBottomNavWrap');
      if(wrap){
        let isCollapsed = wrap.classList.toggle('collapsed');
        toast(isCollapsed ? '◀ Đã thu gọn hàng Menu' : '▶ Đã mở rộng hàng Menu');
      }
      return;
    }

    // 6. Auto battle toggle
    let autoBtn = e.target.closest('#autoBtn');
    if(autoBtn){
      e.stopPropagation();
      S.auto = !S.auto;
      save();
      updateHUD();
      toast(S.auto ? '⚔ Tự động chiến đấu: BẬT' : 'Tự động chiến đấu: TẮT');
      return;
    }

    // 7. Menu grid button
    let menuBtn = e.target.closest('#menuBtn');
    if(menuBtn){
      e.stopPropagation();
      if($('#menuGrid')) $('#menuGrid').hidden = !$('#menuGrid').hidden;
      return;
    }

    // 8. Close modal panel button
    let closeBtn = e.target.closest('#closePanel');
    if(closeBtn){
      e.stopPropagation();
      closePanel();
      return;
    }

    // 9. Dash button
    let dashBtn = e.target.closest('#dashBtn');
    if(dashBtn){
      e.stopPropagation();
      useDash();
      return;
    }
  });

  // Dedicated pointerdown dispatcher: short tap = cast, long press = skill picker
  let _skillPressTimer = null;
  let _skillPressBtn = null;
  let _skillPressStarted = false;

  document.addEventListener('pointerdown', (e) => {
    let skillBtn = e.target.closest('.skill[data-skill]');
    if(skillBtn){
      e.preventDefault();
      e.stopPropagation();
      _skillPressBtn = skillBtn;
      _skillPressStarted = true;
      // Add visual feedback
      skillBtn.classList.add('pressing');
      _skillPressTimer = setTimeout(() => {
        // Long press: open skill picker
        if(_skillPressStarted){
          _skillPressStarted = false;
          skillBtn.classList.remove('pressing');
          openSkillPicker(+skillBtn.dataset.skill);
          sfx('item');
        }
      }, 400);
      return;
    }
  });

  document.addEventListener('pointerup', (e) => {
    if(_skillPressBtn && _skillPressStarted){
      // Short tap: cast skill
      clearTimeout(_skillPressTimer);
      _skillPressStarted = false;
      _skillPressBtn.classList.remove('pressing');
      useSkill(+_skillPressBtn.dataset.skill);
      _skillPressBtn = null;
    }
  });

  document.addEventListener('pointercancel', (e) => {
    clearTimeout(_skillPressTimer);
    _skillPressStarted = false;
    if(_skillPressBtn) _skillPressBtn.classList.remove('pressing');
    _skillPressBtn = null;
  });

  // Modal backdrop click close
  $('#panel').addEventListener('click',e=>{
    if(e.target===$('#panel'))closePanel();
  });

  // Lifecycle/resize chỉ được đăng ký một lần ở GameLifecycle.
  if(!window.GameLifecycle){
    let resizeTimer=0;
    window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{engine.resize();updateOrthoCameraBounds();},160);});
    document.addEventListener('visibilitychange',()=>{paused=document.hidden});
  }
}

function useInventoryItem(name){
  if(!S.items||!S.items[name]||S.items[name]<=0)return toast('Đã hết vật phẩm');
  S.items[name]--;
  if(S.items[name]<=0)delete S.items[name];

  if(name.includes('Hồi Khí Đan')){
    S.hp=S.maxHp;
    S.mp=S.maxMp;
    toast('🔴 Đã dùng Hồi Khí Đan: Phục hồi 100% Khí Huyết & Linh Lực!');
    sfx('item');
  }else if(name.includes('Tẩy Tủy Đan')){
    S.maxHp+=60;
    S.maxMp+=20;
    S.hp=S.maxHp;
    S.mp=S.maxMp;
    toast('🧪 Dùng Tẩy Tủy Đan: Tẩy kinh phạt tủy, tăng vĩnh viễn +60 HP, +20 MP!');
    sfx('breakthrough');
  }else if(name.includes('Bồi Nguyên Đan')){
    const cultAdd=Math.round(500*getTechniqueCultivationMultiplier()*getHeartMethodEffects().cultivation);
    S.cultivation+=cultAdd;
    toast('💊 Dùng Bồi Nguyên Đan: Đột tăng +'+cultAdd+' Điểm Tu Vi!');
    sfx('breakthrough');
  }else if(name.includes('Linh Thạch')){
    const cultivateGain=Math.round(60*getTechniqueCultivationMultiplier()*getHeartMethodEffects().cultivation);
    S.cultivation+=cultivateGain;
    S.gold+=35;
    toast('💎 Hấp thụ Linh Thạch: +'+cultivateGain+' Tu vi, +35 Vàng');
    sfx('item');
  }else if(name.includes('Boss Hồn Tinh')){
    for(const t of COMBAT_DAMAGE_TYPES)S.damage[t]=(S.damage[t]||0)+4;
    S.maxHp+=120;
    S.hp=S.maxHp;
    toast('🔥 Dung hợp Boss Hồn Tinh: +4 mọi loại Sát Thương, +120 Khí Huyết!');
    sfx('breakthrough');
  }else{
    toast('✨ Đã sử dụng thành công: '+name);
    sfx('item');
  }
  save();
  updateHUD();
  openPanel('inventory');
}

// ===== SKILL PICKER POPUP (long-press on skill HUD button) =====
function openSkillPicker(slotNum){
  // Remove existing picker if any
  let old = document.getElementById('skillPickerOverlay');
  if(old) old.remove();

  const slot = slotNum; // 1-4
  const learnedIds = Object.keys(S.learnedSkills || {}).filter(id => (S.learnedSkills[id] || 0) > 0);

  // Build grouped skills by element
  const grouped = {};
  learnedIds.forEach(id => {
    const sk = getSkillDef(id);
    if(!sk) return;
    if(!grouped[sk.element]) grouped[sk.element] = [];
    grouped[sk.element].push(sk);
  });

  const isCurrentFilled = S.equippedSkills && S.equippedSkills[slot-1];

  const overlay = document.createElement('div');
  overlay.id = 'skillPickerOverlay';
  overlay.innerHTML = `
    <div id="skillPickerBox">
      <div class="sp-header">
        <span>⚔ Chọn Kỹ Năng cho Ô <b>${slot}</b></span>
        <button id="spClose">✕</button>
      </div>
      <div class="sp-body">
        <!-- TÙY CHỌN KHÔNG CHỌN SKILL (ĐỂ TRỐNG Ô) -->
        <div style="margin-bottom:12px;padding:8px 10px;background:rgba(239,68,68,0.12);border:1.5px dashed rgba(239,68,68,0.45);border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:18px;">🚫</span>
            <div>
              <b style="color:#ff8b8b;font-size:12px;display:block;">Không chọn kỹ năng (Để trống Ô ${slot})</b>
              <small style="color:#b5c4cb;font-size:11px;">Bỏ chọn, gỡ kỹ năng khỏi ô xuất chiêu này</small>
            </div>
          </div>
          <button id="spUnequipTop" data-sp-slot="${slot}" style="padding:5px 12px;background:linear-gradient(135deg,#e53e3e,#9b2c2c);color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;">
            ${isCurrentFilled ? 'Gỡ Kỹ Năng' : 'Giữ Trống'}
          </button>
        </div>

        ${learnedIds.length === 0
          ? `<p class="sp-empty">Chưa lĩnh ngộ kỹ năng nào.<br>Vào <b>Tàng Kinh Các (Kỹ Năng)</b> để học thêm bí tịch.</p>`
          : Object.entries(grouped).map(([elem, skills]) => `
            <div class="sp-group">
              <div class="sp-group-title">${elem}</div>
              <div class="sp-grid">
                ${skills.map(sk => {
                  const isEquippedHere = S.equippedSkills && S.equippedSkills[slot-1] === sk.id;
                  const inOtherSlot = S.equippedSkills ? S.equippedSkills.findIndex(x => x === sk.id) : -1;
                  const lv = (S.learnedSkills && S.learnedSkills[sk.id]) || 1;
                  return `<button class="sp-skill-btn ${isEquippedHere ? 'sp-active' : ''}" data-sp-skill="${sk.id}" data-sp-slot="${slot}" title="${sk.name} (Lv.${lv})&#10;${sk.mp}MP · CD ${sk.cd}s&#10;${inOtherSlot > -1 && !isEquippedHere ? '⚠ Đang ở Ô '+(inOtherSlot+1) : ''}">
                    <img src="${sk.icon}" onerror="this.style.display='none'">
                    <span class="sp-lv">Lv${lv}</span>
                    ${isEquippedHere ? '<span class="sp-check">✓</span>' : ''}
                    ${inOtherSlot > -1 && !isEquippedHere ? '<span class="sp-other">Ô'+(inOtherSlot+1)+'</span>' : ''}
                  </button>`;
                }).join('')}
              </div>
            </div>
          `).join('')
        }
      </div>
      <div class="sp-footer">
        <button id="spUnequip" data-sp-slot="${slot}" style="background:rgba(255,255,255,0.08);color:#d1d5db;border:1px solid rgba(255,255,255,0.2);">
          🚫 Để Trống Ô ${slot}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on backdrop click
  overlay.addEventListener('pointerdown', e => {
    if(e.target === overlay) overlay.remove();
  });
  document.getElementById('spClose').onclick = () => overlay.remove();

  // Unequip
  const doUnequip = () => {
    if(!Array.isArray(S.equippedSkills)) S.equippedSkills = [null,null,null,null];
    S.equippedSkills[slot-1] = null;
    save(); updateHUD();
    overlay.remove();
    toast('Đã để trống Ô kỹ năng ' + slot);
    sfx('item');
  };

  const unequipBtn = document.getElementById('spUnequip');
  if(unequipBtn) unequipBtn.onclick = doUnequip;
  const unequipTopBtn = document.getElementById('spUnequipTop');
  if(unequipTopBtn) unequipTopBtn.onclick = doUnequip;

  // Equip skill
  overlay.querySelectorAll('.sp-skill-btn').forEach(btn => {
    btn.onclick = () => {
      const skId = btn.dataset.spSkill;
      const sk = getSkillDef(skId);
      if(!sk) return;
      if(!Array.isArray(S.equippedSkills)) S.equippedSkills = [null,null,null,null];
      // Nếu bấm vào skill đang trang bị ở ô này -> unequip
      if(S.equippedSkills[slot-1] === skId){
        S.equippedSkills[slot-1] = null;
        save(); updateHUD();
        overlay.remove();
        toast('Đã tháo ' + sk.name + ' khỏi Ô ' + slot);
        sfx('item');
        return;
      }
      // Remove from other slot if equipped elsewhere
      const oldSlot = S.equippedSkills.indexOf(skId);
      if(oldSlot !== -1 && oldSlot !== slot-1) S.equippedSkills[oldSlot] = null;
      S.equippedSkills[slot-1] = skId;
      save(); updateHUD();
      overlay.remove();
      toast(`🗡 Ô ${slot}: ${sk.name}`);
      sfx('item');
    };
  });
}

function openPanel(kind){
  paused=true;
  const panelElem = $('#panel');
  if(panelElem){
    panelElem.hidden=false;
    panelElem.style.display='grid';
  }
  const mg = $('#menuGrid');
  if(mg) mg.hidden=true;
  let title='Túi Đồ',html='';

  try {
    if(kind==='village'){
      title='🏰 Thanh Vân Thôn · Đại Trận Kim Quang';
      html=`
        <div class="villageHubWrapper">
          <div class="villageHubHero">
            <img src="assets/MAP/THANH VAN THON.webp" class="villageHubImg" alt="Thanh Vân Thôn">
            <div class="villageHubHeroOverlay">
              <div class="villageHubTitle">
                <b>🏰 Thanh Vân Thôn · Thánh Địa Tu Dưỡng</b>
                <span>Đại Trận Kim Quang bảo hộ tuyệt đối · Đạo hữu an tâm tĩnh dưỡng</span>
              </div>
            </div>
          </div>
          <div class="villageStationGrid">
            <div class="villageStationCard" data-hub="daily">
              <div class="villageStationIcon">🏛️</div>
              <div class="villageStationInfo">
                <b>Thôn Trưởng Phủ</b>
                <small>Phúc Lợi & Nhiệm Vụ Hằng Ngày</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="shop">
              <div class="villageStationIcon">🏪</div>
              <div class="villageStationInfo">
                <b>Tiên Phường Vạn Bảo</b>
                <small>Mua Đan Dược, Phù Lục, Quặng</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="crafting">
              <div class="villageStationIcon">⚗️</div>
              <div class="villageStationInfo">
                <b>Đan Phòng & Linh Điền</b>
                <small>Luyện Đan, Chế Phù, Trồng Trọt</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="equipment">
              <div class="villageStationIcon">⚔️</div>
              <div class="villageStationInfo">
                <b>Thiết Tượng Phường</b>
                <small>Rèn Đúc & Cường Hóa Trang Bị</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="skills">
              <div class="villageStationIcon">📜</div>
              <div class="villageStationInfo">
                <b>Tàng Kinh Các</b>
                <small>144 Võ Kỹ & Cửu Đại Linh Căn</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="cultivate">
              <div class="villageStationIcon">🧘</div>
              <div class="villageStationInfo">
                <b>Linh Đài Tọa Thiền</b>
                <small>Tụ Khí Đột Phá Cảnh Giới</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="pet">
              <div class="villageStationIcon">🦊</div>
              <div class="villageStationInfo">
                <b>Linh Thú Các</b>
                <small>Nuôi Dưỡng Cửu Vĩ Linh Hồ</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="inventory">
              <div class="villageStationIcon">🎒</div>
              <div class="villageStationInfo">
                <b>Túi Trữ Vật</b>
                <small>Dược Liệu, Pháp Bảo & Đan Dược</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="map">
              <div class="villageStationIcon">🗺️</div>
              <div class="villageStationInfo">
                <b>Truyền Tống Trận</b>
                <small>Du Hành Cửu Châu Tiên Vực</small>
              </div>
            </div>
            <div class="villageStationCard" data-hub="close" style="background:rgba(85,30,30,0.85);border-color:#ff7777;">
              <div class="villageStationIcon">🚪</div>
              <div class="villageStationInfo">
                <b style="color:#ffb8b8;">Rời Khỏi Thôn</b>
                <small style="color:#ffe0e0;">Ra ngoại vi săn quái tu luyện</small>
              </div>
            </div>
          </div>
        </div>
      `;
      setTimeout(()=>{
        $$('[data-hub]').forEach(b=>{
          b.onclick=()=>{
            let target = b.dataset.hub;
            if(target === 'close') leaveVillageTown();
            else openPanel(target);
          };
        });
      },0);

    }else if(kind==='inventory'){
      title='🎒 Túi Trữ Vật · Đa Ngăn Tiên Giới';
      let grade=gradeForLevel();
      let entries=Object.entries(S.items||{}).filter(([,q])=>q>0);
      let filterTab=S._invFilter||'all';

      let filteredEntries=entries.filter(([n])=>{
        if(filterTab==='gear') return n.includes('Kiếm')||n.includes('Giáp')||n.includes('Bào')||n.includes('Giới')||n.includes('Quan')||n.includes('Hài')||n.includes('Oản');
        if(filterTab==='pills') return n.includes('Đan')||n.includes('Linh Thạch')||n.includes('Hồn Tinh');
        if(filterTab==='mats') return n.includes('Quặng')||n.includes('Thiết')||n.includes('Đá')||n.includes('Thảo')||n.includes('Chi')||n.includes('Quả')||n.includes('Hạt');
        return true;
      });

      html=`
        <div class="card" style="margin-bottom:8px">
          <b>💎 Tài Nguyên Sở Hữu:</b>
          <div class="stat">
            <span>🪙 Vàng: <b>${Math.floor(S.gold||0).toLocaleString()}</b></span>
            <span>💎 Linh Thạch: <b>${(S.stones||0).toLocaleString()}</b></span>
            <span>⛏️ Linh Thiết: <b>${(S.spiritIron||0).toLocaleString()}</b></span>
            <span>🔷 Đá Tinh Luyện: <b>${(S.refineStone||0).toLocaleString()}</b></span>
          </div>
        </div>
        <div class="skill-tabs" style="margin-bottom:10px">
          <button class="inv-tab ${filterTab==='all'?'active':''}" data-tab="all">Tất Cả (${entries.length})</button>
          <button class="inv-tab ${filterTab==='pills'?'active':''}" data-tab="pills">💊 Đan Dược & Tiêu Hao</button>
          <button class="inv-tab ${filterTab==='gear'?'active':''}" data-tab="gear">⚔️ Trang Bị</button>
          <button class="inv-tab ${filterTab==='mats'?'active':''}" data-tab="mats">⛏️ Nguyên Liệu</button>
        </div>
        <div class="cards">${filteredEntries.length?filteredEntries.map(([n,q])=>{
          let isConsumable=n.includes('Đan')||n.includes('Linh Thạch')||n.includes('Hồn Tinh');
          let isGear=n.includes('Kiếm')||n.includes('Giáp')||n.includes('Bào')||n.includes('Giới')||n.includes('Quan')||n.includes('Hài')||n.includes('Oản');
          let iconSrc=n.includes('Kiếm')||n.includes('Kiêm')?'assets/ui/items/item_kiem.png':n.includes('Giáp')||n.includes('Bào')||n.includes('Pháp Bảo')?'assets/ui/items/item_phap_bao_defense.png':n.includes('Đan')?'assets/ui/items/item_dan_duoc.png':n.includes('Linh Thảo')||n.includes('Hoàng Tinh')||n.includes('Tử Diệp')||n.includes('Băng Tâm')||n.includes('Cửu Diệp')||n.includes('Chi')?'assets/ui/items/item_linh_thao.png':n.includes('Nhẫn')||n.includes('Giới')?'assets/ui/items/item_nhan.png':n.includes('Châu')||n.includes('Ngọc')?'assets/ui/items/item_chau.png':n.includes('Phù')||n.includes('Phú')?'assets/ui/items/item_phu.png':n.includes('Quặng')||n.includes('Thiết')||n.includes('Khoáng')?'assets/ui/items/item_nguyen_lieu.png':n.includes('Hồn')||n.includes('Tinh')?'assets/ui/items/item_quy_bao.png':'assets/ui/items/item_phu_luc.png';
          let icon=`<img src="${iconSrc}" style="width:48px;height:48px;object-fit:contain;" onerror="this.outerHTML='💎'">`;
          return `<div class="card">
            <div class="slot">
              <div class="icon" style="background:rgba(0,0,0,0.3);border-radius:8px;padding:4px;">${icon}</div>
              <div>
                <b style="color:#fff3a8;font-size:13px">${n}</b><br>
                <small style="color:#9fe2bf">Số lượng: <b>${q}</b></small>
              </div>
            </div>
            ${isConsumable?`<button class="btn-use" data-use="${n}">Sử Dụng Nhanh</button>`:''}
            ${isGear?`<button data-equip-item="${n}">Trang Bị Món Này</button>`:''}
          </div>`;
        }).join(''):'<div class="card"><p style="text-align:center;color:#8fa7b3;padding:12px 0;">Không có vật phẩm nào trong ngăn này</p></div>'}</div>
        <div class="card" style="margin-top:10px">
          <b>Sắp Xếp & Tiện Ích:</b>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button id="btnSortInv" style="flex:1;">🧹 Dọn Dẹp Túi</button>
            <button id="btnOpenCraftFromInv" style="flex:1;">⚗️ Đến Đan Phòng</button>
          </div>
        </div>
      `;

      setTimeout(()=>{
        $$('.inv-tab').forEach(btn=>{
          btn.onclick=()=>{
            S._invFilter=btn.dataset.tab;
            openPanel('inventory');
          };
        });
        $$('[data-use]').forEach(b=>b.onclick=()=>useInventoryItem(b.dataset.use));
        $$('[data-equip-item]').forEach(b=>{
          b.onclick=()=>{
            let name=b.dataset.equipItem;
            if(name.includes('Kiếm')) equipBest('weapon');
            else if(name.includes('Giáp')||name.includes('Bào')) equipBest('armor');
            else if(name.includes('Giới')||name.includes('Nhẫn')) equipBest('ring');
            else toast('Đã trang bị '+name);
          };
        });
        let sortBtn=$('#btnSortInv');
        if(sortBtn)sortBtn.onclick=()=>{toast('✨ Đã sắp xếp và tối ưu Túi Trữ Vật!');sfx('item');openPanel('inventory');};
        let craftBtn=$('#btnOpenCraftFromInv');
        if(craftBtn)craftBtn.onclick=()=>openPanel('crafting');
      },0);

      if(window.TuTienCraftingGameplay){
        const craftInv=window.TuTienCraftingGameplay.renderInventory(S,getSystemContext());
        if(craftInv){html+=craftInv.html;setTimeout(()=>craftInv.bind&&craftInv.bind(),0);}
      }

    }else if(kind==='character'){
      title='👤 Nhân Vật · Đạo Đồ Tu Tiên';
      let dmgRows=COMBAT_DAMAGE_TYPES.map(t=>`<div class="stat"><span>Sát Thương ${DAMAGE_LABELS[t]}</span><b>${Math.round(getDamageComponent(t))} · Võ Kỹ: ${Math.round(getPlayerDamageStat(t))}</b></div>`).join('');
      let defRows=COMBAT_DAMAGE_TYPES.map(t=>`<div class="stat"><span>Phòng Thủ ${DAMAGE_LABELS[t]}</span><b>${Math.round(getPlayerDefenseStat(t))}</b></div>`).join('');
      html=`
        <div class="card"><b>👤 Căn Bản Tu Tiên</b>
          <div class="stat"><span>Đạo hiệu</span><b style="color:#ffd700">${S.name}</b></div>
          <div class="stat"><span>Cảnh giới</span><b style="color:#7ee7a9">${realmName()}</b></div>
          <div class="stat"><span>Đẳng cấp</span><b>Lv.${S.level}</b></div>
          <div class="stat"><span>Khu vực</span><b>${region().name}</b></div>
          <div class="stat"><span>Linh Căn tu luyện</span><b>${S.skillElement}</b></div>
          <div class="stat"><span>Sinh lực (HP)</span><b>${Math.round(S.hp)} / ${S.maxHp}</b></div>
          <div class="stat"><span>Pháp lực (MP)</span><b>${Math.round(S.mp)} / ${S.maxMp}</b></div>
          <div class="stat"><span>Thần thức</span><b>${Math.round(S.spiritSense)}</b></div>
          <div class="stat"><span>Tu vi tích lũy</span><b>${(S.cultivation||0).toLocaleString()} Điểm</b></div>
          <div class="stat"><span>Hệ số Cảnh Giới</span><b>${getRealmPowerText()}</b></div>
          <div class="stat"><span>Công pháp đang vận hành</span><b>${getActiveTechnique().grade.name} · ${getActiveTechnique().rank.name} · ${getActiveTechnique().name}</b></div>
          <div class="stat"><span>Tâm pháp tu trì</span><b>${getHeartMethodDef().name} · Lv.${getHeartMethodLevel()}</b></div>
          <div class="stat"><span>Áp chế cảnh giới</span><b>+35% / tiểu cảnh · +75% / đại cảnh</b></div>
        </div>
        <div class="card" style="margin-top:8px"><b>⚔ Sát Thương & Bạo Kích</b>
          <div class="stat"><span>Tổng Lực Sát Thương</span><b style="color:#ff9887">${Math.round(getTotalDamage())}</b></div>
          <div class="stat"><span>Ưu tiên đúng hệ</span><b>x${MATCHING_DAMAGE_MULT.toFixed(1)} Sát thương hệ ${S.skillElement}</b></div>
          ${dmgRows}
          <div class="stat"><span>Tỷ lệ bạo kích</span><b>${Math.round((S.critChance||0)*100)}%</b></div>
          <div class="stat"><span>Sát thương bạo kích</span><b>${Math.round((S.critDamage||1.8)*100)}%</b></div>
        </div>
        <div class="card" style="margin-top:8px"><b>🛡 Phòng Ngự Bát Đại Hệ</b>${defRows}</div>
        <div class="card" style="margin-top:8px"><b>☯ Thân Pháp & Hồi Phục</b>
          <div class="stat"><span>Tốc độ di chuyển</span><b>${(S.moveSpeed||6.2).toFixed(2)} m/s</b></div>
          <div class="stat"><span>Tốc độ đánh</span><b>${Math.round((S.attackSpeed||1)*100)}%</b></div>
          <div class="stat"><span>Tốc độ niệm chú</span><b>${Math.round((S.castSpeed||1)*100)}%</b></div>
          <div class="stat"><span>Hồi Khí Huyết (HP)</span><b>${((S.hpRegenPct||0)*100).toFixed(1)}% / nhịp</b></div>
          <div class="stat"><span>Hồi Pháp Lực (MP)</span><b>${((S.mpRegenPct||0)*100).toFixed(1)}% / nhịp</b></div>
          <div class="stat"><span>Linh Thú Trợ Chiến</span><b>${S.pet?'🦊 Cửu Vĩ Linh Hồ (+8% Sát Thương)':'Chưa xuất chiến'}</b></div>
          <div class="stat"><span>Yêu thú đã trảm</span><b>${S.kills} quái</b></div>
        </div>
        <div class="card" style="margin-top:8px">
          <b>Chuyển Nhanh Tính Năng:</b>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px;">
            <button data-quick-panel="cultivate">🧘 Tọa Thiền</button>
            <button data-quick-panel="skills">📜 Võ Kỹ</button>
            <button data-quick-panel="equipment">⚔️ Trang Bị</button>
          </div>
        </div>
      `;

      setTimeout(()=>{
        $$('[data-quick-panel]').forEach(b=>b.onclick=()=>openPanel(b.dataset.quickPanel));
      },0);

      if(window.TuTienSystems)html+=window.TuTienSystems.professionSummary(S);

    }else if(kind==='skills'){
      title='📜 Tàng Kinh Các · Cửu Đại Phái & Bí Tịch';
      let currentElem = S.skillElement || 'Kiếm';
      let currentTier = typeof S.skillTierTab === 'number' ? S.skillTierTab : 0;
      let tierDef = SKILL_TIERS[currentTier] || SKILL_TIERS[0];

      // 1. Equipped Bar
      let equippedHtml = `<div class="card" style="margin-bottom:8px">
        <b>⚔ 4 Ô Kỹ Năng Xuất Chiêu (Chiến Đấu: Ô 1, 2, 3, 4)</b>
        <div class="equipped-bar">
          ${[0,1,2,3].map(slotIdx => {
            let skId = S.equippedSkills ? S.equippedSkills[slotIdx] : null;
            let sk = skId ? getSkillDef(skId) : null;
            let lv = skId ? (S.learnedSkills[skId] || 1) : 0;
            if(sk){
              return `<div class="equipped-slot filled">
                <img src="${sk.icon}" class="skill-slot-img tier-border-${sk.tierId}" alt="${sk.name}" onerror="this.style.display='none'">
                <span class="badge-tier tier-${sk.tierId}">${sk.badge}</span>
                <b>${sk.name}</b>
                <small>Ô ${slotIdx + 1} · Lv.${lv} · ${sk.mp}MP</small>
                <button data-unequip-slot="${slotIdx}">Tháo</button>
              </div>`;
            } else {
              return `<div class="equipped-slot">
                <div style="width:36px;height:36px;border-radius:50%;border:1.5px dashed rgba(255,255,255,.3);display:grid;place-items:center;margin-bottom:4px;font-size:12px;color:#8fa7b3">Trống</div>
                <b>[Ô ${slotIdx + 1} Trống]</b>
                <small>Chưa gán võ kỹ</small>
              </div>`;
            }
          }).join('')}
        </div>
      </div>`;

      // 2. Element Switcher Tabs
      let elemTabsHtml = `<div class="card" style="margin-bottom:8px">
        <b>🔮 Chọn Hệ Linh Căn Tu Tiên:</b>
        <div class="skill-tabs">
          ${elements.map(([n, ic]) => `
            <button data-skill-elem="${n}" class="${currentElem === n ? 'active' : ''}">${ic} ${n}</button>
          `).join('')}
        </div>
      </div>`;

      // 3. Tier Tabs (Hoàng, Huyền, Địa, Thiên)
      let tierTabsHtml = `<div class="card" style="margin-bottom:8px">
        <b>📜 Đẳng Cấp Bí Tịch:</b>
        <div class="skill-tabs">
          ${SKILL_TIERS.map((t, idx) => `
            <button data-skill-tier="${idx}" class="${currentTier === idx ? 'active' : ''}">
              ${t.name} (Y/c: ${realms[t.minRealm]})
            </button>
          `).join('')}
        </div>
      </div>`;

      // 4. 4 Skill Cards for the selected Tier & Element
      let cardsHtml = '<div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">';
      for(let rankIdx = 0; rankIdx < 4; rankIdx++){
        let skillId = getSkillId(currentElem, currentTier, rankIdx);
        let sk = getSkillDef(skillId);
        let isLearned = S.learnedSkills && S.learnedSkills[skillId];
        let lv = isLearned ? S.learnedSkills[skillId] : 0;
        let canLearn = S.realm >= sk.minRealm && S.level >= sk.minLevel;
        let upCost = getSkillUpgradeCost(sk,Math.max(1,lv));
        let upCostStones = upCost ? upCost.stones : 0;
        let upCostCult = upCost ? upCost.cult : 0;
        let dmgPercent = Math.round(sk.mult * 100 * (1 + Math.max(0, lv - 1) * 0.15));

        cardsHtml += `<div class="card skill-card ${isLearned ? 'learned' : ''}">
          <div>
            <div class="slot" style="margin-bottom:8px">
              <img src="${sk.icon}" class="skill-thumb-img tier-border-${sk.tierId}" alt="${sk.name}">
              <div>
                <span class="badge-tier tier-${tierDef.id}">${sk.tierName} · ${sk.rankName}</span>
                <b style="color:${tierDef.color};display:block;font-size:14px">${sk.name}</b>
              </div>
            </div>
            <p style="margin-top:6px">
              ⚔ Sát thương: <b style="color:#ffe07a">${dmgPercent}% Công Kích</b><br>
              💧 Linh lực: <b>${sk.mp} MP</b> · ⏱ Hồi chiêu: <b>${sk.cd}s</b><br>
              🎯 Phạm vi: <b>${sk.aoe === 0 ? 'Đơn mục tiêu (3 liên trảm)' : sk.aoe + 'm (AoE diện rộng)'}</b><br>
              ☯ Yêu cầu: <b>${realms[sk.minRealm]} (Lv.${sk.minLevel}+)</b><br>🧩 Vai trò: <b>${sk.role||'Kỹ năng chiến đấu'}</b><br>✨ Hiệu ứng: <b>${sk.statusText||'Không'}</b>
            </p>
          </div>
          <div>
            <div style="font-size:11px;margin:6px 0">
              ${isLearned ? `<span class="good">✓ Đã lĩnh ngộ (Cấp ${lv}/5)</span>` : `<span style="color:#a8b4be">Chưa lĩnh ngộ</span>`}
            </div>
            ${!isLearned ? `
              <button class="btn-use" data-learn-skill="${sk.id}" ${(!canLearn || S.stones < sk.costStones || S.cultivation < sk.costCult) ? 'disabled' : ''}>
                Lĩnh Ngộ (💎${sk.costStones} · ☯${sk.costCult})
              </button>
            ` : `
              ${lv < 5 ? `
                <button data-upgrade-skill="${sk.id}" ${(S.stones < upCostStones || S.cultivation < upCostCult) ? 'disabled' : ''}>
                  Cường Hóa (💎${upCostStones} · ☯${upCostCult})
                </button>
              ` : `<button disabled>Đã Đạt Cực Hạn (Lv.5)</button>`}
              <div class="skill-card-actions">
                ${[1, 2, 3, 4].map(s => {
                  let isCurrentInSlot = S.equippedSkills && S.equippedSkills[s - 1] === sk.id;
                  return `<button data-equip-slot="${s}" data-equip-skill="${sk.id}" class="${isCurrentInSlot ? 'btn-active-slot' : ''}" style="${isCurrentInSlot ? 'background:linear-gradient(135deg,#c53030,#742a2a);color:#fff;border-color:#e53e3e;' : ''}" title="${isCurrentInSlot ? 'Bấm để gỡ bỏ khỏi Ô ' + s : 'Gán vào Ô ' + s}">
                    ${isCurrentInSlot ? '✕ Gỡ Ô ' + s : 'Gán Ô ' + s}
                  </button>`;
                }).join('')}
              </div>
            `}
          </div>
        </div>`;
      }
      cardsHtml += '</div>';

      html = equippedHtml + elemTabsHtml + tierTabsHtml + cardsHtml;

      setTimeout(() => {
        $$('[data-skill-elem]').forEach(b => b.onclick = () => {
          S.skillElement = b.dataset.skillElem;
          save();
          openPanel('skills');
          updateHUD();
          toast('🔮 Đã chuyển sang phái ' + S.skillElement);
        });

        $$('[data-skill-tier]').forEach(b => b.onclick = () => {
          S.skillTierTab = parseInt(b.dataset.skillTier, 10);
          save();
          openPanel('skills');
        });

        $$('[data-learn-skill]').forEach(b => b.onclick = () => {
          let skId = b.dataset.learnSkill;
          let sk = getSkillDef(skId);
          if(!sk) return;
          if(S.realm < sk.minRealm || S.level < sk.minLevel) return toast('Chưa đạt đủ cảnh giới hoặc cấp độ để lĩnh ngộ!');
          if(S.stones < sk.costStones) return toast('Không đủ Linh Thạch!');
          if(S.cultivation < sk.costCult) return toast('Không đủ Tu Vi!');
          S.stones -= sk.costStones;
          S.cultivation -= sk.costCult;
          if(!S.learnedSkills) S.learnedSkills = {};
          S.learnedSkills[skId] = 1;

          if(Array.isArray(S.equippedSkills)){
            let emptyIdx = S.equippedSkills.indexOf(null);
            if(emptyIdx !== -1){
              S.equippedSkills[emptyIdx] = skId;
            }
          }

          save();
          openPanel('skills');
          updateHUD();
          toast('✨ Lĩnh ngộ thành công ' + sk.name + ' (' + sk.tierName + ' · ' + sk.rankName + ')!');
          sfx('breakthrough');
        });

        $$('[data-upgrade-skill]').forEach(b => b.onclick = () => {
          let skId = b.dataset.upgradeSkill;
          let sk = getSkillDef(skId);
          if(!sk) return;
          let curLv = (S.learnedSkills && S.learnedSkills[skId]) || 1;
          if(curLv >= 5) return toast('Bí tịch đã đạt cảnh giới đại viên mãn!');
          let upCost = getSkillUpgradeCost(sk,curLv);
          if(!upCost) return toast('Không có dữ liệu nâng cấp cho kỹ năng này');
          let upCostStones = upCost.stones;
          let upCostCult = upCost.cult;
          if(S.stones < upCostStones) return toast('Không đủ Linh Thạch!');
          if(S.cultivation < upCostCult) return toast('Không đủ Tu Vi!');
          S.stones -= upCostStones;
          S.cultivation -= upCostCult;
          S.learnedSkills[skId] = curLv + 1;
          save();
          openPanel('skills');
          updateHUD();
          toast('⚔ Cường hóa thành công ' + sk.name + ' lên Cấp ' + (curLv + 1) + ' (+15% Uy lực)!');
          sfx('levelUp');
        });

        $$('[data-equip-slot]').forEach(b => b.onclick = () => {
          let slot = parseInt(b.dataset.equipSlot, 10);
          let skId = b.dataset.equipSkill;
          let sk = getSkillDef(skId);
          if(!sk) return;
          if(!Array.isArray(S.equippedSkills)) S.equippedSkills = [null, null, null, null];
          if(S.equippedSkills[slot - 1] === skId){
            // Gỡ bỏ / Không chọn
            S.equippedSkills[slot - 1] = null;
            save();
            openPanel('skills');
            updateHUD();
            toast('Đã gỡ ' + sk.name + ' khỏi Ô ' + slot + ' (Ô để trống)');
            sfx('item');
            return;
          }
          let oldSlot = S.equippedSkills.indexOf(skId);
          if(oldSlot !== -1 && oldSlot !== slot - 1){
            S.equippedSkills[oldSlot] = null;
          }
          S.equippedSkills[slot - 1] = skId;
          save();
          openPanel('skills');
          updateHUD();
          toast('🗡 Đã trang bị ' + sk.name + ' vào Ô ' + slot + '!');
          sfx('item');
        });

        $$('[data-unequip-slot]').forEach(b => b.onclick = () => {
          let slotIdx = parseInt(b.dataset.unequipSlot, 10);
          if(Array.isArray(S.equippedSkills)){
            S.equippedSkills[slotIdx] = null;
            save();
            openPanel('skills');
            updateHUD();
            toast('Đã tháo kỹ năng khỏi Ô ' + (slotIdx + 1));
            sfx('item');
          }
        });
      }, 0);

    }else if(kind==='cultivate'){
      title='🧘 Linh Đài Tọa Thiền · Đột Phá & Công Pháp';
      let rawNeed=S.realm===0
        ?Math.round(350*Math.pow(1.55,Math.max(0,(S.realmStage||1)-1)))
        :Math.round(9000*Math.pow(4,S.realm-1)*Math.pow(2.4,S.period||0));
      let need=window.TuTienSystems?window.TuTienSystems.getBreakthroughNeed(S,rawNeed):rawNeed;
      const activeTech=getActiveTechnique();
      const heart=getHeartMethodDef(),heartLv=getHeartMethodLevel(),heartFx=getHeartMethodEffects();

      let techniqueCards=CULTIVATION_TECH_TYPES.map(type=>{
        const t=getTechniqueDef(type),cost=techniqueRankUpgradeCost(type),breakCost=techniqueBreakthroughCost(type);
        const next=t.gradeIndex<TECHNIQUE_GRADES.length-1?TECHNIQUE_GRADES[t.gradeIndex+1]:null;
        const canBreak=canBreakTechniqueGrade(type);
        const maxed=t.rankIndex>=TECHNIQUE_RANKS.length-1;
        const nextRank=TECHNIQUE_RANKS[Math.min(t.rankIndex+1,TECHNIQUE_RANKS.length-1)];
        return `<div class="card">
          <b>📜 ${CULTIVATION_TECH_LABELS[type]} · ${t.grade.name} · ${t.rank.name}</b>
          <p><b>${t.name}</b></p>
          <p>Hiệu suất nhận Tu vi: ×${getTechniqueCultivationMultiplier(type).toFixed(2)}</p>
          <p>Thuộc tính ${CULTIVATION_TECH_LABELS[type]} khi vận hành: ×${(t.grade.stat*t.rank.stat).toFixed(2)}</p>
          <p>Yêu cầu cảnh giới: ${realms[t.grade.minRealm]} trở lên.</p>
          <button data-tech-select="${type}" ${isTechniqueRealmAllowed(type)?'':'disabled'}>${getActiveTechniqueType()===type?'Đang vận hành':'Vận hành tu luyện'}</button>
          <button data-tech-up="${type}" ${maxed?'disabled':''}>Tu luyện → ${nextRank.name} · ${cost.cult} Tu vi + ${cost.stones} Linh Thạch</button>
          ${next?`<button data-tech-break="${type}" ${canBreak?'':'disabled'}>Đột phá → ${next.name} · Hạ phẩm · ${breakCost.cult} Tu vi + ${breakCost.stones} Linh Thạch</button>`:'<p>Đã đạt Thiên · Cực phẩm</p>'}
        </div>`;
      }).join('');

      let heartCards=heartMethods.map((h,i)=>{
        let lv=getHeartMethodLevel(i),locked=(S.realm||0)<h.minRealm,cost=heartUpgradeCost(i);
        return `<div class="card">
          <b>🧘 ${h.grade} phẩm · ${h.name}</b>
          <p>${h.desc}</p>
          <p>Lv.${lv}/10 · Hồi phục ×${h.regen.toFixed(2)} · Thần thức ×${h.spirit.toFixed(2)} · Phòng thủ ×${h.defense.toFixed(2)}</p>
          <p>Tu vi ×${h.cultivation.toFixed(2)} · Tốc đánh/thi triển/di chuyển được tăng theo cấp.</p>
          <button data-heart-select="${i}" ${locked?'disabled':''}>${i===S.heartMethod?'Đang vận hành':'Vận hành tâm pháp'}</button>
          <button data-heart-up="${i}" ${locked||lv>=10?'disabled':''}>Nâng cấp · ${cost.cult} Tu vi + ${cost.stones} Linh Thạch</button>
        </div>`;
      }).join('');

      html=`
        <div class="card">
          <b>☯ Cảnh giới hiện tại: <span style="color:#ffd700">${realmName()}</span></b>
          <p>Điểm Tu vi: <b>${(S.cultivation||0).toLocaleString()} / ${need.toLocaleString()}</b></p>
          <p>Hệ số stat cảnh giới: <b>${getRealmPowerText()}</b></p>
          <p>Áp chế: <b>+35% mỗi tiểu cảnh · +75% mỗi đại cảnh chênh lệch</b></p>
          <p>Công pháp đang vận hành: <b>${activeTech.grade.name} · ${activeTech.rank.name} · ${activeTech.name}</b></p>
          <p>Hiệu suất Công pháp: <b>×${getTechniqueCultivationMultiplier().toFixed(2)} Tu vi</b></p>
          <p>Thuộc tính ${CULTIVATION_TECH_LABELS[getActiveTechniqueType()]}: <b>${getTechniqueStatText()}</b></p>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button id="btnMeditateNow" class="btn-use" style="flex:1;">🧘 Tọa Thiền Tụ Khí (+Tu Vi)</button>
            <button class="action" id="breakBtn" ${(S.cultivation||0)>=need?'':'disabled'} style="flex:1;margin-top:0;">
              ${(S.cultivation||0)>=need?'✨ Đột Phá Ngay':'Chưa Đủ Tu Vi'}
            </button>
          </div>
        </div>
        <div class="card" style="margin-top:8px">
          <b>📚 Công Pháp Tu Luyện (4 Phẩm Cấp)</b>
          <p>Hoàng → Huyền → Địa → Thiên. Tăng hiệu suất thu nhận Tu vi và nhân thuộc tính bản mệnh.</p>
        </div>
        <div class="cards">${techniqueCards}</div>
        <div class="card" style="margin-top:10px">
          <b>🧘 Tâm Pháp Tiên Môn: ${heart.grade} phẩm · ${heart.name} · Lv.${heartLv}</b>
          <p>Hồi phục ×${heartFx.regen.toFixed(2)} · Thần thức ×${heartFx.spirit.toFixed(2)} · Tu vi ×${heartFx.cultivation.toFixed(2)} · Phòng thủ ×${heartFx.defense.toFixed(2)}</p>
        </div>
        <div class="cards">${heartCards}</div>`;

      setTimeout(()=>{
        let medBtn=$('#btnMeditateNow');
        if(medBtn)medBtn.onclick=()=>{
          let mult=getTechniqueCultivationMultiplier()*getHeartMethodEffects().cultivation;
          let gain=Math.round((80 + (S.level||1)*15)*mult);
          S.cultivation=(S.cultivation||0)+gain;
          S.mp=Math.min(S.maxMp, S.mp + S.maxMp*0.2);
          save(); updateHUD(); openPanel('cultivate');
          burst(player.x, player.z, '#a7f3d0', 25, 5);
          toast(`🧘 Tụ Khí Tọa Thiền: Thu nạp linh khí thiên địa, nhận +${gain.toLocaleString()} Tu Vi!`);
          sfx('item');
        };

        let bb=$('#breakBtn');
        if(bb)bb.onclick=()=>{
          if(S.realm>=realms.length-1&&(S.period||0)>=3)return toast('Đã đạt Hóa Thần · Đỉnh Phong');
          if(S.cultivation<need)return toast('Chưa đủ tu vi để đột phá');
          S.cultivation-=need;
          if(window.TuTienSystems)window.TuTienSystems.consumeBreakthroughAid(S);
          if(S.realm===0){
            S.realmStage++;
            if(S.realmStage>12){S.realm=1;S.realmStage=0;S.period=0}
          }else{
            S.period=(S.period||0)+1;
            if(S.period>3){S.period=0;S.realm=Math.min(4,S.realm+1)}
          }
          S.maxHp=Math.round(S.maxHp*1.22+120);
          S.maxMp=Math.round(S.maxMp*1.18+35);
          S.hp=S.maxHp; S.mp=S.maxMp;
          S.damage.physical=Math.round((S.damage.physical||0)*1.15+12);
          S.defense.physical=Math.round((S.defense.physical||0)*1.18+4);
          S.spiritSense=Math.round((S.spiritSense||0)*1.12+8);
          save(); closePanel();
          burst(player.x,player.z,'#f6dd7c',50,8);
          toast('☯ Đột phá thành công: '+realmName()+'!');
          sfx('breakthrough'); updateHUD();
        };

        $$('[data-tech-select]').forEach(b=>b.onclick=()=>{
          const type=normalizeTechniqueType(b.dataset.techSelect);
          if(!isTechniqueRealmAllowed(type))return toast('Cảnh giới hiện tại chưa đủ để vận hành công pháp này');
          S.activeCultivationTechnique=type;
          save(); openPanel('cultivate'); updateHUD();
          const t=getTechniqueDef(type);
          toast('📚 Đang vận hành '+t.name+' · '+t.grade.name+' · '+t.rank.name);
          sfx('item');
        });

        $$('[data-tech-up]').forEach(b=>b.onclick=()=>{
          const type=normalizeTechniqueType(b.dataset.techUp);
          const t=getTechniqueDef(type),cost=techniqueRankUpgradeCost(type);
          if((S.realm||0)<t.grade.minRealm)return toast('Cảnh giới hiện tại chưa đủ để tu luyện công pháp phẩm này');
          if(t.rankIndex>=TECHNIQUE_RANKS.length-1)return toast('Đã đạt Cực phẩm của đại phẩm hiện tại');
          if(S.cultivation<cost.cult||S.stones<cost.stones)return toast('Không đủ Tu vi hoặc Linh Thạch');
          S.cultivation-=cost.cult; S.stones-=cost.stones;
          getTechniqueState(type).rank++;
          const nt=getTechniqueDef(type);
          save(); openPanel('cultivate'); updateHUD();
          toast('📜 '+nt.name+' đạt '+nt.rank.name); sfx('levelUp');
        });

        $$('[data-tech-break]').forEach(b=>b.onclick=()=>{
          const type=normalizeTechniqueType(b.dataset.techBreak);
          const cost=techniqueBreakthroughCost(type);
          if(!canBreakTechniqueGrade(type))return toast('Cần đạt Cực phẩm và đủ cảnh giới để đột phá đại phẩm');
          if(!cost||S.cultivation<cost.cult||S.stones<cost.stones)return toast('Không đủ Tu vi hoặc Linh Thạch');
          S.cultivation-=cost.cult; S.stones-=cost.stones;
          const st=getTechniqueState(type); st.grade++; st.rank=0;
          const nt=getTechniqueDef(type);
          save(); openPanel('cultivate'); updateHUD();
          toast('✨ '+nt.name+' đột phá '+nt.grade.name+' · Hạ phẩm');
          sfx('breakthrough');
        });

        $$('[data-heart-select]').forEach(b=>b.onclick=()=>{
          let i=+b.dataset.heartSelect,h=heartMethods[i];
          if(!h||(S.realm||0)<h.minRealm)return toast('Cảnh giới chưa đủ để vận hành tâm pháp này');
          S.heartMethod=i;
          if(!S.heartMethodLevels[i])S.heartMethodLevels[i]=1;
          save(); openPanel('cultivate'); updateHUD();
          toast('🧘 Đã vận hành '+h.name); sfx('item');
        });

        $$('[data-heart-up]').forEach(b=>b.onclick=()=>{
          let i=+b.dataset.heartUp,h=heartMethods[i],lv=getHeartMethodLevel(i),cost=heartUpgradeCost(i);
          if(!h||(S.realm||0)<h.minRealm)return toast('Cảnh giới chưa đủ');
          if(lv>=10)return toast('Tâm pháp đã đạt Lv.10');
          if(S.cultivation<cost.cult||S.stones<cost.stones)return toast('Không đủ Tu vi hoặc Linh Thạch');
          S.cultivation-=cost.cult; S.stones-=cost.stones;
          S.heartMethodLevels[i]=lv+1;
          save(); openPanel('cultivate'); updateHUD();
          toast('🧘 '+h.name+' tăng lên Lv.'+(lv+1)); sfx('levelUp');
        });
      },0);

    }else if(kind==='equipment'){
      title='⚔️ Thiết Tượng Phường · Trang Bị & Pháp Bảo';
      if(!S.equipment) S.equipment={weapon:null,armor:null,ring:null,helm:null,boots:null,bracer:null};
      if(!S.gearEnhance) S.gearEnhance={weapon:0,armor:0,ring:0,helm:0,boots:0,bracer:0};

      const _iimg=(src,fb)=>`<img src="${src}" style="width:44px;height:44px;object-fit:contain;" onerror="this.outerHTML='${fb}'">`;
      const slotDefs=[
        {id:'weapon',name:'Vũ Khí',icon:_iimg('assets/ui/items/item_kiem.png','⚔️'),desc:'Tăng Công Kích & Sát Thương'},
        {id:'armor',name:'Đạo Bào',icon:_iimg('assets/ui/items/item_phap_bao_defense.png','🛡️'),desc:'Tăng Khí Huyết & Phòng Thủ'},
        {id:'helm',name:'Đầu Quan',icon:_iimg('assets/ui/items/item_tran_phap.png','👑'),desc:'Tăng Thần Thức & MP'},
        {id:'bracer',name:'Hộ Oản',icon:_iimg('assets/ui/items/item_quat.png','🥊'),desc:'Tăng Tốc Đánh & Bạo Kích'},
        {id:'boots',name:'Đôi Hài',icon:_iimg('assets/ui/items/item_luyen_khi.png','👢'),desc:'Tăng Tốc Chạy & Né Tránh'},
        {id:'ring',name:'Giới Chỉ',icon:_iimg('assets/ui/items/item_nhan.png','💍'),desc:'Tăng Sát Thương Bạo & Hút Máu'}
      ];

      html=`
        <div class="card" style="margin-bottom:8px">
          <b>⚔ 6 Vị Trí Trang Bị Thân Thể:</b>
          <p>Cường hóa (+1 → +12) gia tăng 15% chỉ số cơ bản của từng món đồ.</p>
        </div>
        <div class="cards">
          ${slotDefs.map(s=>{
            let itName=S.equipment[s.id]||'Chưa trang bị';
            let enhLevel=S.gearEnhance[s.id]||0;
            let costIron=Math.max(1,enhLevel*2);
            let costGold=Math.max(100,(enhLevel+1)*150);
            return `<div class="card">
              <div class="slot">
                <div class="icon">${s.icon}</div>
                <div>
                  <b style="color:#ffd700">${s.name} ${enhLevel>0?`<span style="color:#7ee7a9">+${enhLevel}</span>`:''}</b><br>
                  <span style="font-size:11px;color:#fff">${itName}</span><br>
                  <small style="color:#9fe2bf">${s.desc}</small>
                </div>
              </div>
              <div style="display:flex;gap:4px;margin-top:6px;">
                <button data-equip-slot="${s.id}" style="flex:1;">Trang Bị Món Tốt</button>
                ${S.equipment[s.id]?`<button data-enhance-slot="${s.id}" style="flex:1;background:linear-gradient(180deg,#1c5344,#0f3127);">Cường Hóa (+${enhLevel+1})</button>`:''}
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="card" style="margin-top:10px">
          <b>🔨 Lò Rèn Đúc Trang Bị Mới:</b>
          <p>Tiêu hao Linh Thiết & Linh Thạch để rèn trang bị phẩm cấp tương ứng cảnh giới.</p>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button id="btnForgeWeapon" style="flex:1;">Rèn Vũ Khí (5 Linh Thiết)</button>
            <button id="btnForgeArmor" style="flex:1;">Rèn Giáp Trụ (5 Linh Thiết)</button>
          </div>
        </div>
      `;

      setTimeout(()=>{
        $$('[data-equip-slot]').forEach(b=>b.onclick=()=>equipBest(b.dataset.equipSlot));
        $$('[data-enhance-slot]').forEach(b=>{
          b.onclick=()=>{
            let slot=b.dataset.enhanceSlot;
            let cur=S.gearEnhance[slot]||0;
            if(cur>=12) return toast('Trang bị đã đạt cấp cường hóa tối đa (+12)!');
            let costGold=Math.max(100,(cur+1)*150);
            if((S.gold||0)<costGold) return toast('Không đủ Vàng để cường hóa (Cần '+costGold+' Vàng)!');
            S.gold-=costGold;
            S.gearEnhance[slot]=cur+1;
            // Tăng thuộc tính
            if(slot==='weapon') S.damage.physical=(S.damage.physical||0)+15;
            else if(slot==='armor') { S.maxHp+=80; S.defense.physical=(S.defense.physical||0)+4; }
            else if(slot==='helm') { S.maxMp+=30; S.spiritSense+=4; }
            else if(slot==='bracer') { S.attackSpeed=Math.min(3,(S.attackSpeed||1)+0.01); S.critChance=Math.min(0.75,(S.critChance||0)+0.005); }
            else if(slot==='boots') { S.moveSpeed=Math.min(12,(S.moveSpeed||6.2)+0.05); }
            else if(slot==='ring') { S.critDamage=Math.min(4,(S.critDamage||1.8)+0.03); }
            save(); updateHUD(); openPanel('equipment');
            toast('✨ Cường hóa thành công lên +'+(cur+1)+'!');
            sfx('levelUp');
          };
        });

        let fW=$('#btnForgeWeapon');
        if(fW)fW.onclick=()=>{
          if((S.spiritIron||0)<5) return toast('Không đủ Linh Thiết (Cần 5 Linh Thiết)!');
          S.spiritIron-=5;
          const names=['Thanh Phong Kiếm','Tử Lôi Kiếm','Băng Phách Đao','Xích Viêm Thương','Trảm Tiên Kiếm'];
          let n=names[Math.min(names.length-1,S.realm||0)];
          addItem(n,1);
          save(); updateHUD(); openPanel('equipment');
          toast('⚔ Rèn đúc thành công: '+n+'!');
          sfx('breakthrough');
        };

        let fA=$('#btnForgeArmor');
        if(fA)fA.onclick=()=>{
          if((S.spiritIron||0)<5) return toast('Không đủ Linh Thiết (Cần 5 Linh Thiết)!');
          S.spiritIron-=5;
          const names=['Huyền Thiết Giáp','Băng Tâm Đạo Bào','Xích Hỏa Chiến Giáp','Hỗn Nguyên Tiên Bào'];
          let n=names[Math.min(names.length-1,S.realm||0)];
          addItem(n,1);
          save(); updateHUD(); openPanel('equipment');
          toast('🛡 Rèn đúc thành công: '+n+'!');
          sfx('breakthrough');
        };
      },0);

    }else if(kind==='farm'){
      title='🌿 Linh Dược Viên · Nông Trường Tiên Dược';
      if(!S.farmPlots || !Array.isArray(S.farmPlots) || S.farmPlots.length < 6){
        S.farmPlots = [
          {id:0, herb:'Linh Thảo', progress:100, ready:true, icon:'🌿'},
          {id:1, herb:'Hoàng Tinh', progress:100, ready:true, icon:'🍂'},
          {id:2, herb:'Tử Diệp Chi', progress:100, ready:true, icon:'🌸'},
          {id:3, herb:'Băng Tâm Thảo', progress:60, ready:false, icon:'❄️'},
          {id:4, herb:null, progress:0, ready:false, icon:'🌱'},
          {id:5, herb:null, progress:0, ready:false, icon:'🌱'}
        ];
      }

      const seedTypes = [
        {name:'Linh Thảo', icon:'🌿', price:50, growMin:1, desc:'Dược liệu căn bản luyện Hồi Khí & Tẩy Tủy Đan'},
        {name:'Hoàng Tinh', icon:'🍂', price:100, growMin:2, desc:'Thảo dược bồi bổ luyện Bồi Nguyên Đan'},
        {name:'Tử Diệp Chi', icon:'🌸', price:180, growMin:3, desc:'Linh chi quý hiếm luyện Trúc Cơ Đan'},
        {name:'Băng Tâm Thảo', icon:'❄️', price:280, growMin:4, desc:'Linh thảo cực hàn luyện Trúc Cơ & Kim Đan'},
        {name:'Cửu Diệp Chi', icon:'🌟', price:450, growMin:5, desc:'Tiên dược thượng phẩm luyện Kim Đan Hoàn'}
      ];

      html=`
        <div class="card" style="margin-bottom:8px">
          <b>🌿 6 Ô Linh Điền Trồng Dược Thảo:</b>
          <p>Trồng trọt thu hoạch thảo dược cung cấp nguyên liệu quý giá cho Đan Phòng luyện chế Tiên Đan!</p>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button id="btnHarvestAllFarm" class="btn-use" style="flex:1;">🌾 Thu Hoạch Toàn Bộ</button>
            <button id="btnWaterAllFarm" style="flex:1;">💧 Tưới Linh Tuyền (Thúc Chín Tức Thì)</button>
          </div>
        </div>
        <div class="cards">
          ${S.farmPlots.map((plot, idx)=>{
            if(plot.herb){
              return `<div class="card">
                <div class="slot">
                  <div class="icon">${plot.icon}</div>
                  <div>
                    <b style="color:#ffd700">Ô ${idx+1}: ${plot.herb}</b><br>
                    <span style="font-size:11px;color:${plot.ready?'#7ee7a9':'#ffefa8'}">
                      ${plot.ready?'✨ Đã Trưởng Thành (Sẵn Sàng Thu)':`Đang Sinh Trưởng (${plot.progress}%)`}
                    </span>
                  </div>
                </div>
                <div style="display:flex;gap:4px;margin-top:8px;">
                  ${plot.ready?`<button data-harvest-plot="${idx}" class="btn-use" style="flex:1;">Thu Hoạch</button>`:`<button data-water-plot="${idx}" style="flex:1;">💧 Thúc Chín (20 Vàng)</button>`}
                  <button data-clear-plot="${idx}" style="width:auto;padding:6px 8px;" title="Nhổ Bỏ">🗑</button>
                </div>
              </div>`;
            }else{
              return `<div class="card" style="border-style:dashed;border-color:rgba(255,255,255,0.25);">
                <div class="slot">
                  <div class="icon" style="opacity:0.5;">🌱</div>
                  <div>
                    <b style="color:#8fa7b3">Ô ${idx+1}: Đất Linh Điền Trống</b><br>
                    <small style="color:#9fe2bf">Chưa gieo hạt giống</small>
                  </div>
                </div>
                <button data-open-plant-modal="${idx}" style="margin-top:8px;">🌱 Gieo Hạt Giống</button>
              </div>`;
            }
          }).join('')}
        </div>
        <div class="card" style="margin-top:10px">
          <b>🏪 Cửa Hàng Hạt Giống Nhanh:</b>
          <p>Mua hạt giống gieo trồng ngay vào các ô đất trống:</p>
          <div class="cards" style="margin-top:6px;">
            ${seedTypes.map(s=>`
              <div class="card">
                <div class="slot">
                  <div class="icon">${s.icon}</div>
                  <div>
                    <b style="color:#fff3a8;font-size:12px;">Hạt ${s.name}</b><br>
                    <small style="color:#9fe2bf">🪙 ${s.price} Vàng</small>
                  </div>
                </div>
                <button data-buy-plant="${s.name}" data-price="${s.price}" data-icon="${s.icon}" ${(S.gold||0)>=s.price?'':'disabled'} style="margin-top:6px;">
                  Mua & Gieo
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      setTimeout(()=>{
        let btnHarvestAll = $('#btnHarvestAllFarm');
        if(btnHarvestAll) btnHarvestAll.onclick=()=>{
          let count=0;
          S.farmPlots.forEach(p=>{
            if(p.herb && p.ready){
              addItem(p.herb, 2);
              p.herb=null; p.progress=0; p.ready=false;
              count++;
            }
          });
          if(count>0){
            save(); updateHUD(); openPanel('farm');
            toast(`🌿 Đã thu hoạch thành công ${count} ô dược thảo vào Túi Trữ Vật!`);
            sfx('item');
          }else{
            toast('Chưa có ô dược thảo nào trưởng thành để thu hoạch.');
          }
        };

        let btnWaterAll = $('#btnWaterAllFarm');
        if(btnWaterAll) btnWaterAll.onclick=()=>{
          let cost=50;
          if((S.gold||0)<cost) return toast('Cần 50 Vàng để tưới linh tuyền thúc chín toàn vườn!');
          S.gold-=cost;
          S.farmPlots.forEach(p=>{
            if(p.herb){ p.progress=100; p.ready=true; }
          });
          save(); updateHUD(); openPanel('farm');
          toast('💧 Đã tưới Linh Tuyền: Toàn bộ dược thảo đã chín mọng!');
          sfx('breakthrough');
        };

        $$('[data-harvest-plot]').forEach(b=>{
          b.onclick=()=>{
            let idx=+b.dataset.harvestPlot;
            let p=S.farmPlots[idx];
            if(p && p.herb){
              let h=p.herb;
              addItem(h, 2);
              p.herb=null; p.progress=0; p.ready=false;
              save(); updateHUD(); openPanel('farm');
              toast(`🌿 Thu hoạch thành công: +2 ${h}!`);
              sfx('item');
            }
          };
        });

        $$('[data-water-plot]').forEach(b=>{
          b.onclick=()=>{
            let idx=+b.dataset.waterPlot;
            let p=S.farmPlots[idx];
            if((S.gold||0)<20) return toast('Không đủ 20 Vàng để tưới linh tuyền!');
            S.gold-=20;
            if(p){ p.progress=100; p.ready=true; }
            save(); updateHUD(); openPanel('farm');
            toast('💧 Đã tưới Linh Tuyền thúc chín ô đất!');
            sfx('item');
          };
        });

        $$('[data-clear-plot]').forEach(b=>{
          b.onclick=()=>{
            let idx=+b.dataset.clearPlot;
            if(S.farmPlots[idx]){
              S.farmPlots[idx].herb=null;
              S.farmPlots[idx].progress=0;
              S.farmPlots[idx].ready=false;
              save(); updateHUD(); openPanel('farm');
              toast('Đã dọn sạch ô đất.');
            }
          };
        });

        $$('[data-open-plant-modal]').forEach(b=>{
          b.onclick=()=>{
            let idx=+b.dataset.openPlantModal;
            let emptyPlot=S.farmPlots[idx];
            if(emptyPlot){
              emptyPlot.herb='Linh Thảo';
              emptyPlot.icon='🌿';
              emptyPlot.progress=100;
              emptyPlot.ready=true;
              save(); updateHUD(); openPanel('farm');
              toast('🌱 Đã gieo Hạt Linh Thảo vào ô '+ (idx+1) +'!');
              sfx('item');
            }
          };
        });

        $$('[data-buy-plant]').forEach(b=>{
          b.onclick=()=>{
            let name=b.dataset.buyPlant;
            let price=+b.dataset.price;
            let icon=b.dataset.icon;
            if((S.gold||0)<price) return toast('Không đủ Vàng!');
            let emptyIdx = S.farmPlots.findIndex(p=>!p.herb);
            if(emptyIdx===-1) return toast('Tất cả 6 ô linh điền đều đang có cây trồng, hãy thu hoạch bớt!');
            S.gold-=price;
            S.farmPlots[emptyIdx]={id:emptyIdx, herb:name, progress:100, ready:true, icon:icon};
            save(); updateHUD(); openPanel('farm');
            toast(`🌱 Đã gieo ${name} vào ô ${emptyIdx+1}!`);
            sfx('breakthrough');
          };
        });
      },0);

    }else if(kind==='healing'){
      title='💧 Suối Nước Nóng Tiên Linh · Tiên Tuyền Tẩy Lễ';
      html=`
        <div class="card">
          <div class="slot">
            <div class="icon" style="font-size:32px;background:radial-gradient(circle,#0284c7,#082f49);">💧</div>
            <div>
              <b style="color:#7dd3fc;font-size:16px;">Tiên Tuyền Tẩy Lễ Trị Liệu</b><br>
              <span style="color:#a7f3d0">Suối nước nóng tích tụ linh khí thiên địa của Thanh Vân Thôn</span>
            </div>
          </div>
          <div class="stat" style="margin-top:10px;">
            <span>Khí Huyết (HP) hiện tại:</span>
            <b style="color:#ff8888;">${Math.round(S.hp)} / ${S.maxHp}</b>
          </div>
          <div class="stat">
            <span>Pháp Lực (MP) hiện tại:</span>
            <b style="color:#7dd3fc;">${Math.round(S.mp)} / ${S.maxMp}</b>
          </div>
          <div class="stat">
            <span>Hiệu ứng Tẩy Lễ:</span>
            <b style="color:#ffd700;">Hồi 100% HP & MP + Nhận Buff Tiên Khí (+15% HP, +10% Sát Thương)</b>
          </div>
          <button id="btnHealFullSpring" class="btn-use" style="margin-top:12px;font-size:14px;padding:12px;">
            ✨ Ngâm Mình Tiên Tuyền (Hồi Phục Toàn Diện)
          </button>
        </div>
        <div class="card" style="margin-top:10px;">
          <b>🌸 Phúc Lợi Tiên Linh Tuyền:</b>
          <p>Mỗi khi bị trọng thương hoặc cạn kiệt pháp lực sau các trận đại chiến với Ma Lang & Ma Viên ngoại vi, đạo hữu chỉ cần trở về thôn ngâm mình để phục hồi hoàn toàn trạng thái đỉnh phong!</p>
        </div>
      `;

      setTimeout(()=>{
        let hBtn=$('#btnHealFullSpring');
        if(hBtn)hBtn.onclick=()=>{
          S.hp=S.maxHp;
          S.mp=S.maxMp;
          save(); updateHUD(); openPanel('healing');
          burst(player.x, player.z, '#38bdf8', 40, 8);
          toast('💧 Tiên Tuyền Tẩy Lễ: Khí Huyết & Pháp Lực phục hồi 100%! Nhận hào quang Tiên Khí!');
          sfx('breakthrough');
        };
      },0);

    }else if(kind==='crafting'||kind==='formations'){
      title='⚗️ Đan Phòng Tiên Giới · Lò Bát Quái Luyện Đan & Chế Phù';
      const alchemyRecipes = [
        {
          name:'Hồi Khí Đan',
          icon:'<img src="assets/ui/items/item_dan_duoc.png" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML=\'🔴\'">',
          desc:'Hồi phục 100% Khí Huyết (HP) và Pháp Lực (MP) tức thời.',
          mats:[{name:'Linh Thảo', req:2}, {name:'Hoàng Tinh', req:1}]
        },
        {
          name:'Bồi Nguyên Đan',
          icon:'<img src="assets/ui/items/item_ngu_hanh.png" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML=\'💊\'">',
          desc:'Đột tăng vĩnh viễn +500 Điểm Tu Vi tu luyện.',
          mats:[{name:'Hoàng Tinh', req:2}, {name:'Tử Diệp Chi', req:1}]
        },
        {
          name:'Tẩy Tủy Đan',
          icon:'<img src="assets/ui/items/item_ho_lo.png" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML=\'🧪\'">',
          desc:'Tẩy kinh phạt tủy, tăng vĩnh viễn +60 HP và +20 MP Max.',
          mats:[{name:'Linh Thảo', req:3}, {name:'Tử Diệp Chi', req:2}]
        },
        {
          name:'Trúc Cơ Đan',
          icon:'<img src="assets/ui/items/item_phap_bao_attack.png" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML=\'❄️\'">',
          desc:'Luyện hóa linh dịch cực hàn, tăng +1,500 Tu Vi và trợ lực Đột Phá.',
          mats:[{name:'Băng Tâm Thảo', req:2}, {name:'Tử Diệp Chi', req:2}]
        },
        {
          name:'Kim Đan Hoàn',
          icon:'<img src="assets/ui/items/item_quy_bao.png" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML=\'🌟\'">',
          desc:'Thần đan vô giá, tăng vĩnh viễn +5% Mọi Loại Sát Thương và +3,000 Tu Vi.',
          mats:[{name:'Cửu Diệp Chi', req:1}, {name:'Băng Tâm Thảo', req:2}]
        },
        {
          name:'Kim Cương Hộ Thân Phù',
          icon:'<img src="assets/ui/items/item_phu.png" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML=\'🛡️\'">',
          desc:'Bùa hộ thân kim cương, tăng vĩnh viễn +30 Phòng Thủ Vật Lý.',
          mats:[{name:'Linh Thảo', req:2}, {name:'Quặng Linh Thiết', req:2}]
        },
        {
          name:'Thần Hành Phù',
          icon:'<img src="assets/ui/items/item_tran_phap.png" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML=\'⚡\'">',
          desc:'Phù lục phong hành, tăng vĩnh viễn +0.3 m/s Tốc Độ Di Chuyển.',
          mats:[{name:'Linh Thảo', req:2}, {name:'Đá Tinh Luyện', req:1}]
        }
      ];

      html=`
        <div class="card" style="margin-bottom:8px">
          <b>⚗️ Lò Bát Quái Tiên Lửa:</b>
          <p>Sử dụng dược thảo thu hoạch từ Linh Dược Viên và khoáng thạch để luyện chế Đan Dược & Phù Lục thượng thừa!</p>
        </div>
        <div class="cards">
          ${alchemyRecipes.map(rec=>{
            let canCraft = rec.mats.every(m => (S.items && S.items[m.name] >= m.req));
            let matText = rec.mats.map(m => {
              let cur = (S.items && S.items[m.name]) || 0;
              let col = cur >= m.req ? '#7ee7a9' : '#ff8888';
              return `${m.name}: <b style="color:${col}">${cur}/${m.req}</b>`;
            }).join(' · ');

            return `<div class="card">
              <div class="slot">
                <div class="icon">${rec.icon}</div>
                <div>
                  <b style="color:#ffd700;font-size:13px;">${rec.name}</b><br>
                  <small style="color:#9fe2bf">${rec.desc}</small>
                </div>
              </div>
              <div style="font-size:11px;margin:6px 0;color:#ffefa8;">
                🧪 Nguyên liệu cần: ${matText}
              </div>
              <button data-craft-pill="${rec.name}" class="${canCraft?'btn-use':''}" ${canCraft?'':'disabled'}>
                ${canCraft?'🔥 Khai Lò Luyện Chế':'Thiếu Nguyên Liệu'}
              </button>
            </div>`;
          }).join('')}
        </div>
        <div class="card" style="margin-top:10px;">
          <b>🌿 Cần Thêm Dược Thảo?</b>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button id="btnGoToFarmFromCraft" style="flex:1;">🌿 Đến Linh Dược Viên Trồng Thêm</button>
            <button id="btnGoToShopFromCraft" style="flex:1;">🏪 Đến Tiên Phường Mua Nguyên Liệu</button>
          </div>
        </div>
      `;

      setTimeout(()=>{
        $$('[data-craft-pill]').forEach(b=>{
          b.onclick=()=>{
            let pillName = b.dataset.craftPill;
            let rec = alchemyRecipes.find(r=>r.name===pillName);
            if(!rec) return;
            let canCraft = rec.mats.every(m => (S.items && S.items[m.name] >= m.req));
            if(!canCraft) return toast('Không đủ nguyên liệu để luyện chế!');
            rec.mats.forEach(m => {
              S.items[m.name] -= m.req;
              if(S.items[m.name] <= 0) delete S.items[m.name];
            });
            addItem(pillName, 1);
            save(); updateHUD(); openPanel('crafting');
            burst(player.x, player.z, '#f59e0b', 35, 7);
            toast(`🔥 Đan Khí Nồng Nặc: Luyện chế thành công [${pillName}]!`);
            sfx('breakthrough');
          };
        });

        let farmBtn = $('#btnGoToFarmFromCraft');
        if(farmBtn) farmBtn.onclick=()=>openPanel('farm');
        let shopBtn = $('#btnGoToShopFromCraft');
        if(shopBtn) shopBtn.onclick=()=>openPanel('shop');
      },0);

    }else if(kind==='shop'){
      title='🏪 Tiên Phường Vạn Bảo · Mua & Bán Vật Phẩm';
      let shopTab = S._shopTab || 'buy';

      const shopItems=[
        {name:'Hồi Khí Đan',price:100,icon:'🔴',desc:'Hồi 100% HP & MP lập tức'},
        {name:'Tẩy Tủy Đan',price:300,icon:'🧪',desc:'Tăng vĩnh viễn +60 HP, +20 MP'},
        {name:'Bồi Nguyên Đan',price:400,icon:'💊',desc:'Tăng vĩnh viễn +500 Điểm Tu Vi'},
        {name:'Linh Thạch Thượng Phẩm',price:250,icon:'💎',desc:'Tăng Tu Vi & Vàng'},
        {name:'Quặng Linh Thiết',price:150,icon:'⛏️',desc:'Nguyên liệu rèn đúc trang bị'},
        {name:'Đá Tinh Luyện',price:200,icon:'🔷',desc:'Dùng tẩy luyện & cường hóa'},
        {name:'Linh Thảo',price:50,icon:'🌿',desc:'Dược liệu luyện đan'},
        {name:'Hoàng Tinh',price:100,icon:'🍂',desc:'Dược liệu luyện đan'},
        {name:'Tử Diệp Chi',price:180,icon:'🌸',desc:'Linh chi quý hiếm'},
        {name:'Băng Tâm Thảo',price:280,icon:'❄️',desc:'Linh thảo cực hàn'},
        {name:'Thanh Vân Kiếm',price:800,icon:'⚔️',desc:'Vũ khí Hiếm (+20 Sát Thương)'},
        {name:'Huyền Thiết Giáp',price:900,icon:'🛡️',desc:'Giáp Hiếm (+150 HP, +5 Thủ)'}
      ];

      let sellableItems = Object.entries(S.items||{}).filter(([,q])=>q>0);

      html=`
        <div class="card" style="margin-bottom:8px">
          <b>Tiền Tệ Của Bạn: 🪙 <span style="color:#ffd700">${Math.floor(S.gold||0).toLocaleString()} Vàng</span></b>
        </div>
        <div class="skill-tabs" style="margin-bottom:8px">
          <button class="shop-tab-btn ${shopTab==='buy'?'active':''}" data-shop-tab="buy">🏪 Cửa Hàng Mua Vật Phẩm</button>
          <button class="shop-tab-btn ${shopTab==='sell'?'active':''}" data-shop-tab="sell">💰 Thu Mua & Bán Đồ (${sellableItems.length})</button>
        </div>
      `;

      if(shopTab==='buy'){
        html+=`<div class="cards">${shopItems.map(it=>`
          <div class="card">
            <div class="slot">
              <div class="icon">${it.icon}</div>
              <div>
                <b style="color:#fff3a8">${it.name}</b><br>
                <small style="color:#9fe2bf">${it.desc}</small>
              </div>
            </div>
            <div class="stat"><span>Giá bán:</span><b>🪙 ${it.price} Vàng</b></div>
            <button data-buy="${it.name}" data-price="${it.price}" ${(S.gold||0)>=it.price?'':'disabled'}>
              Mua Ngay
            </button>
          </div>
        `).join('')}</div>`;
      }else{
        html+=`<div class="cards">${sellableItems.length?sellableItems.map(([n,q])=>{
          let sellPrice = n.includes('Kiếm')||n.includes('Giáp')?350:n.includes('Đan')?80:n.includes('Thảo')||n.includes('Chi')||n.includes('Tinh')?40:50;
          return `<div class="card">
            <div class="slot">
              <div class="icon">📦</div>
              <div>
                <b style="color:#fff3a8">${n}</b><br>
                <small style="color:#9fe2bf">Đang có: <b>${q}</b> món</small>
              </div>
            </div>
            <div class="stat"><span>Giá thu mua:</span><b>🪙 +${sellPrice} Vàng / món</b></div>
            <div style="display:flex;gap:4px;margin-top:6px;">
              <button data-sell-item="${n}" data-sell-price="${sellPrice}" data-sell-qty="1" style="flex:1;">Bán 1</button>
              ${q>1?`<button data-sell-item="${n}" data-sell-price="${sellPrice}" data-sell-qty="${q}" style="flex:1;background:linear-gradient(180deg,#552020,#2b0f0f);">Bán Hết (${q})</button>`:''}
            </div>
          </div>`;
        }).join(''):'<div class="card"><p style="text-align:center;color:#8fa7b3;padding:12px 0;">Không có vật phẩm nào để bán</p></div>'}</div>`;
      }

      setTimeout(()=>{
        $$('.shop-tab-btn').forEach(b=>{
          b.onclick=()=>{
            S._shopTab=b.dataset.shopTab;
            openPanel('shop');
          };
        });

        $$('[data-buy]').forEach(b=>{
          b.onclick=()=>{
            let p=+b.dataset.price;
            let itName=b.dataset.buy;
            if(S.gold<p)return toast('Không đủ vàng');
            S.gold-=p;
            if(itName.includes('Linh Thiết')) S.spiritIron=(S.spiritIron||0)+1;
            else if(itName.includes('Đá Tinh Luyện')) S.refineStone=(S.refineStone||0)+1;
            else addItem(itName,1);
            save(); updateHUD(); openPanel('shop');
            toast('✨ Đã mua thành công '+itName);
            sfx('item');
          };
        });

        $$('[data-sell-item]').forEach(b=>{
          b.onclick=()=>{
            let name=b.dataset.sellItem;
            let price=+b.dataset.sellPrice;
            let qty=+b.dataset.sellQty;
            if(!S.items||!S.items[name]||S.items[name]<qty) return toast('Không đủ số lượng');
            S.items[name]-=qty;
            if(S.items[name]<=0) delete S.items[name];
            let gainGold = price * qty;
            S.gold=(S.gold||0)+gainGold;
            save(); updateHUD(); openPanel('shop');
            toast(`💰 Đã bán ${qty}x ${name}, thu về +${gainGold.toLocaleString()} Vàng!`);
            sfx('item');
          };
        });
      },0);

    }else if(kind==='daily'){
      title='🏛️ Thôn Trưởng Phủ · Phúc Lợi, Nhiệm Vụ & Cống Hiến';
      if(!S.dailyQuests) S.dailyQuests={killsClaimed:false,cultClaimed:false,craftClaimed:false,donated:0};

      let killsDone = (S.questKills || 0) >= 20;
      let cultDone = (S.cultivation || 0) >= 1000;
      let craftDone = (S.level || 1) >= 2;
      let donateLvl = Math.floor((S.dailyQuests.donated || 0) / 1000);

      html=`
        <div class="card">
          <b>🎁 Phúc Lợi Điểm Danh Tu Tiên Mỗi Ngày:</b>
          <p>Nhận ngay: 💎 50 Linh Thạch · 🪙 1,000 Vàng · 🔴 2 Hồi Khí Đan</p>
          <button id="dailyBtn" class="${S.daily?'':'btn-use'}" ${S.daily?'disabled':''}>${S.daily?'✓ Đã Nhận Hôm Nay':'Nhận Phúc Lợi Ngay'}</button>
        </div>
        <div class="card" style="margin-top:10px">
          <b>📜 Bảng Nhiệm Vụ Tu Chân Hàng Ngày:</b>
        </div>
        <div class="cards">
          <div class="card">
            <b>1. Trừ Yêu Ngoại Vi</b>
            <p>Tiến trình: <b>${Math.min(20,S.questKills||0)} / 20 Yêu thú</b></p>
            <p>Thưởng: 💎 50 Linh Thạch + 🪙 500 Vàng</p>
            <button id="btnClaimKills" ${killsDone&&!S.dailyQuests.killsClaimed?'':'disabled'}>
              ${S.dailyQuests.killsClaimed?'✓ Đã Nhận':killsDone?'Nhận Thưởng':'Chưa Hoàn Thành'}
            </button>
          </div>
          <div class="card">
            <b>2. Tĩnh Tâm Tọa Thiền</b>
            <p>Tiến trình: <b>${Math.min(1000,S.cultivation||0)} / 1,000 Tu Vi</b></p>
            <p>Thưởng: 🔴 2 Hồi Khí Đan + 💎 30 Linh Thạch</p>
            <button id="btnClaimCult" ${cultDone&&!S.dailyQuests.cultClaimed?'':'disabled'}>
              ${S.dailyQuests.cultClaimed?'✓ Đã Nhận':cultDone?'Nhận Thưởng':'Chưa Hoàn Thành'}
            </button>
          </div>
          <div class="card">
            <b>3. Nâng Cao Thực Lực</b>
            <p>Tiến trình: <b>Cấp độ Lv.${S.level}/2</b></p>
            <p>Thưởng: ⛏️ 5 Linh Thiết + 🔷 3 Đá Tinh Luyện</p>
            <button id="btnClaimCraft" ${craftDone&&!S.dailyQuests.craftClaimed?'':'disabled'}>
              ${S.dailyQuests.craftClaimed?'✓ Đã Nhận':craftDone?'Nhận Thưởng':'Chưa Hoàn Thành'}
            </button>
          </div>
        </div>
        <div class="card" style="margin-top:10px">
          <b>🏛️ Cống Hiến Xây Dựng Thôn Trang:</b>
          <p>Đóng góp Vàng & Linh Thạch giúp Thanh Vân Thôn hưng thịnh. Cấp Danh Tiếng: <b style="color:#ffd700">Cấp ${donateLvl+1} (Đã cống hiến: ${(S.dailyQuests.donated||0).toLocaleString()} Điểm)</b></p>
          <p>Buff Hộ Thôn: <b style="color:#7ee7a9">+${(donateLvl+1)*100} HP Max · +${(donateLvl+1)*10} Sát Thương</b></p>
          <button id="btnDonateVillage" ${(S.gold||0)>=500?'':'disabled'}>
            Cống Hiến 500 Vàng (+500 Điểm Cống Hiến)
          </button>
        </div>
      `;

      setTimeout(()=>{
        let dBtn=$('#dailyBtn');
        if(dBtn)dBtn.onclick=()=>{
          if(S.daily)return;
          S.daily=true;
          S.stones=(S.stones||0)+50;
          S.gold=(S.gold||0)+1000;
          addItem('Hồi Khí Đan',2);
          save(); updateHUD(); openPanel('daily');
          toast('🎁 Đã nhận quà Điểm Danh: +50 Linh Thạch, +1,000 Vàng, +2 Hồi Khí Đan!');
          sfx('breakthrough');
        };

        let bKills=$('#btnClaimKills');
        if(bKills)bKills.onclick=()=>{
          S.dailyQuests.killsClaimed=true;
          S.stones=(S.stones||0)+50;
          S.gold=(S.gold||0)+500;
          save(); updateHUD(); openPanel('daily');
          toast('🏆 Nhận thưởng Diệt Yêu: +50 Linh Thạch, +500 Vàng!');
          sfx('levelUp');
        };

        let bCult=$('#btnClaimCult');
        if(bCult)bCult.onclick=()=>{
          S.dailyQuests.cultClaimed=true;
          S.stones=(S.stones||0)+30;
          addItem('Hồi Khí Đan',2);
          save(); updateHUD(); openPanel('daily');
          toast('🏆 Nhận thưởng Tọa Thiền: +30 Linh Thạch, +2 Hồi Khí Đan!');
          sfx('levelUp');
        };

        let bCraft=$('#btnClaimCraft');
        if(bCraft)bCraft.onclick=()=>{
          S.dailyQuests.craftClaimed=true;
          S.spiritIron=(S.spiritIron||0)+5;
          S.refineStone=(S.refineStone||0)+3;
          save(); updateHUD(); openPanel('daily');
          toast('🏆 Nhận thưởng Nâng Cao Thực Lực: +5 Linh Thiết, +3 Đá Tinh Luyện!');
          sfx('levelUp');
        };

        let bDonate=$('#btnDonateVillage');
        if(bDonate)bDonate.onclick=()=>{
          if((S.gold||0)<500) return toast('Không đủ Vàng để cống hiến!');
          S.gold-=500;
          S.dailyQuests.donated=(S.dailyQuests.donated||0)+500;
          S.maxHp+=100;
          S.damage.physical=(S.damage.physical||0)+10;
          save(); updateHUD(); openPanel('daily');
          burst(player.x, player.z, '#ffd700', 30, 6);
          toast('🏛️ Cống hiến thành công! Danh tiếng thôn trang gia tăng, nhận buff vĩnh viễn!');
          sfx('breakthrough');
        };
      },0);

    }else if(kind==='pet'){
      title='🦊 Linh Thú Các · Cửu Vĩ Linh Hồ & Linh Thú Tiên Giai';
      let petLv = S.petLevel || 1;
      let petDmg = Math.round(50 + petLv * 25);
      let buffDmg = 8 + petLv * 1.5;
      let feedCost = petLv * 20;

      html=`
        <div class="card">
          <div class="slot">
            <div class="icon" style="font-size:32px">🦊</div>
            <div>
              <b style="color:#ffd700;font-size:15px">Cửu Vĩ Linh Hồ (Lv.${petLv}/15)</b><br>
              <span style="color:${S.pet?'#7ee7a9':'#ff8888'}">Trạng thái: <b>${S.pet?'Đang Xuất Chiến Trợ Trận':'Đang Thu Hồi Trong Linh Thú Các'}</b></span><br>
              <small style="color:#9fe2bf">Linh thú tiên giai trung thành hộ thể, phóng hỏa cầu thiêu đốt kẻ địch</small>
            </div>
          </div>
          <p style="margin-top:8px">
            🔥 Hỏa diễm tự động công kích: <b style="color:#ffe07a">${petDmg} Sát Thương Hỏa</b><br>
            ✨ Hào quang trợ chiến: <b style="color:#7ee7a9">+${buffDmg.toFixed(1)}% Tổng Sát Thương của chủ nhân</b><br>
            ⏱ Nhịp phun lửa: <b>${Math.max(0.8, (2.2 - petLv*0.09)).toFixed(1)} giây / lần</b>
          </p>
          <button id="petBtn" class="${S.pet?'':'btn-use'}" style="margin-top:6px">
            ${S.pet?'Thu Hồi Linh Thú':'Triệu Hồi Xuất Chiến Ngay'}
          </button>
        </div>
        <div class="card" style="margin-top:10px">
          <b>🥩 Bồi Dưỡng & Nâng Cấp Linh Thú:</b>
          <p>Cho Linh Hồ hấp thu Linh Thạch để thăng cấp, tăng uy lực hỏa diễm và buff thuộc tính.</p>
          <button id="btnFeedPet" ${(S.stones||0)>=feedCost&&petLv<15?'':'disabled'}>
            ${petLv>=15?'Đã Đạt Cực Hạn (Lv.15)':`Cho Ăn Linh Thạch (💎${feedCost} Linh Thạch)`}
          </button>
        </div>
      `;

      setTimeout(()=>{
        let pBtn=$('#petBtn');
        if(pBtn)pBtn.onclick=()=>{
          S.pet=!S.pet;
          syncPet();
          save(); updateHUD(); openPanel('pet');
          toast(S.pet?'🦊 Cửu Vĩ Linh Hồ xuất chiến trợ trận!':'Đã thu hồi Linh Hồ');
          sfx(S.pet?'breakthrough':'item');
        };

        let fBtn=$('#btnFeedPet');
        if(fBtn)fBtn.onclick=()=>{
          if((S.stones||0)<feedCost) return toast('Không đủ Linh Thạch!');
          S.stones-=feedCost;
          S.petLevel=(S.petLevel||1)+1;
          save(); updateHUD(); openPanel('pet');
          burst(player.x, player.z, '#fb923c', 30, 6);
          toast('✨ Cửu Vĩ Linh Hồ đã tăng lên Cấp '+(S.petLevel)+'! Uy lực tăng vọt!');
          sfx('levelUp');
        };
      },0);

    }else if(kind==='map'){
      title='🗺️ Truyền Tống Trận · Cửu Châu Tiên Vực';
      html=renderWorldMapCards();
      setTimeout(()=>$$('[data-region]').forEach(b=>b.onclick=async()=>{
        S.region=+b.dataset.region; S.regionId=(regions[S.region]||DEFAULT_REGION).id;
        actors.forEach(a=>a.mesh&&a.mesh.dispose());
        actors=[];
        boss=null;
        if($('#bossBar')) $('#bossBar').hidden=true;
        player.x=0;player.z=2;
        await loadMap(S.region);
        initializeFixedEnemies();
        initializeAlliedNpcs();
        save();
        closePanel();
        toast('🗺 Đã đến '+region().name);
        sfx('levelUp');
        updateHUD();
      }),0);

    }else{
      title='⚙️ Cài Đặt & Hiệu Năng';
      const qp=window.PerformanceProfile;
      const currentQuality=qp?qp.name:'MEDIUM';
      const qualityLabel={LOW:'Low · 1.5×',MEDIUM:'Medium · 2.25×',HIGH:'High · 3.0×'}[currentQuality]||currentQuality;
      html=`<div class="card"><b>Chất lượng đồ họa</b><p>Đang dùng: <strong>${qualityLabel}</strong></p><div class="qualityModes"><button data-quality="LOW" ${currentQuality==='LOW'?'disabled':''}>LOW · 1.5×</button><button data-quality="MEDIUM" ${currentQuality==='MEDIUM'?'disabled':''}>MEDIUM · 2.25×</button><button data-quality="HIGH" ${currentQuality==='HIGH'?'disabled':''}>HIGH · 3.0×</button></div><p><small>High nét nhất nhưng dùng GPU và pin nhiều hơn.</small></p><button id="resetBtn" class="danger">Xóa dữ liệu chơi lại từ đầu</button></div>`;
      setTimeout(()=>{
        $('[data-quality]').forEach(btn=>btn.onclick=()=>{
          const next=btn.dataset.quality;
          if(window.PerformanceProfile)window.PerformanceProfile.set(next);
          S.quality=next;
          if(S.settings)S.settings.quality=next;
          applyEngineScaling();
          save();
          openPanel('settings');
          toast('🖥 Đồ họa: '+next);
        });
        $('#resetBtn').onclick=()=>{
          if(confirm('Bạn có chắc chắn muốn xóa toàn bộ tiến trình tu tiên?')){
            localStorage.removeItem(SAVE);
            location.reload();
          }
        };
      },0);
    }
  }catch(err){
    console.error('Lỗi khi mở panel:', err);
    html=`<div class="card"><p>Không thể tải dữ liệu: ${err.message}</p></div>`;
  }

  $('#panelTitle').textContent=title;
  $('#panelBody').innerHTML=html;
}

function applyEngineScaling(){
  if(!engine)return;
  // VISUAL BASELINE: exact render density used before architecture optimization.
  // Keep this independent from PerformanceProfile so gameplay/performance state
  // cannot silently change the physical canvas resolution while moving.
  let dpr=Math.min(window.devicePixelRatio||1, MOBILE_RUNTIME?1.5:2.0);
  let scale=1.0/dpr;
  engine.setHardwareScalingLevel(scale);
}

function equipBest(slot){
  let items=S.items||{};
  let key=Object.keys(items).find(n=>slot==='weapon'?n.includes('Kiếm'):slot==='armor'?n.includes('Giáp')||n.includes('Bào'):n.includes('Giới'));
  if(!key)return toast('Không có trang bị phù hợp trong túi');
  if(!S.equipment)S.equipment={};
  S.equipment[slot]=key;
  if(slot==='weapon'){
    S.damage.physical=(S.damage.physical||0)+20;
  }else if(slot==='armor'){
    S.maxHp+=150;
    S.defense.physical=(S.defense.physical||0)+5;
    for(const t of ['Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi'])S.defense[t]=(S.defense[t]||0)+2;
  }else{
    S.critChance=(S.critChance||0)+.03;
    S.spiritSense+=12;
  }
  save();
  updateHUD();
  openPanel('equipment');
  toast('Đã trang bị '+key);
  sfx('item');
}

function closePanel(){
  if(!inVillageTown) paused=false;
  const p = $('#panel');
  if(p){
    p.hidden=true;
    p.style.display='none';
  }
}

async function init(){
  progress(5,'Đang đọc danh mục tiên vực…');
  await loadMapManifest();

  progress(10,'Khởi tạo Babylon.js Engine…');
  engine=new BABYLON.Engine(canvas,true,{
    preserveDrawingBuffer:false,
    stencil:false,
    antialias:!MOBILE_RUNTIME,
    powerPreference:'high-performance',
    adaptToDeviceRatio:true
  });
  applyEngineScaling();

  progress(30,'Dựng không gian tiên cảnh…');
  await createWorld();

  progress(50,'Nạp tiên thể và linh thú…');
  preloadPlayerMaterials();
  preloadNpc1Materials();
  createPlayer();
  // Enemy texture lazy-load theo loại quái thực tế xuất hiện
  await new Promise(r=>setTimeout(r,MOBILE_RUNTIME?60:100));

  progress(75,'Khai mở trận pháp & yêu vực…');
  initializeFixedEnemies();
  initializeAlliedNpcs();
  setupInput();
  updateHUD();
  drawMini();

  progress(100,'Tiên đồ đã mở!');
  startBtn.hidden=false;
  loadMsg.textContent='Chạm để bước vào tiên đồ';

  startBtn.onclick=()=>{
    getAudio();
    loading.remove();
    hud.hidden=false;
    gameStarted=true;
    last=performance.now();
    player.x=0;
    player.z=0;
    if(player.mesh)player.mesh.position.set(0,1.62,0);
    if(player.shadow)player.shadow.position.set(0,0.019,0);
    if(camera){
      placeStandardCamera(0,0);
    }
    if(petActor){
      petActor.x=-1.5; petActor.z=-1.5;
      if(petActor.mesh)petActor.mesh.position.set(-1.5,petActor.mesh.position.y,-1.5);
      if(petActor.shadow)petActor.shadow.position.set(-1.5,0.019,-1.5);
    }
    toast('☯ Chào mừng đạo hữu đến '+region().name);
    sfx('breakthrough');
    save();
  };

  if(window.GameLifecycle)window.GameLifecycle.bind({
    canvas,getEngine:()=>engine,
    pause:()=>{paused=true;if(audioCtx&&audioCtx.state==='running')audioCtx.suspend().catch(()=>{});},
    resume:()=>{paused=false;last=performance.now();},
    onResize:updateOrthoCameraBounds
  });
  if(window.GameEvents)window.GameEvents.on('qualityChanged',()=>{applyEngineScaling();engine.resize();updateOrthoCameraBounds();});
  engine.runRenderLoop(tick);
  if('serviceWorker'in navigator){
    navigator.serviceWorker.addEventListener('message',event=>{
      if(!event.data||event.data.type!=='BUILD_ACTIVE')return;
      const previous=localStorage.getItem('tutien_last_build');
      localStorage.setItem('tutien_last_build',event.data.build);
      if(previous&&previous!==event.data.build){save(true);toast('✨ Đã cập nhật bản GAME mới. Bản mới dùng khi tải lại trang.');}
    });
    navigator.serviceWorker.register('./sw.js?v=20260918-enemy-camps-minimap-v6.4').then(reg=>reg.update()).catch(()=>{});
  }
}

init().catch(e=>{
  console.error(e);
  loadMsg.textContent='Lỗi khởi tạo: '+e.message;
  startBtn.hidden=true;
});
})();

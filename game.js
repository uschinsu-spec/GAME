(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#renderCanvas'), loading=$('#loading'), loadMsg=$('#loadMsg'), loadBar=$('#loadBar'), startBtn=$('#startBtn'), hud=$('#hud');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rnd=(a,b)=>a+Math.random()*(b-a), dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const SAVE='tutien_chilo_save_v2';

// Web Audio API Synthesizer (Zero External Dependencies)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getAudio(){
  if(!audioCtx){try{audioCtx=new AudioContext()}catch(e){}}
  if(audioCtx&&audioCtx.state==='suspended'){audioCtx.resume()}
  return audioCtx;
}
function sfx(type){
  try{
    const ctx=getAudio();if(!ctx)return;
    const now=ctx.currentTime;
    if(type==='slash'){
      const osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='sawtooth';
      osc.frequency.setValueAtTime(460,now);
      osc.frequency.exponentialRampToValueAtTime(90,now+0.12);
      g.gain.setValueAtTime(0.22,now);
      g.gain.linearRampToValueAtTime(0.01,now+0.12);
      osc.connect(g);g.connect(ctx.destination);
      osc.start(now);osc.stop(now+0.12);
    }else if(type==='hit'){
      const osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='triangle';
      osc.frequency.setValueAtTime(150,now);
      osc.frequency.exponentialRampToValueAtTime(35,now+0.1);
      g.gain.setValueAtTime(0.28,now);
      g.gain.linearRampToValueAtTime(0.01,now+0.1);
      osc.connect(g);g.connect(ctx.destination);
      osc.start(now);osc.stop(now+0.1);
    }else if(type==='skill1'){
      const osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='square';
      osc.frequency.setValueAtTime(580,now);
      osc.frequency.exponentialRampToValueAtTime(180,now+0.18);
      g.gain.setValueAtTime(0.18,now);
      g.gain.linearRampToValueAtTime(0.01,now+0.18);
      osc.connect(g);g.connect(ctx.destination);
      osc.start(now);osc.stop(now+0.18);
    }else if(type==='skill2'){
      const osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(260,now);
      osc.frequency.exponentialRampToValueAtTime(740,now+0.32);
      g.gain.setValueAtTime(0.25,now);
      g.gain.linearRampToValueAtTime(0.01,now+0.32);
      osc.connect(g);g.connect(ctx.destination);
      osc.start(now);osc.stop(now+0.32);
    }else if(type==='skill3'){
      const osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='sawtooth';
      osc.frequency.setValueAtTime(240,now);
      osc.frequency.linearRampToValueAtTime(55,now+0.36);
      g.gain.setValueAtTime(0.3,now);
      g.gain.linearRampToValueAtTime(0.01,now+0.36);
      osc.connect(g);g.connect(ctx.destination);
      osc.start(now);osc.stop(now+0.36);
    }else if(type==='skill4'){
      [392, 523, 659, 784].forEach((f,i)=>{
        const osc=ctx.createOscillator(),g=ctx.createGain();
        osc.type='sine';
        osc.frequency.setValueAtTime(f,now+i*0.07);
        g.gain.setValueAtTime(0.2,now+i*0.07);
        g.gain.linearRampToValueAtTime(0.01,now+i*0.07+0.45);
        osc.connect(g);g.connect(ctx.destination);
        osc.start(now+i*0.07);osc.stop(now+i*0.07+0.45);
      });
    }else if(type==='dash'){
      const osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='triangle';
      osc.frequency.setValueAtTime(380,now);
      osc.frequency.exponentialRampToValueAtTime(80,now+0.15);
      g.gain.setValueAtTime(0.22,now);
      g.gain.linearRampToValueAtTime(0.01,now+0.15);
      osc.connect(g);g.connect(ctx.destination);
      osc.start(now);osc.stop(now+0.15);
    }else if(type==='levelUp'){
      [523, 659, 784, 1046].forEach((f,i)=>{
        const osc=ctx.createOscillator(),g=ctx.createGain();
        osc.type='triangle';
        osc.frequency.setValueAtTime(f,now+i*0.09);
        g.gain.setValueAtTime(0.25,now+i*0.09);
        g.gain.linearRampToValueAtTime(0.01,now+i*0.09+0.35);
        osc.connect(g);g.connect(ctx.destination);
        osc.start(now+i*0.09);osc.stop(now+i*0.09+0.35);
      });
    }else if(type==='breakthrough'){
      [261, 329, 392, 523, 659, 784, 1046].forEach((f,i)=>{
        const osc=ctx.createOscillator(),g=ctx.createGain();
        osc.type='sine';
        osc.frequency.setValueAtTime(f,now+i*0.08);
        g.gain.setValueAtTime(0.3,now+i*0.08);
        g.gain.linearRampToValueAtTime(0.01,now+i*0.08+0.55);
        osc.connect(g);g.connect(ctx.destination);
        osc.start(now+i*0.08);osc.stop(now+i*0.08+0.55);
      });
    }else if(type==='item'){
      const osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(880,now);
      osc.frequency.setValueAtTime(1320,now+0.07);
      g.gain.setValueAtTime(0.18,now);
      g.gain.linearRampToValueAtTime(0.01,now+0.2);
      osc.connect(g);g.connect(ctx.destination);
      osc.start(now);osc.stop(now+0.2);
    }
  }catch(e){}
}

const realms=['Luyện Khí','Trúc Cơ','Kết Đan','Nguyên Anh','Hóa Thần'];
const periods=['Sơ Kỳ','Trung Kỳ','Hậu Kỳ','Đỉnh Phong'];

// ===== CẢNH GIỚI + ÁP CHẾ CẢNH GIỚI =====
// Stat nền chỉ tăng vừa phải. Chênh lệch thật sự đến từ "áp chế cảnh giới".
const REALM_BASE_POWER=[1,2.5,6,15,36];
const REALM_MINOR_MULT=1.25;
const QI_STAGE_MULT=1.08;

// Áp chế: chênh mỗi tiểu cảnh giới tăng lợi thế 35%.
// Mỗi đại cảnh giới chênh thêm hệ số 1.75.
// Giới hạn để combat không vỡ số nhưng vẫn tạo cảm giác "trời với đất".
const SUPPRESS_MINOR_MULT=1.35;
const SUPPRESS_MAJOR_MULT=1.75;
const SUPPRESS_MAX=12;

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

function getPlayerRealmScore(){
  if((S.realm||0)===0)return clamp((S.realmStage||1)-1,0,11);
  return 12+(Math.max(1,S.realm)-1)*4+clamp(S.period||0,0,3);
}

function getPlayerMajorRealmIndex(){
  return clamp(S.realm||0,0,realms.length-1);
}

// Quái hiện dùng level, nên quy đổi level -> bậc tu luyện để hệ áp chế hoạt động ngay.
// 1-12 = Luyện Khí 1-12; sau đó mỗi 12 level xấp xỉ 1 đại cảnh giới,
// và chia thành 4 tiểu cảnh giới trong đại cảnh giới đó.
function getEnemyRealmInfo(enemyLv=1){
  const lv=Math.max(1,Math.round(enemyLv||1));
  if(lv<=12)return {major:0,minor:lv-1,score:lv-1};
  const major=clamp(1+Math.floor((lv-13)/28),1,realms.length-1);
  const local=(lv-13)%28;
  const period=clamp(Math.floor(local/7),0,3);
  return {major,minor:period,score:12+(major-1)*4+period};
}

function getRealmSuppressionByScores(attackerScore,attackerMajor,defenderScore,defenderMajor){
  const diff=attackerScore-defenderScore;
  if(diff<=0)return 1;
  const majorDiff=Math.max(0,attackerMajor-defenderMajor);
  const minorFactor=Math.pow(SUPPRESS_MINOR_MULT,diff);
  const majorFactor=Math.pow(SUPPRESS_MAJOR_MULT,majorDiff);
  return Math.min(SUPPRESS_MAX,minorFactor*majorFactor);
}

function getPlayerSuppressionVsActor(actor){
  if(!actor)return 1;
  const info=actor.realmInfo||getEnemyRealmInfo(actor.enemyLv||1);
  return getRealmSuppressionByScores(
    getPlayerRealmScore(),getPlayerMajorRealmIndex(),
    info.score,info.major
  );
}

function getActorSuppressionVsPlayer(actor){
  if(!actor)return 1;
  const info=actor.realmInfo||getEnemyRealmInfo(actor.enemyLv||1);
  return getRealmSuppressionByScores(
    info.score,info.major,
    getPlayerRealmScore(),getPlayerMajorRealmIndex()
  );
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
const regions=[
  // Cấp 1-12: Thanh Vân Thôn — ngoại ô bình yên, thú nhỏ
  {id:'thanh_van_thon',name:'Thanh Vân Thôn',kind:'Thôn',min:1,max:12,color:'#668071',enemy:['boar','archer']},
  // Cấp 8-20: Linh Sơn Ngoại Vi — rừng núi hoang dã
  {id:'linh_son_ngoai_vi',name:'Linh Sơn Ngoại Vi',kind:'Man Hoang',min:8,max:20,color:'#536f58',enemy:['boar','tiger','bandit']},
  // Cấp 15-30: Bạch Ngọc Thành — đạo tặc thành thị
  {id:'bach_ngoc_thanh',name:'Bạch Ngọc Thành',kind:'Thành',min:15,max:30,color:'#72756b',enemy:['bandit','archer','skeleton']},
  // Cấp 25-45: Thanh Vân Tông — cấm khu môn phái
  {id:'thanh_van_tong',name:'Thanh Vân Tông',kind:'Tông Môn',min:25,max:45,color:'#4f6d76',enemy:['skeleton','archer','bandit']},
  // Cấp 40-65: Vạn Dặm Sa Mạc — mãnh thú hoang mạc
  {id:'van_dam_sa_mac',name:'Vạn Dặm Sa Mạc',kind:'Man Hoang',min:40,max:65,color:'#88765d',enemy:['tiger','bandit','skeleton']},
  // Cấp 60-90: Yêu Vực — yêu khí nồng nặc
  {id:'yeu_vuc',name:'Yêu Vực',kind:'Man Hoang',min:60,max:90,color:'#5b4b62',enemy:['undead','ice_wolf','skeleton']},
  // Cấp 85-120: Cấm Địa Hàn Uyên — băng giá tử địa
  {id:'cam_dia_han_uyen',name:'Cấm Địa Hàn Uyên',kind:'Cấm Địa',min:85,max:120,color:'#4b6873',enemy:['ice_wolf','undead']},
  // Cấp 110-160: Ma Vực — địa ngục đáy sâu
  {id:'ma_vuc',name:'Ma Vực',kind:'Cấm Địa',min:110,max:160,color:'#5d4248',enemy:['undead','ice_wolf','skeleton']}
];

// Bản đồ thế giới mở rộng 100 lần (1000m x 1000m = 1.000.000 m²)
const MAP_SIZE = 1000;
const MAP_HALF = MAP_SIZE / 2; // 500
const MAP_BOUND = MAP_HALF - 15; // 485
const RADAR_RANGE = 75; // Bán kính quét Radar minimap (mét)

// Cấu trúc cấu hình tài nguyên bản đồ (Map Asset Configurations)
// Mỗi bản đồ có thư mục riêng, asset cây cối, đá, phụ kiện, mặt đất được phân tách rõ ràng
const MAP_CONFIGS={
  thanh_van_thon:{
    id:'thanh_van_thon',
    name:'Thanh Vân Thôn',
    folder:'assets/maps/common',
    clearColor:'#698679',
    fogColor:'#698679',
    fogStart:45,
    fogEnd:95,
    groundTexture:'assets/maps/common/grounds/ground_village_01.png',
    groundScale:80,
    river:{enabled:false},
    trees:[
      {file:'assets/maps/common/trees/tree_01.png',width:4.8,height:5.8,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_02.png',width:4.6,height:5.6,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_03.png',width:4.4,height:5.4,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_sakura_01.png',width:4.8,height:6.0,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_pine_01.png',width:4.2,height:5.8,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_autumn_01.png',width:4.4,height:5.6,yRatio:0.36}
    ],
    rocks:[
      {file:'assets/maps/common/rocks/rock_01.png',width:3.2,height:3.0,yRatio:0.38},
      {file:'assets/maps/common/rocks/rock_02.png',width:2.8,height:2.8,yRatio:0.38},
      {file:'assets/maps/common/rocks/rock_03.png',width:2.6,height:3.2,yRatio:0.38},
      {file:'assets/maps/common/rocks/rock_04.png',width:3.6,height:4.2,yRatio:0.36},
      {file:'assets/maps/common/rocks/rock_05.png',width:3.2,height:3.4,yRatio:0.38},
      {file:'assets/maps/common/rocks/rock_cliff_cluster_01.png',width:4.0,height:3.8,yRatio:0.38},
      {file:'assets/maps/common/rocks/rock_large_vine_01.png',width:3.8,height:4.0,yRatio:0.38}
    ],
    decor:[
      {file:'assets/maps/common/lanterns/lantern_post_village_01.png',width:2.2,height:3.2,yRatio:0.46},
      {file:'assets/maps/common/plants/grass_mixed_01.png',width:1.8,height:1.8,yRatio:0.36},
      {file:'assets/maps/common/plants/grass_tall_01.png',width:1.6,height:2.2,yRatio:0.36},
      {file:'assets/maps/common/plants/bush_rose_01.png',width:2.2,height:2.2,yRatio:0.36},
      {file:'assets/maps/common/plants/bush_ivy_01.png',width:2.0,height:2.0,yRatio:0.36},
      {file:'assets/maps/common/plants/flower_pink_01.png',width:1.9,height:1.9,yRatio:0.36},
      {file:'assets/maps/common/plants/flower_purple_01.png',width:1.9,height:1.9,yRatio:0.36},
      {file:'assets/maps/common/plants/bush_berry_01.png',width:2.0,height:1.8,yRatio:0.36},
      {file:'assets/maps/common/plants/grass_flower_01.png',width:1.8,height:1.6,yRatio:0.36}
    ],
    // Trung tâm thôn — sử dụng hoàn toàn common assets
    villageProps:[
      // ── QUẢNG TRƯỜNG TRUNG TÂM ──
      {file:'assets/maps/common/signs/sign_stone_yinyang_01.png',width:2.4,height:3.2,x:0,z:-8,yRatio:0.40},
      {file:'assets/maps/common/props/well_01.png',width:2.6,height:2.8,x:0,z:0,yRatio:0.42},
      {file:'assets/maps/common/buildings/shrine_small_01.png',width:2.5,height:3.0,x:-9,z:8,yRatio:0.42},
      {file:'assets/maps/common/props/cart_wood_01.png',width:2.6,height:2.0,x:7,z:-6,yRatio:0.44},
      {file:'assets/maps/common/props/barrel_stack_01.png',width:2.2,height:2.2,x:-7,z:-5,yRatio:0.42},

      // ── KHU DƯỢC PHỐ (Đông Bắc, x>0, z<0) ── Thảo Dược Đường & hàng hóa
      {file:'assets/maps/common/buildings/house_herbal_01.png',width:5.6,height:5.2,x:18,z:-16,yRatio:0.44},
      {file:'assets/maps/common/buildings/house_tile_01.png',width:5.4,height:5.0,x:28,z:-14,yRatio:0.44},
      {file:'assets/maps/common/buildings/shop_house_01.png',width:5.4,height:5.2,x:22,z:-26,yRatio:0.44},
      {file:'assets/maps/common/props/jar_stack_01.png',width:2.0,height:1.8,x:15,z:-22,yRatio:0.42},
      {file:'assets/maps/common/props/sack_stack_01.png',width:2.2,height:1.8,x:14,z:-18,yRatio:0.42},
      {file:'assets/maps/common/props/stall_fruit_01.png',width:3.4,height:2.8,x:30,z:-20,yRatio:0.44},
      {file:'assets/maps/common/lanterns/lantern_shrine_01.png',width:2.0,height:3.2,x:16,z:-14,yRatio:0.46},
      {file:'assets/maps/common/lanterns/lantern_shrine_01.png',width:2.0,height:3.2,x:26,z:-14,yRatio:0.46},

      // ── KHU THƯƠNG PHỐ (Tây Bắc, x<0, z<0) ── Chợ & nơi buôn bán
      {file:'assets/maps/common/buildings/house_thatch_01.png',width:5.0,height:4.8,x:-18,z:-16,yRatio:0.44},
      {file:'assets/maps/common/buildings/warehouse_thatch_01.png',width:5.2,height:4.6,x:-28,z:-14,yRatio:0.44},
      {file:'assets/maps/common/buildings/smithy_01.png',width:5.4,height:5.0,x:-22,z:-26,yRatio:0.44},
      {file:'assets/maps/common/props/stall_cloth_01.png',width:3.4,height:2.8,x:-16,z:-22,yRatio:0.44},
      {file:'assets/maps/common/props/crate_stack_01.png',width:2.2,height:2.2,x:-14,z:-18,yRatio:0.42},
      {file:'assets/maps/common/props/weapon_rack_01.png',width:2.6,height:2.6,x:-30,z:-20,yRatio:0.44},
      {file:'assets/maps/common/lanterns/lantern_post_01.png',width:2.2,height:3.2,x:-16,z:-14,yRatio:0.46},
      {file:'assets/maps/common/lanterns/lantern_post_01.png',width:2.2,height:3.2,x:-26,z:-14,yRatio:0.46},

      // ── KHU DÂN CƯ (Đông Nam, x>0, z>0) ── Nhà ở dân lành
      {file:'assets/maps/common/buildings/house_sakura_01.png',width:5.8,height:5.4,x:18,z:18,yRatio:0.44},
      {file:'assets/maps/common/buildings/house_tile_01.png',width:5.4,height:5.0,x:28,z:16,yRatio:0.44},
      {file:'assets/maps/common/buildings/house_thatch_01.png',width:5.0,height:4.8,x:22,z:28,yRatio:0.44},
      {file:'assets/maps/common/buildings/house_herbal_01.png',width:5.6,height:5.2,x:32,z:26,yRatio:0.44},
      {file:'assets/maps/common/props/barrel_stack_01.png',width:2.4,height:2.2,x:15,z:22,yRatio:0.42},
      {file:'assets/maps/common/props/cart_wood_01.png',width:3.2,height:2.4,x:14,z:16,yRatio:0.44},
      {file:'assets/maps/common/lanterns/lantern_double_hanging_01.png',width:2.2,height:3.4,x:18,z:14,yRatio:0.46},
      {file:'assets/maps/common/lanterns/lantern_double_hanging_01.png',width:2.2,height:3.4,x:28,z:14,yRatio:0.46},

      // ── KHU TU LUYỆN VIỆN (Tây Nam, x<0, z>0) ── Đạo Quán & thiền định
      {file:'assets/maps/common/buildings/shrine_buddha_01.png',width:5.6,height:5.8,x:-18,z:18,yRatio:0.44},
      {file:'assets/maps/common/buildings/pavilion_shrine_01.png',width:4.8,height:5.0,x:-28,z:16,yRatio:0.44},
      {file:'assets/maps/common/buildings/pavilion_water_01.png',width:5.2,height:5.2,x:-22,z:28,yRatio:0.44},
      {file:'assets/maps/common/signs/sign_stone_yinyang_01.png',width:2.8,height:3.6,x:-14,z:22,yRatio:0.40},
      {file:'assets/maps/common/signs/sign_magic_stone_01.png',width:2.4,height:3.2,x:-32,z:22,yRatio:0.40},
      {file:'assets/maps/common/props/campfire_01.png',width:1.8,height:1.6,x:-28,z:22,yRatio:0.44},
      {file:'assets/maps/common/lanterns/lantern_shrine_01.png',width:2.0,height:3.2,x:-16,z:16,yRatio:0.46},
      {file:'assets/maps/common/lanterns/lantern_shrine_01.png',width:2.0,height:3.2,x:-26,z:16,yRatio:0.46},

      // Vòng tường đá bo cong được dựng động trong spawnVillageCurvedWall().

      // ── TƯỜNG TRONG — Ngăn khu phố với quảng trường ──
      {file:'assets/maps/common/fences_gates/fence_ornate_01.png',width:3.2,height:1.8,x:-12,z:-12,yRatio:0.46},
      {file:'assets/maps/common/fences_gates/fence_ornate_01.png',width:3.2,height:1.8,x:0,z:-12,yRatio:0.46},
      {file:'assets/maps/common/fences_gates/fence_ornate_01.png',width:3.2,height:1.8,x:12,z:-12,yRatio:0.46},
      {file:'assets/maps/common/fences_gates/fence_ornate_01.png',width:3.2,height:1.8,x:-12,z:12,yRatio:0.46},
      {file:'assets/maps/common/fences_gates/fence_ornate_01.png',width:3.2,height:1.8,x:0,z:12,yRatio:0.46},
      {file:'assets/maps/common/fences_gates/fence_ornate_01.png',width:3.2,height:1.8,x:12,z:12,yRatio:0.46},

      // ── CÂY VEN TƯỜNG & CÂY NỘI Ô ── Tán cây trong làng che bóng mát
      {file:'assets/maps/common/trees/tree_sakura_01.png',width:4.2,height:5.6,x:-35,z:-20,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_willow_01.png',width:4.0,height:5.4,x:35,z:-22,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_ancient_green_01.png',width:4.2,height:5.8,x:-35,z:20,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_pink_blossom_02.png',width:4.0,height:5.2,x:35,z:22,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_lantern_01.png',width:4.0,height:5.5,x:20,z:6,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_autumn_01.png',width:3.8,height:5.2,x:-20,z:6,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_white_blossom_01.png',width:3.8,height:5.2,x:20,z:-10,yRatio:0.36},
      {file:'assets/maps/common/trees/tree_pine_01.png',width:3.6,height:5.4,x:-20,z:-10,yRatio:0.36},

      // ── ĐÈN ĐƯỜNG & HOA VIỀN LỐI ĐI ──
      {file:'assets/maps/common/plants/bush_mixed_flower_01.png',width:2.2,height:1.8,x:10,z:-4,yRatio:0.36},
      {file:'assets/maps/common/plants/bush_pink_01.png',width:1.9,height:1.6,x:-10,z:-4,yRatio:0.36},
      {file:'assets/maps/common/plants/bush_purple_01.png',width:1.9,height:1.6,x:10,z:4,yRatio:0.36},
      {file:'assets/maps/common/plants/bush_green_01.png',width:2.0,height:1.7,x:-10,z:4,yRatio:0.36},
      {file:'assets/maps/common/plants/flower_pink_01.png',width:1.9,height:1.9,x:12,z:-8,yRatio:0.36},
      {file:'assets/maps/common/plants/flower_purple_01.png',width:1.9,height:1.9,x:-12,z:-8,yRatio:0.36},
    ],
    treeCount:160,
    rockCount:90,
    grassCount:140,
    villageClearX:42,
    villageClearZ:42,
    lanternPosts:[
      // Trục Bắc-Nam (đường chính)
      {x:-5,z:-34},{x:5,z:-34},
      {x:-5,z:-24},{x:5,z:-24},
      {x:-5,z:-12},{x:5,z:-12},
      {x:-5,z:0},  {x:5,z:0},
      {x:-5,z:12}, {x:5,z:12},
      {x:-5,z:24}, {x:5,z:24},
      {x:-5,z:34}, {x:5,z:34},
      // Trục Đông-Tây (đường chợ)
      {x:-34,z:-5},{x:-34,z:5},
      {x:-24,z:-5},{x:-24,z:5},
      {x:24,z:-5}, {x:24,z:5},
      {x:34,z:-5}, {x:34,z:5}
    ]
  }
};

// ==========================================
// HỆ THỐNG KỸ NĂNG: TỨ ĐẠI ĐẲNG CẤP & TỨ PHẨM VỊ
// 4 Cấp: Hoàng -> Huyền -> Địa -> Thiên
// 4 Phẩm: Hạ -> Trung -> Thượng -> Cực (16 bí tịch / hệ)
// ==========================================
const SKILL_TIERS=[
  {id:'hoang',name:'Hoàng Cấp',minRealm:0,minLevel:1,color:'#68d391',badge:'Hoàng'},
  {id:'huyen',name:'Huyền Cấp',minRealm:1,minLevel:20,color:'#63b3ed',badge:'Huyền'},
  {id:'dia',name:'Địa Cấp',minRealm:2,minLevel:45,color:'#b794f4',badge:'Địa'},
  {id:'thien',name:'Thiên Cấp',minRealm:3,minLevel:75,color:'#f6ad55',badge:'Thiên'}
];

const SKILL_RANKS=[
  {id:'ha',name:'Hạ Phẩm',multBase:1.5,mpBase:18,cdBase:3.2,costStones:40,costCult:100},
  {id:'trung',name:'Trung Phẩm',multBase:2.1,mpBase:32,cdBase:4.8,costStones:100,costCult:250},
  {id:'thuong',name:'Thượng Phẩm',multBase:3.0,mpBase:50,cdBase:6.8,costStones:220,costCult:550},
  {id:'cuc',name:'Cực Phẩm',multBase:4.2,mpBase:75,cdBase:9.5,costStones:450,costCult:1200}
];

const ELEMENT_SKILL_NAMES={
  'Kiếm':[
    'Thanh Phong Kiếm Thức','Lưu Vân Kiếm Khí','Tật Điện Kiếm Thức','Hồi Phong Kiếm Quyết',
    'Quy Nguyên Kiếm Trận','Huyền Quang Kiếm Vũ','Tứ Linh Kiếm Ảnh','Thiên Kiếm Phá Toái',
    'Địa Sát Kiếm Lôi','Bát Hoang Kiếm Nhận','Thái Ất Kiếm Cương','Vạn Kiếm Quy Tông',
    'Cửu Kiếp Kiếm Điển','Tru Tiên Kiếm Trận','Hỗn Độn Kiếm Ý','Nhất Niệm Trảm Chư Thiên'
  ],
  'Đao':[
    'Liệp Hổ Đao Pháp','Khai Sơn Đao Khí','Đoạn Lãng Đao Quyết','Bá Vương Khai Thiên Đao',
    'Cuồng Phong Đao Trận','Huyết Ảnh Ma Đao','Liệt Không Toái Nhận','Vô Ngân Phách Địa Đao',
    'Thất Sát Đao Quyết','Diêm La Huyết Nhận','Cửu U Bá Hoàng Đao','Thần Ma Toái Hồn Trảm',
    'Hồng Mông Khai Thiên Đao','Bát Hoang Diệt Tuyệt Đao','Hỗn Độn Đao Ý','Nghịch Mệnh Trảm Thiên Đao'
  ],
  'Hỏa':[
    'Xích Viêm Hỏa Cầu','Liệt Diễm Thiêu Thiên','Hỏa Điểu Phá Không','Hỏa Long Bộc Phá',
    'Bát Hoang Ly Hỏa','Tử Diễm Ma Hỏa Quyết','Hỏa Phượng Liêu Nguyên','Xích Tiêu Diệt Ma Trận',
    'Cửu U Minh Hỏa','Tam Muội Chân Hỏa','Hỗn Độn Thần Diễm','Liệt Diễm Thiêu Chư Thiên',
    'Thái Dương Thần Hỏa','Hồng Mông Chân Hỏa','Cửu Chuyển Niết Bàn Hỏa','Phần Thiên Táng Thế Thần Thông'
  ],
  'Lôi':[
    'Dẫn Lôi Châm','Lôi Quang Nhất Trảm','Thiểm Điện Liên Ba','Ngũ Lôi Oanh Đỉnh',
    'Tật Điện Cuồng Lôi','Tử Tiêu Lôi Trận','Thiên Lôi Phá Không','Cửu Thiên Lôi Vũ',
    'Cửu Thiên Huyền Lôi','Thái Ất Thần Lôi Trận','Lôi Đình Phạt Thế','Vạn Lôi Hóa Kiếp',
    'Tử Vi Thần Lôi Quyết','Diệt Thế Lôi Kiếp','Hỗn Độn Thần Lôi','Thiên Kiếp Thần Phạt Thần Thông'
  ],
  'Thủy':[
    'Hàn Băng Thứ','Lưu Thủy Đoạn Đao','Băng Thuẫn Hộ Thể','Hàn Băng Bộc Phá',
    'Băng Phong Vạn Lý','Huyền Băng Kiếm Trận','Băng Phượng Hóa Thần','Huyền Minh Chân Thủy',
    'Cửu U Băng Phách','Băng Hà Diệt Thế','Thái Âm Thần Thủy','Vạn Tượng Băng Táng',
    'Nhược Thủy Tam Thiên','Hỗn Độn Băng Linh','Tuyệt Đối Linh Độ','Hàn Băng Đóng Băng Chư Thiên'
  ],
  'Mộc':[
    'Thanh Mộc Thứ','Linh Đằng Trói Buộc','Diệp Nhận Loạn Vũ','Vạn Diệp Hoa Vũ',
    'Cổ Mộc Khôi Lỗi','Linh Mộc Hộ Thể','Vạn Mộc Triều Tông','Sinh Linh Thần Hóa',
    'Trường Sinh Thần Quyết','Bát Hoang Thần Mộc','Thông Thiên Linh Đằng','Vạn Cổ Mộc Linh Trận',
    'Kiến Mộc Khai Thiên','Hồng Mông Tiên Thảo','Nghịch Chuyển Sinh Tử','Mộc Linh Khởi Nguyên Thần Thông'
  ],
  'Phong':[
    'Phong Nhận Thuật','Tật Phong Trảm','Cuồng Phong Loạn Vũ','Phong Long Quyển',
    'Liệt Phong Trận','Vô Ảnh Phong Thức','Thiên Phong Phá Thể','Bão Táp Băng Toái',
    'Bát Diện Linh Phong','Cửu Thiên Cương Phong','Hư Không Liệt Phong','Tật Phong Vô Cực Trận',
    'Thái Hư Thần Phong','Hồng Mông Phong Kiếp','Phong Thần Toái Hư','Vạn Cổ Hư Vô Phong Thần Thông'
  ],
  'Thổ':[
    'Thạch Giáp Thuật','Lạc Thạch Trận','Nham Thuẫn Hộ Thể','Nham Thạch Bạo Phá',
    'Đại Địa Chi Lực','Kim Cương Nham Thể','Địa Long Cuồng Ba','Bát Hoang Nham Trận',
    'Địa Mạch Thần Lực','Thái Sơn Áp Đỉnh','Vạn Trượng Địa Nham','Đại Địa Liệt Cương',
    'Huyền Hoàng Chi Khí','Bất Động Minh Vương Thổ','Hồng Mông Thổ Nhận','Thiên Địa Quy Nhất Thần Thông'
  ],
  'Kim':[
    'Kim Cang Chỉ','Kim Đao Toái Khí','Bạch Kim Hộ Thuẫn','Phá Giáp Thần Quyết',
    'Kim Qua Thiết Mã','Thái Canh Kiếm Khí','Vạn Nhận Triều Tông','Kim Cương Bất Hoại',
    'Thái Canh Kim Sát','Thiên Canh Thần Nhận','Vạn Kiếm Quy Tông','Kim Quang Toái Hư',
    'Hỗn Độn Canh Kim','Hồng Mông Thần Binh','Khai Thiên Thần Sát','Canh Kim Diệt Thế Thần Thông'
  ]
};

function getElementKey(elemName){
  let map={'Kiếm':'kiem','Đao':'dao','Hỏa':'hoa','Lôi':'loi','Thủy':'thuy','Mộc':'moc','Phong':'phong','Thổ':'tho','Kim':'kim'};
  return map[elemName]||'kiem';
}

function getElementNameFromKey(key){
  let map={'kiem':'Kiếm','dao':'Đao','hoa':'Hỏa','loi':'Lôi','thuy':'Thủy','moc':'Mộc','phong':'Phong','tho':'Thổ','kim':'Kim'};
  return map[key]||'Kiếm';
}

function getElementColorByName(elemName){
  return {
    Kim:'#ffd86b',Hỏa:'#ff6b3d',Thủy:'#64cfff',
    Thổ:'#c9a56b',Mộc:'#68df8b',Phong:'#a7f3dc',
    Lôi:'#9d8cff',Kiếm:'#7ceaff',Đao:'#ff776d'
  }[elemName]||'#7ceaff';
}

function getSkillId(elemName,tierIdx,rankIdx){
  let key=getElementKey(elemName);
  return `${key}_${tierIdx}_${rankIdx}`;
}

function getSkillDef(skillId){
  if(!skillId)return null;
  let parts=skillId.split('_');
  if(parts.length<3)return null;
  let elemKey=parts[0], tierIdx=parseInt(parts[1],10), rankIdx=parseInt(parts[2],10);
  let elemName=getElementNameFromKey(elemKey);
  let names=ELEMENT_SKILL_NAMES[elemName]||ELEMENT_SKILL_NAMES['Kiếm'];
  let flatIdx=tierIdx*4+rankIdx;
  let name=names[flatIdx]||`Bí Kíp ${tierIdx}-${rankIdx}`;
  let tier=SKILL_TIERS[tierIdx]||SKILL_TIERS[0];
  let rank=SKILL_RANKS[rankIdx]||SKILL_RANKS[0];
  let tierMults=[1.0, 2.0, 3.8, 7.5];
  let tm=tierMults[tierIdx]||1.0;
  let mult=rank.multBase*tm;
  let mp=Math.round(rank.mpBase*(1+tierIdx*0.85));
  let cd=parseFloat((rank.cdBase+tierIdx*1.5).toFixed(1));
  let aoe=rankIdx===0?0:(4.5+rankIdx*2.2+tierIdx*1.5);
  let costStones=Math.round(rank.costStones*Math.pow(2.2,tierIdx));
  let costCult=Math.round(rank.costCult*Math.pow(2.4,tierIdx));
  let iconPath=`assets/skills/${elemKey}/${tier.id}_${rank.id}.png`;
  let vfxPath=`assets/vfx/skills/${elemKey}/${tier.id}_${rank.id}.png`;
  return {
    id:skillId,
    name,
    element:elemName,
    elemKey,
    tierIdx,
    rankIdx,
    tierId:tier.id,
    rankId:rank.id,
    tierName:tier.name,
    rankName:rank.name,
    tierColor:tier.color,
    badge:`${tier.badge}·${rank.name[0]}`,
    icon:iconPath,
    vfx:vfxPath,
    minRealm:tier.minRealm,
    minLevel:tier.minLevel,
    mult,
    mp,
    cd,
    aoe,
    costStones,
    costCult
  };
}

const defaultState={
  name:'Linh Phong',level:1,xp:0,xpNeed:120,
  hp:620,maxHp:620,mp:180,maxMp:180,
  // Hệ thuộc tính chiến đấu chính thức — không còn atk/def/crit cũ.
  damage:{physical:42,Kim:0,Hỏa:0,Thủy:0,Mộc:0,Thổ:0,Phong:0,Lôi:0},
  defense:{physical:8,Kim:0,Hỏa:0,Thủy:0,Mộc:0,Thổ:0,Phong:0,Lôi:0},
  critChance:.12,critDamage:1.8,
  spiritSense:100,moveSpeed:6.2,attackSpeed:1.0,castSpeed:1.0,
  hpRegenPct:0.015,mpRegenPct:0.035,
  gold:1200,stones:500,
  realm:0,realmStage:1,cultivation:0,
  kills:0,questKills:0,bossKills:0,
  auto:true,quality:1,daily:false,pet:false,
  items:{'Linh Thạch':5,'Hồi Khí Đan':3},
  equipment:{weapon:null,armor:null,ring:null},
  period:0,cultivationTechniques:makeDefaultTechniqueCultivation(),activeCultivationTechnique:'physical',heartMethod:0,heartMethodLevels:{0:1},region:0,skillElement:'Kiếm',
  equippedSkills:['kiem_0_0','kiem_0_1',null,null],
  learnedSkills:{'kiem_0_0':1,'kiem_0_1':1},
  skillTierTab:0,
  pills:{1:3,2:0,3:0,4:0,5:0},
  talismans:{1:1,2:0,3:0,4:0,5:0},
  artifacts:{1:0,2:0,3:0,4:0,5:0}
};

let S;
try{
  let parsed=JSON.parse(localStorage.getItem(SAVE)||'{}');
  S=Object.assign({},defaultState,parsed);
  if(!S.items||typeof S.items!=='object'||Array.isArray(S.items)){
    S.items={'Linh Thạch':5,'Hồi Khí Đan':3};
  }
  if(!S.equipment||typeof S.equipment!=='object'){
    S.equipment={weapon:null,armor:null,ring:null};
  }
  if(!Array.isArray(S.equippedSkills)){
    let k=getElementKey(S.skillElement||'Kiếm');
    S.equippedSkills=[`${k}_0_0`,`${k}_0_1`,null,null];
  }
  if(!S.learnedSkills||typeof S.learnedSkills!=='object'||Array.isArray(S.learnedSkills)){
    let k=getElementKey(S.skillElement||'Kiếm');
    S.learnedSkills={[`${k}_0_0`]:1,[`${k}_0_1`]:1};
  }
  if(typeof S.skillTierTab!=='number')S.skillTierTab=0;

  // Migration save cũ -> damage thành phần; Damage Tổng được tính bằng tổng các thành phần.
  const statTypes=['physical','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi'];
  const legacyAtk=typeof S.atk==='number'?S.atk:42;
  const legacyDef=typeof S.def==='number'?S.def:8;
  const legacyCrit=typeof S.crit==='number'?S.crit:.12;
  const legacyDamageBonus=(S.damageBonus&&typeof S.damageBonus==='object')?S.damageBonus:{};
  const legacyDefenseBonus=(S.defenseBonus&&typeof S.defenseBonus==='object')?S.defenseBonus:{};
  const oldDamage=(S.damage&&typeof S.damage==='object')?{...S.damage}:null;

  if(!S.damage||typeof S.damage!=='object')S.damage={};

  // Nếu save đang ở bản "Damage Tổng + % hệ" trước đó, quy đổi về damage phẳng:
  // giữ Damage Tổng cũ làm Vật lý nền và biến % hệ thành lượng damage hệ tương ứng.
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

  // Kiếm/Đao dùng Vật lý, không có damage/phòng thủ riêng.
  delete S.damage.Kiếm;
  delete S.damage.Đao;
  delete S.defense.Kiếm;
  delete S.defense.Đao;

  if(typeof S.critChance!=='number')S.critChance=legacyCrit;
  if(typeof S.critDamage!=='number')S.critDamage=1.8;
  if(typeof S.spiritSense!=='number')S.spiritSense=100;
  if(typeof S.moveSpeed!=='number')S.moveSpeed=6.2;
  if(typeof S.attackSpeed!=='number')S.attackSpeed=1.0;
  if(typeof S.castSpeed!=='number')S.castSpeed=1.0;
  if(typeof S.hpRegenPct!=='number')S.hpRegenPct=0.015;
  if(typeof S.mpRegenPct!=='number')S.mpRegenPct=0.035;
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

  delete S.atk;
  delete S.def;
  delete S.crit;
  delete S.damageBonus;
  delete S.defenseBonus;
}catch(e){
  S=structuredClone(defaultState);
}

const save=()=>{try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}};

let engine,scene,camera,player,petActor=null,actors=[],projectiles=[],effects=[],decor=[],boss=null;
let worldGround=null,worldRiver=null;
let last=performance.now(),spawnTimer=0,autoTimer=0,regenTimer=0,miniTimer=0,gameStarted=false,paused=false;
const keys={}, joy={x:0,y:0,active:false,pid:null}, cooldown=[0,0,0,0,0], dashCd={t:0};
const spriteMats={}, matCache={}, mapPropMaterials={}, skillVfxMats={};

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
function region(){return regions[S.region||0]||regions[0]}
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

function makeBillboard(name,type,size,x,z){
  let p=BABYLON.MeshBuilder.CreatePlane(name,{size},scene);
  p.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;
  p.position.set(x,size*.48,z);
  p.isPickable=false;
  if(type==='player'){
    p.material=playerAnimMat('right','idle',0);
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
  let scale=1.0+rnd(-sizeVariance,sizeVariance);
  let w=propDef.width*scale;
  let h=propDef.height*scale;
  let p=BABYLON.MeshBuilder.CreatePlane(name,{width:w,height:h},scene);
  // PNG environment luôn quay thẳng vào camera giống player/enemy.
  // Nhờ vậy ảnh pre-render không bị méo thêm bởi góc nhìn 3D của plane.
  p.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;

  // Chuẩn chân asset: tâm theo X, đáy PNG chạm mặt đất Y=0.
  // Không dùng yRatio khác nhau nữa vì nó làm cây/đá/nhà có "camera" khác nhau.
  p.position.set(x,h*0.5,z);
  p.material=getMapPropMaterial(propDef.file);
  p.isPickable=false;

  if(!propDef.noShadow){
    let shadowSize=Math.max(w*0.82, 1.2);
    let sh=BABYLON.MeshBuilder.CreatePlane(name+'_sh',{width:shadowSize,height:shadowSize*0.62},scene);
    sh.rotation.x=Math.PI/2;
    sh.position.set(x,0.02,z + 0.1);
    sh.material=getSoftShadowMaterial();
    sh.isPickable=false;
    decor.push(p,sh);
  }else{
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

  const rx=43.0,rz=40.0;
  const count=208; // khoảng cách ~1.25 world-unit: overlap nhẹ để tường kín khít.

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

    const fi=frameForTangent(a);
    spawnMapProp(
      'village_curve_wall_'+i,
      {
        file:wallFiles[fi],
        width:1.55,
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

function loadMap(regionIdx){
  decor.forEach(m=>{
    try{
      if(m&&!m.isDisposed()){
        m.dispose();
      }
    }catch(e){}
  });
  decor=[];

  let reg=regions[regionIdx]||regions[0];
  let cfg=MAP_CONFIGS[reg.id]||MAP_CONFIGS.thanh_van_thon;

  let sceneColor=reg.color?BABYLON.Color4.FromHexString(reg.color+'ff'):BABYLON.Color4.FromHexString(cfg.clearColor+'ff');
  scene.clearColor=sceneColor;
  scene.fogMode=BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogColor=new BABYLON.Color3(sceneColor.r,sceneColor.g,sceneColor.b);
  scene.fogStart=cfg.fogStart||45;
  scene.fogEnd=cfg.fogEnd||95;

  if(worldGround){
    let gm=new BABYLON.StandardMaterial('groundMat_'+reg.id,scene);
    if(cfg.groundTexture){
      let gt=new BABYLON.Texture(cfg.groundTexture,scene,false,true,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
      let gScale=cfg.groundScale||80;
      gt.uScale=gScale;
      gt.vScale=gScale;
      gt.wrapU=BABYLON.Texture.WRAP_ADDRESSMODE;
      gt.wrapV=BABYLON.Texture.WRAP_ADDRESSMODE;
      gt.anisotropicFilteringLevel=8;
      gm.diffuseTexture=gt;
      gm.specularColor=BABYLON.Color3.Black();
      gm.backFaceCulling=false;
    }
    worldGround.material=gm;
  }

  if(worldRiver){
    try{worldRiver.dispose();}catch(e){}
    worldRiver=null;
  }

  // Cây cối PNG (Trees)
  const vcx=cfg.villageClearX||14, vcz=cfg.villageClearZ||16;
  if(cfg.trees&&cfg.trees.length>0){
    for(let i=0;i<(cfg.treeCount||400);i++){
      let x=rnd(-MAP_BOUND,MAP_BOUND),z=rnd(-MAP_BOUND,MAP_BOUND);
      if(Math.abs(x)<vcx&&Math.abs(z)<vcz)continue;
      if(cfg.river&&cfg.river.enabled&&Math.abs(x-cfg.river.x)<14)continue;
      let treeDef=cfg.trees[Math.floor(Math.random()*cfg.trees.length)];
      spawnMapProp('tree_'+i,treeDef,x,z,0.22);
    }
  }

  // Đá PNG (Rocks)
  if(cfg.rocks&&cfg.rocks.length>0){
    for(let i=0;i<(cfg.rockCount||220);i++){
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
    for(let i=0;i<(cfg.grassCount||140);i++){
      let x=rnd(-MAP_BOUND,MAP_BOUND),z=rnd(-MAP_BOUND,MAP_BOUND);
      if(Math.abs(x)<vcx&&Math.abs(z)<vcz)continue;
      let gDef=grassPool[Math.floor(Math.random()*grassPool.length)];
      spawnMapProp('grass_'+i,gDef,x,z,0.22);
    }
  }

  // Cảnh quan Thôn Làng (Village Landmarks)
  if(cfg.villageProps&&cfg.villageProps.length>0){
    cfg.villageProps.forEach((vp,i)=>{
      spawnMapProp('village_prop_'+i,vp,vp.x,vp.z,0.02);
    });
  }

  if(reg.id==='thanh_van_thon'){
    spawnVillageCurvedWall();
  }
}

function createWorld(){
  scene=new BABYLON.Scene(engine);
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
  loadMap(S.region||0);
}

function makeActor(type,x,z,elite=false){
  // 7 loại quái mới từ assets/sprites/{type}_00-15.png
  let defs={
    // Cấp thấp — ngoại ô, rừng núi
    boar:    {hp:180, atk:12, speed:2.3,  size:2.6, xp:20, name:'Sơn Trư'},
    archer:  {hp:140, atk:18, speed:1.9,  size:2.4, xp:22, name:'Tiễn Thủ'},
    // Cấp giữa — nhân loại tà ác, thú mạnh
    bandit:  {hp:220, atk:22, speed:2.0,  size:2.5, xp:28, name:'Đạo Tặc'},
    tiger:   {hp:280, atk:28, speed:2.6,  size:3.0, xp:36, name:'Hổ Thần'},
    // Cấp cao — bất tử, băng hệ
    skeleton:{hp:360, atk:32, speed:1.5,  size:2.8, xp:42, name:'Khô Cốt'},
    undead:  {hp:340, atk:36, speed:1.8,  size:2.9, xp:48, name:'Bạo Thi'},
    ice_wolf:{hp:440, atk:42, speed:2.8,  size:3.1, xp:55, name:'Băng Lang'},
    // Legacy placeholders (kept for backwards compat)
    wolf:    {hp:150, atk:14, speed:2.15, size:2.5, xp:18, name:'Ma Lang'},
    fox:     {hp:210, atk:18, speed:1.9,  size:2.7, xp:24, name:'Linh Hồ'},
    golem:   {hp:420, atk:26, speed:1.15, size:3.3, xp:38, name:'Thạch Khôi'},
    shadow:  {hp:300, atk:30, speed:2.35, size:2.8, xp:34, name:'Ảnh Thú'}
  };
  let d=defs[type]||defs['wolf'];
  let rr=region(), enemyLv=Math.max(rr.min,Math.min(rr.max,Math.round(S.level+rnd(-3,4)))),mult=1+enemyLv*.075;
  if(elite)mult*=2.5;
  let a={
    id:Math.random(),type,x,z,
    hp:d.hp*mult,maxHp:d.hp*mult,
    atk:d.atk*mult,speed:d.speed,
    size:d.size*(elite?1.22:1),xp:d.xp,
    name:(elite?'Tinh Anh ':'')+d.name+' Lv.'+enemyLv,
    enemyLv,elite,dead:false,
    realmInfo:getEnemyRealmInfo(enemyLv),
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

function spawnPack(){
  if(actors.filter(a=>!a.dead).length>30)return;
  let rr=region(), pool=rr.enemy, type=pool[Math.floor(Math.random()*pool.length)];
  let ang=rnd(0,Math.PI*2),r=rnd(44,66);
  for(let i=0;i<(type==='wolf'?3:2);i++){
    let spawnX=clamp(player.x+Math.cos(ang)*r+rnd(-3,3),-MAP_BOUND,MAP_BOUND);
    let spawnZ=clamp(player.z+Math.sin(ang)*r+rnd(-3,3),-MAP_BOUND,MAP_BOUND);
    // Tuyệt đối không spawn trong khu an toàn Thanh Vân Thôn.
    if(isVillageSafe(spawnX,spawnZ)){
      let a=rnd(0,Math.PI*2),rad=rnd(1.15,1.65);
      spawnX=clamp(Math.cos(a)*VILLAGE_WALL_RX*rad,-MAP_BOUND,MAP_BOUND);
      spawnZ=clamp(Math.sin(a)*VILLAGE_WALL_RZ*rad,-MAP_BOUND,MAP_BOUND);
    }
    makeActor(type,spawnX,spawnZ,Math.random()<.08);
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
  boss=makeActor('shadow',bx,bz,true);
  boss.name='Xích Viêm Ma Lang';
  boss.maxHp*=5.5;
  boss.hp=boss.maxHp;
  boss.atk*=1.8;
  boss.size=4.8;
  boss.mesh.scaling.scaleInPlace(1.4);
  if(boss.shadow)boss.shadow.scaling.scaleInPlace(1.4);
  $('#bossBar').hidden=false;
  $('#bossName').textContent=boss.name;
  toast('⚠ Boss xuất hiện: Xích Viêm Ma Lang!');
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

const MATCHING_DAMAGE_MULT=2.0;

function getDamageComponent(type='physical'){
  type=normalizeDamageType(type);
  const base=Math.max(0,(S.damage&&Number(S.damage[type]))||0);
  return base*getTechniqueStatMultiplier(type);
}

function getTotalDamage(){
  return COMBAT_DAMAGE_TYPES.reduce((sum,t)=>sum+getDamageComponent(t),0);
}

function getPlayerDamageStat(type='physical'){
  // Mọi skill dùng toàn bộ Damage Tổng.
  // Riêng thành phần trùng hệ của skill được nhân cao hơn.
  type=normalizeDamageType(type);
  const total=getTotalDamage();
  const matching=getDamageComponent(type);
  return total + matching*(MATCHING_DAMAGE_MULT-1);
}

function getPlayerDefenseStat(type='physical'){
  type=normalizeDamageType(type);
  const base=Math.max(0,(S.defense&&Number(S.defense[type]))||0);
  return base*getTechniqueStatMultiplier(type)*getRealmPowerMultiplier()*getHeartMethodEffects().defense;
}

function getSkillPower(skill,mult=1,crit=false){
  let rawType=skill&&skill.element?skill.element:'physical';
  let type=normalizeDamageType(rawType);
  // Mọi skill dùng Damage Tổng; riêng thành phần đúng hệ được nhân theo MATCHING_DAMAGE_MULT.
  // Kiếm/Đao được normalize thành Vật lý.
  let base=getPlayerDamageStat(type);
  // Chỉ Kim/Hỏa/Thủy/Mộc/Thổ/Phong/Lôi nhận thêm hệ số Thần thức.
  const heartFx=getHeartMethodEffects();
  let spiritMult=type==='physical'?1:(1+(Math.max(0,S.spiritSense||0)*heartFx.spirit)/1000);
  let petMult=S.pet?1.08:1.0;
  let critMult=crit?(S.critDamage||1.8):1;
  // Cảnh giới chỉ tăng stat vừa phải; áp chế được áp riêng khi damage chạm mục tiêu.
  let realmMult=getRealmPowerMultiplier();
  return base*realmMult*mult*spiritMult*petMult*critMult*rnd(.92,1.08);
}

function takePlayerDamage(raw,type='physical',attacker=null){
  let defense=getPlayerDefenseStat(type);
  const enemySuppress=getActorSuppressionVsPlayer(attacker);
  const playerSuppress=getPlayerSuppressionVsActor(attacker);
  // Nếu quái cao cảnh giới hơn: damage của quái được nhân bởi áp chế.
  // Nếu người chơi cao hơn: damage nhận vào bị chia bởi áp chế của người chơi.
  let realmFactor=enemySuppress/Math.max(1,playerSuppress);
  let reduced=Math.max(1,raw*realmFactor-defense*rnd(.65,1.0));
  S.hp-=reduced;
  sfx('hit');
  floatText(player.mesh.position,`-${Math.round(reduced)} ${DAMAGE_LABELS[type]||type}`,DAMAGE_COLORS[type]||'#ff776d');
  if(S.hp<=0)playerDeath();
  return reduced;
}

function damage(a,d,crit=false,type='physical'){
  if(!a||a.dead)return;
  type=normalizeDamageType(type);
  const suppression=getPlayerSuppressionVsActor(a);
  d=Math.max(1,Math.round(d*suppression));
  a.hp-=d;
  sfx(crit?'slash':'hit');
  floatText(a.mesh.position,`${crit?'Bạo ':''}-${d} ${DAMAGE_LABELS[type]||''}`,crit?'#fff08b':(DAMAGE_COLORS[type]||'#ffd08a'));
  flash(a.mesh);
  if(a===boss)$('#bossFill').style.width=clamp(a.hp/a.maxHp*100,0,100)+'%';
  if(a.hp<=0)kill(a);
}

function kill(a){
  a.dead=true;
  a.mesh.setEnabled(false);
  if(a.shadow)a.shadow.setEnabled(false);
  S.kills++;
  S.questKills++;
  gainXP(a.xp);
  S.cultivation+=Math.round(a.xp*.85*getHeartMethodEffects().cultivation*getTechniqueCultivationMultiplier());
  
  // Loot
  if(Math.random()<.75){
    let g=Math.round(rnd(6,25)*(1+S.level*.05));
    S.gold+=g;
    if(Math.random()<.2){
      S.stones++;
      addItem('Linh Thạch',1);
      toast('💎 Nhặt Linh Thạch x1');
      sfx('item');
    }
    if(Math.random()<.1)dropEquipment();
  }
  if(a===boss){
    S.bossKills++;
    S.stones+=35;
    S.gold+=600;
    addItem('Boss Hồn Tinh',1);
    toast('🏆 Đã diệt Boss! +35 Linh Thạch & Hồn Tinh');
    sfx('breakthrough');
    boss=null;
    $('#bossBar').hidden=true;
    S.questKills=0;
  }
  setTimeout(()=>{
    if(a.mesh)a.mesh.dispose();
    if(a.shadow)a.shadow.dispose();
    actors=actors.filter(x=>x!==a);
  },800);
  save();
  updateHUD();
}

function gainXP(v){
  S.xp+=v;
  while(S.xp>=S.xpNeed){
    S.xp-=S.xpNeed;
    S.level++;
    S.xpNeed=Math.round(S.xpNeed*1.22);
    // Mỗi cấp nhân vật tăng toàn bộ chỉ số nền.
    S.maxHp+=60;
    S.maxMp+=15;
    for(const t of COMBAT_DAMAGE_TYPES){
      S.damage[t]=(S.damage[t]||0)+8;
      S.defense[t]=(S.defense[t]||0)+2;
    }
    S.spiritSense+=3;
    S.critChance=Math.min(.75,(S.critChance||0)+.002);
    S.critDamage=Math.min(4,(S.critDamage||1.8)+.01);
    S.moveSpeed=Math.min(12,(S.moveSpeed||6.2)+.01);
    S.attackSpeed=Math.min(3,(S.attackSpeed||1)+.005);
    S.castSpeed=Math.min(3,(S.castSpeed||1)+.005);
    S.hpRegenPct=Math.min(.12,(S.hpRegenPct||0)+.0003);
    S.mpRegenPct=Math.min(.18,(S.mpRegenPct||0)+.0005);
    S.hp=S.maxHp;
    S.mp=S.maxMp;
    toast(`✨ Đột phá cấp độ Lv.${S.level}!`);
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
  let n=gearNames[Math.floor(Math.random()*gearNames.length)],rare=Math.random()<.18?'Sử Thi':'Hiếm';
  addItem(`${rare} ${n}`,1);
  toast(`✨ Nhặt [${rare}] ${n}`);
  sfx('item');
}

function playerAttack(target,mult=1){
  if(!target)return;
  triggerPlayerAttack();
  let crit=Math.random()<(S.critChance||0);
  let d=getSkillPower({element:'physical'},mult,crit);
  slash(target.x,target.z,crit?'#ffe777':'#78dfff');
  damage(target,d,crit,'physical');
}

function skillAttack(target,skill,mult=1,forceCrit=false){
  if(!target||!skill)return;
  let crit=forceCrit||Math.random()<(S.critChance||0);
  let d=getSkillPower(skill,mult,crit);
  damage(target,d,crit,normalizeDamageType(skill.element));
}

function nearest(range=9){
  let best=null,bd=range;
  for(let a of actors){
    if(a.dead||isVillageSafe(a.x,a.z))continue;
    let d=Math.hypot(a.x-player.x,a.z-player.z);
    if(d<bd){bd=d;best=a}
  }
  return best;
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
  let slotIdx=n-1;
  let skillId=(S.equippedSkills&&S.equippedSkills[slotIdx])||null;
  if(!skillId){
    toast('Ô kỹ năng '+n+' chưa trang bị bí tịch!');
    return;
  }
  let skill=getSkillDef(skillId);
  if(!skill)return;

  if(S.mp<skill.mp){
    toast(`Linh lực không đủ (${Math.round(S.mp)}/${skill.mp} MP)!`);
    return;
  }

  S.mp=Math.max(0,S.mp-skill.mp);
  cooldown[n]=skill.cd/Math.max(0.35,(S.castSpeed||1)*getHeartMethodEffects().cast);
  triggerPlayerAttack();

  let lv=(S.learnedSkills&&S.learnedSkills[skillId])||1;
  let dmgMult=skill.mult*(1+(lv-1)*0.15);
  let ec=getElementColorByName(skill.element);

  // Âm thanh tương ứng cấp bậc kỹ năng
  sfx('skill'+Math.min(4,skill.tierIdx+1));

  if(skill.aoe===0){
    // Chiêu đơn mục tiêu / Liên hoàn trảm (Hạ Phẩm)
    let t=nearest(11);
    if(t){
      for(let i=0;i<3;i++){
        setTimeout(()=>skillAttack(t,skill,dmgMult/2.4),i*75);
      }
      playSkillVfx(skill,t.x,t.z,3.4+skill.tierIdx*0.45,t.x-player.x,t.z-player.z,false);
      slash(t.x,t.z,ec);
    }
  }else{
    // Chiêu AoE diện rộng (Trung, Thượng, Cực Phẩm)
    let range=skill.aoe;
    let targets=actors.filter(a=>!a.dead&&!isVillageSafe(a.x,a.z)&&Math.hypot(a.x-player.x,a.z-player.z)<range);

    playSkillVfx(skill,player.x,player.z,Math.max(4.2,Math.min(10,range*0.95)),0,0,true);
    ring(player.x,player.z,ec,range*0.65);
    let particleCount=skill.tierIdx===3?60:skill.tierIdx===2?40:24;
    burst(player.x,player.z,ec,particleCount,range*0.75);

    // Rung chuyển trời đất khi thi triển Địa Cấp / Thiên Cấp
    if(skill.tierIdx>=2&&camera){
      let ox=camera.position.x,oz=camera.position.z;
      let mag=skill.tierIdx===3?0.38:0.18;
      camera.position.x+=rnd(-mag,mag);
      camera.position.z+=rnd(-mag,mag);
      setTimeout(()=>{if(camera){camera.position.x=ox;camera.position.z=oz;}},120);
    }

    let isCrit=skill.tierIdx>=2||Math.random()<(S.critChance||0);
    targets.forEach((a,i)=>{
      setTimeout(()=>skillAttack(a,skill,dmgMult,isCrit),i*22);
    });
  }

  updateHUD();
  updateCooldownUI();
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
  let tor=BABYLON.MeshBuilder.CreateTorus('slash',{diameter:2.3,thickness:.08,tessellation:20,arc:.55},scene);
  tor.position.set(x,1.1,z);
  tor.rotation.x=Math.PI/2;
  tor.rotation.z=rnd(-1,1);
  tor.material=mat('fx_slash',color,.85);
  effects.push({mesh:tor,t:.26,max:.26,grow:2});
}

function ring(x,z,color,r=4){
  let tor=BABYLON.MeshBuilder.CreateTorus('ring',{diameter:1,thickness:.06,tessellation:32},scene);
  tor.position.set(x,.12,z);
  tor.rotation.x=Math.PI/2;
  tor.material=mat('fx_ring',color,.75);
  effects.push({mesh:tor,t:.48,max:.48,grow:r*2});
}

function burst(x,z,color,count=18,r=5){
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

function skillVfxMaterial(skill,row,col){
  if(!skill||!skill.vfx)return null;
  let key=`skill_vfx_${skill.id}_${row}_${col}`;
  if(skillVfxMats[key])return skillVfxMats[key];

  let m=new BABYLON.StandardMaterial('sm_'+key,scene);
  let t=new BABYLON.Texture(skill.vfx,scene,false,true,BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  t.hasAlpha=true;

  // Mỗi PNG skill là sprite sheet 3x3. Chỉ hiển thị đúng 1 ô.
  t.uScale=1/3;
  t.vScale=1/3;
  t.uOffset=col/3;
  // Babylon UV đi từ dưới lên; đảo row để row=0 luôn là hàng trên của ảnh PNG.
  t.vOffset=(2-row)/3;

  m.diffuseTexture=t;
  m.emissiveTexture=t;
  m.useAlphaFromDiffuseTexture=true;
  m.emissiveColor=new BABYLON.Color3(1,1,1);
  m.specularColor=BABYLON.Color3.Black();
  m.disableLighting=true;
  m.backFaceCulling=false;
  m.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;
  skillVfxMats[key]=m;
  return m;
}

function preloadSkillVfx(skill){
  if(!skill||!skill.vfx)return;
  // Preload đủ 9 ô của tối đa 4 skill đang trang bị.
  for(let row=0;row<3;row++){
    for(let col=0;col<3;col++) skillVfxMaterial(skill,row,col);
  }
}

function playSkillVfx(skill,x,z,size=3.4,dx=0,dz=0,center=false){
  if(!skill||!skill.vfx)return;
  let cell=vfxDirectionCell(dx,dz,center);
  let fxMat=skillVfxMaterial(skill,cell.row,cell.col);
  if(!fxMat)return;

  let plane=BABYLON.MeshBuilder.CreatePlane(
    'skill_vfx_'+skill.id+'_'+cell.key,
    {size:1,sideOrientation:BABYLON.Mesh.DOUBLESIDE},
    scene
  );
  plane.position.set(x,1.35,z);
  plane.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;
  plane.material=fxMat;
  plane.isPickable=false;
  plane.renderingGroupId=2;

  let base=Math.max(2.4,Math.min(10,size));
  plane.scaling.setAll(base*0.72);
  effects.push({mesh:plane,t:.82,max:.82,skillVfx:true,baseScale:base});
}

function floatText(pos,text,color){
  let p=BABYLON.Vector3.Project(pos,BABYLON.Matrix.Identity(),scene.getTransformMatrix(),camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()));
  let e=document.createElement('div');
  e.className='float';
  e.textContent=text;
  e.style.color=color;
  e.style.left=p.x+'px';
  e.style.top=p.y+'px';
  $('#floatLayer').appendChild(e);
  setTimeout(()=>e.remove(),950);
}

function toast(t){
  let e=document.createElement('div');
  e.textContent=t;
  $('#lootToast').appendChild(e);
  setTimeout(()=>e.remove(),2200);
}

function updateActor(a,dt){
  if(a.dead)return;

  // Khu an toàn tuyệt đối: actor nào lọt vào sẽ bị đẩy ra ngoài ngay.
  ejectEnemyFromVillage(a);

  let playerSafe=isVillageSafe(player.x,player.z);
  let dx=player.x-a.x,dz=player.z-a.z,d=Math.hypot(dx,dz)||1;
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

  if(!playerSafe && d>1.7 && (d<24 || a===boss)){
    let oldX=a.x, oldZ=a.z;
    let nextX=a.x+dx/d*a.speed*dt;
    let nextZ=a.z+dz/d*a.speed*dt;

    // Quái không bao giờ được xuyên vào khu an toàn, kể cả qua cổng.
    if(!isVillageSafe(nextX,nextZ)){
      a.x=nextX;
      a.z=nextZ;
    }else{
      a.x=oldX;
      a.z=oldZ;
    }
  }else if(!playerSafe && a.attackCd<=0 && d<=1.7){
    a.attackCd=1.2+rnd(0,.4);
    if(player.invuln<=0){
      takePlayerDamage(a.atk,a.damageType||'physical',a);
    }
  }

  a.frameT+=dt;
  if(a.frameT>.11){
    a.frameT=0;
    a.frame=(a.frame+1)%8;
    // Chọn đúng frame theo hướng di chuyển: right=00-07, left=08-15
    let dx2=player.x-a.x;
    let frameIdx = dx2 < 0 ? (a.frame + 8) : a.frame; // hướng trái thì flip
    if(spriteMats[a.type+frameIdx])a.mesh.material=spriteMats[a.type+frameIdx];
    else if(spriteMats[a.type+a.frame])a.mesh.material=spriteMats[a.type+a.frame];
  }
  a.mesh.position.x=a.x;
  a.mesh.position.z=a.z;
  a.mesh.position.y=a.size*.48;
  if(a.shadow){
    a.shadow.position.x=a.x;
    a.shadow.position.z=a.z;
  }
  // Orthographic: tuyệt đối không scale quái theo khoảng cách Z.
  // Scale perspective giả làm sprite lệch tỷ lệ so với player/props.
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
    let nx=mx/Math.max(1,l);
    let nz=mz/Math.max(1,l);
    let sp=Math.max(2.5,(S.moveSpeed||6.2)*getHeartMethodEffects().move);
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
    if(e.skillVfx&&e.mesh){
      let p=1-clamp(e.t/e.max,0,1);
      let k=(e.baseScale||1)*(0.72+0.28*Math.sin(Math.min(1,p)*Math.PI/2));
      e.mesh.scaling.setAll(k);
      e.mesh.visibility=clamp(e.t/0.16,0,1);
    }
    if(e.vx!=null){
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
    }
  }
  effects=effects.filter(e=>e.t>0);
}

function autoCombat(dt){
  if(!S.auto)return;
  autoTimer-=dt;
  if(autoTimer<=0){
    autoTimer=.52/Math.max(0.35,(S.attackSpeed||1)*getHeartMethodEffects().attack);
    let t=nearest(7.5);
    if(t)playerAttack(t,1);
    else if(actors.length<10)spawnPack();
  }
  for(let i=1;i<=4;i++){
    let skillId=(S.equippedSkills&&S.equippedSkills[i-1])||null;
    if(!skillId||cooldown[i]>0)continue;
    let sk=getSkillDef(skillId);
    if(!sk||S.mp<sk.mp)continue;
    if(sk.aoe===0){
      let tgt=nearest(9);
      if(tgt)useSkill(i);
    }else if(sk.aoe<=7.5){
      let cnt=actors.filter(a=>!a.dead&&dist(a,player)<sk.aoe).length;
      if(cnt>=2)useSkill(i);
    }else{
      if(boss&&dist(boss,player)<sk.aoe)useSkill(i);
      else if(actors.filter(a=>!a.dead&&dist(a,player)<sk.aoe).length>=3)useSkill(i);
    }
  }
}

function tick(){
  let now=performance.now(),dt=Math.min(.04,(now-last)/1000);
  last=now;
  if(gameStarted&&!paused){
    updatePlayer(dt);
    for(let a of [...actors])updateActor(a,dt);
    updateEffects(dt);
    for(let i=1;i<=4;i++)cooldown[i]=Math.max(0,cooldown[i]-dt);
    dashCd.t=Math.max(0,dashCd.t-dt);
    autoCombat(dt);
    
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
      spawnPack();
      spawnBoss();
    }
    miniTimer-=dt;
    if(miniTimer<=0){
      miniTimer=.25;
      drawMini();
      updateHUD();
    }
    updateCooldownUI();
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
  $('#gold').textContent=Math.floor(S.gold).toLocaleString();
  $('#stones').textContent=S.stones.toLocaleString();
  let petMult=S.pet?1.08:1.0;
  let defScore=COMBAT_DAMAGE_TYPES.reduce((v,t)=>v+Math.max(0,(S.defense&&S.defense[t])||0),0);
  let heartPower=getHeartMethodEffects().defense;
  $('#power').textContent=Math.round((S.maxHp*1.2+S.maxMp*.8+S.spiritSense*4+getTotalDamage()*45+defScore*18)*getRealmPowerMultiplier()*petMult*heartPower).toLocaleString();
  $('#questText').innerHTML=`[Chính] Diệt Yêu Thú <span>${Math.min(20,S.questKills)}/20</span>`;
  $('#autoBtn').classList.toggle('on',S.auto);
  $('#miniName').textContent=region().name;

  // Cập nhật các nút kỹ năng chiến đấu (HUD)
  for(let i=1;i<=4;i++){
    let btn=document.querySelector(`.skill[data-skill="${i}"]`);
    if(btn){
      let skillId=(S.equippedSkills&&S.equippedSkills[i-1])||null;
      let sk=skillId?getSkillDef(skillId):null;
      let img=btn.querySelector('img.skill-icon-img');
      let bTag=btn.querySelector('b');
      let cdSpan=btn.querySelector('span');
      if(!cdSpan){
        btn.innerHTML+=`<span id="cd${i}"></span>`;
      }
      if(sk){
        preloadSkillVfx(sk);
        if(!img){
          btn.innerHTML=`<img src="${sk.icon}" class="skill-icon-img" alt="${sk.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'"><b style="display:none">${sk.badge}</b><span id="cd${i}"></span>`;
        }else if(img.getAttribute('src')!==sk.icon){
          img.src=sk.icon;
          img.style.display='block';
        }
      }else{
        if(img||!bTag||bTag.textContent!=='+'){
          btn.innerHTML=`<b>+</b><span id="cd${i}"></span>`;
        }
      }
      btn.title=sk?`[${sk.tierName} · ${sk.rankName}] ${sk.name} (${sk.mp} MP) - Phím ${i}`:`Ô ${i} [Chưa trang bị] - Phím ${i}`;
      btn.style.opacity=(sk&&S.mp<sk.mp)?'0.45':'1';
    }
  }
  let dashBtn=$('#dashBtn');
  if(dashBtn&&!dashBtn.querySelector('img')){
    dashBtn.innerHTML=`<img src="assets/skills/common/dash.png" class="skill-icon-img" alt="Lướt" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'"><b style="display:none">💨</b><span id="cdDash"></span>`;
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
      let px=cx+(dx/RADAR_RANGE)*rx;
      let py=cy+(dz/RADAR_RANGE)*ry;
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
      let angle=Math.atan2(dz,dx);
      let edgeX=cx+Math.cos(angle)*(rx-4);
      let edgeY=cy+Math.sin(angle)*(ry-4);
      x.fillStyle='#ff9800';
      x.beginPath();
      x.arc(edgeX,edgeY,3.5,0,Math.PI*2);
      x.fill();
    }
  }

  // Nhân vật chính ở tâm Radar
  x.fillStyle='#00ffff';
  x.shadowColor='#00ffff';
  x.shadowBlur=6;
  x.beginPath();
  x.arc(cx,cy,3.5,0,Math.PI*2);
  x.fill();
  x.shadowBlur=0;

  // Hướng nhìn của nhân vật
  let dirX=player.facing==='left'?-1:1;
  x.strokeStyle='#00ffff';
  x.lineWidth=1.5;
  x.beginPath();
  x.moveTo(cx,cy);
  x.lineTo(cx+dirX*6,cy);
  x.stroke();

  // Tọa độ người chơi & Kích thước bản đồ
  x.fillStyle='rgba(255,255,255,0.75)';
  x.font='9px sans-serif';
  x.textAlign='center';
  x.fillText(`X:${Math.round(player.x)} Z:${Math.round(player.z)} (1000m)`,cx,c.height-3);
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

  let j=$('#joy'),k=$('#joyKnob');
  function move(e){
    if(!joy.active||e.pointerId!==joy.pid)return;
    let r=j.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,m=Math.hypot(dx,dy),max=r.width*.32;
    if(m>max){dx=dx/m*max;dy=dy/m*max}

    // Mobile dead-zone: loại bỏ rung/noise rất nhỏ của ngón tay quanh tâm joystick.
    let nx=dx/max, ny=-dy/max;
    let nm=Math.hypot(nx,ny);
    const JOY_DEADZONE=0.12;
    if(nm<JOY_DEADZONE){
      joy.x=0; joy.y=0;
      dx=0; dy=0;
    }else{
      // Remap phần còn lại về 0..1 để không tạo "bước nhảy" sau dead-zone.
      let scaled=(nm-JOY_DEADZONE)/(1-JOY_DEADZONE);
      joy.x=(nx/nm)*scaled;
      joy.y=(ny/nm)*scaled;
    }
    k.style.transform=`translate(${dx}px,${dy}px)`;
  }
  j.addEventListener('pointerdown',e=>{joy.active=true;joy.pid=e.pointerId;j.setPointerCapture(e.pointerId);move(e)});
  j.addEventListener('pointermove',move);
  let end=e=>{
    if(e.pointerId!==joy.pid)return;
    joy.active=false;joy.x=joy.y=0;
    k.style.transform='';
  };
  j.addEventListener('pointerup',end);
  j.addEventListener('pointercancel',end);

  $$('.skill').forEach(b=>{
    if(b.dataset.skill){
      b.addEventListener('pointerdown',e=>{e.preventDefault();useSkill(+b.dataset.skill)});
    }
  });
  $('#dashBtn').onclick=useDash;

  $('#autoBtn').onclick=()=>{
    S.auto=!S.auto;
    save();
    updateHUD();
    toast(S.auto?'⚔ Tự động chiến đấu: BẬT':'Tự động chiến đấu: TẮT');
  };

  $('#menuBtn').onclick=()=>$('#menuGrid').hidden=!$('#menuGrid').hidden;
  $$('[data-panel]').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.panel)));
  
  // Reliable panel close handlers
  $('#closePanel').onclick=closePanel;
  $('#panel').addEventListener('click',e=>{
    if(e.target===$('#panel'))closePanel();
  });

  // iOS/Chrome thay đổi visual viewport vài px khi thanh địa chỉ co/giãn.
  // Không cho thay đổi nhỏ đó cập nhật orthographic bounds vì sẽ làm map "nhảy" nhẹ.
  let lastViewportW=window.innerWidth;
  let lastViewportH=window.innerHeight;
  window.addEventListener('resize',()=>{
    const w=window.innerWidth, h=window.innerHeight;
    const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const orientationChanged=(w>h)!=(lastViewportW>lastViewportH);
    const majorResize=Math.abs(w-lastViewportW)>24 || Math.abs(h-lastViewportH)>120;
    if(!mobile || orientationChanged || majorResize){
      engine.resize();
      updateOrthoCameraBounds();
      lastViewportW=w;
      lastViewportH=h;
    }
  });
  document.addEventListener('visibilitychange',()=>{paused=document.hidden});
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
  }else if(name.includes('Linh Thạch')){
    const cultivateGain=Math.round(50*getTechniqueCultivationMultiplier()*getHeartMethodEffects().cultivation);
    S.cultivation+=cultivateGain;
    S.gold+=30;
    toast('💎 Hấp thụ Linh Thạch: +'+cultivateGain+' Tu vi, +30 Vàng');
    sfx('item');
  }else if(name.includes('Boss Hồn Tinh')){
    for(const t of COMBAT_DAMAGE_TYPES)S.damage[t]=(S.damage[t]||0)+3;
    S.maxHp+=100;
    S.hp=S.maxHp;
    toast('🔥 Dung hợp Hồn Tinh: +3 mỗi loại damage, +100 Sinh lực!');
    sfx('breakthrough');
  }else{
    toast('Đã sử dụng '+name);
  }
  save();
  updateHUD();
  openPanel('inventory');
}

function openPanel(kind){
  paused=true;
  $('#panel').hidden=false;
  $('#panel').style.display='grid';
  $('#menuGrid').hidden=true;
  let title='Túi Đồ',html='';

  try {
    if(kind==='inventory'){
      title='Túi Đồ · Đan Dược · Phù Lục · Pháp Bảo';
      let grade=gradeForLevel();
      let entries=Object.entries(S.items||{});
      html='<div class="cards">'+(entries.length?entries.map(([n,q])=>{
        let canUse=n.includes('Đan')||n.includes('Linh Thạch')||n.includes('Hồn Tinh');
        return `<div class="card"><div class="slot"><div class="icon">${n.includes('Kiếm')?'⚔':n.includes('Giáp')?'🛡':n.includes('Đan')?'🔴':n.includes('Hồn')?'🔥':'💎'}</div><div><b>${n}</b><br><small>Số lượng: ${q}</small></div></div>${canUse?`<button class="btn-use" data-use="${n}">Sử Dụng</button>`:''}</div>`;
      }).join(''):'<div class="card"><p>Túi đồ hiện đang trống</p></div>')+'</div>'+`<div class="card" style="margin-top:12px"><b>Phẩm cấp trang bị hiện tại: ${grade} phẩm</b><p>Nhất → Ngũ phẩm mở dần theo cảnh giới và cấp độ nhân vật.</p></div>`;
      setTimeout(()=>$$('[data-use]').forEach(b=>b.onclick=()=>useInventoryItem(b.dataset.use)),0);

    }else if(kind==='character'){
      title='Thông Tin Nhân Vật';
      let dmgRows=COMBAT_DAMAGE_TYPES.map(t=>`<div class="stat"><span>Damage ${DAMAGE_LABELS[t]}</span><b>${Math.round(getDamageComponent(t))} · Skill ${DAMAGE_LABELS[t]}: ${Math.round(getPlayerDamageStat(t))}</b></div>`).join('');
      let defRows=COMBAT_DAMAGE_TYPES.map(t=>`<div class="stat"><span>Phòng thủ ${DAMAGE_LABELS[t]}</span><b>${Math.round(getPlayerDefenseStat(t))}</b></div>`).join('');
      html=`
        <div class="card"><b>👤 Cơ Bản</b>
          <div class="stat"><span>Tên nhân vật</span><b>${S.name}</b></div>
          <div class="stat"><span>Cảnh giới</span><b>${realmName()}</b></div>
          <div class="stat"><span>Khu vực</span><b>${region().name}</b></div>
          <div class="stat"><span>Hệ kỹ năng</span><b>${S.skillElement}</b></div>
          <div class="stat"><span>Sinh lực (HP)</span><b>${Math.round(S.hp)} / ${S.maxHp}</b></div>
          <div class="stat"><span>Pháp lực (MP)</span><b>${Math.round(S.mp)} / ${S.maxMp}</b></div>
          <div class="stat"><span>Thần thức</span><b>${Math.round(S.spiritSense)}</b></div>
          <div class="stat"><span>Hệ số stat cảnh giới</span><b>${getRealmPowerText()}</b></div>
          <div class="stat"><span>Công pháp tu luyện</span><b>${getActiveTechnique().grade.name} · ${getActiveTechnique().rank.name} · ${getActiveTechnique().name}</b></div>
          <div class="stat"><span>Hệ số thuộc tính Công pháp</span><b>${CULTIVATION_TECH_LABELS[getActiveTechniqueType()]} ${getTechniqueStatText()}</b></div>
          <div class="stat"><span>Tâm pháp</span><b>${getHeartMethodDef().name} · Lv.${getHeartMethodLevel()}</b></div>
          <div class="stat"><span>Áp chế cảnh giới</span><b>+35% / tiểu cảnh · +75% / đại cảnh</b></div>
        </div>
        <div class="card" style="margin-top:8px"><b>⚔ Sát Thương</b>
          <div class="stat"><span>Damage Tổng</span><b>${Math.round(getTotalDamage())}</b></div>
          <div class="stat"><span>Ưu tiên đúng hệ</span><b>x${MATCHING_DAMAGE_MULT.toFixed(1)} phần damage đúng hệ</b></div>
          ${dmgRows}
          <div class="stat"><span>Tỷ lệ bạo kích</span><b>${Math.round((S.critChance||0)*100)}%</b></div>
          <div class="stat"><span>Sát thương bạo kích</span><b>${Math.round((S.critDamage||1.8)*100)}%</b></div>
        </div>
        <div class="card" style="margin-top:8px"><b>🛡 Phòng Thủ</b>${defRows}</div>
        <div class="card" style="margin-top:8px"><b>☯ Tốc Độ & Hồi Phục</b>
          <div class="stat"><span>Tốc độ di chuyển</span><b>${(S.moveSpeed||6.2).toFixed(2)} m/s</b></div>
          <div class="stat"><span>Tốc độ đánh</span><b>${Math.round((S.attackSpeed||1)*100)}%</b></div>
          <div class="stat"><span>Tốc độ thi triển</span><b>${Math.round((S.castSpeed||1)*100)}%</b></div>
          <div class="stat"><span>Hồi Sinh lực</span><b>${((S.hpRegenPct||0)*100).toFixed(1)}% / nhịp</b></div>
          <div class="stat"><span>Hồi Pháp lực</span><b>${((S.mpRegenPct||0)*100).toFixed(1)}% / nhịp</b></div>
          <div class="stat"><span>Linh Thú hỗ trợ</span><b>${S.pet?'Cửu Vĩ Linh Hồ (+8% sát thương)':'Không'}</b></div>
          <div class="stat"><span>Yêu thú đã diệt</span><b>${S.kills}</b></div>
        </div>`;

    }else if(kind==='skills'){
      title='Tàng Kinh Các · Kỹ Năng Cửu Hệ';
      let currentElem = S.skillElement || 'Kiếm';
      let currentTier = typeof S.skillTierTab === 'number' ? S.skillTierTab : 0;
      let tierDef = SKILL_TIERS[currentTier] || SKILL_TIERS[0];

      // 1. Equipped Bar
      let equippedHtml = `<div class="card" style="margin-bottom:8px">
        <b>⚔ Ô Kỹ Năng Đang Dùng (Chiến Đấu: Phím 1, 2, 3, 4)</b>
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
                <div style="width:36px;height:36px;border-radius:50%;border:1px dashed rgba(255,255,255,.3);display:grid;place-items:center;margin-bottom:4px;font-size:18px;color:#888">+</div>
                <b>[Ô ${slotIdx + 1} Trống]</b>
                <small>Chưa gán bí tịch</small>
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
        <b>📜 Đẳng Cấp Kỹ Năng:</b>
        <div class="skill-tabs">
          ${SKILL_TIERS.map((t, idx) => `
            <button data-skill-tier="${idx}" class="${currentTier === idx ? 'active' : ''}">
              ${t.name} (Y/c: ${realms[t.minRealm]})
            </button>
          `).join('')}
        </div>
      </div>`;

      // 4. 4 Skill Cards for the selected Tier & Element (Hạ Phẩm, Trung Phẩm, Thượng Phẩm, Cực Phẩm)
      let cardsHtml = '<div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">';
      for(let rankIdx = 0; rankIdx < 4; rankIdx++){
        let skillId = getSkillId(currentElem, currentTier, rankIdx);
        let sk = getSkillDef(skillId);
        let isLearned = S.learnedSkills && S.learnedSkills[skillId];
        let lv = isLearned ? S.learnedSkills[skillId] : 0;
        let canLearn = S.realm >= sk.minRealm && S.level >= sk.minLevel;
        let upCostStones = Math.round(sk.costStones * 0.75 * Math.max(1, lv));
        let upCostCult = Math.round(sk.costCult * 0.85 * Math.max(1, lv));
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
              ☯ Yêu cầu: <b>${realms[sk.minRealm]} (Lv.${sk.minLevel}+)</b>
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
                  return `<button data-equip-slot="${s}" data-equip-skill="${sk.id}" ${isCurrentInSlot ? 'disabled' : ''}>
                    ${isCurrentInSlot ? 'Đang Ô ' + s : 'Gán Ô ' + s}
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
          let upCostStones = Math.round(sk.costStones * 0.75 * curLv);
          let upCostCult = Math.round(sk.costCult * 0.85 * curLv);
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
      title='Tu Vi · Cảnh Giới · Công Pháp · Tâm Pháp';
      let need=S.realm===0
        ?Math.round(350*Math.pow(1.55,Math.max(0,(S.realmStage||1)-1)))
        :Math.round(9000*Math.pow(4,S.realm-1)*Math.pow(2.4,S.period||0));
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
          <b>☯ Cảnh giới: ${realmName()}</b>
          <p>Tu vi: ${S.cultivation} / ${need}</p>
          <p>Hệ số stat cảnh giới: <b>${getRealmPowerText()}</b></p>
          <p>Áp chế: <b>+35% mỗi tiểu cảnh · +75% mỗi đại cảnh chênh lệch</b></p>
          <p>Công pháp đang vận hành: <b>${activeTech.grade.name} · ${activeTech.rank.name} · ${activeTech.name}</b></p>
          <p>Hiệu suất Công pháp: <b>×${getTechniqueCultivationMultiplier().toFixed(2)} Tu vi</b></p>
          <p>Thuộc tính ${CULTIVATION_TECH_LABELS[getActiveTechniqueType()]}: <b>${getTechniqueStatText()}</b></p>
          <button class="action" id="breakBtn">Đột Phá Cảnh Giới</button>
        </div>
        <div class="card" style="margin-top:8px">
          <b>📚 Công pháp tu luyện</b>
          <p>Đại phẩm: Hoàng → Huyền → Địa → Thiên.</p>
          <p>Mỗi đại phẩm: Hạ phẩm → Trung phẩm → Thượng phẩm → Cực phẩm.</p>
          <p>Công pháp tăng hiệu suất Tu vi và nhân riêng thuộc tính đúng hệ đang tu; phẩm càng cao hệ số càng lớn.</p>
          <p>Công pháp phẩm cao bị khóa nếu cảnh giới hiện tại chưa đạt yêu cầu.</p>
        </div>
        <div class="cards">${techniqueCards}</div>
        <div class="card" style="margin-top:10px">
          <b>🧘 Tâm pháp đang vận hành: ${heart.grade} phẩm · ${heart.name} · Lv.${heartLv}</b>
          <p>Hồi phục ×${heartFx.regen.toFixed(2)} · Thần thức ×${heartFx.spirit.toFixed(2)} · Tu vi ×${heartFx.cultivation.toFixed(2)} · Phòng thủ ×${heartFx.defense.toFixed(2)}</p>
        </div>
        <div class="cards">${heartCards}</div>`;

      setTimeout(()=>{
        let bb=$('#breakBtn');
        if(bb)bb.onclick=()=>{
          if(S.realm>=realms.length-1&&(S.period||0)>=3)return toast('Đã đạt Hóa Thần · Đỉnh Phong');
          if(S.cultivation<need)return toast('Chưa đủ tu vi để đột phá');
          S.cultivation-=need;
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

    }else if(kind==='shop'){
      title='Tiên Phường';
      html='<div class="cards">'+[['Hồi Khí Đan',100,'🔴'],['Linh Thạch',250,'💎'],['Thanh Vân Kiếm',800,'⚔'],['Huyền Thiết Giáp',900,'🛡']].map(([n,p,ic])=>`<div class="card"><div class="icon">${ic}</div><b>${n}</b><p>🪙 ${p} Vàng</p><button data-buy="${n}" data-price="${p}">Mua</button></div>`).join('')+'</div>';
      setTimeout(()=>$$('[data-buy]').forEach(b=>b.onclick=()=>{
        let p=+b.dataset.price;
        if(S.gold<p)return toast('Không đủ vàng');
        S.gold-=p;
        addItem(b.dataset.buy,1);
        save();
        updateHUD();
        toast('Đã mua thành công '+b.dataset.buy);
        sfx('item');
      }),0);

    }else if(kind==='daily'){
      title='Phúc Lợi Tu Tiên';
      html=`<div class="card"><b>Quà đăng nhập tu tiên mỗi ngày</b><p>💎 25 Linh Thạch · 🪙 600 Vàng</p><button id="dailyBtn" ${S.daily?'disabled':''}>${S.daily?'Đã nhận hôm nay':'Nhận Phúc Lợi'}</button></div>`;
      setTimeout(()=>{$('#dailyBtn').onclick=()=>{
        if(S.daily)return;
        S.daily=true;
        S.stones+=25;
        S.gold+=600;
        save();
        updateHUD();
        openPanel('daily');
        toast('🎁 Đã nhận phúc lợi tu tiên');
        sfx('item');
      }},0);

    }else if(kind==='equipment'){
      title='Trang Bị Nhân Vật';
      html='<div class="cards">'+['weapon','armor','ring'].map((s,i)=>`<div class="card"><b>${['Vũ Khí','Áo Giáp','Nhẫn'][i]}</b><p>${(S.equipment&&S.equipment[s])||'Chưa trang bị'}</p><button data-equip="${s}">Trang bị món tốt nhất</button></div>`).join('')+'</div>';
      setTimeout(()=>$$('[data-equip]').forEach(b=>b.onclick=()=>equipBest(b.dataset.equip)),0);

    }else if(kind==='pet'){
      title='Linh Thú Đồng Hành';
      html=`<div class="card"><div class="icon">🦊</div><b>Cửu Vĩ Linh Hồ</b><p>${S.pet?'Đang xuất chiến · Hỗ trợ tấn công & +8% Sát thương':'Chưa triệu hồi'}</p><button id="petBtn">${S.pet?'Thu hồi Linh Thú':'Triệu hồi Xuất Chiến'}</button></div>`;
      setTimeout(()=>$('#petBtn').onclick=()=>{
        S.pet=!S.pet;
        syncPet();
        save();
        openPanel('pet');
        toast(S.pet?'🦊 Cửu Vĩ Linh Hồ xuất chiến!':'Linh Hồ đã thu hồi');
        sfx(S.pet?'levelUp':'item');
      },0);

    }else if(kind==='map'){
      title='Bản Đồ Thế Giới (8 Đại Khu Vực)';
      html=`<div class="cards">${regions.map((r,i)=>`<div class="card"><b>${r.kind} · ${r.name}</b><p>Lv.${r.min}–${r.max} · ${r.enemy.map(e=>({wolf:'Ma Lang',fox:'Linh Hồ',golem:'Thạch Khôi',shadow:'Ảnh Thú'})[e]).join(', ')}</p><button data-region="${i}" ${S.level<r.min?'disabled':''}>${i===S.region?'Đang ở đây':'Dịch chuyển'}</button></div>`).join('')}</div>`;
      setTimeout(()=>$$('[data-region]').forEach(b=>b.onclick=()=>{
        S.region=+b.dataset.region;
        actors.forEach(a=>a.mesh&&a.mesh.dispose());
        actors=[];
        boss=null;
        $('#bossBar').hidden=true;
        player.x=0;player.z=2;
        loadMap(S.region);
        for(let i=0;i<12;i++)spawnPack();
        save();
        closePanel();
        toast('🗺 Đã đến '+region().name);
        sfx('levelUp');
        updateHUD();
      }),0);

    }else{
      title='Cài Đặt & Hiệu Năng';
      html=`<div class="card"><b>Tùy chỉnh đồ họa</b><p>Chế độ: ${S.quality?'Chất lượng cao (60 FPS)':'Tiết kiệm pin'}</p><button id="qualityBtn">Đổi chế độ</button><button id="resetBtn" class="danger">Xóa dữ liệu chơi lại từ đầu</button></div>`;
      setTimeout(()=>{
        $('#qualityBtn').onclick=()=>{
          S.quality=S.quality?0:1;
          applyEngineScaling();
          save();
          openPanel('settings');
        };
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
  let dpr=Math.min(window.devicePixelRatio||1, 2.0);
  let scale=S.quality ? (1.0/dpr) : (1.0/Math.min(dpr, 1.25));
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
  paused=false;
  $('#panel').hidden=true;
  $('#panel').style.display='none';
}

async function init(){
  progress(10,'Khởi tạo Babylon.js Engine…');
  engine=new BABYLON.Engine(canvas,true,{
    preserveDrawingBuffer:false,
    stencil:false,
    antialias:true,
    powerPreference:'high-performance',
    adaptToDeviceRatio:true
  });
  applyEngineScaling();

  progress(30,'Dựng không gian tiên cảnh…');
  createWorld();

  progress(50,'Nạp tiên thể và linh thú…');
  preloadPlayerMaterials();
  createPlayer();
  preloadEnemySprites(); // Nạp 7 loại quái x 16 frames (right+left)
  await new Promise(r=>setTimeout(r,250));

  progress(75,'Khai mở trận pháp & yêu vực…');
  for(let i=0;i<16;i++)spawnPack();
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
    toast('☯ Chào mừng đạo hữu đến Thanh Vân Thôn');
    sfx('breakthrough');
    save();
  };

  engine.runRenderLoop(tick);
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
}

init().catch(e=>{
  console.error(e);
  loadMsg.textContent='Lỗi khởi tạo: '+e.message;
  startBtn.hidden=true;
});
})();

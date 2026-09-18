(()=>{'use strict';

const GRADES=window.GameConstants.GRADES.map(x=>({name:x.name,realm:x.realm}));
const QUALITY_MULT={ha:.7,trung:.85,thuong:1,cuc:1.2};
const QUALITIES=window.GameConstants.QUALITIES.map(x=>({...x,mult:QUALITY_MULT[x.id]}));
const PROF_NAMES={alchemy:'Luyện Đan Sư',forging:'Luyện Khí Sư',talisman:'Chế Phù Sư'};
const PROF_ICONS={alchemy:'💊',forging:'⚒️',talisman:'🧿'};
const PROF_MAT={alchemy:'linhThao',forging:'khoangThach',talisman:'phuChi'};
const MAT_NAMES={linhThao:'Linh Thảo',khoangThach:'Linh Khoáng',phuChi:'Phù Chỉ'};
const PROF_RANK_NEED=[80,220,520,900];

const PILL_RECIPES=[
  {id:'tu_khi',name:'Tụ Khí Đan',desc:'Tăng trực tiếp Tu vi.',effect:'cultivation'},
  {id:'hoi_khi',name:'Hồi Khí Đan',desc:'Hồi Sinh lực và Pháp lực.',effect:'restore'},
  {id:'duong_than',name:'Dưỡng Thần Đan',desc:'Bồi dưỡng vĩnh viễn Thần thức.',effect:'spirit'},
  {id:'luyen_the',name:'Luyện Thể Đan',desc:'Bồi dưỡng vĩnh viễn Sinh lực và Phòng thủ.',effect:'body'},
  {id:'duong_nguyen',name:'Dưỡng Nguyên Đan',desc:'Bồi dưỡng vĩnh viễn Pháp lực tối đa.',effect:'mana'},
  {id:'thuoc_tinh',name:'Ngũ Hành Linh Đan',desc:'Bồi dưỡng Damage thuộc hệ đang sử dụng.',effect:'element'},
  {id:'pha_canh',name:'Phá Cảnh Đan',desc:'Hỗ trợ lần đột phá cảnh giới kế tiếp.',effect:'breakthrough'}
];

const TALISMAN_RECIPES=[
  {id:'thien_loi',name:'Thiên Lôi Phù',kind:'attack',element:'Lôi',aoe:5.5,desc:'Một kích toàn lực cảnh giới tương ứng, gây Lôi sát diện rộng.'},
  {id:'hoa_long',name:'Hỏa Long Phù',kind:'attack',element:'Hỏa',aoe:4.2,desc:'Một kích toàn lực cảnh giới tương ứng, bộc phát Hỏa sát.'},
  {id:'kiem_khi',name:'Kiếm Khí Phù',kind:'attack',element:'physical',aoe:0,desc:'Một kích toàn lực tập trung vào một mục tiêu.'},
  {id:'kim_cang',name:'Kim Cang Phù',kind:'defense',element:'Kim',desc:'Tạo hộ thuẫn mang cấp áp chế của lá phù.'},
  {id:'dinh_than',name:'Định Thân Phù',kind:'control',element:'Phong',desc:'Khống chế mục tiêu trong phạm vi; cảnh giới chênh lệch ảnh hưởng thời gian.'},
  {id:'than_hanh',name:'Thần Hành Phù',kind:'support',element:'Phong',desc:'Tăng tốc độ di chuyển và vận hành trong thời gian ngắn.'}
];

const FORMATION_DEFS=[
  {id:'tu_linh',name:'Tụ Linh Trận',kind:'support',desc:'Tăng Tu vi nhận được khi đứng trong trận.'},
  {id:'kim_cang',name:'Kim Cang Hộ Sơn Trận',kind:'defense',desc:'Tăng mạnh phòng thủ khi đứng trong trận.'},
  {id:'thien_loi',name:'Thiên Lôi Tru Tà Trận',kind:'attack',element:'Lôi',desc:'Theo chu kỳ giáng lôi trong phạm vi trận; dùng áp chế cảnh giới của trận.'},
  {id:'bat_mon',name:'Bát Môn Khốn Tiên Trận',kind:'control',element:'Phong',desc:'Theo chu kỳ trấn áp và định thân kẻ địch trong trận.'}
];

const FORGING_RECIPES=[
  {id:'phi_kiem',name:'Thanh Vân Phi Kiếm',kind:'gear',gear:'weapon',desc:'Vũ khí luyện khí theo Đại phẩm.'},
  {id:'huyen_giap',name:'Huyền Thiết Giáp',kind:'gear',gear:'armor',desc:'Giáp luyện khí theo Đại phẩm.'},
  {id:'linh_gioi',name:'Ngọc Linh Giới',kind:'gear',gear:'ring',desc:'Nhẫn luyện khí theo Đại phẩm.'}
].concat(FORMATION_DEFS.map(function(f){
  return {id:'formation_'+f.id,name:'Trận Bàn · '+f.name,kind:'formation',formationId:f.id,desc:'Trận Bàn tái sử dụng; kích hoạt tiêu hao Pháp lực và Linh Thạch.'};
}));

const ALL_RECIPES={
  alchemy:PILL_RECIPES,
  forging:FORGING_RECIPES,
  talisman:TALISMAN_RECIPES
};

const PEAK_ATTACK=[520,1900,7200,27000,98000];
const TALISMAN_SPIRIT_REQ=[100,350,1000,3000,9000];
const TALISMAN_MP_PCT=[.12,.20,.32,.48,.65];
const FORM_SPIRIT_REQ=[150,450,1300,3800,11000];
const FORM_MP_PCT=[.18,.25,.35,.50,.65];
const FORM_STONE_COST=[5,15,45,135,400];
const FORM_RANGE=[8,10,12,14,16];
const FORM_DURATION=[90,105,120,140,165];

// Trần mà Đan dược được phép bồi dưỡng khi nhân vật đang ở từng đại cảnh giới.
// Mỗi hàng là cực hạn tương ứng với cảnh giới kế tiếp; Hóa Thần dùng cực hạn endgame hiện tại.
const PILL_NEXT_REALM_CAPS=[
  {maxHp:10000,maxMp:2500,spiritSense:900,damage:400,defense:180},
  {maxHp:25000,maxMp:7000,spiritSense:2200,damage:1200,defense:500},
  {maxHp:70000,maxMp:20000,spiritSense:6500,damage:3600,defense:1500},
  {maxHp:200000,maxMp:60000,spiritSense:18000,damage:10500,defense:4500},
  {maxHp:500000,maxMp:150000,spiritSense:50000,damage:30000,defense:12000}
];

function clone(v){return JSON.parse(JSON.stringify(v));}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function stateTemplate(){
  return {
    version:1,
    professions:{
      alchemy:{grade:0,rank:0,mastery:0},
      forging:{grade:0,rank:0,mastery:0},
      talisman:{grade:0,rank:0,mastery:0}
    },
    materials:{linhThao:12,khoangThach:10,phuChi:10},
    knownRecipes:{
      alchemy:['tu_khi','hoi_khi','duong_than'],
      forging:['phi_kiem','formation_tu_linh'],
      talisman:['thien_loi','kim_cang']
    },
    recipeMastery:{},
    pillInventory:{},
    talismanInventory:{},
    formationInventory:{},
    uiGrade:{alchemy:0,forging:0,talisman:0},
    activeFormation:null,
    ward:null,
    hasteUntil:0,
    hasteMult:1,
    breakthroughAid:null,
    legacyMigrated:false
  };
}
function defaultState(){return stateTemplate();}
function ensureObj(o,k,fallback){
  if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]=clone(fallback);
}
function migrate(S){
  if(!S.progressionSystems||typeof S.progressionSystems!=='object')S.progressionSystems=stateTemplate();
  var p=S.progressionSystems,t=stateTemplate();
  ensureObj(p,'professions',t.professions);
  ['alchemy','forging','talisman'].forEach(function(k){
    if(!p.professions[k]||typeof p.professions[k]!=='object')p.professions[k]=clone(t.professions[k]);
    var x=p.professions[k];
    x.grade=clamp(Number(x.grade)||0,0,4);
    x.rank=clamp(Number(x.rank)||0,0,3);
    x.mastery=Math.max(0,Number(x.mastery)||0);
  });
  ensureObj(p,'materials',t.materials);
  ['linhThao','khoangThach','phuChi'].forEach(function(k){if(typeof p.materials[k]!=='number')p.materials[k]=0;});
  ensureObj(p,'knownRecipes',t.knownRecipes);
  ['alchemy','forging','talisman'].forEach(function(k){
    if(!Array.isArray(p.knownRecipes[k]))p.knownRecipes[k]=clone(t.knownRecipes[k]);
  });
  ensureObj(p,'recipeMastery',{});
  ensureObj(p,'pillInventory',{});
  ensureObj(p,'talismanInventory',{});
  ensureObj(p,'formationInventory',{});
  ensureObj(p,'uiGrade',t.uiGrade);
  if(typeof p.hasteUntil!=='number')p.hasteUntil=0;
  if(typeof p.hasteMult!=='number')p.hasteMult=1;
  if(!('activeFormation' in p))p.activeFormation=null;
  if(!('ward' in p))p.ward=null;
  if(!('breakthroughAid' in p))p.breakthroughAid=null;

  // Chuyển dữ liệu thử nghiệm cũ sang hệ vật phẩm mới đúng 1 lần.
  if(!p.legacyMigrated){
    var oldPills=S.pills&&Number(S.pills[1])||0;
    var oldTal=S.talismans&&Number(S.talismans[1])||0;
    if(oldPills>0)addCount(p.pillInventory,makeKey('hoi_khi',0,0),oldPills);
    if(oldTal>0)addCount(p.talismanInventory,makeKey('thien_loi',0,0),oldTal);
    p.legacyMigrated=true;
  }
  return p;
}
function getSys(S){return migrate(S);}
function makeKey(id,grade,rank){return id+'|'+grade+'|'+rank;}
function parseKey(key){
  var s=String(key).split('|');
  return {id:s[0],grade:clamp(Number(s[1])||0,0,4),rank:clamp(Number(s[2])||0,0,3)};
}
function addCount(obj,key,n){obj[key]=(obj[key]||0)+n;}
function removeCount(obj,key,n){
  n=n||1;
  if(!obj[key]||obj[key]<n)return false;
  obj[key]-=n;
  if(obj[key]<=0)delete obj[key];
  return true;
}
function recipeById(type,id){
  return (ALL_RECIPES[type]||[]).find(function(r){return r.id===id;})||null;
}
function qualityName(rank){return (QUALITIES[rank]||QUALITIES[0]).name;}
function gradeName(grade){return (GRADES[grade]||GRADES[0]).name;}
function displayName(recipe,grade,rank){return gradeName(grade)+' · '+qualityName(rank)+' · '+recipe.name;}
function realmPeakScore(major){
  major=clamp(major,0,4);
  return major===0?11:12+(major-1)*4+3;
}
function actorInfo(a){
  if(!a)return {major:0,score:0};
  if(a.realmInfo)return a.realmInfo;
  return {major:0,score:Math.max(0,Math.min(11,(a.enemyLv||1)-1))};
}
function suppression(attScore,attMajor,defScore,defMajor){
  if(window.RealmSystem)return window.RealmSystem.getSuppression({score:attScore,major:attMajor},{score:defScore,major:defMajor});
  var diff=attScore-defScore;
  if(diff<=0)return 1;
  var majorDiff=Math.max(0,attMajor-defMajor);
  return Math.min(12,Math.pow(1.35,diff)*Math.pow(1.75,majorDiff));
}
function sourceVsActorFactor(major,a){
  var ai=actorInfo(a),score=realmPeakScore(major);
  var atk=suppression(score,major,ai.score,ai.major);
  var def=suppression(ai.score,ai.major,score,major);
  return atk/Math.max(1,def);
}
function professionMaxGrade(S,type){
  var p=getSys(S).professions[type];
  return Math.min(clamp(Number(S.realm)||0,0,4),p.grade);
}
function recipeMasteryKey(type,id,grade){return type+':'+id+':'+grade;}
function recipeMastery(S,type,id,grade){
  return Number(getSys(S).recipeMastery[recipeMasteryKey(type,id,grade)])||0;
}
function addRecipeMastery(S,type,id,grade,n){
  var sys=getSys(S),k=recipeMasteryKey(type,id,grade);
  sys.recipeMastery[k]=(sys.recipeMastery[k]||0)+n;
}
function craftCosts(type,grade){
  var scale=Math.pow(2.15,grade);
  var mat=Math.round((2.5+grade*1.5)*scale);
  var stones=Math.round((6+grade*7)*Math.pow(2.1,grade));
  var gold=Math.round((80+grade*120)*Math.pow(1.9,grade));
  return {mat:mat,stones:stones,gold:gold};
}
function rollQuality(S,type,id,grade){
  var p=getSys(S).professions[type];
  var mastery=recipeMastery(S,type,id,grade);
  var r=Math.random()+Math.min(.18,mastery/1800);
  var q=0;
  if(p.rank>=1&&r>.42)q=1;
  if(p.rank>=2&&r>.70)q=2;
  if(p.rank>=3&&r>.90)q=3;
  return Math.min(q,p.rank);
}
function gainProfession(S,type,amount,ctx){
  var p=getSys(S).professions[type];
  p.mastery+=Math.max(1,Math.round(amount));
  if(p.rank<3){
    var need=PROF_RANK_NEED[p.rank];
    if(p.mastery>=need){
      p.mastery-=need;
      p.rank++;
      if(ctx&&ctx.toast)ctx.toast(PROF_ICONS[type]+' '+PROF_NAMES[type]+' đạt '+qualityName(p.rank)+'!');
      if(ctx&&ctx.sfx)ctx.sfx('levelUp');
    }
  }
}
function advanceProfession(S,type,ctx){
  var p=getSys(S).professions[type];
  if(p.rank<3)return ctx.toast('Cần đạt Cực phẩm nghề hiện tại trước khi đột phá Đại phẩm.');
  if(p.mastery<PROF_RANK_NEED[3])return ctx.toast('Độ thuần thục nghề chưa đủ để đột phá.');
  if((S.realm||0)<=p.grade)return ctx.toast('Cảnh giới hiện tại chưa cho phép luyện chế Đại phẩm cao hơn.');
  if(p.grade>=4)return ctx.toast('Nghề đã đạt Ngũ Phẩm.');
  p.grade++;
  p.rank=0;
  p.mastery=0;
  getSys(S).uiGrade[type]=p.grade;
  ctx.save();ctx.updateHUD();
  ctx.toast(PROF_ICONS[type]+' '+PROF_NAMES[type]+' đột phá '+gradeName(p.grade)+'!');
  ctx.sfx('breakthrough');
  ctx.openPanel('crafting');
}
function craftItem(S,type,id,grade,ctx){
  var sys=getSys(S),p=sys.professions[type],recipe=recipeById(type,id);
  grade=clamp(Number(grade)||0,0,4);
  if(!recipe)return ctx.toast('Công thức không tồn tại.');
  if(sys.knownRecipes[type].indexOf(id)<0)return ctx.toast('Chưa lĩnh ngộ công thức này.');
  if(grade>p.grade)return ctx.toast('Trình độ nghề chưa đủ Đại phẩm.');
  if(grade>(S.realm||0))return ctx.toast('Cảnh giới hiện tại không thể luyện chế '+gradeName(grade)+'.');
  var cost=craftCosts(type,grade),matKey=PROF_MAT[type];
  if((sys.materials[matKey]||0)<cost.mat)return ctx.toast('Không đủ '+MAT_NAMES[matKey]+'.');
  if((S.stones||0)<cost.stones)return ctx.toast('Không đủ Linh Thạch.');
  if((S.gold||0)<cost.gold)return ctx.toast('Không đủ Vàng.');
  sys.materials[matKey]-=cost.mat;
  S.stones-=cost.stones;
  S.gold-=cost.gold;

  var fail=Math.max(.02,.16-grade*.01-p.rank*.035-recipeMastery(S,type,id,grade)/5000);
  if(Math.random()<fail){
    addRecipeMastery(S,type,id,grade,5);
    gainProfession(S,type,10+grade*5,ctx);
    ctx.save();ctx.updateHUD();ctx.openPanel('crafting');
    ctx.toast('💥 Luyện chế thất bại, đã tích lũy thêm kinh nghiệm.');
    return;
  }

  var rank=rollQuality(S,type,id,grade);
  var key=makeKey(id,grade,rank);
  if(type==='alchemy'){
    addCount(sys.pillInventory,key,1);
  }else if(type==='talisman'){
    addCount(sys.talismanInventory,key,1);
  }else if(recipe.kind==='formation'){
    addCount(sys.formationInventory,makeKey(recipe.formationId,grade,rank),1);
  }else{
    var prefix=gradeName(grade)+' · '+qualityName(rank)+' ';
    if(!S.items||typeof S.items!=='object')S.items={};
    addCount(S.items,prefix+recipe.name,1);
  }
  addRecipeMastery(S,type,id,grade,12+grade*5);
  gainProfession(S,type,18+grade*10,ctx);
  ctx.save();ctx.updateHUD();ctx.openPanel('crafting');
  ctx.toast('✨ Luyện chế thành công: '+displayName(recipe,grade,rank));
  ctx.sfx(rank>=2?'breakthrough':'item');
}
function discoverRecipe(S,ctx){
  var sys=getSys(S),candidates=[];
  Object.keys(ALL_RECIPES).forEach(function(type){
    ALL_RECIPES[type].forEach(function(r){
      if(sys.knownRecipes[type].indexOf(r.id)<0)candidates.push({type:type,recipe:r});
    });
  });
  if(!candidates.length)return false;
  var pick=candidates[Math.floor(Math.random()*candidates.length)];
  sys.knownRecipes[pick.type].push(pick.recipe.id);
  if(ctx&&ctx.toast)ctx.toast('📜 Lĩnh ngộ '+pick.recipe.name+' · '+PROF_NAMES[pick.type]);
  if(ctx&&ctx.sfx)ctx.sfx('item');
  return true;
}

function getPillCaps(S){return PILL_NEXT_REALM_CAPS[clamp(Number(S.realm)||0,0,4)];}
function addCappedScalar(S,field,amount,cap){
  var cur=Number(S[field])||0;
  if(cur>=cap)return 0;
  var add=Math.min(amount,cap-cur);
  S[field]=cur+add;
  return add;
}
function addCappedDamage(S,type,amount,cap){
  if(!S.damage||typeof S.damage!=='object')S.damage={};
  var cur=Number(S.damage[type])||0;
  if(cur>=cap)return 0;
  var add=Math.min(amount,cap-cur);
  S.damage[type]=cur+add;
  return add;
}
function addCappedDefense(S,type,amount,cap){
  if(!S.defense||typeof S.defense!=='object')S.defense={};
  var cur=Number(S.defense[type])||0;
  if(cur>=cap)return 0;
  var add=Math.min(amount,cap-cur);
  S.defense[type]=cur+add;
  return add;
}
function pillBase(effect,grade){
  var tables={
    cultivation:[180,900,4500,22000,110000],
    spirit:[8,24,70,210,650],
    hp:[160,480,1400,4200,12500],
    defense:[2,6,18,54,160],
    mana:[45,135,400,1200,3600],
    damage:[4,12,35,105,315]
  };
  return tables[effect]?tables[effect][grade]:0;
}
function usePill(S,key,ctx){
  var sys=getSys(S),meta=parseKey(key),r=recipeById('alchemy',meta.id);
  if(!r||!sys.pillInventory[key])return ctx.toast('Không còn đan dược.');
  var q=QUALITIES[meta.rank].mult,caps=getPillCaps(S),used=true,msg='';
  if(r.effect==='cultivation'){
    var gain=Math.round(pillBase('cultivation',meta.grade)*q);
    S.cultivation=(S.cultivation||0)+gain;msg='+'+gain+' Tu vi';
  }else if(r.effect==='restore'){
    var pct=Math.min(1,(.42+meta.grade*.11)*q);
    var oldHp=S.hp,oldMp=S.mp;
    S.hp=Math.min(S.maxHp,S.hp+S.maxHp*pct);
    S.mp=Math.min(S.maxMp,S.mp+S.maxMp*pct);
    if(S.hp===oldHp&&S.mp===oldMp)used=false;
    msg='Hồi '+Math.round(pct*100)+'% Sinh lực & Pháp lực';
  }else if(r.effect==='spirit'){
    var a=addCappedScalar(S,'spiritSense',Math.round(pillBase('spirit',meta.grade)*q),caps.spiritSense);
    if(a<=0)used=false;msg='Thần thức +'+Math.round(a);
  }else if(r.effect==='mana'){
    var am=addCappedScalar(S,'maxMp',Math.round(pillBase('mana',meta.grade)*q),caps.maxMp);
    if(am>0)S.mp=Math.min(S.maxMp,S.mp+am);
    if(am<=0)used=false;msg='Pháp lực tối đa +'+Math.round(am);
  }else if(r.effect==='body'){
    var ah=addCappedScalar(S,'maxHp',Math.round(pillBase('hp',meta.grade)*q),caps.maxHp);
    var ad=0;
    ['physical','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi'].forEach(function(t){
      ad+=addCappedDefense(S,t,Math.max(1,Math.round(pillBase('defense',meta.grade)*q)),caps.defense);
    });
    if(ah>0)S.hp=Math.min(S.maxHp,S.hp+ah);
    if(ah<=0&&ad<=0)used=false;
    msg='Sinh lực +'+Math.round(ah)+' · Phòng thủ được bồi dưỡng';
  }else if(r.effect==='element'){
    var type=S.skillElement||'physical';
    if(type==='Kiếm'||type==='Đao')type='physical';
    var ae=addCappedDamage(S,type,Math.round(pillBase('damage',meta.grade)*q),caps.damage);
    if(ae<=0)used=false;msg='Damage '+type+' +'+Math.round(ae);
  }else if(r.effect==='breakthrough'){
    sys.breakthroughAid={grade:meta.grade,rank:meta.rank};
    msg='Dược lực Phá Cảnh đã sẵn sàng cho lần đột phá kế tiếp';
  }
  if(!used)return ctx.toast('Dược lực đã đạt cực hạn mà cảnh giới hiện tại có thể dung nạp.');
  removeCount(sys.pillInventory,key,1);
  ctx.save();ctx.updateHUD();ctx.openPanel('inventory');
  ctx.toast('💊 '+r.name+': '+msg);
  ctx.sfx('item');
}
function getBreakthroughNeed(S,baseNeed){
  var aid=getSys(S).breakthroughAid;
  if(!aid)return baseNeed;
  if(aid.grade<(S.realm||0))return baseNeed;
  var reduce=[.06,.09,.12,.16][aid.rank]||.06;
  return Math.max(1,Math.round(baseNeed*(1-reduce)));
}
function consumeBreakthroughAid(S){getSys(S).breakthroughAid=null;}

function talismanRequirements(grade,S){
  return {
    spirit:TALISMAN_SPIRIT_REQ[grade],
    mp:Math.max(1,Math.round((S.maxMp||1)*TALISMAN_MP_PCT[grade]))
  };
}
function consumeTalisman(S,key){return removeCount(getSys(S).talismanInventory,key,1);}
function useTalisman(S,key,ctx){
  var sys=getSys(S),meta=parseKey(key),r=recipeById('talisman',meta.id);
  if(!r||!sys.talismanInventory[key])return ctx.toast('Không còn phù lục.');
  if((S.realm||0)<meta.grade)return ctx.toast('Cảnh giới hiện tại chưa đủ để kích hoạt '+gradeName(meta.grade)+'.');
  var req=talismanRequirements(meta.grade,S);
  if((S.spiritSense||0)<req.spirit)return ctx.toast('Thần thức không đủ. Yêu cầu '+req.spirit+'.');
  if((S.mp||0)<req.mp)return ctx.toast('Pháp lực không đủ. Yêu cầu '+req.mp+' MP.');
  var q=QUALITIES[meta.rank].mult,actors=ctx.getActors(),player=ctx.getPlayer();
  if(r.kind==='attack'){
    var valid=actors.filter(function(a){return !a.dead&&Math.hypot(a.x-player.x,a.z-player.z)<=18+meta.grade*2;});
    if(!valid.length)return ctx.toast('Không có mục tiêu trong phạm vi phù.');
    valid.sort(function(a,b){return Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z);});
    var primary=valid[0],targets=r.aoe?valid.filter(function(a){return Math.hypot(a.x-primary.x,a.z-primary.z)<=r.aoe;}).slice(0,8):[primary];
    S.mp-=req.mp;
    consumeTalisman(S,key);
    targets.forEach(function(a){ctx.realmDamage(a,PEAK_ATTACK[meta.grade]*q,meta.grade,r.element,false,'Phù');});
    if(ctx.burst)ctx.burst(primary.x,primary.z,r.element==='Hỏa'?'#ff6b3d':r.element==='Lôi'?'#9d8cff':'#ffe29b',24+meta.grade*6,4+meta.grade);
    ctx.toast('🧿 '+displayName(r,meta.grade,meta.rank)+' — một kích toàn lực '+gradeName(meta.grade)+'!');
  }else if(r.kind==='defense'){
    S.mp-=req.mp;consumeTalisman(S,key);
    sys.ward={major:meta.grade,rank:meta.rank,until:Date.now()+(18+meta.grade*4)*1000};
    ctx.toast('🛡 Kim Cang Phù đã hình thành hộ thuẫn cấp '+gradeName(meta.grade)+'.');
  }else if(r.kind==='control'){
    var inRange=actors.filter(function(a){return !a.dead&&Math.hypot(a.x-player.x,a.z-player.z)<=8+meta.grade*1.5;});
    if(!inRange.length)return ctx.toast('Không có mục tiêu để trấn áp.');
    S.mp-=req.mp;consumeTalisman(S,key);
    inRange.forEach(function(a){
      var factor=sourceVsActorFactor(meta.grade,a);
      a.stunT=Math.max(a.stunT||0,clamp(2.2*q*factor,.35,8));
    });
    ctx.toast('🔒 Định Thân Phù trấn áp '+inRange.length+' mục tiêu.');
  }else{
    S.mp-=req.mp;consumeTalisman(S,key);
    sys.hasteUntil=Date.now()+(22+meta.grade*4)*1000;
    sys.hasteMult=1+(0.12+meta.grade*.035)*q;
    ctx.toast('🌪 Thần Hành Phù: tốc độ ×'+sys.hasteMult.toFixed(2)+'.');
  }
  ctx.save();ctx.updateHUD();ctx.openPanel('inventory');ctx.sfx('skill2');
}
function getWardInfo(S){
  var w=getSys(S).ward;
  if(!w)return null;
  if(Date.now()>=w.until){getSys(S).ward=null;return null;}
  return {major:w.major,score:realmPeakScore(w.major),quality:QUALITIES[w.rank].mult};
}
function getMoveMultiplier(S){
  var sys=getSys(S);
  if(Date.now()>=sys.hasteUntil)return 1;
  return Math.max(1,sys.hasteMult||1);
}

function formationById(id){return FORMATION_DEFS.find(function(f){return f.id===id;})||null;}
function activateFormation(S,key,ctx){
  var sys=getSys(S),meta=parseKey(key),f=formationById(meta.id);
  if(!f||!sys.formationInventory[key])return ctx.toast('Không có Trận Bàn này.');
  if((S.realm||0)<meta.grade)return ctx.toast('Cảnh giới chưa đủ để vận hành '+gradeName(meta.grade)+' trận.');
  var spirit=FORM_SPIRIT_REQ[meta.grade],mp=Math.round(S.maxMp*FORM_MP_PCT[meta.grade]),stones=FORM_STONE_COST[meta.grade];
  if((S.spiritSense||0)<spirit)return ctx.toast('Thần thức không đủ. Yêu cầu '+spirit+'.');
  if((S.mp||0)<mp)return ctx.toast('Pháp lực không đủ. Yêu cầu '+mp+' MP.');
  if((S.stones||0)<stones)return ctx.toast('Không đủ '+stones+' Linh Thạch để vận hành trận.');
  var p=ctx.getPlayer();
  S.mp-=mp;S.stones-=stones;
  sys.activeFormation={
    id:meta.id,grade:meta.grade,rank:meta.rank,
    x:p.x,z:p.z,
    remaining:FORM_DURATION[meta.grade]*(1+meta.rank*.12),
    pulse:0
  };
  if(ctx.ring)ctx.ring(p.x,p.z,f.kind==='attack'?'#9d8cff':f.kind==='defense'?'#ffd86b':'#74e6c0',FORM_RANGE[meta.grade]);
  ctx.save();ctx.updateHUD();ctx.openPanel('formations');
  ctx.toast('☯ Đã bố trí '+displayName(f,meta.grade,meta.rank)+'.');
  ctx.sfx('breakthrough');
}
function insideFormation(S,player){
  var af=getSys(S).activeFormation;
  if(!af||!player)return false;
  return Math.hypot(player.x-af.x,player.z-af.z)<=FORM_RANGE[af.grade];
}
function getCultivationMultiplier(S,player){
  var af=getSys(S).activeFormation;
  if(!af||af.id!=='tu_linh'||!insideFormation(S,player))return 1;
  var q=QUALITIES[af.rank].mult;
  return 1+(.12+af.grade*.08)*q;
}
function getDefenseMultiplier(S,player){
  var af=getSys(S).activeFormation;
  if(!af||af.id!=='kim_cang'||!insideFormation(S,player))return 1;
  var q=QUALITIES[af.rank].mult;
  return 1+(.20+af.grade*.12)*q;
}
function update(S,dt,ctx){
  var sys=getSys(S),af=sys.activeFormation;
  if(!af)return;
  af.remaining-=dt;
  if(af.remaining<=0){
    sys.activeFormation=null;
    ctx.toast('☯ Trận pháp đã tiêu tán.');
    ctx.save();return;
  }
  af.pulse=(af.pulse||0)-dt;
  if(af.pulse>0)return;
  af.pulse=2.0;
  var f=formationById(af.id),range=FORM_RANGE[af.grade],q=QUALITIES[af.rank].mult;
  var targets=ctx.getActors().filter(function(a){return !a.dead&&Math.hypot(a.x-af.x,a.z-af.z)<=range;});
  if(f&&f.kind==='attack'){
    targets.slice(0,10).forEach(function(a){ctx.realmDamage(a,PEAK_ATTACK[af.grade]*.34*q,af.grade,f.element||'Lôi',false,'Trận');});
    if(targets.length&&ctx.ring)ctx.ring(af.x,af.z,'#9d8cff',range*.92);
  }else if(f&&f.kind==='control'){
    targets.forEach(function(a){
      var factor=sourceVsActorFactor(af.grade,a);
      a.stunT=Math.max(a.stunT||0,clamp(.75*q*factor,.15,2.2));
    });
  }
}
function stopFormation(S,ctx){
  getSys(S).activeFormation=null;
  ctx.save();ctx.openPanel('formations');ctx.toast('Đã thu hồi trận pháp.');
}
function onKill(S,a,ctx){
  var sys=getSys(S),boss=!!(a&&a.boss);
  var roll=Math.random();
  var qty=boss?3+Math.floor(Math.random()*4):1;
  if(roll<.16){sys.materials.linhThao+=qty;if(boss)ctx.toast('🌿 Thu được Linh Thảo x'+qty);}
  else if(roll<.28){sys.materials.khoangThach+=qty;if(boss)ctx.toast('⛏ Thu được Linh Khoáng x'+qty);}
  else if(roll<.38){sys.materials.phuChi+=qty;if(boss)ctx.toast('📜 Thu được Phù Chỉ x'+qty);}
  if(Math.random()<(boss?.16:.018))discoverRecipe(S,ctx);
}

function professionSummary(S){
  var sys=getSys(S);
  return '<div class="card" style="margin-top:8px"><b>⚒ Nghề chế tạo</b>'+
    ['alchemy','forging','talisman'].map(function(t){
      var p=sys.professions[t];
      return '<div class="stat"><span>'+PROF_ICONS[t]+' '+PROF_NAMES[t]+'</span><b>'+gradeName(p.grade)+' · '+qualityName(p.rank)+'</b></div>';
    }).join('')+'</div>';
}
function materialSummary(S){
  var m=getSys(S).materials;
  return '<div class="card"><b>🧰 Nguyên liệu nghề</b>'+
    '<div class="stat"><span>🌿 Linh Thảo</span><b>'+m.linhThao+'</b></div>'+
    '<div class="stat"><span>⛏ Linh Khoáng</span><b>'+m.khoangThach+'</b></div>'+
    '<div class="stat"><span>📜 Phù Chỉ</span><b>'+m.phuChi+'</b></div>'+
    '<button data-open-system="crafting">Mở Nghề Chế Tạo</button><button data-open-system="formations">Mở Trận Pháp</button></div>';
}
function inventoryCards(obj,type){
  var rows=Object.keys(obj||{});
  if(!rows.length)return '';
  return rows.map(function(k){
    var m=parseKey(k),r=type==='pill'?recipeById('alchemy',m.id):type==='talisman'?recipeById('talisman',m.id):formationById(m.id);
    if(!r)return '';
    var action=type==='pill'?'Dùng Đan':type==='talisman'?'Kích Hoạt Phù':'Bố Trí Trận';
    var attr=type==='pill'?'data-use-pill':type==='talisman'?'data-use-talisman':'data-use-formation';
    return '<div class="card"><b>'+(type==='pill'?'💊 ':type==='talisman'?'🧿 ':'☯ ')+displayName(r,m.grade,m.rank)+'</b>'+
      '<p>'+r.desc+'</p><p>Số lượng: <b>'+obj[k]+'</b></p><button '+attr+'="'+k+'">'+action+'</button></div>';
  }).join('');
}
function renderInventory(S,ctx){
  var sys=getSys(S);
  var html='<div style="margin-top:12px">'+materialSummary(S)+'</div>';
  var pills=inventoryCards(sys.pillInventory,'pill');
  var tal=inventoryCards(sys.talismanInventory,'talisman');
  var formations=inventoryCards(sys.formationInventory,'formation');
  if(pills)html+='<div class="card" style="margin-top:10px"><b>💊 Đan Dược</b><p>Đan tăng chỉ số vĩnh viễn không thể đưa chỉ số vượt trần cảnh giới kế tiếp.</p></div><div class="cards">'+pills+'</div>';
  if(tal)html+='<div class="card" style="margin-top:10px"><b>🧿 Phù Lục</b><p>Phù công kích mang một kích toàn lực Đỉnh Phong của Đại phẩm tương ứng và dùng áp chế cảnh giới. Cần Thần thức + Pháp lực.</p></div><div class="cards">'+tal+'</div>';
  if(formations)html+='<div class="card" style="margin-top:10px"><b>☯ Trận Bàn</b><p>Trận Bàn tái sử dụng; mỗi lần vận hành tiêu hao Pháp lực và Linh Thạch.</p></div><div class="cards">'+formations+'</div>';
  return {
    html:html,
    bind:function(){
      document.querySelectorAll('[data-open-system]').forEach(function(b){b.onclick=function(){ctx.openPanel(b.dataset.openSystem);};});
      document.querySelectorAll('[data-use-pill]').forEach(function(b){b.onclick=function(){usePill(S,b.dataset.usePill,ctx);};});
      document.querySelectorAll('[data-use-talisman]').forEach(function(b){b.onclick=function(){useTalisman(S,b.dataset.useTalisman,ctx);};});
      document.querySelectorAll('[data-use-formation]').forEach(function(b){b.onclick=function(){activateFormation(S,b.dataset.useFormation,ctx);};});
    }
  };
}
function craftingSection(S,type,ctx){
  var sys=getSys(S),p=sys.professions[type];
  var max=professionMaxGrade(S,type);
  var selected=clamp(Number(sys.uiGrade[type])||0,0,max);
  sys.uiGrade[type]=selected;
  var known=sys.knownRecipes[type]||[];
  var recipes=(ALL_RECIPES[type]||[]).filter(function(r){return known.indexOf(r.id)>=0;});
  var need=p.rank<3?PROF_RANK_NEED[p.rank]:PROF_RANK_NEED[3];
  var tabs='';
  for(var g=0;g<=max;g++)tabs+='<button data-craft-tab="'+type+'" data-grade="'+g+'" class="'+(g===selected?'active':'')+'">'+gradeName(g)+'</button>';
  var cards=recipes.map(function(r){
    var c=craftCosts(type,selected),mastery=recipeMastery(S,type,r.id,selected);
    return '<div class="card"><b>'+PROF_ICONS[type]+' '+r.name+'</b><p>'+r.desc+'</p>'+
      '<p>'+gradeName(selected)+' · Công thức thuần thục '+mastery+'</p>'+
      '<p>'+MAT_NAMES[PROF_MAT[type]]+' '+c.mat+' · 💎 '+c.stones+' · 🪙 '+c.gold+'</p>'+
      '<button data-craft-type="'+type+'" data-craft-id="'+r.id+'" data-craft-grade="'+selected+'">Luyện Chế</button></div>';
  }).join('');
  var advance=(p.rank===3&&p.grade<4)?'<button data-prof-advance="'+type+'">Đột phá nghề → '+gradeName(p.grade+1)+'</button>':'';
  return '<div class="card" style="margin-top:10px"><b>'+PROF_ICONS[type]+' '+PROF_NAMES[type]+' · '+gradeName(p.grade)+' · '+qualityName(p.rank)+'</b>'+
    '<p>Cảnh giới cho phép tối đa: <b>'+gradeName(clamp(S.realm||0,0,4))+'</b>. Nghề hiện luyện tối đa: <b>'+gradeName(max)+'</b>.</p>'+
    '<p>Độ thuần thục nghề: '+Math.round(p.mastery)+' / '+need+'</p>'+advance+
    '<div class="skill-tabs">'+tabs+'</div></div><div class="cards">'+cards+'</div>';
}
function renderCrafting(S,ctx){
  var sys=getSys(S),m=sys.materials;
  var html='<div class="card"><b>⚒ Hệ Nghề Chế Tạo</b>'+
    '<p>Cảnh giới quyết định Đại phẩm tối đa. Trình độ nghề quyết định chất lượng Hạ → Trung → Thượng → Cực. Luyện đúng cấp tăng nghề và độ thuần thục công thức.</p>'+
    '<p>🌿 '+m.linhThao+' Linh Thảo · ⛏ '+m.khoangThach+' Linh Khoáng · 📜 '+m.phuChi+' Phù Chỉ</p></div>'+
    craftingSection(S,'alchemy',ctx)+craftingSection(S,'forging',ctx)+craftingSection(S,'talisman',ctx);
  return {
    title:'Nghề Chế Tạo · Luyện Đan · Luyện Khí · Chế Phù',
    html:html,
    bind:function(){
      document.querySelectorAll('[data-craft-tab]').forEach(function(b){b.onclick=function(){
        getSys(S).uiGrade[b.dataset.craftTab]=Number(b.dataset.grade)||0;ctx.save();ctx.openPanel('crafting');
      };});
      document.querySelectorAll('[data-craft-type]').forEach(function(b){b.onclick=function(){
        craftItem(S,b.dataset.craftType,b.dataset.craftId,Number(b.dataset.craftGrade)||0,ctx);
      };});
      document.querySelectorAll('[data-prof-advance]').forEach(function(b){b.onclick=function(){advanceProfession(S,b.dataset.profAdvance,ctx);};});
    }
  };
}
function renderFormations(S,ctx){
  var sys=getSys(S),af=sys.activeFormation;
  var active='<div class="card"><b>☯ Trận pháp đang vận hành</b><p>Chưa bố trí trận.</p></div>';
  if(af){
    var f=formationById(af.id);
    active='<div class="card"><b>☯ '+displayName(f,af.grade,af.rank)+'</b><p>Còn '+Math.max(0,Math.ceil(af.remaining))+' giây · Bán kính '+FORM_RANGE[af.grade]+'m</p><button id="stopFormation">Thu Hồi Trận</button></div>';
  }
  var cards=inventoryCards(sys.formationInventory,'formation');
  var html=active+'<div class="card" style="margin-top:10px"><b>📐 Quy tắc Trận Pháp</b>'+
    '<p>Cần Thần thức để điều khiển, Pháp lực để khởi động và Linh Thạch để duy trì. Trận công kích mang cảnh giới của Đại phẩm và dùng áp chế cảnh giới.</p>'+
    '<p>Tụ Linh tăng Tu vi · Kim Cang tăng phòng thủ · Thiên Lôi công kích chu kỳ · Bát Môn khống chế.</p></div>'+
    (cards?'<div class="cards">'+cards+'</div>':'<div class="card"><p>Chưa có Trận Bàn. Hãy dùng nghề Luyện Khí để chế tạo.</p></div>');
  return {
    title:'Trận Pháp',
    html:html,
    bind:function(){
      var stop=document.querySelector('#stopFormation');if(stop)stop.onclick=function(){stopFormation(S,ctx);};
      document.querySelectorAll('[data-use-formation]').forEach(function(b){b.onclick=function(){activateFormation(S,b.dataset.useFormation,ctx);};});
    }
  };
}
function renderPanel(kind,S,ctx){
  if(kind==='crafting')return renderCrafting(S,ctx);
  if(kind==='formations')return renderFormations(S,ctx);
  return null;
}

window.TuTienSystems={
  defaultState:defaultState,
  migrate:migrate,
  renderPanel:renderPanel,
  renderInventory:renderInventory,
  professionSummary:professionSummary,
  getBreakthroughNeed:getBreakthroughNeed,
  consumeBreakthroughAid:consumeBreakthroughAid,
  getWardInfo:getWardInfo,
  getMoveMultiplier:getMoveMultiplier,
  getCultivationMultiplier:getCultivationMultiplier,
  getDefenseMultiplier:getDefenseMultiplier,
  update:update,
  onKill:onKill
};
})();

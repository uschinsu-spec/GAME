(()=>{'use strict';
const C=window.GameConstants||{};
const PROF_ORDER=['refining','artificing','alchemy','talisman','formation'];
const PROF_FALLBACK={refining:'Tinh Luyện Sư',artificing:'Luyện Khí Sư',alchemy:'Luyện Đan Sư',talisman:'Chế Phù Sư',formation:'Trận Pháp Sư'};
const QUALITY_NAMES=['Hạ phẩm','Trung phẩm','Thượng phẩm','Cực phẩm'];
const GRADE_NAMES=(C.GRADES||[]).map(x=>x.name||'').filter(Boolean);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));

function defaultState(){
 return {version:2,activeFormation:null,ward:null,hasteUntil:0,hasteMult:1,breakthroughAid:null,legacyCrafting:null,legacyCraftingArchived:false};
}

function migrate(S){
 if(!S||typeof S!=='object')return defaultState();
 const old=obj(S.progressionSystems),p=Object.assign(defaultState(),old);
 p.version=2;
 if(typeof p.hasteUntil!=='number')p.hasteUntil=0;
 if(typeof p.hasteMult!=='number'||p.hasteMult<1)p.hasteMult=1;
 if(!('activeFormation' in p))p.activeFormation=null;
 if(!('ward' in p))p.ward=null;
 if(!('breakthroughAid' in p))p.breakthroughAid=null;

 // Hệ crafting cũ (alchemy/forging/talisman) chỉ được lưu làm dữ liệu lưu trữ.
 // Runtime mới dùng duy nhất GameState.inventory + GameState.professions.
 if(!p.legacyCraftingArchived){
  const legacyKeys=['professions','materials','knownRecipes','recipeMastery','pillInventory','talismanInventory','formationInventory','uiGrade'];
  const archived={};let hasLegacy=false;
  for(const key of legacyKeys){if(old[key]!=null){archived[key]=clone(old[key]);hasLegacy=true;}}
  if(hasLegacy)p.legacyCrafting=archived;
  p.legacyCraftingArchived=true;
 }
 delete p.professions;delete p.materials;delete p.knownRecipes;delete p.recipeMastery;
 delete p.pillInventory;delete p.talismanInventory;delete p.formationInventory;delete p.uiGrade;
 S.progressionSystems=p;
 return p;
}

function professionSummary(S){
 const professions=obj(S&&S.professions);
 const rows=PROF_ORDER.map(id=>{
  const def=C.PROFESSIONS&&C.PROFESSIONS[id];
  const name=def&&def.name||PROF_FALLBACK[id]||id;
  const p=obj(professions[id]);
  const grade=clamp(Number(p.grade)||1,1,5);
  const mastery=Math.max(0,Number(p.mastery)||0);
  const quality=mastery>=900?3:mastery>=420?2:mastery>=140?1:0;
  return `<div class="stat"><span>${name}</span><b>${GRADE_NAMES[grade-1]||grade+' phẩm'} · ${QUALITY_NAMES[quality]}</b></div>`;
 }).join('');
 return `<div class="card" style="margin-top:10px"><b>🛠 Ngũ Nghề Tu Tiên</b>${rows}</div>`;
}

function getWardInfo(S){
 const p=migrate(S),w=p.ward;
 if(!w)return null;
 if(w.until&&Date.now()>=w.until){p.ward=null;return null;}
 const major=clamp(Number(w.major)||0,0,4);
 const score=major===0?11:12+(major-1)*4+3;
 return {major,score,quality:Number(w.quality)||1};
}

function getMoveMultiplier(S){
 const p=migrate(S);
 if(p.hasteUntil&&Date.now()>=p.hasteUntil){p.hasteUntil=0;p.hasteMult=1;}
 return Math.max(1,Number(p.hasteMult)||1);
}

function insideFormation(S,player){
 const af=migrate(S).activeFormation;
 if(!af)return false;
 if(af.until&&Date.now()>=af.until)return false;
 if(!player||!Number.isFinite(af.x)||!Number.isFinite(af.z)||!Number.isFinite(af.range))return true;
 return Math.hypot((player.x||0)-af.x,(player.z||0)-af.z)<=af.range;
}

function formationEffect(S){
 const af=migrate(S).activeFormation;if(!af)return {};
 const recipe=window.TuTienCraftingRecipes&&window.TuTienCraftingRecipes.BY_ID&&window.TuTienCraftingRecipes.BY_ID[af.id];
 return Object.assign({},recipe&&recipe.effect||{},af.effect||{});
}

function getCultivationMultiplier(S,player){
 if(!insideFormation(S,player))return 1;
 const af=migrate(S).activeFormation,e=formationEffect(S);
 if(Number(e.cultivationSpeed)>0)return 1+Number(e.cultivationSpeed);
 if(af&&af.id==='tu_linh')return 1.12+clamp(Number(af.grade)||0,0,4)*.08;
 return 1;
}

function getDefenseMultiplier(S,player){
 if(!insideFormation(S,player))return 1;
 const af=migrate(S).activeFormation,e=formationEffect(S);
 if(Number(e.defense)>0)return 1+Number(e.defense);
 if(Number(e.elementPower)>0)return 1+Number(e.elementPower)*.35;
 if(af&&af.id==='kim_cang')return 1.20+clamp(Number(af.grade)||0,0,4)*.12;
 return 1;
}

function consumeBreakthroughAid(S){
 const p=migrate(S),aid=p.breakthroughAid;
 p.breakthroughAid=null;
 return aid||null;
}

function getBreakthroughNeed(S){
 const realm=clamp(Number(S&&S.realm)||0,0,4);
 const stage=realm===0?clamp(Number(S&&S.realmStage)||1,1,12):clamp(Number(S&&S.period)||0,0,3)+1;
 return Math.round(800*Math.pow(2.05,realm)*Math.pow(1.18,stage-1));
}

function formationRows(S){
 const inventory=obj(S&&S.inventory),forms=obj(inventory.formations),recipes=window.TuTienCraftingRecipes&&window.TuTienCraftingRecipes.BY_ID||{};
 return Object.entries(forms).filter(([,qty])=>Number(qty)>0).map(([id,qty])=>({id,qty:Number(qty)||0,recipe:recipes[id]||null}));
}

function renderPanel(kind,S,ctx){
 if(kind!=='formations')return null;
 const p=migrate(S),rows=formationRows(S),active=p.activeFormation;
 let html='<div class="card"><b>☯ Trận Pháp</b><p>Trận pháp sử dụng kho vật phẩm thống nhất. Không còn hệ crafting/trận pháp cũ chạy song song.</p></div>';
 if(active){
  const r=window.TuTienCraftingRecipes&&window.TuTienCraftingRecipes.BY_ID&&window.TuTienCraftingRecipes.BY_ID[active.id];
  html+=`<div class="card"><b>Đang vận hành: ${r?r.name:active.name||active.id}</b><p>${active.until?'Còn '+Math.max(0,Math.ceil((active.until-Date.now())/1000))+' giây':'Đang duy trì'}</p><button id="formation-stop">Thu hồi trận pháp</button></div>`;
 }
 if(!rows.length)html+='<div class="card"><p>Chưa có Trận Bàn. Hãy luyện chế bằng nghề Trận Pháp Sư.</p></div>';
 else html+='<div class="cards">'+rows.map(({id,qty,recipe})=>`<div class="card"><b>${recipe?recipe.name:id}</b><p>${GRADE_NAMES[(recipe&&recipe.grade||1)-1]||''} · Số lượng ${qty}</p><button data-formation-activate="${id}">Kích hoạt</button></div>`).join('')+'</div>';
 return {title:'Trận Pháp',html,bind(){
  const stop=document.querySelector('#formation-stop');if(stop)stop.onclick=()=>{p.activeFormation=null;ctx&&ctx.save&&ctx.save();ctx&&ctx.toast&&ctx.toast('Đã thu hồi trận pháp.');ctx&&ctx.openPanel&&ctx.openPanel('formations');};
  document.querySelectorAll('[data-formation-activate]').forEach(btn=>btn.onclick=()=>{
   const id=btn.dataset.formationActivate,row=formationRows(S).find(x=>x.id===id);if(!row)return;
   const pl=ctx&&ctx.getPlayer&&ctx.getPlayer();
   p.activeFormation={id,name:row.recipe&&row.recipe.name||id,grade:row.recipe&&row.recipe.grade||1,effect:clone(row.recipe&&row.recipe.effect||{}),x:pl&&Number(pl.x)||0,z:pl&&Number(pl.z)||0,range:14,until:Date.now()+180000};
   ctx&&ctx.save&&ctx.save();ctx&&ctx.toast&&ctx.toast('☯ Đã kích hoạt '+(row.recipe&&row.recipe.name||id));ctx&&ctx.openPanel&&ctx.openPanel('formations');
  });
 }};
}

function renderInventory(){return null;}
function onKill(){/* Loot crafting mới nhận enemyKilled/bossKilled qua GameEvents. Không drop legacy lần hai. */}
function update(S){
 const p=migrate(S),now=Date.now();
 if(p.ward&&p.ward.until&&now>=p.ward.until)p.ward=null;
 if(p.hasteUntil&&now>=p.hasteUntil){p.hasteUntil=0;p.hasteMult=1;}
 if(p.activeFormation&&p.activeFormation.until&&now>=p.activeFormation.until)p.activeFormation=null;
}

window.TuTienSystems={
 version:2,defaultState,migrate,professionSummary,getBreakthroughNeed,consumeBreakthroughAid,
 getWardInfo,getMoveMultiplier,getCultivationMultiplier,getDefenseMultiplier,
 renderPanel,renderInventory,onKill,update
};
})();

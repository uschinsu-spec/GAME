(()=>{'use strict';
const M=window.TuTienItemMaster;if(!M)return;
const QUALITY_INDEX={ha:0,trung:1,thuong:2,cuc:3};
let STATE=null,BASE_MIGRATE=null,BASE_ONKILL=null,BASE_DEF=null;
const uid=()=>`itm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clone=v=>JSON.parse(JSON.stringify(v));
function emptyEquip(){const o={};Object.keys(M.SLOTS).forEach(k=>o[k]=null);return o;}
function template(){return {version:1,inventory:[],equipment:emptyEquip(),artifacts:{primary:null,secondary1:null,secondary2:null},unlockedArtifactSlots:1,materials:{refineStone:20,spiritIron:20},applied:null,legacyDone:false,filter:{type:'all',grade:0,element:'all'}};}
function ensure(S){
 if(!S.itemSystem||typeof S.itemSystem!=='object')S.itemSystem=template();
 const x=S.itemSystem,t=template();
 if(!Array.isArray(x.inventory))x.inventory=[];
 if(!x.equipment||typeof x.equipment!=='object')x.equipment=emptyEquip();
 Object.keys(M.SLOTS).forEach(k=>{if(!(k in x.equipment))x.equipment[k]=null;});
 if(!x.artifacts||typeof x.artifacts!=='object')x.artifacts=clone(t.artifacts);
 if(!x.materials||typeof x.materials!=='object')x.materials=clone(t.materials);
 if(!x.filter||typeof x.filter!=='object')x.filter=clone(t.filter);
 x.unlockedArtifactSlots=(Number(S.realm)||0)>=3?3:(Number(S.realm)||0)>=1?2:1;
 if(!x.legacyDone){migrateLegacy(S,x);x.legacyDone=true;}
 return x;
}
function migrateLegacy(S,x){
 const legacy=S.equipment||{};
 const map={weapon:'weapon',armor:'armor',ring:'ring1'};
 Object.entries(map).forEach(([oldSlot,newSlot])=>{
  if(!legacy[oldSlot])return;
  const it=createGear(newSlot,1,'trung','Vô');it.name=String(legacy[oldSlot]);x.inventory.push(it);x.equipment[newSlot]=it.id;
 });
}
function gradeDef(g){return M.GRADES[clamp((Number(g)||1)-1,0,4)];}
function qualityDef(q){return M.QUALITIES[clamp(QUALITY_INDEX[q]??0,0,3)];}
function rollQuality(boss=false){let r=Math.random();if(boss)r+=.13;return r>.94?'cuc':r>.72?'thuong':r>.38?'trung':'ha';}
function rollElement(){return M.ELEMENTS[Math.floor(Math.random()*M.ELEMENTS.length)];}
function gearBase(slot,grade,quality,element){
 const b=M.SLOT_BASE[slot]||{},gm=gradeDef(grade).mult,qm=qualityDef(quality).mult,out={};
 for(const [k,v] of Object.entries(b))out[k]=v*gm*qm;
 if(element&&element!=='Vô'&&out.damage)out.elementDamage={element,value:out.damage*.35};
 return out;
}
function createGear(slot,grade=1,quality='ha',element='Vô'){
 const qi=M.ELEMENTS.indexOf(element),names=M.GEAR_NAMES[slot]||['Linh Khí'];
 const it={id:uid(),kind:'gear',slot,grade,quality,element,name:names[Math.max(0,qi)]||names[0],base:gearBase(slot,grade,quality,element),affixes:[],createdAt:Date.now()};
 const pool=M.AFFIXES.filter(a=>!a.element||a.element===element),n=qualityDef(quality).affixes,used=new Set();
 while(it.affixes.length<n&&used.size<pool.length){const a=pool[Math.floor(Math.random()*pool.length)];if(used.has(a.id))continue;used.add(a.id);const v=a.min+Math.random()*(a.max-a.min);it.affixes.push({id:a.id,label:a.label,stat:a.stat,element:a.element||null,value:v});}
 return it;
}
function createArtifact(grade=1,quality='ha',element=null){
 const candidates=M.artifacts.filter(a=>a.grade===grade&&(!element||a.element===element));const d=candidates[Math.floor(Math.random()*candidates.length)]||M.artifacts[0];
 return {id:uid(),kind:'artifact',defId:d.id,name:d.name,grade:d.grade,quality,element:d.element,role:d.role,roleName:d.roleName,active:d.active,bonus:clone(d.bonus),spirituality:0,createdAt:Date.now()};
}
function currentRealm(){return clamp(Number(STATE&&STATE.realm)||0,0,4);}
function canUse(it){return currentRealm()>=gradeDef(it.grade).realm;}
function find(id){return ensure(STATE).inventory.find(x=>x.id===id)||null;}
function equippedIds(x){return new Set([...Object.values(x.equipment),...Object.values(x.artifacts)].filter(Boolean));}
function totalBonuses(S){
 const x=ensure(S),ids=equippedIds(x),sum={hp:0,defense:0,damage:0,critChance:0,critDamage:0,spirit:0,moveSpeed:0,elementDamage:{}};
 for(const id of ids){const it=x.inventory.find(z=>z.id===id);if(!it)continue;const qm=qualityDef(it.quality).mult;
  if(it.kind==='gear'){
   for(const [k,v] of Object.entries(it.base||{})){if(k==='elementDamage'){const e=v.element;sum.elementDamage[e]=(sum.elementDamage[e]||0)+v.value;}else if(k in sum)sum[k]+=Number(v)||0;}
   for(const a of (it.affixes||[])){const scale=gradeDef(it.grade).mult*qm;if(a.stat==='elementDamage'){const e=a.element||it.element;if(e&&e!=='Vô')sum.elementDamage[e]=(sum.elementDamage[e]||0)+(18*scale*a.value);}else if(a.stat==='hp')sum.hp+=600*scale*a.value;else if(a.stat==='defense')sum.defense+=55*scale*a.value;else if(a.stat==='damage')sum.damage+=70*scale*a.value;else if(a.stat==='spirit')sum.spirit+=100*scale*a.value;else if(a.stat==='moveSpeed')sum.moveSpeed+=a.value;else if(a.stat==='critChance')sum.critChance+=a.value;else if(a.stat==='critDamage')sum.critDamage+=a.value;}
  }else if(it.kind==='artifact'){
   const gm=gradeDef(it.grade).mult;for(const [k,v] of Object.entries(it.bonus||{})){if(k==='damage')sum.damage+=80*gm*qm*v;else if(k==='hp')sum.hp+=700*gm*qm*v;else if(k==='defense')sum.defense+=65*gm*qm*v;else if(k==='spirit')sum.spirit+=120*gm*qm*v;else if(k==='moveSpeed')sum.moveSpeed+=v*qm;else if(k==='critChance')sum.critChance+=v*qm;else if(k==='critDamage')sum.critDamage+=v*qm;}
   if(it.element&&it.element!=='Vô')sum.elementDamage[it.element]=(sum.elementDamage[it.element]||0)+35*gm*qm;
  }
 }
 return sum;
}
function subtractApplied(S,a){if(!a)return;S.maxHp=Math.max(1,(S.maxHp||1)-(a.hp||0));S.hp=Math.min(S.hp,S.maxHp);S.spiritSense=Math.max(0,(S.spiritSense||0)-(a.spirit||0));S.moveSpeed=Math.max(1,(S.moveSpeed||0)-(a.moveSpeed||0));S.critChance=Math.max(0,(S.critChance||0)-(a.critChance||0));S.critDamage=Math.max(1,(S.critDamage||1)-(a.critDamage||0));for(const t of ['physical','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi']){S.damage[t]=(S.damage[t]||0)-(a.damageEach&&a.damageEach[t]||0);S.defense[t]=(S.defense[t]||0)-(a.defenseEach&&a.defenseEach[t]||0);}}
function applyBonuses(S){
 const x=ensure(S);subtractApplied(S,x.applied);const b=totalBonuses(S),a={hp:b.hp,spirit:b.spirit,moveSpeed:b.moveSpeed,critChance:b.critChance,critDamage:b.critDamage,damageEach:{},defenseEach:{}};
 S.maxHp=(S.maxHp||1)+b.hp;S.hp=Math.min(S.maxHp,(S.hp||0)+Math.max(0,b.hp));S.spiritSense=(S.spiritSense||0)+b.spirit;S.moveSpeed=(S.moveSpeed||0)+b.moveSpeed;S.critChance=(S.critChance||0)+b.critChance;S.critDamage=(S.critDamage||1)+b.critDamage;
 const dmgTypes=['physical','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi'];for(const t of dmgTypes){let add=b.damage/8+(b.elementDamage[t]||0);S.damage[t]=(S.damage[t]||0)+add;a.damageEach[t]=add;let def=b.defense/8;S.defense[t]=(S.defense[t]||0)+def;a.defenseEach[t]=def;}
 x.applied=a;return b;
}
function toast(msg){const host=document.querySelector('#lootToast');if(!host)return;const e=document.createElement('div');e.textContent=msg;host.appendChild(e);setTimeout(()=>e.remove(),2200);}
function save(){try{localStorage.setItem('tutien_chilo_save_v2',JSON.stringify(STATE));}catch(e){}}
function equip(id,artifactSlot=null){const x=ensure(STATE),it=find(id);if(!it)return false;if(!canUse(it)){toast(`🔒 Cần ${gradeDef(it.grade).name} / ${['Luyện Khí','Trúc Cơ','Kết Đan','Nguyên Anh','Hóa Thần'][gradeDef(it.grade).realm]}`);return false;}if(it.kind==='gear'){x.equipment[it.slot]=id;}else{let slot=artifactSlot||'primary';if(slot!=='primary'&&x.unlockedArtifactSlots<2)return false;if(slot==='secondary2'&&x.unlockedArtifactSlots<3)return false;x.artifacts[slot]=id;}applyBonuses(STATE);save();toast('✨ Đã trang bị '+it.name);return true;}
function unequip(slot,isArtifact=false){const x=ensure(STATE);if(isArtifact)x.artifacts[slot]=null;else x.equipment[slot]=null;applyBonuses(STATE);save();}
function addDrop(it){const x=ensure(STATE);x.inventory.push(it);save();toast(`✨ Nhặt ${gradeDef(it.grade).name} · ${qualityDef(it.quality).name} · ${it.name}`);}
function rollDrop(S,isBoss=false){STATE=S;const realm=currentRealm();let grade=realm+1;if(isBoss&&realm<4&&Math.random()<.05)grade++;grade=clamp(grade,1,5);const q=rollQuality(isBoss);if(Math.random()<(isBoss?.32:.12))addDrop(createArtifact(grade,q,Math.random()<.82?rollElement():null));else addDrop(createGear(Object.keys(M.SLOTS)[Math.floor(Math.random()*Object.keys(M.SLOTS).length)],grade,q,rollElement()));}
function craftGear(slot,grade,element='Vô'){if(!STATE)return null;grade=clamp(grade,1,5);if(currentRealm()<grade-1)return null;const x=ensure(STATE),cost=Math.round(4*Math.pow(2,grade-1));if((x.materials.spiritIron||0)<cost)return null;x.materials.spiritIron-=cost;const it=createGear(slot,grade,rollQuality(false),element);x.inventory.push(it);save();return it;}
function refineThree(ids){if(!STATE||!Array.isArray(ids)||ids.length!==3)return null;const x=ensure(STATE),arr=ids.map(find);if(arr.some(v=>!v)||new Set(arr.map(v=>`${v.kind}|${v.grade}|${v.quality}`)).size!==1)return null;const qi=QUALITY_INDEX[arr[0].quality];if(qi>=3)return null;const next=M.QUALITIES[qi+1].id;ids.forEach(id=>{const i=x.inventory.findIndex(v=>v.id===id);if(i>=0)x.inventory.splice(i,1);});const src=arr[0],it=src.kind==='gear'?createGear(src.slot,src.grade,next,src.element):createArtifact(src.grade,next,src.element);x.inventory.push(it);save();return it;}
function fmt(v,percent=false){return percent?(v*100).toFixed(v<.1?1:0)+'%':Math.round(v).toLocaleString('vi-VN');}
function itemStats(it){let rows=[];if(it.kind==='gear'){for(const [k,v] of Object.entries(it.base||{})){if(k==='elementDamage')rows.push(`+${fmt(v.value)} ${v.element} sát thương`);else rows.push(`+${fmt(v,k==='critChance'||k==='critDamage'||k==='moveSpeed')} ${({hp:'Sinh lực',defense:'Phòng thủ',damage:'Sát thương',spirit:'Thần thức',moveSpeed:'Tốc chạy',critChance:'Bạo kích',critDamage:'Bạo thương'})[k]||k}`);}for(const a of it.affixes||[])rows.push(`✦ ${a.label} +${fmt(a.value,true)}`);}else{rows.push(`${it.roleName} · ${it.active}`);rows.push(`Linh tính ${Math.round(it.spirituality||0)}/100`);}return rows.join('<br>');}
function card(it,x){const eq=equippedIds(x).has(it.id),locked=!canUse(it),q=qualityDef(it.quality);return `<div class="card" style="border-color:${q.color}"><b style="color:${q.color}">${gradeDef(it.grade).name} · ${q.name}</b><p><strong>${it.name}</strong> · ${it.element}${it.kind==='artifact'?' · '+it.roleName:''}</p><small>${itemStats(it)}</small><div class="stat"><span>${locked?'🔒 Chưa đủ cảnh giới':eq?'✓ Đang trang bị':M.SLOTS[it.slot]||'Pháp bảo'}</span><b>${it.kind==='artifact'?'PHÁP BẢO':'TRANG BỊ'}</b></div>${eq?'':`<button data-item-equip="${it.id}">Trang bị</button>`}</div>`;}
function renderInventory(){if(!STATE)return;const body=document.querySelector('#panelBody'),title=document.querySelector('#panelTitle');if(!body)return;const x=ensure(STATE);if(title)title.textContent='Túi Đồ · Item';const inv=x.inventory.slice().sort((a,b)=>b.grade-a.grade-(QUALITY_INDEX[b.quality]-QUALITY_INDEX[a.quality]));body.innerHTML=`<div class="card"><b>🎒 Hệ ITEM Tu Tiên</b><p>Nhất→Ngũ Phẩm · Hạ→Cực phẩm · khóa theo cảnh giới.</p><div class="stat"><span>Linh Thiết</span><b>${x.materials.spiritIron||0}</b></div><div class="stat"><span>Đá Tinh Luyện</span><b>${x.materials.refineStone||0}</b></div></div><div class="cards">${inv.length?inv.map(i=>card(i,x)).join(''):'<div class="card"><p>Chưa có trang bị/pháp bảo mới. Diệt quái, Boss hoặc luyện khí để nhận.</p></div>'}</div>`;bind();}
function renderEquipment(){if(!STATE)return;const body=document.querySelector('#panelBody'),title=document.querySelector('#panelTitle');if(!body)return;const x=ensure(STATE);if(title)title.textContent='Trang Bị & Pháp Bảo';let html='<div class="cards">';for(const [slot,label] of Object.entries(M.SLOTS)){const it=find(x.equipment[slot]);html+=`<div class="card"><b>${label}</b>${it?`<p>${it.name}</p><small>${itemStats(it)}</small><button data-item-unequip="${slot}">Tháo</button>`:'<p>— Trống —</p>'}</div>`;}html+='</div><div class="card"><b>🪄 Pháp Bảo</b><p>Pháp bảo chủ kích hoạt chính; slot phụ mở theo cảnh giới.</p></div><div class="cards">';for(const slot of ['primary','secondary1','secondary2']){const open=slot==='primary'||(slot==='secondary1'&&x.unlockedArtifactSlots>=2)||(slot==='secondary2'&&x.unlockedArtifactSlots>=3),it=find(x.artifacts[slot]);html+=`<div class="card"><b>${slot==='primary'?'Chủ':slot==='secondary1'?'Phụ I':'Phụ II'}</b>${!open?'<p>🔒 Chưa mở</p>':it?`<p>${it.name}</p><small>${itemStats(it)}</small><button data-art-unequip="${slot}">Tháo</button>`:'<p>— Trống —</p>'}</div>`;}html+='</div>';body.innerHTML=html;bind();}
function bind(){document.querySelectorAll('[data-item-equip]').forEach(b=>b.onclick=()=>{const it=find(b.dataset.itemEquip);if(it&&it.kind==='artifact'){const x=ensure(STATE);const slot=!x.artifacts.primary?'primary':(!x.artifacts.secondary1&&x.unlockedArtifactSlots>=2?'secondary1':'primary');equip(it.id,slot);}else equip(b.dataset.itemEquip);renderInventory();});document.querySelectorAll('[data-item-unequip]').forEach(b=>b.onclick=()=>{unequip(b.dataset.itemUnequip,false);renderEquipment();});document.querySelectorAll('[data-art-unequip]').forEach(b=>b.onclick=()=>{unequip(b.dataset.artUnequip,true);renderEquipment();});}
function installHooks(){const sys=window.TuTienSystems;if(!sys)return;
 BASE_MIGRATE=sys.migrate;sys.migrate=function(S){const r=BASE_MIGRATE?BASE_MIGRATE(S):null;STATE=S;ensure(S);applyBonuses(S);return r;};
 BASE_ONKILL=sys.onKill;sys.onKill=function(S,meta,ctx){STATE=S;const r=BASE_ONKILL?BASE_ONKILL(S,meta,ctx):null;const chance=meta&&meta.boss?.80:.12;if(Math.random()<chance)rollDrop(S,!!(meta&&meta.boss));if(Math.random()<.18){ensure(S).materials.spiritIron+=meta&&meta.boss?3:1;}save();return r;};
 BASE_DEF=sys.getDefenseMultiplier;if(BASE_DEF)sys.getDefenseMultiplier=function(S,p){STATE=S;ensure(S);return BASE_DEF(S,p);};
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-panel]');if(!b)return;const p=b.dataset.panel;if(p==='inventory')setTimeout(renderInventory,0);if(p==='equipment')setTimeout(renderEquipment,0);},true);
installHooks();
window.TuTienItems={ensure,createGear,createArtifact,equip,unequip,rollDrop,craftGear,refineThree,totalBonuses,renderInventory,renderEquipment,getState:()=>STATE&&ensure(STATE)};
})();
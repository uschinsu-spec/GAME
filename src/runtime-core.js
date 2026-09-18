/* Generated runtime bundle. Source modules remain canonical under src/. */
(()=>{'use strict';
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(deepFreeze);}return value;};
const C={
 SAVE_VERSION:5,
 BUILD_VERSION:'20260918-quality-ui-v5.2',
 SAVE_KEY:'tutien_chilo_save_v2',
 REALMS:['Luyện Khí','Trúc Cơ','Kết Đan','Nguyên Anh','Hóa Thần'],
 REALM_STAGES:['Sơ Kỳ','Trung Kỳ','Hậu Kỳ','Đỉnh Phong'],
 GRADES:[
  {id:1,key:'nhat',name:'Nhất Phẩm',realm:0},
  {id:2,key:'nhi',name:'Nhị Phẩm',realm:1},
  {id:3,key:'tam',name:'Tam Phẩm',realm:2},
  {id:4,key:'tu',name:'Tứ Phẩm',realm:3},
  {id:5,key:'ngu',name:'Ngũ Phẩm',realm:4}
 ],
 QUALITIES:[
  {id:'ha',name:'Hạ phẩm'},{id:'trung',name:'Trung phẩm'},
  {id:'thuong',name:'Thượng phẩm'},{id:'cuc',name:'Cực phẩm'}
 ],
 ELEMENTS:['Vô','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi','Kiếm','Đao'],
 DAMAGE_TYPES:['physical','Kim','Hỏa','Thủy','Mộc','Thổ','Phong','Lôi'],
 PROFESSIONS:{
  refining:{id:'refining',name:'Tinh Luyện Sư'},
  artificing:{id:'artificing',name:'Luyện Khí Sư'},
  alchemy:{id:'alchemy',name:'Luyện Đan Sư'},
  talisman:{id:'talisman',name:'Chế Phù Sư'},
  formation:{id:'formation',name:'Trận Pháp Sư'}
 }
};
window.GameConstants=deepFreeze(C);
})();
;
(()=>{'use strict';
class EventBus{
 constructor(){this.listeners=new Map();this.emitting=new Set();}
 on(type,handler,{once=false,signal}={}){if(typeof handler!=='function')throw new TypeError('Event handler phải là function');const row={handler,once};const list=this.listeners.get(type)||[];list.push(row);this.listeners.set(type,list);const off=()=>this.off(type,handler);if(signal){if(signal.aborted)off();else signal.addEventListener('abort',off,{once:true});}return off;}
 once(type,handler,options={}){return this.on(type,handler,{...options,once:true});}
 off(type,handler){const list=this.listeners.get(type);if(!list)return;const next=list.filter(x=>x.handler!==handler);if(next.length)this.listeners.set(type,next);else this.listeners.delete(type);}
 emit(type,payload){const list=(this.listeners.get(type)||[]).slice();if(!list.length)return 0;let called=0;for(const row of list){try{row.handler(payload);called++;}catch(error){console.error('[Events]',type,error);}if(row.once)this.off(type,row.handler);}return called;}
 clear(type){if(type)this.listeners.delete(type);else this.listeners.clear();}
 count(type){return (this.listeners.get(type)||[]).length;}
}
window.GameEvents=window.GameEvents||new EventBus();
window.EventBus=EventBus;
})();
;
(()=>{'use strict';
const C=window.GameConstants;
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const arr=v=>Array.isArray(v)?v:[];
const mergeStacks=(target,source)=>{for(const [id,qty] of Object.entries(obj(source)))target[id]=Math.max(Number(target[id])||0,Number(qty)||0);return target;};
const bucket=()=>({materials:{},consumables:{},equipment:[],artifacts:[],talismans:{},formations:{},questItems:{}});
const professions=()=>Object.fromEntries(Object.keys(C.PROFESSIONS).map(id=>[id,{grade:1,mastery:0}]));

function migrateV1(s){s.version=1;s.player=obj(s.player);return s;}
function migrateV2(s){
 s.inventory=Object.assign(bucket(),obj(s.inventory));
 // Chỉ import một lần; không cộng dồn nên migration chạy lại vẫn an toàn.
 if(!s._migrationV2Imported){mergeStacks(s.inventory.consumables,s.items);s._migrationV2Imported=true;}
 s.version=2;return s;
}
function migrateV3(s){
 const oldItem=obj(s.itemSystem),oldCraft=obj(s.craftingV2);
 s.inventory=Object.assign(bucket(),obj(s.inventory));
 if(!s._migrationV3Imported){
  s.inventory.equipment=arr(oldItem.inventory).filter(x=>x&&x.kind!=='artifact');
  s.inventory.artifacts=arr(oldItem.inventory).filter(x=>x&&x.kind==='artifact').concat(arr(oldCraft.artifacts));
  mergeStacks(s.inventory.materials,oldCraft.inventory);
  mergeStacks(s.inventory.consumables,oldCraft.crafted);
  mergeStacks(s.inventory.formations,oldCraft.formations);
  s._migrationV3Imported=true;
 }
 s.equipment=Object.assign({},obj(s.equipment),obj(oldItem.equipment));
 if(!s.legacyArtifacts&&s.artifacts&&!('primary'in s.artifacts))s.legacyArtifacts=clone(s.artifacts);
 s.artifacts=Object.assign({primary:null,secondary1:null,secondary2:null},obj(oldItem.artifacts),('primary'in obj(s.artifacts)?s.artifacts:{}));
 s.professions=Object.assign(professions(),obj(oldCraft.professions),obj(s.professions));
 s.crafting=Object.assign({field:null,nodes:[],gatheringMastery:0,lastFieldTick:Date.now(),lastNodeRefresh:0},obj(s.crafting));
 s.version=3;return s;
}
function migrateV4(s){
 s.skills=Object.assign({learned:obj(s.learnedSkills),equipped:arr(s.equippedSkills),element:s.skillElement||'Kiếm',tierTab:Number(s.skillTierTab)||0},obj(s.skills));
 s.world=Object.assign({mapId:s.regionId||'thanh_van_thon',legacyRegion:Number(s.region)||0},obj(s.world));
 s.settings=Object.assign({quality:'auto',audio:true},obj(s.settings));
 s.quests=Object.assign({kills:Number(s.questKills)||0,bossKills:Number(s.bossKills)||0},obj(s.quests));
 s.version=4;return s;
}
function migrateV5(s){
 s.player=Object.assign({
  realm:Number(s.realm)||0,realmStage:Number(s.realmStage)||1,level:Number(s.level)||1,xp:Number(s.xp)||0,
  cultivation:Number(s.cultivation)||0,hp:Number(s.hp)||1,mp:Number(s.mp)||0,
  stats:{damage:obj(s.damage),defense:obj(s.defense)},techniques:obj(s.cultivationTechniques),heartMethod:Number(s.heartMethod)||0
 },obj(s.player));
 s.version=5;return s;
}
const migrations={1:migrateV1,2:migrateV2,3:migrateV3,4:migrateV4,5:migrateV5};

function linkCompatibility(s){
 s.inventory=Object.assign(bucket(),obj(s.inventory));
 s.professions=Object.assign(professions(),obj(s.professions));
 s.items=s.inventory.consumables;
 s.skills=Object.assign({learned:{},equipped:[],element:'Kiếm',tierTab:0},obj(s.skills));
 if(s.learnedSkills&&typeof s.learnedSkills==='object')s.skills.learned=s.learnedSkills;else s.learnedSkills=s.skills.learned;
 if(Array.isArray(s.equippedSkills))s.skills.equipped=s.equippedSkills;else s.equippedSkills=s.skills.equipped;
 if(typeof s.skillElement==='string')s.skills.element=s.skillElement;else s.skillElement=s.skills.element;
 if(typeof s.skillTierTab==='number')s.skills.tierTab=s.skillTierTab;else s.skillTierTab=s.skills.tierTab;
 s.world=Object.assign({mapId:'thanh_van_thon',legacyRegion:0},obj(s.world));
 if(typeof s.regionId==='string')s.world.mapId=s.regionId;else s.regionId=s.world.mapId;
 if(typeof s.region==='number')s.world.legacyRegion=s.region;else s.region=s.world.legacyRegion;
 s.player=Object.assign({},obj(s.player),{realm:Number(s.realm)||0,realmStage:Number(s.realmStage)||1,level:Number(s.level)||1,xp:Number(s.xp)||0,cultivation:Number(s.cultivation)||0,hp:Number(s.hp)||1,mp:Number(s.mp)||0,stats:{damage:obj(s.damage),defense:obj(s.defense)},techniques:obj(s.cultivationTechniques),heartMethod:Number(s.heartMethod)||0});
 const item=obj(s.itemSystem);item.inventory=s.inventory.equipment.concat(s.inventory.artifacts);item.equipment=s.equipment;item.artifacts=s.artifacts;s.itemSystem=item;
 const craft=obj(s.craftingV2);craft.inventory=s.inventory.materials;craft.crafted=s.inventory.consumables;craft.formations=s.inventory.formations;craft.artifacts=s.inventory.artifacts;craft.professions=s.professions;
 s.crafting=Object.assign(obj(s.crafting),craft);s.craftingV2=Object.assign(craft,s.crafting);
 return s;
}
function migrate(input={}){let s=obj(input);let version=Math.max(0,Number(s.version)||0);while(version<C.SAVE_VERSION){const next=version+1;s=migrations[next](s);version=next;}return linkCompatibility(s);}

let current=null;
window.GameStateService={
 version:C.SAVE_VERSION,
 migrate,
 adopt(state){current=migrate(state);window.GameState=current;window.GameEvents&&window.GameEvents.emit('stateReady',{state:current});return current;},
 get(){return current;},
 snapshot(){return clone(current);},
 validate(state=current){const errors=[];if(!state||typeof state!=='object')errors.push('state');if(!state||state.version!==C.SAVE_VERSION)errors.push('version');for(const key of Object.keys(bucket()))if(!state||!state.inventory||state.inventory[key]==null)errors.push('inventory.'+key);return {ok:errors.length===0,errors};}
};
})();
;
(()=>{'use strict';
let state=null;
const stackBuckets=['materials','consumables','talismans','formations','questItems'];
const uniqueBuckets=['equipment','artifacts'];
const inv=()=>{const s=state||window.GameStateService.get();if(!s)throw new Error('Inventory chưa gắn GameState');return s.inventory;};
const emit=(type,data)=>window.GameEvents&&window.GameEvents.emit(type,data);
function resolveBucket(id,meta={}){if(meta.bucket&&inv()[meta.bucket]!=null)return meta.bucket;if(meta.kind==='gear'||meta.type==='equipment')return'equipment';if(meta.kind==='artifact'||meta.type==='artifact')return'artifacts';if(meta.type==='talisman')return'talismans';if(meta.type==='formation')return'formations';if(meta.type==='quest')return'questItems';if(meta.type==='consumable')return'consumables';return'materials';}
function get(id,bucket){const data=inv();if(bucket){const b=data[bucket];return Array.isArray(b)?b.find(x=>x&&(x.id===id||x.uid===id))||null:Number(b[id]||0);}for(const name of stackBuckets)if(data[name][id]!=null)return Number(data[name][id]||0);for(const name of uniqueBuckets){const found=data[name].find(x=>x&&(x.id===id||x.uid===id));if(found)return found;}return null;}
function count(id,bucket){const value=get(id,bucket);return typeof value==='number'?value:(value?1:0);}
function has(id,qty=1,bucket){return count(id,bucket)>=Math.max(0,Number(qty)||0);}
function add(id,qty=1,meta={}){const bucket=resolveBucket(id,meta),data=inv()[bucket];if(Array.isArray(data)){const item=typeof id==='object'?id:{...meta,id:meta.id||id};if(!item.id&&!item.uid)throw new Error('Item unique thiếu id');data.push(item);emit('itemAdded',{id:item.id||item.uid,qty:1,bucket,item});return item;}qty=Math.max(0,Number(qty)||0);if(!qty)return Number(data[id]||0);data[id]=Number(data[id]||0)+qty;emit('itemAdded',{id,qty,bucket,total:data[id],meta});return data[id];}
function remove(id,qty=1,bucket){const data=inv(),target=bucket||resolveBucket(id,{}),b=data[target];if(Array.isArray(b)){const index=b.findIndex(x=>x&&(x.id===id||x.uid===id));if(index<0)return false;const [item]=b.splice(index,1);emit('itemRemoved',{id,qty:1,bucket:target,item});return item;}qty=Math.max(0,Number(qty)||0);if(Number(b[id]||0)<qty)return false;b[id]-=qty;if(b[id]<=0)delete b[id];emit('itemRemoved',{id,qty,bucket:target,total:Number(b[id]||0)});return true;}
function move(id,from,to,qty=1){if(from===to)return true;const value=get(id,from);if(!value)return false;if(Array.isArray(inv()[from])){const item=remove(id,1,from);if(!item)return false;add(item,1,{...item,bucket:to});return true;}if(!remove(id,qty,from))return false;add(id,qty,{bucket:to});return true;}
function find(predicate,buckets=[...stackBuckets,...uniqueBuckets]){const out=[];const data=inv();for(const name of buckets){const b=data[name];if(Array.isArray(b)){for(const item of b)if(predicate(item,name))out.push(item);}else for(const [id,qty] of Object.entries(b))if(predicate({id,qty},name))out.push({id,qty,bucket:name});}return out;}
function getByType(type){const name={material:'materials',consumable:'consumables',equipment:'equipment',artifact:'artifacts',talisman:'talismans',formation:'formations',quest:'questItems'}[type]||type;return inv()[name];}
window.InventorySystem={attach(s){state=s;return this;},has,get,add,remove,move,find,count,getByType,getMaterials:()=>inv().materials,getEquipment:()=>inv().equipment,getArtifacts:()=>inv().artifacts,getConsumables:()=>inv().consumables};
window.GameEvents&&window.GameEvents.on('stateReady',({state:s})=>window.InventorySystem.attach(s));
})();
;
(()=>{'use strict';
const C=window.GameConstants;let timer=0,dirty=false,stateGetter=()=>window.GameStateService.get(),delay=900,lastSave=0;
function write(reason='debounce'){let state=stateGetter();if(!state)return false;clearTimeout(timer);timer=0;try{if(window.GameStateService)state=window.GameStateService.migrate(state);localStorage.setItem(C.SAVE_KEY,JSON.stringify(state));dirty=false;lastSave=Date.now();window.GameEvents&&window.GameEvents.emit('saveCompleted',{reason,at:lastSave,version:state.version});return true;}catch(error){console.error('[SaveService]',error);window.GameEvents&&window.GameEvents.emit('saveFailed',{reason,error});return false;}}
function markDirty(reason='stateChanged'){dirty=true;clearTimeout(timer);timer=setTimeout(()=>write(reason),delay);}
function read(){try{const raw=localStorage.getItem(C.SAVE_KEY);return raw?JSON.parse(raw):{};}catch(error){console.warn('[SaveService] save lỗi, dùng state mới',error);return{};}}
function bindLifecycle(){if(bindLifecycle.done)return;bindLifecycle.done=true;document.addEventListener('visibilitychange',()=>{if(document.hidden)write('visibilitychange');});window.addEventListener('pagehide',()=>write('pagehide'));}
window.SaveService={configure(options={}){if(options.stateGetter)stateGetter=options.stateGetter;if(options.delay)delay=Math.max(250,Number(options.delay)||900);bindLifecycle();return this;},read,markDirty,forceSave:write,flush:write,isDirty:()=>dirty,lastSave:()=>lastSave};
})();
;
(()=>{'use strict';
const PROFILES={LOW:{renderScale:1.5,targetFps:30,enemyNearHz:20,enemyMidHz:8,enemyFarHz:2,maxVfx:36,particleScale:.45,shadowDistance:24},MEDIUM:{renderScale:2.25,targetFps:45,enemyNearHz:30,enemyMidHz:12,enemyFarHz:3,maxVfx:60,particleScale:.7,shadowDistance:40},HIGH:{renderScale:3,targetFps:60,enemyNearHz:60,enemyMidHz:20,enemyFarHz:6,maxVfx:100,particleScale:1,shadowDistance:65}};
function detect(){const mobile=(navigator.maxTouchPoints||0)>1||Math.min(screen.width,screen.height)<820;const memory=Number(navigator.deviceMemory)||0,cores=Number(navigator.hardwareConcurrency)||2;let name=mobile?'MEDIUM':'HIGH';if((memory&&memory<=4)||cores<=4)name='LOW';else if(!mobile&&cores>=8&&(memory===0||memory>=8))name='HIGH';return name;}
let name=detect(),current={...PROFILES[name]},manual=false,samples=[],lastEval=performance.now(),cooldownUntil=0;
function sample(dt){if(manual||!Number.isFinite(dt)||dt<=0)return current;samples.push(1/dt);if(samples.length>240)samples.shift();const now=performance.now();if(now-lastEval<5000||samples.length<60)return current;lastEval=now;const avg=samples.reduce((a,b)=>a+b,0)/samples.length;samples.length=0;if(now<cooldownUntil)return current;if(avg<current.targetFps*.72&&name!=='LOW'){name=name==='HIGH'?'MEDIUM':'LOW';current={...PROFILES[name]};cooldownUntil=now+12000;window.GameEvents&&window.GameEvents.emit('qualityChanged',{name,profile:current,reason:'fps-low'});}else if(avg>current.targetFps*.96&&name==='LOW'){name='MEDIUM';current={...PROFILES[name]};cooldownUntil=now+30000;window.GameEvents&&window.GameEvents.emit('qualityChanged',{name,profile:current,reason:'fps-stable'});}return current;}
function set(next,options={}){if(PROFILES[next]){manual=options.manual!==false;name=next;current={...PROFILES[next]};samples.length=0;window.GameEvents&&window.GameEvents.emit('qualityChanged',{name,profile:current,reason:manual?'manual':'auto'});}return current;}
function setAuto(){manual=false;return set(detect(),{manual:false});}
window.PerformanceProfile={PROFILES,get name(){return name;},get current(){return current;},get manual(){return manual;},sample,set,setAuto,engineScale(){const dpr=Math.max(1,window.devicePixelRatio||1);return dpr/Math.min(dpr,current.renderScale);}};
})();
;
(()=>{'use strict';
const entries=new Map();const mapRefs=new Map();
function normalize(path){try{const u=new URL(path,location.href);u.searchParams.delete('v');return u.pathname.replace(/^\//,'');}catch(_){return String(path).replace(/\?v=[^&]+/,'');}}
async function loadJSON(path){const key='json:'+normalize(path);if(entries.has(key))return entries.get(key).value;const promise=fetch(path,{cache:'default'}).then(r=>{if(!r.ok)throw new Error(`${path} (${r.status})`);return r.json();});entries.set(key,{value:promise,refs:1,type:'json'});try{return await promise;}catch(error){entries.delete(key);throw error;}}
function loadTexture(path,scene,options={}){const key='texture:'+normalize(path);const found=entries.get(key);if(found){found.refs++;return found.value;}if(!window.BABYLON||!scene)throw new Error('Babylon scene chưa sẵn sàng');const texture=new BABYLON.Texture(path,scene,options.noMipmap!==false,options.invertY!==false,options.samplingMode);entries.set(key,{value:texture,refs:1,type:'texture'});return texture;}
function retain(path,mapId){const key=normalize(path),set=mapRefs.get(mapId)||new Set();set.add(key);mapRefs.set(mapId,set);return key;}
function release(path){const suffix=normalize(path);for(const [key,entry] of entries)if(key.endsWith(suffix)){entry.refs--;if(entry.refs<=0){if(entry.type==='texture'&&entry.value&&entry.value.dispose)entry.value.dispose();entries.delete(key);}return true;}return false;}
function releaseMap(mapId){const set=mapRefs.get(mapId);if(!set)return;for(const path of set)release(path);mapRefs.delete(mapId);}
async function preload(paths,loader=loadJSON){return Promise.allSettled(paths.map(loader));}
window.AssetManager={normalize,loadJSON,loadTexture,retain,release,releaseMap,preload,get(path){const suffix=normalize(path);for(const [key,e] of entries)if(key.endsWith(suffix))return e.value;return null;},stats:()=>({loaded:entries.size,mapGroups:mapRefs.size,textures:[...entries.values()].filter(x=>x.type==='texture').length})};
})();
;
(()=>{'use strict';
class ObjectPool{constructor({create,reset=()=>{},dispose=()=>{},max=128}){this.create=create;this.reset=reset;this.dispose=dispose;this.max=max;this.free=[];this.active=new Set();}acquire(data){const value=this.free.pop()||this.create(data);this.reset(value,data,true);this.active.add(value);return value;}release(value){if(!this.active.delete(value))return false;this.reset(value,null,false);if(this.free.length<this.max)this.free.push(value);else this.dispose(value);return true;}clear(){for(const v of this.active)this.dispose(v);for(const v of this.free)this.dispose(v);this.active.clear();this.free.length=0;}stats(){return{active:this.active.size,free:this.free.length,max:this.max};}}
window.ObjectPool=ObjectPool;window.GamePools=new Map();
})();
;
(()=>{'use strict';
let nextId=1;const tasks=[];
function schedule(delaySeconds,callback,tag='default'){const task={id:nextId++,at:performance.now()+Math.max(0,delaySeconds)*1000,callback,tag,cancelled:false};tasks.push(task);return task.id;}
function cancel(id){const task=tasks.find(x=>x.id===id);if(task)task.cancelled=true;}
function cancelTag(tag){for(const task of tasks)if(task.tag===tag)task.cancelled=true;}
function update(now=performance.now()){for(let i=tasks.length-1;i>=0;i--){const task=tasks[i];if(task.cancelled){tasks.splice(i,1);continue;}if(task.at<=now){tasks.splice(i,1);try{task.callback();}catch(error){console.error('[Scheduler]',error);}}}}
window.GameScheduler={schedule,cancel,cancelTag,update,count:()=>tasks.length};
})();
;
(()=>{'use strict';
let resizeTimer=0,contextLost=false;
function bind({canvas,getEngine,pause,resume,onResize}={}){if(bind.done)return;bind.done=true;const setPaused=value=>{if(value){pause&&pause();window.GameEvents.emit('gamePaused',{reason:'lifecycle'});}else{resume&&resume();window.GameEvents.emit('gameResumed',{reason:'lifecycle'});}};document.addEventListener('visibilitychange',()=>setPaused(document.hidden));window.addEventListener('pagehide',()=>{window.SaveService&&window.SaveService.forceSave('pagehide');setPaused(true);});window.addEventListener('pageshow',e=>{if(e.persisted)setPaused(false);});const resize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const engine=getEngine&&getEngine();if(engine&&!contextLost)engine.resize();onResize&&onResize();},160);};window.addEventListener('resize',resize,{passive:true});window.visualViewport&&window.visualViewport.addEventListener('resize',resize,{passive:true});if(canvas){canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;setPaused(true);window.GameEvents.emit('webglContextLost',{});});canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;window.GameEvents.emit('webglContextRestored',{});setPaused(false);});}}
window.GameLifecycle={bind,get contextLost(){return contextLost;}};
})();
;
(()=>{'use strict';
const providers=new Map();let host=null,timer=0;
function register(name,fn){providers.set(name,fn);return()=>providers.delete(name);}
function snapshot(){const out={};for(const [name,fn] of providers){try{out[name]=fn();}catch(error){out[name]={error:error.message};}}return out;}
function startPanel(){if(!new URLSearchParams(location.search).has('debug'))return;if(host)return;host=document.createElement('pre');host.id='performanceDebug';Object.assign(host.style,{position:'fixed',left:'6px',bottom:'6px',zIndex:9999,margin:0,padding:'7px',maxWidth:'48vw',maxHeight:'42svh',overflow:'auto',font:'10px/1.35 monospace',color:'#bfffd4',background:'rgba(0,0,0,.76)',border:'1px solid #4b8',borderRadius:'6px',pointerEvents:'none'});document.body.appendChild(host);timer=setInterval(()=>{host.textContent=JSON.stringify(snapshot(),null,2);},500);}
window.RuntimeTelemetry={register,snapshot,startPanel,stopPanel(){clearInterval(timer);timer=0;if(host)host.remove();host=null;}};
document.addEventListener('DOMContentLoaded',startPanel,{once:true});
})();
;
(()=>{'use strict';
const C=window.GameConstants,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function playerInfo(state){const major=clamp(Number(state&&state.realm)||0,0,C.REALMS.length-1);if(major===0){const minor=clamp((Number(state.realmStage)||1)-1,0,11);return{major,minor,score:minor};}const minor=clamp(Number(state.period)||0,0,3);return{major,minor,score:12+(major-1)*4+minor};}
function enemyInfo(level=1){const lv=Math.max(1,Math.round(level||1));if(lv<=12)return{major:0,minor:lv-1,score:lv-1};const major=clamp(1+Math.floor((lv-13)/28),1,C.REALMS.length-1),minor=clamp(Math.floor(((lv-13)%28)/7),0,3);return{major,minor,score:12+(major-1)*4+minor};}
function getScore(value){if(typeof value==='number')return enemyInfo(value).score;if(value&&typeof value.score==='number')return value.score;return playerInfo(value).score;}
function getSuppression(attacker,defender){const a=typeof attacker==='number'?enemyInfo(attacker):(attacker&&typeof attacker.score==='number'?attacker:playerInfo(attacker));const d=typeof defender==='number'?enemyInfo(defender):(defender&&typeof defender.score==='number'?defender:playerInfo(defender));const diff=a.score-d.score;if(diff<=0)return 1;return Math.min(12,Math.pow(1.35,diff)*Math.pow(1.75,Math.max(0,a.major-d.major)));}
function compare(a,b){const ai=a&&typeof a.score==='number'?a:playerInfo(a),bi=b&&typeof b.score==='number'?b:playerInfo(b);return{delta:ai.score-bi.score,attacker:getSuppression(ai,bi),defender:getSuppression(bi,ai),factor:getSuppression(ai,bi)/Math.max(1,getSuppression(bi,ai))};}
window.RealmSystem={playerInfo,enemyInfo,getScore,getSuppression,compare};
})();
;
(()=>{'use strict';
function calculate({raw=0,defense=0,attackerRealm=null,defenderRealm=null,incomingMultiplier=1,variance=1,min=1}={}){let realmFactor=1;if(attackerRealm&&defenderRealm&&window.RealmSystem)realmFactor=window.RealmSystem.compare(attackerRealm,defenderRealm).factor;return Math.max(min,Math.round(Math.max(0,raw)*realmFactor*Math.max(0,incomingMultiplier)-Math.max(0,defense)*Math.max(0,variance)));}
function apply(target,options={}){if(!target||target.dead)return{damage:0,killed:false};const damage=calculate(options);target.hp=(Number(target.hp)||0)-damage;const killed=target.hp<=0;window.GameEvents&&window.GameEvents.emit('damageApplied',{target,damage,killed,type:options.type||'physical',source:options.source||null});return{damage,killed};}
window.DamageSystem={calculate,apply};
})();
;
(()=>{'use strict';
let activeMap=null;
const realmForLevel=level=>level<=12?0:level<=40?1:level<=68?2:level<=96?3:4;
function normalize(config={},meta={}){const minLevel=Number(config.minLevel??meta.min)||1,maxLevel=Number(config.maxLevel??meta.max)||minLevel;return Object.assign(config,{
 id:config.id||meta.id,name:config.name||meta.name||config.id,world:config.world||meta.world||'nhan_gioi',continent:config.continent||meta.continent||'',region:config.region||meta.region||'',
 minRealm:Number.isFinite(config.minRealm)?config.minRealm:realmForLevel(minLevel),maxRealm:Number.isFinite(config.maxRealm)?config.maxRealm:realmForLevel(maxLevel),minLevel,maxLevel,
 element:config.element||meta.element||'Vô',faction:config.faction||meta.faction||'Trung lập',enemyTable:Array.isArray(config.enemyTable)?config.enemyTable:(meta.enemy||[]),bossTable:Array.isArray(config.bossTable)?config.bossTable:[],
 resourceTable:Array.isArray(config.resourceTable)?config.resourceTable:[],resourceZones:Array.isArray(config.resourceZones)?config.resourceZones:[{id:'main',minGrade:1,maxGrade:realmForLevel(maxLevel)+1,count:10}],
 environment:config.environment||{},spawnPoints:Array.isArray(config.spawnPoints)?config.spawnPoints:[],portals:Array.isArray(config.portals)?config.portals:[],safeZones:Array.isArray(config.safeZones)?config.safeZones:[],music:config.music||null,weather:config.weather||'clear',assetGroups:Array.isArray(config.assetGroups)?config.assetGroups:[]
 });}
function setActive(config){activeMap=config;return config;}
window.WorldSystem={normalize,setActive,get activeMap(){return activeMap;},realmForLevel};
window.GameEvents.on('mapChanged',({config})=>setActive(config));
})();
;

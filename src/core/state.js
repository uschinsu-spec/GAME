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

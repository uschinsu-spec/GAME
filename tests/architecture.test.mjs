import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const context={console,performance:{now:()=>Date.now()},setTimeout,clearTimeout,window:{},navigator:{maxTouchPoints:0,hardwareConcurrency:8,deviceMemory:8},screen:{width:1280,height:720},location:{href:'https://example.test/Game/'}};
context.window=context;vm.createContext(context);
const run=file=>vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});

run('src/data/constants.js');
run('src/core/event-bus.js');
run('src/core/state.js');
run('src/items/inventory-system.js');
run('src/core/performance.js');
assert.equal(context.PerformanceProfile.PROFILES.LOW.renderScale,1.5);
assert.equal(context.PerformanceProfile.PROFILES.MEDIUM.renderScale,2.25);
assert.equal(context.PerformanceProfile.PROFILES.HIGH.renderScale,3);
context.PerformanceProfile.set('HIGH');
assert.equal(context.PerformanceProfile.name,'HIGH');
assert.equal(context.PerformanceProfile.manual,true);

const legacy={
 items:{'Linh Thạch':5},equipment:{weapon:'Thanh Vân Kiếm',armor:null,ring:null},
 itemSystem:{inventory:[{id:'g1',kind:'gear'},{id:'a1',kind:'artifact'}],equipment:{weapon:'g1'},artifacts:{primary:'a1'}},
 craftingV2:{inventory:{huyen_thiet_khoang:7},crafted:{tu_khi_dan:2},formations:{tu_linh_tran:1},artifacts:[{uid:'ca1',kind:'artifact'}],professions:{alchemy:{grade:2,mastery:20}}},
 learnedSkills:{kiem_0_0:1},equippedSkills:['kiem_0_0',null,null,null],regionId:'thanh_van_thon',realm:0,realmStage:3,level:8,hp:600,mp:180
};
const state=context.GameStateService.adopt(JSON.parse(JSON.stringify(legacy)));
assert.equal(state.version,5);
assert.equal(state.inventory.consumables['Linh Thạch'],5);
assert.equal(state.inventory.materials.huyen_thiet_khoang,7);
assert.equal(state.inventory.equipment.length,1);
assert.equal(state.inventory.artifacts.length,2);
assert.equal(state.professions.alchemy.grade,2);
assert.equal(state.items,state.inventory.consumables);
const before=JSON.stringify(state.inventory);
context.GameStateService.migrate(state);
assert.equal(JSON.stringify(state.inventory),before,'migration phải idempotent');

let added=0;context.GameEvents.on('itemAdded',()=>added++);
context.InventorySystem.add('hoa_van_thach',3,{bucket:'materials'});
assert.equal(context.InventorySystem.count('hoa_van_thach','materials'),3);
assert.equal(added,1);
assert.equal(context.InventorySystem.remove('hoa_van_thach',2,'materials'),true);
assert.equal(context.InventorySystem.count('hoa_van_thach','materials'),1);

run('skill-master-data.js');run('src/skills/skill-system.js');
assert.deepEqual(JSON.parse(JSON.stringify(context.SkillSystem.validate())),{ok:true,count:144});
assert.equal(context.SkillSystem.get('hoa_0_0').element,'Hỏa');

console.log('architecture.test: OK');

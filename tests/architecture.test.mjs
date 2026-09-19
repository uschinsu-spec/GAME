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
assert.equal(state.craftingV2,state.crafting,'craftingV2 chỉ là alias compatibility, không được là state thứ hai');
assert.equal(state.crafting.inventory,state.inventory.materials);
assert.equal(state.crafting.crafted,state.inventory.consumables);
assert.equal(state.crafting.formations,state.inventory.formations);
assert.equal(state.crafting.artifacts,state.inventory.artifacts);
assert.equal(state.crafting.professions,state.professions);
const before=JSON.stringify(state.inventory);
context.GameStateService.migrate(state);
assert.equal(JSON.stringify(state.inventory),before,'migration phải idempotent');

let added=0;context.GameEvents.on('itemAdded',()=>added++);
context.InventorySystem.add('hoa_van_thach',3,{bucket:'materials'});
assert.equal(context.InventorySystem.count('hoa_van_thach','materials'),3);
assert.equal(added,1);
assert.equal(context.InventorySystem.remove('hoa_van_thach',2,'materials'),true);
assert.equal(context.InventorySystem.count('hoa_van_thach','materials'),1);

run('crafting-recipes.js');
run('crafting-core.js');
const craftInventory={tu_linh_tinh_hoa:3,huyet_sam_tinh_hoa:1};
const craftResult=context.TuTienCraftingCore.craft('tu_linh_dan',{
 playerRealm:4,
 professions:{alchemy:{grade:5,mastery:0}},
 inventory:craftInventory,
 roll:0,
 qualityRoll:0
});
assert.equal(craftResult.ok,true);
assert.equal(craftResult.inventory,craftInventory,'crafting không được tạo inventory song song');
assert.equal(craftInventory.tu_linh_tinh_hoa,undefined);
assert.equal(craftInventory.huyet_sam_tinh_hoa,undefined);

state.progressionSystems={
 professions:{alchemy:{grade:4},forging:{grade:4},talisman:{grade:4}},
 materials:{linhThao:9,khoangThach:8,phuChi:7},
 pillInventory:{'hoi_khi|0|0':2},
 activeFormation:null
};
run('systems-progression.js');
const progression=context.TuTienSystems.migrate(state);
assert.equal(progression.professions,undefined);
assert.equal(progression.materials,undefined);
assert.ok(progression.legacyCraftingArchived);
assert.equal(progression.legacyCrafting.materials.linhThao,9);
const inventoryBeforeKill=JSON.stringify(state.inventory);
context.TuTienSystems.onKill(state,{boss:true},{toast(){}});
assert.equal(JSON.stringify(state.inventory),inventoryBeforeKill,'progression legacy không được drop vật phẩm lần hai');
assert.match(context.TuTienSystems.professionSummary(state),/Tinh Luyện Sư/);
assert.match(context.TuTienSystems.professionSummary(state),/Trận Pháp Sư/);

run('skill-master-data.js');run('src/skills/skill-system.js');
assert.deepEqual(JSON.parse(JSON.stringify(context.SkillSystem.validate())),{ok:true,count:144});
assert.equal(context.SkillSystem.get('hoa_0_0').element,'Hỏa');
run('src/skills/hoang-ha-vfx.js');
assert.deepEqual(JSON.parse(JSON.stringify(context.HoangHaVfx.validate())),{ok:true,count:9});
for(const id of Object.keys(context.HoangHaVfx.PROFILES)){
  const skill=context.SkillSystem.get(id);
  assert.ok(skill&&skill.tierIdx===0&&skill.rankIdx===0,`${id} phải là Hoàng Cấp Hạ Phẩm`);
  assert.ok(fs.existsSync(skill.icon),`${id} thiếu icon`);
  assert.ok(fs.existsSync(skill.vfx),`${id} thiếu VFX sheet`);
}

console.log('architecture.test: OK');

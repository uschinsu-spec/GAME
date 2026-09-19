(()=>{'use strict';
const SKILLS=[
 {id:'kiem_0_0',elemKey:'kiem',elem:'Kiếm',name:'Thanh Phong Kiếm Thức',faction:'Kiếm Tông',color:'#7ceaff',sfx:'slash',mult:1.35,shape:'sword',vfx:'assets/vfx/skills/kiem/hoang_ha/vfx_sheet.png',cols:5,rows:5,frames:22,mode:'projectile',size:2.0,speed:7.2},
 {id:'kiem_0_1',elemKey:'kiem',elem:'Kiếm',name:'Lưu Vân Kiếm Khí',faction:'Kiếm Tông',color:'#a7f3dc',sfx:'slash',mult:1.42,shape:'sword_wave',vfx:'assets/vfx/skills/kiem/hoang_trung/vfx_sheet.png',cols:4,rows:4,frames:16,mode:'fan',size:2.15,speed:6.2},
 {id:'kiem_0_2',elemKey:'kiem',elem:'Kiếm',name:'Tật Điện Kiếm Thức',faction:'Kiếm Tông',color:'#9d8cff',sfx:'thunder',mult:1.52,shape:'thunder_sword',vfx:'assets/vfx/skills/kiem/hoang_thuong/vfx_sheet.png',cols:6,rows:6,frames:36,mode:'strike',size:2.6,speed:0},
 {id:'kiem_0_3',elemKey:'kiem',elem:'Kiếm',name:'Vạn Kiếm Quy Tông',faction:'Kiếm Tông',color:'#ffd700',sfx:'breakthrough',mult:1.72,shape:'supreme_sword',vfx:'assets/vfx/skills/kiem/hoang_cuc/vfx_sheet.png',cols:5,rows:5,frames:25,mode:'ultimate',size:4.6,speed:0}
];
function get(index){return SKILLS[Math.abs(Number(index)||0)%SKILLS.length];}
function next(npc){if(!npc)return SKILLS[0];const i=Number.isFinite(npc._swordSkillIndex)?npc._swordSkillIndex:0;const sk=get(i);npc._swordSkillIndex=(i+1)%SKILLS.length;npc.assignedSkill=sk;return sk;}
window.NpcSkillCatalog={all:SKILLS,get,next};
})();
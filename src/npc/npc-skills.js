(()=>{'use strict';
const SKILLS=[
 {elemKey:'kiem',elem:'Kiếm',name:'Thanh Phong Kiếm Thức',faction:'Kiếm Tông',color:'#7ceaff',sfx:'slash',mult:1.35,shape:'sword'},
 {elemKey:'dao',elem:'Đao',name:'Liệp Hổ Đao Pháp',faction:'Đao Tông',color:'#ff776d',sfx:'slash',mult:1.42,shape:'blade'},
 {elemKey:'hoa',elem:'Hỏa',name:'Xích Viêm Hỏa Cầu',faction:'Hỏa Tông',color:'#ff6b3d',sfx:'fire',mult:1.45,shape:'fireball'},
 {elemKey:'loi',elem:'Lôi',name:'Dẫn Lôi Châm',faction:'Lôi Tông',color:'#9d8cff',sfx:'thunder',mult:1.40,shape:'lightning'},
 {elemKey:'thuy',elem:'Thủy',name:'Hàn Băng Thứ',faction:'Thủy Tông',color:'#64cfff',sfx:'hit',mult:1.36,shape:'ice_spike'},
 {elemKey:'moc',elem:'Mộc',name:'Thanh Mộc Thứ',faction:'Mộc Tông',color:'#68df8b',sfx:'slash',mult:1.34,shape:'wood_thorn'},
 {elemKey:'phong',elem:'Phong',name:'Phong Nhận Thuật',faction:'Phong Tông',color:'#a7f3dc',sfx:'slash',mult:1.38,shape:'wind_blade'},
 {elemKey:'tho',elem:'Thổ',name:'Thạch Giáp Thuật',faction:'Thổ Tông',color:'#c9a56b',sfx:'hit',mult:1.37,shape:'stone'},
 {elemKey:'kim',elem:'Kim',name:'Kim Cang Chỉ',faction:'Kim Tông',color:'#ffd86b',sfx:'slash',mult:1.44,shape:'gold_beam'}
];
window.NpcSkillCatalog={all:SKILLS,get:index=>SKILLS[Math.abs(Number(index)||0)%SKILLS.length]};
})();

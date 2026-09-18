(()=>{'use strict';
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);Object.values(value).forEach(deepFreeze);}return value;};
const C={
 SAVE_VERSION:5,
 BUILD_VERSION:'20260918-architecture-v5',
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

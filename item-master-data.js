(()=>{'use strict';
const GRADES=[
{id:1,name:'Nhất Phẩm',realm:0,mult:1.00},{id:2,name:'Nhị Phẩm',realm:1,mult:1.80},{id:3,name:'Tam Phẩm',realm:2,mult:3.25},{id:4,name:'Tứ Phẩm',realm:3,mult:5.85},{id:5,name:'Ngũ Phẩm',realm:4,mult:10.50}
];
const QUALITIES=[
{id:'ha',name:'Hạ phẩm',mult:1.00,affixes:1,color:'#aeb7c2'},
{id:'trung',name:'Trung phẩm',mult:1.15,affixes:2,color:'#5fcf8b'},
{id:'thuong',name:'Thượng phẩm',mult:1.30,affixes:3,color:'#b582ff'},
{id:'cuc',name:'Cực phẩm',mult:1.50,affixes:4,color:'#ffd76a'}
];
const ELEMENTS=['Vô','Kim','Mộc','Thủy','Hỏa','Thổ'];
const SLOTS={
weapon:'Vũ khí',head:'Đầu quan',armor:'Pháp bào',hands:'Hộ thủ',boots:'Giày',belt:'Đai lưng',necklace:'Hạng liên',ring1:'Nhẫn trái',ring2:'Nhẫn phải',jade:'Ngọc bội'
};
const SLOT_BASE={
weapon:{damage:38},head:{hp:75,defense:5},armor:{hp:150,defense:10},hands:{damage:12,defense:4},boots:{hp:45,defense:3,moveSpeed:.08},belt:{hp:100,defense:5},necklace:{spirit:18,damage:8},ring1:{damage:14,critChance:.006},ring2:{damage:14,critChance:.006},jade:{hp:55,spirit:14,defense:3}
};
const GEAR_NAMES={
weapon:['Thanh Vân Kiếm','Huyền Thiết Kiếm','Linh Mộc Kiếm','Hàn Thủy Kiếm','Xích Viêm Kiếm','Hậu Thổ Trọng Kiếm'],
head:['Thanh Linh Quan','Kim Quang Quan','Trường Sinh Quan','Hàn Nguyệt Quan','Liệt Diễm Quan','Huyền Sơn Quan'],
armor:['Thanh Vân Pháp Bào','Kim Cương Pháp Bào','Thanh Mộc Trường Sinh Bào','Huyền Thủy Pháp Bào','Xích Viêm Pháp Bào','Hậu Thổ Pháp Bào'],
hands:['Linh Văn Hộ Thủ','Canh Kim Hộ Thủ','Thanh Đằng Hộ Thủ','Băng Tâm Hộ Thủ','Hỏa Văn Hộ Thủ','Nham Giáp Hộ Thủ'],
boots:['Vân Bộ Ngoa','Kim Phong Ngoa','Thanh Diệp Ngoa','Lưu Thủy Ngoa','Hỏa Vân Ngoa','Địa Mạch Ngoa'],
belt:['Tụ Linh Đai','Kim Ti Đai','Trường Sinh Đai','Hàn Ngọc Đai','Xích Diễm Đai','Huyền Thổ Đai'],
necklace:['Tụ Linh Liên','Canh Kim Liên','Mộc Linh Liên','Huyền Thủy Liên','Ly Hỏa Liên','Hậu Thổ Liên'],
ring1:['Linh Ngọc Giới','Kim Linh Giới','Thanh Mộc Giới','Hàn Nguyệt Giới','Xích Viêm Giới','Huyền Sơn Giới'],
ring2:['Linh Ngọc Giới','Kim Linh Giới','Thanh Mộc Giới','Hàn Nguyệt Giới','Xích Viêm Giới','Huyền Sơn Giới'],
jade:['Thanh Tâm Ngọc','Kim Tinh Ngọc','Mộc Linh Ngọc','Thủy Tâm Ngọc','Hỏa Phách Ngọc','Thổ Linh Ngọc']
};
const AFFIXES=[
{id:'hp',label:'Sinh lực',stat:'hp',min:.06,max:.12},
{id:'defense',label:'Phòng thủ',stat:'defense',min:.05,max:.11},
{id:'damage',label:'Sát thương',stat:'damage',min:.05,max:.11},
{id:'crit',label:'Bạo kích',stat:'critChance',min:.004,max:.014},
{id:'critDmg',label:'Bạo thương',stat:'critDamage',min:.025,max:.07},
{id:'spirit',label:'Thần thức',stat:'spirit',min:.05,max:.12},
{id:'move',label:'Tốc độ di chuyển',stat:'moveSpeed',min:.01,max:.035},
{id:'fire',label:'Hỏa sát thương',stat:'elementDamage',element:'Hỏa',min:.06,max:.14},
{id:'water',label:'Thủy sát thương',stat:'elementDamage',element:'Thủy',min:.06,max:.14},
{id:'wood',label:'Mộc sát thương',stat:'elementDamage',element:'Mộc',min:.06,max:.14},
{id:'metal',label:'Kim sát thương',stat:'elementDamage',element:'Kim',min:.06,max:.14},
{id:'earth',label:'Thổ sát thương',stat:'elementDamage',element:'Thổ',min:.06,max:.14}
];
const ARTIFACT_ROLES=[
{id:'attack',name:'Công kích',bonus:{damage:.15},active:'Tự động công kích mục tiêu gần nhất.'},
{id:'burst',name:'Bạo phát',bonus:{critChance:.018,critDamage:.10},active:'Cường hóa bạo kích và sát thương bộc phát.'},
{id:'sustain',name:'Duy trì',bonus:{hp:.12,spirit:.10},active:'Tăng sinh tồn và khả năng duy trì pháp lực.'},
{id:'guard',name:'Phòng thủ',bonus:{defense:.18,hp:.08},active:'Gia cố hộ thể và giảm áp lực khi giao chiến.'},
{id:'support',name:'Hỗ trợ',bonus:{spirit:.16,moveSpeed:.025},active:'Tăng thần thức, vận hành và cơ động.'}
];
const ARTIFACT_NAMES={
Kim:['Kim Quang Kiếm Thai','Canh Kim Thần Chung','Thái Bạch Kim Luân','Vạn Kiếm Hồ','Kim Cương Ấn'],
Mộc:['Thanh Linh Bình','Trường Sinh Mộc','Bích Diệp Hồ','Vạn Mộc Đỉnh','Thanh Đế Ấn'],
Thủy:['Hàn Nguyệt Châu','Huyền Thủy Kính','Băng Phách Luân','Thương Hải Bình','Huyền Minh Ấn'],
Hỏa:['Xích Viêm Châu','Ly Hỏa Đỉnh','Cửu Dương Luân','Phần Thiên Hồ','Hỏa Hoàng Ấn'],
Thổ:['Huyền Sơn Ấn','Hậu Thổ Đỉnh','Địa Mạch Châu','Trấn Nhạc Bia','Càn Khôn Thổ Linh Ấn'],
Vô:['Tụ Linh Châu','Hộ Tâm Kính','Càn Khôn Hồ','Thần Hành Toa','Vạn Pháp Luân']
};
const ARTIFACT_PREFIX=['Sơ Linh','Huyền Linh','Địa Linh','Thiên Linh','Thần Linh'];
function artifactCatalog(){
 const out=[];
 for(let g=0;g<5;g++)for(const element of ELEMENTS){
  const names=ARTIFACT_NAMES[element];
  for(let r=0;r<ARTIFACT_ROLES.length;r++){
   const role=ARTIFACT_ROLES[r];
   out.push({id:`artifact_${g+1}_${element}_${role.id}`,name:`${ARTIFACT_PREFIX[g]} · ${names[r]}`,grade:g+1,realm:g,element,role:role.id,roleName:role.name,active:role.active,bonus:role.bonus});
  }
 }
 return out;
}
window.TuTienItemMaster={version:1,GRADES,QUALITIES,ELEMENTS,SLOTS,SLOT_BASE,GEAR_NAMES,AFFIXES,ARTIFACT_ROLES,artifacts:artifactCatalog()};
})();
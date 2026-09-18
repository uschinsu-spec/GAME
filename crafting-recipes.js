(()=>{'use strict';
const ARTIFACT_RECIPES=[
{id:'xich_viem_kiem',name:'Xích Viêm Kiếm',grade:2,profession:'artificing',element:'Hỏa',role:'attack',inputs:[['huyen_thiet_phoi_2',8],['xich_viem_phoi',3],['yeu_dan_2',1],['hoa_van_linh_moc',2]],output:{type:'artifact',base:'sword'}},
{id:'huyen_thuy_kinh',name:'Huyền Thủy Kính',grade:2,profession:'artificing',element:'Thủy',role:'guard',inputs:[['han_ngoc_phoi_2',6],['yeu_dan_2',1],['han_ngoc_moc',2]],output:{type:'artifact',base:'mirror'}},
{id:'canh_kim_than_chung',name:'Canh Kim Thần Chung',grade:3,profession:'artificing',element:'Kim',role:'guard',inputs:[['canh_kim_phoi',8],['yeu_dan_3',1],['linh_giac',2]],output:{type:'artifact',base:'bell'}},
{id:'dia_mach_an',name:'Địa Mạch Ấn',grade:4,profession:'artificing',element:'Thổ',role:'guard',inputs:[['dia_mach_phoi',8],['yeu_dan_4',1],['yeu_hon',2]],output:{type:'artifact',base:'seal'}},
{id:'hon_nguyen_luan',name:'Hỗn Nguyên Luân',grade:5,profession:'artificing',element:'Vô',role:'support',inputs:[['hon_nguyen_than_phoi',8],['hon_don_phoi',3],['yeu_dan_5',1],['hu_khong_tinh_thach',1]],output:{type:'artifact',base:'wheel'}}
];
const ALCHEMY_RECIPES=[
{id:'tu_linh_dan',name:'Tụ Linh Đan',grade:1,profession:'alchemy',inputs:[['tu_linh_tinh_hoa',3],['huyet_sam_tinh_hoa',1]],effect:{cultivationExpPct:.08}},
{id:'truc_co_dan',name:'Trúc Cơ Đan',grade:2,profession:'alchemy',inputs:[['truc_co_tinh_hoa',4],['dia_hoa_lien_tinh_hoa',1],['yeu_dan_2',1]],effect:{breakthroughAssist:.12}},
{id:'kim_dan_dan',name:'Kim Đan Ngưng Tụ Đan',grade:3,profession:'alchemy',inputs:[['kim_dan_tinh_hoa',4],['han_nguyet_tinh_hoa',2],['yeu_dan_3',1]],effect:{breakthroughAssist:.15}},
{id:'anh_linh_dan',name:'Anh Linh Đan',grade:4,profession:'alchemy',inputs:[['anh_linh_tinh_hoa',4],['dia_tam_hoa_tinh_hoa',2],['yeu_dan_4',1]],effect:{breakthroughAssist:.18}},
{id:'hoa_than_dan',name:'Hóa Thần Đan',grade:5,profession:'alchemy',inputs:[['hoa_than_tinh_hoa',4],['hon_nguyen_duoc_tinh_hoa',2],['yeu_dan_5',1]],effect:{breakthroughAssist:.22}}
];
const TALISMAN_RECIPES=[1,2,3,4,5].map(g=>({id:`cong_kich_phu_${g}`,name:`${['Nhất','Nhị','Tam','Tứ','Ngũ'][g-1]} Phẩm Toàn Lực Phù`,grade:g,profession:'talisman',inputs:[[g===1?'tu_linh_tinh_hoa':g===2?'truc_co_tinh_hoa':g===3?'kim_dan_tinh_hoa':g===4?'anh_linh_tinh_hoa':'hoa_than_tinh_hoa',2],[`yeu_dan_${g}`,1]],effect:{type:'fullStrike',realmPeak:g-1,requiresSpirit:true,requiresMana:true,realmSuppression:true}}));
const FORMATION_RECIPES=[
{id:'tu_linh_tran',name:'Tụ Linh Trận',grade:1,profession:'formation',inputs:[['huyen_thiet_tinh',4],['thanh_linh_moc',4]],effect:{cultivationSpeed:.15,herbGrowth:.15}},
{id:'ngu_hanh_tran',name:'Ngũ Hành Trận',grade:3,profession:'formation',inputs:[['canh_kim_tinh_luyen',2],['ly_hoa_tinh_luyen',2],['dai_dia_tinh_hoa',2],['yeu_dan_3',1]],effect:{elementPower:.2,realmSuppression:true}},
{id:'cao_cap_tu_linh_tran',name:'Cao Cấp Tụ Linh Trận',grade:4,profession:'formation',inputs:[['thien_ngoai_tinh',4],['van_nien_moc_tam',2],['yeu_dan_4',1]],effect:{cultivationSpeed:.3,herbGrowth:.3}}
];
const ALL=[...ARTIFACT_RECIPES,...ALCHEMY_RECIPES,...TALISMAN_RECIPES,...FORMATION_RECIPES];
const BY_ID=Object.fromEntries(ALL.map(x=>[x.id,x]));
window.TuTienCraftingRecipes={version:1,ARTIFACT_RECIPES,ALCHEMY_RECIPES,TALISMAN_RECIPES,FORMATION_RECIPES,ALL,BY_ID};
})();
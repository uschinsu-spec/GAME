(()=>{'use strict';
const GRADES=window.GameConstants.GRADES.map(x=>({...x}));
const QUALITY_RULES={ha:[1,.70],trung:[1.08,.80],thuong:[1.16,.90],cuc:[1.25,1]};
const QUALITIES=window.GameConstants.QUALITIES.map(x=>({...x,yield:QUALITY_RULES[x.id][0],purity:QUALITY_RULES[x.id][1]}));
const MINERALS=[
 {id:'huyen_thiet_khoang',name:'Huyền Thiết Khoáng',grade:1,element:'Vô',refined:'huyen_thiet_tinh',product:'huyen_thiet_phoi'},
 {id:'hoa_van_thach',name:'Hỏa Văn Thạch',grade:1,element:'Hỏa',refined:'hoa_van_tinh',product:'hoa_van_phoi'},
 {id:'han_ngoc_khoang',name:'Hàn Ngọc Khoáng',grade:1,element:'Thủy',refined:'han_ngoc_tinh',product:'han_ngoc_phoi'},
 {id:'huyen_thiet',name:'Huyền Thiết',grade:2,element:'Vô',refined:'huyen_thiet_tinh_2',product:'huyen_thiet_phoi_2'},
 {id:'xich_viem_tinh',name:'Xích Viêm Tinh',grade:2,element:'Hỏa',refined:'xich_viem_tinh_luyen',product:'xich_viem_phoi'},
 {id:'han_ngoc',name:'Hàn Ngọc',grade:2,element:'Thủy',refined:'han_ngoc_tinh_2',product:'han_ngoc_phoi_2'},
 {id:'canh_kim_tinh',name:'Canh Kim Tinh',grade:3,element:'Kim',refined:'canh_kim_tinh_luyen',product:'canh_kim_phoi'},
 {id:'ly_hoa_tinh_kim',name:'Ly Hỏa Tinh Kim',grade:3,element:'Hỏa',refined:'ly_hoa_tinh_luyen',product:'ly_hoa_phoi'},
 {id:'dai_dia_tinh_tuy',name:'Đại Địa Tinh Tủy',grade:3,element:'Thổ',refined:'dai_dia_tinh_hoa',product:'dai_dia_phoi'},
 {id:'thien_ngoai_huyen_thiet',name:'Thiên Ngoại Huyền Thiết',grade:4,element:'Vô',refined:'thien_ngoai_tinh',product:'thien_ngoai_phoi'},
 {id:'thai_duong_tinh_kim',name:'Thái Dương Tinh Kim',grade:4,element:'Hỏa',refined:'thai_duong_tinh_luyen',product:'thai_duong_phoi'},
 {id:'dia_mach_tinh_tuy',name:'Địa Mạch Tinh Tủy',grade:4,element:'Thổ',refined:'dia_mach_tinh_hoa',product:'dia_mach_phoi'},
 {id:'hon_nguyen_than_thiet',name:'Hỗn Nguyên Thần Thiết',grade:5,element:'Vô',refined:'hon_nguyen_tinh',product:'hon_nguyen_than_phoi'},
 {id:'tien_thien_canh_kim',name:'Tiên Thiên Canh Kim',grade:5,element:'Kim',refined:'tien_thien_canh_kim_tinh',product:'tien_thien_canh_kim_phoi'},
 {id:'hon_don_thach',name:'Hỗn Độn Thạch',grade:5,element:'Vô',refined:'hon_don_tinh_hoa',product:'hon_don_phoi'}
];
const HERBS=[
 {id:'tu_linh_thao',name:'Tụ Linh Thảo',grade:1,element:'Vô',processed:'tu_linh_duoc_tai',essence:'tu_linh_tinh_hoa'},
 {id:'hoa_linh_qua',name:'Hỏa Linh Quả',grade:1,element:'Hỏa',processed:'hoa_linh_duoc_tai',essence:'hoa_linh_tinh_hoa'},
 {id:'huyet_sam',name:'Huyết Sâm',grade:1,element:'Mộc',processed:'huyet_sam_duoc_tai',essence:'huyet_sam_tinh_hoa'},
 {id:'truc_co_thao',name:'Trúc Cơ Thảo',grade:2,element:'Mộc',processed:'truc_co_duoc_tai',essence:'truc_co_tinh_hoa'},
 {id:'dia_hoa_lien',name:'Địa Hỏa Liên',grade:2,element:'Hỏa',processed:'dia_hoa_lien_duoc_tai',essence:'dia_hoa_lien_tinh_hoa'},
 {id:'kim_dan_qua',name:'Kim Đan Quả',grade:3,element:'Kim',processed:'kim_dan_duoc_tai',essence:'kim_dan_tinh_hoa'},
 {id:'han_nguyet_lien',name:'Hàn Nguyệt Liên',grade:3,element:'Thủy',processed:'han_nguyet_duoc_tai',essence:'han_nguyet_tinh_hoa'},
 {id:'anh_linh_qua',name:'Anh Linh Quả',grade:4,element:'Vô',processed:'anh_linh_duoc_tai',essence:'anh_linh_tinh_hoa'},
 {id:'dia_tam_hoa_lien',name:'Địa Tâm Hỏa Liên',grade:4,element:'Hỏa',processed:'dia_tam_hoa_duoc_tai',essence:'dia_tam_hoa_tinh_hoa'},
 {id:'hoa_than_qua',name:'Hóa Thần Quả',grade:5,element:'Vô',processed:'hoa_than_duoc_tai',essence:'hoa_than_tinh_hoa'},
 {id:'hon_nguyen_thao',name:'Hỗn Nguyên Thảo',grade:5,element:'Vô',processed:'hon_nguyen_duoc_tai',essence:'hon_nguyen_duoc_tinh_hoa'}
];
const BY_ID={};
MINERALS.forEach(x=>BY_ID[x.id]=Object.assign({family:'mineral'},x));
HERBS.forEach(x=>BY_ID[x.id]=Object.assign({family:'herb'},x));
window.TuTienCraftingMaterials={version:1,GRADES,QUALITIES,MINERALS,HERBS,BY_ID};
})();

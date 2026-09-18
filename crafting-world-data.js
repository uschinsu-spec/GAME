(()=>{'use strict';
const ELEMENTS=['Vô','Kim','Mộc','Thủy','Hỏa','Thổ'];
const MONSTER_MATERIALS=[
{id:'yeu_dan_1',name:'Nhất Phẩm Yêu Đan',grade:1,family:'monster',uses:['alchemy','artificing','talisman','formation']},
{id:'yeu_dan_2',name:'Nhị Phẩm Yêu Đan',grade:2,family:'monster',uses:['alchemy','artificing','talisman','formation']},
{id:'yeu_dan_3',name:'Tam Phẩm Yêu Đan',grade:3,family:'monster',uses:['alchemy','artificing','talisman','formation']},
{id:'yeu_dan_4',name:'Tứ Phẩm Yêu Đan',grade:4,family:'monster',uses:['alchemy','artificing','talisman','formation']},
{id:'yeu_dan_5',name:'Ngũ Phẩm Yêu Đan',grade:5,family:'monster',uses:['alchemy','artificing','talisman','formation']},
{id:'tinh_huyet_yeu_thu',name:'Tinh Huyết Yêu Thú',grade:1,family:'monster',uses:['alchemy','talisman']},
{id:'yeu_hon',name:'Yêu Hồn',grade:2,family:'monster',uses:['artificing','formation']},
{id:'yeu_cot',name:'Yêu Cốt',grade:1,family:'monster',uses:['artificing']},
{id:'yeu_bi',name:'Yêu Bì',grade:1,family:'monster',uses:['talisman','artificing']},
{id:'linh_giac',name:'Linh Giác',grade:2,family:'monster',uses:['artificing','formation']},
{id:'linh_lan',name:'Linh Lân',grade:2,family:'monster',uses:['artificing']}
];
const TREASURES=[
{id:'cuu_thien_tuc_nhuong',name:'Cửu Thiên Tức Nhưỡng',grade:5,element:'Thổ',family:'treasure'},
{id:'thai_duong_chan_hoa',name:'Thái Dương Chân Hỏa',grade:5,element:'Hỏa',family:'treasure'},
{id:'huyen_minh_chan_thuy',name:'Huyền Minh Chân Thủy',grade:5,element:'Thủy',family:'treasure'},
{id:'tien_thien_canh_kim_bao',name:'Tiên Thiên Canh Kim',grade:5,element:'Kim',family:'treasure'},
{id:'kien_moc_chi_tam',name:'Kiến Mộc Chi Tâm',grade:5,element:'Mộc',family:'treasure'},
{id:'hu_khong_tinh_thach',name:'Hư Không Tinh Thạch',grade:5,element:'Vô',family:'treasure'},
{id:'hon_don_khi',name:'Hỗn Độn Khí',grade:5,element:'Vô',family:'treasure'}
];
const SPIRIT_WOODS=[
{id:'thanh_linh_moc',name:'Thanh Linh Mộc',grade:1,element:'Mộc',family:'spiritWood'},
{id:'hoa_van_linh_moc',name:'Hỏa Văn Linh Mộc',grade:2,element:'Hỏa',family:'spiritWood'},
{id:'han_ngoc_moc',name:'Hàn Ngọc Mộc',grade:2,element:'Thủy',family:'spiritWood'},
{id:'van_nien_moc_tam',name:'Vạn Niên Mộc Tâm',grade:4,element:'Mộc',family:'spiritWood'},
{id:'kien_moc_tam',name:'Kiến Mộc Tâm',grade:5,element:'Mộc',family:'spiritWood'}
];
const GATHERING_ZONES=[
{id:'realm_1',realm:0,maxGrade:1,mineralDensity:1,herbDensity:1},
{id:'realm_2',realm:1,maxGrade:2,mineralDensity:1.1,herbDensity:1.1},
{id:'realm_3',realm:2,maxGrade:3,mineralDensity:1.15,herbDensity:1.15},
{id:'realm_4',realm:3,maxGrade:4,mineralDensity:1.2,herbDensity:1.2},
{id:'realm_5',realm:4,maxGrade:5,mineralDensity:1.25,herbDensity:1.25}
];
const HERB_AGE_QUALITY=[
{minAge:0,quality:'ha'},{minAge:100,quality:'trung'},{minAge:300,quality:'thuong'},{minAge:500,quality:'cuc'}
];
function herbQualityByAge(age=0){let q='ha';for(const x of HERB_AGE_QUALITY)if(age>=x.minAge)q=x.quality;return q;}
function monsterDrops(monsterGrade=1,element='Vô'){const grade=Math.max(1,Math.min(5,monsterGrade));return [{id:`yeu_dan_${grade}`,chance:.18+.02*grade},{id:'tinh_huyet_yeu_thu',chance:.28},{id:'yeu_cot',chance:.2},{id:'yeu_bi',chance:.18},{id:'yeu_hon',chance:grade>=2?.12:0,element}];}
window.TuTienCraftingWorld={version:1,ELEMENTS,MONSTER_MATERIALS,TREASURES,SPIRIT_WOODS,GATHERING_ZONES,HERB_AGE_QUALITY,herbQualityByAge,monsterDrops};
})();
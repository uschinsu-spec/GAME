(()=>{'use strict';
const PROFESSIONS={
 refining:{id:'refining',name:'Tinh Luyện Sư',uses:['mineral','herb'],description:'Tinh luyện quặng, tạo phôi; sơ chế và chiết xuất linh dược.'},
 artificing:{id:'artificing',name:'Luyện Khí Sư',uses:['blank','monster','treasure'],description:'Luyện chế trang bị và pháp bảo.'},
 alchemy:{id:'alchemy',name:'Luyện Đan Sư',uses:['processedHerb','essence','monster'],description:'Luyện chế đan dược.'},
 talisman:{id:'talisman',name:'Chế Phù Sư',uses:['essence','monster','mineral'],description:'Chế tạo phù lục công kích, phòng thủ và hỗ trợ.'},
 formation:{id:'formation',name:'Trận Pháp Sư',uses:['mineral','spiritWood','monster'],description:'Chế tạo trận kỳ, trận bàn và trận nhãn.'}
};
const GRADES=[1,2,3,4,5].map(id=>({id,name:['Nhất Phẩm','Nhị Phẩm','Tam Phẩm','Tứ Phẩm','Ngũ Phẩm'][id-1],realm:id-1}));
const QUALITY=['ha','trung','thuong','cuc'];
function cap(playerRealm=0,professionGrade=1){return Math.max(1,Math.min(5,playerRealm+1,professionGrade));}
function canCraft(requiredGrade,ctx={}){const c=cap(ctx.playerRealm||0,ctx.professionGrade||1);return {ok:requiredGrade<=c,cap:c,requiredGrade};}
function masteryBonus(mastery=0){return Math.min(.25,Math.max(0,mastery)*.0015);}
function gainMastery(state,amount=1){state=state||{grade:1,mastery:0};state.mastery=Math.max(0,(state.mastery||0)+amount);return state;}
window.TuTienProfessions={version:1,PROFESSIONS,GRADES,QUALITY,cap,canCraft,masteryBonus,gainMastery};
})();
(()=>{'use strict';
const PLOTS_DEFAULT=6;
function newField(size=PLOTS_DEFAULT){return {plots:Array.from({length:size},(_,i)=>({id:i,seed:null,plantedAt:0,age:0,boost:1,ready:false})),formationBonus:0};}
function plant(field,plotId,seedId,now=Date.now()){const p=field.plots.find(x=>x.id===plotId);if(!p||p.seed)return {ok:false,reason:'Ô linh điền không hợp lệ hoặc đang có cây.'};p.seed=seedId;p.plantedAt=now;p.age=0;p.ready=false;return {ok:true,plot:p};}
function tick(field,hours=1){for(const p of field.plots){if(!p.seed)continue;p.age+=Math.max(0,hours)*(p.boost||1)*(1+(field.formationBonus||0));p.ready=p.age>=50;}return field;}
function harvest(field,plotId){const p=field.plots.find(x=>x.id===plotId);if(!p||!p.seed)return {ok:false,reason:'Không có linh dược.'};if(!p.ready)return {ok:false,reason:'Linh dược chưa trưởng thành.'};const q=window.TuTienCraftingWorld?window.TuTienCraftingWorld.herbQualityByAge(p.age):'ha';const out={id:p.seed,quantity:1,quality:q,age:Math.floor(p.age)};p.seed=null;p.plantedAt=0;p.age=0;p.ready=false;return {ok:true,output:out};}
function applyFormation(field,effect={}){field.formationBonus=Math.max(0,effect.herbGrowth||0);return field;}
window.TuTienSpiritField={version:1,newField,plant,tick,harvest,applyFormation};
})();
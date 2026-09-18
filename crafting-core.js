(()=>{'use strict';
const Q=['ha','trung','thuong','cuc'];
const QN={ha:'Hạ phẩm',trung:'Trung phẩm',thuong:'Thượng phẩm',cuc:'Cực phẩm'};
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function invQty(inv,id){return Math.max(0,Number(inv&&inv[id]||0));}
function hasInputs(inv,inputs){for(const [id,n] of inputs||[])if(invQty(inv,id)<n)return false;return true;}
function consumeInPlace(inv,inputs){
 if(!inv||typeof inv!=='object')throw new TypeError('Crafting inventory phải là object chuẩn');
 for(const [id,n] of inputs||[]){
  const next=Math.max(0,invQty(inv,id)-Math.max(0,Number(n)||0));
  if(next>0)inv[id]=next;else delete inv[id];
 }
 return inv;
}
function professionState(ctx,profession){return (ctx.professions&&ctx.professions[profession])||{grade:1,mastery:0};}
function canCraft(recipe,ctx={}){
 if(!recipe)return {ok:false,reason:'Không tìm thấy công thức.'};
 const ps=professionState(ctx,recipe.profession),realm=Number(ctx.playerRealm)||0;
 const cap=Math.min(realm+1,ps.grade||1,5);
 if(recipe.grade>cap)return {ok:false,reason:`Cần ${recipe.profession} và cảnh giới đạt tối thiểu ${recipe.grade} phẩm.`,cap};
 if(!hasInputs(ctx.inventory||{},recipe.inputs))return {ok:false,reason:'Không đủ nguyên liệu.',cap};
 return {ok:true,cap,profession:ps};
}
function chance(recipe,ctx={}){const ps=professionState(ctx,recipe.profession),diff=(ps.grade||1)-recipe.grade;return clamp(.78+diff*.055+(ps.mastery||0)*.0014,.35,.99);}
function quality(recipe,ctx={},roll=Math.random()){
 const ps=professionState(ctx,recipe.profession),score=(ps.mastery||0)*.0015+((ps.grade||1)-recipe.grade)*.045;
 const weights=[.55,.28,.13,.04];weights[0]=clamp(weights[0]-score,.15,.7);weights[1]+=score*.45;weights[2]+=score*.35;weights[3]+=score*.2;
 const total=weights.reduce((a,b)=>a+b,0);let x=roll*total;for(let i=0;i<weights.length;i++){x-=weights[i];if(x<=0)return Q[i];}return'cuc';
}
function craft(recipeId,ctx={}){
 const R=window.TuTienCraftingRecipes&&window.TuTienCraftingRecipes.BY_ID,recipe=R&&R[recipeId],check=canCraft(recipe,ctx);if(!check.ok)return check;
 const successChance=chance(recipe,ctx),roll=typeof ctx.roll==='number'?ctx.roll:Math.random();
 const inventory=consumeInPlace(ctx.inventory||{},recipe.inputs);
 if(roll>successChance)return {ok:false,reason:'Chế tạo thất bại.',consumed:true,inventory,successChance,byproduct:{id:'phe_lieu',name:'Phế Liệu',quantity:1}};
 const q=quality(recipe,ctx,typeof ctx.qualityRoll==='number'?ctx.qualityRoll:Math.random());
 return {ok:true,recipeId,inventory,successChance,quality:q,qualityName:QN[q],output:{id:recipe.id,name:recipe.name,grade:recipe.grade,quality:q,profession:recipe.profession,element:recipe.element||'Vô',role:recipe.role||null,effect:recipe.effect||null,type:recipe.output&&recipe.output.type||recipe.profession}};
}
window.TuTienCraftingCore={version:2,Q,QN,hasInputs,canCraft,chance,quality,craft,consumeInPlace};
})();

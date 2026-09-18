(()=>{'use strict';
if(window.TuTienGathering){
 const oldGenerate=window.TuTienGathering.generateNodes;
 window.TuTienGathering.generateNodes=function(opts={}){
  const nodes=oldGenerate?oldGenerate(opts):[];
  const realm=Math.max(0,Math.min(4,Number(opts.realm)||0));
  const woods=((window.TuTienCraftingWorld&&window.TuTienCraftingWorld.SPIRIT_WOODS)||[]).filter(x=>(x.grade||1)<=realm+1);
  if(woods.length){
   const extra=Math.max(2,Math.min(4,Math.ceil((opts.count||10)*.25)));
   for(let i=0;i<extra;i++){
    const w=woods[Math.floor(Math.random()*woods.length)];
    nodes.push({id:'wood_'+Date.now()+'_'+i,materialId:w.id,family:'spiritWood',grade:w.grade,element:w.element||'Mộc',x:Math.random(),z:Math.random(),respawnSeconds:120+Math.floor(Math.random()*180),active:true});
   }
  }
  return nodes;
 };
}
if(window.TuTienCraftingWorld&&window.TuTienCraftingWorld.monsterDrops){
 const oldDrops=window.TuTienCraftingWorld.monsterDrops;
 window.TuTienCraftingWorld.monsterDrops=function(grade,element){return oldDrops(Math.max(1,Math.min(5,Math.floor(Number(grade)||1))),element);};
}
})();
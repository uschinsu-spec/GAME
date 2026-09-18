(()=>{'use strict';
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function weightedQuality(roll=Math.random(),bonus=0){const r=clamp(roll-bonus,0,1);if(r<.015)return 'cuc';if(r<.08)return 'thuong';if(r<.28)return 'trung';return 'ha';}
function resourcesForGrade(grade=1){const M=window.TuTienCraftingMaterials||{};return [...(M.MINERALS||[]),...(M.HERBS||[])].filter(x=>x.grade<=grade);}
function generateNodes({realm=0,count=12,seed=Math.random}={}){const maxGrade=clamp(realm+1,1,5);const pool=resourcesForGrade(maxGrade);const nodes=[];for(let i=0;i<count&&pool.length;i++){const mat=pool[Math.floor(seed()*pool.length)];nodes.push({id:`node_${Date.now()}_${i}`,materialId:mat.id,family:mat.family,grade:mat.grade,element:mat.element,x:seed(),z:seed(),respawnSeconds:90+Math.floor(seed()*210),active:true});}return nodes;}
function gather(node,{gatheringMastery=0,roll=Math.random()}={}){if(!node||!node.active)return {ok:false,reason:'Tài nguyên chưa hồi phục.'};node.active=false;const bonus=Math.min(.08,gatheringMastery*.0004);const quality=weightedQuality(roll,bonus);const qty=1+Math.floor(Math.random()*(node.family==='mineral'?4:3));return {ok:true,output:{id:node.materialId,quantity:qty,quality,grade:node.grade,element:node.element},respawnSeconds:node.respawnSeconds};}
function respawn(node){if(node)node.active=true;return node;}
window.TuTienGathering={version:1,weightedQuality,resourcesForGrade,generateNodes,gather,respawn};
})();
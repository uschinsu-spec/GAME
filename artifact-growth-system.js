(()=>{'use strict';
const STAGES=[
{id:'fan',name:'Phàm',min:0},{id:'thong_linh',name:'Thông Linh',min:20},{id:'linh_tri',name:'Linh Trí',min:40},{id:'khi_linh',name:'Khí Linh',min:60},{id:'chan_linh',name:'Chân Linh',min:80}
];
function stage(spirit=0){let s=STAGES[0];for(const x of STAGES)if(spirit>=x.min)s=x;return s;}
function bind(artifact){return Object.assign({},artifact,{bonded:true,spirit:artifact.spirit||0,spiritStage:stage(artifact.spirit||0).id});}
function feed(artifact,material={}){if(!artifact||!artifact.bonded)return {ok:false,reason:'Pháp bảo chưa được chọn làm bản mệnh.'};const grade=Math.max(1,material.grade||1);const q={ha:1,trung:1.25,thuong:1.6,cuc:2}[material.quality||'ha']||1;const familyBonus=material.family==='treasure'?3:material.family==='monster'?1.5:1;const gain=Math.max(1,Math.round(grade*q*familyBonus));artifact.spirit=Math.min(100,(artifact.spirit||0)+gain);artifact.spiritStage=stage(artifact.spirit).id;return {ok:true,gain,spirit:artifact.spirit,stage:stage(artifact.spirit)};}
window.TuTienArtifactGrowth={version:1,STAGES,stage,bind,feed};
})();
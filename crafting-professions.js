(()=>{'use strict';
const PROFESSIONS=window.GameConstants.PROFESSIONS;
const GRADES=window.GameConstants.GRADES;
const QUALITY=window.GameConstants.QUALITIES.map(x=>x.id);
function cap(playerRealm=0,professionGrade=1){return Math.max(1,Math.min(5,playerRealm+1,professionGrade));}
function canCraft(requiredGrade,ctx={}){const c=cap(ctx.playerRealm||0,ctx.professionGrade||1);return {ok:requiredGrade<=c,cap:c,requiredGrade};}
function masteryBonus(mastery=0){return Math.min(.25,Math.max(0,mastery)*.0015);}
function gainMastery(state,amount=1){state=state||{grade:1,mastery:0};state.mastery=Math.max(0,(state.mastery||0)+amount);return state;}
window.TuTienProfessions={version:1,PROFESSIONS,GRADES,QUALITY,cap,canCraft,masteryBonus,gainMastery};
})();

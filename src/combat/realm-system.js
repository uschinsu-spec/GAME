(()=>{'use strict';
const C=window.GameConstants,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function playerInfo(state){const major=clamp(Number(state&&state.realm)||0,0,C.REALMS.length-1);if(major===0){const minor=clamp((Number(state.realmStage)||1)-1,0,11);return{major,minor,score:minor};}const minor=clamp(Number(state.period)||0,0,3);return{major,minor,score:12+(major-1)*4+minor};}
function enemyInfo(level=1){const lv=Math.max(1,Math.round(level||1));if(lv<=12)return{major:0,minor:lv-1,score:lv-1};const major=clamp(1+Math.floor((lv-13)/28),1,C.REALMS.length-1),minor=clamp(Math.floor(((lv-13)%28)/7),0,3);return{major,minor,score:12+(major-1)*4+minor};}
function getScore(value){if(typeof value==='number')return enemyInfo(value).score;if(value&&typeof value.score==='number')return value.score;return playerInfo(value).score;}
function getSuppression(attacker,defender){const a=typeof attacker==='number'?enemyInfo(attacker):(attacker&&typeof attacker.score==='number'?attacker:playerInfo(attacker));const d=typeof defender==='number'?enemyInfo(defender):(defender&&typeof defender.score==='number'?defender:playerInfo(defender));const diff=a.score-d.score;if(diff<=0)return 1;return Math.min(12,Math.pow(1.35,diff)*Math.pow(1.75,Math.max(0,a.major-d.major)));}
function compare(a,b){const ai=a&&typeof a.score==='number'?a:playerInfo(a),bi=b&&typeof b.score==='number'?b:playerInfo(b);return{delta:ai.score-bi.score,attacker:getSuppression(ai,bi),defender:getSuppression(bi,ai),factor:getSuppression(ai,bi)/Math.max(1,getSuppression(bi,ai))};}
window.RealmSystem={playerInfo,enemyInfo,getScore,getSuppression,compare};
})();

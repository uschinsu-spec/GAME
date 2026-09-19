(()=>{'use strict';
const C=window.GameConstants,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ENEMY_GRADES=['Nhất Phẩm','Nhị Phẩm','Tam Phẩm','Tứ Phẩm','Ngũ Phẩm'];
const ENEMY_PERIODS=['Sơ Kỳ','Trung Kỳ','Hậu Kỳ','Đỉnh Phong'];
function playerInfo(state){const major=clamp(Number(state&&state.realm)||0,0,4);let minor=0;if(major===0){const stage=clamp(Number(state&&state.realmStage)||1,1,12);minor=Math.min(3,Math.floor((stage-1)/3));}else{minor=clamp(Number(state&&state.period)||0,0,3);}const score=major*4+minor;return{major,minor,score,gradeName:ENEMY_GRADES[major],periodName:ENEMY_PERIODS[minor]};}
function enemyInfo(level=1){const lv=Math.max(1,Math.round(level||1));let grade=0,period=0;if(lv<=12){grade=0;period=Math.min(3,Math.floor((lv-1)/3));}else{const rem=lv-13;grade=clamp(1+Math.floor(rem/16),1,4);period=clamp(Math.floor((rem%16)/4),0,3);}const score=grade*4+period;return{major:grade,minor:period,grade,period,score,gradeName:ENEMY_GRADES[grade],periodName:ENEMY_PERIODS[period],displayName:`${ENEMY_GRADES[grade]} · ${ENEMY_PERIODS[period]}`};}
function getScore(value){if(typeof value==='number')return enemyInfo(value).score;if(value&&typeof value.score==='number')return value.score;return playerInfo(value).score;}
function getSuppression(attacker,defender){const a=typeof attacker==='number'?enemyInfo(attacker):(attacker&&typeof attacker.score==='number'?attacker:playerInfo(attacker));const d=typeof defender==='number'?enemyInfo(defender):(defender&&typeof defender.score==='number'?defender:playerInfo(defender));const diff=a.score-d.score;if(diff===0)return 1.0;if(diff>0)return Math.min(15.0,1.0+diff*0.65);return Math.max(0.10,1.0/(1.0+Math.abs(diff)*0.60));}
function compare(a,b){const ai=a&&typeof a.score==='number'?a:playerInfo(a),bi=b&&typeof b.score==='number'?b:playerInfo(b);return{delta:ai.score-bi.score,attacker:getSuppression(ai,bi),defender:getSuppression(bi,ai),factor:getSuppression(ai,bi)/Math.max(0.1,getSuppression(bi,ai))};}
window.RealmSystem={playerInfo,enemyInfo,getScore,getSuppression,compare};
})();

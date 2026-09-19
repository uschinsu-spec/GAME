// Test: Monster Dominance at Equal Realm vs Player Dominance when 1+ Minor Realm Higher

function simCombat(pScore, eScore, pBaseHp, pBaseDmg, eBaseHp, eBaseAtk) {
  const diff = pScore - eScore;

  // Player suppression on enemy
  let pSupp = 1.0;
  if (diff === 0) pSupp = 0.70;
  else if (diff === 1) pSupp = 1.85;
  else if (diff === 2) pSupp = 3.50;
  else if (diff === 3) pSupp = 6.00;
  else if (diff >= 4) pSupp = 8.5 * Math.pow(1.40, diff - 4);
  else if (diff === -1) pSupp = 0.40;
  else if (diff === -2) pSupp = 0.20;
  else pSupp = Math.max(0.02, 0.03 / Math.pow(1.45, Math.abs(diff) - 4));

  // Enemy suppression on player
  const eDiff = eScore - pScore;
  let eSupp = 1.0;
  if (eDiff === 0) eSupp = 1.30;
  else if (eDiff === 1) eSupp = 1.90;
  else if (eDiff >= 4) eSupp = 8.5 * Math.pow(1.40, eDiff - 4);
  else if (eDiff === -1) eSupp = 0.40;
  else if (eDiff === -2) eSupp = 0.20;
  else eSupp = Math.max(0.02, 0.03 / Math.pow(1.45, Math.abs(eDiff) - 4));

  const pDmg = Math.round(pBaseDmg * 1.35 * pSupp);
  const eDmg = Math.round(eBaseAtk * eSupp * 0.75);

  const hitsForPlayerToKill = Math.ceil(eBaseHp / pDmg);
  const hitsForEnemyToKill = Math.ceil(pBaseHp / eDmg);

  return { pDmg, eDmg, hitsForPlayerToKill, hitsForEnemyToKill, pSupp, eSupp };
}

console.log('=== TRƯỜNG HỢP 1: CÙNG TIỂU CẢNH GIỚI (DIFF = 0) -> QUÁI MẠNH HƠN PLAYER ===');
const case1 = simCombat(0, 0, 950, 22, 1200, 18);
console.log(`Player gây: ${case1.pDmg} dmg/hit -> Cần ${case1.hitsForPlayerToKill} hits để diệt quái.`);
console.log(`Quái gây: ${case1.eDmg} dmg/hit -> Quái áp đảo, chỉ số hung hãn hơn Player.`);

console.log('\n=== TRƯỜNG HỢP 2: PLAYER HƠN 1 TIỂU CẢNH GIỚI (DIFF = 1) -> QUÁI YẾU HƠN PLAYER RÕ RỆT ===');
const case2 = simCombat(1, 0, 1070, 25, 1200, 18);
console.log(`Player gây: ${case2.pDmg} dmg/hit (Tăng lên ${case2.pSupp}x) -> Cần ${case2.hitsForPlayerToKill} hits để diệt quái (Nhanh gấp 3 lần).`);
console.log(`Quái chỉ gây: ${case2.eDmg} dmg/hit (Bị giảm xuống ${case2.eSupp}x) -> Quái hoàn toàn yếu thế và thua Player!`);

console.log('\n=== TRƯỜNG HỢP 3: PLAYER HƠN 1 ĐẠI CẢNH GIỚI (DIFF = 4) -> 2 ĐẾN 3 HIT ===');
const case3 = simCombat(4, 0, 2400, 55, 1200, 18);
console.log(`Player gây: ${case3.pDmg} dmg/hit lên quái 1200 HP -> CẦN ĐÚNG ${case3.hitsForPlayerToKill} HITS LÀ DIỆT QUÁI!`);

// Test suppression with the exact 2-3 hits rule for 1 Major Realm gap

function getSuppression(attackerScore, defenderScore) {
  const diff = attackerScore - defenderScore;
  if (diff === 0) return 0.75; // Cùng cảnh giới: cần nhiều chiêu
  if (diff === 1) return 1.85;
  if (diff === 2) return 3.80;
  if (diff === 3) return 7.50;
  if (diff >= 4) {
    // Cách >= 1 Đại cảnh giới: áp chế vượt bậc
    // diff = 4 -> 16x; diff = 8 -> 60x
    return 16.0 * Math.pow(1.45, diff - 4);
  }
  // Kém cảnh giới
  if (diff === -1) return 0.45;
  if (diff === -2) return 0.22;
  if (diff === -3) return 0.10;
  return Math.max(0.02, 0.04 / Math.pow(1.5, Math.abs(diff) - 4));
}

const REALMS = [
  { name: 'Luyện Khí (Cấp 1)', score: 0, baseHp: 950, baseDmg: 22, mobHp: 1200, mobAtk: 18 },
  { name: 'Trúc Cơ (Cấp 13)',   score: 4, baseHp: 2400, baseDmg: 55, mobHp: 3000, mobAtk: 45 },
  { name: 'Kim Đan (Cấp 29)',   score: 8, baseHp: 6000, baseDmg: 140, mobHp: 7500, mobAtk: 110 },
  { name: 'Nguyên Anh (Cấp 45)', score: 12, baseHp: 15000, baseDmg: 350, mobHp: 18500, mobAtk: 280 },
  { name: 'Hóa Thần (Cấp 61)',  score: 16, baseHp: 38000, baseDmg: 900, mobHp: 46000, mobAtk: 700 }
];

console.log('=== 1. CÙNG CẢNH GIỚI (DIFF = 0) ===');
for (const r of REALMS) {
  const supp = getSuppression(r.score, r.score);
  const dmgPerHit = Math.round(r.baseDmg * 1.35 * supp); // effective skill dmg
  const hits = Math.ceil(r.mobHp / dmgPerHit);
  console.log(`${r.name} vs Quái cùng cấp: ${dmgPerHit} dmg/hit -> ${hits} hits mới chết.`);
}

console.log('\n=== 2. HƠN 1 ĐẠI CẢNH GIỚI (CÁCH 1 CẢNH GIỚI, DIFF = 4) -> 2 ĐẾN 3 HIT ===');
for (let i = 1; i < REALMS.length; i++) {
  const higher = REALMS[i];
  const lower = REALMS[i - 1];
  const supp = getSuppression(higher.score, lower.score);
  const dmgPerHit = Math.round(higher.baseDmg * 1.35 * supp);
  const hits = Math.ceil(lower.mobHp / dmgPerHit);
  console.log(`${higher.name} ĐÁNH ${lower.name}: ${dmgPerHit} dmg/hit lên quái ${lower.mobHp} HP -> CẦN CHÍNH XÁC ${hits} HITS LÀ DIỆT!`);
}

console.log('\n=== 3. HƠN 2 ĐẠI CẢNH GIỚI (DIFF = 8) -> 1 HIT ===');
for (let i = 2; i < REALMS.length; i++) {
  const higher = REALMS[i];
  const lower = REALMS[i - 2];
  const supp = getSuppression(higher.score, lower.score);
  const dmgPerHit = Math.round(higher.baseDmg * 1.35 * supp);
  const hits = Math.ceil(lower.mobHp / dmgPerHit);
  console.log(`${higher.name} ĐÁNH ${lower.name}: ${dmgPerHit} dmg/hit lên quái ${lower.mobHp} HP -> ${hits} HIT.`);
}

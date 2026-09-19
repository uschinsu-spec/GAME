// Simulation Test: TTK & Stat Progression across all Realms (Luyện Khí to Hóa Thần)

const REALMS = [
  { name: 'Luyện Khí', grade: 'Nhất Phẩm', basePlayerHp: 950, basePlayerDmg: 38, baseEnemyHp: 1350, baseEnemyAtk: 22 },
  { name: 'Trúc Cơ',   grade: 'Nhị Phẩm',  basePlayerHp: 2400, basePlayerDmg: 95, baseEnemyHp: 3375, baseEnemyAtk: 55 },
  { name: 'Kim Đan',   grade: 'Tam Phẩm',  basePlayerHp: 6200, basePlayerDmg: 240, baseEnemyHp: 8370, baseEnemyAtk: 136 },
  { name: 'Nguyên Anh', grade: 'Tứ Phẩm',  basePlayerHp: 16000, basePlayerDmg: 620, baseEnemyHp: 21600, baseEnemyAtk: 350 },
  { name: 'Hóa Thần',  grade: 'Ngũ Phẩm',  basePlayerHp: 42000, basePlayerDmg: 1600, baseEnemyHp: 56700, baseEnemyAtk: 920 }
];

console.log('=== BẢNG KIỂM TRA ĐỘ CÂN BẰNG TTK (TIME-TO-KILL) TỪ LUYỆN KHÍ ĐẾN HÓA THẦN ===\n');

for (const r of REALMS) {
  // Player using a tier-appropriate skill (mult = ~1.35x, matching element mult = 1.35x => effective mult ~ 1.45x)
  const playerSkillDmg = Math.round(r.basePlayerDmg * 1.45 * 0.80); // 0.80 suppression factor at equal realm
  const hitsToKillEnemy = Math.ceil(r.baseEnemyHp / playerSkillDmg);

  // Enemy attacking player (enemy deals ~1.20x at equal realm, reduced by player defense ~25%)
  const enemyHitDmg = Math.round(r.baseEnemyAtk * 1.20 * 0.75);
  const hitsToKillPlayer = Math.ceil(r.basePlayerHp / enemyHitDmg);

  console.log(`[Cảnh Giới: ${r.name} vs ${r.grade}]`);
  console.log(`- Máu Quái vật: ${r.baseEnemyHp} HP | Sát thương Skill Player: ${playerSkillDmg} dmg/hit`);
  console.log(`  => Số chiêu Player cần để hạ Quái cùng cấp: ${hitsToKillEnemy} chiêu (Chuẩn vài chục chiêu)`);
  console.log(`- Máu Player: ${r.basePlayerHp} HP | Sát thương Quái đánh Player: ${enemyHitDmg} dmg/hit`);
  console.log(`  => Số đòn Quái cần để hạ Player: ${hitsToKillPlayer} đòn`);
  console.log('------------------------------------------------------------');
}

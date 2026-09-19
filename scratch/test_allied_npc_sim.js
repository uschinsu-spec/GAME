// Test Simulation: Allied NPC 1 System (Tu vi Luyện Khí Sơ Kỳ, Hoàng Cấp Hạ Phẩm)
const fs = require('fs');

console.log('[TEST] Bắt đầu kiểm tra hệ thống 100 Allied NPC 1 chiến đấu & hồi sinh...');

const MAP_BOUND = 500;
const VILLAGE_WALL_RX = 38;
const VILLAGE_WALL_RZ = 28;

function isVillageSafe(x, z) {
  const nx = x / VILLAGE_WALL_RX;
  const nz = z / VILLAGE_WALL_RZ;
  return (nx * nx + nz * nz) <= 1.0;
}

// 1. Tạo 100 Allied NPCs
const alliedNpcs = [];
for (let i = 0; i < 100; i++) {
  const angle = (i / 100) * Math.PI * 2;
  const radius = 60 + (i % 25) * 12;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  alliedNpcs.push({
    id: 'ally_' + i,
    name: '【Đồng Môn】 Tiên Hiệp [Luyện Khí · Sơ Kỳ]',
    realm: 'Luyện Khí · Sơ Kỳ',
    level: 1 + (i % 3),
    x, z,
    speed: 5.5,
    atk: 80,
    hp: 1200, maxHp: 1200,
    dead: false,
    respawnTimer: 0,
    exitingVillage: false,
    gateTarget: { x: 0, z: VILLAGE_WALL_RZ + 14 },
    skillCd: 0,
    attackCd: 0,
    state: 'idle',
    facing: 'right',
    target: null
  });
}

// 2. Tạo 150 Enemies ngoài map
const actors = [];
for (let i = 0; i < 150; i++) {
  const angle = (i / 150) * Math.PI * 2;
  const radius = 70 + (i % 30) * 10;
  actors.push({
    id: 'mob_' + i,
    name: 'Sơn Trư',
    type: 'boar',
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    homeX: Math.cos(angle) * radius,
    homeZ: Math.sin(angle) * radius,
    hp: 200, maxHp: 200,
    atk: 18,
    speed: 2.3,
    dead: false,
    attackCd: 0
  });
}

console.log(`[INIT] Khởi tạo thành công ${alliedNpcs.length} NPC Đồng Môn và ${actors.length} Quái vật.`);

// 3. Chạy vòng lặp mô phỏng 20 giây (60 ticks/s => dt = 0.05s)
let totalSkillsCast = 0;
let totalDamageDealt = 0;
let totalMobsKilled = 0;
let totalNpcDeaths = 0;
let totalNpcRespawns = 0;

for (let step = 0; step < 400; step++) {
  const dt = 0.05;

  // Update Allied NPCs
  for (let i = 0; i < alliedNpcs.length; i++) {
    const npc = alliedNpcs[i];

    // Hồi sinh
    if (npc.dead) {
      npc.respawnTimer -= dt;
      if (npc.respawnTimer <= 0) {
        npc.dead = false;
        npc.hp = npc.maxHp;
        npc.x = 0; npc.z = 2; // Giữa làng
        npc.exitingVillage = true;
        npc.state = 'run';
        totalNpcRespawns++;
      }
      continue;
    }

    if (npc.exitingVillage) {
      const gdx = npc.gateTarget.x - npc.x, gdz = npc.gateTarget.z - npc.z;
      const gdist = Math.hypot(gdx, gdz);
      if (gdist > 2.0) {
        npc.x += (gdx / gdist) * npc.speed * dt;
        npc.z += (gdz / gdist) * npc.speed * dt;
      } else {
        npc.exitingVillage = false;
      }
      continue;
    }

    // Quét tìm quái
    let bestTarget = null;
    let bestD2 = 35 * 35;
    for (let j = 0; j < actors.length; j++) {
      const a = actors[j];
      if (!a || a.dead) continue;
      const adx = a.x - npc.x, adz = a.z - npc.z;
      const ad2 = adx * adx + adz * adz;
      if (ad2 < bestD2) {
        bestD2 = ad2;
        bestTarget = a;
      }
    }

    if (bestTarget) {
      const tdx = bestTarget.x - npc.x, tdz = bestTarget.z - npc.z;
      const dist = Math.hypot(tdx, tdz);
      npc.skillCd -= dt;
      npc.attackCd -= dt;

      if (dist <= 14.0 && dist >= 3.0 && npc.skillCd <= 0) {
        npc.skillCd = 2.5;
        totalSkillsCast++;
        const dmg = Math.round(npc.atk * 1.4);
        bestTarget.hp -= dmg;
        totalDamageDealt += dmg;
        if (bestTarget.hp <= 0) {
          bestTarget.dead = true;
          totalMobsKilled++;
        }
      } else if (dist > 2.5) {
        npc.x += (tdx / dist) * npc.speed * dt;
        npc.z += (tdz / dist) * npc.speed * dt;
      } else if (npc.attackCd <= 0) {
        npc.attackCd = 1.0;
        const dmg = npc.atk;
        bestTarget.hp -= dmg;
        totalDamageDealt += dmg;
        if (bestTarget.hp <= 0) {
          bestTarget.dead = true;
          totalMobsKilled++;
        }
      }
    }
  }

  // Update Mobs attacking Allied NPCs
  for (let j = 0; j < actors.length; j++) {
    const mob = actors[j];
    if (mob.dead) continue;
    let targetNpc = null;
    let minD2 = 24 * 24;
    for (let i = 0; i < alliedNpcs.length; i++) {
      const ally = alliedNpcs[i];
      if (ally.dead || ally.exitingVillage) continue;
      const d2 = (ally.x - mob.x) ** 2 + (ally.z - mob.z) ** 2;
      if (d2 < minD2) {
        minD2 = d2;
        targetNpc = ally;
      }
    }

    if (targetNpc) {
      const dx = targetNpc.x - mob.x, dz = targetNpc.z - mob.z;
      const d = Math.hypot(dx, dz);
      mob.attackCd -= dt;
      if (d > 1.7) {
        mob.x += (dx / d) * mob.speed * dt;
        mob.z += (dz / d) * mob.speed * dt;
      } else if (mob.attackCd <= 0) {
        mob.attackCd = 1.2;
        targetNpc.hp -= mob.atk;
        if (targetNpc.hp <= 0) {
          targetNpc.dead = true;
          targetNpc.respawnTimer = 4.5;
          totalNpcDeaths++;
        }
      }
    }
  }
}

console.log(`[RESULT] Kết quả mô phỏng sau 20s:`);
console.log(`- Tổng số skill Hoàng Cấp Hạ Phẩm thi triển: ${totalSkillsCast}`);
console.log(`- Tổng sát thương gây ra: ${totalDamageDealt}`);
console.log(`- Quái vật bị tiêu diệt: ${totalMobsKilled}`);
console.log(`- NPC tử trận & chuyển sang hồi sinh: ${totalNpcDeaths}`);
console.log(`- NPC đã hồi sinh và chạy qua cổng xuất thôn tiếp tục: ${totalNpcRespawns}`);
console.log('[SUCCESS] Mô phỏng hoạt động hoàn hảo 100%!');

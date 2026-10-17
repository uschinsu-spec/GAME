// ============================================================================
// THANH VÂN KIẾM KHÁCH - HỆ THỐNG KỸ NĂNG & HIỆU ỨNG CHIẾN ĐẤU (SKILLS SYSTEM)
// ============================================================================

const ALL_SKILLS = {
  'normal_attack': {
    id: 'normal_attack',
    name: 'Đánh Thường',
    subName: 'Kiếm Pháp Cơ Bản',
    icon: 'assets/ui/skill_attack_icon.webp',
    cd: 0,
    curCd: 0,
    mp: 0,
    level: 1,
    desc: 'Kiếm pháp cơ bản liên hoàn kích, tung đòn chém dũng mãnh, không tiêu hao Chân khí.'
  },
  'phi_kiem': {
    id: 'phi_kiem',
    name: 'Phi Kiếm Thuật',
    subName: 'Ngự Kiếm Thuật',
    icon: 'assets/ui/skill_2_van_kiem_quy_tong_icon.webp',
    cd: 0.8,
    curCd: 0,
    mp: 2,
    level: 2,
    desc: 'Ngự kiếm chi thuật, phóng luồng phi kiếm thần tốc theo tốc độ đánh.'
  },
  'kiem_khi': {
    id: 'kiem_khi',
    name: 'Thanh Phong Kiếm Khí',
    subName: 'Kiếm Khí Trảm',
    icon: 'assets/ui/skill_1_icon.webp',
    cd: 3.0,
    curCd: 0,
    mp: 25,
    level: 3,
    desc: 'Phóng ra luồng kiếm khí hình bán nguyệt bay nhanh chém xuyên kẻ địch.'
  },
  'loi_dinh': {
    id: 'loi_dinh',
    name: 'Lôi Đình Kiếm Phách',
    subName: 'Cửu Thiên Lôi Vũ',
    icon: 'assets/ui/skill_3_icon.webp',
    cd: 5.0,
    curCd: 0,
    mp: 35,
    level: 3,
    desc: 'Triệu hồi Cửu Thiên Lôi Kiếm giáng thế, sấm sét oanh tạc gây sát thương diện rộng và làm choáng.'
  },
  'kiem_tran': {
    id: 'kiem_tran',
    name: 'Thanh Vân Kiếm Trận',
    subName: 'Tuyệt Kỹ Trấn Tông',
    icon: 'assets/ui/skill_4_icon.webp',
    cd: 12.0,
    curCd: 0,
    mp: 70,
    level: 1,
    desc: 'Thi triển đại trận hộ tông, vạn kiếm từ trời giáng xuống sấm sét oanh tạc uy lực vô song.'
  }
};

class SkillManager {
  constructor(game) {
    this.game = game;
    this.allSkills = ALL_SKILLS;
    this.slotAssignments = {
      1: 'normal_attack',
      2: 'kiem_khi',
      3: 'loi_dinh',
      4: 'kiem_tran'
    };
  }

  // Nâng cấp kỹ năng
  upgradeSkill(skillId) {
    const s = this.allSkills[skillId];
    if (!s) return;
    s.level = (s.level || 1) + 1;
    audioManager.playLevelUp();
    this.game.showBanner(`KỸ NĂNG [${s.name.toUpperCase()}] ĐÃ ĐẠT CẤP ${s.level}!`);
    if (window.ui) {
      window.ui.renderSkillsList();
      window.ui.updateSkillSlotsDisplay();
    }
  }

  assignSkillToSlot(slot, skillId) {
    if (!this.allSkills[skillId]) return;
    for (let s = 1; s <= 4; s++) {
      if (s !== slot && this.slotAssignments[s] === skillId) {
        this.slotAssignments[s] = this.slotAssignments[slot];
        break;
      }
    }
    this.slotAssignments[slot] = skillId;
    if (window.ui) {
      window.ui.updateSkillSlotsDisplay();
      window.ui.closeModals();
    }
    this.game.updateHUD(true);
    const assignedSkill = this.allSkills[skillId];
    this.game.showBanner(`ĐÃ GÁN [${assignedSkill.name.toUpperCase()}] VÀO Ô ${slot}!`);
    this.game.saveSettings();
  }

  castSkill(slot) {
    const skillId = this.slotAssignments ? this.slotAssignments[slot] : null;
    if (!skillId) return;
    const s = this.allSkills[skillId];
    if (!s) return;

    // Đánh Thường: thi triển kiếm pháp cơ bản
    if (skillId === 'normal_attack') {
      this.doAttack();
      return;
    }

    if (skillId === 'phi_kiem') {
      s.cd = Math.round((1.0 / (this.game.player.attackSpeed || 1.25)) * 100) / 100;
    }

    if (s.curCd > 0) return;
    if (this.game.player.mp < s.mp) {
      return;
    }

    this.game.player.mp -= s.mp;
    s.curCd = s.cd;

    this.game.player.isAttacking = true;
    this.game.player.vx = 0;
    this.game.player.vy = 0;
    const animDur = skillId === 'phi_kiem' ? Math.min(0.70, s.cd * 0.9) : 0.70;
    this.game.player.attackAnimDuration = animDur;
    this.game.player.attackAnimTimer = animDur;
    this.game.player.attackCooldown = Math.max(this.game.player.attackCooldown, skillId === 'phi_kiem' ? s.cd * 0.75 : 0.35);

    let nearestEnemy = null;
    let minDistToEnemy = Infinity;
    this.game.enemies.forEach(e => {
      if (e.hp <= 0) return;
      const d = Math.hypot(e.x - this.game.player.x, e.y - this.game.player.y);
      if (d < minDistToEnemy) {
        minDistToEnemy = d;
        nearestEnemy = e;
      }
    });
    if (nearestEnemy) {
      this.game.player.facing = nearestEnemy.x >= this.game.player.x ? 1 : -1;
    }

    let targetX = this.game.player.x + this.game.player.facing * 200;
    let targetY = this.game.player.y;
    if (nearestEnemy) {
      targetX = nearestEnemy.x;
      targetY = nearestEnemy.y - (nearestEnemy.height ? nearestEnemy.height * 0.38 : 20);
    }

    const aspdMult = Math.max(0.5, (this.game.player.attackSpeed || 1.25) / 1.25);

    if (skillId === 'phi_kiem') {
      this.castPhiKiem(aspdMult, nearestEnemy, targetX, targetY);
    } else if (skillId === 'kiem_khi') {
      this.castKiemKhi(aspdMult, nearestEnemy, targetX, targetY);
    } else if (skillId === 'loi_dinh') {
      this.castLoiDinh(aspdMult, nearestEnemy);
    } else if (skillId === 'kiem_tran') {
      this.castKiemTran(aspdMult, nearestEnemy);
    }

    this.game.updateHUD();
  }

  doAttack() {
    if (this.game.player.attackCooldown > 0) return;

    audioManager.playSlash();
    this.game.player.isAttacking = true;
    this.game.player.vx = 0;
    this.game.player.vy = 0;
    const interval = Math.round((1.0 / (this.game.player.attackSpeed || 1.25)) * 100) / 100;
    this.game.player.attackCooldown = interval;
    this.game.player.attackAnimDuration = Math.min(0.70, interval * 0.9);
    this.game.player.attackAnimTimer = this.game.player.attackAnimDuration;
    this.game.player.comboStep = 0;

    let nearestEnemy = null;
    let minDistToEnemy = Infinity;
    this.game.enemies.forEach(e => {
      if (e.hp <= 0) return;
      const d = Math.hypot(e.x - this.game.player.x, e.y - this.game.player.y);
      if (d < minDistToEnemy) {
        minDistToEnemy = d;
        nearestEnemy = e;
      }
    });
    if (nearestEnemy && minDistToEnemy < 280) {
      this.game.player.facing = nearestEnemy.x >= this.game.player.x ? 1 : -1;
    }

    const hand = this.game.playerManager ? this.game.playerManager.getPlayerHandPos() : { x: this.game.player.x, y: this.game.player.y - 40 };
    let angle = this.game.player.facing === 1 ? 0 : Math.PI;
    if (nearestEnemy && minDistToEnemy < 280) {
      const eTargetY = nearestEnemy.y - (nearestEnemy.height ? nearestEnemy.height * 0.38 : 20);
      angle = Math.atan2(eTargetY - hand.y, nearestEnemy.x - hand.x);
    }
    const hitRange = 135; // 105 * 1.3

    // VFX kiếm pháp cơ bản theo tỷ lệ 1.3x
    this.game.slashEffects.push({
      x: hand.x + this.game.player.facing * 8,
      y: hand.y,
      facing: this.game.player.facing,
      step: 0,
      time: 0,
      duration: 0.26,
      range: 88, // 68 * 1.3
      angle: angle,
      color: '#38bdf8'
    });

    for (let i = 0; i < 4; i++) {
      const spd = 40 + Math.random() * 50;
      const spAng = angle + (Math.random() - 0.5) * 0.9;
      this.game.particles.push({
        x: hand.x + (Math.random() * 4 - 2),
        y: hand.y + (Math.random() * 4 - 2),
        vx: Math.cos(spAng) * spd,
        vy: Math.sin(spAng) * spd,
        radius: 1.1 + Math.random() * 1.2,
        color: Math.random() < 0.6 ? '#38bdf8' : '#ffffff',
        alpha: 0.95,
        life: 0.18
      });
    }

    let hitCount = 0;
    this.game.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      const dx = enemy.x - this.game.player.x;
      const dy = enemy.y - this.game.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const facingCheck = this.game.player.facing === 1 ? dx > -20 : dx < 20;

      if (dist <= hitRange + enemy.radius && facingCheck) {
        hitCount++;
        const isCrit = Math.random() < this.game.player.critChance;
        const baseDmg = this.game.player.atk;
        const dmg = Math.floor((baseDmg * (0.9 + Math.random() * 0.2)) * (isCrit ? this.game.player.critMulti : 1.0));

        if (this.game.enemyManager) {
          this.game.enemyManager.damageEnemy(enemy, dmg, isCrit, 0, 0);
        }
      }
    });
  }

  castPhiKiem(aspdMult, nearestEnemy, targetX, targetY) {
    audioManager.playFlyingSwords();
    const hand = this.game.playerManager ? this.game.playerManager.getPlayerHandPos() : { x: this.game.player.x, y: this.game.player.y - 40 };
    const spawnX = hand.x;
    const spawnY = hand.y;

    let angle = this.game.player.facing === 1 ? 0 : Math.PI;
    if (nearestEnemy) {
      angle = Math.atan2(targetY - spawnY, targetX - spawnX);
      this.game.player.facing = Math.cos(angle) >= 0 ? 1 : -1;
    }

    for (let i = 0; i < 7; i++) {
      const pSpd = 50 + Math.random() * 90;
      const pAng = angle + (Math.random() - 0.5) * 1.2;
      this.game.particles.push({
        x: spawnX,
        y: spawnY,
        vx: Math.cos(pAng) * pSpd,
        vy: Math.sin(pAng) * pSpd,
        radius: 2 + Math.random() * 2.5,
        color: Math.random() < 0.7 ? '#38bdf8' : '#ffffff',
        alpha: 1.0,
        life: 0.22
      });
    }

    const speed = 375 * aspdMult;
    const life = 2.2 / aspdMult;
    this.game.projectiles.push({
      type: 'flying_sword',
      x: spawnX,
      y: spawnY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 24,
      facing: Math.cos(angle) >= 0 ? 1 : -1,
      angle: angle,
      damage: Math.floor(this.game.player.atk * 1.35),
      life: life,
      hitList: new Set()
    });

    if (this.game.screenShakeEnabled) this.game.triggerShake(1.5);
  }

  castKiemKhi(aspdMult, nearestEnemy, targetX, targetY) {
    audioManager.playSwordQi();
    const hand = this.game.playerManager ? this.game.playerManager.getPlayerHandPos() : { x: this.game.player.x, y: this.game.player.y - 40 };
    const speed = 300 * aspdMult;
    const life = 1.6 / aspdMult;

    let angle = this.game.player.facing === 1 ? 0 : Math.PI;
    if (nearestEnemy) {
      angle = Math.atan2(targetY - hand.y, targetX - hand.x);
      this.game.player.facing = Math.cos(angle) >= 0 ? 1 : -1;
    }

    for (let i = 0; i < 8; i++) {
      const pSpd = 70 + Math.random() * 110;
      const pAng = angle + (Math.random() - 0.5) * 1.0;
      this.game.particles.push({
        x: hand.x,
        y: hand.y,
        vx: Math.cos(pAng) * pSpd,
        vy: Math.sin(pAng) * pSpd,
        radius: 2.5 + Math.random() * 2.5,
        color: Math.random() < 0.6 ? '#67e8f9' : '#ffffff',
        alpha: 1.0,
        life: 0.25
      });
    }

    this.game.projectiles.push({
      type: 'sword_qi',
      x: hand.x,
      y: hand.y,
      prevX: hand.x,
      prevY: hand.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle: angle,
      radius: 90, // Tầm quét phủ trọn hình bán nguyệt VFX 195px
      facing: Math.cos(angle) >= 0 ? 1 : -1,
      damage: Math.floor(this.game.player.atk * 1.5),
      life: life,
      maxLife: life,
      hitList: new Set()
    });
    if (this.game.screenShakeEnabled) this.game.triggerShake(3);
  }

  castLoiDinh(aspdMult, nearestEnemy) {
    audioManager.playUltimate();
    let strikeX = this.game.player.x + this.game.player.facing * 120;
    let strikeY = this.game.player.y;
    if (nearestEnemy) {
      strikeX = nearestEnemy.x;
      strikeY = nearestEnemy.y;
      this.game.player.facing = nearestEnemy.x >= this.game.player.x ? 1 : -1;
    }
    const life = 1.6 / aspdMult;

    this.game.lightningStrikes.push({
      x: strikeX,
      y: strikeY,
      facing: this.game.player.facing,
      life: life,
      maxLife: life,
      radius: 145,
      damage: Math.floor(this.game.player.atk * 2.5),
      hasHit: false
    });

    if (this.game.screenShakeEnabled) this.game.triggerShake(7);
  }

  castKiemTran(aspdMult, nearestEnemy) {
    audioManager.playUltimate();
    let arrayX = this.game.player.x + this.game.player.facing * 140;
    let arrayY = this.game.player.y;
    if (nearestEnemy) {
      arrayX = nearestEnemy.x;
      arrayY = nearestEnemy.y;
      this.game.player.facing = nearestEnemy.x >= this.game.player.x ? 1 : -1;
    }

    this.game.swordArrays.push({
      x: arrayX,
      y: arrayY,
      radius: 180,
      duration: 7.0,
      elapsed: 0,
      rotation: 0,
      hitTick: 0,
      dpsInterval: 0.6 / aspdMult,
      swords: [],
      fallingSwords: [],
      swordSpawnTimer: 0,
      aspdMult: aspdMult
    });

    if (this.game.screenShakeEnabled) this.game.triggerShake(8);
  }

  update(dt) {
    // Update cooldowns
    for (let id in this.allSkills) {
      const s = this.allSkills[id];
      if (s.curCd > 0) {
        s.curCd = Math.max(0, s.curCd - dt);
      }
    }

    // Update projectiles
    for (let i = this.game.projectiles.length - 1; i >= 0; i--) {
      const p = this.game.projectiles[i];
      const prevX = p.x;
      const prevY = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.type === 'sword_qi') {
        const segX = p.x - prevX;
        const segY = p.y - prevY;
        const segLenSq = segX * segX + segY * segY;
        const hitRadius = p.radius || 90;

        this.game.enemies.forEach((enemy) => {
          if (enemy.hp <= 0 || p.hitList.has(enemy)) return;

          // Tính vị trí gần nhất từ kẻ địch tới đoạn đường bay của luồng kiếm khí trong frame này
          let closeX = p.x;
          let closeY = p.y;
          if (segLenSq > 0.001) {
            const t = Math.max(0, Math.min(1, ((enemy.x - prevX) * segX + (enemy.y - prevY) * segY) / segLenSq));
            closeX = prevX + t * segX;
            closeY = prevY + t * segY;
          }

          const dist = Math.hypot(enemy.x - closeX, enemy.y - closeY);
          const enemyRad = enemy.radius || 32;

          // Luồng kiếm khí bay xuyên qua và gây sát thương cho MỌI kẻ địch khi VFX bay ngang qua
          if (dist <= hitRadius + enemyRad) {
            p.hitList.add(enemy);
            const isCrit = Math.random() < this.game.player.critChance;
            const dmg = Math.floor(p.damage * (isCrit ? this.game.player.critMulti : 1.0));
            if (this.game.enemyManager) {
              this.game.enemyManager.damageEnemy(enemy, dmg, isCrit, p.vx * 0.08, p.vy * 0.08);
            }

            // Hiệu ứng tia kiếm khí tóe sáng khi chém trúng quái
            for (let k = 0; k < 5; k++) {
              const spd = 60 + Math.random() * 80;
              const spAng = p.angle + (Math.random() - 0.5) * 1.5;
              this.game.particles.push({
                x: enemy.x + (Math.random() - 0.5) * 16,
                y: enemy.y - 12 + (Math.random() - 0.5) * 16,
                vx: Math.cos(spAng) * spd,
                vy: Math.sin(spAng) * spd,
                radius: 1.5 + Math.random() * 2,
                color: Math.random() < 0.6 ? '#67e8f9' : '#ffffff',
                alpha: 1,
                life: 0.22
              });
            }
          }
        });

        // Hạt bụi kiếm khí bay theo luồng chém
        if (Math.random() < 0.6) {
          const trailOffset = (Math.random() - 0.5) * 80;
          const perpAngle = p.angle + Math.PI / 2;
          this.game.particles.push({
            x: p.x + Math.cos(perpAngle) * trailOffset,
            y: p.y + Math.sin(perpAngle) * trailOffset,
            vx: -p.vx * 0.12 + (Math.random() - 0.5) * 30,
            vy: -p.vy * 0.12 + (Math.random() - 0.5) * 30,
            radius: 1.8 + Math.random() * 2,
            color: Math.random() < 0.7 ? '#67e8f9' : '#ffffff',
            alpha: 0.85,
            life: 0.22
          });
        }
      } else if (p.type === 'flying_sword') {
        for (let enemy of this.game.enemies) {
          if (enemy.hp <= 0 || p.hitList.has(enemy)) continue;
          const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
          if (dist <= p.radius + enemy.radius) {
            p.hitList.add(enemy);
            const isCrit = Math.random() < this.game.player.critChance;
            const dmg = Math.floor(p.damage * (isCrit ? this.game.player.critMulti : 1.0));
            if (this.game.enemyManager) {
              this.game.enemyManager.damageEnemy(enemy, dmg, isCrit, 0, 0);
            }
            p.life = 0;
            break;
          }
        }
      }

      if (p.life <= 0) {
        this.game.projectiles.splice(i, 1);
      }
    }

    // Update Sword Arrays
    for (let i = this.game.swordArrays.length - 1; i >= 0; i--) {
      const arr = this.game.swordArrays[i];
      arr.elapsed += dt;
      arr.rotation += dt * 0.9;
      arr.hitTick += dt;
      arr.swordSpawnTimer = (arr.swordSpawnTimer || 0) + dt;

      const mult = arr.aspdMult || 1.0;
      const spawnInterval = 0.28 / mult;

      if (arr.swordSpawnTimer >= spawnInterval) {
        arr.swordSpawnTimer = 0;
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.pow(Math.random(), 0.6) * (arr.radius * 0.85);
        const groundX = arr.x + Math.cos(ang) * rad;
        const groundY = arr.y + Math.sin(ang) * (rad * 0.7);

        const fallDist = 340 + Math.random() * 80;
        const startX = groundX + (Math.random() - 0.5) * 20;
        const startY = groundY - fallDist;
        const fallSpeed = (680 + Math.random() * 100) * mult;
        const flightTime = fallDist / fallSpeed;

        arr.fallingSwords.push({
          startX: startX,
          startY: startY,
          targetX: groundX,
          targetY: groundY,
          x: startX,
          y: startY,
          angle: Math.atan2(groundY - startY, groundX - startX),
          flightTime: flightTime,
          elapsed: 0,
          landed: false,
          landTime: 0,
          scale: 0.75 + Math.random() * 0.25,
          alpha: 1.0
        });
      }

      for (let sIdx = arr.fallingSwords.length - 1; sIdx >= 0; sIdx--) {
        const sw = arr.fallingSwords[sIdx];
        if (!sw.landed) {
          sw.elapsed += dt;
          const prog = Math.min(1.0, sw.elapsed / sw.flightTime);
          sw.x = sw.startX + (sw.targetX - sw.startX) * prog;
          sw.y = sw.startY + (sw.targetY - sw.startY) * prog;

          if (prog >= 1.0) {
            sw.landed = true;
            sw.x = sw.targetX;
            sw.y = sw.targetY;
            for (let p = 0; p < 4; p++) {
              const spd = 60 + Math.random() * 70;
              const spAng = Math.random() * Math.PI * 2;
              this.game.particles.push({
                x: sw.x,
                y: sw.y,
                vx: Math.cos(spAng) * spd,
                vy: Math.sin(spAng) * spd * 0.5 - 20,
                radius: 2 + Math.random() * 2,
                color: Math.random() < 0.7 ? '#38bdf8' : '#fef08a',
                alpha: 0.9,
                life: 0.2
              });
            }
          }
        } else {
          sw.landTime += dt;
          sw.alpha = Math.max(0, 1.0 - (sw.landTime / 0.44));
          if (sw.landTime >= 0.44) {
            arr.fallingSwords.splice(sIdx, 1);
          }
        }
      }

      if (arr.hitTick >= arr.dpsInterval) {
        arr.hitTick = 0;
        this.game.enemies.forEach((enemy) => {
          if (enemy.hp <= 0) return;
          const dist = Math.hypot(enemy.x - arr.x, enemy.y - arr.y);
          if (dist <= arr.radius + enemy.radius) {
            const isCrit = Math.random() < 0.3;
            const dmg = Math.floor((this.game.player.atk * 0.6) * (isCrit ? 1.5 : 1.0));
            if (this.game.enemyManager) {
              this.game.enemyManager.damageEnemy(enemy, dmg, isCrit, 0, 0);
            }
          }
        });
      }

      if (arr.elapsed >= arr.duration) {
        this.game.swordArrays.splice(i, 1);
      }
    }

    // Update Lightning Strikes
    for (let i = this.game.lightningStrikes.length - 1; i >= 0; i--) {
      const s = this.game.lightningStrikes[i];
      s.life -= dt;

      if (!s.hasHit) {
        s.hasHit = true;
        this.game.enemies.forEach(enemy => {
          if (enemy.hp <= 0) return;
          const dist = Math.hypot(enemy.x - s.x, enemy.y - s.y);
          if (dist <= s.radius + enemy.radius) {
            const isCrit = Math.random() < this.game.player.critChance;
            const dmg = Math.floor(s.damage * (isCrit ? this.game.player.critMulti : 1.0));
            if (this.game.enemyManager) {
              this.game.enemyManager.damageEnemy(enemy, dmg, isCrit, 0, 0);
            }
          }
        });
      }

      if (s.life <= 0) {
        this.game.lightningStrikes.splice(i, 1);
      }
    }

    // Update Slash Effects
    for (let i = this.game.slashEffects.length - 1; i >= 0; i--) {
      const s = this.game.slashEffects[i];
      s.time += dt;
      if (s.time >= s.duration) {
        this.game.slashEffects.splice(i, 1);
      }
    }
  }

  renderSlashEffects(ctx) {
    const sprite = spriteManager.get('skill_1_sprite');

    this.game.slashEffects.forEach(s => {
      const progress = Math.max(0, Math.min(0.999, s.time / s.duration));
      const alpha = Math.max(0, Math.min(1, 1 - progress));

      ctx.save();
      ctx.translate(s.x, s.y);
      if (s.angle !== undefined) {
        ctx.rotate(s.angle);
      } else if (s.facing === -1) {
        ctx.scale(-1, 1);
      }

      if (sprite) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 1.3));
        ctx.rotate(0.24);
        const dw = s.range * 1.95;
        const dh = s.range * 1.95;
        ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height, -dw * 0.35, -dh * 0.5, dw, dh);
        ctx.restore();
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.rotate(0.24);

      const arcRadius = s.range * 0.88;
      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, -Math.PI * 0.42, Math.PI * 0.42, false);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.75})`;
      ctx.lineWidth = 7 * (1 - progress * 0.4);
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, -Math.PI * 0.38, Math.PI * 0.38, false);
      ctx.strokeStyle = `rgba(125, 211, 252, ${alpha * 0.9})`;
      ctx.lineWidth = 3.2 * (1 - progress * 0.3);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, -Math.PI * 0.35, Math.PI * 0.35, false);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      const tipAngle = Math.PI * 0.35;
      const tipX = Math.cos(tipAngle) * arcRadius;
      const tipY = Math.sin(tipAngle) * arcRadius;
      const flashGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 10);
      flashGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
      flashGrad.addColorStop(0.5, `rgba(56, 189, 248, ${alpha * 0.5})`);
      flashGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const groundY = 24;
      const beamStart = 5;
      const beamLen = s.range * (0.85 + progress * 0.55);

      const groundGrad = ctx.createLinearGradient(beamStart, groundY, beamStart + beamLen, groundY);
      groundGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
      groundGrad.addColorStop(0.25, `rgba(56, 189, 248, ${alpha * 0.85})`);
      groundGrad.addColorStop(0.7, `rgba(14, 165, 233, ${alpha * 0.4})`);
      groundGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.beginPath();
      ctx.moveTo(beamStart, groundY - 2.5);
      ctx.lineTo(beamStart + beamLen, groundY);
      ctx.lineTo(beamStart, groundY + 2.5);
      ctx.closePath();
      ctx.fillStyle = groundGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(beamStart, groundY);
      ctx.lineTo(beamStart + beamLen * 0.9, groundY);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.lineWidth = 1.5 * (1 - progress * 0.5);
      ctx.stroke();

      ctx.restore();
      ctx.restore();
    });
  }

  renderProjectiles(ctx) {
    this.game.projectiles.forEach(p => {
      if (p.type === 'sword_qi') {
        const sprite = spriteManager.get('skill_1_sprite');
        if (sprite) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          const dw = 195;
          const dh = 195;
          ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height, -dw * 0.45, -dh / 2, dw, dh);
          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          ctx.arc(0, 0, 50, -Math.PI * 0.5, Math.PI * 0.5);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 8;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, 50, -Math.PI * 0.4, Math.PI * 0.4);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.restore();
        }
      } else if (p.type === 'flying_sword') {
        const swordImg = spriteManager.get('skill_2_sword');
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (swordImg) {
          const sw = 94;
          const sh = 94;
          ctx.drawImage(swordImg, -sw * 0.5, -sh / 2, sw, sh);
        } else {
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(-18, -2, 36, 4);
          ctx.beginPath();
          ctx.moveTo(18, -4);
          ctx.lineTo(26, 0);
          ctx.lineTo(18, 4);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        }
        ctx.restore();
      }
    });
  }

  renderSwordArrays(ctx) {
    const vfx = spriteManager.get('skill_4_vfx');
    const swordImg = spriteManager.get('skill_2_sword');

    this.game.swordArrays.forEach(arr => {
      ctx.save();
      ctx.translate(arr.x, arr.y);

      if (vfx) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const fade = Math.min(1, (arr.duration - arr.elapsed) / 1.0);
        const pulse = 1.0 + Math.sin(arr.elapsed * 2.25) * 0.035;
        ctx.globalAlpha = Math.max(0, Math.min(1, fade));
        const dw = arr.radius * 2.8 * pulse;
        const dh = arr.radius * 2.8 * pulse;
        ctx.drawImage(vfx, -dw / 2, -dh * 0.62, dw, dh);
        ctx.restore();
      }

      ctx.save();
      ctx.scale(1.0, 0.58);
      ctx.rotate(arr.rotation * 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, arr.radius * 1.05, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 10]);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, arr.radius * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const beamAlpha = (Math.sin(arr.elapsed * 2) * 0.08 + 0.18) * Math.min(1, (arr.duration - arr.elapsed) / 1.0);
      const beamGrad = ctx.createLinearGradient(0, 0, 0, -180);
      beamGrad.addColorStop(0, `rgba(56, 189, 248, ${beamAlpha * 1.5})`);
      beamGrad.addColorStop(0.5, `rgba(14, 165, 233, ${beamAlpha * 0.6})`);
      beamGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, arr.radius * 0.75, arr.radius * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();

      if (swordImg && arr.fallingSwords && arr.fallingSwords.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        arr.fallingSwords.forEach(sw => {
          ctx.save();
          ctx.translate(sw.x, sw.y);
          ctx.globalAlpha = sw.alpha;

          const baseW = 86 * sw.scale;
          const baseH = 86 * sw.scale;

          if (!sw.landed) {
            ctx.rotate(sw.angle + Math.PI);
            ctx.save();
            const tailGrad = ctx.createLinearGradient(0, 0, -baseW * 1.4, 0);
            tailGrad.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
            tailGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            ctx.fillStyle = tailGrad;
            ctx.fillRect(-baseW * 1.4, -3.5, baseW * 1.4, 7);
            ctx.restore();

            ctx.drawImage(swordImg, -baseW * 0.25, -baseH / 2, baseW, baseH);
          } else {
            const plungeAngle = -Math.PI / 2 + (sw.startX > sw.targetX ? -0.08 : 0.08);
            ctx.rotate(plungeAngle);
            ctx.drawImage(swordImg, -baseW * 0.25, -baseH / 2, baseW, baseH);

            if (sw.landTime < 0.14) {
              const glowR = 20 * (1 - sw.landTime / 0.14);
              ctx.beginPath();
              ctx.arc(0, 0, glowR, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
              ctx.fill();
            }
          }
          ctx.restore();
        });
        ctx.restore();
      }
    });
  }

  renderLightningStrikes(ctx) {
    const vfx = spriteManager.get('skill_3_vfx');
    this.game.lightningStrikes.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      if (s.facing === -1) {
        ctx.scale(-1, 1);
      }

      if (vfx) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const progress = 1 - (s.life / s.maxLife);
        const scale = progress < 0.15 ? (0.6 + progress * 2.6) : 1;
        const alpha = s.life > 0.5 ? 1 : (s.life / 0.5);
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        const dw = 260 * scale;
        const dh = 260 * scale;
        ctx.drawImage(vfx, -dw / 2, -dh * 0.85, dw, dh);
        ctx.restore();
      }
      ctx.restore();
    });
  }
}

window.ALL_SKILLS = ALL_SKILLS;
window.SkillManager = SkillManager;

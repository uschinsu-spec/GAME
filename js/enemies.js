// ============================================================================
// THANH VÂN KIẾM KHÁCH - HỆ THỐNG YÊU THÚ & TRẬN ĐẤU (ENEMY SYSTEM & AI)
// ============================================================================

class EnemyManager {
  constructor(game) {
    this.game = game;
    this.pendingRespawns = [];
  }

  spawnInitialWolves() {
    this.game.enemies = [];
    this.pendingRespawns = [];
    const curMap = this.game.mapManager ? this.game.mapManager.getCurrentMap() : (WORLD_MAPS[this.game.currentMapId] || WORLD_MAPS['thanh_van_thon']);
    const pool = curMap.enemyPool || [
      { type: 'enemy1', name: 'Xích Dã Lang' },
      { type: 'enemy2', name: 'Băng Giác Hổ' },
      { type: 'enemy3', name: 'U Minh Bọ Cạp' }
    ];

    const bounds = curMap.bounds || { minX: 140, maxX: 940, minY: 720, maxY: 1650 };
    const enemyCount = 8;
    for (let i = 0; i < enemyCount; i++) {
      const eInfo = pool[i % pool.length];
      let spawnX, spawnY, d;
      let attempts = 0;
      do {
        spawnX = bounds.minX + 60 + Math.random() * (bounds.maxX - bounds.minX - 120);
        spawnY = bounds.minY + 60 + Math.random() * (bounds.maxY - bounds.minY - 120);
        d = Math.hypot(spawnX - this.game.player.x, spawnY - this.game.player.y);
        attempts++;
      } while (d < 220 && attempts < 10);

      this.spawnEnemy(spawnX, spawnY, false, eInfo.type, eInfo.name);
    }
  }

  spawnEnemy(x, y, isBoss = false, type = null, customName = null) {
    const curMap = this.game.mapManager ? this.game.mapManager.getCurrentMap() : (WORLD_MAPS[this.game.currentMapId] || WORLD_MAPS['thanh_van_thon']);
    const mapLv = curMap.reqLv || 1;
    const lvScale = Math.max(1, mapLv / 10);

    let enemyType = type;
    let enemyName = customName;

    if (isBoss) {
      if (curMap.boss) {
        enemyType = curMap.boss.type;
        enemyName = curMap.boss.name;
      } else {
        enemyType = 'enemy20';
        enemyName = 'Thượng Cổ Ma Vương';
      }
    } else if (!enemyType || !enemyName) {
      const pool = curMap.enemyPool || [
        { type: 'enemy1', name: 'Xích Dã Lang' },
        { type: 'enemy2', name: 'Băng Giác Hổ' },
        { type: 'enemy3', name: 'U Minh Bọ Cạp' }
      ];
      const picked = pool[Math.floor(Math.random() * pool.length)];
      enemyType = picked.type;
      enemyName = picked.name;
    }

    const enemy = {
      type: enemyType,
      rawName: enemyName,
      x: Math.max(this.game.bounds.minX + 50, Math.min(this.game.bounds.maxX - 50, x)),
      y: Math.max(this.game.bounds.minY + 50, Math.min(this.game.bounds.maxY - 50, y)),
      vx: 0,
      vy: 0,
      speed: isBoss ? 100 : (65 + Math.random() * 20),
      radius: isBoss ? 85 : 42,
      width: isBoss ? 228 : 143,
      height: isBoss ? 228 : 143,
      facing: x > this.game.player.x ? -1 : 1,

      isBoss: isBoss,
      name: `${enemyName} [Lv.${mapLv + (isBoss ? 5 : Math.floor(Math.random() * 3))}]`,
      hp: Math.floor((isBoss ? 3500 : (480 + Math.floor(Math.random() * 80))) * lvScale),
      maxHp: Math.floor((isBoss ? 3500 : 520) * lvScale),
      atk: Math.floor((isBoss ? 55 : (20 + Math.floor(Math.random() * 8))) * lvScale),
      exp: Math.floor((isBoss ? 500 : 50) * lvScale),
      coins: Math.floor((isBoss ? 350 : 30) * lvScale),

      state: 'ROAM',
      isAttacking: false,
      attackAnimTimer: 0,
      attackAnimDuration: 0.55,
      attackCooldown: 1.0 + Math.random() * 1.5,
      hasDealtDamage: false,
      hitFlashTimer: 0,
      staggerTimer: 0,
      animationTime: Math.random() * 5,
      roamAngle: Math.random() * Math.PI * 2,
      roamTimer: 1 + Math.random() * 2
    };

    this.game.enemies.push(enemy);
    return enemy;
  }

  spawnRespawnedEnemy(type = null, name = null) {
    const curMap = this.game.mapManager ? this.game.mapManager.getCurrentMap() : (WORLD_MAPS[this.game.currentMapId] || WORLD_MAPS['thanh_van_thon']);
    const bounds = curMap.bounds || { minX: 140, maxX: 940, minY: 720, maxY: 1650 };
    let spawnX, spawnY, d;
    let attempts = 0;
    do {
      spawnX = bounds.minX + 60 + Math.random() * (bounds.maxX - bounds.minX - 120);
      spawnY = bounds.minY + 60 + Math.random() * (bounds.maxY - bounds.minY - 120);
      d = Math.hypot(spawnX - this.game.player.x, spawnY - this.game.player.y);
      attempts++;
    } while (d < 180 && attempts < 10);

    const enemy = this.spawnEnemy(spawnX, spawnY, false, type, name);

    // Hiệu ứng hồi sinh
    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 50;
      this.game.particles.push({
        x: spawnX,
        y: spawnY,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: 3 + Math.random() * 3,
        color: '#c084fc',
        alpha: 1,
        life: 0.5
      });
    }
    return enemy;
  }

  updateEnemies(dt) {
    // 1. Cập nhật đếm ngược hồi sinh (Enemies chết rồi respawn lại sau 5s)
    if (!this.pendingRespawns) this.pendingRespawns = [];
    for (let i = this.pendingRespawns.length - 1; i >= 0; i--) {
      this.pendingRespawns[i].timer -= dt;
      if (this.pendingRespawns[i].timer <= 0) {
        const item = this.pendingRespawns[i];
        this.pendingRespawns.splice(i, 1);
        this.spawnRespawnedEnemy(item.type, item.name);
      }
    }

    // 2. Boss spawn timer nếu có
    if (this.game.bossSpawnTimer > 0) {
      this.game.bossSpawnTimer -= dt;
      if (this.game.bossSpawnTimer <= 0) {
        this.spawnEnemy(this.game.player.x + (Math.random() < 0.5 ? 200 : -200), this.game.player.y + (Math.random() < 0.5 ? 200 : -200), true);
      }
    }

    this.game.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;

      enemy.animationTime += dt;
      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
      if (enemy.staggerTimer > 0) enemy.staggerTimer -= dt;
      if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;

      if (enemy.isAttacking) {
        enemy.attackAnimTimer -= dt;
        if (enemy.attackAnimTimer <= 0) {
          enemy.isAttacking = false;
          enemy.hasDealtDamage = false;
        }
      }

      const dx = this.game.player.x - enemy.x;
      const dy = this.game.player.y - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (Math.abs(dx) > 12) {
        enemy.facing = dx > 0 ? 1 : -1;
      }

      const sepRange = 88;
      let sepX = 0;
      let sepY = 0;
      for (let other of this.game.enemies) {
        if (other === enemy || other.hp <= 0) continue;
        const ox = enemy.x - other.x;
        const oy = enemy.y - other.y;
        const od = Math.hypot(ox, oy);
        if (od < sepRange && od > 0.001) {
          const strength = (sepRange - od) / sepRange;
          sepX += (ox / od) * strength * 45;
          sepY += (oy / od) * strength * 45;
        }
      }

      const meleeRange = 98;

      if (dist > meleeRange) {
        const nx = dx / dist;
        const ny = dy / dist;
        enemy.vx = nx * enemy.speed + sepX;
        enemy.vy = ny * enemy.speed + sepY;
      } else {
        enemy.vx = sepX;
        enemy.vy = sepY;

        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 2.2 + Math.random() * 0.5;
          enemy.isAttacking = true;
          enemy.attackAnimDuration = 0.55;
          enemy.attackAnimTimer = 0.55;
          enemy.hasDealtDamage = false;
        }
      }

      if (enemy.isAttacking && !enemy.hasDealtDamage) {
        const animProgress = 1 - (enemy.attackAnimTimer / enemy.attackAnimDuration);
        if (animProgress >= 0.5) {
          enemy.hasDealtDamage = true;
          const currentDist = Math.hypot(this.game.player.x - enemy.x, this.game.player.y - enemy.y);
          if (currentDist <= 125 && this.game.playerManager) {
            this.game.playerManager.damagePlayer(enemy.atk);
          }
        }
      }

      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;

      enemy.x = Math.max(this.game.bounds.minX, Math.min(this.game.bounds.maxX, enemy.x));
      enemy.y = Math.max(this.game.bounds.minY, Math.min(this.game.bounds.maxY, enemy.y));
    });
  }

  damageEnemy(enemy, damage, isCrit, kx, ky) {
    enemy.hp -= damage;
    enemy.hitFlashTimer = 0;
    enemy.staggerTimer = 0;
    audioManager.playHit(isCrit);
    audioManager.playWolfHurt();

    enemy.vx = 0;
    enemy.vy = 0;

    this.spawnDamageNumber(enemy.x, enemy.y - enemy.radius, damage, isCrit);
    this.spawnHitSparks(enemy.x, enemy.y, isCrit ? 12 : 7);

    if (enemy.hp <= 0) {
      this.onEnemyKilled(enemy);
    }
  }

  onEnemyKilled(enemy) {
    this.game.player.coins += enemy.coins;
    this.game.player.power += 2;
    if (this.game.playerManager) {
      this.game.playerManager.addExp(enemy.exp || 50);
    }

    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.game.particles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: '#60a5fa',
        alpha: 1,
        life: 0.6
      });
    }

    this.game.quest.cur++;
    if (this.game.quest.cur >= this.game.quest.target && !this.game.quest.completed) {
      if (!this.game.quest.bossSpawned) {
        this.game.quest.bossSpawned = true;
        this.game.showBanner('CẢNH BÁO: BĂNG GIÁC HỔ VƯƠNG XUẤT HIỆN!');
        this.game.bossSpawnTimer = 1.2;
      } else if (enemy.isBoss) {
        this.game.quest.completed = true;
        this.game.completeQuest();
      }
    }

    this.game.updateHUD();

    // Loại bỏ quái đã chết khỏi mảng enemies
    const idx = this.game.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.game.enemies.splice(idx, 1);
    }

    // Đặt lịch hồi sinh sau đúng 5 giây (Respawn sau 5s)
    if (!this.pendingRespawns) this.pendingRespawns = [];
    this.pendingRespawns.push({
      timer: 5.0,
      type: enemy.type,
      name: enemy.rawName || (enemy.name ? enemy.name.split(' [')[0] : null)
    });
  }

  spawnDamageNumber(x, y, num, isCrit, isPlayer = false) {
    if (!this.game.showDamageNumbers) return;
    this.game.damageNumbers.push({
      x: x + (Math.random() * 24 - 12),
      y: y,
      num: num,
      isCrit: isCrit,
      isPlayer: isPlayer,
      life: 0.85,
      maxLife: 0.85
    });
  }

  spawnHitSparks(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 90;
      this.game.particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y + (Math.random() * 10 - 5),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: 2 + Math.random() * 2,
        color: Math.random() < 0.7 ? '#f59e0b' : '#ffffff',
        alpha: 1,
        life: 0.3
      });
    }
  }

  renderEnemy(ctx, enemy) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(enemy.x, enemy.y + 6, enemy.radius * 0.9, enemy.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    if (enemy.facing === -1) {
      ctx.scale(-1, 1);
    }

    const spriteKey = enemy.type || 'enemy1';
    let sheet = spriteManager.get(spriteKey) || spriteManager.get('enemy1') || spriteManager.get('wolf');

    const eMeta = (window.spriteManager && window.spriteManager.getMeta('enemy')) || { frameW: 176, frameH: 176 };
    const FRAME_W = eMeta.frameW || 176;
    const FRAME_H = eMeta.frameH || 176;
    const drawW = enemy.isBoss ? enemy.width * 1.55 : enemy.width;
    const drawH = enemy.isBoss ? enemy.height * 1.55 : enemy.height;

    if (sheet) {
      let frameIdx = 0;
      let sy = 0;
      if (enemy.isAttacking && enemy.attackAnimTimer > 0) {
        const prog = Math.max(0, Math.min(0.999, 1 - (enemy.attackAnimTimer / (enemy.attackAnimDuration || 0.55))));
        frameIdx = Math.min(9, Math.floor(prog * 10));
        sy = FRAME_H; // Row 1: ATTACK
      } else {
        frameIdx = Math.floor((enemy.animationTime * 8) % 10);
        sy = 0; // Row 0: RUN / WALK
      }
      const sx = frameIdx * FRAME_W;
      ctx.drawImage(sheet, sx, sy, FRAME_W, FRAME_H, -drawW / 2, -drawH + 15, drawW, drawH);
    } else {
      ctx.fillStyle = enemy.isBoss ? '#b45309' : '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -enemy.height / 2, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Health Bar
    const barW = enemy.isBoss ? 96 : 56;
    const barH = enemy.isBoss ? 8 : 5;
    const barX = enemy.x - barW / 2;
    const barY = enemy.y - enemy.height + 8;
    const pct = Math.max(0, enemy.hp / enemy.maxHp);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    ctx.fillStyle = enemy.isBoss ? '#f59e0b' : '#dc2626';
    ctx.fillRect(barX, barY, barW * pct, barH);

    ctx.font = enemy.isBoss ? 'bold 11px Nunito, sans-serif' : '9px Nunito, sans-serif';
    ctx.fillStyle = enemy.isBoss ? '#fbbf24' : '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(enemy.name, enemy.x, barY - 4);
  }

  renderDamageNumbers(ctx) {
    this.game.damageNumbers.forEach(d => {
      ctx.save();
      const progress = 1 - (d.life / d.maxLife);
      const alpha = Math.max(0, d.life / d.maxLife);
      const riseY = d.y - progress * 40;

      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';

      if (d.isPlayer) {
        ctx.font = 'bold 15px Nunito, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(`-${d.num}`, d.x, riseY);
      } else if (d.isCrit) {
        ctx.font = '900 18px \'Playfair Display\', \'Lora\', serif';
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 8;
        ctx.fillText(`⚡ ${d.num}`, d.x, riseY);
      } else {
        ctx.font = 'bold 14px Nunito, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#0f172a';
        ctx.shadowBlur = 4;
        ctx.fillText(`${d.num}`, d.x, riseY);
      }
      ctx.restore();
    });
  }

  renderParticles(ctx) {
    if (this.game.particles.length === 0) return;

    ctx.save();
    for (let i = 0; i < this.game.particles.length; i++) {
      const pt = this.game.particles[i];
      const prog = Math.max(0, Math.min(1, pt.life / 0.3));
      ctx.globalAlpha = (pt.alpha || 1.0) * prog;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius * prog, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

window.EnemyManager = EnemyManager;

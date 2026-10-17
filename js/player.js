// ============================================================================
// THANH VÂN KIẾM KHÁCH - HỆ THỐNG NHÂN VẬT & TRANG BỊ (PLAYER & EQUIPMENT)
// ============================================================================

function createDefaultPlayer() {
  return {
    x: 540,
    y: 1350,
    vx: 0,
    vy: 0,
    speed: 165,
    facing: 1, // 1 = right, -1 = left
    radius: 42,
    width: 143,
    height: 143,

    // Stats - Khởi đầu chuẩn Level 1 (Tân Thủ Sơ Nhập)
    level: 1,
    exp: 0,
    maxExp: 100,
    hp: 750,
    maxHp: 750,
    mp: 190,
    maxMp: 190,
    power: 2320,
    atk: 77,
    def: 65,
    critChance: 0.10,
    critMulti: 1.65,
    attackSpeed: 1.24, // Tốc độ đánh: 1.24 lần/giây
    coins: 300,
    potions: 5,
    mpPotions: 5,
    weaponLevel: 1,

    // 8 Ô Trang bị đang mặc (Bộ Trang Bị Khởi Đầu Cấp 1: Thanh Vân Môn Sơ Khởi)
    equipped: {
      weapon: {
        id: 'weapon_thanh_van',
        slot: 'weapon',
        name: 'Thanh Vân Bảo Kiếm',
        type: 'Vũ Khí',
        slotName: 'Vũ Khí',
        level: 1,
        quality: 'rare',
        icon: 'assets/items/item_sword.png',
        atk: 25,
        aspeed: 0.04,
        statDesc: '+25 Công Kích, +0.04 Tốc Đánh',
        desc: 'Bảo kiếm đúc từ thép lam ngọc của đệ tử Thanh Vân Môn, lưỡi kiếm sáng trong sắc bén.'
      },
      armor: {
        id: 'armor_thanh_van',
        slot: 'armor',
        name: 'Thanh Vân Đạo Bào',
        type: 'Áo Giáp',
        slotName: 'Áo Giáp',
        level: 1,
        quality: 'rare',
        icon: 'assets/items/item_armor.png',
        def: 18,
        hp: 100,
        statDesc: '+18 Phòng Ngự, +100 Sinh Mệnh',
        desc: 'Đạo bào thanh nhã thêu vân phù hộ thân, giúp đệ tử chống đỡ vuốt sắc yêu ma.'
      },
      pants: {
        id: 'pants_thanh_van',
        slot: 'pants',
        name: 'Thanh Vân Chiến Khố',
        type: 'Quần',
        slotName: 'Quần',
        level: 1,
        quality: 'rare',
        icon: 'assets/items/item_pants.png',
        def: 12,
        hp: 70,
        statDesc: '+12 Phòng Ngự, +70 Sinh Mệnh',
        desc: 'Chiến khố dệt từ tơ tằm thanh ngọc bền chắc, bảo vệ hạ thân linh hoạt trong giao đấu.'
      },
      boots: {
        id: 'boots_phong_hanh',
        slot: 'boots',
        name: 'Phong Hành Chiến Hài',
        type: 'Giày',
        slotName: 'Giày',
        level: 1,
        quality: 'rare',
        icon: 'assets/items/item_boots.png',
        speed: 30,
        dodge: 4,
        statDesc: '+30 Tốc Độ Chạy, +4% Né Tránh',
        desc: 'Đôi hài nhẹ bước tựa gió thu, giúp thân thủ di chuyển nhanh nhẹn thoát hiểm.'
      },
      belt: {
        id: 'belt_tinh_van',
        slot: 'belt',
        name: 'Huyền Thiết Đai Lưng',
        type: 'Thắt Lưng',
        slotName: 'Thắt Lưng',
        level: 1,
        quality: 'rare',
        icon: 'assets/items/item_belt.png',
        hp: 80,
        def: 10,
        statDesc: '+80 Sinh Mệnh, +10 Phòng Ngự',
        desc: 'Thắt lưng khóa sắt rèn nguội gia hộ huyệt đan điền, tụ khí kiện thể.'
      },
      helmet: {
        id: 'helmet_thanh_van',
        slot: 'helmet',
        name: 'Thanh Vân Đạo Mão',
        type: 'Nón',
        slotName: 'Nón',
        level: 1,
        quality: 'rare',
        icon: 'assets/items/item_helmet.png',
        def: 10,
        mp: 40,
        statDesc: '+10 Phòng Ngự, +40 Chân Khí',
        desc: 'Mão tiên sinh nạm ngọc thanh tĩnh, giúp an thần dưỡng khí khi vận công niệm chú.'
      },
      amulet: {
        id: 'amulet_linh_ngoc',
        slot: 'amulet',
        name: 'Linh Ngọc Hộ Phù',
        type: 'Dây Chuyền',
        slotName: 'Dây Chuyền',
        level: 1,
        quality: 'rare',
        icon: 'assets/items/item_necklace.png',
        atk: 12,
        hp: 50,
        statDesc: '+12 Công Kích, +50 Sinh Mệnh',
        desc: 'Hộ thân phù điêu khắc cổ tự trừ tà, hấp thu linh khí thiên địa bảo hộ người đeo.'
      },
      ring: {
        id: 'ring_bich_ngoc',
        slot: 'ring',
        name: 'Bích Ngọc Giới Chỉ',
        type: 'Nhẫn',
        slotName: 'Nhẫn',
        level: 1,
        quality: 'rare',
        icon: 'assets/items/item_ring.png',
        crit: 0.05,
        critDmg: 0.15,
        statDesc: '+5% Tỷ Lệ Bạo Kích, +15% Sát Thương Bạo',
        desc: 'Chiếc nhẫn ngọc bích chạm khắc hoa văn kiếm tông, kích phát sát thương chí mạng.'
      }
    },

    // 40 Ô Túi đồ trữ vật (Trang bị đang mặc KHÔNG hiển thị trong túi đồ)
    inventory: [
      {
        id: 'potion_hp',
        name: 'Bình Hồi Huyết (HP)',
        type: 'Dược Phẩm',
        slotName: 'Dược Phẩm',
        quality: 'rare',
        count: 10,
        icon: 'assets/items/item_potion_hp.webp',
        desc: 'Linh đan tiên gia luyện từ Bách Thảo, lập tức hồi phục 250 điểm Sinh Mệnh.'
      },
      {
        id: 'potion_mp',
        name: 'Bình Linh Khí (MP)',
        type: 'Dược Phẩm',
        slotName: 'Dược Phẩm',
        quality: 'rare',
        count: 10,
        icon: 'assets/items/item_potion_mp.webp',
        desc: 'Nước thần hàn lộ chứa linh khí thuần khiết, lập tức hồi phục 150 điểm Chân Khí.'
      },
      {
        id: 'stone_enhance',
        name: 'Đá Cường Hóa Huyền Thiết',
        type: 'Khoáng Thạch',
        slotName: 'Khoáng Thạch',
        quality: 'epic',
        count: 20,
        icon: 'assets/items/item_enhance_stone.webp',
        desc: 'Khoáng thạch cổ xưa dùng để nâng cấp và gia cường thần binh giáp trụ.'
      },
      null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null
    ],

    // Animation & State
    isAttacking: false,
    attackAnimTimer: 0,
    attackAnimDuration: 0.26,
    comboStep: 0,
    comboTimer: 0,
    attackCooldown: 0,
    invulnerable: false,
    invulnerableTimer: 0,
    animationTime: 0
  };
}

class PlayerManager {
  constructor(game) {
    this.game = game;
  }

  recalcStats() {
    const p = this.game.player;
    if (!p) return;

    const lvl = p.level || 1;
    // Chỉ số gốc của nhân vật theo cấp độ (Cấp 1 -> Cấp 100)
    let baseHp = 450 + (lvl - 1) * 45;
    let baseMp = 150 + (lvl - 1) * 15;
    let baseAtk = 40 + (lvl - 1) * 6;
    let baseDef = 15 + (lvl - 1) * 3;
    let baseCrit = 0.05 + Math.floor((lvl - 1) / 10) * 0.01;
    let baseCritDmg = 1.50;
    let baseSpeed = 180 + Math.min(30, (lvl - 1) * 0.5);
    let baseAtkSpeed = 1.20 + (lvl - 1) * 0.004;

    // Cộng thuộc tính từ bộ trang bị đang mặc
    if (p.equipped) {
      for (let slotKey in p.equipped) {
        const item = p.equipped[slotKey];
        if (!item) continue;
        const itemLv = item.level || 1;
        if (item.atk) baseAtk += item.atk + (itemLv - 1) * 6;
        if (item.def) baseDef += item.def + (itemLv - 1) * 4;
        if (item.hp) baseHp += item.hp + (itemLv - 1) * 25;
        if (item.mp) baseMp += item.mp + (itemLv - 1) * 10;
        if (item.crit) baseCrit += item.crit;
        if (item.critDmg) baseCritDmg += item.critDmg;
        if (item.speed) baseSpeed += item.speed;
        if (item.aspeed) baseAtkSpeed += item.aspeed;
      }
    }

    p.maxHp = baseHp;
    p.maxMp = baseMp;
    if (!p.statsInitialized) {
      p.statsInitialized = true;
      p.hp = baseHp;
      p.mp = baseMp;
    } else {
      p.hp = Math.min(p.hp || baseHp, p.maxHp);
      p.mp = Math.min(p.mp || baseMp, p.maxMp);
    }
    p.atk = baseAtk;
    p.def = baseDef;
    p.critChance = Math.round(baseCrit * 100) / 100;
    p.critMultiplier = Math.round(baseCritDmg * 100) / 100;
    p.speed = baseSpeed;
    p.attackSpeed = Math.round(baseAtkSpeed * 100) / 100;

    if (p.equipped && p.equipped.weapon) {
      p.weaponLevel = p.equipped.weapon.level || 1;
    }

    // Đồng bộ số lượng dược phẩm
    let hpCount = 0;
    let mpCount = 0;
    if (p.inventory) {
      p.inventory.forEach(it => {
        if (!it) return;
        if (it.id === 'potion_hp') hpCount += it.count || 1;
        if (it.id === 'potion_mp') mpCount += it.count || 1;
      });
    }
    p.potions = hpCount;
    p.mpPotions = mpCount;

    // Công thức tính Lực Chiến chuẩn
    p.power = Math.round(
      p.atk * 12 +
      p.def * 8 +
      p.maxHp * 1.5 +
      p.maxMp * 1.0 +
      p.critChance * 1500 +
      p.attackSpeed * 600 +
      (p.speed - 160) * 3
    );

    this.game.updateHUD();
  }

  usePotionFromInventory(itemId, invIndex) {
    const p = this.game.player;
    if (!p || !p.inventory || !p.inventory[invIndex]) return;
    const item = p.inventory[invIndex];

    if (itemId === 'potion_hp') {
      if (p.hp >= p.maxHp) {
        this.game.showBanner('SINH MỆNH ĐÃ ĐẦY!');
        return;
      }
      p.hp = Math.min(p.maxHp, p.hp + 200);
      item.count = (item.count || 1) - 1;
      if (item.count <= 0) p.inventory[invIndex] = null;
      audioManager.playLevelUp();
      this.game.showBanner('SỬ DỤNG HUYẾT ĐAN (+200 HP)');
    } else if (itemId === 'potion_mp') {
      if (p.mp >= p.maxMp) {
        this.game.showBanner('CHÂN KHÍ ĐÃ ĐẦY!');
        return;
      }
      p.mp = Math.min(p.maxMp, p.mp + 150);
      item.count = (item.count || 1) - 1;
      if (item.count <= 0) p.inventory[invIndex] = null;
      audioManager.playLevelUp();
      this.game.showBanner('SỬ DỤNG TỤ KHÍ ĐAN (+150 MP)');
    }

    this.recalcStats();
    if (window.ui) {
      window.ui.renderBagGrid();
      window.ui.closeItemDetail();
    }
  }

  usePotion() {
    if (this.game && typeof this.game.usePotion === 'function') {
      this.game.usePotion();
    }
  }

  useMpPotion() {
    if (this.game && typeof this.game.useMpPotion === 'function') {
      this.game.useMpPotion();
    }
  }

  equipItemFromInventory(invIndex) {
    const p = this.game.player;
    if (!p || !p.inventory || !p.inventory[invIndex]) return;
    const item = p.inventory[invIndex];
    if (!item.slot) {
      this.game.showBanner('VẬT PHẨM NÀY KHÔNG THỂ TRANG BỊ!');
      return;
    }

    if (!p.equipped) p.equipped = {};
    const oldItem = p.equipped[item.slot] || null;
    p.equipped[item.slot] = item;
    p.inventory[invIndex] = oldItem;

    this.recalcStats();
    audioManager.playLevelUp();
    this.game.showBanner(`ĐÃ TRANG BỊ: ${item.name}!`);
    if (window.ui) {
      window.ui.renderBagGrid();
      window.ui.closeItemDetail();
    }
  }

  unequipItem(slotKey) {
    const p = this.game.player;
    if (!p || !p.equipped || !p.equipped[slotKey]) return;
    if (!p.inventory) p.inventory = new Array(40).fill(null);

    const emptyIdx = p.inventory.findIndex(x => !x);
    if (emptyIdx === -1) {
      this.game.showBanner('TÚI ĐỒ ĐÃ ĐẦY, KHÔNG THỂ THÁO TRANG BỊ!');
      return;
    }

    const item = p.equipped[slotKey];
    p.inventory[emptyIdx] = item;
    p.equipped[slotKey] = null;

    this.recalcStats();
    this.game.showBanner(`ĐÃ THÁO: ${item.name}!`);
    if (window.ui) {
      window.ui.renderBagGrid();
      window.ui.closeItemDetail();
    }
  }

  upgradeEquipped(slotKey) {
    const p = this.game.player;
    if (!p || !p.equipped || !p.equipped[slotKey]) return;
    const item = p.equipped[slotKey];
    const cost = (item.level || 1) * 150;

    if (p.coins < cost) {
      this.game.showBanner(`KHÔNG ĐỦ VÀNG! CẦN ${cost.toLocaleString()} VÀNG.`);
      return;
    }

    p.coins -= cost;
    item.level = (item.level || 1) + 1;
    this.recalcStats();
    audioManager.playLevelUp();
    this.game.showBanner(`CƯỜNG HÓA THÀNH CÔNG: ${item.name} +${item.level}!`);
    if (window.ui) {
      window.ui.renderBagGrid();
      window.ui.showItemDetail(item, 'equipped', slotKey);
    }
  }

  getMaxExpForLevel(lvl) {
    // Công thức EXP chuẩn theo cấp độ (Cấp 1 cần 100 EXP)
    return Math.floor(75 * Math.pow(Math.max(1, lvl), 1.35) + 25);
  }

  addExp(amount) {
    const p = this.game.player;
    p.exp = (p.exp || 0) + amount;
    p.maxExp = this.getMaxExpForLevel(p.level || 1);

    let leveledUp = false;
    while (p.exp >= p.maxExp) {
      p.exp -= p.maxExp;
      p.level = (p.level || 1) + 1;
      p.maxExp = this.getMaxExpForLevel(p.level);
      leveledUp = true;
    }

    if (leveledUp) {
      // Tái tính toán toàn bộ chỉ số theo cấp mới
      this.recalcStats();
      // Hồi phục toàn bộ Sinh Mệnh & Chân Khí khi thăng cấp
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      // Kiểm tra và tự động mở khóa kỹ năng mới theo cấp độ
      if (this.game.skills) {
        this.game.skills.checkUnlockSkills(true);
      }
      audioManager.playLevelUp();
      this.game.showBanner(`🔥 THĂNG CẤP! ĐẠT LEVEL ${p.level} (${p.power.toLocaleString()} LỰC CHIẾN)`);
      if (window.ui) {
        window.ui.updateModalStats();
      }
    }
    this.game.updateHUD();
  }

  damagePlayer(damage) {
    const p = this.game.player;
    if (p.invulnerable) return;

    // Giảm sát thương chuẩn dựa theo chỉ số Phòng Ngự (DEF)
    const defFactor = p.def / (p.def + 150);
    const reducedDamage = Math.max(1, Math.round(damage * (1 - defFactor)));

    p.hp = Math.max(0, p.hp - reducedDamage);
    p.invulnerable = true;
    p.invulnerableTimer = 0.55;
    audioManager.playHit(false);

    if (this.game.screenShakeEnabled) this.game.triggerShake(4);

    if (this.game.enemyManager) {
      this.game.enemyManager.spawnDamageNumber(p.x, p.y - 40, reducedDamage, false, true);
    }

    if (p.hp <= 0) {
      const lostCoins = Math.floor(p.coins * 0.05);
      p.coins = Math.max(0, p.coins - lostCoins);
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      p.x = 540;
      p.y = 1350;
      p.invulnerable = true;
      p.invulnerableTimer = 2.0;
      this.game.showBanner(`TRỌNG THƯƠNG HÔN MÊ! ĐƯỢC CỨU VỀ THÔN, TỔN THẤT ${lostCoins.toLocaleString()} VÀNG`);
    }
    this.game.updateHUD();
  }

  getPlayerHandPos() {
    const p = this.game.player;
    const handOffsetY = -p.height * 0.40;
    const handOffsetX = p.facing * (p.width * 0.32);
    return {
      x: p.x + handOffsetX,
      y: p.y + handOffsetY
    };
  }

  renderPlayer(ctx) {
    const p = this.game.player;

    const meta = (window.spriteManager && window.spriteManager.getMeta('hero')) || { frameW: 320, frameH: 240, drawW: 160, drawH: 120, anchorX: 80, anchorY: 111 };
    const FRAME_W = meta.frameW;
    const FRAME_H = meta.frameH;
    const drawW = meta.drawW;
    const drawH = meta.drawH;
    const drawAnchorX = meta.anchorX;
    const drawAnchorY = meta.anchorY;

    // After-images when dashing
    this.game.afterImages.forEach(img => {
      let dashSprite = spriteManager.get('hero_run') || spriteManager.get('hero_idle');
      if (dashSprite) {
        ctx.save();
        ctx.globalAlpha = img.alpha * 0.6;
        ctx.translate(img.x, img.y);
        if (img.facing === -1) {
          ctx.scale(-1, 1);
        }
        const sx = 2 * FRAME_W;
        ctx.drawImage(dashSprite, sx, 0, FRAME_W, FRAME_H, -drawAnchorX, -drawAnchorY, drawW, drawH);
        ctx.restore();
      }
    });

    // Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 8, 42, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.facing === -1) {
      ctx.scale(-1, 1);
    }

    const isMoving = Math.hypot(p.vx, p.vy) > 15;

    if (p.isAttacking && p.attackAnimTimer > 0) {
      const sheet = spriteManager.get('hero_attack');
      if (sheet) {
        const progress = Math.max(0, Math.min(0.999, 1 - (p.attackAnimTimer / (p.attackAnimDuration || 0.38))));
        const frameIdx = Math.min(9, Math.floor(progress * 10));
        const sx = frameIdx * FRAME_W;
        ctx.drawImage(sheet, sx, 0, FRAME_W, FRAME_H, -drawAnchorX, -drawAnchorY, drawW, drawH);
      } else {
        const fallback = spriteManager.get('hero_idle');
        if (fallback) ctx.drawImage(fallback, 0, 0, FRAME_W, FRAME_H, -drawAnchorX, -drawAnchorY, drawW, drawH);
      }
    } else if (isMoving) {
      const sheet = spriteManager.get('hero_run');
      if (sheet) {
        const frameIdx = Math.floor((p.animationTime * 12) % 6);
        const sx = frameIdx * FRAME_W;
        ctx.drawImage(sheet, sx, 0, FRAME_W, FRAME_H, -drawAnchorX, -drawAnchorY, drawW, drawH);
      } else {
        const fallback = spriteManager.get('hero_idle');
        if (fallback) ctx.drawImage(fallback, 0, 0, FRAME_W, FRAME_H, -drawAnchorX, -drawAnchorY, drawW, drawH);
      }
    } else {
      const sheet = spriteManager.get('hero_idle');
      if (sheet) {
        const frameIdx = Math.floor((p.animationTime * 8) % 4);
        const sx = frameIdx * FRAME_W;
        ctx.drawImage(sheet, sx, 0, FRAME_W, FRAME_H, -drawAnchorX, -drawAnchorY, drawW, drawH);
      }
    }

    ctx.restore();
  }
}

window.createDefaultPlayer = createDefaultPlayer;
window.PlayerManager = PlayerManager;

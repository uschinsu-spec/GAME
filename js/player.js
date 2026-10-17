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

    // Stats
    level: 12,
    exp: 0,
    maxExp: 1000,
    hp: 620,
    maxHp: 620,
    mp: 280,
    maxMp: 280,
    power: 8636,
    atk: 185,
    def: 82,
    critChance: 0.25,
    critMulti: 1.8,
    attackSpeed: 1.25, // Tốc độ đánh: 1.25 lần/giây
    coins: 1250,
    potions: 5,
    mpPotions: 3,
    weaponLevel: 3,

    // 8 Ô Trang bị đang mặc (Khớp chuẩn 100% hình mẫu: Vũ Khí, Áo Giáp, Quần, Giày, Thắt Lưng, Nón, Dây Chuyền, Nhẫn)
    equipped: {
      weapon: {
        id: 'weapon_lam_quang',
        slot: 'weapon',
        name: 'Lam Quang Thần Kiếm',
        type: 'Vũ Khí',
        slotName: 'Vũ Khí',
        level: 3,
        quality: 'epic',
        icon: 'assets/items/item_sword.png',
        atk: 185,
        aspeed: 0.08,
        statDesc: '+185 Công Kích, +0.08 Tốc Đánh',
        desc: 'Bảo kiếm Thanh Vân đúc từ huyền thiết lam ngọc, lưỡi kiếm tỏa lam quang sắc bén xé gió.'
      },
      armor: {
        id: 'armor_thanh_van',
        slot: 'armor',
        name: 'Lam Tinh Chiến Giáp',
        type: 'Áo Giáp',
        slotName: 'Áo Giáp',
        level: 2,
        quality: 'epic',
        icon: 'assets/items/item_armor.png',
        def: 75,
        hp: 280,
        statDesc: '+75 Phòng Ngự, +280 Sinh Mệnh',
        desc: 'Chiến giáp nạm ngọc lam tinh hộ thể kiên cố, chống đỡ sát khí yêu thú.'
      },
      pants: {
        id: 'pants_lam_ngoc',
        slot: 'pants',
        name: 'Huyền Thiết Chiến Quần',
        type: 'Quần',
        slotName: 'Quần',
        level: 2,
        quality: 'rare',
        icon: 'assets/items/item_pants.png',
        def: 45,
        hp: 190,
        statDesc: '+45 Phòng Ngự, +190 Sinh Mệnh',
        desc: 'Chiến quần dệt từ tơ huyền thiết, bảo vệ hạ thân vững chắc linh hoạt.'
      },
      boots: {
        id: 'boots_phong_hanh',
        slot: 'boots',
        name: 'Băng Lam Chiến Hài',
        type: 'Giày',
        slotName: 'Giày',
        level: 2,
        quality: 'rare',
        icon: 'assets/items/item_boots.png',
        speed: 50,
        dodge: 6,
        statDesc: '+50 Tốc Độ Chạy, +6% Né Tránh',
        desc: 'Đôi chiến hài luyện từ băng tinh, bước chân thoăn thoắt nhẹ tựa phù vân.'
      },
      belt: {
        id: 'belt_tinh_van',
        slot: 'belt',
        name: 'Tinh Vân Đai Lưng',
        type: 'Thắt Lưng',
        slotName: 'Thắt Lưng',
        level: 1,
        quality: 'epic',
        icon: 'assets/items/item_belt.png',
        hp: 210,
        def: 35,
        statDesc: '+210 Sinh Mệnh, +35 Phòng Ngự',
        desc: 'Thắt lưng nạm ngọc tinh vân, ngưng tụ chân khí gia tăng phòng thủ toàn diện.'
      },
      helmet: {
        id: 'helmet_tu_van',
        slot: 'helmet',
        name: 'Băng Tinh Chiến Mão',
        type: 'Nón',
        slotName: 'Nón',
        level: 2,
        quality: 'epic',
        icon: 'assets/items/item_helmet.png',
        def: 40,
        mp: 130,
        statDesc: '+40 Phòng Ngự, +130 Chân Khí',
        desc: 'Mũ chiến binh nạm lam ngọc giúp ngưng thần tĩnh khí, khai thông kinh mạch.'
      },
      amulet: {
        id: 'amulet_linh_lung',
        slot: 'amulet',
        name: 'Lam Bảo Dây Chuyền',
        type: 'Dây Chuyền',
        slotName: 'Dây Chuyền',
        level: 2,
        quality: 'epic',
        icon: 'assets/items/item_necklace.png',
        atk: 60,
        hp: 180,
        statDesc: '+60 Công Kích, +180 Sinh Mệnh',
        desc: 'Dây chuyền nạm bảo ngọc sapphire, linh khí luân chuyển hộ tâm cho kiếm khách.'
      },
      ring: {
        id: 'ring_can_khon',
        slot: 'ring',
        name: 'Lam Tinh Giới Chỉ',
        type: 'Nhẫn',
        slotName: 'Nhẫn',
        level: 2,
        quality: 'epic',
        icon: 'assets/items/item_ring.png',
        crit: 0.10,
        critDmg: 0.25,
        statDesc: '+10% Tỷ Lệ Bạo Kích, +25% Sát Thương Bạo',
        desc: 'Nhẫn bạch kim nạm lam ngọc thượng cổ, gia tăng sát thương chí mạng cực lớn.'
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
    let baseHp = 400 + (lvl - 1) * 35;
    let baseMp = 180 + (lvl - 1) * 15;
    let baseAtk = 65 + (lvl - 1) * 10;
    let baseDef = 30 + (lvl - 1) * 6;
    let baseCrit = 0.12;
    let baseCritDmg = 1.5;
    let baseSpeed = 220;
    let baseAtkSpeed = 1.25;

    // Cộng thuộc tính từ bộ trang bị đang mặc
    if (p.equipped) {
      for (let slotKey in p.equipped) {
        const item = p.equipped[slotKey];
        if (!item) continue;
        const itemLv = item.level || 1;
        if (item.atk) baseAtk += item.atk + (itemLv - 1) * 18;
        if (item.def) baseDef += item.def + (itemLv - 1) * 12;
        if (item.hp) baseHp += item.hp + (itemLv - 1) * 50;
        if (item.mp) baseMp += item.mp + (itemLv - 1) * 25;
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

    // Công thức tính Lực Chiến tổng
    p.power = Math.round(
      p.atk * 14 +
      p.def * 10 +
      p.maxHp * 2.2 +
      p.maxMp * 1.6 +
      p.critChance * 2000 +
      p.attackSpeed * 800 +
      (p.speed - 200) * 5
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

  addExp(amount) {
    const p = this.game.player;
    p.exp = (p.exp || 0) + amount;
    p.maxExp = p.maxExp || 1000;

    let leveledUp = false;
    while (p.exp >= p.maxExp) {
      p.exp -= p.maxExp;
      p.level++;
      p.maxExp = Math.floor(p.maxExp * 1.35);
      p.maxHp += 50;
      p.hp = p.maxHp;
      p.maxMp += 20;
      p.mp = p.maxMp;
      p.atk += 12;
      p.def += 6;
      p.attackSpeed = Math.round(((p.attackSpeed || 1.25) + 0.02) * 100) / 100;
      p.power += 480;
      leveledUp = true;
    }

    if (leveledUp) {
      audioManager.playLevelUp();
      this.game.showBanner(`THĂNG CẤP! LEVEL ${p.level}`);
      if (window.ui) window.ui.updateModalStats();
    }
  }

  damagePlayer(damage) {
    const p = this.game.player;
    if (p.invulnerable) return;

    const defFactor = p.def / (p.def + 100);
    const reducedDamage = Math.max(1, Math.round(damage * (1 - defFactor)));

    p.hp = Math.max(0, p.hp - reducedDamage);
    p.invulnerable = true;
    p.invulnerableTimer = 0.6;
    audioManager.playHit(false);

    if (this.game.screenShakeEnabled) this.game.triggerShake(4);

    if (this.game.enemyManager) {
      this.game.enemyManager.spawnDamageNumber(p.x, p.y - 40, reducedDamage, false, true);
    }

    if (p.hp <= 0) {
      const lostCoins = Math.floor(p.coins * 0.1);
      p.coins = Math.max(0, p.coins - lostCoins);
      p.hp = p.maxHp;
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

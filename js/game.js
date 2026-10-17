// ============================================================================
// THANH VÂN KIẾM KHÁCH - ARPG CORE ENGINE
// ============================================================================

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.minimapCanvas = document.getElementById('minimap-radar');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    this.width = 540;
    this.height = 960;
    this.dpr = window.devicePixelRatio || 1;

    // Camera & Playable bounds (Zoom vừa khít chiều rộng map 1080px)
    this.worldWidth = 1080;
    this.worldHeight = 1920;
    this.camera = { x: 0, y: 0, zoom: this.width / this.worldWidth };

    // 10 Vùng Bản Đồ
    this.worldMaps = window.WORLD_MAPS || {};
    this.currentMapId = 'thanh_van_thon';
    this.bounds = (this.worldMaps[this.currentMapId] && this.worldMaps[this.currentMapId].bounds) || { minX: 100, maxX: 980, minY: 900, maxY: 1800 };
    this.isTeleporting = false;
    this.portalAnimTime = 0;

    // Game flags & settings
    this.isRunning = false;
    this.isPaused = false;
    this.autoCombat = false;
    this.autoCombatTimer = 0;
    this.autoTarget = null;
    this.autoPotionTimer = 0;
    this.screenShake = 0;
    this.screenShakeEnabled = true;
    this.showDamageNumbers = true;
    this.lastTime = 0;
    this.bannerTimeout = null;
    this.bossSpawnTimer = 0;
    this.respawnTimer = 0;

    // Entities & Effects collections
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.damageNumbers = [];
    this.swordArrays = [];
    this.lightningStrikes = [];
    this.slashEffects = [];
    this.afterImages = [];
    this.groundDecals = [];

    // Quest System
    this.quest = {
      type: 'Nhiệm vụ chính',
      desc: 'Đánh bại yêu thú ở ngoại ô',
      cur: 12,
      target: 30,
      completed: false,
      bossSpawned: false
    };

    // Subsystem Managers
    this.player = window.createDefaultPlayer ? window.createDefaultPlayer() : {};
    this.playerManager = new PlayerManager(this);
    this.skills = new SkillManager(this);
    this.mapManager = new MapManager(this);
    this.enemyManager = new EnemyManager(this);

    // Compatibility aliases for HTML onclick & submodules
    this.allSkills = this.skills.allSkills;
    this.slotAssignments = this.skills.slotAssignments;

    // Controls input state
    this.keys = {};
    this.joystick = {
      active: false,
      identifier: null,
      startX: 0,
      startY: 0,
      curX: 0,
      curY: 0,
      dx: 0,
      dy: 0,
      distance: 0,
      maxDist: 48
    };

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Khởi tạo AudioContext ngay trước khi load asset và bắt đầu render game
    if (window.audioManager) {
      audioManager.init();
    }

    this.setupInputs();
    this.setupUI();

    // Spawn initial monsters
    this.enemyManager.spawnInitialWolves();

    // Start game loop after sprite loading & font ready
    const fontReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    Promise.all([spriteManager.loadAll(), fontReady]).then(() => {
      this.isRunning = true;
      requestAnimationFrame((t) => this.loop(t));
      this.showBanner('THANH VÂN THÔN - NGOẠI Ô CHIẾN');
    });
  }

  handleResize() {
    const container = document.getElementById('game-container');
    const rect = container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.scale(this.dpr, this.dpr);

    // Tự động thu phóng Camera xa ra vừa khít 100% với chiều rộng của bản đồ (1080px)
    this.camera.zoom = this.width / this.worldWidth;

    this.minimapCanvas.width = Math.round(90 * this.dpr);
    this.minimapCanvas.height = Math.round(90 * this.dpr);
    this.minimapCtx.imageSmoothingEnabled = true;
    this.minimapCtx.imageSmoothingQuality = 'high';
    this.minimapCtx.scale(this.dpr, this.dpr);
  }

  // =========================================
  // INPUTS & CONTROLS
  // =========================================
  setupInputs() {
    window.addEventListener('keydown', (e) => {
      audioManager.ensureContext();
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code] = true;

      if (e.key === ' ' || e.key.toLowerCase() === 'j') {
        this.castSkill(1);
      } else if (e.key === '1') {
        this.castSkill(1);
      } else if (e.key === '2') {
        this.castSkill(2);
      } else if (e.key === '3' || e.key.toLowerCase() === 'k') {
        this.castSkill(3);
      } else if (e.key === '4') {
        this.castSkill(4);
      } else if (e.key.toLowerCase() === 'r') {
        this.toggleAuto();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      if (this.joystick.active) {
        onJoyEnd();
        this.joystick.identifier = null;
      }
    });

    // Dynamic Floating Virtual Joystick Handling
    const container = document.getElementById('game-container');
    const base = document.getElementById('joystick-base');
    const thumb = document.getElementById('joystick-thumb');

    const isInteractiveUI = (el) => {
      if (!el || typeof el.closest !== 'function') return false;
      return el.closest(
        'button, .skill-btn, .action-btn, .circle-btn, .quest-card, .minimap-box, .modal, .modal-backdrop, #banner-notification, input, select'
      );
    };

    const onJoyStart = (clientX, clientY) => {
      audioManager.ensureContext();
      const rect = container.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      base.style.left = `${localX}px`;
      base.style.top = `${localY}px`;
      base.classList.add('active');

      this.joystick.startX = clientX;
      this.joystick.startY = clientY;
      this.joystick.active = true;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      this.joystick.distance = 0;
      thumb.style.transform = 'translate(0px, 0px)';
    };

    const onJoyMove = (clientX, clientY) => {
      if (!this.joystick.active) return;
      let dx = clientX - this.joystick.startX;
      let dy = clientY - this.joystick.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > this.joystick.maxDist) {
        dx = (dx / dist) * this.joystick.maxDist;
        dy = (dy / dist) * this.joystick.maxDist;
      }

      this.joystick.dx = dx / this.joystick.maxDist;
      this.joystick.dy = dy / this.joystick.maxDist;
      this.joystick.distance = dist;

      thumb.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const onJoyEnd = () => {
      this.joystick.active = false;
      this.joystick.identifier = null;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      this.joystick.distance = 0;
      thumb.style.transform = 'translate(0px, 0px)';
      base.classList.remove('active');
    };

    container.addEventListener('touchstart', (e) => {
      if (this.joystick.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (!isInteractiveUI(touch.target)) {
          e.preventDefault();
          this.joystick.identifier = touch.identifier;
          onJoyStart(touch.clientX, touch.clientY);
          break;
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.joystick.active) return;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.joystick.identifier) {
          onJoyMove(e.touches[i].clientX, e.touches[i].clientY);
          break;
        }
      }
    }, { passive: false });

    const handleTouchEnd = (e) => {
      if (!this.joystick.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystick.identifier) {
          onJoyEnd();
          break;
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    container.addEventListener('mousedown', (e) => {
      if (this.joystick.active) return;
      if (e.button !== 0) return;
      if (!isInteractiveUI(e.target)) {
        this.joystick.identifier = null;
        onJoyStart(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.joystick.active && this.joystick.identifier === null) {
        onJoyMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.joystick.active && this.joystick.identifier === null) {
        onJoyEnd();
      }
    });
  }

  setupUI() {
    this.dom = {
      hpFill: document.getElementById('hp-fill'),
      hpCur: document.getElementById('ui-hp-cur'),
      hpMax: document.getElementById('ui-hp-max'),
      mpFill: document.getElementById('mp-fill'),
      mpCur: document.getElementById('ui-mp-cur'),
      mpMax: document.getElementById('ui-mp-max'),
      expFill: document.getElementById('exp-fill'),
      expCur: document.getElementById('ui-exp-cur'),
      expMax: document.getElementById('ui-exp-max'),
      level: document.getElementById('ui-level'),
      power: document.getElementById('ui-power'),
      questCur: document.getElementById('quest-cur'),
      questTarget: document.getElementById('quest-target'),
      questDesc: document.getElementById('quest-desc'),
      mapName: document.getElementById('ui-map-name'),
      cdOverlays: [null, document.getElementById('cd-1'), document.getElementById('cd-2'), document.getElementById('cd-3'), document.getElementById('cd-4')],
      cdTexts: [null, document.getElementById('cd-text-1'), document.getElementById('cd-text-2'), document.getElementById('cd-text-3'), document.getElementById('cd-text-4')],
      slotIcons: [null, document.getElementById('slot-icon-1'), document.getElementById('slot-icon-2'), document.getElementById('slot-icon-3'), document.getElementById('slot-icon-4')],
      mpCosts: [null, document.getElementById('mp-cost-1'), document.getElementById('mp-cost-2'), document.getElementById('mp-cost-3'), document.getElementById('mp-cost-4')]
    };

    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.onclick = fn;
    };
    bindClick('nav-character', () => ui.openMainModal('character'));
    bindClick('nav-bag', () => ui.openMainModal('bag'));
    bindClick('btn-bag', () => ui.openMainModal('bag'));
    bindClick('nav-skills', () => ui.openMainModal('skills'));
    bindClick('btn-skills', () => ui.openMainModal('skills'));
    bindClick('nav-menu', () => ui.openMainModal('menu'));
    bindClick('nav-settings', () => ui.openMainModal('settings'));
    bindClick('btn-settings', () => ui.openMainModal('settings'));
    bindClick('btn-world-map', () => ui.openModal('modal-world-map'));
    bindClick('minimap-toggle', () => ui.openModal('modal-world-map'));

    this.loadSettings();

    const chkSound = document.getElementById('setting-sound');
    const chkBgm = document.getElementById('setting-bgm');
    const chkShake = document.getElementById('setting-shake');
    const chkDmg = document.getElementById('setting-damage-num');

    if (chkSound) chkSound.checked = audioManager.soundEnabled;
    if (chkBgm) chkBgm.checked = audioManager.bgmEnabled;
    if (chkShake) chkShake.checked = this.screenShakeEnabled;
    if (chkDmg) chkDmg.checked = this.showDamageNumbers;

    if (chkSound) chkSound.onchange = () => {
      audioManager.toggleSound(chkSound.checked);
      this.saveSettings();
    };
    if (chkBgm) chkBgm.onchange = () => {
      audioManager.toggleBGM(chkBgm.checked);
      this.saveSettings();
    };
    if (chkShake) chkShake.onchange = () => {
      this.screenShakeEnabled = chkShake.checked;
      this.saveSettings();
    };
    if (chkDmg) chkDmg.onchange = () => {
      this.showDamageNumbers = chkDmg.checked;
      this.saveSettings();
    };

    if (window.ui) {
      window.ui.setupSkillSlotInteractions();
      window.ui.updateSkillSlotsDisplay();
    }

    this.recalcStats();
    this.updateHUD(true);
    if (window.ui) {
      window.ui.renderBagGrid();
      window.ui.renderSkillsList();
    }
  }

  saveSettings() {
    try {
      const data = {
        sound: audioManager.soundEnabled,
        bgm: audioManager.bgmEnabled,
        shake: this.screenShakeEnabled,
        damageNum: this.showDamageNumbers,
        slots: this.slotAssignments
      };
      localStorage.setItem('tvkk_settings', JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem('tvkk_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.sound === 'boolean') audioManager.soundEnabled = s.sound;
        if (typeof s.bgm === 'boolean') audioManager.bgmEnabled = s.bgm;
        if (typeof s.shake === 'boolean') this.screenShakeEnabled = s.shake;
        if (typeof s.damageNum === 'boolean') this.showDamageNumbers = s.damageNum;
        if (s.slots && typeof s.slots === 'object') {
          for (let slot = 1; slot <= 4; slot++) {
            if (s.slots[slot] && this.allSkills[s.slots[slot]]) {
              this.slotAssignments[slot] = s.slots[slot];
            }
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
  }

  // Delegation helpers to modules
  castSkill(slot) { this.skills.castSkill(slot); }
  doAttack() { this.skills.doAttack(); }
  assignSkillToSlot(slot, id) { this.skills.assignSkillToSlot(slot, id); }
  teleportToMap(id) { this.mapManager.teleportToMap(id); }
  switchMap(id, x, y) { this.mapManager.switchMap(id, x, y); }
  damageEnemy(e, d, c, kx, ky) { this.enemyManager.damageEnemy(e, d, c, kx, ky); }
  damagePlayer(d) { this.playerManager.damagePlayer(d); }
  recalcStats() { this.playerManager.recalcStats(); }
  usePotionFromInventory(id, idx) { this.playerManager.usePotionFromInventory(id, idx); }
  equipItemFromInventory(idx) { this.playerManager.equipItemFromInventory(idx); }
  unequipItem(slot) { this.playerManager.unequipItem(slot); }
  upgradeEquipped(slot) { this.playerManager.upgradeEquipped(slot); }
  upgradeWeapon() { this.playerManager.upgradeEquipped('weapon'); }

  usePotion() {
    const idx = this.player.inventory?.findIndex(x => x && x.id === 'potion_hp');
    if (idx !== undefined && idx !== -1) {
      this.usePotionFromInventory('potion_hp', idx);
    } else if (this.player.potions > 0) {
      this.player.potions--;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 200);
      if (window.audioManager) audioManager.playLevelUp();
      this.showBanner('SỬ DỤNG HUYẾT ĐAN (+200 HP)');
      this.updateHUD();
    } else {
      this.showBanner('TRONG TÚI ĐÃ HẾT HUYẾT ĐAN!');
    }
  }

  useMpPotion() {
    const idx = this.player.inventory?.findIndex(x => x && x.id === 'potion_mp');
    if (idx !== undefined && idx !== -1) {
      this.usePotionFromInventory('potion_mp', idx);
    } else if (this.player.mpPotions > 0) {
      this.player.mpPotions--;
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + 150);
      if (window.audioManager) audioManager.playLevelUp();
      this.showBanner('SỬ DỤNG TỤ KHÍ ĐAN (+150 MP)');
      this.updateHUD();
    } else {
      this.showBanner('TRONG TÚI ĐÃ HẾT TỤ KHÍ ĐAN!');
    }
  }

  triggerShake(magnitude = 5) {
    if (!this.screenShakeEnabled) return;
    this.screenShake = Math.max(this.screenShake, magnitude);
  }

  showBanner(text) {
    const banner = document.getElementById('banner-notification');
    const bannerText = document.getElementById('banner-text');
    if (!banner || !bannerText) return;
    if (this.bannerTimeout) {
      clearTimeout(this.bannerTimeout);
      this.bannerTimeout = null;
    }
    bannerText.innerText = text;
    banner.classList.add('show');
    this.bannerTimeout = setTimeout(() => {
      banner.classList.remove('show');
      this.bannerTimeout = null;
    }, 2200);
  }

  toggleAuto() {
    this.autoCombat = !this.autoCombat;
    this.autoTarget = null;
    this.autoCombatTimer = 0;
    const btn = document.getElementById('btn-auto') || document.getElementById('btn-auto-toggle');
    if (btn) {
      const textEl = btn.querySelector('.auto-text') || btn;
      if (this.autoCombat) {
        btn.classList.add('active');
        if (textEl) textEl.innerText = 'Auto ON';
        this.showBanner('⚔️ CHẾ ĐỘ TỰ ĐỘNG CHIẾN ĐẤU: ĐANG BẬT');
        if (window.audioManager) {
          audioManager.ensureContext();
          audioManager.playLevelUp();
        }
      } else {
        btn.classList.remove('active');
        if (textEl) textEl.innerText = 'Auto';
        this.showBanner('⏸️ CHẾ ĐỘ TỰ ĐỘNG CHIẾN ĐẤU: ĐÃ TẮT');
      }
    }
  }

  // =========================================
  // AUTO-COMBAT AI ENGINE
  // =========================================
  updateAutoAI(dt) {
    if (!this.autoCombat) return { moveX: 0, moveY: 0 };

    const p = this.player;
    if (p.hp <= 0) return { moveX: 0, moveY: 0 };

    // 1. Tự động dùng Huyết Đan & Tụ Khí Đan khi máu / mana thấp
    if (this.autoPotionTimer <= 0) {
      if (p.hp < p.maxHp * 0.45) {
        this.usePotion();
        this.autoPotionTimer = 1.6;
      } else if (p.mp < p.maxMp * 0.25) {
        this.useMpPotion();
        this.autoPotionTimer = 1.6;
      }
    }

    // 2. Logic chọn mục tiêu gần nhất còn sống (Target Acquisition)
    let target = this.autoTarget;
    if (!target || target.hp <= 0) {
      target = null;
      let minDist = Infinity;
      for (let enemy of this.enemies) {
        if (enemy.hp <= 0) continue;
        const d = Math.hypot(enemy.x - p.x, enemy.y - p.y);
        if (d < minDist) {
          minDist = d;
          target = enemy;
        }
      }
      this.autoTarget = target;
    }

    if (!target) {
      return { moveX: 0, moveY: 0 };
    }

    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);

    // Cập nhật hướng mặt nhân vật quay chuẩn xác về phía mục tiêu
    if (dx !== 0) p.facing = dx > 0 ? 1 : -1;

    // 3. Tầm xuất chiêu chuẩn của từng kỹ năng
    const skillRanges = {
      'kiem_tran': 220,
      'loi_dinh': 190,
      'kiem_khi': 260,
      'phi_kiem': 260,
      'normal_attack': 110
    };

    // 4. Nếu đang trong hoạt ảnh xuất chiêu hoặc chờ hồi nhịp đánh: ĐỨNG YÊN TẠI CHỖ, KHÔNG TIẾP CẬN
    if (p.isAttacking || this.autoCombatTimer > 0) {
      return { moveX: 0, moveY: 0 };
    }

    // 5. Kiểm tra xem có chiêu thức nào đã sẵn sàng và ĐỦ TẦM THI TRIỂN tại vị trí hiện tại không
    // Ưu tiên: Chiêu 4 (Kiếm Trận) -> Chiêu 3 (Lôi Đình) -> Chiêu 2 (Phi Kiếm / Kiếm Khí) -> Chiêu 1 (Đánh Thường)
    let readySkillSlot = null;
    for (let slot = 4; slot >= 1; slot--) {
      const skillId = this.slotAssignments ? this.slotAssignments[slot] : null;
      if (!skillId) continue;
      const s = this.allSkills ? this.allSkills[skillId] : null;
      if (!s) continue;
      const range = skillRanges[skillId] || 110;

      if (s.curCd <= 0 && p.mp >= s.mp && dist <= range) {
        readySkillSlot = slot;
        break;
      }
    }

    // Đang ở khoảng cách đủ thi triển skill: Đứng tại đó thi triển skill luôn, không cần tiếp cận lại!
    if (readySkillSlot !== null) {
      this.castSkill(readySkillSlot);
      const aspd = p.attackSpeed || 1.25;
      this.autoCombatTimer = readySkillSlot === 1 ? (0.35 / aspd) : (0.45 / aspd);
      return { moveX: 0, moveY: 0 };
    }

    // 6. Nếu chưa đủ tầm thi triển: xác định cự ly tối thiểu cần tiếp cận
    // Chỉ cần tiếp cận vừa đủ tầm rìa của skill sẵn sàng tốt nhất, KHÔNG cần áp sát 90px nếu có skill tầm xa!
    let desiredDist = 90;
    for (let slot = 4; slot >= 1; slot--) {
      const skillId = this.slotAssignments ? this.slotAssignments[slot] : null;
      if (!skillId) continue;
      const s = this.allSkills ? this.allSkills[skillId] : null;
      if (!s) continue;
      const range = skillRanges[skillId] || 110;

      // Nếu skill đã hồi hoặc sắp hồi trong nháy mắt (< 0.5s) và đủ mana
      if (s.curCd <= 0.5 && p.mp >= s.mp) {
        if (range - 20 > desiredDist) {
          desiredDist = Math.max(70, range - 20);
        }
      }
    }

    // 7. Di chuyển tiếp cận nếu còn ở ngoài tầm thi triển
    if (dist > desiredDist) {
      return {
        moveX: dx / dist,
        moveY: dy / dist
      };
    }

    // Đã nằm trong cự ly chuẩn của kỹ năng (chờ hồi chiêu tích tắc hoặc chờ thi triển): Đứng yên tại chỗ
    return { moveX: 0, moveY: 0 };
  }

  updateHUD(force = false) {
    if (!this.dom || !this.dom.hpFill) return;

    const hpCur = Math.floor(this.player.hp);
    if (force || this._lastHp !== hpCur) {
      this._lastHp = hpCur;
      const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
      this.dom.hpFill.style.width = `${hpPct}%`;
      this.dom.hpCur.innerText = hpCur;
      this.dom.hpMax.innerText = this.player.maxHp;
    }

    const mpCur = Math.floor(this.player.mp);
    if (force || this._lastMp !== mpCur) {
      this._lastMp = mpCur;
      const mpPct = Math.max(0, (this.player.mp / this.player.maxMp) * 100);
      this.dom.mpFill.style.width = `${mpPct}%`;
      this.dom.mpCur.innerText = mpCur;
      this.dom.mpMax.innerText = this.player.maxMp;
    }

    const expCur = Math.floor(this.player.exp || 0);
    const expMax = this.player.maxExp || 1000;
    if (force || this._lastExp !== expCur || this._lastMaxExp !== expMax) {
      this._lastExp = expCur;
      this._lastMaxExp = expMax;
      const expPct = Math.max(0, Math.min(100, (expCur / expMax) * 100));
      if (this.dom.expFill) this.dom.expFill.style.width = `${expPct}%`;
      if (this.dom.expCur) this.dom.expCur.innerText = expCur.toLocaleString();
      if (this.dom.expMax) this.dom.expMax.innerText = expMax.toLocaleString();
    }

    if (force || this._lastLevel !== this.player.level) {
      this._lastLevel = this.player.level;
      if (this.dom.level) this.dom.level.innerText = this.player.level;
    }
    if (force || this._lastPower !== this.player.power) {
      this._lastPower = this.player.power;
      if (this.dom.power) this.dom.power.innerText = this.player.power;
    }

    if (force || this._lastQuestCur !== this.quest.cur) {
      this._lastQuestCur = this.quest.cur;
      if (this.dom.questCur) this.dom.questCur.innerText = Math.min(this.quest.target, this.quest.cur);
      if (this.dom.questTarget) this.dom.questTarget.innerText = this.quest.target;
      if (this.dom.questDesc) this.dom.questDesc.innerText = this.quest.desc;
    }

    for (let id = 1; id <= 4; id++) {
      const skillId = this.slotAssignments ? this.slotAssignments[id] : null;
      const s = skillId ? this.allSkills[skillId] : null;
      const cdOverlay = this.dom.cdOverlays[id];
      const cdText = this.dom.cdTexts[id];
      if (!cdOverlay || !cdText || !s) continue;
      if (s.curCd > 0) {
        const scale = s.cd > 0 ? (s.curCd / s.cd) : 0;
        cdOverlay.style.transform = `scaleY(${scale})`;
        cdText.innerText = s.curCd.toFixed(1);
      } else {
        if (cdOverlay.style.transform !== 'scaleY(0)') {
          cdOverlay.style.transform = 'scaleY(0)';
          cdText.innerText = '';
        }
      }
    }
  }

  completeQuest() {
    // 1. Nhận thưởng nhiệm vụ
    const rewardExp = 1000;
    const rewardCoins = 500;
    const rewardPotions = 3;

    this.player.coins += rewardCoins;
    this.playerManager.addExp(rewardExp);
    this.player.potions += rewardPotions;

    // 2. Chuyển sang nhiệm vụ mới liền mạch ngay lập tức (KHÔNG DỪNG GAME)
    this.quest.cur = 0;
    this.quest.target = Math.max(10, Math.floor(this.quest.target * 1.35));
    this.quest.completed = false;
    this.quest.bossSpawned = false;
    this.updateHUD(true);

    if (window.audioManager) {
      window.audioManager.playLevelUp();
    }

    // 3. Hiệu ứng viền sáng hào quang trên thẻ nhiệm vụ
    const questCard = document.getElementById('quest-card');
    if (questCard) {
      questCard.classList.remove('quest-cleared');
      void questCard.offsetWidth; // trigger reflow
      questCard.classList.add('quest-cleared');
      setTimeout(() => questCard.classList.remove('quest-cleared'), 1400);
    }

    // 4. Hiển thị thông báo hoàn thành đơn giản dạng Toast HUD (không che khuất, không dừng Game)
    this.showQuestToast({
      title: '⚔️ HOÀN THÀNH NHIỆM VỤ! ⚔️',
      desc: 'Quét sạch yêu thú ngoại ô - Nhận thưởng thành công!',
      exp: `+${rewardExp.toLocaleString()} EXP`,
      coins: `+${rewardCoins} Vàng`,
      potions: `+${rewardPotions} Huyết Đan`
    });

    if (window.ui) {
      window.ui.renderBagGrid();
    }
  }

  nextQuest() {
    this.completeQuest();
  }

  showQuestToast(info) {
    const toast = document.getElementById('quest-toast-hud');
    if (!toast) {
      this.showBanner(`${info.title} (${info.exp} • ${info.coins} • ${info.potions})`);
      return;
    }
    const descEl = document.getElementById('quest-toast-desc');
    const pillsEl = document.getElementById('quest-toast-pills');
    if (descEl && info.desc) descEl.innerText = info.desc;
    if (pillsEl) {
      pillsEl.innerHTML = `
        <div class="q-pill q-exp">${info.exp}</div>
        <div class="q-pill q-gold">${info.coins}</div>
        <div class="q-pill q-pot">${info.potions}</div>
      `;
    }

    if (this.questToastTimeout) {
      clearTimeout(this.questToastTimeout);
      this.questToastTimeout = null;
    }

    toast.classList.add('show');
    this.questToastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      this.questToastTimeout = null;
    }, 2800);
  }

  // =========================================
  // MAIN LOOP
  // =========================================
  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    if (this.isRunning && !this.isPaused) {
      this.update(dt);
      this.render();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const p = this.player;

    if (p.attackCooldown > 0) p.attackCooldown -= dt;

    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer -= dt;
      if (p.invulnerableTimer <= 0) p.invulnerable = false;
    }

    if (this.autoCombatTimer > 0) this.autoCombatTimer -= dt;
    if (this.autoPotionTimer > 0) this.autoPotionTimer -= dt;

    if (p.isAttacking) {
      p.attackAnimTimer -= dt;
      p.vx = 0;
      p.vy = 0;
      if (p.attackAnimTimer <= 0) {
        p.isAttacking = false;
      }
    } else {
      let moveX = 0;
      let moveY = 0;

      if (this.joystick.active) {
        moveX = this.joystick.dx;
        moveY = this.joystick.dy;
      } else {
        if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
        if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
        if (this.keys['d'] || this.keys['arrowright']) moveX += 1;
      }

      // Điều khiển chiến đấu tự động khi người chơi không tác động phím hoặc joystick
      if (this.autoCombat && moveX === 0 && moveY === 0) {
        try {
          const autoMove = this.updateAutoAI(dt);
          if (autoMove) {
            moveX = autoMove.moveX || 0;
            moveY = autoMove.moveY || 0;
          }
        } catch (autoErr) {
          console.error("Auto Combat Error:", autoErr);
        }
      }

      const moveLen = Math.hypot(moveX, moveY);
      if (moveLen > 0.05) {
        p.vx = (moveX / (moveLen > 1 ? moveLen : 1)) * p.speed;
        p.vy = (moveY / (moveLen > 1 ? moveLen : 1)) * p.speed;
        if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;
        p.animationTime += dt;
      } else {
        p.vx = 0;
        p.vy = 0;
        p.animationTime += dt * 0.4;
      }
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    p.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, p.x));
    p.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, p.y));

    // Check portals
    this.mapManager.checkPortalCollision();

    // Subsystem Updates
    this.skills.update(dt);
    this.enemyManager.updateEnemies(dt);

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += (pt.vx || 0) * dt;
      pt.y += (pt.vy || 0) * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    if (this.particles.length > 70) {
      this.particles.splice(0, this.particles.length - 70);
    }

    // Update Damage Numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.life -= dt;
      if (d.life <= 0) this.damageNumbers.splice(i, 1);
    }

    // Update After-images
    for (let i = this.afterImages.length - 1; i >= 0; i--) {
      const img = this.afterImages[i];
      img.life -= dt;
      img.alpha = img.life / 0.35;
      if (img.life <= 0) this.afterImages.splice(i, 1);
    }

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Camera follow smoothly & cố định vừa vặn chiều rộng bản đồ
    const visibleW = this.width / this.camera.zoom;
    const visibleH = this.height / this.camera.zoom;
    const drawHeight = Math.max(this.worldHeight, visibleH);
    const maxCamX = Math.max(0, this.worldWidth - visibleW);
    const maxCamY = Math.max(0, drawHeight - visibleH);

    const targetCamX = Math.max(0, Math.min(maxCamX, p.x - visibleW * 0.5));
    const targetCamY = Math.max(0, Math.min(maxCamY, p.y - visibleH * 0.52));
    this.camera.x += (targetCamX - this.camera.x) * 0.14;
    this.camera.y += (targetCamY - this.camera.y) * 0.14;

    this.updateHUD();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
    }

    this.ctx.save();
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-Math.round(this.camera.x) + shakeX, -Math.round(this.camera.y) + shakeY);

    // 1. Render Background
    const curMap = this.mapManager.getCurrentMap();
    const bgSprite = spriteManager.get(curMap.bgKey) || spriteManager.get('map_thanh_van_thon') || spriteManager.get('battle_bg');
    const drawH = Math.max(this.worldHeight, this.height / this.camera.zoom);
    if (bgSprite) {
      this.ctx.drawImage(bgSprite, 0, 0, this.worldWidth, drawH);
    } else {
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(0, 0, this.worldWidth, drawH);
    }

    // 1.1 Portals
    this.mapManager.renderPortals(this.ctx);

    // 2. Sword Array (Skill 4)
    this.skills.renderSwordArrays(this.ctx);

    // 3. Render Entities (Player & Enemies sorted by Y for 2.5D depth)
    const entities = [
      { type: 'player', y: this.player.y, obj: this.player },
      ...this.enemies.filter(e => e.hp > 0).map(e => ({ type: 'enemy', y: e.y, obj: e }))
    ].sort((a, b) => a.y - b.y);

    entities.forEach(ent => {
      if (ent.type === 'player') {
        this.playerManager.renderPlayer(this.ctx);
      } else {
        this.enemyManager.renderEnemy(this.ctx, ent.obj);
      }
    });

    // 4. Projectiles
    this.skills.renderProjectiles(this.ctx);

    // 5. Slash Arc Effects
    this.skills.renderSlashEffects(this.ctx);

    // 5.1 Lightning Strikes (Skill 3)
    this.skills.renderLightningStrikes(this.ctx);

    // 6. Particles
    this.enemyManager.renderParticles(this.ctx);

    // 7. Damage Numbers
    this.enemyManager.renderDamageNumbers(this.ctx);

    this.ctx.restore();

    // 8. Minimap
    this.mapManager.renderMinimap(this.minimapCtx);
  }
}

window.Game = Game;
let game = null;

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  game = window.game;
});

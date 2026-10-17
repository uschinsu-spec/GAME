// ============================================================================
// THANH VÂN KIẾM KHÁCH - HỆ THỐNG GIAO DIỆN & MODAL (UI SYSTEM)
// ============================================================================

class UIManager {
  constructor() {
    this.currentSelectSlot = 1;
    this.selectedAtlasMapId = null;
  }

  openModal(modalId) {
    if (modalId === 'modal-bag') return this.openMainModal('bag');
    if (modalId === 'modal-character') return this.openMainModal('character');
    if (modalId === 'modal-skills') return this.openMainModal('skills');
    if (modalId === 'modal-settings') return this.openMainModal('settings');
    if (modalId === 'modal-menu') return this.openMainModal('menu');
    if (modalId === 'modal-quest-complete') {
      if (window.game && typeof window.game.completeQuest === 'function') {
        window.game.completeQuest();
      }
      return;
    }

    this.closeModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
    if (window.game) window.game.isPaused = true;
    if (modalId === 'modal-world-map') this.renderWorldMapGrid();
    if (modalId === 'modal-skill-select') this.renderSkillSelectList(this.currentSelectSlot || 1);
    this.updateModalStats();
  }

  openMainModal(tab = 'bag') {
    this.closeModals();
    const modal = document.getElementById('modal-bag');
    if (modal) modal.classList.add('open');
    if (window.game) window.game.isPaused = true;
    this.switchMainTab(tab);
  }

  switchMainTab(tab) {
    this.currentMainTab = tab;
    // 1. Update Panes
    document.querySelectorAll('.unified-tab-pane').forEach(p => p.classList.remove('active'));
    const targetPane = document.getElementById(`tab-pane-${tab}`);
    if (targetPane) targetPane.classList.add('active');

    // 2. Update Header Title
    const titleEl = document.getElementById('unified-modal-title');
    const titles = {
      character: 'THÔNG TIN NHÂN VẬT',
      bag: 'TÚI ĐỒ & TRANG BỊ',
      skills: 'BÍ KỊP VÕ CÔNG',
      menu: 'MENU HỆ THỐNG',
      settings: 'CÀI ĐẶT TRÒ CHƠI'
    };
    if (titleEl) titleEl.innerText = titles[tab] || 'TÚI ĐỒ & TRANG BỊ';

    // 3. Update Nav items
    const navTabs = ['character', 'bag', 'skills', 'menu', 'settings'];
    navTabs.forEach(t => {
      const item = document.getElementById(`nav-item-${t}`);
      const img = document.getElementById(`nav-img-${t}`);
      const lbl = document.getElementById(`nav-lbl-${t}`);
      const isActive = (t === tab);
      if (item) item.classList.toggle('active', isActive);
      if (img) img.classList.toggle('nav-btn-active', isActive);
      if (lbl) lbl.classList.toggle('active-lbl', isActive);
    });

    // 4. Update data for active tab
    if (tab === 'bag') {
      this.renderBagGrid();
    } else if (tab === 'character') {
      this.updateModalStats();
      this.renderCharacterQuickEquip();
    } else if (tab === 'skills') {
      this.renderSkillsTabList();
    } else if (tab === 'settings') {
      this.syncSettingsUI();
    }
  }

  renderCharacterQuickEquip() {
    const row = document.getElementById('char-quick-equip-row');
    if (!row || !window.game || !window.game.player) return;
    row.innerHTML = '';
    const equipped = window.game.player.equipped || {};
    const slots = ['weapon', 'armor', 'pants', 'boots', 'belt', 'helmet', 'amulet', 'ring'];
    const placeholders = {
      weapon: 'assets/items/item_sword.png',
      armor: 'assets/items/item_armor.png',
      pants: 'assets/items/item_pants.png',
      boots: 'assets/items/item_boots.png',
      belt: 'assets/items/item_belt.png',
      helmet: 'assets/items/item_helmet.png',
      amulet: 'assets/items/item_necklace.png',
      ring: 'assets/items/item_ring.png'
    };

    slots.forEach(slotKey => {
      const item = equipped[slotKey];
      const div = document.createElement('div');
      div.className = `quick-equip-chip quality-${item ? item.quality || 'common' : 'common'}`;
      div.title = item ? `${item.name} (+${item.level || 0})` : 'Chưa trang bị';
      div.onclick = () => {
        if (item) this.showItemDetail(item, 'equipped', slotKey);
        else this.switchMainTab('bag');
      };
      const iconSrc = item ? item.icon : placeholders[slotKey];
      div.innerHTML = `
        <img src="${iconSrc}" alt="${slotKey}" style="${!item ? 'opacity:0.3; filter:grayscale(1);' : ''}">
        ${item && item.level ? `<span class="chip-level">+${item.level}</span>` : ''}
      `;
      row.appendChild(div);
    });
  }

  renderSkillsTabList() {
    const container = document.getElementById('skills-tab-list-container');
    if (!container || !window.game) return;
    container.innerHTML = '';
    const allSkills = (window.game.skillManager && window.game.skillManager.allSkills) || window.game.allSkills || ALL_SKILLS;
    const assignments = (window.game.skillManager && window.game.skillManager.slotAssignments) || window.game.slotAssignments || {};

    const p = window.game.player;
    const elSp = document.getElementById('skills-sp-val');
    if (elSp) elSp.innerText = `${p.skillPoints !== undefined ? p.skillPoints : 3} SP`;

    for (let skillId in allSkills) {
      const s = allSkills[skillId];
      let equippedInSlot = null;
      for (let sl = 1; sl <= 4; sl++) {
        if (assignments[sl] === skillId) {
          equippedInSlot = sl;
          break;
        }
      }

      const isLocked = s.reqLv && (p.level || 1) < s.reqLv;
      const card = document.createElement('div');
      card.className = `skill-tab-card ${equippedInSlot ? 'equipped-active' : ''} ${isLocked ? 'skill-card-locked' : ''}`;

      const cdText = skillId === 'normal_attack'
        ? 'Không hồi chiêu'
        : (skillId === 'phi_kiem'
           ? `${(1.0 / (p.attackSpeed || 1.25)).toFixed(2)}s`
           : `${s.cd}s`);

      const mpText = s.mp > 0 ? `${s.mp} MP` : '0 MP';
      const upgradeCost = (s.level || 1) * 250;

      card.innerHTML = `
        <div class="skill-tab-icon" style="${isLocked ? 'filter:grayscale(100%); opacity:0.5;' : ''}">
          <img src="${s.icon}" alt="${s.name}">
        </div>
        <div class="skill-tab-info">
          <div class="skill-tab-name-row">
            <span class="skill-tab-name">${s.name}</span>
            <span class="skill-tab-level">Lv.${s.level || 1}</span>
            <span class="skill-tab-sub">${s.subName || 'Bí Kíp'}</span>
            ${equippedInSlot ? `<span class="equipped-slot-tag" style="position:static; margin-left:4px;">Ô ${equippedInSlot}</span>` : ''}
            ${isLocked ? `<span class="equipped-slot-tag" style="position:static; margin-left:4px; background:rgba(239,68,68,0.25); border-color:#ef4444; color:#fca5a5;">🔒 Cần Cấp ${s.reqLv}</span>` : ''}
          </div>
          <div class="skill-tab-desc">${s.desc || ''}</div>
          <div class="skill-tab-stats">
            Hồi chiêu: <b class="val-blue">${cdText}</b> | Tiêu hao: <b class="val-blue">${mpText}</b>
          </div>
        </div>
        <div class="skill-tab-actions">
          ${isLocked 
            ? `<button class="btn-skill-upgrade" style="background:rgba(30,41,59,0.7); border-color:#64748b; color:#94a3b8;" disabled>Chưa Mở Khóa</button>
               <button class="btn-skill-equip" style="background:rgba(30,41,59,0.7); border-color:#64748b; color:#94a3b8;" disabled>🔒 Cần Cấp ${s.reqLv}</button>`
            : `<button class="btn-skill-upgrade" onclick="ui.upgradeSkill('${skillId}')">
                 Nâng Cấp (${upgradeCost.toLocaleString()} Vàng)
               </button>
               ${equippedInSlot 
                 ? `<button class="btn-skill-equip" style="background:rgba(30,41,59,0.8); border-color:#64748b;" disabled>Đang Dùng</button>`
                 : `<button class="btn-skill-equip" onclick="ui.openSkillSelectModal(2)">Gán Phím</button>`
               }`
          }
        </div>
      `;
      container.appendChild(card);
    }
  }

  upgradeSkill(skillId) {
    if (!window.game || !window.game.player) return;
    const p = window.game.player;
    const allSkills = (window.game.skillManager && window.game.skillManager.allSkills) || window.game.allSkills || ALL_SKILLS;
    const s = allSkills[skillId];
    if (!s) return;
    const cost = (s.level || 1) * 250;
    if ((p.coins || 0) < cost) {
      if (window.game.showBanner) window.game.showBanner('KHÔNG ĐỦ VÀNG ĐỂ NÂNG CẤP KỸ NĂNG!');
      return;
    }
    p.coins -= cost;
    if (window.game.skillManager && typeof window.game.skillManager.upgradeSkill === 'function') {
      window.game.skillManager.upgradeSkill(skillId);
    } else {
      s.level = (s.level || 1) + 1;
      if (window.audioManager) window.audioManager.playLevelUp();
      if (window.game.showBanner) window.game.showBanner(`KỸ NĂNG [${s.name.toUpperCase()}] ĐẠT CẤP ${s.level}!`);
    }
    this.updateModalStats();
    this.renderSkillsTabList();
  }

  syncSettingsUI() {
    if (!window.game) return;
    const soundChk = document.getElementById('setting-sound');
    const bgmChk = document.getElementById('setting-bgm');
    const autoSkillChk = document.getElementById('setting-auto-skill');
    const autoLootChk = document.getElementById('setting-auto-loot');
    const shakeChk = document.getElementById('setting-shake');
    const dmgChk = document.getElementById('setting-damage-num');

    if (soundChk && window.audioManager) soundChk.checked = !window.audioManager.isMuted;
    if (bgmChk && window.audioManager) bgmChk.checked = window.audioManager.bgmEnabled !== false;
    if (autoSkillChk) autoSkillChk.checked = window.game.autoUseSkills !== false;
    if (autoLootChk) autoLootChk.checked = window.game.autoLoot !== false;
    if (shakeChk) shakeChk.checked = window.game.screenShakeEnabled !== false;
    if (dmgChk) dmgChk.checked = window.game.showDamageNumbers !== false;
  }

  onMenuFeatureClick(feature) {
    if (!window.game) return;
    switch (feature) {
      case 'quest':
        if (typeof window.game.onQuestClick === 'function') {
          window.game.onQuestClick();
        } else {
          window.game.showBanner('NHIỆM VỤ: TIÊU DIỆT 10 YÊU QUÁI RỪNG TRÚC (5/10)');
        }
        break;
      case 'dungeon':
        this.openModal('modal-world-map');
        break;
      case 'rank':
        window.game.showBanner('🏆 BẢNG XẾP HẠNG: HẠNG 1 - THANH VÂN KIẾM KHÁCH (8,666 LC)');
        break;
      case 'mail':
        if (window.game.player) {
          window.game.player.coins = (window.game.player.coins || 0) + 1000;
          this.updateModalStats();
          if (window.audioManager) window.audioManager.playCoin();
          window.game.showBanner('📬 ĐÃ NHẬN THƯ HỆ THỐNG: +1,000 VÀNG!');
        }
        break;
      case 'achievement':
        window.game.showBanner('🎖️ THÀNH TỰU: ĐÃ ĐẠT [KIẾM XUẤT PHONG VÂN] (+50 CÔNG KÍCH)');
        break;
      case 'daily':
        if (window.game.player) {
          window.game.player.coins = (window.game.player.coins || 0) + 500;
          this.updateModalStats();
          if (window.audioManager) window.audioManager.playCoin();
          window.game.showBanner('🎁 ĐIỂM DANH THÀNH CÔNG: +500 VÀNG!');
        }
        break;
      case 'giftcode':
        const code = prompt('Nhập mã Giftcode nhận quà tân thủ (Mẹo: nhập VIP999):');
        if (code && code.trim().toUpperCase() === 'VIP999') {
          if (window.game.player) {
            window.game.player.coins = (window.game.player.coins || 0) + 5000;
            this.updateModalStats();
            if (window.audioManager) window.audioManager.playLevelUp();
            window.game.showBanner('🎉 NHẬP MÃ VIP999 THÀNH CÔNG: +5,000 VÀNG!');
          }
        } else if (code) {
          window.game.showBanner('MÃ CODE KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN!');
        }
        break;
      case 'guide':
        alert(
          '🎮 CẨM NANG TU TIÊN & PHÍM TẮT:\n' +
          '• Di chuyển: Phím A/D hoặc Mũi tên trái/phải\n' +
          '• Tấn công thường: Chuột trái / Phím J\n' +
          '• Dùng kỹ năng: Phím 1, 2, 3, 4\n' +
          '• Bật/Tắt Auto chiến đấu: Phím R\n' +
          '• Đổi kỹ năng ô phím: Nhấn giữ vào ô kỹ năng 1-4'
        );
        break;
    }
  }

  promoteHero() {
    if (!window.game || !window.game.player) return;
    const p = window.game.player;
    const cost = Math.max(200, (p.level || 1) * 150);
    if ((p.coins || 0) < cost) {
      window.game.showBanner(`CẦN ${cost.toLocaleString()} VÀNG ĐỂ ĐỘT PHÁ CẢNH GIỚI!`);
      return;
    }
    p.coins -= cost;
    p.level = (p.level || 1) + 1;
    if (window.game.playerManager) {
      window.game.playerManager.recalcStats();
      p.hp = p.maxHp;
      p.mp = p.maxMp;
      p.maxExp = window.game.playerManager.getMaxExpForLevel(p.level);
    }
    if (window.game.skills) {
      window.game.skills.checkUnlockSkills(true);
    }
    if (window.audioManager) window.audioManager.playLevelUp();
    window.game.showBanner(`🔥 ĐỘT PHÁ THÀNH CÔNG! ĐẠT CẤP ${p.level} (${p.power.toLocaleString()} LỰC CHIẾN)`);
    this.updateModalStats();
    if (window.game) window.game.updateHUD(true);
  }

  resetPlayerStats() {
    if (window.game && window.game.playerManager) {
      window.game.playerManager.recalcStats();
      window.game.showBanner('ĐÃ TẨY ĐIỂM THUỘC TÍNH! THIẾT LẬP LẠI CHỈ SỐ CHUẨN.');
      this.updateModalStats();
    }
  }

  autoAllocateStats() {
    if (!window.game || !window.game.player) return;
    if (window.game.playerManager) {
      window.game.playerManager.recalcStats();
    }
    if (window.audioManager) window.audioManager.playLevelUp();
    window.game.showBanner('⚡ ĐÃ ĐỒNG BỘ & TỐI ƯU HÓA CHỈ SỐ CÔNG & THỦ!');
    this.updateModalStats();
    if (window.game) window.game.updateHUD(true);
  }

  saveGameData() {
    if (window.game && typeof window.game.saveSettings === 'function') {
      window.game.saveSettings();
    }
    if (window.game && window.game.showBanner) {
      window.game.showBanner('💾 ĐÃ LƯU DỮ LIỆU TRÒ CHƠI THÀNH CÔNG!');
    }
  }

  resetGameData() {
    if (confirm('Bạn có chắc chắn muốn chơi lại từ đầu không? Mọi dữ liệu sẽ được thiết lập lại.')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    if (window.game) window.game.isPaused = false;
  }

  openCharacterModal() {
    this.openMainModal('character');
  }

  closeItemDetail() {
    const modal = document.getElementById('modal-item-detail');
    if (modal) modal.classList.remove('open');
  }

  showItemDetail(item, source, key) {
    if (!item) return;
    const modal = document.getElementById('modal-item-detail');
    if (!modal) return;

    const elTitle = document.getElementById('item-detail-title');
    const elIcon = document.getElementById('item-detail-icon');
    const elIconWrap = document.getElementById('item-detail-icon-wrap');
    const elName = document.getElementById('item-detail-name');
    const elType = document.getElementById('item-detail-type');
    const elQuality = document.getElementById('item-detail-quality');
    const elStats = document.getElementById('item-detail-stats');
    const elDesc = document.getElementById('item-detail-desc');
    const elActions = document.getElementById('item-detail-actions');

    const qualityNames = {
      common: 'Phổ Thông',
      rare: 'Hiếm',
      epic: 'Cực Phẩm',
      legendary: 'Truyền Thuyết'
    };

    if (elTitle) elTitle.innerText = `THÔNG TIN ${item.type || 'VẬT PHẨM'}`.toUpperCase();
    if (elIcon) elIcon.src = item.icon;
    if (elIconWrap) {
      elIconWrap.className = `item-detail-icon-wrap quality-${item.quality || 'common'}`;
    }
    if (elName) {
      elName.innerText = `${item.name}${item.level ? ` +${item.level}` : ''}`;
    }
    if (elType) elType.innerText = item.type || item.slotName || 'Vật Phẩm';
    if (elQuality) {
      elQuality.innerText = qualityNames[item.quality] || 'Hiếm';
      elQuality.className = `badge-quality quality-${item.quality || 'common'}`;
    }
    if (elStats) {
      let statsText = item.statDesc || '';
      if (!statsText && item.atk) statsText += `+${item.atk} Công Kích `;
      if (!statsText && item.def) statsText += `+${item.def} Phòng Ngự `;
      if (!statsText && item.hp) statsText += `+${item.hp} Sinh Mệnh `;
      elStats.innerText = statsText || 'Không có hiệu ứng thuộc tính';
    }
    if (elDesc) elDesc.innerText = item.desc || 'Vật phẩm tu tiên huyền bí.';

    // Action buttons
    if (elActions) {
      let btns = '';
      if (source === 'equipped') {
        const cost = (item.level || 1) * 150;
        btns = `
          <button class="btn-item-action action-upgrade" onclick="window.game.upgradeEquipped('${key}')">
            Cường Hóa (${cost.toLocaleString()} Vàng)
          </button>
          <button class="btn-item-action action-unequip" onclick="window.game.unequipItem('${key}')">
            Tháo Ra
          </button>
          <button class="btn-item-action action-close" onclick="ui.closeItemDetail()">Đóng</button>
        `;
      } else if (source === 'inventory') {
        if (item.slot) {
          btns += `
            <button class="btn-item-action action-equip" onclick="window.game.equipItemFromInventory(${key})">
              Trang Bị
            </button>
          `;
        } else if (item.id === 'potion_hp' || item.id === 'potion_mp') {
          btns += `
            <button class="btn-item-action action-use" onclick="window.game.usePotionFromInventory('${item.id}', ${key})">
              Sử Dụng
            </button>
          `;
        }
        btns += `<button class="btn-item-action action-close" onclick="ui.closeItemDetail()">Đóng</button>`;
      }
      elActions.innerHTML = btns;
    }

    modal.classList.add('open');
  }

  openSkillSelectModal(slot) {
    const reqLvForSlot = slot === 2 ? 3 : (slot === 3 ? 8 : (slot === 4 ? 12 : 1));
    if (window.game && window.game.player && (window.game.player.level || 1) < reqLvForSlot) {
      if (window.game.showBanner) {
        window.game.showBanner(`Ô KỸ NĂNG ${slot} SẼ MỞ KHÓA TẠI CẤP ${reqLvForSlot}!`);
      }
      return;
    }
    this.closeModals();
    this.currentSelectSlot = slot;
    const modal = document.getElementById('modal-skill-select');
    if (modal) modal.classList.add('open');
    if (window.game) window.game.isPaused = true;
    this.renderSkillSelectList(slot);
  }

  renderSkillSelectList(targetSlot) {
    const title = document.getElementById('skill-select-title');
    if (title) title.innerText = `CHỌN KỸ NĂNG CHO Ô ${targetSlot}`;
    const list = document.getElementById('skill-select-list');
    if (!list || !window.game) return;
    list.innerHTML = '';

    const allSkills = window.game.allSkills || ALL_SKILLS;
    const assignments = window.game.slotAssignments || {};
    const playerLv = window.game.player?.level || 1;

    for (let skillId in allSkills) {
      const s = allSkills[skillId];
      let equippedInSlot = null;
      for (let sl = 1; sl <= 4; sl++) {
        if (assignments[sl] === skillId) {
          equippedInSlot = sl;
          break;
        }
      }

      const isCurrent = (equippedInSlot === targetSlot);
      const isLocked = s.reqLv && playerLv < s.reqLv;
      const div = document.createElement('div');
      div.className = `skill-select-item ${isCurrent ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;

      let actionBtn = '';
      if (isLocked) {
        actionBtn = `<button class="equip-action-btn" style="background:rgba(30,41,59,0.7); border-color:#64748b; color:#94a3b8;" disabled>🔒 Cần Cấp ${s.reqLv}</button>`;
      } else if (isCurrent) {
        actionBtn = `<button class="equip-action-btn active" disabled>Đang Dùng</button>`;
      } else if (equippedInSlot) {
        actionBtn = `<button class="equip-action-btn swap" onclick="window.game.assignSkillToSlot(${targetSlot}, '${skillId}')">Đổi từ Ô ${equippedInSlot}</button>`;
      } else {
        actionBtn = `<button class="equip-action-btn" onclick="window.game.assignSkillToSlot(${targetSlot}, '${skillId}')">Trang Bị</button>`;
      }

      const cdText = skillId === 'normal_attack' 
        ? 'Không có CD' 
        : (skillId === 'phi_kiem' 
           ? `${(1.0 / (window.game.player.attackSpeed || 1.25)).toFixed(2)}s (Theo tốc đánh)` 
           : `${s.cd}s`);

      const mpText = s.mp > 0 ? `${s.mp} MP` : '0 MP';

      div.innerHTML = `
        <div class="skill-select-icon">
          <img src="${s.icon}" alt="${s.name}" class="skill-select-img">
          ${equippedInSlot ? `<span class="equipped-slot-tag">Ô ${equippedInSlot}</span>` : ''}
        </div>
        <div class="skill-select-info">
          <div class="skill-select-name">
            ${s.name} <span class="val-gold">Lv.${s.level}</span>
            <span class="skill-sub-badge">${s.subName}</span>
          </div>
          <div class="skill-select-desc">${s.desc}</div>
          <div class="skill-select-stats">
            Hồi chiêu: <b class="val-blue">${cdText}</b> | Tiêu hao: <b class="val-blue">${mpText}</b>
          </div>
        </div>
        <div class="skill-select-action">
          ${actionBtn}
        </div>
      `;
      list.appendChild(div);
    }
  }

  updateModalStats() {
    if (!window.game) return;
    const p = window.game.player;
    if (!p) return;

    // Both legacy and unified tab elements
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    const powerStr = (p.power || 8666).toLocaleString();
    const hpStr = `${Math.floor(p.hp)} / ${p.maxHp}`;
    const mpStr = `${Math.floor(p.mp)} / ${p.maxMp}`;
    const atkStr = p.atk;
    const defStr = p.def;
    const coinsStr = (p.coins || 0).toLocaleString();
    const levelStr = `Lv.${p.level}`;
    const critStr = `${Math.round((p.critChance || 0.25) * 100)}%`;
    const aspeedStr = `${(p.attackSpeed || 1.25).toFixed(2)} /s`;

    setTxt('char-power-val', powerStr);
    setTxt('modal-stat-power', powerStr);
    setTxt('char-level-badge', levelStr);
    setTxt('modal-stat-level', levelStr);
    setTxt('char-stat-hp', hpStr);
    setTxt('modal-stat-hp', hpStr);
    setTxt('char-stat-mp', mpStr);
    setTxt('modal-stat-mp', mpStr);
    setTxt('char-stat-atk', atkStr);
    setTxt('modal-stat-atk', atkStr);
    setTxt('char-stat-def', defStr);
    setTxt('modal-stat-def', defStr);
    setTxt('char-stat-crit', critStr);
    setTxt('modal-stat-crit', critStr);
    setTxt('char-stat-aspeed', aspeedStr);
    setTxt('modal-stat-aspeed', aspeedStr);
    setTxt('ui-coins', coinsStr);
    setTxt('ui-potions', p.potions);

    const maxExp = p.maxExp || 1000;
    const exp = p.exp !== undefined ? p.exp : 750;
    const pct = Math.min(100, Math.max(0, (exp / maxExp) * 100));
    const expStr = `${exp.toLocaleString()} / ${maxExp.toLocaleString()} EXP (${Math.round(pct)}%)`;

    setTxt('char-tab-exp-text', expStr);
    setTxt('char-exp-text', expStr);

    const elFill1 = document.getElementById('char-tab-exp-fill');
    const elFill2 = document.getElementById('char-exp-fill');
    if (elFill1) elFill1.style.width = `${pct}%`;
    if (elFill2) elFill2.style.width = `${pct}%`;
  }

  renderBagGrid() {
    if (!window.game || !window.game.player) return;
    const p = window.game.player;

    const elBagPower = document.getElementById('modal-bag-power');
    const elCoins = document.getElementById('ui-coins');
    if (elBagPower) elBagPower.innerText = `${p.power ? p.power.toLocaleString() : '8,636'} ⚔️`;
    if (elCoins) elCoins.innerText = (p.coins || 0).toLocaleString();

    // 1. Render 8 Ô Trang Bị (5 Bên Trái, 3 Bên Phải chuẩn 100% Screenshot)
    const slotConfigs = [
      { key: 'weapon', label: 'Vũ Khí', placeholder: 'assets/items/item_sword.png' },
      { key: 'armor', label: 'Áo Giáp', placeholder: 'assets/items/item_armor.png' },
      { key: 'pants', label: 'Quần', placeholder: 'assets/items/item_pants.png' },
      { key: 'boots', label: 'Giày', placeholder: 'assets/items/item_boots.png' },
      { key: 'belt', label: 'Thắt Lưng', placeholder: 'assets/items/item_belt.png' },
      { key: 'helmet', label: 'Nón', placeholder: 'assets/items/item_helmet.png' },
      { key: 'amulet', label: 'Dây Chuyền', placeholder: 'assets/items/item_necklace.png' },
      { key: 'ring', label: 'Nhẫn', placeholder: 'assets/items/item_ring.png' }
    ];

    slotConfigs.forEach(cfg => {
      const el = document.getElementById(`equip-slot-${cfg.key}`);
      if (!el) return;
      const item = p.equipped ? p.equipped[cfg.key] : null;
      if (item) {
        const enhanceBadge = (item.level && item.level > 0) ? `<span class="equip-enhance-badge">+${item.level}</span>` : '';
        el.innerHTML = `
          <img src="${item.icon}" alt="${item.name}" class="equip-card-icon">
          ${enhanceBadge}
        `;
        el.onclick = () => ui.showItemDetail(window.game.player.equipped[cfg.key], 'equipped', cfg.key);
        el.title = `${item.name}${item.level ? ' (+' + item.level + ')' : ''}`;
      } else {
        el.innerHTML = `<img src="${cfg.placeholder}" alt="${cfg.label}" class="equip-card-icon placeholder-icon">`;
        el.onclick = null;
        el.title = `Chưa trang bị ${cfg.label}`;
      }
    });

    // 2. Render 40 ô túi đồ trữ vật (Lưới 8 cột x 5 hàng)
    // QUAN TRỌNG: Trang bị đang mặc trên người sẽ KHÔNG hiển thị ở túi đồ!
    const invContainer = document.getElementById('inventory-slots-container');
    const invBadge = document.getElementById('inv-count-badge');
    if (invContainer) {
      // Tập hợp các ID của các món trang bị đang mặc trên người
      const equippedIds = new Set(
        Object.values(p.equipped || {})
          .filter(Boolean)
          .map(e => e.id)
      );

      // Nếu có món đồ đang mặc lọt vào túi đồ (ví dụ từ save cũ), tự động dọn sạch
      if (Array.isArray(p.inventory)) {
        for (let i = 0; i < p.inventory.length; i++) {
          if (p.inventory[i] && equippedIds.has(p.inventory[i].id)) {
            p.inventory[i] = null;
          }
        }
      }

      const inv = p.inventory || [];
      let filledCount = 0;
      for (let i = 0; i < 40; i++) {
        if (inv[i]) filledCount++;
      }
      if (invBadge) invBadge.innerText = `${filledCount}/40`;

      let html = '';
      for (let i = 0; i < 40; i++) {
        const item = inv[i];
        if (item) {
          const countBadge = item.count > 1 ? `<span class="slot-count">${item.count}</span>` : '';
          const lvlBadge = (item.level && item.level > 0) ? `<span class="inv-level-badge">+${item.level}</span>` : '';
          html += `
            <div class="inv-slot has-item" onclick="ui.showItemDetail(window.game.player.inventory[${i}], 'inventory', ${i})" title="${item.name}">
              <img src="${item.icon}" alt="${item.name}" class="inv-item-img">
              ${lvlBadge}
              ${countBadge}
            </div>
          `;
        } else {
          html += `
            <div class="inv-slot empty" title="Ô trống">
              <span class="empty-pattern">❖</span>
            </div>
          `;
        }
      }
      invContainer.innerHTML = html;
    }

    this.updateModalStats();
  }

  renderSkillsList() {
    const list = document.getElementById('skills-detail-list');
    if (!list || !window.game) return;
    list.innerHTML = '';

    const allSkills = window.game.allSkills || ALL_SKILLS;
    for (let skillId in allSkills) {
      const s = allSkills[skillId];
      let equippedInSlot = null;
      for (let sl = 1; sl <= 4; sl++) {
        if (window.game.slotAssignments[sl] === skillId) {
          equippedInSlot = sl;
          break;
        }
      }

      const div = document.createElement('div');
      div.className = 'skill-row';
      const cdText = skillId === 'normal_attack' 
        ? 'Không có CD' 
        : (skillId === 'phi_kiem' 
           ? `${(1.0 / (window.game.player.attackSpeed || 1.25)).toFixed(2)}s (Theo tốc đánh)` 
           : `${s.cd}s`);
      const mpText = s.mp > 0 ? `${s.mp} MP` : '0 MP';

      div.innerHTML = `
        <div class="skill-row-icon">
          <img src="${s.icon}" alt="${s.name}" class="skill-row-img">
        </div>
        <div class="skill-row-info">
          <div class="skill-row-name">
            ${s.name} <span class="val-gold">Lv.${s.level}</span>
            <span class="skill-sub-badge">${s.subName}</span>
            ${equippedInSlot ? `<span class="equipped-slot-tag" style="position:static; margin-left:6px;">Ô ${equippedInSlot}</span>` : ''}
          </div>
          <div class="skill-row-desc">${s.desc}</div>
          <div class="skill-row-stats">
            Hồi chiêu: <b class="val-blue">${cdText}</b> | Tiêu hao: <b class="val-blue">${mpText}</b>
          </div>
        </div>
      `;
      list.appendChild(div);
    }
  }

  setupSkillSlotInteractions() {
    for (let slot = 1; slot <= 4; slot++) {
      const btn = document.getElementById(`skill-slot-${slot}`);
      if (!btn) continue;

      let holdTimer = null;
      let didHold = false;
      let startX = 0;
      let startY = 0;

      const clearHold = () => {
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      };

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        didHold = false;
        startX = e.clientX || 0;
        startY = e.clientY || 0;
        clearHold();
        holdTimer = setTimeout(() => {
          didHold = true;
          audioManager.ensureContext();
          this.openSkillSelectModal(slot);
        }, 450);
      });

      btn.addEventListener('pointermove', (e) => {
        if (holdTimer) {
          const moveDist = Math.hypot((e.clientX || 0) - startX, (e.clientY || 0) - startY);
          if (moveDist > 16) {
            clearHold();
          }
        }
      });

      btn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        const held = didHold;
        clearHold();
        if (!held && window.game) {
          audioManager.ensureContext();
          window.game.castSkill(slot);
        }
      });

      btn.addEventListener('pointercancel', clearHold);
      btn.addEventListener('pointerleave', clearHold);

      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        clearHold();
        audioManager.ensureContext();
        this.openSkillSelectModal(slot);
      });
    }
  }

  updateSkillSlotsDisplay() {
    if (!window.game) return;
    for (let slot = 1; slot <= 4; slot++) {
      const skillId = window.game.slotAssignments ? window.game.slotAssignments[slot] : null;
      const slotBtn = document.getElementById(`skill-slot-${slot}`);
      const iconImg = document.getElementById(`slot-icon-${slot}`);
      const mpBadge = document.getElementById(`mp-cost-${slot}`);
      let lockOverlay = document.getElementById(`lock-overlay-${slot}`);

      if (!skillId) {
        // Ô Kỹ năng bị khoá
        const reqLvForSlot = slot === 2 ? 3 : (slot === 3 ? 8 : (slot === 4 ? 12 : 1));
        if (slotBtn) {
          slotBtn.classList.add('skill-slot-locked');
          slotBtn.title = `Ô Kỹ Năng ${slot} (Mở khóa tại Cấp ${reqLvForSlot})`;
        }
        if (iconImg) {
          iconImg.style.opacity = '0.2';
          iconImg.style.filter = 'grayscale(100%) brightness(0.6)';
        }
        if (mpBadge) {
          mpBadge.style.display = 'none';
        }
        if (!lockOverlay && slotBtn) {
          lockOverlay = document.createElement('div');
          lockOverlay.className = 'skill-lock-overlay';
          lockOverlay.id = `lock-overlay-${slot}`;
          lockOverlay.innerHTML = `
            <span class="skill-lock-icon">🔒</span>
            <span class="skill-lock-text">Lv.${reqLvForSlot}</span>
          `;
          slotBtn.appendChild(lockOverlay);
        } else if (lockOverlay) {
          lockOverlay.style.display = 'flex';
        }
      } else {
        // Ô Kỹ năng đã mở khóa và có gán chiêu
        const s = window.game.allSkills ? window.game.allSkills[skillId] : null;
        if (!s) continue;

        if (slotBtn) {
          slotBtn.classList.remove('skill-slot-locked');
          slotBtn.title = `${s.name} (${s.subName})\nNhấp: Xuất chiêu | Đè lâu: Đổi kỹ năng`;
        }
        if (lockOverlay) {
          lockOverlay.style.display = 'none';
        }
        if (iconImg) {
          iconImg.src = s.icon;
          iconImg.alt = s.name;
          iconImg.style.opacity = '1';
          iconImg.style.filter = 'none';
        }
        if (mpBadge) {
          if (s.mp > 0) {
            mpBadge.innerText = s.mp;
            mpBadge.style.display = 'block';
          } else {
            mpBadge.style.display = 'none';
          }
        }
      }
    }
  }

  selectAtlasMap(mapId) {
    this.selectedAtlasMapId = mapId;
    this.renderWorldMapAtlas();
    this.updateAtlasSelectedBar();
    const cards = document.querySelectorAll('.world-map-card');
    cards.forEach(c => {
      if (c.getAttribute('data-map-id') === mapId) {
        c.classList.add('selected');
        c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        c.classList.remove('selected');
      }
    });
  }

  updateAtlasSelectedBar() {
    const bar = document.getElementById('world-map-selected-bar');
    if (!bar || !window.game) return;
    const g = window.game;
    const mapId = this.selectedAtlasMapId || g.currentMapId;
    const m = g.worldMaps[mapId];
    if (!m) return;

    const isCurrent = mapId === g.currentMapId;
    const isUnlocked = g.player.level >= m.reqLv;
    const mapList = Object.values(g.worldMaps);
    const mapIndex = mapList.findIndex(item => item.id === mapId) + 1;

    let actionBtnHtml = '';
    if (isCurrent) {
      actionBtnHtml = '<button class="teleport-action-btn current">📍 Vị Trí Hiện Tại</button>';
    } else if (isUnlocked) {
      actionBtnHtml = `<button class="teleport-action-btn" onclick="game.teleportToMap('${m.id}')">Ngự Kiếm Đến ✈</button>`;
    } else {
      actionBtnHtml = `<button class="teleport-action-btn current">🔒 Cần Cấp ${m.reqLv}</button>`;
    }

    bar.innerHTML = `
      <img src="${m.thumb}" alt="${m.name}" class="selected-map-thumb">
      <div class="selected-map-info">
        <div class="selected-map-title">
          <span>${mapIndex}. ${m.name}</span>
          <span class="selected-map-lvl">(Cấp ${m.reqLv}+)</span>
        </div>
        <div class="selected-map-desc">${m.desc}</div>
      </div>
      ${actionBtnHtml}
    `;
  }

  renderWorldMapAtlas() {
    const canvas = document.getElementById('world-map-canvas');
    if (!canvas || !window.game) return;
    const ctx = canvas.getContext('2d');
    const g = window.game;
    const curMapId = g.currentMapId;
    const selectedId = this.selectedAtlasMapId || curMapId;
    const playerLv = g.player.level;

    const w = canvas.width;
    const h = canvas.height;

    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, '#0f1c30');
    bgGrad.addColorStop(0.65, '#080d19');
    bgGrad.addColorStop(1, '#030509');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const starCoords = [
      [35, 30, 1.2], [140, 25, 1.5], [260, 45, 1.0], [380, 20, 1.4],
      [70, 160, 1.0], [180, 175, 1.5], [310, 80, 1.2], [460, 180, 1.4],
      [440, 240, 1.1], [50, 245, 1.3], [220, 240, 1.0], [360, 235, 1.2]
    ];
    starCoords.forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 60; x < w; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 45; y < h; y += 45) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();

    const ATLAS_NODES = {
      'thanh_van_thon':       { x: 50,  y: 195, name: 'Thanh Vân Thôn', num: 1 },
      'u_hon_truc_lam':       { x: 105, y: 135, name: 'U Hồn Trúc Lâm', num: 2 },
      'van_kiem_trung':       { x: 80,  y: 65,  name: 'Vạn Kiếm Trũng', num: 3 },
      'u_minh_dam_lay':       { x: 165, y: 55,  name: 'U Minh Đầm Lầy', num: 4 },
      'hac_phong_linh':       { x: 215, y: 125, name: 'Hắc Phong Lĩnh', num: 5 },
      'lac_nhat_co_tran':     { x: 275, y: 190, name: 'Lạc Nhật Cổ Trấn', num: 6 },
      'bang_phong_han_dong':   { x: 335, y: 125, name: 'Băng Hàn Động', num: 7 },
      'viem_ma_hoa_coc':      { x: 385, y: 190, name: 'Viêm Ma Cốc', num: 8 },
      'thien_duoc_coc':       { x: 425, y: 115, name: 'Thiên Dược Cốc', num: 9 },
      'thanh_van_tien_dinh':  { x: 425, y: 45,  name: 'Tiên Đỉnh', num: 10 }
    };

    const ATLAS_CONNECTIONS = [
      ['thanh_van_thon', 'u_hon_truc_lam'],
      ['u_hon_truc_lam', 'van_kiem_trung'],
      ['van_kiem_trung', 'u_minh_dam_lay'],
      ['u_minh_dam_lay', 'hac_phong_linh'],
      ['hac_phong_linh', 'lac_nhat_co_tran'],
      ['lac_nhat_co_tran', 'bang_phong_han_dong'],
      ['bang_phong_han_dong', 'viem_ma_hoa_coc'],
      ['viem_ma_hoa_coc', 'thien_duoc_coc'],
      ['thien_duoc_coc', 'thanh_van_tien_dinh']
    ];

    ctx.save();
    ATLAS_CONNECTIONS.forEach(([fromId, toId]) => {
      const p1 = ATLAS_NODES[fromId];
      const p2 = ATLAS_NODES[toId];
      if (!p1 || !p2) return;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });
    ctx.restore();

    const mapList = Object.values(g.worldMaps);
    mapList.forEach(m => {
      const node = ATLAS_NODES[m.id];
      if (!node) return;

      const isCurrent = m.id === curMapId;
      const isSelected = m.id === selectedId;
      const isUnlocked = playerLv >= m.reqLv;
      const nx = node.x;
      const ny = node.y;

      ctx.save();

      if (isSelected) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(nx, ny, 21, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.arc(nx, ny, 21, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isCurrent) {
        const pulse = 20 + Math.sin(Date.now() * 0.007) * 3;
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(nx, ny, pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(nx, ny, 14, 0, Math.PI * 2);
      if (isCurrent) {
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (isUnlocked) {
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isUnlocked) {
        ctx.font = 'bold 11px \'Playfair Display\', \'Lora\', serif';
        ctx.fillStyle = isCurrent ? '#ffffff' : '#fde68a';
        ctx.fillText(node.num, nx, ny);
      } else {
        ctx.font = '10px Nunito, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('🔒', nx, ny);
      }

      ctx.font = 'bold 9.5px Nunito, sans-serif';
      ctx.fillStyle = isCurrent ? '#38bdf8' : (isUnlocked ? '#f1f5f9' : '#64748b');
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      const labelY = ny > 210 ? ny - 20 : ny + 22;
      ctx.fillText(node.name, nx, labelY);

      if (isCurrent) {
        ctx.font = '800 8.5px Nunito, sans-serif';
        ctx.fillStyle = '#fbbf24';
        const tagY = labelY === ny - 20 ? ny - 31 : ny + 32;
        ctx.fillText('📍 Đang ở đây', nx, tagY);
      }

      ctx.restore();
    });
  }

  initAtlasCanvas() {
    const canvas = document.getElementById('world-map-canvas');
    if (!canvas || canvas._atlasInited) return;
    canvas._atlasInited = true;

    const ATLAS_NODES = {
      'thanh_van_thon':       { x: 50,  y: 195 },
      'u_hon_truc_lam':       { x: 105, y: 135 },
      'van_kiem_trung':       { x: 80,  y: 65  },
      'u_minh_dam_lay':       { x: 165, y: 55  },
      'hac_phong_linh':       { x: 215, y: 125 },
      'lac_nhat_co_tran':     { x: 275, y: 190 },
      'bang_phong_han_dong':   { x: 335, y: 125 },
      'viem_ma_hoa_coc':      { x: 385, y: 190 },
      'thien_duoc_coc':       { x: 425, y: 115 },
      'thanh_van_tien_dinh':  { x: 425, y: 45  }
    };

    const handleAtlasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      for (const [mapId, node] of Object.entries(ATLAS_NODES)) {
        const dist = Math.hypot(clickX - node.x, clickY - node.y);
        if (dist <= 22) {
          audioManager.ensureContext();
          audioManager.playSwing();
          this.selectAtlasMap(mapId);
          break;
        }
      }
    };

    canvas.addEventListener('click', handleAtlasClick);
  }

  renderWorldMapGrid() {
    const grid = document.getElementById('world-map-grid');
    if (!grid || !window.game) return;
    const g = window.game;
    const curMapId = g.currentMapId;
    const playerLv = g.player.level;

    if (!this.selectedAtlasMapId) {
      this.selectedAtlasMapId = curMapId;
    }

    this.initAtlasCanvas();
    this.renderWorldMapAtlas();
    this.updateAtlasSelectedBar();

    let html = '';
    const mapList = Object.values(g.worldMaps);

    mapList.forEach((m, idx) => {
      const isCurrent = m.id === curMapId;
      const isSelected = m.id === this.selectedAtlasMapId;
      const isUnlocked = playerLv >= m.reqLv;
      let cardClass = 'world-map-card';
      if (isCurrent) cardClass += ' current';
      if (isSelected) cardClass += ' selected';
      if (!isUnlocked) cardClass += ' locked';

      let badgeHtml = '';
      if (isCurrent) {
        badgeHtml = '<span class="world-map-card-badge badge-current">📍 Đang ở đây</span>';
      } else if (isUnlocked) {
        badgeHtml = '<span class="world-map-card-badge badge-unlocked">✓ Đã mở khóa</span>';
      } else {
        badgeHtml = `<span class="world-map-card-badge badge-locked">🔒 Cần Lv.${m.reqLv}</span>`;
      }

      html += `
        <div class="${cardClass}" data-map-id="${m.id}" onclick="ui.selectAtlasMap('${m.id}')">
          <div class="world-map-card-thumb">
            <img src="${m.thumb}" alt="${m.name}">
          </div>
          <div class="world-map-card-info">
            <div class="world-map-card-title-row">
              <div class="world-map-card-name">
                <span>${idx + 1}. ${m.name}</span>
                <span class="world-map-card-sub">(${m.subName})</span>
              </div>
              ${badgeHtml}
            </div>
            <div class="world-map-card-desc">${m.desc}</div>
            <div class="world-map-card-footer">
              <span><b>Yêu thú:</b> ${m.monsters}</span>
              ${isUnlocked && !isCurrent ? `<button class="teleport-btn" onclick="event.stopPropagation(); game.teleportToMap('${m.id}')">Ngự Kiếm Đến ✈</button>` : ''}
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  }
}

window.UIManager = UIManager;
const ui = new UIManager();
window.ui = ui;

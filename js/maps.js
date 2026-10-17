// ============================================================================
// THANH VÂN KIẾM KHÁCH - BẢN ĐỒ THẾ GIỚI & KHU VỰC LIÊN THÔNG (MAP SYSTEM)
// ============================================================================

const WORLD_MAPS = {
  'thanh_van_thon': {
    id: 'thanh_van_thon',
    name: 'Thanh Vân Thôn',
    subName: 'Thôn Làng Khởi Đầu',
    bgKey: 'map_thanh_van_thon',
    thumb: 'assets/maps/battle_arena_bg.webp',
    reqLv: 1,
    desc: 'Vùng bình nguyên xanh mướt dưới chân núi Thanh Vân, nơi các đệ tử sơ nhập khởi đầu bước đường tu tiên.',
    monsters: 'Xích Dã Lang, Băng Giác Hổ, Xích Lang Vương (Lv.1 - 15)',
    bounds: { minX: 100, maxX: 980, minY: 900, maxY: 1800 },
    playerSpawn: { x: 540, y: 1350 },
    enemyPool: [
      { type: 'enemy1', name: 'Xích Dã Lang' },
      { type: 'enemy2', name: 'Băng Giác Hổ' },
      { type: 'enemy3', name: 'U Minh Bọ Cạp' }
    ],
    boss: { type: 'enemy20', name: 'Xích Lang Thần Vương' },
    portals: [
      { x: 540, y: 940, radius: 60, targetMapId: 'u_hon_truc_lam', targetX: 540, targetY: 1520, label: 'Đến U Hồn Trúc Lâm ❯' }
    ]
  },
  'u_hon_truc_lam': {
    id: 'u_hon_truc_lam',
    name: 'U Hồn Trúc Lâm',
    subName: 'Rừng Trúc Hoang Dã',
    bgKey: 'map_u_hon_truc_lam',
    thumb: 'assets/maps/u_hon_truc_lam_bg.webp',
    reqLv: 15,
    desc: 'Rừng trúc u tịch ngút ngàn rợp bóng, thạch đăng phát sáng và sương lam ma mị che mắt lữ khách.',
    monsters: 'U Hồn Trúc Yêu, Lục Trúc Báo, Thụ Yêu Vương (Lv.15 - 25)',
    bounds: { minX: 140, maxX: 940, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy4', name: 'U Hồn Trúc Yêu' },
      { type: 'enemy5', name: 'Lục Trúc Báo' },
      { type: 'enemy6', name: 'Hắc Dạ Hồ Điệp' }
    ],
    boss: { type: 'enemy11', name: 'U Hồn Thụ Yêu Vương' },
    portals: [
      { x: 540, y: 760, radius: 60, targetMapId: 'van_kiem_trung', targetX: 540, targetY: 1520, label: 'Đến Vạn Kiếm Trũng ❯' },
      { x: 540, y: 1620, radius: 60, targetMapId: 'thanh_van_thon', targetX: 540, targetY: 1040, label: '❮ Về Thanh Vân Thôn' }
    ]
  },
  'van_kiem_trung': {
    id: 'van_kiem_trung',
    name: 'Vạn Kiếm Trũng',
    subName: 'Cổ Kiếm Bí Cảnh',
    bgKey: 'map_van_kiem_trung',
    thumb: 'assets/maps/van_kiem_trung_bg.webp',
    reqLv: 25,
    desc: 'Phế tích kiếm trận thượng cổ giữa đỉnh núi lơ lửng, ngàn vạn tàn kiếm cắm ngập sườn đá cổ linh thiêng.',
    monsters: 'Cổ Kiếm Hồn, Kiếm Khí Linh, Vạn Kiếm Ma (Lv.25 - 35)',
    bounds: { minX: 140, maxX: 940, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy7', name: 'Cổ Kiếm Hồn' },
      { type: 'enemy8', name: 'Kiếm Khí Ma Linh' },
      { type: 'enemy9', name: 'Bạch Thiết Ma Thú' }
    ],
    boss: { type: 'enemy12', name: 'Vạn Kiếm Kiếm Ma' },
    portals: [
      { x: 540, y: 760, radius: 60, targetMapId: 'u_minh_dam_lay', targetX: 540, targetY: 1520, label: 'Đến U Minh Đầm Lầy ❯' },
      { x: 540, y: 1620, radius: 60, targetMapId: 'u_hon_truc_lam', targetX: 540, targetY: 820, label: '❮ Về U Hồn Trúc Lâm' }
    ]
  },
  'u_minh_dam_lay': {
    id: 'u_minh_dam_lay',
    name: 'U Minh Đầm Lầy',
    subName: 'Độc Khí Đầm Lầy',
    bgKey: 'map_u_minh_dam_lay',
    thumb: 'assets/maps/u_minh_dam_lay_bg.webp',
    reqLv: 35,
    desc: 'Vùng đầm lầy huyền bí phát quang với hoa sen dạ quang khổng lồ, độc vụ màu tím bao phủ khắp nơi.',
    monsters: 'Độc Thi Ma, Đầm Lầy Ngô Công, Thi Hoàng (Lv.35 - 45)',
    bounds: { minX: 140, maxX: 940, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy13', name: 'Độc Thi Ma' },
      { type: 'enemy16', name: 'Đầm Lầy Ngô Công' },
      { type: 'enemy17', name: 'Tử Diễm Ma Trùng' }
    ],
    boss: { type: 'enemy18', name: 'U Minh Thi Hoàng' },
    portals: [
      { x: 540, y: 760, radius: 60, targetMapId: 'hac_phong_linh', targetX: 540, targetY: 1520, label: 'Đến Hắc Phong Lĩnh ❯' },
      { x: 540, y: 1620, radius: 60, targetMapId: 'van_kiem_trung', targetX: 540, targetY: 820, label: '❮ Về Vạn Kiếm Trũng' }
    ]
  },
  'hac_phong_linh': {
    id: 'hac_phong_linh',
    name: 'Hắc Phong Lĩnh',
    subName: 'Hiểm Địa Lôi Phong',
    bgKey: 'map_hac_phong_linh',
    thumb: 'assets/maps/hac_phong_linh_bg.webp',
    reqLv: 45,
    desc: 'Vách đá hắc diệu thạch gió hú rền vang vạn trượng, xích sắt phong ấn ma vật rung chuyển trong sấm chớp.',
    monsters: 'Hắc Phong Tặc, Cuồng Phong Lang, Lôi Ma Tôn (Lv.45 - 55)',
    bounds: { minX: 150, maxX: 930, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy35', name: 'Hắc Phong Sơn Tặc' },
      { type: 'enemy36', name: 'Cuồng Phong Ma Lang' },
      { type: 'enemy37', name: 'Lôi Điện Báo' }
    ],
    boss: { type: 'enemy38', name: 'Hắc Phong Lôi Ma Tôn' },
    portals: [
      { x: 540, y: 760, radius: 60, targetMapId: 'lac_nhat_co_tran', targetX: 540, targetY: 1520, label: 'Đến Lạc Nhật Cổ Trấn ❯' },
      { x: 540, y: 1620, radius: 60, targetMapId: 'u_minh_dam_lay', targetX: 540, targetY: 820, label: '❮ Về U Minh Đầm Lầy' }
    ]
  },
  'lac_nhat_co_tran': {
    id: 'lac_nhat_co_tran',
    name: 'Lạc Nhật Cổ Trấn',
    subName: 'Tàn Tích Cổ Đại',
    bgKey: 'map_lac_nhat_co_tran',
    thumb: 'assets/maps/lac_nhat_co_tran_bg.webp',
    reqLv: 55,
    desc: 'Thành trấn hoang phế ngập sắc đỏ lá phong chiều tà, điêu khắc long đồ đài uy nghiêm chìm trong quên lãng.',
    monsters: 'Cổ Trấn Oán Hồn, Sa Đọa Hộ Vệ, Trấn Thủ Tướng (Lv.55 - 65)',
    bounds: { minX: 140, maxX: 940, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy39', name: 'Cổ Trấn Oán Hồn' },
      { type: 'enemy40', name: 'Sa Đọa Hộ Vệ' },
      { type: 'enemy41', name: 'Hoàng Hôn Khôi Lỗi' }
    ],
    boss: { type: 'enemy42', name: 'Cổ Thành Trấn Thủ Tướng' },
    portals: [
      { x: 540, y: 760, radius: 60, targetMapId: 'bang_phong_han_dong', targetX: 540, targetY: 1520, label: 'Đến Băng Phong Hàn Động ❯' },
      { x: 540, y: 1620, radius: 60, targetMapId: 'hac_phong_linh', targetX: 540, targetY: 820, label: '❮ Về Hắc Phong Lĩnh' }
    ]
  },
  'bang_phong_han_dong': {
    id: 'bang_phong_han_dong',
    name: 'Băng Phong Hàn Động',
    subName: 'Bí Cảnh Tuyết Vực',
    bgKey: 'map_bang_phong_han_dong',
    thumb: 'assets/maps/bang_phong_han_dong_bg.webp',
    reqLv: 65,
    desc: 'Động băng vĩnh cửu với trụ băng lam khổng lồ phát sáng lấp lánh, hàn khí thấu xương ngưng đọng chân khí.',
    monsters: 'Hàn Băng Thú, Băng Nhũ Tinh, Vạn Niên Băng Ma (Lv.65 - 75)',
    bounds: { minX: 140, maxX: 940, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy43', name: 'Hàn Băng Thú' },
      { type: 'enemy44', name: 'Băng Nhũ Tinh Linh' },
      { type: 'enemy45', name: 'Tuyết Vực Ma Hùng' }
    ],
    boss: { type: 'enemy48', name: 'Vạn Niên Băng Ma Thú' },
    portals: [
      { x: 540, y: 760, radius: 60, targetMapId: 'viem_ma_hoa_coc', targetX: 540, targetY: 1520, label: 'Đến Viêm Ma Hỏa Cốc ❯' },
      { x: 540, y: 1620, radius: 60, targetMapId: 'lac_nhat_co_tran', targetX: 540, targetY: 820, label: '❮ Về Lạc Nhật Cổ Trấn' }
    ]
  },
  'viem_ma_hoa_coc': {
    id: 'viem_ma_hoa_coc',
    name: 'Viêm Ma Hỏa Cốc',
    subName: 'Hỏa Vực Nham Thạch',
    bgKey: 'map_viem_ma_hoa_coc',
    thumb: 'assets/maps/viem_ma_hoa_coc_bg.webp',
    reqLv: 75,
    desc: 'Hẻm núi nham thạch sôi sục cùng di cốt rồng lửa khổng lồ hóa thạch, biển dung nham thiêu đốt vạn vật.',
    monsters: 'Nham Thạch Yêu, Hỏa Ma Điểu, Viêm Ma Cổ Long (Lv.75 - 85)',
    bounds: { minX: 150, maxX: 930, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy46', name: 'Nham Thạch Yêu' },
      { type: 'enemy47', name: 'Hỏa Diễm Ma Điểu' },
      { type: 'enemy49', name: 'Viêm Hỏa Dị Thú' }
    ],
    boss: { type: 'enemy52', name: 'Viêm Ma Cổ Long' },
    portals: [
      { x: 540, y: 760, radius: 60, targetMapId: 'thien_duoc_coc', targetX: 540, targetY: 1520, label: 'Đến Thiên Dược Cốc ❯' },
      { x: 540, y: 1620, radius: 60, targetMapId: 'bang_phong_han_dong', targetX: 540, targetY: 820, label: '❮ Về Băng Phong Hàn Động' }
    ]
  },
  'thien_duoc_coc': {
    id: 'thien_duoc_coc',
    name: 'Thiên Dược Cốc',
    subName: 'Dược Thảo Tiên Cảnh',
    bgKey: 'map_thien_duoc_coc',
    thumb: 'assets/maps/thien_duoc_coc_bg.webp',
    reqLv: 85,
    desc: 'Thung lũng tiên cảnh ngập tràn linh chi dược thảo ngàn năm, suối ngọc thanh tẩy tạp chất tu vi thăng tiến.',
    monsters: 'Linh Chi Thú, Thanh Xà Tiên Tinh, Thiên Dược Thánh Thú (Lv.85 - 95)',
    bounds: { minX: 140, maxX: 940, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy51', name: 'Linh Chi Thần Thú' },
      { type: 'enemy53', name: 'Thanh Xà Tiên Tinh' },
      { type: 'enemy54', name: 'Hộ Sơn Thần Viên' }
    ],
    boss: { type: 'enemy56', name: 'Thiên Dược Thánh Thú' },
    portals: [
      { x: 540, y: 760, radius: 60, targetMapId: 'thanh_van_tien_dinh', targetX: 540, targetY: 1520, label: 'Đến Thanh Vân Tiên Đỉnh ❯' },
      { x: 540, y: 1620, radius: 60, targetMapId: 'viem_ma_hoa_coc', targetX: 540, targetY: 820, label: '❮ Về Viêm Ma Hỏa Cốc' }
    ]
  },
  'thanh_van_tien_dinh': {
    id: 'thanh_van_tien_dinh',
    name: 'Thanh Vân Tiên Đỉnh',
    subName: 'Tiên Môn Thánh Địa',
    bgKey: 'map_thanh_van_tien_dinh',
    thumb: 'assets/maps/thanh_van_tien_dinh_bg.webp',
    reqLv: 95,
    desc: 'Đỉnh cao chí tôn của Thanh Vân Tông, bồng bềnh giữa biển mây tiên khí, nơi chân tiên vấn đạo cầu trường sinh.',
    monsters: 'Tiên Môn Chấp Sự, Thần Lôi Tiên Tướng, Đạo Tổ Hóa Thân (Lv.95 - 100)',
    bounds: { minX: 140, maxX: 940, minY: 720, maxY: 1650 },
    playerSpawn: { x: 540, y: 1250 },
    enemyPool: [
      { type: 'enemy57', name: 'Tiên Môn Chấp Sự' },
      { type: 'enemy58', name: 'Thần Lôi Tiên Tướng' },
      { type: 'enemy59', name: 'Thái Thanh Kiếm Tiên' }
    ],
    boss: { type: 'enemy61', name: 'Thanh Vân Đạo Tổ Hóa Thân' },
    portals: [
      { x: 540, y: 1620, radius: 60, targetMapId: 'thien_duoc_coc', targetX: 540, targetY: 820, label: '❮ Về Thiên Dược Cốc' }
    ]
  }
};

class MapManager {
  constructor(game) {
    this.game = game;
    this.selectedAtlasMapId = null;
    this.radarAngle = 0;
  }

  getCurrentMap() {
    return WORLD_MAPS[this.game.currentMapId] || WORLD_MAPS['thanh_van_thon'];
  }

  switchMap(targetMapId, spawnX = null, spawnY = null) {
    const targetMap = WORLD_MAPS[targetMapId];
    if (!targetMap) return;

    if (this.game.player.level < targetMap.reqLv) {
      this.game.showBanner(`CẦN CẤP ĐỘ ${targetMap.reqLv} ĐỂ VÀO ${targetMap.name.toUpperCase()}!`);
      return;
    }

    this.game.currentMapId = targetMapId;
    this.game.bounds = targetMap.bounds;

    const spX = spawnX !== null ? spawnX : (targetMap.playerSpawn?.x || 540);
    const spY = spawnY !== null ? spawnY : (targetMap.playerSpawn?.y || 1250);
    this.game.player.x = spX;
    this.game.player.y = spY;
    this.game.player.vx = 0;
    this.game.player.vy = 0;

    // Hiệu ứng dịch chuyển & hào quang chuyển cảnh
    this.game.isTeleporting = true;
    this.game.portalAnimTime = 0.65;
    audioManager.playLevelUp();
    this.game.showBanner(`ĐẾN: ${targetMap.name.toUpperCase()} (${targetMap.subName})`);

    // Làm mới yêu thú theo bản đồ mới
    if (this.game.enemyManager) {
      this.game.enemyManager.spawnInitialWolves();
    }

    // Cập nhật tên map trên HUD
    const mapNameEl = document.getElementById('ui-map-name');
    if (mapNameEl) {
      mapNameEl.innerText = `${targetMap.name} (Lv.${targetMap.reqLv}+)`;
    }

    if (window.ui) {
      window.ui.closeModals();
    }
  }

  teleportToMap(mapId) {
    const m = WORLD_MAPS[mapId];
    if (!m) return;
    if (this.game.player.level < m.reqLv) {
      this.game.showBanner(`CẦN CẤP ${m.reqLv} ĐỂ VÀO ${m.name.toUpperCase()}!`);
      return;
    }
    this.switchMap(mapId, m.playerSpawn?.x || 540, m.playerSpawn?.y || 1250);
  }

  checkPortalCollision() {
    const curMap = this.getCurrentMap();
    if (!curMap.portals || this.game.isTeleporting) return;

    for (let p of curMap.portals) {
      const d = Math.hypot(this.game.player.x - p.x, this.game.player.y - p.y);
      if (d <= p.radius) {
        this.switchMap(p.targetMapId, p.targetX, p.targetY);
        break;
      }
    }
  }

  renderPortals(ctx) {
    const curMap = this.getCurrentMap();
    if (!curMap.portals) return;

    const time = Date.now() * 0.003;
    curMap.portals.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      // Vòng tròn ma pháp trận cổng dịch chuyển
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius, p.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vòng hào quang xoay
      ctx.save();
      ctx.rotate(time);
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius * 0.8, p.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Trụ linh khí mờ bốc lên
      const grad = ctx.createLinearGradient(0, 0, 0, -60);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.radius * 0.65, p.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nhãn tên cổng
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText(p.label, 0, -p.radius * 0.65);

      ctx.restore();
    });
  }

  renderMinimap(ctx) {
    if (!ctx) return;
    ctx.clearRect(0, 0, 90, 90);

    // 1. Khung nền Radar Minimap
    ctx.fillStyle = 'rgba(11, 17, 32, 0.88)';
    ctx.fillRect(0, 0, 90, 90);

    // 2. Vòng tròn tọa độ radar
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(45, 45, 20, 0, Math.PI * 2);
    ctx.arc(45, 45, 38, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(45, 5); ctx.lineTo(45, 85);
    ctx.moveTo(5, 45); ctx.lineTo(85, 45);
    ctx.stroke();

    // 3. Quét tia radar
    this.radarAngle = ((this.radarAngle || 0) + 0.035) % (Math.PI * 2);
    ctx.save();
    ctx.translate(45, 45);
    ctx.rotate(this.radarAngle);
    const sweepGrad = ctx.createLinearGradient(0, 0, 40, 0);
    sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 42, -0.3, 0);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();
    ctx.restore();

    const toMapX = (wx) => Math.max(4, Math.min(86, (wx / this.game.worldWidth) * 90));
    const toMapY = (wy) => Math.max(4, Math.min(86, (wy / this.game.worldHeight) * 90));

    // 4. Portals
    const curMap = this.getCurrentMap();
    if (curMap && curMap.portals) {
      curMap.portals.forEach(p => {
        const px = toMapX(p.x);
        const py = toMapY(p.y);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // 5. Yêu thú (Enemies) - Chấm đỏ
    this.game.enemies.forEach(e => {
      if (e.hp <= 0) return;
      const ex = toMapX(e.x);
      const ey = toMapY(e.y);

      ctx.save();
      if (e.isBoss) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ex, ey, 3.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(ex, ey, 5.2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 6. Người chơi - Chấm vàng
    const px = toMapX(this.game.player.x);
    const py = toMapY(this.game.player.y);

    ctx.save();
    const pulseR = 4.2 + Math.sin(Date.now() * 0.007) * 1.5;
    ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.beginPath();
    ctx.arc(px, py, pulseR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(px, py, 3.2, 0, Math.PI * 2);
    ctx.fill();

    const f = this.game.player.facing || 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(px + f * 5.8, py);
    ctx.lineTo(px + f * 2.2, py - 2.5);
    ctx.lineTo(px + f * 2.2, py + 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

window.WORLD_MAPS = WORLD_MAPS;
window.MapManager = MapManager;

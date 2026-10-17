// Sprite loader & Asset Manager for HTML5 Canvas

// Hằng số metadata quản lý kích thước khung hình các nhân vật & hiệu ứng
const SPRITE_METADATA = {
  hero: {
    frameW: 320,
    frameH: 240,
    frames: 10,
    drawW: 208, // 160 * 1.3 = 208
    drawH: 156, // 120 * 1.3 = 156
    anchorX: 104, // 80 * 1.3 = 104
    anchorY: 144 // 111 * 1.3 ≈ 144
  },
  enemy: {
    frameW: 176,
    frameH: 176,
    frames: 10,
    rows: 2 // Row 0: RUN, Row 1: ATTACK
  },
  skill_1: {
    cellSize: 256,
    frames: 8,
    cols: 4,
    rows: 2
  },
  skill_2: {
    size: 384
  },
  skill_3: {
    size: 512
  },
  skill_4: {
    size: 1024
  }
};

class SpriteManager {
  constructor() {
    this.images = {};
    this.processedSprites = {};
    this.isLoaded = false;
    this.metadata = SPRITE_METADATA;
  }

  getMeta(key) {
    return this.metadata[key] || null;
  }

  async loadAll(onProgress) {
    // Chỉ nạp duy nhất các asset gốc định dạng WebP, code game tự xử lý flip hướng
    const assetList = [
      // 10 Vùng Bản Đồ Thanh Vân Giới
      { key: 'map_thanh_van_thon', src: 'assets/maps/battle_arena_bg.webp' },
      { key: 'map_u_hon_truc_lam', src: 'assets/maps/u_hon_truc_lam_bg.webp' },
      { key: 'map_van_kiem_trung', src: 'assets/maps/van_kiem_trung_bg.webp' },
      { key: 'map_u_minh_dam_lay', src: 'assets/maps/u_minh_dam_lay_bg.webp' },
      { key: 'map_hac_phong_linh', src: 'assets/maps/hac_phong_linh_bg.webp' },
      { key: 'map_lac_nhat_co_tran', src: 'assets/maps/lac_nhat_co_tran_bg.webp' },
      { key: 'map_bang_phong_han_dong', src: 'assets/maps/bang_phong_han_dong_bg.webp' },
      { key: 'map_viem_ma_hoa_coc', src: 'assets/maps/viem_ma_hoa_coc_bg.webp' },
      { key: 'map_thien_duoc_coc', src: 'assets/maps/thien_duoc_coc_bg.webp' },
      { key: 'map_thanh_van_tien_dinh', src: 'assets/maps/thanh_van_tien_dinh_bg.webp' },
      { key: 'bg', src: 'assets/maps/battle_arena_bg.webp' },
      { key: 'hero_idle', src: 'assets/player/hero_idle.webp' },
      { key: 'hero_run', src: 'assets/player/hero_run.webp' },
      { key: 'hero_attack', src: 'assets/player/hero_attack.webp' },
      // 40 Yêu Thú & Ma Vật phân bổ khắp 10 vùng bản đồ
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 52, 53, 54, 56, 57, 58, 59, 61].map(n => ({
        key: `enemy${n}`,
        src: `assets/enemies/enemy${n}.webp`
      })),
      { key: 'avatar', src: 'assets/ui/hero_avatar_icon.webp' },
      { key: 'minimap', src: 'assets/maps/minimap_village.webp' },
      { key: 'skill_1_sprite', src: 'assets/skills/skill_1_kiem_khi_tram_sprite.webp' },
      { key: 'skill_2_sword', src: 'assets/skills/skill_2_flying_sword.webp' },
      { key: 'skill_3_vfx', src: 'assets/skills/skill_3_loi_dinh_kiem_vfx.webp' },
      { key: 'skill_4_vfx', src: 'assets/skills/skill_4_thanh_van_kiem_tran_vfx.webp' }
    ];

    let loadedCount = 0;
    const total = assetList.length;

    const loadImg = (item) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.images[item.key] = img;
          loadedCount++;
          if (onProgress) onProgress(loadedCount / total);
          resolve();
        };

        img.onerror = (err) => {
          console.warn('Warning: Failed to load ' + item.src, err);
          loadedCount++;
          if (onProgress) onProgress(loadedCount / total);
          resolve();
        };

        img.src = item.src;
      });
    };

    await Promise.all(assetList.map(loadImg));

    // Aliases hỗ trợ tương thích ngược
    this.processedSprites['hero'] = this.images['hero_idle'];

    this.isLoaded = true;
  }

  get(name) {
    return this.processedSprites[name] || this.images[name] || null;
  }
}

const spriteManager = new SpriteManager();
window.spriteManager = spriteManager;
window.SPRITE_METADATA = SPRITE_METADATA;


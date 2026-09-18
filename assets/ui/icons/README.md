# Mobile UI Icon Assets

Tất cả icon HUD/navigation chính được gom vào thư mục này để có thể vẽ lại mà không phải sửa code.

## Cách thay icon
Game ưu tiên theo thứ tự:
1. `<name>.png` — ảnh custom của bạn.
2. `<name>.svg` — fallback có sẵn trong repo.

Chỉ cần vẽ file PNG mới và upload vào **đúng thư mục này, đúng tên file**. Không cần sửa HTML/CSS/JS.

## Chuẩn PNG khuyến nghị
- 256 × 256 px
- PNG nền trong suốt
- canvas vuông 1:1
- artwork nằm trong khoảng 80% vùng trung tâm
- không bake chữ vào icon
- cùng ánh sáng/phong cách cho cả bộ
- không thêm viền tròn ngoài nếu muốn dùng khung UI của game

## Danh sách icon UI
- `avatar.png` — chân dung nhân vật
- `power.png` — chiến lực
- `quest.png` — nhiệm vụ
- `level.png` — cấp nhân vật
- `daily.png` — phúc lợi
- `shop.png` — tiên phường
- `cultivate.png` — tu vi/công pháp/tâm pháp
- `inventory.png` — túi đồ
- `character.png` — nhân vật
- `skills.png` — kỹ năng
- `equipment.png` — trang bị
- `pet.png` — linh thú
- `map.png` — bản đồ
- `settings.png` — cài đặt
- `menu.png` — menu chính
- `auto.png` — tự động chiến đấu
- `dash.png` — thân pháp/lướt
- `stones.png` — linh thạch
- `gold.png` — vàng
- `close.png` — đóng panel

## Không nằm trong thư mục này
- Icon kỹ năng thực chiến: `assets/skills/`
- VFX kỹ năng: `assets/vfx/skills/`

Khi bạn vẽ lại UI, chỉ cần giữ nguyên tên PNG bên trên để game tự nhận.

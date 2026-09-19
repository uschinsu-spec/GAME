# VFX SKILL — FLIPBOOK RIÊNG CHO TỪNG KỸ NĂNG

GAME hiện dùng flipbook nhiều khung hình cho VFX skill. Không dùng quy ước sprite sheet 3×3 nữa.

## Cấu trúc

```text
assets/vfx/skills/<he>/<cap>_<pham>/vfx_sheet.png
```

Ví dụ:

```text
assets/vfx/skills/hoa/hoang_ha/vfx_sheet.png
```

Mỗi sheet là một animation riêng cho đúng một skill. Runtime tự chọn frame theo thứ tự đọc từ trái sang phải, từ trên xuống dưới.

## Chuẩn flipbook hiện tại

- PNG RGBA, nền trong suốt thật.
- Sheet chuẩn mới: 1024×1024 px.
- Bố cục chuẩn: 5 cột × 5 hàng = 25 frame.
- Mỗi frame: 204×204 px.
- Không chữ, không số frame, không đường chia ô, không watermark.
- Giữ cùng scale và anchor trong toàn bộ frame; không crop mất glow hoặc silhouette.
- Frame cuối nên có impact/decay rõ để runtime kết thúc tự nhiên.

## Runtime

`createVltkSpriteSheetEffect` đọc các thuộc tính:

- `cols: 5`
- `rows: 5`
- `totalFrames: 25`
- `texturePath: 'assets/vfx/skills/<he>/<cap>_<pham>/vfx_sheet.png'`

Các skill Hoàng Cấp Hạ Phẩm ngoài hệ Kiếm đã được nối vào flipbook riêng trong `src/game-runtime.js`; các skill Kiếm hiện hữu tiếp tục dùng cấu hình frame riêng của chúng.

## Thay asset

Có thể thay trực tiếp `vfx_sheet.png` trong đúng thư mục skill. Không cần thay logic nếu vẫn giữ chuẩn 5×5, 1024×1024 và 25 frame.

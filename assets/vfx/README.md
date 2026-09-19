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

Các skill Hoàng Cấp Hạ Phẩm ngoài hệ Kiếm đã được nối vào flipbook riêng qua `src/skills/hoang-ha-vfx.js` và `src/runtime/legacy-runtime.js`; các skill Kiếm hiện hữu tiếp tục dùng cấu hình frame riêng của chúng.

## Hoàng Cấp · Hạ Phẩm

Chín hệ dùng chung chuẩn sheet 5×5 nhưng không còn dùng chung một cách thi triển. Dữ liệu art direction nằm tại `src/skills/hoang-ha-vfx.js`:

- Kiếm: tam kiếm liên kích, Kiếm Ý, chấn động ở hit cuối.
- Đao: ba đao khí quét hình quạt.
- Hỏa: hỏa cầu bay vòng cung, lưu hỏa ấn trên đất.
- Lôi: ba nhịp lôi châm giáng từ trời.
- Thủy: băng thương hội tụ và hàn ấn.
- Mộc: mộc thứ tự truy đuổi, để lại linh mộc ấn.
- Phong: phong nhận lượn, có thể xuyên mục tiêu thứ hai.
- Thổ: thạch kích trồi từ mặt đất theo ba nhịp.
- Kim: kim mang tách làn rồi hội tụ vào mục tiêu.

Mỗi hệ có màu lõi, âm thanh tụ lực/va chạm, pháp trận, cường độ rung camera và dấu ấn mặt đất riêng. Profile hiệu năng LOW/MEDIUM/HIGH vẫn giới hạn số hạt và VFX đang hoạt động.

## Thay asset

Có thể thay trực tiếp `vfx_sheet.png` trong đúng thư mục skill. Không cần thay logic nếu vẫn giữ chuẩn 5×5, 1024×1024 và 25 frame.

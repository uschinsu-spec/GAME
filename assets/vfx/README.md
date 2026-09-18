# VFX SKILL — 1 PNG RIÊNG CHO MỖI KỸ NĂNG

Thư mục này đã được chuẩn hóa để **mỗi skill có đúng 1 file PNG VFX riêng**.

## Cấu trúc

```text
assets/vfx/skills/
├── kiem/   16 PNG
├── dao/    16 PNG
├── hoa/    16 PNG
├── loi/    16 PNG
├── thuy/   16 PNG
├── moc/    16 PNG
├── phong/  16 PNG
├── tho/    16 PNG
└── kim/    16 PNG
```

Tổng cộng: **144 PNG VFX riêng**.

Tên file VFX giống hệt tên file icon skill tương ứng:

- `hoang_ha.png`
- `hoang_trung.png`
- `hoang_thuong.png`
- `hoang_cuc.png`
- `huyen_ha.png`
- `huyen_trung.png`
- `huyen_thuong.png`
- `huyen_cuc.png`
- `dia_ha.png`
- `dia_trung.png`
- `dia_thuong.png`
- `dia_cuc.png`
- `thien_ha.png`
- `thien_trung.png`
- `thien_thuong.png`
- `thien_cuc.png`

Ví dụ:

- Icon Hỏa Hoàng Hạ: `assets/skills/hoa/hoang_ha.png`
- VFX Hỏa Hoàng Hạ: `assets/vfx/skills/hoa/hoang_ha.png`

- Icon Kiếm Địa Cực: `assets/skills/kiem/dia_cuc.png`
- VFX Kiếm Địa Cực: `assets/vfx/skills/kiem/dia_cuc.png`

## Cách thay VFX

1. Chuẩn bị PNG nền trong suốt.
2. Giữ đúng tên file.
3. Chép đè đúng file trong `assets/vfx/skills/<he>/`.
4. Reload game. `game.js` tự lấy đúng PNG theo skill, không cần sửa JavaScript.

## Lưu ý triển khai hiện tại

144 file mới được khởi tạo từ 9 PNG VFX hệ cũ để giữ hình ảnh hiện tại và tránh làm hỏng game.
Mỗi đường dẫn bây giờ là độc lập: khi bạn thay một file, chỉ skill đó đổi VFX.

Game chỉ preload VFX của tối đa 4 skill đang trang bị để giảm RAM và thời gian tải trên điện thoại.
Các hiệu ứng Babylon cũ như ring/burst/slash vẫn được giữ làm lớp phụ trợ phía sau PNG.

# VFX SKILL — 1 PNG 3×3 RIÊNG CHO MỖI KỸ NĂNG

Toàn bộ hệ thống VFX skill dùng quy ước:

- Mỗi skill có đúng **1 file PNG**.
- Mỗi PNG là **sprite sheet 3×3**.
- Tổng cộng 144 skill = **144 PNG 3×3**.
- Game tự cắt đúng 1 ô khi render, không cần tách thành 9 file con.

## Bố cục 3×3 bắt buộc

```text
NW | N | NE
W  | C | E
SW | S | SE
```

Ý nghĩa:

- `C`: VFX trung tâm, dùng cho skill AoE/tại chỗ.
- `N`: hướng Bắc / +Z.
- `NE`: Đông Bắc.
- `E`: hướng Đông / +X.
- `SE`: Đông Nam.
- `S`: hướng Nam / -Z.
- `SW`: Tây Nam.
- `W`: hướng Tây / -X.
- `NW`: Tây Bắc.

## Ví dụ cấu trúc thư mục

```text
assets/vfx/skills/
├── kiem/
│   ├── hoang_ha.png
│   ├── hoang_trung.png
│   ├── hoang_thuong.png
│   ├── hoang_cuc.png
│   ├── huyen_ha.png
│   ├── huyen_trung.png
│   ├── huyen_thuong.png
│   ├── huyen_cuc.png
│   ├── dia_ha.png
│   ├── dia_trung.png
│   ├── dia_thuong.png
│   ├── dia_cuc.png
│   ├── thien_ha.png
│   ├── thien_trung.png
│   ├── thien_thuong.png
│   └── thien_cuc.png
├── dao/
├── hoa/
├── loi/
├── thuy/
├── moc/
├── phong/
├── tho/
└── kim/
```

## Cách game chọn ô

### Skill đơn mục tiêu / skill bay theo hướng

Game tính vector:

`player -> target`

sau đó tự snap về một trong 8 hướng và chọn đúng ô trong PNG 3×3.

### Skill AoE / skill nổ tại chỗ

Game dùng ô giữa:

`C = row 2, column 2`

## Quy chuẩn ảnh đề xuất

Khuyến nghị:

- PNG nền trong suốt.
- Kích thước tổng: **1536×1536 px**.
- Mỗi ô: **512×512 px**.
- Hoặc nhẹ hơn cho mobile:
  - tổng 768×768 px;
  - mỗi ô 256×256 px.
- 9 ô phải cùng style, cùng scale, cùng tâm anchor.
- Không có chữ.
- Không có nền.
- Không có đường chia ô.
- Không crop mất glow/VFX ở mép ô.
- Tâm hiệu ứng của từng ô phải nằm đúng tâm cell.

## Quy tắc thiết kế 8 hướng

8 ô xung quanh phải là cùng một skill nhưng đổi hướng thật sự, không chỉ xoay cả ảnh một cách máy móc nếu VFX có cấu trúc không đối xứng.

Ví dụ skill kiếm khí:

- N: mũi kiếm/luồng khí hướng lên.
- NE: chéo lên phải.
- E: sang phải.
- SE: chéo xuống phải.
- S: xuống.
- SW: chéo xuống trái.
- W: sang trái.
- NW: chéo lên trái.
- C: bản bùng nổ/tâm trận pháp tương ứng của chính skill đó.

## Thay asset

Ví dụ muốn thay VFX Hỏa Hoàng Hạ:

`assets/vfx/skills/hoa/hoang_ha.png`

Chỉ cần chép đè đúng PNG 3×3 này. Không cần sửa JavaScript.

## Lưu ý

Các PNG hiện có trong repo được giữ lại để không làm hỏng game ngay lập tức. Từ thời điểm này, file thay mới nên tuân đúng chuẩn 3×3 ở trên để game hiển thị đúng 8 hướng + tâm.

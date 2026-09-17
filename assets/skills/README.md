# HƯỚNG DẪN CẤU TRÚC VÀ THAY THẾ ASSET ICON KỸ NĂNG (SKILLS)

Toàn bộ icon kỹ năng trong game được quy chuẩn hóa và đặt trong thư mục `assets/skills/`. Từng hệ nguyên tố được phân thành thư mục riêng biệt giúp bạn dễ dàng thay đổi ảnh minh họa của từng chiêu thức mà không làm ảnh hưởng đến logic trò chơi.

---

## 1. Cấu Trúc Thư Mục Chuẩn

```text
assets/skills/
├── README.md               <-- Tài liệu hướng dẫn này
├── common/                 <-- Kỹ năng phụ trợ / dùng chung
│   └── dash.png            (Thân pháp lướt né)
├── kiem/                   <-- Hệ Kiếm (16 bí kíp)
│   ├── hoang_ha.png        (Thanh Phong Kiếm Thức)
│   ├── hoang_trung.png     (Lưu Vân Kiếm Khí)
│   ├── hoang_thuong.png    (Tật Điện Kiếm Thức)
│   ├── hoang_cuc.png       (Hồi Phong Kiếm Quyết)
│   ├── huyen_ha.png        (Quy Nguyên Kiếm Trận)
│   ├── huyen_trung.png     (Huyền Quang Kiếm Vũ)
│   ├── huyen_thuong.png    (Tứ Linh Kiếm Ảnh)
│   ├── huyen_cuc.png       (Thiên Kiếm Phá Toái)
│   ├── dia_ha.png          (Địa Sát Kiếm Lôi)
│   ├── dia_trung.png       (Bát Hoang Kiếm Nhận)
│   ├── dia_thuong.png      (Thái Ất Kiếm Cương)
│   ├── dia_cuc.png         (Vạn Kiếm Quy Tông)
│   ├── thien_ha.png        (Cửu Kiếp Kiếm Điển)
│   ├── thien_trung.png     (Tru Tiên Kiếm Trận)
│   ├── thien_thuong.png    (Hỗn Độn Kiếm Ý)
│   └── thien_cuc.png       (Nhất Niệm Trảm Chư Thiên)
├── dao/                    <-- Hệ Đao (16 bí kíp)
├── hoa/                    <-- Hệ Hỏa (16 bí kíp)
├── loi/                    <-- Hệ Lôi (16 bí kíp)
├── thuy/                   <-- Hệ Thủy (16 bí kíp)
├── moc/                    <-- Hệ Mộc (16 bí kíp)
├── phong/                  <-- Hệ Phong (16 bí kíp)
├── tho/                    <-- Hệ Thổ (16 bí kíp)
└── kim/                    <-- Hệ Kim (16 bí kíp)
```

---

## 2. Quy Ước Đặt Tên File

Tên mỗi file tuân theo cú pháp:
$$\mathbf{\{c\hat{a}p\_b\hat{a}c\}\_\{ph\hat{a}m\_v\text{ị}\}.png}$$

- **Cấp bậc (Tier)**:
  - `hoang`: Hoàng Cấp (Luyện Khí)
  - `huyen`: Huyền Cấp (Trúc Cơ)
  - `dia`: Địa Cấp (Kết Đan)
  - `thien`: Thiên Cấp (Nguyên Anh / Hóa Thần)
- **Phẩm vị (Rank)**:
  - `ha`: Hạ Phẩm (Đơn thể / Liên trảm)
  - `trung`: Trung Phẩm (AoE vừa)
  - `thuong`: Thượng Phẩm (AoE rộng)
  - `cuc`: Cực Phẩm (Đại thần thông)

---

## 3. Quy Chuẩn Đồ Họa Đề Xuất

- **Kích thước ảnh**: `128x128` px (hoặc `256x256` px).
- **Định dạng**: `PNG` có kênh trong suốt (Alpha Channel).
- **Khuyến nghị thiết kế**:
  - Nên bo tròn hoặc đặt trong khung tròn/bát giác.
  - Viền phẩm cấp khuyến nghị:
    - Hoàng Cấp: Viền Xanh Lục Bảo (`#3ca86c`) hoặc Đồng Cổ
    - Huyền Cấp: Viền Lam Ngọc (`#3182ce`)
    - Địa Cấp: Viền Tử Kim (`#805ad5` / `#d69e2e`)
    - Thiên Cấp: Viền Xích Kim / Hỏa Diễm Phát Quang (`#dd6b20` / `#ffd700`)

---

## 4. Cách Thay Thế Ảnh Kỹ Năng

1. Chuẩn bị ảnh PNG của bạn đúng kích thước (ví dụ `128x128`).
2. Đổi tên theo đúng cú pháp `{cấp}_{phẩm}.png`.
3. Chép đè file vào thư mục hệ tương ứng (ví dụ: muốn đổi ảnh chiêu *Vạn Kiếm Quy Tông*, chép đè vào `assets/skills/kiem/dia_cuc.png`).
4. Tải lại trang game trên trình duyệt (`Ctrl + F5`) để xem ngay icon mới!

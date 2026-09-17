# HƯỚNG DẪN CẤU TRÚC VÀ NÂNG CẤP ASSET BẢN ĐỒ (MAPS)

Toàn bộ asset môi trường cho các bản đồ trong game được chuẩn hóa và đặt trong thư mục `assets/maps/`. Mỗi khu vực / bản đồ là một thư mục riêng biệt giúp bạn dễ dàng thay đổi đồ họa, nâng cấp hình ảnh cây cối, đá, đèn lồng và mặt đất mà không cần can thiệp sâu vào code lõi.

---

## 1. Cấu Trúc Thư Mục Chuẩn

```text
assets/maps/
├── common/                     <-- Kho tài nguyên môi trường dùng chung (90 asset tiên cảnh)
│   ├── trees/                  (9 cây: cổ thụ, hoa đào, liễu rủ, tùng bách...)
│   ├── rocks/                  (10 vách núi đá, thạch nham, ụ đá rêu hoa...)
│   ├── plants/                 (8 bụi hoa mẫu đơn, cỏ đuôi chồn, linh thảo...)
│   ├── lanterns/               (10 đèn lồng gỗ, đèn đá rêu phong, trụ đèn...)
│   ├── fences_gates/           (13 hàng rào tre/gỗ, cổng chùa, chuông cổng...)
│   ├── buildings/              (11 nhà tranh, lầu ngọc, đình tạ, miếu mạo, lò rèn...)
│   ├── bridges_water/          (10 cầu gỗ, cầu đá, đầm sen, bến thuyền, thác nước...)
│   ├── props/                  (10 xe kéo dược liệu, vò rượu, thùng gỗ, giếng nước...)
│   ├── signs/                  (7 bia đá Thái Cực, biển chỉ đường, bảng cáo thị...)
│   └── magical/                (2 linh tinh ngọc bích, cột sáng thiên địa...)
│
└── thanh_van_thon/             <-- Tên định danh bản đồ cụ thể (vd: Thanh Vân Thôn)
    ├── trees/                  <-- Asset cây đang nạp vào map (PNG tách nền)
    ├── rocks/                  <-- Asset đá đang nạp vào map (PNG tách nền)
    ├── decor/                  <-- Asset cảnh trí, đèn lồng, công trình đang nạp (PNG)
    └── ground/                 <-- Texture bề mặt địa hình bản đồ (PNG)
```

---

## 2. Quy Chuẩn Đồ Họa (Khuyến Nghị Cho Người Dùng)

| Loại Asset | Thư mục | Định dạng | Kích thước đề xuất | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Cây cối (Trees)** | `trees/` | PNG (Transparent) | `512x512` px | Ảnh thẳng đứng, gốc cây nằm sát đáy ảnh để cắm đúng mặt đất. |
| **Đá (Rocks)** | `rocks/` | PNG (Transparent) | `384x384` hoặc `512x512` px | Đáy tảng đá nằm phẳng sát đáy ảnh. |
| **Đèn / Phụ kiện (Decor)** | `decor/` | PNG (Transparent) | `256x384` hoặc `256x256` px | Có độ trong suốt xung quanh, chân đế sát đáy ảnh. |
| **Mặt đất (Ground)** | `ground/` | PNG (Opaque) | `1024x1024` px | Texture bản đồ vuông nhìn từ trên xuống (top-down view). |

---

## 3. Cách Nâng Cấp Hoặc Thay Thế Đồ Họa

### Cách 1: Thay thế trực tiếp file PNG (Đơn giản nhất)
1. Chuẩn bị ảnh PNG của bạn với nền trong suốt (Alpha channel).
2. Lưu đè vào file tương ứng, ví dụ:
   - Muốn đổi cây: ghi đè file `assets/maps/thanh_van_thon/trees/tree_01.png`.
   - Muốn đổi đá: ghi đè file `assets/maps/thanh_van_thon/rocks/rock_01.png`.
   - Muốn đổi mặt đất: ghi đè file `assets/maps/thanh_van_thon/ground/ground.png`.
3. Tải lại trang web (F5 hoặc Ctrl+F5) là game tự động áp dụng đồ họa mới!

### Cách 2: Thêm nhiều loại cây / đá mới
Trong file `game.js`, tìm đối tượng `MAP_CONFIGS.thanh_van_thon`:
- Thêm file mới vào danh sách `trees`:
  ```javascript
  trees: [
    { file: 'assets/maps/thanh_van_thon/trees/tree_01.png', width: 3.8, height: 5.2 },
    { file: 'assets/maps/thanh_van_thon/trees/tree_02.png', width: 3.6, height: 5.0 },
    { file: 'assets/maps/thanh_van_thon/trees/tree_03.png', width: 2.8, height: 4.6 },
    { file: 'assets/maps/thanh_van_thon/trees/tree_04.png', width: 4.0, height: 5.5 } // Cây mới của bạn!
  ]
  ```
- Game sẽ tự động phân bổ ngẫu nhiên cây mới này vào cảnh quan!

### Cách 3: Tạo bản đồ mới (Ví dụ: Bạch Ngọc Thành)
1. Tạo thư mục `assets/maps/bach_ngoc_thanh/` với đầy đủ 4 thư mục con `trees/`, `rocks/`, `decor/`, `ground/`.
2. Khai báo vào `MAP_CONFIGS` trong `game.js`:
  ```javascript
  MAP_CONFIGS.bach_ngoc_thanh = {
    id: 'bach_ngoc_thanh',
    name: 'Bạch Ngọc Thành',
    folder: 'assets/maps/bach_ngoc_thanh',
    ...
  };
  ```
3. Khi người chơi dịch chuyển đến Bạch Ngọc Thành, toàn bộ cảnh trí sẽ được nạp từ thư mục mới!

---

## 4. Quy Chuẩn Đặt Trọng Tâm (Anchor / Pivot Point) Cho Asset 2.5D

Trong game 2.5D Isometric (camera nghiêng ~42° từ trên xuống), để vật thể đứng vững trên mặt đất mà không bị bay lơ lửng hay chìm quá sâu:

### A. Quy tắc khi xử lý ảnh PNG (Photoshop / AI / Canva)
1. **Cắt sát mép đáy (Bottom Edge Crop)**:
   - Điểm tiếp đất thấp nhất (chân cột, đầu rễ cây xòe dài nhất, chân nhân vật) **phải chạm sát hàng pixel dưới cùng của ảnh**.
   - Không chừa khoảng trống trong suốt thừa ở mép đáy bức ảnh.
2. **Căn giữa chiều ngang (Center Horizontal)**:
   - Trục thân cây/vật thể nên nằm ngay giữa chiều rộng bức ảnh (`X = Width / 2`) để bóng râm tròn nằm đối xứng quanh thân.

### B. Bảng tham chiếu tỉ lệ `yRatio` trong `game.js`
Tọa độ trục Y của vật thể được tính theo công thức:
$$\text{Position.Y} = \text{Height} \times \text{yRatio}$$

| Loại Asset | Đặc điểm hình thể | `yRatio` khuyến nghị | Giải thích hiệu ứng |
| :--- | :--- | :---: | :--- |
| **Cột đèn, Biển gỗ, Cọc rào** | Thân thẳng đứng, chân cọc tiếp đất phẳng | **`0.48`** | Chân cột cắm nhẹ 2% xuống đất, bóng râm ôm sát chân cột. |
| **Cây cổ thụ (Trees)** | Có bầu rễ, ụ đá, rêu phong xòe ra ở gốc | **`0.36 - 0.38`** | Phần chân rễ ngầm cắm sâu vào đất, ụ đá và rễ cây bám chặt trên thảm cỏ, không lơ lửng. |
| **Đá tảng (Rocks)** | Khối đá to có phần chìm dưới đất | **`0.40 - 0.42`** | Đáy đá lún 8-10% vào đất tạo cảm giác nặng trịch, tự nhiên. |
| **Bụi cỏ, Linh thảo (Grass)** | Bụi cỏ mọc từ lòng đất | **`0.35 - 0.37`** | Gốc rễ chìm dưới đất, các phiến lá vươn thẳng lên từ thảm cỏ. |
| **Nhân vật & Quái vật** | Sprite đứng trên hai chân | **`0.48`** | Hai bàn chân chạm đúng mặt phẳng đất, tâm bóng tròn đặt ngay dưới gót chân. |

### C. Cách tùy chỉnh `yRatio` cho từng asset trong code
Bạn có thể khai báo trực tiếp trường `yRatio` khi thêm asset mới vào `MAP_CONFIGS` trong `game.js`:
```javascript
trees: [
  { file: 'assets/maps/thanh_van_thon/trees/cay_dao.png', width: 4.6, height: 5.6, yRatio: 0.36 }
]
```
Nếu không điền `yRatio`, game sẽ tự động nhận diện theo tiền tố tên file để gán tỉ lệ tối ưu nhất!

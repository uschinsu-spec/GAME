# Hệ thống bản đồ Nhân Giới

Bản đồ được tách khỏi `game.js` và tổ chức phân tầng: `worlds -> continents -> regions -> maps`.

- `manifest.json`: manifest gốc, chỉ giữ default map, dải cảnh giới và danh sách catalog châu/vực.
- `worlds/nhan_gioi.json`: cấu trúc Nhân Giới.
- `continents/*.json`: mỗi châu/vực chứa metadata, 2 khu vực và 4 map.
- `<map_id>.json`: file riêng của từng map.
- `templates/*.json`: template môi trường dùng chung; map kế thừa qua trường `extends`.

Dải sức mạnh hiện tại: Luyện Khí Lv.1-12; Trúc Cơ Lv.13-40; Kết Đan Lv.41-68; Nguyên Anh Lv.69-96; Hóa Thần Lv.97+.

Save cũ dùng `S.region` được tự migrate sang `S.regionId`, vì vậy thêm hoặc sắp xếp map sẽ không làm nhân vật nhảy nhầm vùng.

Khi thêm map mới: tạo `maps/<map_id>.json`, thêm metadata vào catalog châu tương ứng, rồi thêm map id vào khu vực trong file châu. Asset riêng có thể đặt ở `assets/maps/<map_id>/`; nếu chưa có thì dùng `assets/maps/common/`.
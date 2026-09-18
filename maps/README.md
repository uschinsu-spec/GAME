# Dữ liệu bản đồ

Mỗi map được lưu trong một file JSON riêng để game.js không phình to khi số lượng map tăng lên.

## Cấu trúc

- manifest.json: danh sách map, cấp độ, quái và đường dẫn file.
- thanh_van_thon.json: toàn bộ cấu hình, asset và bố cục Thanh Vân Thôn.
- Các map mới dùng tên file trùng với id, ví dụ bach_ngoc_thanh.json.

## Thêm map mới

1. Sao chép một file map JSON hiện có và đổi id, name cùng nội dung bố cục.
2. Thêm một mục vào mảng maps trong manifest.json.
3. Đặt asset riêng trong assets/maps/<map_id>/ hoặc dùng asset chung trong assets/maps/common/.
4. Map chỉ được tải khi người chơi vào khu vực đó; các file map khác không làm chậm lần mở game đầu tiên.

Nếu file của một khu vực chưa tồn tại, bộ nạp sẽ dùng map mặc định thanh_van_thon để game vẫn hoạt động.


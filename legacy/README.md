# Legacy compatibility files

Các file `game_before_*`, `index_before_*`, `boot.js`, `skill-runtime.js`, `world-runtime.js` và `editormap.htlm` được giữ nguyên để đối chiếu hoặc chuyển hướng tương thích.

Production chỉ boot theo một luồng: `index.html` → core services → data/gameplay modules → `game.js`. Không file backup hay source-patcher nào được load bởi `index.html` hoặc Service Worker.

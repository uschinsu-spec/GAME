// Server phát triển cục bộ Tu Tiên Chi Lộ
// Chạy: node server.js [cổng - mặc định 8000]
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2] || process.env.PORT || '8000', 10);
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS & No-cache headers for dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API quét toàn bộ asset trong thư mục assets/maps/common/ và assets/MAP/
  if (req.method === 'GET' && req.url.startsWith('/api/scan-assets')) {
    try {
      const result = {};

      function addFile(cat, filePath, fileName) {
        if (!result[cat]) result[cat] = [];
        let relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
        // Lưu đối tượng hoặc đường dẫn
        result[cat].push({ file: fileName, path: relPath, category: cat });
      }

      function scanDir(dirPath, categoryName) {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        entries.forEach(entry => {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            let subCat = categoryName ? `${categoryName}/${entry.name}` : entry.name;
            scanDir(fullPath, subCat);
          } else if (entry.isFile() && /\.(png|webp|jpg|jpeg|svg)$/i.test(entry.name)) {
            addFile(categoryName || 'misc', fullPath, entry.name);
          }
        });
      }

      // 1. Quét assets/maps/common/
      const commonDir = path.join(ROOT_DIR, 'assets', 'maps', 'common');
      if (fs.existsSync(commonDir)) {
        const subDirs = fs.readdirSync(commonDir, { withFileTypes: true });
        subDirs.forEach(sub => {
          const subPath = path.join(commonDir, sub.name);
          if (sub.isDirectory()) {
            scanDir(subPath, sub.name);
          } else if (sub.isFile() && /\.(png|webp|jpg|jpeg|svg)$/i.test(sub.name)) {
            addFile('grounds', subPath, sub.name);
          }
        });
      }

      // 2. Quét assets/MAP/ (và các thư mục con trong MAP)
      const mapDir = path.join(ROOT_DIR, 'assets', 'MAP');
      if (fs.existsSync(mapDir)) {
        scanDir(mapDir, 'MAP');
      }

      // 3. Quét assets/maps/ (nếu có file ảnh trực tiếp)
      const mapsRoot = path.join(ROOT_DIR, 'assets', 'maps');
      if (fs.existsSync(mapsRoot)) {
        const entries = fs.readdirSync(mapsRoot, { withFileTypes: true });
        entries.forEach(e => {
          if (e.isFile() && /\.(png|webp|jpg|jpeg|svg)$/i.test(e.name)) {
            addFile('MAP', path.join(mapsRoot, e.name), e.name);
          }
        });
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, files: result }));
      let summary = Object.keys(result).map(k => `${k}: ${result[k].length}`).join(', ');
      console.log('[ScanAssets] Đã quét toàn bộ thư mục asset (bao gồm assets/MAP):', summary);
    } catch (err) {
      console.error('[ScanAssets] Lỗi:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // API lưu map trực tiếp vào thư mục maps/
  if (req.method === 'POST' && req.url === '/api/save-map') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { mapId, content } = JSON.parse(body);
        if (!mapId || !content) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Thiếu mapId hoặc content' }));
          return;
        }
        const safeMapId = path.basename(mapId);
        const targetPath = path.join(ROOT_DIR, 'maps', safeMapId + '.json');
        fs.writeFileSync(targetPath, typeof content === 'string' ? content : JSON.stringify(content, null, 2), 'utf-8');
        console.log(`[SaveMap] Đã ghi đè file map vào ổ đĩa: maps/${safeMapId}.json`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, file: `maps/${safeMapId}.json` }));
      } catch (err) {
        console.error('[SaveMap] Lỗi:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // Phục vụ file tĩnh
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(ROOT_DIR, reqPath);

  // Ngăn chặn directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  console.log(`\n🎮 [Tu Tiên Chi Lộ] Máy chủ đang chạy tại:`);
  console.log(`   👉 Trên máy tính: http://localhost:${PORT}/index.html`);
  console.log(`   👉 Map Editor:    http://localhost:${PORT}/editormap.html`);
  
  Object.keys(ifaces).forEach(name => {
    ifaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   👉 Trên điện thoại: http://${iface.address}:${PORT}/index.html`);
      }
    });
  });
  console.log(`\n💡 Khi chỉnh sửa trong Map Editor và ấn Lưu, file trong thư mục maps/ sẽ tự động cập nhật ngay lập tức!\n`);
});

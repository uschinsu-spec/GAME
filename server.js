const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
});

const server = http.createServer((req, res) => {
  req.on('error', (err) => {
    console.warn('[Server] Req error:', err.message);
  });
  res.on('error', (err) => {
    console.warn('[Server] Res error:', err.message);
  });

  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const safeBase = path.resolve(__dirname);
  const filePath = path.resolve(path.join(safeBase, reqPath));

  // Security check: ensure path is strictly within __dirname
  if (!filePath.startsWith(safeBase + path.sep) && filePath !== safeBase) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.warn('[Server] Stream error:', streamErr.message);
      if (!res.headersSent) {
        res.writeHead(500);
      }
      res.end();
    });

    req.on('close', () => {
      stream.destroy();
    });

    stream.pipe(res);
  });
});

function listenOnPort(portToTry) {
  server.removeAllListeners('error');
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = portToTry + 1;
      console.log(`Port ${portToTry} in use, retrying on ${nextPort}...`);
      listenOnPort(nextPort);
    } else {
      console.error('[Server] Server error:', err);
    }
  });

  server.listen(portToTry, () => {
    const url = `http://localhost:${portToTry}/`;
    console.log(`Server running at ${url}`);

    if (process.argv.includes('--open')) {
      const startCmd = process.platform === 'win32'
        ? `start "" "${url}"`
        : (process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);
      exec(startCmd, (err) => {
        if (err) console.warn('[Server] Could not auto-launch browser:', err.message);
      });
    }
  });
}

listenOnPort(PORT);


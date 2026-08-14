// 极简静态文件服务器，用于本地预览 dist/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = process.env.PORT || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  let filePath = path.join(DIST, urlPath);
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end('Forbidden'); return; }
  if (!fs.existsSync(filePath)) {
    // 尝试加 .html 或 index.html
    if (!urlPath.endsWith('.html') && fs.existsSync(filePath + '.html')) filePath += '.html';
    else if (fs.existsSync(path.join(filePath, 'index.html'))) filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    // SPA 兜底到首页
    filePath = path.join(DIST, 'index.html');
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`🚀 本地预览：http://localhost:${PORT}`);
});

// Optional local preview. The game also works by opening index.html directly.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const base = __dirname;
const port = Number(process.env.BUNRI_PORT || 8792);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mp3': 'audio/mpeg', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
const server = http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  let name;
  try { name = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { response.writeHead(400); response.end(); return; }
  const target = path.resolve(base, '.' + (name === '/' ? '/index.html' : name));
  const relative = path.relative(base, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); response.end(); return; }
  fs.readFile(target, (error, data) => {
    if (error) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : data);
  });
});
server.listen(port, '127.0.0.1', () => console.log(`Bunri Prince preview: http://127.0.0.1:${port}`));

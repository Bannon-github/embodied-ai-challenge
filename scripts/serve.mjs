import http from 'node:http';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const routes = new Map([
  ['/site/', ['site/index.html', 'text/html']],
  ['/site/index.html', ['site/index.html', 'text/html']],
  ['/site/app.js', ['site/app.js', 'text/javascript']],
  ['/site/styles.css', ['site/styles.css', 'text/css']],
  ['/data/status.json', ['data/status.json', 'application/json']],
]);
const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  const path = new URL(request.url, 'http://localhost').pathname;
  if (path === '/') { response.writeHead(302, { Location: '/site/' }); response.end(); return; }
  const route = routes.get(path);
  if (!route) { response.writeHead(404); response.end('Not found'); return; }
  try {
    const body = await readFile(new URL(route[0], root));
    response.writeHead(200, { 'Content-Type': `${route[1]}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(500); response.end('Unable to load public asset'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(8080, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:8080/site/'));

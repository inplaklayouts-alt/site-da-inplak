// Servidor local para visualizar dist/ (sem PHP: o formulário só funciona na hospedagem
// ou com "php -S localhost:8080 -t dist scripts/dev-router.php").
// Uso: npm run dev   → http://localhost:8080

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT) || 8080;
// Para testar o build do GitHub Pages numa subpasta: BASE_PATH=/site-da-inplak
const base = (process.env.BASE_PATH || '').replace(/\/+$/, '');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  let file = path.normalize(path.join(dist, clean));
  if (!file.startsWith(dist)) return null;
  try {
    const st = await stat(file);
    if (st.isDirectory()) file = path.join(file, 'index.html');
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  let urlPath = req.url || '/';
  if (base) {
    if (urlPath === base) {
      res.writeHead(301, { Location: base + '/' });
      return res.end();
    }
    if (!urlPath.startsWith(base + '/')) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Fora do site (' + base + '/)');
    }
    urlPath = urlPath.slice(base.length);
  }
  // Diretório sem barra final: redireciona como o Apache faz.
  if (!path.extname(urlPath.split('?')[0]) && !urlPath.split('?')[0].endsWith('/')) {
    const dir = await resolveFile(urlPath + '/');
    if (dir) {
      res.writeHead(301, { Location: base + urlPath.split('?')[0] + '/' + (urlPath.includes('?') ? '?' + urlPath.split('?')[1] : '') });
      return res.end();
    }
  }
  const file = await resolveFile(urlPath);
  if (!file) {
    const body = await readFile(path.join(dist, '404.html'));
    res.writeHead(404, { 'Content-Type': types['.html'] });
    return res.end(body);
  }
  const body = await readFile(file);
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  res.end(body);
}).listen(port, () => console.log(`Site em http://localhost:${port}${base}/`));

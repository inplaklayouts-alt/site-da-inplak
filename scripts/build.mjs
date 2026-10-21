// Gera o site estático em dist/.
//
//   npm run build              → GitHub Pages (padrão; sem PHP e sem .htaccess)
//   npm run build:hostinger    → Hostinger (inclui o formulário em PHP e o .htaccess)
//
// Opções (linha de comando ou variáveis de ambiente):
//   --site-url=https://usuario.github.io/site-da-inplak   (SITE_URL)  endereço público; a subpasta vira prefixo dos links
//   --target=github|hostinger                               (TARGET)
//   --form-provider=apps-script|php  --form-endpoint=URL    (FORM_PROVIDER, FORM_ENDPOINT)

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { site, formMode } from '../src/content/site.mjs';
import { services } from '../src/content/services.mjs';
import { cases } from '../src/content/cases.mjs';
import { posts } from '../src/content/posts.mjs';
import { legacyRedirects } from '../src/content/legacy.mjs';
import { layout } from '../src/templates/layout.mjs';
import { csp } from '../src/templates/security.mjs';
import { homePage } from '../src/templates/pages/home.mjs';
import { servicesIndexPage, servicePage, supermarketsPage } from '../src/templates/pages/services.mjs';
import { projectsPage, casesIndexPage, casePage } from '../src/templates/pages/portfolio.mjs';
import { aboutPage, contactPage, faqPage, thanksPage, notFoundPage, privacyPage } from '../src/templates/pages/institutional.mjs';
import { blogIndexPage, postPage } from '../src/templates/pages/blog.mjs';
import { folderPage } from '../src/templates/pages/folder.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const base = site.basePath;
const github = site.target === 'github';
const t0 = Date.now();

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// ---------- Prefixo da subpasta (GitHub Pages sem domínio próprio) ----------

function withBase(html) {
  if (!base) return html;
  return html
    .replace(/(\s(?:href|src|action|data-full|data-case))="\/(?!\/)/g, `$1="${base}/`)
    .replace(/(\s(?:srcset|imagesrcset))="([^"]*)"/g, (m, attr, value) =>
      `${attr}="${value
        .split(',')
        .map((part) => part.trim())
        .map((part) => (part.startsWith('/') && !part.startsWith('//') ? base + part : part))
        .join(', ')}"`,
    );
}

// ---------- CSS e JS ----------

const css = readFileSync(path.join(root, 'src/assets/css/main.css'), 'utf8');
const js = readFileSync(path.join(root, 'src/assets/js/main.js'), 'utf8');

function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

const cssMin = minifyCss(css);
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);
const cssVersion = hash(cssMin);
const jsVersion = hash(js);
mkdirSync(path.join(dist, 'assets/css'), { recursive: true });
mkdirSync(path.join(dist, 'assets/js'), { recursive: true });
writeFileSync(path.join(dist, 'assets/css/main.css'), cssMin);
writeFileSync(path.join(dist, 'assets/js/main.js'), js);
cpSync(path.join(root, 'src/assets/vendor'), path.join(dist, 'assets/vendor'), { recursive: true });

// Service worker na raiz do site (cache de longo prazo + páginas sem internet).
writeFileSync(
  path.join(dist, 'sw.js'),
  readFileSync(path.join(root, 'src/assets/sw.js'), 'utf8')
    .replace("var VERSION = '__VERSION__';", `var VERSION = '${hash(cssVersion + jsVersion)}';`)
    .replace("var BASE = '__BASE__';", `var BASE = '${base}';`),
);

// ---------- Páginas ----------

const pages = [
  homePage(),
  servicesIndexPage(),
  ...services.map((s) => servicePage(s.slug)),
  supermarketsPage(),
  projectsPage(),
  casesIndexPage(),
  ...cases.map((c) => casePage(c.slug)),
  folderPage(),
  aboutPage(),
  contactPage(),
  faqPage(),
  blogIndexPage(),
  ...posts.map((p) => postPage(p.slug)),
  privacyPage(),
  thanksPage(),
  notFoundPage(),
];

const seenTitles = new Map();
for (const { page, content } of pages) {
  if (seenTitles.has(page.title)) throw new Error(`Título repetido: ${page.title}`);
  seenTitles.set(page.title, page.path);
  if (page.description.length > 170) console.warn(`! descrição longa (${page.description.length}) em ${page.path}`);

  const out = withBase(
    layout(page, content)
      .replace('__CSS_VERSION__', cssVersion)
      .replace('__JS_VERSION__', jsVersion)
      .replace(/\n\s*\n+/g, '\n'),
  );
  const file = page.path.endsWith('.html') ? path.join(dist, page.path) : path.join(dist, page.path, 'index.html');
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, out);
}

// ---------- Imagens ----------

const media = path.join(root, 'media');
for (const dir of ['fotos', 'marca', 'clientes', 'icones', 'og', 'folder']) {
  cpSync(path.join(media, dir), path.join(dist, 'img', dir), { recursive: true });
}
cpSync(path.join(media, 'icones', 'favicon.ico'), path.join(dist, 'favicon.ico'));
cpSync(path.join(media, 'icones', 'apple-touch-icon.png'), path.join(dist, 'apple-touch-icon.png'));

// ---------- Arquivos estáticos ----------

if (github) {
  // GitHub Pages: sem PHP nem .htaccess (seriam servidos como texto). O ".nojekyll" faz o GitHub
  // publicar os arquivos como estão, inclusive a pasta .well-known.
  cpSync(path.join(root, 'src/static/.well-known'), path.join(dist, '.well-known'), { recursive: true });
  writeFileSync(path.join(dist, '.nojekyll'), '');
  const host = new URL(site.url).hostname;
  if (!host.endsWith('.github.io')) writeFileSync(path.join(dist, 'CNAME'), host + '\n');
} else {
  cpSync(path.join(root, 'src/static'), dist, { recursive: true });
  const htaccess = path.join(dist, '.htaccess');
  writeFileSync(htaccess, readFileSync(htaccess, 'utf8').replace('__CSP__', csp()));
}

// ---------- Endereços antigos (GitHub Pages: páginas de redirecionamento) ----------

let stubs = 0;
if (github) {
  for (const [from, to] of legacyRedirects) {
    const file = path.join(dist, from, 'index.html');
    if (existsSync(file)) continue;
    const target = base + to;
    const abs = site.url + to;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(
      file,
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Página movida | Inplak</title>` +
        `<meta name="robots" content="noindex"><link rel="canonical" href="${abs}">` +
        `<meta http-equiv="refresh" content="0; url=${target}"><script>location.replace(${JSON.stringify(target)})</script></head>` +
        `<body><p>Esta página mudou de endereço: <a href="${target}">${abs}</a></p></body></html>\n`,
    );
    stubs++;
  }
}

// ---------- Manifest, robots e sitemap ----------

writeFileSync(
  path.join(dist, 'site.webmanifest'),
  JSON.stringify(
    {
      name: site.name,
      short_name: 'Inplak',
      description: 'Comunicação visual, fachadas e mobiliário para o varejo.',
      lang: site.lang,
      start_url: `${base}/`,
      scope: `${base}/`,
      display: 'browser',
      background_color: '#ffffff',
      theme_color: site.themeColor,
      icons: [
        { src: `${base}/img/icones/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}/img/icones/icon-512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${base}/img/icones/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  ),
);

writeFileSync(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: ${base}/api/\nDisallow: ${base}/obrigado/\n\nSitemap: ${site.url}/sitemap.xml\n`,
);

const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter(({ page }) => !page.noindex);
const priority = (p) => (p === '/' ? '1.0' : /^\/(servicos|supermercados|contato|folder)\//.test(p) ? '0.9' : /^\/(projetos|cases)\//.test(p) ? '0.8' : '0.6');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map(({ page }) => `  <url><loc>${site.url}${page.path}</loc><lastmod>${page.article?.date || today}</lastmod><priority>${priority(page.path)}</priority></url>`)
  .join('\n')}
</urlset>
`;
writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);

// ---------- Relatório ----------

function dirSize(dir) {
  return readdirSync(dir).reduce((sum, f) => {
    const p = path.join(dir, f);
    const st = statSync(p);
    return sum + (st.isDirectory() ? dirSize(p) : st.size);
  }, 0);
}

console.log(`✓ ${pages.length} páginas geradas em ${Date.now() - t0} ms · alvo: ${site.target} · ${site.url}`);
console.log(`  formulário: ${formMode()}${site.form.endpoint ? ' (' + site.form.endpoint + ')' : ''} · redirecionamentos antigos: ${github ? stubs + ' páginas' : '.htaccess'}`);
console.log(`  CSS ${(cssMin.length / 1024).toFixed(1)} KB · JS ${(js.length / 1024).toFixed(1)} KB · dist ${(dirSize(dist) / 1024 / 1024).toFixed(1)} MB`);
if (!github && !existsSync(path.join(dist, 'api', 'contato.php'))) console.warn('! api/contato.php não encontrado');

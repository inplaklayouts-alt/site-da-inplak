import { site, waLink, telLink } from '../content/site.mjs';
import { services, supermarkets } from '../content/services.mjs';
import { esc, icon, picture, join } from './lib.mjs';
import { ctaBand } from './components.mjs';
import { csp } from './security.mjs';

export const nav = [
  {
    label: 'Serviços',
    href: '/servicos/',
    children: [
      ...services.map((s) => ({ label: s.menuLabel, href: `/servicos/${s.slug}/`, icon: s.icon, text: s.cardText })),
      { label: 'Para supermercados', href: `/${supermarkets.slug}/`, icon: 'layers', text: 'Tudo o que um supermercado precisa, da fachada ao último corredor.' },
    ],
  },
  { label: 'Projetos', href: '/projetos/' },
  { label: 'Cases', href: '/cases/' },
  { label: 'Folder', href: '/folder/', badge: true },
  { label: 'Sobre', href: '/sobre/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contato', href: '/contato/' },
];

const hasAnalytics = () => Boolean(site.analytics.ga4 || site.analytics.gtm);

function isActive(itemHref, pagePath) {
  if (itemHref === '/') return pagePath === '/';
  return pagePath.startsWith(itemHref) || (itemHref === '/servicos/' && pagePath === `/${supermarkets.slug}/`);
}

// ---------- Dados estruturados ----------

export function orgSchema() {
  return {
    '@type': 'LocalBusiness',
    '@id': `${site.url}/#empresa`,
    name: site.name,
    alternateName: site.brand,
    legalName: site.legalName,
    taxID: site.cnpj,
    slogan: site.slogan,
    url: `${site.url}/`,
    logo: `${site.url}/img/icones/icon-512.png`,
    image: `${site.url}/img/og/og-padrao.jpg`,
    description:
      'Comunicação visual, fachadas, totens, sinalização e mobiliário sob medida para supermercados, redes e empresas. Projeto, produção e instalação.',
    telephone: site.phone.e164,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lng },
    hasMap: site.mapsUrl,
    openingHoursSpecification: site.hours.schema.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: { '@type': 'Country', name: 'Brasil' },
    paymentAccepted: 'Cartão de crédito, cartão de débito, Cartão BNDES',
    currenciesAccepted: 'BRL',
    sameAs: site.social.map((s) => s.url),
    knowsAbout: ['Comunicação visual', 'Fachadas em ACM', 'Letras caixa', 'Totens', 'Sinalização interna', 'Mobiliário comercial', 'Marcenaria'],
  };
}

function baseSchema(page) {
  const graph = [
    orgSchema(),
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#site`,
      url: `${site.url}/`,
      name: site.name,
      inLanguage: site.lang,
      publisher: { '@id': `${site.url}/#empresa` },
    },
    {
      '@type': page.pageType || 'WebPage',
      '@id': `${site.url}${page.path}#pagina`,
      url: `${site.url}${page.path}`,
      name: page.title,
      description: page.description,
      inLanguage: site.lang,
      isPartOf: { '@id': `${site.url}/#site` },
      about: { '@id': `${site.url}/#empresa` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${site.url}/img/og/${page.og || 'og-padrao'}.jpg` },
      ...(page.breadcrumbs ? { breadcrumb: { '@id': `${site.url}${page.path}#breadcrumb` } } : {}),
    },
  ];
  if (page.breadcrumbs) {
    const items = [{ name: 'Início', path: '/' }, ...page.breadcrumbs];
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${site.url}${page.path}#breadcrumb`,
      itemListElement: items.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: `${site.url}${b.path}`,
      })),
    });
  }
  graph.push(...(page.schema || []));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

// ---------- Cabeçalho ----------

function topbar() {
  return `
<div class="topbar">
  <div class="container topbar__inner">
    <p class="topbar__item">${icon('clock', { size: 15 })} ${esc(site.hours.short)}</p>
    <p class="topbar__item">${icon('globe', { size: 15 })} Atendimento em todo o Brasil</p>
    <a class="topbar__item topbar__folder" href="/folder/" data-track="cta_click" data-track-label="topbar_folder">${icon('book', { size: 15 })} Folheie nosso folder virtual</a>
    <div class="topbar__right">
      <a class="topbar__item" href="${telLink}" data-track="phone_click">${icon('phone', { size: 15 })} ${esc(site.phone.display)}</a>
      <a class="topbar__item" href="mailto:${site.email}" data-track="email_click">${icon('mail', { size: 15 })} ${esc(site.email)}</a>
      ${join(site.social, (s) => `<a class="topbar__social" href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.name)} da Inplak (abre em nova aba)">${icon(s.icon, { size: 16 })}</a>`)}
    </div>
  </div>
</div>`;
}

function desktopNav(pagePath) {
  return `
<nav class="nav" aria-label="Menu principal">
  <ul class="nav__list">
    ${join(nav, (item) => {
      const active = isActive(item.href, pagePath);
      if (!item.children) {
        return `<li class="nav__item"><a class="nav__link${active ? ' is-active' : ''}" href="${item.href}"${active ? ' aria-current="page"' : ''}>${esc(item.label)}${item.badge ? '<span class="nav__dot" aria-hidden="true"></span>' : ''}</a></li>`;
      }
      return `
    <li class="nav__item nav__item--sub" data-dropdown>
      <a class="nav__link${active ? ' is-active' : ''}" href="${item.href}"${pagePath === item.href ? ' aria-current="page"' : ''}>${esc(item.label)}</a>
      <button class="nav__sub-toggle" type="button" aria-expanded="false" aria-controls="submenu-servicos" data-dropdown-toggle>
        ${icon('chevronDown', { size: 16 })}<span class="sr-only">Mostrar serviços</span>
      </button>
      <div class="nav__sub" id="submenu-servicos" data-dropdown-panel>
        <ul class="nav__sub-list">
          ${join(
            item.children,
            (c) => `
          <li><a class="nav__sub-link" href="${c.href}"${pagePath === c.href ? ' aria-current="page"' : ''}>
            <span class="nav__sub-icon">${icon(c.icon, { size: 22 })}</span>
            <span><strong>${esc(c.label)}</strong><small>${esc(c.text)}</small></span>
          </a></li>`,
          )}
        </ul>
        <a class="nav__sub-all" href="/servicos/">Ver todos os serviços ${icon('arrow', { size: 16 })}</a>
      </div>
    </li>`;
    })}
  </ul>
</nav>`;
}

function mobileMenu(pagePath) {
  return `
<div class="mobile-menu" id="menu-mobile" data-mobile-menu hidden>
  <div class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="mobile-menu__head">
      <a class="brand" href="/" aria-label="${esc(site.name)} — página inicial">${picture('logo-inplak-branco', { alt: '', sizes: '140px', eager: true })}</a>
      <button class="icon-btn" type="button" data-mobile-close aria-label="Fechar menu">${icon('close', { size: 24 })}</button>
    </div>
    <nav aria-label="Menu principal (celular)">
      <ul class="mobile-menu__list">
        <li><a href="/"${pagePath === '/' ? ' aria-current="page"' : ''}>Início</a></li>
        ${join(nav, (item) =>
          item.children
            ? `<li><a href="${item.href}"${pagePath === item.href ? ' aria-current="page"' : ''}>${esc(item.label)}</a>
          <ul class="mobile-menu__sub">${join(item.children, (c) => `<li><a href="${c.href}"${pagePath === c.href ? ' aria-current="page"' : ''}>${icon(c.icon, { size: 18 })} ${esc(c.label)}</a></li>`)}</ul></li>`
            : `<li><a href="${item.href}"${isActive(item.href, pagePath) ? ' aria-current="page"' : ''}>${esc(item.label)}</a></li>`,
        )}
        <li><a href="/faq/"${pagePath === '/faq/' ? ' aria-current="page"' : ''}>Perguntas frequentes</a></li>
      </ul>
    </nav>
    <div class="mobile-menu__actions">
      <a class="btn btn--primary btn--block" href="/contato/#orcamento">Solicitar orçamento</a>
      <a class="btn btn--whatsapp btn--block" href="${waLink()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="menu_mobile">${icon('whatsapp', { size: 20 })} Chamar no WhatsApp</a>
      <a class="btn btn--ghost-light btn--block" href="${telLink}" data-track="phone_click">${icon('phone', { size: 18 })} ${esc(site.phone.display)}</a>
    </div>
    <div class="mobile-menu__social">
      ${join(site.social, (s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.name)} da Inplak (abre em nova aba)">${icon(s.icon, { size: 22 })}</a>`)}
    </div>
  </div>
</div>`;
}

function header(page) {
  const quoteHref = page.hasForm ? '#orcamento' : '/contato/#orcamento';
  return `
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
${topbar()}
<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="${esc(site.name)} — página inicial">${picture('logo-inplak-branco', { alt: '', sizes: '(max-width: 640px) 120px, 150px', eager: true })}</a>
    ${desktopNav(page.path)}
    <div class="site-header__actions">
      <a class="icon-btn icon-btn--wa" href="${waLink(page.waMessage)}" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp (abre em nova aba)" data-track="whatsapp_click" data-track-label="header">${icon('whatsapp', { size: 20 })}</a>
      <a class="btn btn--primary btn--sm site-header__cta" href="${quoteHref}" data-track="cta_click" data-track-label="header_orcamento">Solicitar orçamento</a>
      <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="menu-mobile" data-mobile-open aria-label="Abrir menu">${icon('menu', { size: 26 })}</button>
    </div>
  </div>
</header>
${mobileMenu(page.path)}`;
}

// ---------- Rodapé ----------

function footer(page) {
  const year = new Date().getFullYear();
  return `
${page.hideCtaBand ? '' : ctaBand(page)}
<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <a class="brand" href="/" aria-label="${esc(site.name)} — página inicial">${picture('logo-inplak-branco', { alt: '', sizes: '180px' })}</a>
      <p>Comunicação visual, fachadas, totens, sinalização e mobiliário sob medida. Projeto, produção e instalação para supermercados, redes e empresas de todo o Brasil.</p>
      <div class="site-footer__social">
        ${join(site.social, (s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${esc(s.name)} da Inplak (abre em nova aba)">${icon(s.icon, { size: 20 })}</a>`)}
      </div>
    </div>
    <nav class="site-footer__col" aria-label="Serviços">
      <h2 class="site-footer__title">Serviços</h2>
      <ul>
        ${join(services, (s) => `<li><a href="/servicos/${s.slug}/">${esc(s.menuLabel)}</a></li>`)}
        <li><a href="/${supermarkets.slug}/">Para supermercados</a></li>
      </ul>
    </nav>
    <nav class="site-footer__col" aria-label="Institucional">
      <h2 class="site-footer__title">Empresa</h2>
      <ul>
        <li><a href="/sobre/">Sobre a Inplak</a></li>
        <li><a href="/folder/">Folder virtual</a></li>
        <li><a href="/projetos/">Projetos</a></li>
        <li><a href="/cases/">Cases</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/faq/">Perguntas frequentes</a></li>
        <li><a href="/contato/">Contato</a></li>
      </ul>
    </nav>
    <div class="site-footer__col">
      <h2 class="site-footer__title">Contato</h2>
      <ul class="site-footer__contact">
        <li><a href="${waLink()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="footer">${icon('whatsapp', { size: 18 })} ${esc(site.phone.display)}</a></li>
        <li><a href="${telLink}" data-track="phone_click">${icon('phone', { size: 18 })} Ligar para ${esc(site.phone.display)}</a></li>
        <li><a href="mailto:${site.email}" data-track="email_click">${icon('mail', { size: 18 })} ${esc(site.email)}</a></li>
        <li><a href="${site.mapsUrl}" target="_blank" rel="noopener">${icon('pin', { size: 18 })} <span>${esc(site.address.street)} — ${esc(site.address.district)}<br>${esc(site.address.city)}/${esc(site.address.state)} · ${esc(site.address.zip)}</span></a></li>
        <li><span>${icon('clock', { size: 18 })} ${esc(site.hours.display)}</span></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__bottom">
    <p>© ${year} ${esc(site.legalName)} · CNPJ ${esc(site.cnpj)}</p>
    <p class="site-footer__links">
      <a href="/politica-de-privacidade/">Política de privacidade</a>
      ${hasAnalytics() ? '<button type="button" class="link-btn" data-cookie-settings>Preferências de cookies</button>' : ''}
    </p>
  </div>
</footer>`;
}

function floatingContact(page) {
  return `
<a class="wa-float" href="${waLink(page.waMessage)}" target="_blank" rel="noopener" aria-label="Conversar com a Inplak no WhatsApp (abre em nova aba)" data-track="whatsapp_click" data-track-label="botao_flutuante">
  ${picture('whatsapp-camaleao', { alt: '', sizes: '64px' })}
</a>
<div class="mobile-bar" data-mobile-bar>
  <a class="btn btn--whatsapp" href="${waLink(page.waMessage)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="barra_mobile">${icon('whatsapp', { size: 20 })} WhatsApp</a>
  <a class="btn btn--primary" href="${page.hasForm ? '#orcamento' : '/contato/#orcamento'}" data-track="cta_click" data-track-label="barra_mobile_orcamento">Orçamento</a>
  <a class="icon-btn icon-btn--call" href="${telLink}" aria-label="Ligar para a Inplak" data-track="phone_click">${icon('phone', { size: 20 })}</a>
</div>`;
}

function cookieBanner() {
  if (!hasAnalytics()) return '';
  return `
<div class="cookie" data-cookie-banner hidden role="region" aria-label="Aviso de cookies">
  <div class="cookie__inner">
    <p class="cookie__text">Usamos cookies de medição (Google Analytics) para entender como o site é usado e melhorar o atendimento. Eles só são ativados com a sua permissão. Saiba mais na <a href="/politica-de-privacidade/#cookies">Política de privacidade</a>.</p>
    <div class="cookie__actions">
      <button type="button" class="btn btn--ghost btn--sm" data-cookie-reject>Recusar</button>
      <button type="button" class="btn btn--primary btn--sm" data-cookie-accept>Aceitar</button>
    </div>
  </div>
</div>`;
}

// ---------- Documento ----------

export function layout(page, content) {
  const canonical = `${site.url}${page.path}`;
  const ogImage = `${site.url}/img/og/${page.og || 'og-padrao'}.jpg`;
  const config = JSON.stringify({
    ga4: site.analytics.ga4,
    gtm: site.analytics.gtm,
    base: site.basePath,
    form: { provider: site.form.provider, endpoint: site.form.endpoint },
    whatsapp: site.whatsapp.number,
  });
  return `<!doctype html>
<html lang="${site.lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${esc(csp({ forMeta: true }))}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
${page.noindex && page.path.startsWith('/404') ? '' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="${site.themeColor}">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${esc(page.ogTitle || page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.ogTitle || page.title)}">
${page.article ? `<meta property="article:published_time" content="${page.article.date}T09:00:00-03:00">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.ogTitle || page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/img/icones/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/img/icones/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap">
${page.preload || ''}
<link rel="stylesheet" href="/assets/css/main.css?v=__CSS_VERSION__">
${join(page.scripts || [], (s) => `<script src="${s}" defer></script>`)}
<script src="/assets/js/main.js?v=__JS_VERSION__" defer></script>
<script type="application/json" id="site-config">${config}</script>
<script type="application/ld+json">${baseSchema(page)}</script>
</head>
<body class="${page.bodyClass || ''}">
${header(page)}
<main id="conteudo" tabindex="-1">
${content}
</main>
${footer(page)}
${floatingContact(page)}
${cookieBanner()}
</body>
</html>
`;
}

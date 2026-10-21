import { site, waLink } from '../../content/site.mjs';
import { posts, postBySlug } from '../../content/posts.mjs';
import { serviceBySlug } from '../../content/services.mjs';
import { esc, icon, picture, join, preloadImage, formatDate, readingTime, srcFor } from '../lib.mjs';
import { pageHero, postCard, sectionHead } from '../components.mjs';

export function blogIndexPage() {
  const crumbs = [{ name: 'Blog', path: '/blog/' }];
  const page = {
    path: '/blog/',
    title: 'Blog da Inplak | Fachadas, Sinalização e Comunicação Visual',
    description: 'Guias práticos sobre fachadas em ACM, sinalização interna de supermercados e padronização da comunicação visual de redes de lojas.',
    og: 'og-padrao',
    breadcrumbs: crumbs,
    pageType: 'CollectionPage',
    schema: [
      {
        '@type': 'Blog',
        name: 'Blog da Inplak',
        url: `${site.url}/blog/`,
        publisher: { '@id': `${site.url}/#empresa` },
        blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${site.url}/blog/${p.slug}/`, datePublished: p.date })),
      },
    ],
  };
  const content = `
${pageHero({
  eyebrow: 'Blog',
  title: 'Conteúdo para quem cuida da marca',
  lead: 'Guias práticos sobre fachadas, sinalização, mobiliário e padronização de redes, escritos por quem projeta, fabrica e instala.',
  crumbs,
})}
<section class="section" aria-labelledby="artigos-titulo">
  <div class="container">
    <h2 class="sr-only" id="artigos-titulo">Artigos</h2>
    <div class="post-grid">${join(posts, postCard)}</div>
  </div>
</section>`;
  return { page, content };
}

export function postPage(slug) {
  const p = postBySlug[slug];
  const service = serviceBySlug[p.service];
  const url = `${site.url}/blog/${p.slug}/`;
  const minutes = readingTime(p.body);
  const crumbs = [
    { name: 'Blog', path: '/blog/' },
    { name: p.title, path: `/blog/${p.slug}/` },
  ];
  const others = posts.filter((o) => o.slug !== slug);
  const page = {
    path: `/blog/${p.slug}/`,
    title: p.seoTitle,
    ogTitle: p.title,
    description: p.description,
    og: p.og,
    ogType: 'article',
    article: { date: p.date },
    breadcrumbs: crumbs,
    preload: preloadImage(p.hero, '(max-width: 960px) 100vw, 960px'),
    schema: [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#artigo`,
        headline: p.title,
        description: p.description,
        image: [`${site.url}/img/og/${p.og}.jpg`, `${site.url}${srcFor(p.hero, 1600)}`],
        datePublished: `${p.date}T09:00:00-03:00`,
        dateModified: `${p.date}T09:00:00-03:00`,
        inLanguage: site.lang,
        author: { '@type': 'Organization', name: 'Equipe Inplak', url: `${site.url}/sobre/` },
        publisher: { '@id': `${site.url}/#empresa` },
        mainEntityOfPage: { '@id': `${url}#pagina` },
        articleSection: p.category,
        wordCount: p.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
      },
    ],
  };
  const shareText = encodeURIComponent(`${p.title} ${url}`);
  const content = `
<article class="article">
  <header class="article__header">
    <div class="container narrow">
      <nav class="breadcrumbs breadcrumbs--dark" aria-label="Você está em">
        <ol><li><a href="/">Início</a></li><li><a href="/blog/">Blog</a></li><li><span aria-current="page">${esc(p.category)}</span></li></ol>
      </nav>
      <p class="eyebrow">${esc(p.category)}</p>
      <h1 class="article__title">${esc(p.title)}</h1>
      <p class="article__lead">${esc(p.description)}</p>
      <p class="article__meta">${icon('calendar', { size: 16 })} <time datetime="${p.date}">${formatDate(p.date)}</time> · ${minutes} min de leitura · Equipe Inplak</p>
    </div>
    <div class="container article__hero">
      ${picture(p.hero, { alt: p.heroAlt, sizes: '(max-width: 960px) 100vw, 960px', priority: true })}
    </div>
  </header>
  <div class="container article__layout">
    <div class="prose article__body">
      ${p.body}
    </div>
    <aside class="article__aside">
      <div class="aside-card aside-card--sticky">
        <p class="eyebrow">Precisa de ajuda?</p>
        <h2 class="aside-card__title">${esc(service.name)}</h2>
        <p>A Inplak cria, fabrica e instala. Conte sobre o seu projeto e receba uma proposta.</p>
        <a class="btn btn--primary btn--block" href="/contato/?servico=${encodeURIComponent(service.formValue)}#orcamento" data-track="cta_click" data-track-label="blog_orcamento">Solicitar orçamento</a>
        <a class="btn btn--ghost btn--block" href="/servicos/${service.slug}/">Conhecer o serviço</a>
        <div class="share">
          <p>Compartilhe</p>
          <a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">${icon('whatsapp', { size: 18 })}</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Compartilhar no LinkedIn"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg></a>
          <button type="button" class="share__copy" data-copy="${url}" aria-label="Copiar link do artigo">${icon('file', { size: 18 })}<span data-copy-label>Copiar link</span></button>
        </div>
      </div>
    </aside>
  </div>
</article>
<section class="section section--soft" aria-labelledby="mais-artigos">
  <div class="container">
    ${sectionHead({ eyebrow: 'Continue lendo', title: 'Outros artigos', id: 'mais-artigos' })}
    <div class="post-grid post-grid--2">${join(others, postCard)}</div>
  </div>
</section>`;
  return { page, content };
}

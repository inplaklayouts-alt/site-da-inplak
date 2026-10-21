import { site } from '../../content/site.mjs';
import { projects, categories, categoryById } from '../../content/projects.mjs';
import { cases, caseBySlug } from '../../content/cases.mjs';
import { serviceBySlug } from '../../content/services.mjs';
import { esc, icon, picture, join, srcFor, preloadImage, media } from '../lib.mjs';
import { sectionHead, pageHero, quoteActions, galleryItem, gallery, lightbox, caseCard, beforeAfter } from '../components.mjs';

// ---------- /projetos/ ----------

export function projectsPage() {
  const crumbs = [{ name: 'Projetos', path: '/projetos/' }];
  const counts = Object.fromEntries(categories.map((c) => [c.id, projects.filter((p) => p.category === c.id).length]));
  const page = {
    path: '/projetos/',
    title: 'Projetos de Fachadas, Totens, Sinalização e Mobiliário | Inplak',
    description: `Portfólio da Inplak com ${projects.length} projetos: fachadas, totens, comunicação visual interna e mobiliário para Assaí, Rede Market, BlueFit, Boa Supermercados e outras marcas.`,
    og: 'og-projetos',
    breadcrumbs: crumbs,
    pageType: 'CollectionPage',
    preload: preloadImage('fachada-bluefit'),
    schema: [
      {
        '@type': 'ImageGallery',
        name: 'Projetos da Inplak',
        url: `${site.url}/projetos/`,
        image: projects.map((p) => ({
          '@type': 'ImageObject',
          contentUrl: `${site.url}${srcFor(p.image, 1600)}`,
          name: `${p.title} — ${p.type}`,
          description: p.alt,
          creator: { '@id': `${site.url}/#empresa` },
        })),
      },
    ],
  };
  const content = `
${pageHero({
  eyebrow: 'Portfólio',
  title: 'Nossos resultados',
  lead: 'Aplicações reais em fachadas, totens, comunicação visual interna, mobiliário e estrutura metálica. Filtre por tipo de projeto e clique nas fotos para ampliar.',
  image: 'fachada-bluefit',
  imageAlt: '',
  crumbs,
  actions: quoteActions(),
})}
<section class="section" aria-labelledby="portfolio-titulo">
  <div class="container">
    <h2 class="sr-only" id="portfolio-titulo">Galeria de projetos</h2>
    <div class="filters" role="group" aria-label="Filtrar projetos por categoria" data-filters>
      <button type="button" class="filter is-active" data-filter="todos" aria-pressed="true">Todos <span>${projects.length}</span></button>
      ${join(categories, (c) => `<button type="button" class="filter" data-filter="${c.id}" aria-pressed="false">${esc(c.label)} <span>${counts[c.id]}</span></button>`)}
    </div>
    <p class="filters__status sr-only" aria-live="polite" data-filter-status></p>
    <div class="gallery gallery--portfolio" data-lightbox-group data-filter-grid>
      ${join(projects, (p) => galleryItem(p.image))}
    </div>
  </div>
</section>
<section class="section section--soft" aria-labelledby="cases-portfolio-titulo">
  <div class="container">
    <div class="split-head">
      ${sectionHead({ eyebrow: 'Antes e depois', title: 'Veja a transformação', id: 'cases-portfolio-titulo' })}
      <p class="split-head__text"><a class="link-arrow" href="/cases/">Ver todos os cases ${icon('arrow', { size: 16 })}</a></p>
    </div>
    <div class="case-grid">${join(cases, caseCard)}</div>
  </div>
</section>
${lightbox()}`;
  return { page, content };
}

// ---------- /cases/ ----------

export function casesIndexPage() {
  const crumbs = [{ name: 'Cases', path: '/cases/' }];
  const page = {
    path: '/cases/',
    title: 'Cases: Antes e Depois de Fachadas e Mobiliário | Inplak',
    description: 'Veja o antes e depois de projetos da Inplak: fachada institucional em Itaquaquecetuba, loja OXXO e estantes sob medida do Supermercado Mirassol.',
    og: 'og-case-centro-formacao',
    breadcrumbs: crumbs,
    pageType: 'CollectionPage',
  };
  const content = `
${pageHero({
  eyebrow: 'Cases',
  title: 'O antes e depois fala por si',
  lead: 'Projetos em que acompanhamos a transformação do começo ao fim. Arraste a barra sobre as fotos para comparar.',
  crumbs,
  actions: quoteActions(),
})}
<section class="section">
  <div class="container case-list">
    ${join(
      cases,
      (c, i) => `
    <article class="case-row${i % 2 ? ' case-row--reverse' : ''} reveal">
      <div class="case-row__media">${beforeAfter(c, { sizes: '(max-width: 900px) 100vw, 55vw' })}</div>
      <div class="case-row__body">
        <p class="case-card__meta">${esc(c.serviceLabel)}${c.location ? ` · ${esc(c.location)}` : ''}</p>
        <h2 class="case-row__title"><a href="/cases/${c.slug}/">${esc(c.title)}</a></h2>
        <p>${esc(c.summary)}</p>
        <p class="case-row__challenge"><strong>Desafio:</strong> ${esc(c.challenge)}</p>
        <a class="btn btn--dark" href="/cases/${c.slug}/">Ver o case completo ${icon('arrow', { size: 18 })}</a>
      </div>
    </article>`,
    )}
  </div>
</section>`;
  return { page, content };
}

// ---------- /cases/<slug>/ ----------

export function casePage(slug) {
  const c = caseBySlug[slug];
  const service = serviceBySlug[c.service];
  const crumbs = [
    { name: 'Cases', path: '/cases/' },
    { name: c.cardTitle, path: `/cases/${c.slug}/` },
  ];
  const others = cases.filter((o) => o.slug !== slug);
  const quoteHref = `/contato/?servico=${encodeURIComponent(service.formValue)}#orcamento`;
  const page = {
    path: `/cases/${c.slug}/`,
    title: c.seoTitle,
    description: c.description,
    og: c.og,
    ogTitle: c.title,
    ogType: 'article',
    breadcrumbs: crumbs,
    preload: preloadImage(c.after),
    waMessage: `Olá! Vi o case ${c.cardTitle} no site e quero um projeto parecido.`,
    schema: [
      {
        '@type': 'CreativeWork',
        name: c.title,
        description: c.description,
        image: [`${site.url}${srcFor(c.after, 1600)}`, `${site.url}${srcFor(c.before, 1600)}`],
        creator: { '@id': `${site.url}/#empresa` },
        about: c.serviceLabel,
        url: `${site.url}/cases/${c.slug}/`,
      },
    ],
  };
  const facts = [
    ['Cliente', c.client],
    ['Local', c.location],
    ['Segmento', c.segment],
    ['Serviço', c.serviceLabel],
  ].filter(([, v]) => v);
  const content = `
${pageHero({
  eyebrow: 'Case Inplak',
  title: esc(c.title),
  lead: esc(c.summary),
  image: c.after,
  imageAlt: '',
  crumbs,
  actions: `<a class="btn btn--primary" href="${quoteHref}" data-track="cta_click" data-track-label="case_projeto_parecido">Quero um projeto parecido</a>`,
})}
<section class="section">
  <div class="container case-detail">
    <aside class="case-facts reveal" aria-label="Resumo do projeto">
      <h2 class="case-facts__title">Resumo do projeto</h2>
      <dl>
        ${join(facts, ([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)}
      </dl>
      <a class="btn btn--primary btn--block" href="${quoteHref}">Solicitar projeto parecido</a>
      <a class="link-arrow" href="/servicos/${service.slug}/">Conheça o serviço ${icon('arrow', { size: 16 })}</a>
    </aside>
    <div class="case-detail__body">
      <h2 class="section-title section-title--sm">${esc(c.beforeLabel)} e ${esc(c.afterLabel.toLowerCase())}</h2>
      <p class="muted">Arraste a barra para comparar.</p>
      ${beforeAfter(c, { sizes: '(max-width: 900px) 100vw, 760px', large: true })}
      <div class="prose">
        <h2>O desafio</h2>
        <p>${esc(c.challenge)}</p>
        <h2>A solução da Inplak</h2>
        <ul>${join(c.solution, (s) => `<li>${esc(s)}</li>`)}</ul>
        <h2>Resultado</h2>
        <p>${esc(c.result)}</p>
      </div>
    </div>
  </div>
</section>
<section class="section section--soft" aria-labelledby="relacionados-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Projetos relacionados', title: 'Veja também', id: 'relacionados-titulo' })}
    ${gallery(c.related, { label: 'Projetos relacionados' })}
  </div>
</section>
<section class="section" aria-labelledby="outros-cases-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Outros cases', title: 'Mais antes e depois', id: 'outros-cases-titulo' })}
    <div class="case-grid case-grid--2">${join(others, caseCard)}</div>
  </div>
</section>
${lightbox()}`;
  return { page, content };
}

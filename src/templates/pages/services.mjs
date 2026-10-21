import { site, waLink } from '../../content/site.mjs';
import { services, serviceBySlug, supermarkets } from '../../content/services.mjs';
import { caseBySlug } from '../../content/cases.mjs';
import { esc, icon, picture, join, preloadImage } from '../lib.mjs';
import {
  sectionHead, pageHero, quoteActions, gallery, lightbox, caseCard, processList, faqList, faqSchema,
  contactForm, contactAside, clientsMarquee, serviceCard,
} from '../components.mjs';

function serviceSchema(s) {
  return {
    '@type': 'Service',
    '@id': `${site.url}/servicos/${s.slug}/#servico`,
    name: s.h1,
    serviceType: s.name,
    description: s.description,
    provider: { '@id': `${site.url}/#empresa` },
    areaServed: { '@type': 'Country', name: 'Brasil' },
    url: `${site.url}/servicos/${s.slug}/`,
    image: `${site.url}/img/og/${s.og}.jpg`,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: s.name,
      itemListElement: s.offerings.map((o) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: o.title, description: o.text } })),
    },
  };
}

function quoteSection({ id = 'orcamento', title, text, preset, origin }) {
  return `
<section class="section contact" id="${id}" aria-labelledby="${id}-titulo" tabindex="-1">
  <div class="container contact__grid">
    <div class="contact__intro">
      ${sectionHead({ eyebrow: 'Orçamento', title, id: `${id}-titulo` })}
      <p>${text}</p>
      ${contactAside()}
    </div>
    <div class="contact__form">${contactForm({ id, origin, preset })}</div>
  </div>
</section>`;
}

// ---------- /servicos/ ----------

export function servicesIndexPage() {
  const crumbs = [{ name: 'Serviços', path: '/servicos/' }];
  const page = {
    path: '/servicos/',
    title: 'Serviços de Comunicação Visual, Fachadas e Mobiliário | Inplak',
    description:
      'Conheça os serviços da Inplak: fachadas e comunicação externa, comunicação visual interna, totens e letreiros, mobiliário e marcenaria sob medida.',
    og: 'og-padrao',
    breadcrumbs: crumbs,
    pageType: 'CollectionPage',
    preload: preloadImage('fachada-super-big'),
    schema: services.map(serviceSchema),
  };
  const content = `
${pageHero({
  eyebrow: 'Serviços',
  title: 'Tudo o que sua marca precisa, do projeto à instalação',
  lead: 'Comunicação visual externa e interna, totens, mobiliário e marcenaria: criamos, fabricamos e instalamos com o mesmo padrão em uma loja ou em toda a rede.',
  image: 'fachada-super-big',
  imageAlt: 'Fachada do Super Big à noite com letreiros iluminados',
  crumbs,
  actions: quoteActions(),
})}
<section class="section">
  <div class="container service-rows">
    ${join(
      services,
      (s, i) => `
    <article class="service-row${i % 2 ? ' service-row--reverse' : ''} reveal">
      <a class="service-row__media" href="/servicos/${s.slug}/" tabindex="-1" aria-hidden="true">${picture(s.hero, { alt: '', sizes: '(max-width: 900px) 100vw, 50vw' })}</a>
      <div class="service-row__body">
        <span class="service-card__number">${s.number}</span>
        <h2 class="service-row__title"><a href="/servicos/${s.slug}/">${esc(s.name)}</a></h2>
        <p>${esc(s.lead)}</p>
        <ul class="check-list">${join(s.offerings, (o) => `<li>${icon('check', { size: 18 })}${esc(o.title)}</li>`)}</ul>
        <a class="btn btn--dark" href="/servicos/${s.slug}/">Ver ${esc(s.menuLabel.toLowerCase())} ${icon('arrow', { size: 18 })}</a>
      </div>
    </article>`,
    )}
  </div>
</section>
<section class="section section--soft">
  <div class="container banner reveal">
    <div class="banner__media">${picture('fachada-assai-atacadista', { alt: 'Vista aérea de loja Assaí Atacadista', sizes: '(max-width: 900px) 100vw, 40vw' })}</div>
    <div class="banner__body">
      <p class="eyebrow">Segmento</p>
      <h2 class="section-title">Tem um supermercado ou uma rede de lojas?</h2>
      <p>Reunimos em uma só solução fachada, totem, sinalização de setores e mobiliário, com padronização para todas as unidades.</p>
      <a class="btn btn--primary" href="/${supermarkets.slug}/">Soluções para supermercados ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>
</section>
<section class="section section--brand">
  <div class="container">
    ${sectionHead({ eyebrow: 'Processo', title: 'Como trabalhamos', light: true })}
    ${processList()}
  </div>
</section>`;
  return { page, content };
}

// ---------- /servicos/<slug>/ ----------

export function servicePage(slug) {
  const s = serviceBySlug[slug];
  const crumbs = [
    { name: 'Serviços', path: '/servicos/' },
    { name: s.name, path: `/servicos/${s.slug}/` },
  ];
  const others = services.filter((o) => o.slug !== slug);
  const page = {
    path: `/servicos/${s.slug}/`,
    title: s.title,
    description: s.description,
    og: s.og,
    ogTitle: `${s.h1} | Inplak`,
    breadcrumbs: crumbs,
    hasForm: true,
    preload: preloadImage(s.hero),
    waMessage: `Olá! Vim pelo site e gostaria de um orçamento de ${s.name.toLowerCase()}.`,
    schema: [serviceSchema(s), faqSchema(s.faq)],
  };
  const content = `
${pageHero({
  eyebrow: s.eyebrow,
  title: esc(s.h1),
  lead: esc(s.lead),
  image: s.hero,
  imageAlt: '',
  crumbs,
  actions: quoteActions({ waMessage: page.waMessage, quoteHref: '#orcamento' }),
})}

<section class="section">
  <div class="container intro-grid">
    <div class="intro-grid__text">
      ${sectionHead({ eyebrow: 'O serviço', title: `O que fazemos em ${esc(s.name.toLowerCase())}` })}
      ${join(s.intro, (p) => `<p>${esc(p)}</p>`)}
    </div>
    <ol class="offer-list">
      ${join(
        s.offerings,
        (o, i) => `
      <li class="offer reveal">
        <span class="offer__num">${String(i + 1).padStart(2, '0')}</span>
        <div><h3 class="offer__title">${esc(o.title)}</h3><p>${esc(o.text)}</p></div>
      </li>`,
      )}
    </ol>
  </div>
</section>

<section class="section section--brand">
  <div class="container approach">
    <div class="approach__col reveal">
      <p class="eyebrow eyebrow--light">O desafio</p>
      <p class="approach__lead">${esc(s.challenge)}</p>
    </div>
    <div class="approach__col reveal">
      <p class="eyebrow eyebrow--light">Como a Inplak entrega</p>
      <ul class="check-list check-list--light">${join(s.delivery, (d) => `<li>${icon('check', { size: 18 })}${esc(d)}</li>`)}</ul>
    </div>
    <div class="approach__col reveal">
      <p class="eyebrow eyebrow--light">Resultado</p>
      <p>${esc(s.result)}</p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="galeria-titulo">
  <div class="container">
    <div class="split-head">
      ${sectionHead({ eyebrow: 'Projetos', title: `${esc(s.name)} na prática`, id: 'galeria-titulo' })}
      <p class="split-head__text">Alguns dos projetos que a Inplak criou, fabricou e instalou. Clique para ampliar.</p>
    </div>
    ${gallery(s.gallery, { label: `Projetos de ${s.name}` })}
    <div class="section-actions"><a class="btn btn--ghost" href="/projetos/?categoria=${projectCategoryFor(s.slug)}">Ver mais projetos ${icon('arrow', { size: 18 })}</a></div>
  </div>
</section>

${
  s.cases.length
    ? `<section class="section section--soft" aria-labelledby="cases-servico-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Antes e depois', title: 'Cases deste serviço', id: 'cases-servico-titulo' })}
    <div class="case-grid case-grid--${s.cases.length}">${join(s.cases, (c) => caseCard(caseBySlug[c]))}</div>
  </div>
</section>`
    : ''
}

<section class="section${s.cases.length ? '' : ' section--soft'}">
  <div class="container">
    ${sectionHead({ eyebrow: 'Processo', title: 'Do primeiro contato à instalação' })}
    ${processList({ light: false })}
  </div>
</section>

<section class="section${s.cases.length ? ' section--soft' : ''}" aria-labelledby="faq-servico-titulo">
  <div class="container faq-layout">
    <div>
      ${sectionHead({ eyebrow: 'Dúvidas frequentes', title: 'Perguntas sobre este serviço', id: 'faq-servico-titulo' })}
      ${faqList(s.faq)}
    </div>
    <aside class="related-card reveal" aria-label="Outros serviços">
      <h3>Outros serviços</h3>
      <ul>
        ${join(others, (o) => `<li><a href="/servicos/${o.slug}/">${icon(o.icon, { size: 20 })}<span>${esc(o.menuLabel)}</span>${icon('arrow', { size: 16 })}</a></li>`)}
        <li><a href="/${supermarkets.slug}/">${icon('layers', { size: 20 })}<span>Para supermercados</span>${icon('arrow', { size: 16 })}</a></li>
      </ul>
    </aside>
  </div>
</section>

${quoteSection({
  title: `Peça um orçamento de ${esc(s.name.toLowerCase())}`,
  text: 'Conte o que você precisa, envie fotos, medidas ou plantas e receba o retorno de um especialista da Inplak.',
  preset: s.formValue,
  origin: page.path,
})}
${lightbox()}`;
  return { page, content };
}

function projectCategoryFor(slug) {
  return { 'comunicacao-visual-externa': 'fachadas', 'comunicacao-visual-interna': 'interna', 'mobiliario-e-marcenaria': 'mobiliario', 'totens-e-letreiros': 'totens' }[slug];
}

// ---------- /supermercados/ ----------

export function supermarketsPage() {
  const s = supermarkets;
  const crumbs = [{ name: 'Supermercados', path: `/${s.slug}/` }];
  const page = {
    path: `/${s.slug}/`,
    title: s.title,
    description: s.description,
    og: s.og,
    ogTitle: `${s.h1} | Inplak`,
    breadcrumbs: crumbs,
    hasForm: true,
    preload: preloadImage(s.hero),
    waMessage: 'Olá! Vim pelo site e gostaria de um orçamento para supermercado.',
    schema: [
      {
        '@type': 'Service',
        name: s.h1,
        description: s.description,
        provider: { '@id': `${site.url}/#empresa` },
        areaServed: { '@type': 'Country', name: 'Brasil' },
        audience: { '@type': 'BusinessAudience', name: 'Supermercados, atacarejos e redes de varejo' },
        url: `${site.url}/${s.slug}/`,
      },
      faqSchema(s.faq),
    ],
  };
  const content = `
${pageHero({
  eyebrow: s.eyebrow,
  title: esc(s.h1),
  lead: esc(s.lead),
  image: s.hero,
  imageAlt: '',
  crumbs,
  actions: quoteActions({ waMessage: page.waMessage, quoteHref: '#orcamento' }),
})}
${clientsMarquee({ title: 'Redes que já contaram com a Inplak' })}

<section class="section" aria-labelledby="zonas-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Solução completa', title: 'Uma loja inteira, um só parceiro.', id: 'zonas-titulo', text: 'Cuidamos de cada ponto de contato do cliente com a sua loja, com projeto integrado e o mesmo padrão de acabamento.' })}
    <div class="zone-grid">
      ${join(
        s.zones,
        (z) => `
      <article class="zone reveal">
        <div class="zone__media">${picture(z.image, { alt: '', sizes: '(max-width: 900px) 100vw, 33vw' })}</div>
        <div class="zone__body">
          <h3 class="zone__title">${esc(z.title)}</h3>
          <p>${esc(z.text)}</p>
          <ul class="check-list check-list--sm">${join(z.items, (i) => `<li>${icon('check', { size: 16 })}${esc(i)}</li>`)}</ul>
          <a class="link-arrow" href="${z.link}">Saiba mais ${icon('arrow', { size: 16 })}</a>
        </div>
      </article>`,
      )}
    </div>
  </div>
</section>

<section class="section section--brand" aria-labelledby="redes-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Para redes', title: 'Preparados para atender toda a rede.', id: 'redes-titulo', light: true })}
    <ul class="network-grid">
      ${join(s.network, (n) => `<li class="network-item reveal"><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></li>`)}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="galeria-super-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Projetos', title: 'Supermercados que levam a assinatura da Inplak', id: 'galeria-super-titulo' })}
    ${gallery(s.gallery, { label: 'Projetos para supermercados' })}
  </div>
</section>

<section class="section section--soft" aria-labelledby="case-super-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Antes e depois', title: 'Do projeto 3D à loja pronta', id: 'case-super-titulo' })}
    <div class="case-grid case-grid--1">${caseCard(caseBySlug['supermercado-mirassol'])}</div>
  </div>
</section>

<section class="section" aria-labelledby="faq-super-titulo">
  <div class="container faq-layout">
    <div>
      ${sectionHead({ eyebrow: 'Dúvidas frequentes', title: 'Perguntas de quem tem uma rede', id: 'faq-super-titulo' })}
      ${faqList(s.faq)}
    </div>
    <aside class="help-card reveal" aria-label="Atendimento">
      ${picture('camaleao', { alt: '', sizes: '120px', cls: 'help-card__mascot' })}
      <h3>Vai inaugurar ou reformar uma loja?</h3>
      <p>Conte a data prevista e o que precisa ser feito. Montamos o cronograma junto com você.</p>
      <a class="btn btn--whatsapp btn--block" href="${waLink(page.waMessage)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="supermercados_aside">${icon('whatsapp', { size: 20 })} Falar com um especialista</a>
    </aside>
  </div>
</section>

${quoteSection({
  title: 'Peça um orçamento para o seu supermercado',
  text: 'Informe quantas lojas, a cidade e o prazo. Se tiver planta, fotos ou o manual da marca, anexe no formulário.',
  preset: 'Projeto completo para supermercado',
  origin: page.path,
})}
${lightbox()}`;
  return { page, content };
}

export { serviceCard };

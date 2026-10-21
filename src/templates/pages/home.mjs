import { site, waLink } from '../../content/site.mjs';
import { services, supermarkets } from '../../content/services.mjs';
import { featuredProjects, heroSlides } from '../../content/projects.mjs';
import { cases } from '../../content/cases.mjs';
import { homeFaq } from '../../content/faq.mjs';
import { posts } from '../../content/posts.mjs';
import { esc, icon, picture, join, preloadImage } from '../lib.mjs';
import {
  sectionHead, serviceCard, gallery, lightbox, caseCard, clientsMarquee, statsRow, processList,
  differentials, faqList, faqSchema, mapBlock, contactForm, contactAside, postCard, folderTeaser,
} from '../components.mjs';

const heroSizes = '100vw';

function hero() {
  const [first, ...rest] = heroSlides;
  const words = [
    ['palavra-criacao', 'Criação'],
    ['palavra-fabricacao', 'Fabricação'],
    ['palavra-instalacao', 'Instalação'],
  ];
  return `
<section class="hero" aria-labelledby="hero-titulo" data-hero>
  <div class="hero__slides">
    <div class="hero__slide is-active" data-slide data-label="${esc(first.label)}">
      ${picture(first.image, { alt: first.label, sizes: heroSizes, priority: true, style: `object-position:${first.position}` })}
    </div>
    ${join(
      rest,
      (s) => `
    <div class="hero__slide" data-slide data-label="${esc(s.label)}">
      <template>${picture(s.image, { alt: s.label, sizes: heroSizes, eager: true, style: `object-position:${s.position}` })}</template>
    </div>`,
    )}
  </div>
  <div class="hero__shade" aria-hidden="true"></div>

  <div class="container hero__inner">
    <div class="hero__card">
      <div class="hero__mascot" aria-hidden="true">${picture('camaleao', { alt: '', sizes: '(max-width: 640px) 96px, 132px', eager: true })}</div>
      <p class="hero__slogan">Imagine e <br>nós fazemos</p>
      <div class="hero__words" aria-hidden="true" data-words>
        ${join(words, ([key], i) => `<span class="hero__word${i === 0 ? ' is-active' : ''}">${picture(key, { alt: '', sizes: '(max-width: 640px) 150px, 210px', eager: true })}</span>`)}
      </div>
      <h1 class="hero__title" id="hero-titulo">Comunicação visual, fachadas e mobiliário para o varejo</h1>
      <p class="hero__lead">Criamos, fabricamos e instalamos fachadas, totens, sinalização e mobiliário sob medida para supermercados, redes e empresas de todo o Brasil.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="#orcamento" data-track="cta_click" data-track-label="hero_orcamento">Solicitar orçamento</a>
        <a class="btn btn--ghost-light btn--lg" href="/projetos/" data-track="cta_click" data-track-label="hero_projetos">Ver projetos</a>
      </div>
      <ul class="hero__proof">
        <li><strong>+22</strong> anos</li>
        <li><strong>+7 mil m²</strong> de fábrica</li>
        <li><strong>+30 mil</strong> projetos</li>
      </ul>
    </div>
  </div>

  <div class="container hero__bar">
    <p class="hero__caption">${icon('pin', { size: 16 })} Projeto Inplak: <span data-hero-caption>${esc(first.label)}</span></p>
    <div class="hero__controls">
      <div class="hero__dots">
        ${join(heroSlides, (s, i) => `<button type="button" class="hero__dot${i === 0 ? ' is-active' : ''}" data-dot="${i}" aria-label="Mostrar foto ${i + 1}: ${esc(s.label)}"${i === 0 ? ' aria-current="true"' : ''}></button>`)}
      </div>
      <button type="button" class="hero__pause" data-hero-pause aria-label="Pausar a troca de fotos">
        <span class="hero__pause-icon" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</section>`;
}

function servicesSection() {
  return `
<section class="section" id="servicos" aria-labelledby="servicos-titulo">
  <div class="container">
    <div class="split-head">
      ${sectionHead({
        eyebrow: 'Especialidades',
        title: 'Faça cada metro da sua loja trabalhar pela sua marca.',
        id: 'servicos-titulo',
      })}
      <p class="split-head__text">Da fachada ao balcão, cuidamos de tudo o que o cliente vê. Um único parceiro para criar, fabricar e instalar, com o mesmo padrão em uma loja ou em toda a rede.</p>
    </div>
    <div class="service-grid">
      ${join(services, (s) => serviceCard(s))}
    </div>
  </div>
</section>`;
}

function supermarketSection() {
  return `
<section class="section section--soft" aria-labelledby="segmento-titulo">
  <div class="container feature">
    <div class="feature__media reveal">
      ${picture('interna-barcelos-corredores', { alt: 'Corredor do Barcelos Atacadista com placas suspensas e comunicação de preços', sizes: '(max-width: 900px) 100vw, 50vw' })}
      <div class="feature__badge">${picture('camaleao-icone', { alt: '', sizes: '48px' })}<span>Especialistas em varejo alimentar</span></div>
    </div>
    <div class="feature__body">
      ${sectionHead({
        eyebrow: 'Supermercados e atacarejos',
        title: 'Da fachada ao último corredor, tudo com um só parceiro.',
        id: 'segmento-titulo',
      })}
      <p>Grandes redes como Assaí, Carrefour, Sonda, St Marche e Savegnago já contaram com a Inplak. Conhecemos a rotina do varejo alimentar: inaugurações com data marcada, lojas que não podem parar e um padrão que precisa se repetir em todas as unidades.</p>
      <ul class="check-list">
        <li>${icon('check', { size: 18 })}Fachadas, totens e sinalização de estacionamento</li>
        <li>${icon('check', { size: 18 })}Setores, corredores e numeração de caixas</li>
        <li>${icon('check', { size: 18 })}Gôndolas, ilhas, vascas e balcões sob medida</li>
        <li>${icon('check', { size: 18 })}Várias unidades ao mesmo tempo, em todo o Brasil</li>
      </ul>
      <a class="btn btn--dark" href="/${supermarkets.slug}/">Soluções para supermercados ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>
</section>`;
}

function projectsSection() {
  return `
<section class="section" id="projetos" aria-labelledby="projetos-titulo">
  <div class="container">
    <div class="split-head">
      ${sectionHead({ eyebrow: 'Nossos projetos', title: 'Ideias que saíram do papel e hoje estão nas ruas.', id: 'projetos-titulo' })}
      <p class="split-head__text">Cada projeto começou como uma ideia. Hoje ocupa espaço, comunica marca e faz parte do dia a dia de quem passa por ele. Clique nas fotos para ampliar.</p>
    </div>
    ${gallery(featuredProjects, { cls: 'gallery--mosaic', label: 'Projetos em destaque' })}
    <div class="section-actions">
      <a class="btn btn--dark" href="/projetos/">Ver todos os projetos ${icon('arrow', { size: 18 })}</a>
    </div>
  </div>
</section>`;
}

function casesSection() {
  return `
<section class="section section--soft" id="cases" aria-labelledby="cases-titulo">
  <div class="container">
    <div class="split-head">
      ${sectionHead({ eyebrow: 'Resultado', title: 'O antes e depois fala por si.', id: 'cases-titulo' })}
      <p class="split-head__text">Arraste a barra sobre as fotos para comparar como era e como ficou.</p>
    </div>
    <div class="case-grid">
      ${join(cases, (c) => caseCard(c))}
    </div>
  </div>
</section>`;
}

function whySection() {
  return `
<section class="section section--brand" id="diferenciais" aria-labelledby="diferenciais-titulo">
  <div class="container">
    <div class="why">
      <div class="why__intro">
        ${sectionHead({ eyebrow: 'Por que a Inplak', title: 'Uma só empresa do projeto à instalação.', id: 'diferenciais-titulo', light: true })}
        <p>Na Inplak, unimos experiência, estrutura e acompanhamento em cada projeto. Desenvolvemos e produzimos comunicação visual, mobiliário e expositores personalizados, do desenvolvimento à fabricação e à instalação.</p>
        <a class="btn btn--primary" href="/sobre/">Conheça a Inplak ${icon('arrow', { size: 18 })}</a>
      </div>
      <ul class="why__list">
        ${join(
          differentials,
          (d) => `
        <li class="why__item reveal">
          <span class="why__icon">${icon(d.icon, { size: 24 })}</span>
          <h3>${esc(d.title)}</h3>
          <p>${esc(d.text)}</p>
        </li>`,
        )}
      </ul>
    </div>
    ${statsRow()}
  </div>
</section>`;
}

function processSection() {
  return `
<section class="section" id="processo" aria-labelledby="processo-titulo">
  <div class="container">
    <div class="split-head">
      ${sectionHead({ eyebrow: 'Processo', title: 'Do primeiro contato à instalação.', id: 'processo-titulo' })}
      <p class="split-head__text">Um caminho claro, com cronograma definido antes do início da produção e acompanhamento em todas as etapas.</p>
    </div>
    ${processList({ light: false })}
  </div>
</section>`;
}

function visitSection() {
  return `
<section class="section section--soft" id="visite" aria-labelledby="visite-titulo">
  <div class="container visit">
    <div class="visit__body">
      ${sectionHead({ eyebrow: 'Visite a Inplak', title: 'Venha tomar um café conosco.', id: 'visite-titulo' })}
      <p>Prefere ver de perto materiais, acabamentos e projetos em andamento? Nossa equipe recebe você de portas abertas. É só combinar um horário.</p>
      <ul class="visit__info">
        <li>${icon('pin', { size: 20 })}<span>${esc(site.address.street)} — ${esc(site.address.district)}<br>${esc(site.address.city)}/${esc(site.address.state)} · ${esc(site.address.zip)}</span></li>
        <li>${icon('clock', { size: 20 })}<span>${esc(site.hours.display)}</span></li>
      </ul>
      <div class="visit__actions">
        <a class="btn btn--whatsapp" href="${waLink('Olá! Gostaria de agendar uma visita à Inplak.')}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="agendar_visita">${icon('whatsapp', { size: 20 })} Agendar visita</a>
        <a class="btn btn--ghost" href="${site.mapsUrl}" target="_blank" rel="noopener">Como chegar</a>
      </div>
    </div>
    ${mapBlock()}
  </div>
</section>`;
}

function faqSection() {
  return `
<section class="section" id="duvidas" aria-labelledby="duvidas-titulo">
  <div class="container faq-layout">
    <div>
      ${sectionHead({ eyebrow: 'Dúvidas frequentes', title: 'Perguntas que ouvimos com frequência.', id: 'duvidas-titulo' })}
      ${faqList(homeFaq)}
      <a class="btn btn--ghost" href="/faq/">Ver todas as perguntas</a>
    </div>
    <aside class="help-card reveal" aria-label="Atendimento">
      ${picture('camaleao', { alt: '', sizes: '120px', cls: 'help-card__mascot' })}
      <h3>Não encontrou sua dúvida?</h3>
      <p>Fale com um especialista. Respondemos de segunda a sexta, das 8h às 18h.</p>
      <a class="btn btn--whatsapp btn--block" href="${waLink('Olá! Tenho uma dúvida sobre um projeto.')}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="faq_home">${icon('whatsapp', { size: 20 })} Perguntar no WhatsApp</a>
    </aside>
  </div>
</section>`;
}

function blogSection() {
  return `
<section class="section section--soft" aria-labelledby="blog-titulo">
  <div class="container">
    <div class="split-head">
      ${sectionHead({ eyebrow: 'Blog', title: 'Conteúdo para quem cuida da marca.', id: 'blog-titulo' })}
      <p class="split-head__text">Guias práticos sobre fachadas, sinalização e padronização de redes.</p>
    </div>
    <div class="post-grid">${join(posts.slice(0, 3), postCard)}</div>
  </div>
</section>`;
}

function contactSection() {
  return `
<section class="section contact" id="orcamento" aria-labelledby="orcamento-titulo" tabindex="-1">
  <div class="container contact__grid">
    <div class="contact__intro">
      ${sectionHead({ eyebrow: 'Contato', title: 'Chegou a hora de dar vida ao seu projeto.', id: 'orcamento-titulo' })}
      <p>Da comunicação visual interna à fachada, passando por mobiliários, expositores e soluções sob medida, a Inplak desenvolve projetos completos para tornar ambientes mais funcionais, organizados e visualmente marcantes. Conte o que você precisa e receba o retorno de um especialista.</p>
      ${contactAside()}
    </div>
    <div class="contact__form">${contactForm({ id: 'orcamento', origin: '/' })}</div>
  </div>
</section>`;
}

export function homePage() {
  const page = {
    path: '/',
    title: 'Inplak | Comunicação Visual, Fachadas e Mobiliário em Santo André/SP',
    ogTitle: 'Inplak — Comunicação visual, fachadas e mobiliário para o varejo',
    description:
      'Fachadas em ACM, totens, letreiros, sinalização e mobiliário sob medida para supermercados, redes e empresas. Projeto, produção e instalação em todo o Brasil.',
    og: 'og-padrao',
    hasForm: true,
    bodyClass: 'page-home',
    preload: preloadImage(heroSlides[0].image, heroSizes),
    schema: [faqSchema(homeFaq)],
  };
  const content = `
${hero()}
${clientsMarquee()}
${servicesSection()}
${folderTeaser({ id: 'folder-home' })}
${supermarketSection()}
${projectsSection()}
${casesSection()}
${whySection()}
${processSection()}
${visitSection()}
${faqSection()}
${blogSection()}
${contactSection()}
${lightbox()}`;
  return { page, content };
}

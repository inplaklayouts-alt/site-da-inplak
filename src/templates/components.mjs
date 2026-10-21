import { site, waLink, telLink, formMode } from '../content/site.mjs';
import { formServiceOptions } from '../content/services.mjs';
import { projectByImage, categoryById, clients } from '../content/projects.mjs';
import { faqById } from '../content/faq.mjs';
import { esc, icon, picture, join, srcFor, media, formatDate } from './lib.mjs';

// ---------- Blocos de texto ----------

export function sectionHead({ eyebrow, title, text = '', align = 'left', tag = 'h2', id = '', light = false }) {
  return `
<div class="section-head section-head--${align}${light ? ' section-head--light' : ''}">
  ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
  <${tag} class="section-title"${id ? ` id="${id}"` : ''}>${title}</${tag}>
  ${text ? `<p class="section-text">${text}</p>` : ''}
</div>`;
}

export function breadcrumbs(items) {
  const all = [{ name: 'Início', path: '/' }, ...items];
  return `
<nav class="breadcrumbs" aria-label="Você está em">
  <ol>
    ${join(all, (b, i) =>
      i === all.length - 1
        ? `<li><span aria-current="page">${esc(b.name)}</span></li>`
        : `<li><a href="${b.path}">${esc(b.name)}</a></li>`,
    )}
  </ol>
</nav>`;
}

export function pageHero({ eyebrow, title, lead, image, imageAlt = '', crumbs, actions = '', position = '50% 50%' }) {
  return `
<section class="page-hero${image ? ' page-hero--image' : ''}">
  ${image ? `<div class="page-hero__media">${picture(image, { alt: imageAlt, sizes: '100vw', priority: true, style: `object-position:${position}` })}</div>` : ''}
  <div class="container page-hero__inner">
    ${crumbs ? breadcrumbs(crumbs) : ''}
    ${eyebrow ? `<p class="eyebrow eyebrow--light">${esc(eyebrow)}</p>` : ''}
    <h1 class="page-hero__title">${title}</h1>
    ${lead ? `<p class="page-hero__lead">${lead}</p>` : ''}
    ${actions ? `<div class="page-hero__actions">${actions}</div>` : ''}
  </div>
</section>`;
}

export function quoteActions({ waMessage, quoteHref = '/contato/#orcamento', light = true, label = 'Solicitar orçamento' } = {}) {
  return `
<a class="btn btn--primary" href="${quoteHref}" data-track="cta_click" data-track-label="hero_orcamento">${esc(label)}</a>
<a class="btn ${light ? 'btn--ghost-light' : 'btn--ghost'}" href="${waLink(waMessage)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="hero">${icon('whatsapp', { size: 18 })} Falar no WhatsApp</a>`;
}

// ---------- Serviços ----------

export function serviceCard(s, { headingTag = 'h3' } = {}) {
  return `
<article class="service-card reveal">
  <a class="service-card__media" href="/servicos/${s.slug}/" tabindex="-1" aria-hidden="true">
    ${picture(s.hero, { alt: '', sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw' })}
  </a>
  <div class="service-card__body">
    <span class="service-card__number">${s.number}</span>
    <${headingTag} class="service-card__title"><a href="/servicos/${s.slug}/">${esc(s.name)}</a></${headingTag}>
    <p>${esc(s.cardText)}</p>
    <ul class="check-list check-list--sm">
      ${join(s.bullets, (b) => `<li>${icon('check', { size: 16 })}${esc(b)}</li>`)}
    </ul>
    <span class="link-arrow" aria-hidden="true">Conheça o serviço ${icon('arrow', { size: 16 })}</span>
  </div>
</article>`;
}

// ---------- Projetos e galerias ----------

/** Item de galeria que abre o visualizador (lightbox). */
export function galleryItem(key, { sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw', showCaption = true, cls = '' } = {}) {
  const p = projectByImage[key];
  if (!p) throw new Error(`Projeto não cadastrado para a imagem ${key}`);
  const cat = categoryById[p.category];
  const m = media(key);
  return `
<figure class="gallery-item ${cls} reveal" data-category="${p.category}">
  <button class="gallery-item__btn" type="button" data-lightbox-item
    data-full="${srcFor(key, 1600)}" data-width="${m.w}" data-height="${m.h}"
    data-title="${esc(p.title)}" data-caption="${esc(p.type)} · ${esc(cat.long)}" data-alt="${esc(p.alt)}"
    ${p.caseSlug ? `data-case="/cases/${p.caseSlug}/"` : ''}
    aria-label="Ampliar foto: ${esc(p.title)}, ${esc(p.type)}">
    ${picture(key, { alt: p.alt, sizes })}
    <span class="gallery-item__zoom">${icon('expand', { size: 18 })}</span>
  </button>
  ${showCaption ? `<figcaption><strong>${esc(p.title)}</strong><span>${esc(p.type)}</span></figcaption>` : ''}
</figure>`;
}

export function gallery(keys, { cls = '', label = 'Galeria de projetos' } = {}) {
  return `<div class="gallery ${cls}" data-lightbox-group role="group" aria-label="${esc(label)}">${join(keys, (k) => galleryItem(k))}</div>`;
}

export function lightbox() {
  return `
<dialog class="lightbox" data-lightbox aria-label="Visualizador de fotos">
  <div class="lightbox__inner">
    <button class="lightbox__close icon-btn" type="button" data-lightbox-close aria-label="Fechar">${icon('close', { size: 26 })}</button>
    <button class="lightbox__nav lightbox__nav--prev icon-btn" type="button" data-lightbox-prev aria-label="Foto anterior">${icon('chevronLeft', { size: 30 })}</button>
    <figure class="lightbox__figure">
      <img class="lightbox__img" data-lightbox-img alt="">
      <figcaption class="lightbox__caption">
        <span><strong data-lightbox-title></strong> <span data-lightbox-text></span></span>
        <span class="lightbox__meta"><a class="lightbox__case" data-lightbox-case href="#" hidden>Ver o case ${icon('arrow', { size: 14 })}</a><span data-lightbox-count></span></span>
      </figcaption>
    </figure>
    <button class="lightbox__nav lightbox__nav--next icon-btn" type="button" data-lightbox-next aria-label="Próxima foto">${icon('chevronRight', { size: 30 })}</button>
  </div>
</dialog>`;
}

// ---------- Antes e depois ----------

export function beforeAfter(c, { sizes = '(max-width: 768px) 100vw, 33vw', large = false } = {}) {
  const b = media(c.before);
  const a = media(c.after);
  const ratio = large ? `${a.w} / ${a.h}` : '4 / 3';
  return `
<div class="ba${large ? ' ba--large' : ''}" data-ba style="--ratio:${ratio}">
  <div class="ba__layer ba__layer--after">${picture(c.after, { alt: `${c.afterLabel}: ${c.cardTitle}`, sizes })}</div>
  <div class="ba__layer ba__layer--before" data-ba-before>${picture(c.before, { alt: `${c.beforeLabel}: ${c.cardTitle}`, sizes })}</div>
  <span class="ba__tag ba__tag--before">${esc(c.beforeLabel)}</span>
  <span class="ba__tag ba__tag--after">${esc(c.afterLabel)}</span>
  <div class="ba__handle" aria-hidden="true"><span>${icon('sliders', { size: 18 })}</span></div>
  <label class="sr-only" for="ba-${c.slug}${large ? '-lg' : ''}">Comparar ${esc(c.beforeLabel.toLowerCase())} e ${esc(c.afterLabel.toLowerCase())}: ${esc(c.cardTitle)}</label>
  <input class="ba__range" id="ba-${c.slug}${large ? '-lg' : ''}" type="range" min="0" max="100" value="50" data-ba-range>
</div>`;
}

export function caseCard(c) {
  return `
<article class="case-card reveal">
  ${beforeAfter(c)}
  <div class="case-card__body">
    <p class="case-card__meta">${esc(c.serviceLabel)}${c.location ? ` · ${esc(c.location)}` : ''}</p>
    <h3 class="case-card__title"><a href="/cases/${c.slug}/">${esc(c.cardTitle)}</a></h3>
    <p>${esc(c.summary)}</p>
    <a class="link-arrow" href="/cases/${c.slug}/" aria-label="Ver o case ${esc(c.cardTitle)}">Ver o case ${icon('arrow', { size: 16 })}</a>
  </div>
</article>`;
}

// ---------- Prova social ----------

export function clientsMarquee({ title = 'Quem confia na Inplak' } = {}) {
  const logos = (hidden) =>
    join(
      clients,
      ([key, name]) => {
        const m = media(key);
        return `<li><img src="/img/${m.dir}/${m.single}" alt="${hidden ? '' : esc(name)}" width="${m.w}" height="${m.h}" loading="lazy" decoding="async"></li>`;
      },
    );
  return `
<section class="clients" aria-labelledby="clientes-titulo">
  <div class="container clients__head">
    <h2 class="eyebrow eyebrow--light" id="clientes-titulo">${esc(title)}</h2>
  </div>
  <div class="clients__viewport">
    <ul class="clients__track" data-marquee>
      ${logos(false)}
    </ul>
    <ul class="clients__track" aria-hidden="true">
      ${logos(true)}
    </ul>
  </div>
</section>`;
}

export function statsRow() {
  return `
<dl class="stats">
  ${join(
    site.stats,
    (s) => `
  <div class="stats__item reveal">
    <dt class="stats__label">${esc(s.label)}</dt>
    <dd class="stats__value"><span data-count="${s.value}" data-prefix="${esc(s.prefix)}" data-suffix="${esc(s.suffix)}">${esc(s.prefix)}${s.value.toLocaleString('pt-BR')}${esc(s.suffix)}</span></dd>
  </div>`,
  )}
</dl>`;
}

export const processSteps = [
  { icon: 'pencil', title: 'Criação', text: 'Cada projeto começa com a compreensão do espaço, da necessidade e dos objetivos da marca.' },
  { icon: 'ruler', title: 'Desenvolvimento', text: 'Transformamos a necessidade em uma solução técnica, definindo materiais, acabamentos, estruturas e formas de aplicação.' },
  { icon: 'factory', title: 'Fabricação', text: 'Produzimos cada elemento com controle de qualidade e precisão, seja comunicação visual, mobiliário ou expositor.' },
  { icon: 'truck', title: 'Instalação', text: 'Logística e instalação em campo, com equipe especializada, organização e atenção aos detalhes para garantir o acabamento previsto em projeto.' },
];

export function processList({ light = true } = {}) {
  return `
<ol class="process${light ? ' process--light' : ''}">
  ${join(
    processSteps,
    (s, i) => `
  <li class="process__step reveal">
    <span class="process__icon">${icon(s.icon, { size: 26 })}</span>
    <span class="process__num">${String(i + 1).padStart(2, '0')}</span>
    <h3 class="process__title">${esc(s.title)}</h3>
    <p>${esc(s.text)}</p>
  </li>`,
  )}
</ol>`;
}

export const differentials = [
  { icon: 'target', title: 'Soluções personalizadas', text: 'Cada projeto é desenvolvido para a necessidade, o espaço e a identidade da sua marca.' },
  { icon: 'users', title: 'Acompanhamento do início ao fim', text: 'Um só parceiro do desenvolvimento à entrega, sem repasse entre fornecedores.' },
  { icon: 'shield', title: 'Qualidade de acabamento', text: 'Materiais adequados a cada aplicação e controle de qualidade em todas as peças.' },
  { icon: 'layers', title: 'Alinhado à sua marca', text: 'Projetos fiéis à identidade visual e aos objetivos do seu negócio.' },
];

// Pilares apresentados no folder institucional.
export const pillars = [
  { icon: 'bulb', title: 'Inovação', text: 'Soluções criativas e inteligentes que geram resultados.' },
  { icon: 'award', title: 'Qualidade', text: 'Compromisso com a excelência em cada detalhe do projeto.' },
  { icon: 'cpu', title: 'Tecnologia', text: 'Equipamentos de ponta e processos que garantem precisão e agilidade.' },
  { icon: 'handshake', title: 'Parceria', text: 'Relacionamentos sólidos, baseados em confiança e transparência.' },
];

// ---------- FAQ ----------

export function faqList(ids, { open = -1 } = {}) {
  return `
<div class="faq">
  ${join(ids, (id, i) => {
    const f = faqById[id];
    return `
  <details class="faq__item"${i === open ? ' open' : ''}>
    <summary class="faq__q"><span>${esc(f.q)}</span><span class="faq__icon">${icon('plus', { size: 20 })}</span></summary>
    <div class="faq__a"><p>${esc(f.a)}</p></div>
  </details>`;
  })}
</div>`;
}

export function faqSchema(ids) {
  return {
    '@type': 'FAQPage',
    mainEntity: ids.map((id) => ({
      '@type': 'Question',
      name: faqById[id].q,
      acceptedAnswer: { '@type': 'Answer', text: faqById[id].a },
    })),
  };
}

// ---------- Pagamento ----------

export function paymentStrip({ compact = false } = {}) {
  return `
<div class="payment${compact ? ' payment--compact' : ''}">
  <p class="payment__title">${icon('card', { size: 18 })} ${esc(site.payment.installments)} no cartão</p>
  <ul class="payment__brands" aria-label="Bandeiras aceitas">
    ${join(site.payment.brands, (b) => `<li>${esc(b)}</li>`)}
  </ul>
  ${site.payment.bndes ? `<p class="payment__bndes"><strong>Cartão BNDES</strong> aceito para empresas</p>` : ''}
</div>`;
}

// ---------- Mapa (carregado só quando o visitante pede) ----------

export function mapBlock() {
  return `
<div class="map" data-map data-map-src="${esc(site.mapsEmbed)}">
  <div class="map__placeholder">
    <svg class="map__art" viewBox="0 0 600 400" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="400" fill="#eef3ef"/>
      <g fill="#dfe9e1"><rect x="20" y="20" width="150" height="110" rx="10"/><rect x="200" y="30" width="120" height="90" rx="10"/><rect x="360" y="10" width="220" height="120" rx="10"/><rect x="30" y="170" width="120" height="200" rx="10"/><rect x="420" y="170" width="160" height="90" rx="10"/><rect x="200" y="290" width="170" height="100" rx="10"/><rect x="420" y="300" width="160" height="90" rx="10"/></g>
      <g fill="#cfe0f0"><rect x="190" y="160" width="190" height="100" rx="10"/></g>
      <g stroke="#ffffff" stroke-width="16" stroke-linecap="round" fill="none"><path d="M0 150h600"/><path d="M180 0v400"/><path d="M400 0v400"/><path d="M0 280c120-20 260 10 600-10"/><path d="M60 400 260 150"/></g>
      <g stroke="#f6d38a" stroke-width="10" fill="none" stroke-linecap="round"><path d="M0 150h600"/></g>
    </svg>
    <div class="map__pin">${picture('camaleao-icone', { alt: '', sizes: '56px' })}</div>
    <div class="map__actions">
      <button class="btn btn--light btn--sm" type="button" data-map-load>${icon('map', { size: 18 })} Carregar mapa interativo</button>
      <a class="btn btn--ghost btn--sm" href="${site.mapsUrl}" target="_blank" rel="noopener">${icon('pin', { size: 18 })} Abrir no Google Maps</a>
      <p class="map__note">O mapa é fornecido pelo Google e só é carregado se você clicar.</p>
    </div>
  </div>
</div>`;
}

// ---------- Formulário de orçamento ----------

const unitOptions = ['1 unidade', '2 a 5 unidades', '6 a 20 unidades', 'Mais de 20 unidades'];
const deadlineOptions = ['Até 30 dias', 'De 1 a 3 meses', 'Mais de 3 meses', 'Ainda não sei'];

function formTag(id) {
  const mode = formMode();
  const common = `class="form" id="${id}-form" data-contact-form data-form-mode="${mode}" aria-labelledby="${id}-titulo"`;
  if (mode === 'php') {
    return `<form ${common} action="${esc(site.form.endpoint || '/api/contato.php')}" method="post" enctype="multipart/form-data">`;
  }
  if (mode === 'apps-script') {
    // Sem JavaScript o envio é feito direto ao Apps Script (sem anexos).
    return `<form ${common} action="${esc(site.form.endpoint)}" method="post" enctype="application/x-www-form-urlencoded">`;
  }
  // Sem servidor configurado: o pedido sai pelo e-mail do próprio cliente ou pelo WhatsApp.
  // Sem JavaScript, o botão de e-mail usa o envio clássico "mailto" e o do WhatsApp abre a conversa.
  return `<form ${common} action="https://wa.me/${site.whatsapp.number}" method="get">
  <input type="hidden" name="text" value="${esc(site.whatsapp.defaultMessage)}" data-wa-default>`;
}

function attachmentsField(id) {
  if (formMode() === 'whatsapp') {
    return `
    <div class="field field--full">
      <p class="form__note">${icon('mail', { size: 18 })}<span>Escolha como enviar. <strong>Por e-mail:</strong> abrimos o seu e-mail com o pedido já escrito para ${esc(site.email)}, e você anexa fotos, plantas e medidas antes de enviar. <strong>Pelo WhatsApp:</strong> abrimos a conversa com a Inplak e você manda os arquivos por lá.</span></p>
    </div>`;
  }
  return `
    <div class="field field--full">
      <span class="field__label" id="${id}-anexos-rotulo">Anexos <span class="field__hint">(opcional)</span></span>
      <div class="dropzone" data-dropzone>
        <input class="dropzone__input" id="${id}-anexos" name="anexos[]" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.dwg,.dxf" aria-labelledby="${id}-anexos-rotulo ${id}-anexos-ajuda" data-files>
        <label class="dropzone__label" for="${id}-anexos">
          ${icon('upload', { size: 26 })}
          <span><strong>Clique para escolher</strong> ou arraste aqui fotos, plantas ou referências</span>
          <small id="${id}-anexos-ajuda">PDF, JPG, PNG, WEBP, HEIC, DWG ou DXF · até 5 arquivos · 10 MB cada · 20 MB no total</small>
        </label>
        <ul class="dropzone__list" data-file-list aria-live="polite"></ul>
      </div>
      <p class="field__error" data-error-for="anexos"></p>
    </div>`;
}

export function contactForm({ id = 'orcamento', origin = '/', preset = '' } = {}) {
  const opt = (v, sel) => `<option value="${esc(v)}"${v === sel ? ' selected' : ''}>${esc(v)}</option>`;
  const whatsappMode = formMode() === 'whatsapp';
  return `
${formTag(id)}
  <input type="hidden" name="origem" value="${esc(origin)}">
  <input type="hidden" name="iniciado" value="" data-started>
  <div class="form__hp" aria-hidden="true">
    <label>Deixe este campo em branco <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
  </div>

  <div class="form__grid">
    <div class="field">
      <label class="field__label" for="${id}-nome">Nome <span class="field__req" aria-hidden="true">*</span></label>
      <input class="field__input" id="${id}-nome" name="nome" type="text" autocomplete="name" required maxlength="120" aria-describedby="${id}-nome-erro">
      <p class="field__error" id="${id}-nome-erro" data-error-for="nome"></p>
    </div>
    <div class="field">
      <label class="field__label" for="${id}-empresa">Empresa</label>
      <input class="field__input" id="${id}-empresa" name="empresa" type="text" autocomplete="organization" maxlength="120">
    </div>
    <div class="field">
      <label class="field__label" for="${id}-email">E-mail <span class="field__req" aria-hidden="true">*</span></label>
      <input class="field__input" id="${id}-email" name="email" type="email" autocomplete="email" required maxlength="160" aria-describedby="${id}-email-erro">
      <p class="field__error" id="${id}-email-erro" data-error-for="email"></p>
    </div>
    <div class="field">
      <label class="field__label" for="${id}-telefone">Telefone / WhatsApp <span class="field__req" aria-hidden="true">*</span></label>
      <input class="field__input" id="${id}-telefone" name="telefone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" placeholder="(11) 91234-5678" data-phone aria-describedby="${id}-telefone-erro">
      <p class="field__error" id="${id}-telefone-erro" data-error-for="telefone"></p>
    </div>
    <div class="field">
      <label class="field__label" for="${id}-cidade">Cidade / UF</label>
      <input class="field__input" id="${id}-cidade" name="cidade" type="text" autocomplete="address-level2" maxlength="80" placeholder="Ex.: Santo André/SP">
    </div>
    <div class="field">
      <label class="field__label" for="${id}-servico">O que deseja cotar?</label>
      <select class="field__input" id="${id}-servico" name="servico" data-service-select>
        <option value="">Selecione uma opção</option>
        ${join(formServiceOptions, (o) => opt(o, preset))}
      </select>
    </div>
    <div class="field">
      <label class="field__label" for="${id}-unidades">Quantas unidades?</label>
      <select class="field__input" id="${id}-unidades" name="unidades">
        <option value="">Selecione</option>
        ${join(unitOptions, (o) => opt(o))}
      </select>
    </div>
    <div class="field">
      <label class="field__label" for="${id}-prazo">Prazo desejado</label>
      <select class="field__input" id="${id}-prazo" name="prazo">
        <option value="">Selecione</option>
        ${join(deadlineOptions, (o) => opt(o))}
      </select>
    </div>
    <div class="field field--full">
      <label class="field__label" for="${id}-mensagem">Conte sobre o projeto</label>
      <textarea class="field__input" id="${id}-mensagem" name="mensagem" rows="4" maxlength="4000" placeholder="Local, medidas aproximadas, o que precisa ser feito e qualquer referência que ajude."></textarea>
    </div>
    ${attachmentsField(id)}
    <div class="field field--full">
      <label class="check">
        <input type="checkbox" name="consentimento" value="sim" required aria-describedby="${id}-consentimento-erro">
        <span>Concordo com o uso dos meus dados para que a Inplak responda a este pedido, conforme a <a href="/politica-de-privacidade/" target="_blank">Política de privacidade</a>. <span class="field__req" aria-hidden="true">*</span></span>
      </label>
      <p class="field__error" id="${id}-consentimento-erro" data-error-for="consentimento"></p>
    </div>
  </div>

  <div class="form__footer">
    ${
      whatsappMode
        ? `<button class="btn btn--primary btn--lg" type="submit" name="canal" value="email" data-submit
        formaction="mailto:${site.email}?subject=${encodeURIComponent('Pedido de orçamento pelo site')}" formmethod="post" formenctype="text/plain">
      ${icon('mail', { size: 20 })}<span class="btn__label">Enviar por e-mail</span>
    </button>
    <button class="btn btn--whatsapp btn--lg" type="submit" name="canal" value="whatsapp">
      ${icon('whatsapp', { size: 20 })}<span class="btn__label">Enviar pelo WhatsApp</span>
    </button>`
        : `<button class="btn btn--primary btn--lg" type="submit" data-submit>
      <span class="btn__label">Enviar pedido de orçamento</span>
      <span class="btn__spinner" aria-hidden="true"></span>
    </button>
    <p class="form__alt">Prefere conversar agora? <a href="${waLink()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="formulario">Chame no WhatsApp</a>.</p>`
    }
  </div>
  <div class="form__status" role="status" aria-live="polite" data-form-status></div>
</form>`;
}

export function contactAside() {
  return `
<ul class="contact-list">
  <li><span class="contact-list__icon">${icon('whatsapp', { size: 20 })}</span><div><strong>WhatsApp</strong><a href="${waLink()}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="lista_contato">${esc(site.phone.display)}</a></div></li>
  <li><span class="contact-list__icon">${icon('phone', { size: 20 })}</span><div><strong>Telefone</strong><a href="${telLink}" data-track="phone_click">${esc(site.phone.display)}</a></div></li>
  <li><span class="contact-list__icon">${icon('mail', { size: 20 })}</span><div><strong>E-mail</strong><a href="mailto:${site.email}" data-track="email_click">${esc(site.email)}</a></div></li>
  <li><span class="contact-list__icon">${icon('clock', { size: 20 })}</span><div><strong>Horário</strong><span>${esc(site.hours.display)}</span></div></li>
  <li><span class="contact-list__icon">${icon('pin', { size: 20 })}</span><div><strong>Endereço</strong><a href="${site.mapsUrl}" target="_blank" rel="noopener">${esc(site.address.street)} — ${esc(site.address.district)}, ${esc(site.address.city)}/${esc(site.address.state)}, ${esc(site.address.zip)}</a></div></li>
</ul>`;
}

// ---------- Faixa final de chamada ----------

export function ctaBand(page) {
  return `
<section class="cta-band" aria-labelledby="cta-band-titulo">
  <div class="container cta-band__inner">
    <div class="cta-band__text">
      <h2 class="cta-band__title" id="cta-band-titulo">Tem uma fachada, totem, sinalização ou projeto especial para tirar do papel?</h2>
      <p>Envie sua ideia, planta, medidas ou referência visual. A Inplak transforma a necessidade de comunicação em uma proposta objetiva.</p>
      <div class="cta-band__actions">
        <a class="btn btn--whatsapp" href="${waLink(page.waMessage)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="faixa_final">${icon('whatsapp', { size: 20 })} Chamar no WhatsApp</a>
        <a class="btn btn--ghost-light" href="${page.hasForm ? '#orcamento' : '/contato/#orcamento'}" data-track="cta_click" data-track-label="faixa_final_orcamento">Pedir orçamento pelo formulário</a>
      </div>
    </div>
    ${paymentStrip({ compact: true })}
  </div>
</section>`;
}

// ---------- Folder virtual (chamada) ----------

export function folderTeaser({ id = 'folder', title = 'Folheie a Inplak em 12 páginas.' } = {}) {
  return `
<section class="section folder-teaser" aria-labelledby="${id}-titulo">
  <div class="container folder-teaser__grid">
    <a class="folder-mock reveal" href="/folder/" aria-label="Abrir o folder virtual da Inplak" data-track="cta_click" data-track-label="folder_capa">
      <span class="folder-mock__page folder-mock__page--back" aria-hidden="true">${picture('folder-pagina-03', { alt: '', sizes: '(max-width: 900px) 60vw, 300px' })}</span>
      <span class="folder-mock__page folder-mock__page--mid" aria-hidden="true">${picture('folder-pagina-02', { alt: '', sizes: '(max-width: 900px) 60vw, 300px' })}</span>
      <span class="folder-mock__page folder-mock__cover">
        ${picture('folder-pagina-01', { alt: 'Capa do folder virtual da Inplak', sizes: '(max-width: 900px) 60vw, 300px' })}
        <span class="folder-mock__curl" aria-hidden="true"></span>
      </span>
      <span class="folder-mock__hint" aria-hidden="true">${icon('book', { size: 18 })} Clique e folheie</span>
    </a>
    <div class="folder-teaser__body">
      <p class="eyebrow eyebrow--light"><span class="badge-new">Novo</span> Folder virtual</p>
      <h2 class="section-title" id="${id}-titulo">${esc(title)}</h2>
      <p class="folder-teaser__text">Conheça nossa estrutura, os pilares que guiam cada projeto e uma seleção de fachadas, totens e comunicação interna. Vire as páginas arrastando o canto, como num folder de verdade.</p>
      <ul class="folder-teaser__list">
        <li>${icon('factory', { size: 18 })} +7.000 m² de área fabril</li>
        <li>${icon('storefront', { size: 18 })} Fachadas e totens</li>
        <li>${icon('signpost', { size: 18 })} Comunicação interna</li>
        <li>${icon('users', { size: 18 })} Parceiros como Assaí, GPA e Carrefour</li>
      </ul>
      <div class="folder-teaser__actions">
        <a class="btn btn--primary btn--lg" href="/folder/" data-track="cta_click" data-track-label="folder_botao">${icon('book', { size: 20 })} Folhear o folder</a>
        <a class="btn btn--ghost-light" href="${esc(site.folder.fliphtml5)}" target="_blank" rel="noopener" data-track="cta_click" data-track-label="folder_fliphtml5">Ver no FlipHTML5 ${icon('external', { size: 16 })}</a>
      </div>
    </div>
  </div>
</section>`;
}

// ---------- Blog ----------

export function postCard(p) {
  return `
<article class="post-card reveal">
  <a class="post-card__media" href="/blog/${p.slug}/" tabindex="-1" aria-hidden="true">${picture(p.hero, { alt: '', sizes: '(max-width: 768px) 100vw, 33vw' })}</a>
  <div class="post-card__body">
    <p class="post-card__meta"><span>${esc(p.category)}</span> · <time datetime="${p.date}">${formatDate(p.date)}</time></p>
    <h3 class="post-card__title"><a href="/blog/${p.slug}/">${esc(p.title)}</a></h3>
    <p>${esc(p.excerpt)}</p>
  </div>
</article>`;
}

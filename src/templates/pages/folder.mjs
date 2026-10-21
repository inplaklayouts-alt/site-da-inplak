import { site, waLink } from '../../content/site.mjs';
import { folderPages, folderKey } from '../../content/folder.mjs';
import { esc, icon, picture, join, srcFor, preloadImage } from '../lib.mjs';
import { breadcrumbs, sectionHead } from '../components.mjs';

export function folderPage() {
  const crumbs = [{ name: 'Folder virtual', path: '/folder/' }];
  const total = folderPages.length;
  const page = {
    path: '/folder/',
    title: 'Folder Virtual da Inplak | Comunicação Visual, Fachadas e Totens',
    ogTitle: 'Folder virtual Inplak — folheie as 12 páginas',
    description:
      'Folheie o folder institucional da Inplak: mais de 22 anos, 7.000 m² de área fabril, fachadas, totens, comunicação interna e parceiros como Assaí, GPA e Carrefour.',
    og: 'og-folder',
    breadcrumbs: crumbs,
    bodyClass: 'page-folder',
    preload: preloadImage(folderKey(0), '(max-width: 760px) 90vw, 560px'),
    scripts: ['/assets/vendor/page-flip.browser.js'],
    waMessage: 'Olá! Vi o folder virtual no site e gostaria de um orçamento.',
    schema: [
      {
        '@type': 'DigitalDocument',
        name: 'Folder institucional Inplak',
        description: 'Folder virtual com a apresentação da empresa, pilares, fachadas, totens, comunicação interna e parceiros.',
        inLanguage: site.lang,
        numberOfPages: total,
        author: { '@id': `${site.url}/#empresa` },
        image: `${site.url}${srcFor(folderKey(0), 1100)}`,
        url: `${site.url}/folder/`,
        sameAs: site.folder.fliphtml5,
      },
    ],
  };

  const pages = join(folderPages, (p, i) => {
    const hard = i === 0 || i === total - 1;
    return `
      <div class="flip-page${hard ? ' flip-page--hard' : ''}"${hard ? ' data-density="hard"' : ''} data-title="${esc(p.title)}">
        ${picture(folderKey(i), { alt: `Página ${i + 1}: ${p.alt}`, sizes: '(max-width: 760px) 92vw, (max-width: 1400px) 45vw, 560px', eager: i < 3 })}
        <span class="flip-page__num" aria-hidden="true">${i + 1}</span>
      </div>`;
  });

  const content = `
<section class="flip-stage" aria-labelledby="folheador-titulo" data-flip-stage>
  <div class="container flip-stage__inner">
    <header class="flip-stage__head">
      ${breadcrumbs(crumbs)}
      <p class="eyebrow eyebrow--light">Folder virtual</p>
      <h1 class="flip-stage__title" id="folheador-titulo">Folder institucional Inplak</h1>
      <p class="flip-stage__lead">Arraste o canto da página com o mouse ou deslize o dedo para folhear.</p>
    </header>
    <div class="flipbook-wrap" data-flip-wrap>
      <div class="flipbook" data-flipbook aria-roledescription="folder com páginas para virar" aria-live="off">
        ${pages}
      </div>
      <div class="flip-hint" data-flip-hint aria-hidden="true">
        <span class="flip-hint__hand">${icon('arrowLeft', { size: 22 })}</span>
        <span class="flip-hint__desktop">Arraste o canto para virar a página</span>
        <span class="flip-hint__touch">Deslize para virar a página</span>
      </div>
    </div>

    <div class="flip-controls" role="group" aria-label="Controles do folder">
      <button type="button" class="flip-btn" data-flip-first aria-label="Ir para a capa">${icon('chevronLeft', { size: 18 })}${icon('chevronLeft', { size: 18, cls: 'icon--tight' })}</button>
      <button type="button" class="flip-btn flip-btn--main" data-flip-prev aria-label="Página anterior">${icon('chevronLeft', { size: 22 })}</button>
      <p class="flip-counter" aria-live="polite"><span data-flip-counter>Capa</span> <span class="flip-counter__total">de ${total}</span></p>
      <button type="button" class="flip-btn flip-btn--main" data-flip-next aria-label="Próxima página">${icon('chevronRight', { size: 22 })}</button>
      <button type="button" class="flip-btn" data-flip-last aria-label="Ir para a última página">${icon('chevronRight', { size: 18 })}${icon('chevronRight', { size: 18, cls: 'icon--tight' })}</button>
      <span class="flip-controls__sep" aria-hidden="true"></span>
      <button type="button" class="flip-btn" data-flip-thumbs aria-expanded="false" aria-controls="folder-miniaturas" aria-label="Mostrar miniaturas">${icon('grid', { size: 18 })}</button>
      <button type="button" class="flip-btn" data-flip-fullscreen aria-label="Tela cheia">${icon('fullscreen', { size: 18 })}</button>
      <a class="flip-btn flip-btn--link" href="${esc(site.folder.fliphtml5)}" target="_blank" rel="noopener" data-track="cta_click" data-track-label="folder_fliphtml5_pagina">FlipHTML5 ${icon('external', { size: 15 })}</a>
    </div>

    <ol class="flip-thumbs" id="folder-miniaturas" data-flip-thumbs-list hidden>
      ${join(
        folderPages,
        (p, i) => `
      <li><button type="button" class="flip-thumb" data-flip-goto="${i}" aria-label="Ir para a página ${i + 1}: ${esc(p.title)}">
        ${picture(folderKey(i), { alt: '', sizes: '96px' })}
        <span>${i + 1}</span>
      </button></li>`,
      )}
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="folder-texto-titulo">
  <div class="container narrow">
    ${sectionHead({ eyebrow: 'Acessibilidade', title: 'O folder em texto', id: 'folder-texto-titulo', text: 'O mesmo conteúdo das páginas, para ler em qualquer tela ou com leitor de tela.' })}
    <details class="folder-text">
      <summary>${icon('file', { size: 18 })} Ver o conteúdo das ${total} páginas</summary>
      <ol>
        ${join(folderPages, (p) => `<li><strong>${esc(p.title)}.</strong> ${esc(p.text)}</li>`)}
      </ol>
    </details>
  </div>
</section>

<section class="section section--soft" aria-labelledby="folder-cta-titulo">
  <div class="container banner reveal">
    <div class="banner__media">${picture('fachada-rede-market', { alt: 'Fachada da Rede Market com letreiros em letra caixa', sizes: '(max-width: 900px) 100vw, 40vw' })}</div>
    <div class="banner__body">
      <p class="eyebrow">Próximo passo</p>
      <h2 class="section-title" id="folder-cta-titulo">Gostou do que viu? Vamos fazer o seu projeto.</h2>
      <p>Conte o que você precisa e receba o retorno de um especialista da Inplak.</p>
      <div class="banner__actions">
        <a class="btn btn--primary" href="/contato/#orcamento" data-track="cta_click" data-track-label="folder_orcamento">Solicitar orçamento</a>
        <a class="btn btn--ghost-light" href="${waLink(page.waMessage)}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="folder">${icon('whatsapp', { size: 18 })} WhatsApp</a>
      </div>
    </div>
  </div>
</section>`;
  return { page, content };
}

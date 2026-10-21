/* Inplak Comunicação Visual — interações do site (sem dependências). */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var config = {};
  try {
    config = JSON.parse((doc.getElementById('site-config') || {}).textContent || '{}');
  } catch (e) {
    config = {};
  }

  function $(sel, ctx) {
    return (ctx || doc).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  }

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* armazenamento indisponível: segue sem lembrar a escolha */
    }
  }

  /* ---------- Medição (só envia algo se GA4/GTM estiverem configurados e aceitos) ---------- */

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  function track(name, params) {
    params = params || {};
    params.page_path = location.pathname;
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (config.ga4 && window.__inplakGaLoaded) gtag('event', name, params);
  }

  doc.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    track(el.getAttribute('data-track'), { label: el.getAttribute('data-track-label') || '', link_url: el.href || '' });
  });

  function loadAnalytics() {
    if (window.__inplakGaLoaded) return;
    window.__inplakGaLoaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    if (config.ga4) {
      var s = doc.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.ga4);
      doc.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', config.ga4, { anonymize_ip: true });
    }
    if (config.gtm) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      var g = doc.createElement('script');
      g.async = true;
      g.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(config.gtm);
      doc.head.appendChild(g);
    }
  }

  function initConsent() {
    if (!config.ga4 && !config.gtm) return;
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    var banner = $('[data-cookie-banner]');
    var choice = storageGet('inplak-consent');
    if (choice === 'granted') loadAnalytics();
    else if (!choice && banner) banner.hidden = false;

    if (!banner) return;
    $('[data-cookie-accept]', banner).addEventListener('click', function () {
      storageSet('inplak-consent', 'granted');
      banner.hidden = true;
      loadAnalytics();
    });
    $('[data-cookie-reject]', banner).addEventListener('click', function () {
      storageSet('inplak-consent', 'denied');
      banner.hidden = true;
      if (window.__inplakGaLoaded) gtag('consent', 'update', { analytics_storage: 'denied' });
    });
    $$('[data-cookie-settings]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        banner.hidden = false;
        $('[data-cookie-accept]', banner).focus();
      });
    });
  }

  /* ---------- Cabeçalho ---------- */

  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );
    update();
  }

  function initDropdowns() {
    $$('[data-dropdown]').forEach(function (item) {
      var toggle = $('[data-dropdown-toggle]', item);
      var timer;
      var hoverOpenedAt = 0;
      function set(open) {
        item.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      }
      toggle.addEventListener('click', function () {
        // Se o mouse acabou de abrir o menu ao passar por cima, o clique não deve fechá-lo.
        if (item.classList.contains('is-open') && Date.now() - hoverOpenedAt < 700) return;
        set(!item.classList.contains('is-open'));
      });
      item.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(timer);
        if (!item.classList.contains('is-open')) hoverOpenedAt = Date.now();
        set(true);
      });
      item.addEventListener('pointerleave', function (e) {
        if (e.pointerType !== 'mouse') return;
        timer = setTimeout(function () {
          set(false);
        }, 160);
      });
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) set(false);
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && item.classList.contains('is-open')) {
          set(false);
          toggle.focus();
        }
      });
      doc.addEventListener('click', function (e) {
        if (!item.contains(e.target)) set(false);
      });
    });
  }

  function initMobileMenu() {
    var menu = $('[data-mobile-menu]');
    var openBtn = $('[data-mobile-open]');
    if (!menu || !openBtn) return;
    var panel = $('.mobile-menu__panel', menu);

    function focusables() {
      return $$('a[href], button:not([disabled])', panel);
    }
    function open() {
      menu.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      root.style.overflow = 'hidden';
      var f = focusables();
      if (f.length) f[0].focus();
    }
    function close() {
      menu.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      root.style.overflow = '';
      openBtn.focus();
    }
    openBtn.addEventListener('click', open);
    $$('[data-mobile-close]', menu).forEach(function (b) {
      b.addEventListener('click', close);
    });
    menu.addEventListener('click', function (e) {
      if (e.target === menu) close();
      var link = e.target.closest('a[href^="#"], a[href*="#orcamento"]');
      if (link) close();
    });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab') return;
      var f = focusables();
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Hero ---------- */

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) return;
    var slides = $$('[data-slide]', hero);
    var dots = $$('[data-dot]', hero);
    var caption = $('[data-hero-caption]', hero);
    var pauseBtn = $('[data-hero-pause]', hero);
    var words = $$('.hero__word', hero);
    var current = 0;
    var playing = !reducedMotion;
    var slideTimer;
    var wordTimer;
    var wordIndex = 0;

    function hydrate(slide) {
      var tpl = $('template', slide);
      if (!tpl) return Promise.resolve();
      slide.appendChild(tpl.content.cloneNode(true));
      tpl.remove();
      var img = $('img', slide);
      return img && img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    }

    function show(index) {
      index = (index + slides.length) % slides.length;
      if (index === current) return;
      hydrate(slides[index]).then(function () {
        slides[current].classList.remove('is-active');
        dots[current] && dots[current].classList.remove('is-active');
        dots[current] && dots[current].removeAttribute('aria-current');
        current = index;
        slides[current].classList.add('is-active');
        dots[current].classList.add('is-active');
        dots[current].setAttribute('aria-current', 'true');
        if (caption) caption.textContent = slides[current].getAttribute('data-label');
      });
    }

    function schedule() {
      clearInterval(slideTimer);
      clearInterval(wordTimer);
      if (!playing) return;
      slideTimer = setInterval(function () {
        show(current + 1);
      }, 6500);
      wordTimer = setInterval(function () {
        words[wordIndex].classList.remove('is-active');
        wordIndex = (wordIndex + 1) % words.length;
        words[wordIndex].classList.add('is-active');
      }, 2600);
    }

    function setPlaying(value) {
      playing = value;
      pauseBtn.classList.toggle('is-paused', !playing);
      pauseBtn.setAttribute('aria-label', playing ? 'Pausar a troca de fotos' : 'Retomar a troca de fotos');
      schedule();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-dot')));
        schedule();
      });
    });
    pauseBtn.addEventListener('click', function () {
      setPlaying(!playing);
    });
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) {
        clearInterval(slideTimer);
        clearInterval(wordTimer);
      } else schedule();
    });

    // Carrega as demais fotos só depois que a página terminou de carregar.
    window.addEventListener('load', function () {
      setTimeout(function () {
        slides.slice(1).forEach(hydrate);
      }, 1200);
    });

    setPlaying(playing);
  }

  /* ---------- Animações de entrada e contadores ---------- */

  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reducedMotion) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var vh = window.innerHeight;
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-visible');
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var siblings = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [];
          var i = siblings.indexOf(el);
          el.style.transitionDelay = (i > 0 ? (i % 4) * 90 : 0) + 'ms';
          el.classList.add('is-visible');
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.08 },
    );
    items.forEach(function (el) {
      if (!el.classList.contains('is-visible')) io.observe(el);
    });
  }

  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    var fmt = new Intl.NumberFormat('pt-BR');
    function run(el) {
      var target = Number(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      if (reducedMotion) return;
      var start = null;
      var duration = 1600;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + fmt.format(Math.round(target * eased)) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Antes e depois ---------- */

  function initBeforeAfter() {
    $$('[data-ba]').forEach(function (box) {
      var range = $('[data-ba-range]', box);
      var dragging = false;
      function setPos(percent) {
        percent = Math.max(0, Math.min(100, percent));
        box.style.setProperty('--pos', percent + '%');
        range.value = String(Math.round(percent));
      }
      function fromEvent(e) {
        var rect = box.getBoundingClientRect();
        setPos(((e.clientX - rect.left) / rect.width) * 100);
      }
      box.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        dragging = true;
        box.setPointerCapture(e.pointerId);
        fromEvent(e);
      });
      box.addEventListener('pointermove', function (e) {
        if (dragging) fromEvent(e);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) {
        box.addEventListener(t, function () {
          dragging = false;
        });
      });
      range.addEventListener('input', function () {
        setPos(Number(range.value));
      });
      box.addEventListener('click', function () {
        range.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- Filtros do portfólio ---------- */

  function initFilters() {
    var bar = $('[data-filters]');
    var grid = $('[data-filter-grid]');
    if (!bar || !grid) return;
    var buttons = $$('[data-filter]', bar);
    var items = $$('.gallery-item', grid);
    var status = $('[data-filter-status]');

    function apply(cat, updateUrl) {
      var valid = buttons.some(function (b) {
        return b.getAttribute('data-filter') === cat;
      });
      if (!valid) cat = 'todos';
      var count = 0;
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-filter') === cat;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      items.forEach(function (it) {
        var show = cat === 'todos' || it.getAttribute('data-category') === cat;
        it.classList.toggle('is-hidden', !show);
        if (show) {
          count++;
          it.classList.add('is-visible');
        }
      });
      if (status) status.textContent = count + (count === 1 ? ' projeto exibido' : ' projetos exibidos');
      if (updateUrl && window.history.replaceState) {
        var url = new URL(location.href);
        if (cat === 'todos') url.searchParams.delete('categoria');
        else url.searchParams.set('categoria', cat);
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        apply(b.getAttribute('data-filter'), true);
        track('portfolio_filter', { label: b.getAttribute('data-filter') });
      });
    });
    var initial = new URLSearchParams(location.search).get('categoria');
    if (initial) apply(initial, false);
  }

  /* ---------- Visualizador de fotos ---------- */

  function initLightbox() {
    var box = $('[data-lightbox]');
    if (!box || typeof box.showModal !== 'function') {
      // Navegadores sem <dialog>: abre a foto em nova aba.
      doc.addEventListener('click', function (e) {
        var item = e.target.closest('[data-lightbox-item]');
        if (item) window.open(item.getAttribute('data-full'), '_blank', 'noopener');
      });
      return;
    }
    var img = $('[data-lightbox-img]', box);
    var title = $('[data-lightbox-title]', box);
    var text = $('[data-lightbox-text]', box);
    var count = $('[data-lightbox-count]', box);
    var caseLink = $('[data-lightbox-case]', box);
    var list = [];
    var index = 0;
    var opener = null;

    function visibleItems(group) {
      return $$('[data-lightbox-item]', group).filter(function (it) {
        return !it.closest('.is-hidden');
      });
    }
    function preload(i) {
      var it = list[(i + list.length) % list.length];
      if (it) {
        var p = new Image();
        p.src = it.getAttribute('data-full');
      }
    }
    function render() {
      var it = list[index];
      img.src = it.getAttribute('data-full');
      img.alt = it.getAttribute('data-alt') || '';
      img.width = Number(it.getAttribute('data-width')) || 1200;
      img.height = Number(it.getAttribute('data-height')) || 900;
      title.textContent = it.getAttribute('data-title');
      text.textContent = '· ' + it.getAttribute('data-caption');
      count.textContent = index + 1 + ' / ' + list.length;
      var c = it.getAttribute('data-case');
      caseLink.hidden = !c;
      if (c) caseLink.href = c;
      preload(index + 1);
      preload(index - 1);
    }
    function go(step) {
      index = (index + step + list.length) % list.length;
      render();
    }

    doc.addEventListener('click', function (e) {
      var item = e.target.closest('[data-lightbox-item]');
      if (!item) return;
      var group = item.closest('[data-lightbox-group]') || doc;
      list = visibleItems(group);
      index = Math.max(0, list.indexOf(item));
      opener = item;
      render();
      box.showModal();
      root.style.overflow = 'hidden';
      track('gallery_open', { label: item.getAttribute('data-title') });
    });
    $('[data-lightbox-close]', box).addEventListener('click', function () {
      box.close();
    });
    $('[data-lightbox-prev]', box).addEventListener('click', function () {
      go(-1);
    });
    $('[data-lightbox-next]', box).addEventListener('click', function () {
      go(1);
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    });
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox__inner') || e.target.classList.contains('lightbox__figure')) box.close();
    });
    box.addEventListener('close', function () {
      root.style.overflow = '';
      img.removeAttribute('src');
      if (opener) opener.focus();
    });

    var startX = null;
    img.addEventListener('pointerdown', function (e) {
      startX = e.clientX;
    });
    img.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    });
  }

  /* ---------- Folder virtual (folheador) ---------- */

  function initFlipbook() {
    var book = $('[data-flipbook]');
    if (!book) return;
    var St = window.St;
    if (!St || !St.PageFlip) {
      // Biblioteca indisponível: o folder continua visível como galeria de páginas.
      book.classList.add('is-fallback');
      return;
    }
    var stage = $('[data-flip-stage]');
    var wrap = $('[data-flip-wrap]');
    var counter = $('[data-flip-counter]');
    var hint = $('[data-flip-hint]');
    var thumbsBtn = $('[data-flip-thumbs]');
    var thumbsList = $('[data-flip-thumbs-list]');
    var fullBtn = $('[data-flip-fullscreen]');
    var pages = $$('.flip-page', book);
    var total = pages.length;

    var flip = new St.PageFlip(book, {
      width: 560,
      height: 785,
      size: 'stretch',
      minWidth: 240,
      maxWidth: 1100,
      minHeight: 336,
      maxHeight: 1542,
      showCover: true,
      usePortrait: true,
      mobileScrollSupport: true,
      maxShadowOpacity: 0.45,
      flippingTime: 750,
      drawShadow: true,
      showPageCorners: true,
      swipeDistance: 30,
      autoSize: true,
    });
    flip.loadFromHTML(pages);
    book.classList.add('is-ready');
    book.pageFlip = flip;

    function describe(index) {
      var portrait = flip.getOrientation && flip.getOrientation() === 'portrait';
      if (index === 0) return 'Capa';
      if (portrait || index === total - 1) return 'Página ' + (index + 1);
      // Em modo paisagem as páginas aparecem em pares (2–3, 4–5, ...).
      var left = index % 2 === 1 ? index : index - 1;
      return 'Páginas ' + (left + 1) + '–' + Math.min(left + 2, total);
    }
    function visible(index) {
      var portrait = flip.getOrientation && flip.getOrientation() === 'portrait';
      if (portrait || index === 0 || index === total - 1) return [index];
      var left = index % 2 === 1 ? index : index - 1;
      return [left, left + 1];
    }
    function update() {
      var i = flip.getCurrentPageIndex();
      var shown = visible(i);
      var landscape = flip.getOrientation() === 'landscape';
      counter.textContent = describe(i);
      // Capa e contracapa aparecem sozinhas: centraliza o folder fechado.
      book.classList.toggle('is-closed-front', landscape && i === 0);
      book.classList.toggle('is-closed-back', landscape && i === total - 1 && total % 2 === 0);
      $$('[data-flip-goto]').forEach(function (b) {
        var on = shown.indexOf(Number(b.getAttribute('data-flip-goto'))) !== -1;
        b.classList.toggle('is-current', on);
        if (on) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    }
    var hinted = false;
    function hideHint() {
      if (hinted || !hint) return;
      hinted = true;
      hint.classList.add('is-hidden');
    }

    flip.on('flip', function () {
      update();
      hideHint();
      track('folder_flip', { label: String(flip.getCurrentPageIndex() + 1) });
    });
    flip.on('changeOrientation', update);
    flip.on('changeState', function (e) {
      if (e.data === 'user_fold' || e.data === 'fold_corner') hideHint();
    });
    update();

    $('[data-flip-prev]').addEventListener('click', function () {
      flip.flipPrev();
    });
    $('[data-flip-next]').addEventListener('click', function () {
      flip.flipNext();
    });
    $('[data-flip-first]').addEventListener('click', function () {
      flip.flip(0);
    });
    $('[data-flip-last]').addEventListener('click', function () {
      flip.flip(total - 1);
    });
    $$('[data-flip-goto]').forEach(function (b) {
      b.addEventListener('click', function () {
        flip.flip(Number(b.getAttribute('data-flip-goto')));
        if (window.innerWidth < 760) wrap.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });

    thumbsBtn.addEventListener('click', function () {
      var open = thumbsList.hidden;
      thumbsList.hidden = !open;
      thumbsBtn.setAttribute('aria-expanded', String(open));
      thumbsBtn.classList.toggle('is-active', open);
    });

    doc.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowRight') {
        flip.flipNext();
        hideHint();
      } else if (e.key === 'ArrowLeft') {
        flip.flipPrev();
        hideHint();
      }
    });

    // Tela cheia (com alternativa para navegadores sem a API, como o Safari do iPhone).
    var canFull = stage.requestFullscreen || stage.webkitRequestFullscreen;
    function isFull() {
      return doc.fullscreenElement === stage || doc.webkitFullscreenElement === stage || stage.classList.contains('is-pseudo-full');
    }
    function setFullLabel() {
      fullBtn.setAttribute('aria-label', isFull() ? 'Sair da tela cheia' : 'Tela cheia');
      fullBtn.classList.toggle('is-active', isFull());
    }
    fullBtn.addEventListener('click', function () {
      if (isFull()) {
        if (stage.classList.contains('is-pseudo-full')) {
          stage.classList.remove('is-pseudo-full');
          root.style.overflow = '';
          window.dispatchEvent(new Event('resize'));
        } else (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
      } else if (canFull) {
        (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
      } else {
        stage.classList.add('is-pseudo-full');
        root.style.overflow = 'hidden';
        window.dispatchEvent(new Event('resize'));
      }
      setFullLabel();
      track('folder_fullscreen');
    });
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
      doc.addEventListener(ev, function () {
        setFullLabel();
        setTimeout(function () {
          window.dispatchEvent(new Event('resize'));
        }, 60);
      });
    });

    // Pré-carrega todas as páginas depois que a primeira aparece.
    window.addEventListener('load', function () {
      setTimeout(function () {
        $$('img[loading="lazy"]', book).forEach(function (img) {
          img.loading = 'eager';
        });
      }, 600);
    });

    track('folder_open');
  }

  /* ---------- Mapa sob demanda ---------- */

  function initMaps() {
    $$('[data-map]').forEach(function (map) {
      var btn = $('[data-map-load]', map);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var iframe = doc.createElement('iframe');
        iframe.src = map.getAttribute('data-map-src');
        iframe.title = 'Mapa com a localização da Inplak em Santo André/SP';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.allowFullscreen = true;
        map.appendChild(iframe);
        map.classList.add('is-loaded');
        iframe.focus();
        track('map_load');
      });
    });
  }

  /* ---------- Formulário de orçamento ---------- */

  var MAX_FILES = 5;
  var MAX_FILE = 10 * 1024 * 1024;
  var MAX_TOTAL = 20 * 1024 * 1024;
  var EXT = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'dwg', 'dxf'];

  function formatBytes(n) {
    if (n < 1024 * 1024) return Math.max(1, Math.round(n / 1024)) + ' KB';
    return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  function maskPhone(value) {
    var d = value.replace(/\D/g, '');
    if (d.indexOf('55') === 0 && d.length > 11) d = d.slice(2);
    d = d.slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  function initForms() {
    var startedAt = String(Date.now());
    $$('[data-contact-form]').forEach(function (form) {
      form.noValidate = true;
      var started = $('[data-started]', form);
      if (started) started.value = startedAt;
      var status = $('[data-form-status]', form);
      var submit = $('[data-submit]', form);
      var fileInput = $('[data-files]', form);
      var dropzone = $('[data-dropzone]', form);
      var fileList = $('[data-file-list]', form);
      var files = [];
      var touched = false;
      var canSyncFiles = typeof DataTransfer === 'function';

      // Serviço vindo da URL (?servico=...)
      var preset = new URLSearchParams(location.search).get('servico');
      var select = $('[data-service-select]', form);
      if (preset && select) {
        $$('option', select).forEach(function (o) {
          if (o.value === preset) select.value = preset;
        });
      }

      form.addEventListener('input', function () {
        if (!touched) {
          touched = true;
          track('form_start', { label: form.id });
        }
        // Some com o aviso geral de erro assim que a pessoa começa a corrigir.
        if (status.classList.contains('is-error')) {
          status.className = 'form__status';
          status.textContent = '';
        }
      });

      var phone = $('[data-phone]', form);
      if (phone) {
        phone.addEventListener('input', function () {
          var pos = phone.value.length;
          phone.value = maskPhone(phone.value);
          if (doc.activeElement === phone && pos === phone.value.length) phone.setSelectionRange(pos, pos);
        });
      }

      function errorEl(name) {
        return $('[data-error-for="' + name + '"]', form);
      }
      function setError(name, message) {
        var el = errorEl(name);
        var input = form.elements[name] || (name === 'anexos' ? fileInput : null);
        var field = input && input.closest ? input.closest('.field') : null;
        if (el) el.textContent = message || '';
        if (field) field.classList.toggle('is-invalid', Boolean(message));
        if (name === 'anexos' && dropzone) dropzone.classList.toggle('is-invalid', Boolean(message));
        if (input && input.setAttribute) {
          if (message) input.setAttribute('aria-invalid', 'true');
          else input.removeAttribute('aria-invalid');
        }
      }

      function validateField(name) {
        var el = form.elements[name];
        var v = el ? String(el.value || '').trim() : '';
        var msg = '';
        if (name === 'nome' && v.length < 2) msg = 'Informe seu nome.';
        if (name === 'email') {
          if (!v) msg = 'Informe seu e-mail.';
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Confira o e-mail: parece haver um erro de digitação.';
        }
        if (name === 'telefone') {
          var digits = v.replace(/\D/g, '');
          if (!digits) msg = 'Informe um telefone ou WhatsApp com DDD.';
          else if (digits.length < 10 || digits.length > 13) msg = 'Confira o telefone: use DDD + número.';
        }
        if (name === 'consentimento' && !el.checked) msg = 'Para enviarmos a resposta, precisamos do seu consentimento.';
        setError(name, msg);
        return !msg;
      }

      ['nome', 'email', 'telefone'].forEach(function (name) {
        var el = form.elements[name];
        if (!el) return;
        el.addEventListener('blur', function () {
          if (el.value) validateField(name);
        });
        el.addEventListener('input', function () {
          if (el.getAttribute('aria-invalid')) validateField(name);
        });
      });
      if (form.elements.consentimento) {
        form.elements.consentimento.addEventListener('change', function () {
          validateField('consentimento');
        });
      }

      // ----- Anexos -----
      function syncInput() {
        if (!canSyncFiles) return;
        var dt = new DataTransfer();
        files.forEach(function (f) {
          dt.items.add(f);
        });
        fileInput.files = dt.files;
      }

      function renderFiles() {
        fileList.innerHTML = '';
        files.forEach(function (f, i) {
          var li = doc.createElement('li');
          var name = doc.createElement('span');
          name.className = 'file-name';
          name.textContent = f.name;
          var size = doc.createElement('span');
          size.className = 'file-size';
          size.textContent = formatBytes(f.size);
          li.appendChild(name);
          li.appendChild(size);
          if (canSyncFiles) {
            var rm = doc.createElement('button');
            rm.type = 'button';
            rm.setAttribute('aria-label', 'Remover ' + f.name);
            rm.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
            rm.addEventListener('click', function () {
              files.splice(i, 1);
              syncInput();
              renderFiles();
              setError('anexos', '');
            });
            li.appendChild(rm);
          }
          fileList.appendChild(li);
        });
      }

      function addFiles(incoming) {
        var problems = [];
        Array.prototype.forEach.call(incoming, function (f) {
          var ext = (f.name.split('.').pop() || '').toLowerCase();
          var total = files.reduce(function (s, x) {
            return s + x.size;
          }, 0);
          if (EXT.indexOf(ext) === -1) problems.push(f.name + ': formato não aceito.');
          else if (f.size > MAX_FILE) problems.push(f.name + ': maior que 10 MB.');
          else if (files.length >= MAX_FILES) problems.push('Limite de ' + MAX_FILES + ' arquivos atingido.');
          else if (total + f.size > MAX_TOTAL) problems.push(f.name + ': ultrapassa 20 MB no total.');
          else if (
            files.some(function (x) {
              return x.name === f.name && x.size === f.size;
            })
          ) {
            /* arquivo repetido: ignora */
          } else files.push(f);
        });
        syncInput();
        renderFiles();
        setError('anexos', problems.join(' '));
        if (files.length) track('file_attach', { label: String(files.length) });
      }

      if (fileInput) {
        fileInput.addEventListener('change', function () {
          if (!canSyncFiles) {
            files = Array.prototype.slice.call(fileInput.files);
            renderFiles();
            return;
          }
          var picked = Array.prototype.slice.call(fileInput.files);
          addFiles(picked);
        });
      }
      if (dropzone && canSyncFiles) {
        ['dragenter', 'dragover'].forEach(function (t) {
          dropzone.addEventListener(t, function (e) {
            e.preventDefault();
            dropzone.classList.add('is-dragover');
          });
        });
        ['dragleave', 'drop'].forEach(function (t) {
          dropzone.addEventListener(t, function (e) {
            e.preventDefault();
            dropzone.classList.remove('is-dragover');
          });
        });
        dropzone.addEventListener('drop', function (e) {
          if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
        });
      }

      function showStatus(message, kind, html) {
        status.className = 'form__status' + (kind ? ' is-' + kind : '');
        if (html) status.innerHTML = message;
        else status.textContent = message;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = ['nome', 'email', 'telefone', 'consentimento'].map(validateField).every(Boolean);
        if (!ok) {
          var first = $('[aria-invalid="true"]', form);
          if (first) first.focus();
          showStatus('Confira os campos destacados.', 'error');
          return;
        }
        var mode = form.getAttribute('data-form-mode') || 'php';

        // Sem servidor configurado: monta a mensagem e abre o WhatsApp da Inplak.
        if (mode === 'whatsapp') {
          var url = 'https://wa.me/' + (config.whatsapp || '') + '?text=' + encodeURIComponent(whatsappMessage(form));
          var win = window.open(url, '_blank', 'noopener');
          track('generate_lead', { label: form.elements.servico ? form.elements.servico.value : '', form_id: form.id, method: 'whatsapp' });
          showStatus(
            'Abrimos o WhatsApp com o seu pedido. É só tocar em enviar na conversa. Se a janela não abriu, <a href="' + escapeHtml(url) + '" target="_blank" rel="noopener">clique aqui</a>.',
            'success',
            true,
          );
          if (!win) window.location.href = url;
          return;
        }

        if (!window.fetch || !window.FormData) {
          form.submit();
          return;
        }
        submit.classList.add('is-loading');
        submit.disabled = true;
        showStatus('Enviando…', '');

        var request;
        if (mode === 'apps-script') {
          // O Apps Script não lê arquivos enviados como formulário: os anexos vão em base64 dentro de um JSON.
          // "text/plain" evita a checagem prévia de CORS, que o Apps Script não responde.
          request = buildJsonPayload(form, files).then(function (payload) {
            return fetch(form.action, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' });
          });
        } else {
          var data = new FormData(form);
          // Com DataTransfer, a lista acumulada (arrastar + escolher) substitui o conteúdo do campo.
          if (canSyncFiles) {
            data.delete('anexos[]');
            files.forEach(function (f) {
              data.append('anexos[]', f, f.name);
            });
          }
          var sameOrigin = new URL(form.action, location.href).origin === location.origin;
          request = fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' }, credentials: sameOrigin ? 'same-origin' : 'omit' });
        }

        request
          .then(function (res) {
            return res
              .json()
              .catch(function () {
                return { ok: false, message: 'Resposta inesperada do servidor (' + res.status + ').' };
              });
          })
          .then(function (json) {
            if (json && json.ok) {
              track('generate_lead', { label: form.elements.servico ? form.elements.servico.value : '', form_id: form.id, method: mode });
              showStatus('Pedido enviado! Redirecionando…', 'success');
              window.location.href = withBase(json.redirect || '/obrigado/');
              return;
            }
            if (json && json.errors) {
              Object.keys(json.errors).forEach(function (k) {
                setError(k, json.errors[k]);
              });
            }
            throw new Error((json && json.message) || 'Não foi possível enviar.');
          })
          .catch(function (err) {
            submit.classList.remove('is-loading');
            submit.disabled = false;
            var wa = $('.form__alt a', form);
            showStatus(
              (err && err.message ? escapeHtml(err.message) + ' ' : '') +
                'Tente novamente ou fale conosco pelo <a href="' + (wa ? wa.href : '#') + '" target="_blank" rel="noopener">WhatsApp</a>.',
              'error',
              true,
            );
            track('form_error', { label: err && err.message ? err.message.slice(0, 80) : '' });
          });
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Caminhos internos ganham o prefixo do site quando ele está numa subpasta (GitHub Pages).
  function withBase(path) {
    if (!path || path.charAt(0) !== '/' || path.charAt(1) === '/') return path;
    var base = config.base || '';
    return path.indexOf(base + '/') === 0 ? path : base + path;
  }

  var FIELDS = ['nome', 'empresa', 'email', 'telefone', 'cidade', 'servico', 'unidades', 'prazo', 'mensagem', 'origem', 'iniciado', 'website', 'consentimento'];

  function fieldValue(form, name) {
    var el = form.elements[name];
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked ? el.value : '';
    return String(el.value || '').trim();
  }

  function whatsappMessage(form) {
    var labels = [
      ['nome', 'Nome'],
      ['empresa', 'Empresa'],
      ['email', 'E-mail'],
      ['telefone', 'Telefone'],
      ['cidade', 'Cidade/UF'],
      ['servico', 'Serviço'],
      ['unidades', 'Unidades'],
      ['prazo', 'Prazo'],
    ];
    var lines = ['Olá! Vim pelo site da Inplak e gostaria de um orçamento.', ''];
    labels.forEach(function (pair) {
      var v = fieldValue(form, pair[0]);
      if (v) lines.push('*' + pair[1] + ':* ' + v);
    });
    var msg = fieldValue(form, 'mensagem');
    if (msg) lines.push('', '*Sobre o projeto:*', msg);
    lines.push('', '(Pedido enviado pelo formulário do site. Vou mandar fotos e medidas aqui na conversa, se tiver.)');
    return lines.join('\n');
  }

  function readAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var s = String(reader.result || '');
        resolve(s.slice(s.indexOf(',') + 1));
      };
      reader.onerror = function () {
        reject(new Error('Não foi possível ler o arquivo ' + file.name + '.'));
      };
      reader.readAsDataURL(file);
    });
  }

  function buildJsonPayload(form, files) {
    var payload = { site: location.origin + (config.base || '') };
    FIELDS.forEach(function (name) {
      payload[name] = fieldValue(form, name);
    });
    return Promise.all(
      files.map(function (f) {
        return readAsBase64(f).then(function (data) {
          return { name: f.name, type: f.type || 'application/octet-stream', size: f.size, data: data };
        });
      }),
    ).then(function (list) {
      payload.anexos = list;
      return payload;
    });
  }

  /* ---------- Barra fixa do celular ---------- */

  function initMobileBar() {
    var bar = $('[data-mobile-bar]');
    if (!bar || !('IntersectionObserver' in window)) return;
    var targets = $$('[data-contact-form], .site-footer, [data-flip-wrap]');
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.add(en.target);
        else visible.delete(en.target);
      });
      bar.classList.toggle('is-hidden', visible.size > 0);
    });
    targets.forEach(function (t) {
      io.observe(t);
    });
  }

  /* ---------- Copiar link ---------- */

  function initCopy() {
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = $('[data-copy-label]', btn);
        var url = btn.getAttribute('data-copy');
        var done = function () {
          if (label) label.textContent = 'Link copiado!';
          setTimeout(function () {
            if (label) label.textContent = 'Copiar link';
          }, 2200);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () {});
        else {
          window.prompt('Copie o link:', url);
        }
      });
    });
  }

  /* ---------- Endereços antigos do WordPress com parâmetros (?p=, ?post_type=) ---------- */

  function initLegacyRedirects() {
    var base = config.base || '';
    if (location.pathname !== base + '/' || !location.search) return;
    var q = new URLSearchParams(location.search);
    if (q.get('post_type') === 'inplak-projetos') location.replace(base + '/projetos/');
    else if (['p', 'page_id', 'cat', 'author', 'attachment_id'].some(function (k) { return q.has(k); })) location.replace(base + '/');
  }

  /* ---------- Inicialização ---------- */

  initLegacyRedirects();
  initConsent();
  initHeader();
  initDropdowns();
  initMobileMenu();
  initHero();
  initReveal();
  initCounters();
  initBeforeAfter();
  initFilters();
  initLightbox();
  initFlipbook();
  initMaps();
  initForms();
  initMobileBar();
  initCopy();
})();

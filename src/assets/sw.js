/* Inplak — service worker.
 *
 * O GitHub Pages só deixa o navegador guardar os arquivos por 10 minutos. Este script devolve
 * o cache de longo prazo (como o .htaccess fazia na Hostinger) e ainda permite abrir as páginas
 * já visitadas sem internet.
 *
 *   CSS e JS (endereços com ?v=versão) → do cache primeiro; a versão nova tem outro endereço.
 *   Imagens                            → do cache na hora e atualizadas em segundo plano.
 *   Páginas                            → sempre da internet; sem conexão, a cópia guardada.
 *
 * __VERSION__ e __BASE__ são preenchidos pelo build.
 */
var VERSION = '__VERSION__';
var BASE = '__BASE__';
var STATIC = 'inplak-static-' + VERSION;
var IMAGES = 'inplak-img-v1';
var PAGES = 'inplak-pages-v1';
var MAX_IMAGES = 160;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(PAGES)
      .then(function (cache) {
        return cache.addAll([BASE + '/', BASE + '/404.html']);
      })
      .then(function () {
        return self.skipWaiting();
      }),
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k.indexOf('inplak-static-') === 0 && k !== STATIC;
            })
            .map(function (k) {
              return caches.delete(k);
            }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.indexOf(BASE + '/') !== 0) return;
  var path = url.pathname.slice(BASE.length);
  if (path.indexOf('/api/') === 0 || path === '/sw.js') return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
  } else if (path.indexOf('/assets/') === 0) {
    event.respondWith(cacheFirst(req, STATIC));
  } else if (path.indexOf('/img/') === 0 || /\.(ico|png|webmanifest)$/.test(path)) {
    event.respondWith(staleWhileRevalidate(req, IMAGES));
  }
});

function cacheFirst(req, name) {
  return caches.open(name).then(function (cache) {
    return cache.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res.ok) cache.put(req, res.clone());
        return res;
      });
    });
  });
}

function staleWhileRevalidate(req, name) {
  return caches.open(name).then(function (cache) {
    return cache.match(req).then(function (hit) {
      var network = fetch(req)
        .then(function (res) {
          if (res.ok) {
            cache.put(req, res.clone()).then(function () {
              trim(cache, MAX_IMAGES);
            });
          }
          return res;
        })
        .catch(function () {
          return hit;
        });
      return hit || network;
    });
  });
}

function networkFirst(req) {
  return fetch(req)
    .then(function (res) {
      if (res.ok) {
        var copy = res.clone();
        caches.open(PAGES).then(function (cache) {
          cache.put(req, copy);
        });
      }
      return res;
    })
    .catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match(BASE + '/');
      });
    });
}

function trim(cache, max) {
  cache.keys().then(function (keys) {
    if (keys.length > max) cache.delete(keys[0]).then(function () {
      trim(cache, max);
    });
  });
}

import { site } from '../content/site.mjs';

// Content-Security-Policy única: usada no .htaccess (Hostinger) e na <meta> das páginas
// (GitHub Pages não permite cabeçalhos próprios).

function endpointOrigin() {
  try {
    return site.form.endpoint ? new URL(site.form.endpoint).origin : '';
  } catch {
    return '';
  }
}

export function csp({ forMeta = false } = {}) {
  const formOrigin = endpointOrigin();
  const appsScript = 'https://script.google.com https://script.googleusercontent.com';
  const directives = [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.google.com https://*.gstatic.com",
    `connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com ${appsScript}${formOrigin ? ' ' + formOrigin : ''}`,
    'frame-src https://www.google.com https://maps.google.com',
    `form-action 'self' https://wa.me https://api.whatsapp.com ${appsScript}${formOrigin ? ' ' + formOrigin : ''}`,
    "base-uri 'self'",
    "object-src 'none'",
  ];
  // frame-ancestors não funciona em <meta>; upgrade-insecure-requests fica só no cabeçalho do
  // servidor para não quebrar o teste local em http://localhost (todo endereço do site já é https).
  if (!forMeta) directives.push("frame-ancestors 'self'", 'upgrade-insecure-requests');
  return directives.join('; ');
}

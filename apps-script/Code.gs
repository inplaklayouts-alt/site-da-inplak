/**
 * Inplak — servidor do formulário de orçamento (Google Apps Script).
 *
 * O site envia cada pedido para cá. Este script:
 *   - valida os campos (de novo, aqui no servidor);
 *   - bloqueia robôs (campo isca, tempo mínimo e limite de envios);
 *   - confere os anexos pelo conteúdo real do arquivo;
 *   - guarda o pedido na aba "Pedidos" desta planilha e os anexos numa pasta do Google Drive;
 *   - envia o pedido por e-mail para a Inplak (com os anexos) e uma confirmação ao cliente.
 *
 * Como instalar: veja o arquivo LEIA-ME.md desta pasta.
 */

var CONFIG = {
  // Quem recebe os pedidos. Para mais de um endereço, separe por vírgula.
  TO: 'comercial@inplak.com.br',
  SENDER_NAME: 'Site Inplak',
  SUBJECT_PREFIX: '[Site] ',
  AUTOREPLY: true,

  SHEET_NAME: 'Pedidos',
  ERRORS_SHEET: 'Erros',
  DRIVE_FOLDER: 'Inplak - anexos do site',

  // Endereço do site (usado nos e-mails e no retorno de quem envia sem JavaScript).
  SITE_URL: 'https://inplaklayouts-alt.github.io/site-da-inplak',
  WHATSAPP: '5511992243088',

  MIN_SECONDS: 3,
  RATE_WINDOW_SECONDS: 600,
  RATE_PER_EMAIL: 3,
  RATE_GLOBAL: 40,

  MAX_FILES: 5,
  MAX_FILE_BYTES: 10 * 1024 * 1024,
  MAX_TOTAL_BYTES: 20 * 1024 * 1024,
};

var SERVICE_OPTIONS = [
  'Comunicação visual externa e fachadas',
  'Comunicação visual interna e sinalização',
  'Mobiliário, marcenaria e expositores',
  'Totens e letreiros',
  'Projeto completo para supermercado',
  'Estrutura metálica',
  'Outro assunto',
];
var UNIT_OPTIONS = ['1 unidade', '2 a 5 unidades', '6 a 20 unidades', 'Mais de 20 unidades'];
var DEADLINE_OPTIONS = ['Até 30 dias', 'De 1 a 3 meses', 'Mais de 3 meses', 'Ainda não sei'];

// Extensões aceitas e como conferir o conteúdo do arquivo (assinatura no início do arquivo).
var FILE_TYPES = {
  pdf: { mime: 'application/pdf', check: function (b) { return startsWith(b, [0x25, 0x50, 0x44, 0x46]); } },
  jpg: { mime: 'image/jpeg', check: function (b) { return startsWith(b, [0xff, 0xd8, 0xff]); } },
  jpeg: { mime: 'image/jpeg', check: function (b) { return startsWith(b, [0xff, 0xd8, 0xff]); } },
  png: { mime: 'image/png', check: function (b) { return startsWith(b, [0x89, 0x50, 0x4e, 0x47]); } },
  webp: { mime: 'image/webp', check: function (b) { return startsWith(b, [0x52, 0x49, 0x46, 0x46]) && ascii(b, 8, 4) === 'WEBP'; } },
  heic: { mime: 'image/heic', check: function (b) { return ascii(b, 4, 4) === 'ftyp'; } },
  dwg: { mime: 'application/acad', check: function (b) { return ascii(b, 0, 2) === 'AC'; } },
  dxf: { mime: 'application/dxf', check: function (b) { return !looksExecutable(b); } },
};

// ---------------------------------------------------------------------------
// Entradas do app da Web
// ---------------------------------------------------------------------------

function doGet() {
  return jsonOutput({ ok: true, service: 'inplak-formulario', time: new Date().toISOString() });
}

function doPost(e) {
  var isJson = false;
  var data = {};
  try {
    var body = e && e.postData && e.postData.contents ? String(e.postData.contents) : '';
    if (/^\s*\{/.test(body)) {
      data = JSON.parse(body);
      isJson = true;
    } else {
      data = (e && e.parameter) || {};
    }
  } catch (err) {
    return respond(true, { ok: false, message: 'Não foi possível ler os dados enviados.' });
  }
  try {
    return respond(isJson, handle(data, isJson));
  } catch (err) {
    logError('doPost: ' + (err && err.stack ? err.stack : err));
    return respond(isJson, { ok: false, message: 'Não conseguimos enviar o seu pedido agora.' });
  }
}

// ---------------------------------------------------------------------------
// Processamento do pedido
// ---------------------------------------------------------------------------

function handle(data, isJson) {
  var fakeOk = { ok: true, message: 'Recebido.', redirect: '/obrigado/' };

  // Campo isca: robôs preenchem. Fingimos sucesso para não dar pistas.
  if (clean(data.website, 200)) return fakeOk;

  // Tempo mínimo entre abrir a página e enviar.
  var started = String(data.iniciado || '');
  if (/^\d{10,}$/.test(started)) {
    var elapsed = (Date.now() - Number(started)) / 1000;
    if (elapsed >= 0 && elapsed < CONFIG.MIN_SECONDS) return fakeOk;
  }

  var lead = {
    nome: clean(data.nome, 120),
    empresa: clean(data.empresa, 120),
    email: clean(data.email, 160).toLowerCase(),
    telefone: clean(data.telefone, 20),
    cidade: clean(data.cidade, 80),
    servico: clean(data.servico, 80),
    unidades: clean(data.unidades, 40),
    prazo: clean(data.prazo, 40),
    mensagem: clean(data.mensagem, 4000, true),
    origem: /^\/[a-z0-9\/\-]{0,150}$/.test(String(data.origem || '')) ? String(data.origem) : '/',
  };

  var errors = {};
  if (lead.nome.length < 2) errors.nome = 'Informe seu nome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.email = 'Informe um e-mail válido.';
  var digits = lead.telefone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) errors.telefone = 'Informe um telefone ou WhatsApp com DDD.';
  if (String(data.consentimento || '') !== 'sim') errors.consentimento = 'Para enviarmos a resposta, precisamos do seu consentimento.';
  if (lead.servico && SERVICE_OPTIONS.indexOf(lead.servico) === -1) lead.servico = 'Outro assunto';
  if (lead.unidades && UNIT_OPTIONS.indexOf(lead.unidades) === -1) lead.unidades = '';
  if (lead.prazo && DEADLINE_OPTIONS.indexOf(lead.prazo) === -1) lead.prazo = '';

  var files = isJson ? readAttachments(data.anexos, errors) : [];

  if (Object.keys(errors).length) {
    return { ok: false, message: 'Confira os campos destacados.', errors: errors };
  }

  if (rateLimited(lead.email)) {
    return { ok: false, message: 'Recebemos muitos envios em sequência. Aguarde alguns minutos ou fale conosco pelo WhatsApp.' };
  }

  var now = new Date();
  var stamp = Utilities.formatDate(now, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');

  // Guarda anexos e o pedido (com trava para envios simultâneos).
  var links = [];
  var stored = false;
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    if (files.length) links = saveAttachments(files, lead, now);
    appendLead(lead, links, stamp);
    stored = true;
  } catch (err) {
    logError('Gravação: ' + err);
  } finally {
    try {
      lock.releaseLock();
    } catch (ignore) {}
  }

  var sent = false;
  try {
    sendNotification(lead, files, links, stamp);
    sent = true;
  } catch (err) {
    logError('E-mail para a Inplak: ' + err);
  }

  if (sent && CONFIG.AUTOREPLY) {
    try {
      sendAutoreply(lead);
    } catch (err) {
      logError('Confirmação ao cliente: ' + err);
    }
  }

  if (sent || stored) return { ok: true, message: 'Pedido enviado com sucesso.', redirect: '/obrigado/' };
  return { ok: false, message: 'Não conseguimos enviar o seu pedido agora.' };
}

// ---------------------------------------------------------------------------
// Anexos
// ---------------------------------------------------------------------------

function readAttachments(list, errors) {
  if (!list) return [];
  if (!Array.isArray(list)) {
    errors.anexos = 'Anexos inválidos.';
    return [];
  }
  if (list.length > CONFIG.MAX_FILES) {
    errors.anexos = 'Envie no máximo ' + CONFIG.MAX_FILES + ' arquivos.';
    return [];
  }
  var total = 0;
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var f = list[i] || {};
    var name = safeFilename(String(f.name || 'arquivo'));
    var ext = (name.split('.').pop() || '').toLowerCase();
    var type = FILE_TYPES[ext];
    if (!type) {
      errors.anexos = 'O arquivo ' + name + ' não está em um formato aceito (PDF, JPG, PNG, WEBP, HEIC, DWG ou DXF).';
      return [];
    }
    var bytes;
    try {
      bytes = Utilities.base64Decode(String(f.data || ''));
    } catch (err) {
      errors.anexos = 'Não foi possível receber o arquivo ' + name + '. Tente novamente.';
      return [];
    }
    if (!bytes.length) {
      errors.anexos = 'O arquivo ' + name + ' está vazio.';
      return [];
    }
    if (bytes.length > CONFIG.MAX_FILE_BYTES) {
      errors.anexos = 'O arquivo ' + name + ' passa de 10 MB.';
      return [];
    }
    total += bytes.length;
    if (total > CONFIG.MAX_TOTAL_BYTES) {
      errors.anexos = 'Os anexos passam de 20 MB no total.';
      return [];
    }
    if (!type.check(bytes)) {
      errors.anexos = 'O arquivo ' + name + ' não está em um formato aceito (PDF, JPG, PNG, WEBP, HEIC, DWG ou DXF).';
      return [];
    }
    out.push(Utilities.newBlob(bytes, type.mime, name));
  }
  return out;
}

function saveAttachments(blobs, lead, now) {
  var root = getOrCreateFolder(CONFIG.DRIVE_FOLDER);
  var name = Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH-mm') + ' - ' + lead.nome;
  var folder = root.createFolder(name.slice(0, 120));
  return blobs.map(function (b) {
    return folder.createFile(b).getUrl();
  });
}

function getOrCreateFolder(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

// ---------------------------------------------------------------------------
// Planilha
// ---------------------------------------------------------------------------

var HEADER = ['Data', 'Nome', 'Empresa', 'E-mail', 'Telefone', 'Cidade', 'Serviço', 'Unidades', 'Prazo', 'Mensagem', 'Anexos', 'Página', 'Consentimento LGPD'];

function getSheet(name, header) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(header);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendLead(lead, links, stamp) {
  var row = [
    stamp, lead.nome, lead.empresa, lead.email, lead.telefone, lead.cidade, lead.servico,
    lead.unidades, lead.prazo, lead.mensagem, links.join('\n'), lead.origem, 'Sim (' + stamp + ')',
  ];
  getSheet(CONFIG.SHEET_NAME, HEADER).appendRow(row.map(sheetSafe));
}

// Evita que a planilha interprete o texto como fórmula.
function sheetSafe(v) {
  v = String(v == null ? '' : v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function logError(message) {
  try {
    getSheet(CONFIG.ERRORS_SHEET, ['Data', 'Erro']).appendRow([
      Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss'),
      sheetSafe(String(message).slice(0, 2000)),
    ]);
  } catch (ignore) {}
}

// ---------------------------------------------------------------------------
// Limite de envios (sem guardar IP: por e-mail e no total)
// ---------------------------------------------------------------------------

function rateLimited(email) {
  var cache = CacheService.getScriptCache();
  var now = Date.now();
  var windowMs = CONFIG.RATE_WINDOW_SECONDS * 1000;
  function check(key, max) {
    var list = JSON.parse(cache.get(key) || '[]').filter(function (t) {
      return t > now - windowMs;
    });
    if (list.length >= max) return true;
    list.push(now);
    cache.put(key, JSON.stringify(list), CONFIG.RATE_WINDOW_SECONDS);
    return false;
  }
  var emailKey = 'rate:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email)).slice(0, 40);
  return check(emailKey, CONFIG.RATE_PER_EMAIL) || check('rate:global', CONFIG.RATE_GLOBAL);
}

// ---------------------------------------------------------------------------
// E-mails
// ---------------------------------------------------------------------------

var LABELS = [
  ['nome', 'Nome'], ['empresa', 'Empresa'], ['email', 'E-mail'], ['telefone', 'Telefone/WhatsApp'],
  ['cidade', 'Cidade/UF'], ['servico', 'Serviço'], ['unidades', 'Unidades'], ['prazo', 'Prazo'], ['origem', 'Página de origem'],
];

function sendNotification(lead, files, links, stamp) {
  var digits = lead.telefone.replace(/\D/g, '');
  var waDigits = digits.length <= 11 ? '55' + digits : digits;
  var text = 'Novo pedido de orçamento pelo site\n\n';
  var rows = '';
  LABELS.forEach(function (pair) {
    var value = lead[pair[0]] || '—';
    text += pair[1] + ': ' + value + '\n';
    var cell = esc(value);
    if (pair[0] === 'email') cell = '<a href="mailto:' + esc(lead.email) + '">' + esc(lead.email) + '</a>';
    if (pair[0] === 'telefone') cell += ' · <a href="https://wa.me/' + esc(waDigits) + '">abrir no WhatsApp</a>';
    rows += '<tr><th align="left" style="padding:8px 12px;background:#f4f6f8;border-bottom:1px solid #dbe1e8;width:170px">' + esc(pair[1]) + '</th>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #dbe1e8">' + cell + '</td></tr>';
  });
  text += '\nMensagem:\n' + (lead.mensagem || '—') + '\n';
  if (links.length) text += '\nAnexos no Drive:\n' + links.join('\n') + '\n';
  text += '\nConsentimento LGPD: sim (' + stamp + ')\n';

  var html = '<div style="margin:0;padding:24px;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;color:#111827">' +
    '<table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border-collapse:collapse">' +
    '<tr><td style="background:#013e69;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:700">Novo pedido de orçamento pelo site</td></tr>' +
    '<tr><td style="padding:16px 24px"><table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">' + rows + '</table>' +
    '<p style="margin:20px 0 6px;font-weight:700">Mensagem</p><div style="white-space:pre-wrap;font-size:14px;line-height:1.6;padding:12px;background:#f4f6f8;border-radius:8px">' +
    esc(lead.mensagem || '—') + '</div>' +
    (links.length ? '<p style="font-size:14px"><strong>Anexos</strong> (também anexados a este e-mail): ' + links.map(function (l, i) {
      return '<a href="' + esc(l) + '">' + esc(files[i] ? files[i].getName() : 'arquivo ' + (i + 1)) + '</a>';
    }).join(' · ') + '</p>' : '') +
    '<p style="font-size:12px;color:#5b6575">O cliente autorizou o uso dos dados para resposta a este pedido (LGPD) em ' + esc(stamp) + '.</p>' +
    '</td></tr></table></div>';

  var subject = CONFIG.SUBJECT_PREFIX + 'Orçamento: ' + lead.nome + (lead.empresa ? ' (' + lead.empresa + ')' : '') + (lead.servico ? ' — ' + lead.servico : '');
  MailApp.sendEmail({
    to: CONFIG.TO,
    subject: subject,
    body: text,
    htmlBody: html,
    name: CONFIG.SENDER_NAME,
    replyTo: lead.email,
    attachments: files,
  });
}

function sendAutoreply(lead) {
  var first = lead.nome.split(' ')[0];
  var wa = 'https://wa.me/' + CONFIG.WHATSAPP;
  var text = 'Olá, ' + first + '!\n\nRecebemos o seu pedido de orçamento e um especialista da Inplak vai entrar em contato em breve, ' +
    'de segunda a sexta, das 8h às 18h.\n\nSe quiser adiantar, fale com a gente pelo WhatsApp: ' + wa + '\n\n' +
    'Equipe Inplak Comunicação Visual\n' + CONFIG.SITE_URL + '\n\n' +
    'Você recebeu esta mensagem porque preencheu o formulário de orçamento no site da Inplak.';
  var html = '<div style="margin:0;padding:24px;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;color:#111827">' +
    '<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border-collapse:collapse">' +
    '<tr><td style="background:#013e69;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:700">Recebemos o seu pedido</td></tr>' +
    '<tr><td style="padding:24px;font-size:15px;line-height:1.6">' +
    '<p>Olá, ' + esc(first) + '!</p>' +
    '<p>Recebemos o seu pedido de orçamento e um especialista da Inplak vai entrar em contato em breve, de segunda a sexta, das 8h às 18h.</p>' +
    '<p><a href="' + wa + '" style="display:inline-block;padding:12px 20px;background:#138046;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:700">Adiantar pelo WhatsApp</a></p>' +
    '<p>Equipe Inplak Comunicação Visual<br><a href="' + esc(CONFIG.SITE_URL) + '" style="color:#013e69">Site da Inplak</a></p>' +
    '<p style="font-size:12px;color:#5b6575">Você recebeu esta mensagem porque preencheu o formulário de orçamento no site da Inplak.</p>' +
    '</td></tr></table></div>';
  MailApp.sendEmail({
    to: lead.email,
    subject: 'Recebemos o seu pedido de orçamento — Inplak',
    body: text,
    htmlBody: html,
    name: 'Inplak Comunicação Visual',
    replyTo: CONFIG.TO.split(',')[0].trim(),
  });
}

// ---------------------------------------------------------------------------
// Respostas
// ---------------------------------------------------------------------------

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function respond(isJson, result) {
  if (isJson) return jsonOutput(result);
  // Envio sem JavaScript: página simples com o resultado e o caminho de volta ao site.
  var back = CONFIG.SITE_URL + (result.ok ? '/obrigado/' : '/contato/#orcamento');
  var items = '';
  if (result.errors) {
    Object.keys(result.errors).forEach(function (k) {
      items += '<li>' + esc(result.errors[k]) + '</li>';
    });
  }
  var html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>' + (result.ok ? 'Pedido recebido' : 'Não foi possível enviar') + ' | Inplak</title></head>' +
    '<body style="font-family:Segoe UI,Arial,sans-serif;background:#f4f6f8;color:#111827;margin:0">' +
    '<main style="max-width:560px;margin:10vh auto;padding:32px;background:#fff;border-radius:16px">' +
    '<h1 style="font-size:1.5rem;color:#013e69;margin:0 0 12px">' + (result.ok ? 'Obrigado! Recebemos o seu pedido.' : 'Não foi possível enviar o pedido') + '</h1>' +
    '<p>' + esc(result.ok ? 'Um especialista da Inplak vai entrar em contato em breve. Para enviar fotos ou plantas, use o WhatsApp.' : result.message) + '</p>' +
    (items ? '<ul>' + items + '</ul>' : '') +
    '<p><a href="' + esc(back) + '" target="_top" style="color:#013e69;font-weight:700">Voltar ao site</a> · ' +
    '<a href="https://wa.me/' + CONFIG.WHATSAPP + '" target="_top" style="color:#013e69;font-weight:700">WhatsApp</a></p>' +
    '</main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Inplak');
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

// Caracteres de controle e invisíveis (U+0000 a U+001F, U+007F, U+200B a U+200F, U+2028, U+2029).
function isInvisible(code) {
  return code <= 0x1f || code === 0x7f || (code >= 0x200b && code <= 0x200f) || code === 0x2028 || code === 0x2029;
}

function clean(value, max, multiline) {
  var s = String(value == null ? '' : value).replace(/\r\n?/g, '\n');
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var code = s.charCodeAt(i);
    if (multiline && (code === 0x0a || code === 0x09)) out += s.charAt(i);
    else if (isInvisible(code)) out += multiline ? '' : ' ';
    else out += s.charAt(i);
  }
  out = multiline ? out.replace(/[ \t]+/g, ' ') : out.replace(/\s+/g, ' ');
  return out.trim().slice(0, max);
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function safeFilename(name) {
  name = name.split(/[\\/]/).pop();
  var dot = name.lastIndexOf('.');
  var ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  var base = (dot > 0 ? name.slice(0, dot) : name).normalize('NFD').replace(/[̀-ͯ]/g, '');
  base = base.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '') || 'arquivo';
  return base.slice(0, 70) + (ext ? '.' + ext : '');
}

function startsWith(bytes, sig) {
  for (var i = 0; i < sig.length; i++) {
    if (((bytes[i] + 256) % 256) !== sig[i]) return false;
  }
  return true;
}

function ascii(bytes, start, len) {
  var s = '';
  for (var i = start; i < start + len && i < bytes.length; i++) s += String.fromCharCode((bytes[i] + 256) % 256);
  return s;
}

function looksExecutable(bytes) {
  return ascii(bytes, 0, 2) === 'MZ' || ascii(bytes, 1, 3) === 'ELF' || startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
}

// ---------------------------------------------------------------------------
// Instalação: execute "configurar" uma vez no editor para autorizar e testar.
// ---------------------------------------------------------------------------

function configurar() {
  getSheet(CONFIG.SHEET_NAME, HEADER);
  getSheet(CONFIG.ERRORS_SHEET, ['Data', 'Erro']);
  getOrCreateFolder(CONFIG.DRIVE_FOLDER);
  MailApp.sendEmail({
    to: CONFIG.TO,
    subject: CONFIG.SUBJECT_PREFIX + 'Formulário do site configurado',
    body: 'O formulário de orçamento do site da Inplak está ligado a esta planilha. Os próximos pedidos chegarão neste e-mail.',
    name: CONFIG.SENDER_NAME,
  });
  Logger.log('Pronto: abas criadas, pasta no Drive criada e e-mail de teste enviado para ' + CONFIG.TO + '.');
}

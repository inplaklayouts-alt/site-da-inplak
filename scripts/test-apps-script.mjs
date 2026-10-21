// Testa apps-script/Code.gs fora do Google, com simuladores dos serviços (Planilha, Drive, e-mail, cache).
// Uso: node scripts/test-apps-script.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const code = readFileSync(path.join(root, 'apps-script', 'Code.gs'), 'utf8');

function makeEnv({ mailFails = false } = {}) {
  const state = { sheets: {}, emails: [], folders: {}, cache: {}, logs: [] };
  const toSigned = (buf) => Array.from(buf, (b) => (b > 127 ? b - 256 : b));
  const blob = (bytes, mime, name) => ({ bytes, mime, name, getName: () => name, getBytes: () => bytes, getContentType: () => mime });
  const sheet = (name) => ({
    rows: [],
    appendRow(r) {
      this.rows.push(r);
    },
    getRange: () => ({ setFontWeight() {} }),
    setFrozenRows() {},
  });
  const ctx = {
    console,
    Date,
    JSON,
    Math,
    Object,
    String,
    Number,
    Array,
    RegExp,
    Utilities: {
      base64Decode: (s) => {
        if (!/^[A-Za-z0-9+/=]*$/.test(s)) throw new Error('base64 inválido');
        return toSigned(Buffer.from(s, 'base64'));
      },
      base64EncodeWebSafe: (bytes) => Buffer.from(bytes.map((b) => (b + 256) % 256)).toString('base64url'),
      computeDigest: (alg, s) => toSigned(createHash('sha256').update(s).digest()),
      DigestAlgorithm: { SHA_256: 'SHA_256' },
      newBlob: blob,
      formatDate: (d, tz, fmt) => d.toLocaleString('pt-BR', { timeZone: tz }),
    },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => state.sheets[n] || null,
        insertSheet: (n) => (state.sheets[n] = sheet(n)),
      }),
    },
    DriveApp: {
      getFoldersByName: (n) => {
        const f = state.folders[n];
        return { hasNext: () => Boolean(f), next: () => f };
      },
      createFolder: (n) => {
        const folder = {
          name: n,
          files: [],
          sub: [],
          createFolder(m) {
            const s = { name: m, files: [], createFile(b) { this.files.push(b); return { getUrl: () => `https://drive.google.com/file/${encodeURIComponent(b.name)}` }; } };
            this.sub.push(s);
            return s;
          },
        };
        state.folders[n] = folder;
        return folder;
      },
    },
    MailApp: {
      sendEmail: (o) => {
        if (mailFails) throw new Error('cota de e-mail excedida');
        state.emails.push(o);
      },
    },
    CacheService: {
      getScriptCache: () => ({ get: (k) => state.cache[k] || null, put: (k, v) => (state.cache[k] = v) }),
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (t) => ({ kind: 'json', text: t, setMimeType() { return this; } }),
    },
    HtmlService: { createHtmlOutput: (h) => ({ kind: 'html', html: h, setTitle() { return this; } }) },
    Logger: { log: (m) => state.logs.push(m) },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return { ctx, state };
}

const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0, 1]).toString('base64');
const pdf = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF\n').toString('base64');
const exe = Buffer.from('MZ\x90\x00 nao e imagem').toString('base64');
const old = String(Date.now() - 15000);
const base = { nome: 'Maria da Silva', email: 'Maria@Example.com', telefone: '(11) 98888-7777', consentimento: 'sim', iniciado: old, origem: '/contato/' };
const post = (env, body) => env.ctx.doPost({ postData: { contents: JSON.stringify(body), type: 'text/plain' }, parameter: {} });
const parse = (out) => (out.kind === 'json' ? JSON.parse(out.text) : out);

let failures = 0;
function check(name, cond, info = '') {
  console.log(`${cond ? '✓' : '✗'} ${name}${info ? ' — ' + info : ''}`);
  if (!cond) failures++;
}

// 1. Saúde
{
  const env = makeEnv();
  const r = parse(env.ctx.doGet());
  check('doGet responde', r.ok === true && r.service === 'inplak-formulario');
}

// 2. Pedido válido com 2 anexos
{
  const env = makeEnv();
  const r = parse(
    post(env, {
      ...base,
      empresa: '=SOMA(A1)',
      servico: 'Totens e letreiros',
      unidades: '2 a 5 unidades',
      prazo: 'De 1 a 3 meses',
      mensagem: 'Linha 1\nLinha 2 com acentuação',
      anexos: [
        { name: 'foto da fachada.jpg', type: 'image/jpeg', data: jpg },
        { name: '../planta.PDF', type: 'application/pdf', data: pdf },
      ],
    }),
  );
  const rows = env.state.sheets.Pedidos?.rows || [];
  const [notif, reply] = env.state.emails;
  check('pedido válido aceito', r.ok === true && r.redirect === '/obrigado/', JSON.stringify(r));
  check('planilha com cabeçalho + 1 pedido', rows.length === 2 && rows[0][0] === 'Data');
  check('fórmula neutralizada na planilha', rows[1][2] === "'=SOMA(A1)", rows[1][2]);
  check('e-mail normalizado', rows[1][3] === 'maria@example.com');
  check('anexos salvos no Drive', env.state.folders['Inplak - anexos do site']?.sub[0]?.files.length === 2);
  check('nomes de arquivo higienizados', notif?.attachments.map((a) => a.name).join(',') === 'foto-da-fachada.jpg,planta.pdf', notif?.attachments.map((a) => a.name).join(','));
  check('e-mail para a Inplak com resposta ao cliente', notif?.to === 'comercial@inplak.com.br' && notif.replyTo === 'maria@example.com' && notif.attachments.length === 2);
  check('assunto com nome, empresa e serviço', /Orçamento: Maria da Silva \(=SOMA\(A1\)\) — Totens e letreiros/.test(notif?.subject || ''), notif?.subject);
  check('HTML do e-mail escapado', !/<script/i.test(notif?.htmlBody || '') && /acentuação/.test(notif?.htmlBody || ''));
  check('confirmação enviada ao cliente', reply?.to === 'maria@example.com' && /Recebemos/.test(reply.subject));
}

// 3. Campo isca (robô)
{
  const env = makeEnv();
  const r = parse(post(env, { ...base, website: 'http://spam' }));
  check('robô (campo isca) recebe "ok" falso e nada é enviado', r.ok && env.state.emails.length === 0 && !env.state.sheets.Pedidos);
}

// 4. Envio rápido demais
{
  const env = makeEnv();
  const r = parse(post(env, { ...base, iniciado: String(Date.now()) }));
  check('envio em menos de 3 s é descartado', r.ok && env.state.emails.length === 0);
}

// 5. Campos inválidos
{
  const env = makeEnv();
  const r = parse(post(env, { nome: 'A', email: 'x', telefone: '123', iniciado: old }));
  check('erros por campo', !r.ok && r.errors.nome && r.errors.email && r.errors.telefone && r.errors.consentimento, Object.keys(r.errors || {}).join(','));
}

// 6. Anexo disfarçado, grande demais e em excesso
{
  const env = makeEnv();
  const r1 = parse(post(env, { ...base, anexos: [{ name: 'foto.jpg', data: exe }] }));
  check('arquivo disfarçado de .jpg recusado', !r1.ok && /formato/.test(r1.errors?.anexos || ''));
  const big = Buffer.alloc(11 * 1024 * 1024, 0x30);
  big.write('%PDF-1.4');
  const r2 = parse(post(env, { ...base, anexos: [{ name: 'grande.pdf', data: big.toString('base64') }] }));
  check('arquivo acima de 10 MB recusado', !r2.ok && /10 MB/.test(r2.errors?.anexos || ''));
  const r3 = parse(post(env, { ...base, anexos: Array.from({ length: 6 }, (_, i) => ({ name: `f${i}.pdf`, data: pdf })) }));
  check('mais de 5 arquivos recusado', !r3.ok && /no máximo 5/.test(r3.errors?.anexos || ''));
  const r4 = parse(post(env, { ...base, anexos: [{ name: 'virus.exe', data: exe }] }));
  check('extensão não permitida recusada', !r4.ok && /formato/.test(r4.errors?.anexos || ''));
}

// 7. Limite por e-mail
{
  const env = makeEnv();
  const results = [1, 2, 3, 4].map(() => parse(post(env, { ...base })));
  check('4º envio do mesmo e-mail em 10 min bloqueado', results.slice(0, 3).every((r) => r.ok) && !results[3].ok && /muitos envios/.test(results[3].message));
}

// 8. Envio sem JavaScript (formulário comum)
{
  const env = makeEnv();
  const out = env.ctx.doPost({ postData: { contents: 'nome=Jo%C3%A3o', type: 'application/x-www-form-urlencoded' }, parameter: { ...base, nome: 'João Teste' } });
  check('sem JavaScript: página de confirmação', out.kind === 'html' && /Recebemos o seu pedido/.test(out.html) && env.state.emails.length === 2);
  const bad = env.ctx.doPost({ postData: { contents: 'nome=', type: 'application/x-www-form-urlencoded' }, parameter: { nome: '', iniciado: old } });
  check('sem JavaScript: página com os erros', bad.kind === 'html' && /Informe seu nome/.test(bad.html));
}

// 9. E-mail fora do ar: pedido fica salvo e o erro é registrado
{
  const env = makeEnv({ mailFails: true });
  const r = parse(post(env, { ...base }));
  check('e-mail falhou mas pedido salvo', r.ok && env.state.sheets.Pedidos.rows.length === 2 && env.state.sheets.Erros.rows.length >= 2);
}

// 10. JSON quebrado
{
  const env = makeEnv();
  const r = parse(env.ctx.doPost({ postData: { contents: '{quebrado', type: 'text/plain' }, parameter: {} }));
  check('JSON inválido tratado', r.ok === false && /ler os dados/.test(r.message));
}

console.log(failures ? `\n${failures} teste(s) falharam` : '\nTodos os testes do Apps Script passaram.');
process.exit(failures ? 1 : 0);

// Dados da empresa e configurações gerais do site.
// Tudo o que aparece em vários lugares (rodapé, schema, contato, política) vem daqui.

// Opções de build: --target=github|hostinger  --site-url=https://...  (ou variáveis TARGET, SITE_URL)
const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

// "github": GitHub Pages (sem PHP e sem .htaccess). "hostinger": inclui o PHP do formulário e o .htaccess.
const TARGET = arg('target') || process.env.TARGET || 'github';

// Endereço público do site, sem barra no final. No GitHub Pages sem domínio próprio o site fica
// numa subpasta (ex.: https://usuario.github.io/site-da-inplak), e os links ganham esse prefixo.
const SITE_URL = (arg('site-url') || process.env.SITE_URL || 'https://inplak.com.br').replace(/\/+$/, '');
const BASE_PATH = new URL(SITE_URL).pathname.replace(/\/+$/, '');

export const site = {
  url: SITE_URL,
  basePath: BASE_PATH,
  target: TARGET,
  name: 'Inplak Comunicação Visual',
  brand: 'Grupo Inplak',
  slogan: 'Imagine e nós fazemos',
  legalName: 'INPLAK COMUNICACAO VISUAL LTDA',
  cnpj: '38.429.208/0001-01',
  foundedClaim: '+22 anos de mercado',
  locale: 'pt_BR',
  lang: 'pt-BR',
  themeColor: '#013e69',

  phone: {
    display: '(11) 99224-3088',
    e164: '+5511992243088',
  },
  whatsapp: {
    number: '5511992243088',
    defaultMessage: 'Olá! Vim pelo site da Inplak e gostaria de solicitar um orçamento.',
  },
  email: 'comercial@inplak.com.br',

  address: {
    street: 'Rua Jorge Velho, 120',
    district: 'Campestre',
    city: 'Santo André',
    state: 'SP',
    zip: '09080-570',
    country: 'BR',
    // Coordenadas do endereço segundo o Google Maps, usadas no schema LocalBusiness.
    lat: -23.6347976,
    lng: -46.5405175,
  },
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Inplak+Comunica%C3%A7%C3%A3o+Visual%2C+Rua+Jorge+Velho%2C+120%2C+Campestre%2C+Santo+Andr%C3%A9+-+SP%2C+09080-570',
  mapsEmbed:
    'https://www.google.com/maps?q=Rua+Jorge+Velho,+120+-+Campestre,+Santo+Andr%C3%A9+-+SP,+09080-570&output=embed',

  hours: {
    display: 'Segunda a sexta, das 8h às 18h',
    short: 'Seg. a sex. · 8h às 18h',
    schema: [{ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' }],
  },

  social: [
    { name: 'Instagram', handle: '@grupo.inplak', url: 'https://www.instagram.com/grupo.inplak/', icon: 'instagram' },
    { name: 'YouTube', handle: 'Inplak Comunicação Visual', url: 'https://www.youtube.com/@inplakcomunicacaovisual9132', icon: 'youtube' },
  ],

  // Números do folder institucional (out/2026) e do site anterior.
  stats: [
    { value: 22, prefix: '+', suffix: '', label: 'anos de mercado' },
    { value: 7000, prefix: '+', suffix: ' m²', label: 'de área fabril' },
    { value: 30000, prefix: '+', suffix: '', label: 'projetos entregues' },
    { value: 10000, prefix: '+', suffix: '', label: 'clientes atendidos' },
  ],

  // Folder institucional também publicado no FlipHTML5.
  folder: {
    fliphtml5: 'https://online.fliphtml5.com/GRUPOINPLAK/FOLDER-VIRTUAL/',
  },

  // Formulário de orçamento.
  //  provider 'apps-script': Google Apps Script (pasta apps-script/). Cole em "endpoint" a URL
  //                          do app da Web publicado (termina em /exec).
  //  provider 'php':         api/contato.php (hospedagem com PHP, ex.: Hostinger). "endpoint"
  //                          vazio usa o PHP do próprio site; ou informe a URL completa.
  // Sem "endpoint" no modo apps-script, o formulário monta a mensagem e abre o WhatsApp.
  form: {
    provider: arg('form-provider') || process.env.FORM_PROVIDER || (TARGET === 'hostinger' ? 'php' : 'apps-script'),
    endpoint: arg('form-endpoint') || process.env.FORM_ENDPOINT || '',
  },

  payment: {
    installments: 'Parcelamento em até 10x',
    brands: ['Visa', 'Mastercard', 'Maestro', 'Elo', 'Hipercard', 'Hiper', 'American Express'],
    bndes: true,
  },

  // Medição. Preencha com o ID do GA4 (G-XXXXXXX) e/ou do Google Tag Manager (GTM-XXXXXXX).
  // Enquanto os dois estiverem vazios, nenhum script de rastreamento é carregado
  // e o aviso de cookies não aparece (o site só usa armazenamento essencial).
  analytics: {
    ga4: '',
    gtm: '',
  },
};

// Como o formulário envia: 'php', 'apps-script' (com endpoint) ou 'whatsapp' (sem servidor configurado).
export const formMode = () => (site.form.provider === 'php' ? 'php' : site.form.endpoint ? 'apps-script' : 'whatsapp');

export const waLink = (message = site.whatsapp.defaultMessage) =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;

export const telLink = `tel:${site.phone.e164}`;
export const mailLink = (subject = 'Orçamento pelo site') => `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

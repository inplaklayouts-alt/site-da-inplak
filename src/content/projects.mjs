// Portfólio. Cada item usa uma imagem de media/ (chave = nome do arquivo sem extensão).
// Para adicionar um projeto: coloque a foto em _originais/, registre a chave em
// scripts/images.py (PHOTOS), rode "npm run images" e acrescente um item aqui.

export const categories = [
  { id: 'fachadas', label: 'Fachadas', long: 'Fachadas e comunicação externa', service: 'comunicacao-visual-externa' },
  { id: 'interna', label: 'Comunicação interna', long: 'Comunicação visual interna', service: 'comunicacao-visual-interna' },
  { id: 'totens', label: 'Totens', long: 'Totens e letreiros', service: 'totens-e-letreiros' },
  { id: 'mobiliario', label: 'Mobiliário', long: 'Mobiliário e marcenaria', service: 'mobiliario-e-marcenaria' },
  { id: 'estrutura', label: 'Estrutura metálica', long: 'Estrutura metálica', service: null },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

export const projects = [
  // Fachadas e comunicação externa
  { image: 'fachada-rede-market', category: 'fachadas', title: 'Rede Market', type: 'Fachada e letreiros', alt: 'Fachada da Rede Market com letreiros em letra caixa vermelha e azul e frontões com o padrão gráfico da marca' },
  { image: 'fachada-boa-supermercados', category: 'fachadas', title: 'Boa Supermercados', type: 'Fachada e revestimento', alt: 'Fachada do Boa Supermercados revestida em painéis cinza em tons alternados, com logotipo azul e amarelo em relevo' },
  { image: 'fachada-bluefit', category: 'fachadas', title: 'BlueFit', type: 'Fachada com iluminação', alt: 'Fachada da academia BlueFit à noite, com letreiro e iluminação azul em LED' },
  { image: 'fachada-super-big', category: 'fachadas', title: 'Super Big', type: 'Fachada e letreiros iluminados', alt: 'Fachada do Super Big à noite, revestida em vermelho e amarelo, com letreiros iluminados' },
  { image: 'fachada-supermercados-alvorada', category: 'fachadas', title: 'Supermercados Alvorada', type: 'Fachada e letreiro', alt: 'Fachada do Supermercados Alvorada ao entardecer, com letreiro iluminado e faixas verde, branca e laranja' },
  { image: 'fachada-canossa-supermercados', category: 'fachadas', title: 'Canossa Supermercados', type: 'Fachada e revestimento', alt: 'Fachada do Canossa Supermercados com estrutura vermelha e painel de revestimento em losangos' },
  { image: 'fachada-centro-de-formacao-itaquaquecetuba', category: 'fachadas', title: 'Centro de Formação — Itaquaquecetuba', type: 'Fachada institucional', alt: 'Fachada do Centro de Formação de Itaquaquecetuba revestida em azul, com letras caixa verticais e painel da Secretaria Municipal de Educação', caseSlug: 'centro-de-formacao-itaquaquecetuba' },
  { image: 'depois-oxxo', category: 'fachadas', title: 'OXXO', type: 'Fachada e totem', alt: 'Loja OXXO com fachada vermelha e amarela, letreiro e totem indicando o estacionamento', caseSlug: 'oxxo' },
  { image: 'fachada-agibank', category: 'fachadas', title: 'Agibank', type: 'Fachada e letreiro iluminado', alt: 'Fachada de agência Agibank em azul, com letreiro iluminado e vitrine' },
  { image: 'fachada-abc-plus', category: 'fachadas', title: 'ABC Plus', type: 'Letreiro e entrada', alt: 'Entrada do ABC Plus com letreiro em letras caixa sobre jardim vertical' },
  { image: 'fachada-isabela-presentes-cristal-academia', category: 'fachadas', title: 'Isabela Presentes e Cristal Academia', type: 'Fachada comercial', alt: 'Fachada comercial com a loja Isabela Presentes no térreo e a Cristal Academia no andar superior, com grafismo em azul e vermelho' },
  { image: 'fachada-ferreira-supermercados', category: 'fachadas', title: 'Ferreira Supermercados', type: 'Fachada', alt: 'Fachada do Ferreira Supermercados com faixa azul e vermelha e logotipo ao centro' },
  { image: 'fachada-superbom-supermercados', category: 'fachadas', title: 'Supermercados SuperBom', type: 'Fachada e letras caixa', alt: 'Fachada do Supermercados SuperBom com letreiro em letra caixa vermelha e azul sobre a marquise' },
  { image: 'fachada-assai-atacadista', category: 'fachadas', title: 'Assaí Atacadista', type: 'Fachada', alt: 'Vista aérea de loja Assaí Atacadista com fachada azul, letreiro e estacionamento' },
  { image: 'fachada-casa-da-mulher-itaquaquecetuba', category: 'fachadas', title: 'Casa da Mulher — Itaquaquecetuba', type: 'Fachada institucional', alt: 'Fachada da Casa da Mulher em Itaquaquecetuba com painéis verticais em tons de rosa e vinho' },

  // Totens e letreiros
  { image: 'totem-barcelos-atacadista', category: 'totens', title: 'Barcelos Atacadista', type: 'Totem iluminado', alt: 'Totem iluminado do Barcelos Atacadista à noite' },
  { image: 'totem-assai-atacadista-instalacao', category: 'totens', title: 'Assaí Atacadista', type: 'Instalação de totem', alt: 'Instalação do totem do Assaí Atacadista com auxílio de guindaste' },
  { image: 'totem-avistao-instalacao', category: 'totens', title: 'Avistão Supermercados', type: 'Instalação de totem', alt: 'Totem do Avistão Supermercados sendo instalado com guindaste' },
  { image: 'totem-assai-farma', category: 'totens', title: 'Assaí Farma', type: 'Totem de identificação', alt: 'Totem vertical azul do Assaí Farma ao lado de uma avenida' },
  { image: 'totem-st-marche', category: 'totens', title: 'St Marche', type: 'Totem de identificação', alt: 'Totem vertical verde do St Marche em frente à loja' },
  { image: 'totem-dia', category: 'totens', title: 'Dia', type: 'Totem de identificação', alt: 'Totem alto do supermercado Dia com placa vermelha' },
  { image: 'totem-duda-utilidades', category: 'totens', title: 'Duda Utilidades do Lar', type: 'Totem de saída', alt: 'Totem laranja de saída de veículos da Duda Utilidades do Lar' },
  { image: 'totem-bluefit-vagas', category: 'totens', title: 'BlueFit', type: 'Totem de vagas', alt: 'Totem de sinalização de vagas de estacionamento da BlueFit' },

  // Comunicação visual interna
  { image: 'interna-acougue', category: 'interna', title: 'Açougue', type: 'Ambientação e letreiros', alt: 'Setor de açougue com painéis decorativos pretos, letreiros e balcão refrigerado' },
  { image: 'interna-setores-supermercado', category: 'interna', title: 'Setores de supermercado', type: 'Testeiras de setores', alt: 'Vista do salão de supermercado com testeiras dos setores Açougue, Massas e Hortifrúti' },
  { image: 'interna-laticinios-frios-paes', category: 'interna', title: 'Laticínios, frios e pães', type: 'Painéis de setores', alt: 'Painéis de identificação dos setores Laticínios, Frios e Pães Embalados' },
  { image: 'interna-hortifruti-ovos', category: 'interna', title: 'Hortifrúti', type: 'Letreiros de setores', alt: 'Comunicação dos setores Hortifrúti e Ovos e Temperos com letreiros acima dos expositores' },
  { image: 'interna-ambientacao-supermercado', category: 'interna', title: 'Ambientação de supermercado', type: 'Ambientação', alt: 'Salão de supermercado com forro decorativo em madeira, iluminação e comunicação de setores' },
  { image: 'interna-frios-e-leites', category: 'interna', title: 'Frios e leites', type: 'Sinalização de setores', alt: 'Sinalização dos setores Frios & Fatiados e Leites em supermercado' },
  { image: 'interna-barcelos-corredores', category: 'interna', title: 'Barcelos Atacadista', type: 'Placas de corredor', alt: 'Corredor do Barcelos Atacadista com placas suspensas e comunicação de preços' },
  { image: 'interna-barcelos-caixas', category: 'interna', title: 'Barcelos Atacadista', type: 'Numeração de caixas', alt: 'Frente de caixa do Barcelos Atacadista com numeração suspensa dos caixas' },
  { image: 'interna-adega-forro-ripado', category: 'interna', title: 'Adega', type: 'Letreiro e forro ripado', alt: 'Adega com letreiro iluminado e forro ripado em madeira sobre as gôndolas' },
  { image: 'interna-adega-letreiro-suspenso', category: 'interna', title: 'Adega', type: 'Letreiro suspenso', alt: 'Adega com letreiro suspenso e painéis em tons de roxo' },
  { image: 'interna-acougue-e-frios', category: 'interna', title: 'Açougue e frios', type: 'Placas de setores', alt: 'Sinalização dos setores Açougue e Frios com painéis vazados e placas em madeira' },
  { image: 'interna-frente-de-caixa', category: 'interna', title: 'Frente de caixa', type: 'Comunicação de checkout', alt: 'Frente de caixa com banners e comunicação de marcas acima dos checkouts' },
  { image: 'interna-area-de-bazar', category: 'interna', title: 'Área de bazar', type: 'Ambientação', alt: 'Área de bazar com faixa de boas-vindas e painéis coloridos' },

  // Mobiliário e marcenaria
  { image: 'mobiliario-estantes-supermercado-mirassol', category: 'mobiliario', title: 'Supermercado Mirassol', type: 'Estantes modulares', alt: 'Estantes modulares com prateleiras em madeira e estrutura preta produzidas para o Supermercado Mirassol', caseSlug: 'supermercado-mirassol' },
  { image: 'mobiliario-loja-de-calcados', category: 'mobiliario', title: 'Loja de calçados', type: 'Marcenaria de loja', alt: 'Loja de calçados e bolsas com prateleiras em madeira, painel ripado e bancos estofados' },
  { image: 'mobiliario-balcao-de-atendimento', category: 'mobiliario', title: 'Balcão de atendimento', type: 'Balcão sob medida', alt: 'Balcão de atendimento curvo com frente ripada verde e tampo em madeira' },
  { image: 'mobiliario-ilha-expositora', category: 'mobiliario', title: 'Ilha expositora', type: 'Expositor de centro de loja', alt: 'Ilha expositora em estrutura metálica e madeira para centro de loja' },
  { image: 'mobiliario-gondolas', category: 'mobiliario', title: 'Gôndolas', type: 'Gôndolas sob medida', alt: 'Gôndolas pretas com laterais em madeira' },
  { image: 'mobiliario-balcao-ripado', category: 'mobiliario', title: 'Balcão ripado', type: 'Balcão sob medida', alt: 'Balcão branco com frente ripada' },
  { image: 'mobiliario-estantes-metalicas', category: 'mobiliario', title: 'Estantes', type: 'Estrutura metálica e madeira', alt: 'Estantes com estrutura metálica preta e prateleiras em madeira' },
  { image: 'mobiliario-mesas-restaurante', category: 'mobiliario', title: 'Restaurante', type: 'Mobiliário e forro ripado', alt: 'Mesas e cadeiras em madeira com forro ripado em ambiente de alimentação' },
  { image: 'mobiliario-estacoes-de-trabalho', category: 'mobiliario', title: 'Estações de trabalho', type: 'Mobiliário corporativo', alt: 'Estações de trabalho com tampo em madeira e divisórias metálicas pretas' },

  // Estrutura metálica
  { image: 'estrutura-metalica-cobertura', category: 'estrutura', title: 'Cobertura metálica', type: 'Estrutura metálica', alt: 'Estrutura metálica de cobertura em treliças' },
];

export const projectByImage = Object.fromEntries(projects.map((p) => [p.image, p]));

// Destaques da home (ordem de exibição).
export const featuredProjects = [
  'fachada-rede-market',
  'interna-acougue',
  'totem-barcelos-atacadista',
  'fachada-bluefit',
  'mobiliario-loja-de-calcados',
  'interna-setores-supermercado',
  'fachada-super-big',
  'totem-assai-atacadista-instalacao',
  'interna-adega-forro-ripado',
  'totem-st-marche',
];

// Slides do hero da home.
export const heroSlides = [
  { image: 'fachada-rede-market', label: 'Fachada Rede Market', position: '62% 50%' },
  { image: 'fachada-boa-supermercados', label: 'Fachada Boa Supermercados', position: '55% 50%' },
  { image: 'fachada-supermercados-alvorada', label: 'Fachada Supermercados Alvorada', position: '50% 50%' },
  { image: 'fachada-super-big', label: 'Fachada Super Big', position: '55% 50%' },
];

// Logos de clientes (arquivos em media/clientes).
export const clients = [
  ['cliente-carrefour', 'Carrefour'],
  ['cliente-assai', 'Assaí'],
  ['cliente-pao-de-acucar', 'Pão de Açúcar'],
  ['cliente-dia', 'Dia'],
  ['cliente-pernambucanas', 'Pernambucanas'],
  ['cliente-st-marche', 'St Marche'],
  ['cliente-sonda', 'Sonda'],
  ['cliente-sao-roque', 'São Roque Supermercados'],
  ['cliente-savegnago', 'Savegnago'],
  ['cliente-uniao', 'União Supermercados'],
  ['cliente-superbom', 'Supermercados SuperBom'],
  ['cliente-bobs', "Bob's"],
  ['cliente-bluefit', 'BlueFit'],
  ['cliente-bem-barato', 'Bem Barato'],
  ['cliente-rede-r-market', 'Rede Market'],
  ['cliente-avistao', 'Avistão'],
  ['cliente-alvorada', 'Supermercados Alvorada'],
  ['cliente-super-big', 'Super Big'],
  ['cliente-dville', "D'Ville Supermercados"],
  ['cliente-mini-preco', 'Rede Mini Preço'],
  ['cliente-negreiros', 'Negreiros Supermercados'],
  ['cliente-abc-plus', 'ABC Plus'],
  ['cliente-boa-supermercados', 'Boa Supermercados'],
  ['cliente-comercial-esperanca', 'Comercial Esperança'],
  ['cliente-davo', "D'avó"],
  ['cliente-sublime', 'Supermercado Sublime'],
];

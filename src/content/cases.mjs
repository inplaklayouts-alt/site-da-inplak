// Cases com antes e depois. Os textos descrevem apenas o que foi entregue
// e o que é visível nas imagens do projeto.

export const cases = [
  {
    slug: 'centro-de-formacao-itaquaquecetuba',
    title: 'Centro de Formação — Prefeitura de Itaquaquecetuba',
    cardTitle: 'Centro de Formação Itaquá',
    seoTitle: 'Case: Fachada do Centro de Formação de Itaquaquecetuba | Inplak',
    description:
      'Antes e depois da fachada do Centro de Formação da Secretaria Municipal de Educação de Itaquaquecetuba: revestimento azul, chapas perfuradas e letras caixa.',
    og: 'og-case-centro-formacao',
    client: 'Prefeitura de Itaquaquecetuba — Secretaria Municipal de Educação',
    location: 'Itaquaquecetuba/SP',
    segment: 'Institucional',
    service: 'comunicacao-visual-externa',
    serviceLabel: 'Fachada institucional',
    before: 'antes-centro-de-formacao-itaquaquecetuba',
    after: 'fachada-centro-de-formacao-itaquaquecetuba',
    beforeLabel: 'Antes',
    afterLabel: 'Depois',
    summary:
      'Nova fachada para o prédio de três pavimentos que passou a abrigar o Centro de Formação dos profissionais da rede municipal de ensino.',
    challenge:
      'O prédio tinha uma fachada neutra, sem nenhuma identificação. O objetivo era transformá-lo em um ponto de referência da Secretaria de Educação, reconhecível à distância e coerente com a identidade da Prefeitura.',
    solution: [
      'Revestimento da fachada em azul, com módulos de chapa perfurada que criam textura e profundidade.',
      'Letras caixa verticais “CENTRO” e “FORMAÇÃO” nas laterais, para leitura a partir da rua.',
      'Painel central com a marca “Profissionais da Educação” e a assinatura da Secretaria Municipal de Educação e da Prefeitura.',
      'Projeto, produção e instalação feitos pela Inplak.',
    ],
    result:
      'O prédio ganhou identidade institucional clara: quem passa pela rua identifica o Centro de Formação e a Secretaria responsável pelo espaço.',
    related: ['fachada-casa-da-mulher-itaquaquecetuba', 'fachada-agibank', 'fachada-canossa-supermercados'],
  },
  {
    slug: 'oxxo',
    title: 'OXXO — fachada e comunicação externa',
    cardTitle: 'OXXO',
    seoTitle: 'Case: Comunicação Visual Externa de Loja OXXO | Inplak',
    description:
      'Antes e depois de uma loja OXXO: fachada nas cores da rede, letreiros, grafismo padrão e totem de estacionamento, com produção e instalação da Inplak.',
    og: 'og-case-oxxo',
    client: 'OXXO',
    location: null,
    segment: 'Loja de conveniência',
    service: 'comunicacao-visual-externa',
    serviceLabel: 'Comunicação visual externa',
    before: 'antes-oxxo',
    after: 'depois-oxxo',
    beforeLabel: 'Antes',
    afterLabel: 'Depois',
    summary:
      'Implantação da comunicação visual externa de uma loja de conveniência OXXO em um imóvel comercial de esquina.',
    challenge:
      'Transformar um imóvel comercial sem identidade em uma loja pronta para abrir, seguindo à risca o padrão visual da rede e garantindo visibilidade para quem passa a pé ou de carro.',
    solution: [
      'Faixas de fachada nas cores vermelha e amarela da marca, contornando a esquina.',
      'Aplicação do grafismo padrão da rede no revestimento da fachada.',
      'Letreiros com o logotipo OXXO e comunicação nas vitrines.',
      'Totem com a marca e a indicação de estacionamento.',
    ],
    result:
      'Uma loja identificada à distância e fiel ao padrão da rede, com o totem orientando quem chega de carro.',
    related: ['fachada-agibank', 'fachada-isabela-presentes-cristal-academia', 'totem-duda-utilidades'],
  },
  {
    slug: 'supermercado-mirassol',
    title: 'Supermercado Mirassol — do projeto 3D às estantes prontas',
    cardTitle: 'Supermercado Mirassol',
    seoTitle: 'Case: Estantes Sob Medida para o Supermercado Mirassol | Inplak',
    description:
      'Do projeto 3D à fabricação: estantes modulares em estrutura preta com prateleiras em madeira, produzidas pela Inplak para o Supermercado Mirassol.',
    og: 'og-case-mirassol',
    client: 'Supermercado Mirassol',
    location: null,
    segment: 'Supermercado',
    service: 'mobiliario-e-marcenaria',
    serviceLabel: 'Mobiliário e marcenaria',
    before: 'mobiliario-projeto-3d-supermercado-mirassol',
    after: 'mobiliario-estantes-supermercado-mirassol',
    beforeLabel: 'Projeto 3D',
    afterLabel: 'Executado',
    summary:
      'Estantes modulares desenvolvidas para organizar a exposição de produtos do Supermercado Mirassol.',
    challenge:
      'Criar estantes que organizassem a exposição de produtos e combinassem com o padrão da loja, com aprovação do cliente antes de qualquer peça entrar em produção.',
    solution: [
      'Projeto 3D com a divisão em módulos (Módulo 01 e Módulo 02) para aprovação do cliente.',
      'Estrutura preta com prateleiras e topo em acabamento amadeirado.',
      'Produção em marcenaria própria, fiel às medidas e ao desenho aprovados.',
      'Módulos pensados para serem montados lado a lado e replicados quando necessário.',
    ],
    result:
      'O que foi aprovado na tela é o que chegou à loja: as estantes foram fabricadas seguindo o projeto 3D, com o mesmo desenho modular e acabamento.',
    related: ['mobiliario-gondolas', 'mobiliario-estantes-metalicas', 'mobiliario-ilha-expositora'],
  },
];

export const caseBySlug = Object.fromEntries(cases.map((c) => [c.slug, c]));

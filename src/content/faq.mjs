// Perguntas frequentes. As 9 primeiras vêm do site original; as demais
// respondem dúvidas de atendimento com informações fornecidas pela empresa.

export const faqGroups = [
  { id: 'servicos', label: 'Sobre os serviços' },
  { id: 'orcamento', label: 'Orçamento e prazos' },
  { id: 'atendimento', label: 'Atendimento' },
];

export const faqs = [
  {
    id: 'o-que-e-comunicacao-visual',
    group: 'servicos',
    q: 'O que é comunicação visual?',
    a: 'Comunicação visual é o conjunto de elementos que ajudam uma marca a se apresentar, orientar e se comunicar com seu público por meio de fachadas, sinalização, ambientação, expositores, mobiliário e outros recursos visuais. Mais do que estética, é uma forma de fortalecer a identidade da marca e criar uma experiência visual consistente em cada ponto de contato com o cliente.',
  },
  {
    id: 'projetos-personalizados',
    group: 'servicos',
    q: 'Vocês fazem projetos personalizados?',
    a: 'Sim. Cada projeto é desenvolvido de acordo com a identidade da marca, as características do espaço e os objetivos de cada negócio. Trabalhamos desde soluções pontuais até projetos completos de comunicação visual, mobiliário, expositores, sinalização e ambientação.',
  },
  {
    id: 'mobiliario-personalizado',
    group: 'servicos',
    q: 'Vocês trabalham com mobiliário e expositores personalizados?',
    a: 'Sim. Desenvolvemos mobiliário e expositores personalizados de acordo com a identidade visual da marca, as características do ambiente e a finalidade de cada projeto. Criamos soluções que aliam funcionalidade, apresentação e padronização, desde peças pontuais até projetos para redes e múltiplas unidades.',
  },
  {
    id: 'padronizar-fachadas',
    group: 'servicos',
    q: 'É possível padronizar fachadas de várias unidades da mesma rede?',
    a: 'Sim. Desenvolvemos e executamos projetos de padronização visual para redes e múltiplas unidades, garantindo que cada fachada siga o mesmo conceito, materiais, proporções e acabamento. Assim, a marca mantém uma identidade visual consistente em diferentes localidades, mesmo em projetos de grande escala.',
  },
  {
    id: 'varias-unidades',
    group: 'servicos',
    q: 'Vocês conseguem atender várias unidades simultaneamente?',
    a: 'Sim. Estruturamos a produção e a logística para atender múltiplas unidades de forma simultânea ou em etapas, de acordo com o cronograma de cada projeto. Coordenamos as diferentes fases para manter padronização, organização e qualidade em todas as unidades, mesmo em projetos de grande escala.',
  },
  {
    id: 'levantamento-tecnico',
    group: 'servicos',
    q: 'Vocês realizam levantamento técnico no local?',
    a: 'Sim. Quando necessário, realizamos o levantamento técnico no local para avaliar medidas, condições do espaço, pontos de instalação e demais características que possam impactar o projeto. Essas informações orientam o desenvolvimento e a produção, trazendo mais precisão, segurança e previsibilidade para a execução.',
  },
  {
    id: 'orcamento',
    group: 'orcamento',
    q: 'Como funciona o orçamento?',
    a: 'Primeiro, entendemos a necessidade, o objetivo, o local e o prazo do projeto. A partir dessas informações, avaliamos a melhor solução técnica e os materiais mais adequados. Em seguida, apresentamos uma proposta comercial com escopo, valores e prazo estimado, para aprovação antes do início da produção.',
  },
  {
    id: 'o-que-enviar',
    group: 'orcamento',
    q: 'O que devo enviar para pedir um orçamento?',
    a: 'Quanto mais informação, mais precisa fica a proposta: fotos do local, medidas aproximadas, planta ou projeto arquitetônico, referências visuais, quantidade de unidades e prazo desejado. Você pode anexar esses arquivos no formulário de contato ou enviá-los pelo WhatsApp.',
  },
  {
    id: 'prazo',
    group: 'orcamento',
    q: 'O que influencia no prazo de produção?',
    a: 'O prazo pode variar de acordo com o escopo e a complexidade do projeto, a quantidade de itens, os materiais escolhidos, os acabamentos, o volume de unidades e a necessidade de instalação. Também consideramos o tempo de aprovação e eventuais particularidades de cada local. Por isso, cada projeto recebe um cronograma específico, definido antes do início da produção.',
  },
  {
    id: 'pagamento',
    group: 'orcamento',
    q: 'Quais são as formas de pagamento?',
    a: 'Oferecemos parcelamento em até 10x no cartão (Visa, Mastercard, Maestro, Elo, Hipercard, Hiper e American Express) e aceitamos o Cartão BNDES. As condições de cada projeto são detalhadas na proposta comercial.',
  },
  {
    id: 'outras-cidades',
    group: 'atendimento',
    q: 'Vocês atendem outras cidades além de São Paulo?',
    a: 'Sim. Atendemos redes e empresas em todo o Brasil, com equipe própria e parceiros homologados para instalação fora de São Paulo.',
  },
  {
    id: 'horario',
    group: 'atendimento',
    q: 'Qual é o horário de atendimento?',
    a: 'Atendemos de segunda a sexta, das 8h às 18h, pelo WhatsApp, por telefone, por e-mail ou pessoalmente na nossa sede em Santo André/SP, com horário combinado.',
  },
  {
    id: 'visita',
    group: 'atendimento',
    q: 'Posso visitar a Inplak?',
    a: 'Sim. Se preferir ver de perto materiais, acabamentos e projetos em andamento, nossa equipe recebe você na Rua Jorge Velho, 120, no bairro Campestre, em Santo André/SP. É só combinar um horário pelo WhatsApp ou por telefone.',
  },
];

export const faqById = Object.fromEntries(faqs.map((f) => [f.id, f]));

// Perguntas exibidas na home.
export const homeFaq = ['outras-cidades', 'projetos-personalizados', 'levantamento-tecnico', 'orcamento', 'prazo', 'pagamento'];

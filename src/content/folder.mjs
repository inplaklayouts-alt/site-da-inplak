// Folder institucional (12 páginas). Imagens em media/folder (geradas de _originais/folder).
// "text" é a versão em texto de cada página: aparece para leitores de tela e no bloco
// "Ver o conteúdo em texto", e ajuda o Google a entender o folder.

export const folderPages = [
  {
    title: 'Capa',
    alt: 'Capa do folder: Grupo Inplak, Imagine e nós fazemos. Criação, fabricação, instalação.',
    text: 'Grupo Inplak. Imagine e nós fazemos. Criação, fabricação e instalação.',
  },
  {
    title: 'Quem somos',
    alt: 'Página institucional com foto aérea da fábrica, mais de 7.000 m² de área fabril, e os pilares inovação, qualidade, tecnologia e parceria.',
    text:
      'Há mais de 22 anos, a Inplak transforma ideias em soluções que impulsionam marcas e negócios. Mais de 7.000 m² de área fabril. Inovação: soluções criativas e inteligentes que geram resultados. Qualidade: compromisso com a excelência em cada detalhe do projeto. Tecnologia: equipamentos de ponta e processos que garantem precisão e agilidade. Parceria: relacionamentos sólidos, baseados em confiança e transparência. Somos Inplakáveis. Atuamos com excelência em todo o território nacional, oferecendo soluções completas em comunicação visual e sinalização.',
  },
  {
    title: 'Comunicação interna',
    alt: 'Comunicação interna: corredores de supermercado com sinalização suspensa e telas, letreiro Maravilhas do Lar e letreiros iluminados de lanchonete e sorveteria.',
    text: 'Comunicação interna: sinalização suspensa de corredores com telas, letreiro em letras caixa para a Maravilhas do Lar e letreiros iluminados de lanchonete e sorveteria.',
  },
  {
    title: 'Comunicação interna',
    alt: 'Comunicação interna: ambientação de supermercado com forro decorativo, painéis de laticínios, culinária oriental e cortes, e setor de hortifrúti.',
    text: 'Comunicação interna: ambientação de supermercado com forro decorativo e iluminação, painéis ripados dos setores de laticínios, culinária oriental e cortes, e comunicação do hortifrúti.',
  },
  {
    title: 'Comunicação interna',
    alt: 'Comunicação interna: testeiras dos setores churrasco, carnes, açougue, massas e hortifrúti, letreiro de padaria e painel de hortifrúti.',
    text: 'Comunicação interna: testeiras dos setores churrasco, carnes, açougue, massas e hortifrúti; letreiro de padaria com ilustrações; painel de hortifrúti com a frase “alimente-se de maneira saudável”.',
  },
  {
    title: 'Comunicação interna',
    alt: 'Comunicação interna: setor de bebidas geladas e adega, letreiro iluminado de flores e painéis de pães, padaria e queijos.',
    text: 'Comunicação interna: letreiros de bebidas geladas, adega e lanchonete; letreiro iluminado de flores em moldura suspensa; painéis dos setores de pães, padaria e queijos.',
  },
  {
    title: 'Fachadas',
    alt: 'Fachadas: loja Pet com fachada roxa iluminada, Canossa Supermercados e Ameripan Festas & Cia.',
    text: 'Fachadas: loja de produtos pet com fachada roxa iluminada, Canossa Supermercados e Ameripan Festas & Cia.',
  },
  {
    title: 'Fachadas',
    alt: 'Fachadas: Assaí Atacadista, Baratão Supermercado e Atacadão.',
    text: 'Fachadas: Assaí Atacadista, Baratão Supermercado e Atacadão.',
  },
  {
    title: 'Fachadas',
    alt: 'Fachadas: Supermercados SuperBom, Boa Supermercados, Super Big e Supermercados Alvorada.',
    text: 'Fachadas: Supermercados SuperBom, Boa Supermercados, Super Big e Supermercados Alvorada.',
  },
  {
    title: 'Totens',
    alt: 'Totens: totem do Atacadão, totem do Maxxi Atacado e totem do Assaí Atacadista sendo instalados com guindaste.',
    text: 'Totens de identificação: Atacadão, Maxxi Atacado e Assaí Atacadista, com instalação feita com guindaste.',
  },
  {
    title: 'Totens',
    alt: 'Totens: St Marche, entrada e saída de estacionamento, totem de centro comercial, Duda Utilidades do Lar, Atacadão e Maravilhas do Lar.',
    text: 'Totens de sinalização: St Marche, entrada e saída de estacionamento, totem de centro comercial com várias marcas, saída da Duda Utilidades do Lar, entrada do Atacadão e vagas da Maravilhas do Lar.',
  },
  {
    title: 'Parceiros e contato',
    alt: 'Logos de alguns parceiros da Inplak, formas de pagamento aceitas, redes sociais, telefone (11) 99224-3088 e endereço em Santo André.',
    text:
      'Alguns de nossos parceiros: Isabela Presentes, Sonda, União, São Roque, GPA, SuperBom, Sublime, St Marche, Rede Market, Pernambucanas, Bob’s, Mini Preço, Maravilhas do Lar, Bem Barato, Dia, Avistão, Negreiros, Alvorada, D’avó, Savegnago, Paulistão Atacadista, Carrefour, BlueFit, Super Big, Agibank, Assaí, D’Ville, Comercial Esperança, Casas Bahia, Atacadão e ABC Plus. Aceitamos Cartão BNDES, Mastercard, Maestro, Visa, Visa Electron, Cielo e Elo. Telefone e WhatsApp (11) 99224-3088. Rua Jorge Velho, 120, Campestre, Santo André/SP, 09080-570.',
  },
];

export const folderKey = (i) => `folder-pagina-${String(i + 1).padStart(2, '0')}`;

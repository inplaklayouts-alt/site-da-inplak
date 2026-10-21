// Endereços do site antigo (WordPress) e para onde cada um deve levar.
// Na Hostinger isso é feito no .htaccess (redirecionamento 301). No GitHub Pages, que não aceita
// regras de servidor, o build gera uma página leve em cada endereço antigo que leva ao novo.

const range = (prefix, nums) => nums.map((n) => `${prefix}-${String(n).padStart(3, '0')}`);

const oldProjects = {
  interna: range('comunicacao-visual-interna', [95, 96, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108]),
  fachadas: range('fachadas', [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]),
  totens: range('totens-e-letreiros', [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  mobiliario: range('expositores-comerciais', [1, 2, 6, 7, 8, 9, 10, 11]),
  estrutura: range('construcao-civil', [1]),
};

export const legacyRedirects = [
  ...Object.entries(oldProjects).flatMap(([cat, slugs]) => slugs.map((s) => [`/projetos/${s}/`, `/projetos/?categoria=${cat}`])),
  ['/categoria-projeto/comunicacao-visual-interna/', '/projetos/?categoria=interna'],
  ['/categoria-projeto/comunicacao-visual-externa-comunicacao-visual-externa/', '/projetos/?categoria=fachadas'],
  ['/categoria-projeto/comunicacao-visual-externa/', '/projetos/?categoria=fachadas'],
  ['/categoria-projeto/expositores-comerciais/', '/projetos/?categoria=mobiliario'],
  ['/categoria-projeto/totens/', '/projetos/?categoria=totens'],
  ['/cases/fachada-institucional-de-alto-impacto/', '/servicos/comunicacao-visual-interna/'],
  ['/cases/estrutura-metalica-para-construcao-civil/', '/servicos/comunicacao-visual-externa/'],
  ['/cases/ambientacao-visual-para-supermercado-premium/', '/servicos/mobiliario-e-marcenaria/'],
  ['/hello-world/', '/'],
  ['/category/uncategorized/', '/'],
  ['/author/admin/', '/'],
  ['/author/editor/', '/'],
];

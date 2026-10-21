# Site Inplak Comunicação Visual

Site completo da **Inplak Comunicação Visual**: estático (HTML, CSS e JavaScript puros, sem WordPress e sem dependências), publicado no **GitHub Pages**.

- Endereço atual: **https://inplaklayouts-alt.github.io/site-da-inplak/**
- Repositório: https://github.com/inplaklayouts-alt/site-da-inplak

---

## O que tem no site

- **23 páginas:** home, 4 serviços, página para supermercados, portfólio com filtros e ampliação de fotos, 3 cases com antes/depois arrastável, **folder virtual**, sobre, contato, perguntas frequentes, blog com 3 artigos, política de privacidade, página de obrigado e página 404.
- **Folder virtual (`/folder/`):** as 12 páginas do folder com o efeito de virar a página **arrastando o canto com o mouse** ou deslizando o dedo. Tem capa dura, contador de páginas, miniaturas, tela cheia, teclado (setas), versão em texto (acessibilidade e Google) e link para a versão no FlipHTML5. A chamada aparece na home, na página Sobre, no menu (com um pontinho verde de "novo"), no topo e no rodapé.
- **Formulário de orçamento:** validação, anexos (até 5 arquivos), consentimento LGPD e anti-spam. Veja como ele envia em [Formulário](#formulário).
- **SEO:** título, descrição e imagem de compartilhamento em todas as páginas, dados estruturados (LocalBusiness, Service, FAQPage, BreadcrumbList, BlogPosting, ImageGallery, DigitalDocument), sitemap e favicon.
- **Desempenho:** fotos em AVIF/WebP no tamanho certo; a home pesa cerca de 0,5 MB no celular (o site antigo pesava 6,2 MB). Na segunda visita, CSS, JS e fotos vêm do próprio navegador, e as páginas já vistas abrem mesmo sem internet.
- **Medição pronta:** GA4/GTM com aviso de cookies (LGPD). Só liga quando houver um ID.
- **Endereços do site antigo** (WordPress) levam para as páginas novas.

---

## Como o site é publicado

Cada envio (commit) para a branch `main` dispara o GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)), que:

1. gera as imagens novas, se alguma foto foi adicionada;
2. testa o servidor do formulário (Apps Script);
3. gera o site em `dist/` e publica no GitHub Pages.

O andamento aparece na aba **Actions** do repositório. Em cerca de 2 minutos a alteração está no ar.

### Ativar o GitHub Pages (uma vez só)

*Settings → Pages → Build and deployment → Source:* **GitHub Actions**. Depois, em *Actions*, rode de novo o workflow "Publicar no GitHub Pages" se a primeira execução tiver falhado por falta dessa configuração.

### Usar o domínio inplak.com.br (quando quiserem)

1. Em *Settings → Pages → Custom domain*, informe `inplak.com.br` e salve.
2. No painel do domínio (registro.br ou Hostinger), aponte o DNS para o GitHub Pages: registros **A** para `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` e **CNAME** de `www` para `inplaklayouts-alt.github.io`.
3. Em *Settings → Secrets and variables → Actions → Variables*, crie `SITE_URL` = `https://inplak.com.br` e rode o workflow de novo.
4. Quando o certificado ficar pronto, marque **Enforce HTTPS** em *Settings → Pages*.

Com o domínio próprio, os endereços antigos do WordPress (ex.: `/projetos/fachadas-048/`, `/cases/...`, `/hello-world/`) levam automaticamente às páginas novas.

---

## Formulário

O GitHub Pages não executa código no servidor, então o formulário funciona de três formas:

| Modo | Como funciona | Quando |
|---|---|---|
| **E-mail ou WhatsApp** | O cliente escolhe o botão. **E-mail:** abre o programa de e-mail dele com o pedido já escrito para `comercial@inplak.com.br`; ele anexa fotos e plantas e envia (se nada abrir, há um botão para copiar o pedido). **WhatsApp:** abre a conversa com a Inplak com a mensagem pronta; os arquivos vão por lá. | Hoje, até ativarem o Apps Script |
| **Google Apps Script** (recomendado) | E-mail com anexos para a Inplak, cópia na Planilha Google, anexos no Drive e confirmação ao cliente. | Depois de seguir [`apps-script/LEIA-ME.md`](apps-script/LEIA-ME.md) e criar a variável `FORM_ENDPOINT` |
| **PHP** | O formulário em [`src/static/api/`](src/static/api/) roda numa hospedagem com PHP (ex.: Hostinger). | Se preferirem manter a Hostinger (ver abaixo) |

A troca de modo é automática: o build olha a variável `FORM_ENDPOINT` (e `FORM_PROVIDER`, para PHP).

---

## O que o GitHub Pages não faz e como cada função continua existindo

| Função (na hospedagem com PHP) | No GitHub Pages |
|---|---|
| Formulário envia e-mail com anexos e guarda os pedidos | Botões **Enviar por e-mail** e **Enviar pelo WhatsApp** hoje; com o Apps Script ativo, volta a ser e-mail com anexos + planilha + Drive + confirmação ao cliente |
| Redirecionamentos 301 dos endereços antigos (`.htaccess`) | Páginas de redirecionamento automáticas em cada endereço antigo, mais um script para os endereços com `?p=`, `?page_id=` etc. |
| Página 404 própria | Igual (`404.html`) |
| HTTPS obrigatório e HSTS | O próprio GitHub força HTTPS e envia HSTS |
| Política de segurança de conteúdo (CSP) | Vai dentro de cada página (`<meta http-equiv="Content-Security-Policy">`) |
| Proibir o site de ser exibido dentro de outro site (`X-Frame-Options`) | Script no início da página: se outro site tentar embutir, a página se esconde e tenta abrir no endereço verdadeiro |
| Cache longo de CSS, JS e imagens | *Service worker* (`sw.js`): guarda CSS, JS e imagens no navegador, atualiza páginas em segundo plano e mostra as páginas já visitadas (inclusive o folder) **sem internet** |
| Política de referência (`Referrer-Policy`) | Vai em `<meta name="referrer">` em cada página |
| Bloqueio de pastas ocultas e do WordPress antigo (`410`) | Não se aplica: o GitHub só publica o que está em `dist/` |

Só dois cabeçalhos não têm equivalente no GitHub Pages: `X-Content-Type-Options` e `Permissions-Policy`. O site não usa câmera, microfone, localização nem envia arquivos de tipo ambíguo, então a falta deles não abre nenhuma brecha. Se usarem o domínio próprio com Cloudflare na frente, dá para acrescentá-los lá.

---

## Google Analytics (quando tiver o ID)

Em [`src/content/site.mjs`](src/content/site.mjs), preencha `analytics.ga4` (ex.: `G-ABC123`) e/ou `analytics.gtm` e envie para o GitHub. Automaticamente:

- aparece o aviso de cookies (nada é carregado antes do aceite);
- o Google Consent Mode v2 começa como "negado";
- a Política de privacidade passa a citar o Google Analytics;
- os eventos `whatsapp_click`, `phone_click`, `email_click`, `cta_click`, `form_start`, `generate_lead`, `file_attach`, `gallery_open`, `portfolio_filter`, `map_load`, `folder_open`, `folder_flip` e `folder_fullscreen` são enviados.

No GA4, marque `generate_lead` e `whatsapp_click` como **eventos-chave** (conversões).

---

## Editar o conteúdo

Dá para editar direto no site do GitHub (abra o arquivo, clique no lápis, salve). O site se atualiza sozinho.

| Arquivo | O que tem |
|---|---|
| [`src/content/site.mjs`](src/content/site.mjs) | telefone, WhatsApp, e-mail, endereço, horário, CNPJ, redes sociais, números (+22 anos, +7.000 m²...), link do FlipHTML5, ID do Analytics |
| [`src/content/services.mjs`](src/content/services.mjs) | os 4 serviços e a página de supermercados |
| [`src/content/projects.mjs`](src/content/projects.mjs) | portfólio, destaques da home, fotos do topo e logos de clientes |
| [`src/content/cases.mjs`](src/content/cases.mjs) | cases de antes e depois |
| [`src/content/folder.mjs`](src/content/folder.mjs) | textos das páginas do folder |
| [`src/content/faq.mjs`](src/content/faq.mjs) | perguntas frequentes |
| [`src/content/posts.mjs`](src/content/posts.mjs) | artigos do blog |

### Adicionar uma foto de projeto

1. Envie a foto para `_originais/uploads/...`.
2. Em [`scripts/images.py`](scripts/images.py), registre um nome no bloco `PHOTOS` (ex.: `'fachada-nova-loja': UP6 + 'arquivo.jpg'`).
3. Em [`src/content/projects.mjs`](src/content/projects.mjs), acrescente o projeto (título, tipo, categoria e descrição da foto).
4. Envie para o GitHub: as versões AVIF/WebP são geradas na publicação.

### Atualizar o folder

1. Exporte as páginas novas como imagens (de preferência com cerca de 1.500 px de largura) e salve em `_originais/folder/` como `pagina-01.webp`, `pagina-02.webp`...
2. Se mudar a quantidade de páginas, ajuste `FOLDER_PAGES` em [`scripts/images.py`](scripts/images.py).
3. Atualize os textos em [`src/content/folder.mjs`](src/content/folder.mjs).
4. Apague a pasta `media/folder/` (para as imagens serem refeitas) e envie para o GitHub.

---

## No computador

Requer **Node.js 18+** e, para gerar imagens, **Python 3 com Pillow** (`pip install pillow`).

```bash
npm run dev
```

Abre em `http://localhost:8080`.

| Comando | O que faz |
|---|---|
| `npm run build` | gera o site para o GitHub Pages (raiz do domínio) |
| `npm run build:github-pages` | gera exatamente como fica em `inplaklayouts-alt.github.io/site-da-inplak` |
| `npm run build:hostinger` | gera para hospedagem com PHP (inclui `api/` e `.htaccess`) |
| `npm run images` | gera as versões otimizadas das fotos |
| `npm test` | testa o servidor do formulário (Apps Script) |

### Alternativa: hospedar na Hostinger

`npm run build:hostinger` e envie o conteúdo de `dist/` para `public_html` (inclusive os arquivos ocultos `.htaccess`, `.well-known/`, `api/.htaccess` e `api/.user.ini`). Configure o e-mail em `public_html/api/config.php` (host `smtp.hostinger.com`, porta 465, `ssl`). Nesse modo, os pedidos também ficam em `api/dados/leads.csv`.

---

## Estrutura

```
_originais/        Fotos e páginas do folder originais (fonte das imagens)
media/             Imagens otimizadas (AVIF/WebP), geradas por scripts/images.py
src/content/       Todo o conteúdo editável
src/templates/     Estrutura das páginas
src/assets/        CSS, JavaScript e a biblioteca de virar páginas (StPageFlip, licença MIT)
src/static/        .htaccess, formulário PHP e arquivos copiados como estão
apps-script/       Servidor do formulário no Google Apps Script + passo a passo
scripts/           build, imagens, testes e servidor local
.github/workflows/ Publicação automática no GitHub Pages
```

---

## Pendências que dependem da Inplak

1. **Ativar o formulário completo** pelo Apps Script ([passo a passo](apps-script/LEIA-ME.md)).
2. **Fotos:** vários arquivos originais se chamavam `ChatGPT-Image-...`. Confirme que todas mostram trabalhos reais da Inplak.
3. **Depoimentos:** nenhum foi fornecido, por isso o site não tem depoimentos. Vale coletar 3 a 5 reais ou ligar as avaliações do Google.
4. **Perfil da Empresa no Google:** não há perfil verificado no endereço da Rua Jorge Velho, 120. Criar esse perfil é o passo de SEO local mais importante.
5. **Logos de clientes:** confirme a autorização para exibir marcas como Carrefour e Pão de Açúcar.
6. **Política de privacidade:** revisão pelo jurídico/contador (principalmente a guarda de 24 meses).
7. **Google Analytics:** criar a propriedade GA4 e colocar o ID.
8. **Redes sociais:** o folder mostra Facebook; se quiserem, informe o link para incluir no site junto com Instagram e YouTube.

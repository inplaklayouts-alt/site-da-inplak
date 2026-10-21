import { site, waLink, telLink, formMode } from '../../content/site.mjs';
import { services, formServiceOptions } from '../../content/services.mjs';
import { faqs, faqGroups } from '../../content/faq.mjs';
import { esc, icon, picture, join, preloadImage } from '../lib.mjs';
import {
  sectionHead, pageHero, quoteActions, statsRow, processList, pillars, clientsMarquee, mapBlock,
  contactForm, contactAside, faqList, faqSchema, gallery, lightbox, folderTeaser,
} from '../components.mjs';

// ---------- /sobre/ ----------

export function aboutPage() {
  const crumbs = [{ name: 'Sobre', path: '/sobre/' }];
  const page = {
    path: '/sobre/',
    title: 'Sobre a Inplak | Comunicação Visual em Santo André há +22 anos',
    description:
      'Há mais de 22 anos a Inplak cria, fabrica e instala comunicação visual, fachadas e mobiliário, com mais de 7.000 m² de área fabril em Santo André/SP.',
    og: 'og-sobre',
    breadcrumbs: crumbs,
    pageType: 'AboutPage',
    preload: preloadImage('fachada-supermercados-alvorada'),
  };
  const content = `
${pageHero({
  eyebrow: 'Sobre a Inplak',
  title: 'Imagine e nós fazemos',
  lead: 'Há mais de 22 anos a Inplak transforma ideias em soluções que impulsionam marcas e negócios: fachadas, totens, sinalização e mobiliário que ocupam espaço e fazem parte do dia a dia de quem passa por eles.',
  image: 'fachada-supermercados-alvorada',
  imageAlt: '',
  crumbs,
  actions: quoteActions(),
})}
<section class="section">
  <div class="container about">
    <div class="about__text">
      ${sectionHead({ eyebrow: 'Quem somos', title: 'Experiência, estrutura e acompanhamento em cada projeto.' })}
      <p>A Inplak Comunicação Visual fica em Santo André, no ABC Paulista, e trabalha com uma proposta simples: entregar ao cliente tudo o que a marca dele precisa para ser vista, do primeiro desenho à última peça instalada.</p>
      <p>Hoje o Grupo Inplak desenvolve e produz comunicação visual externa e interna, totens, mobiliário e expositores personalizados para supermercados, atacarejos, academias, bancos, lojas e órgãos públicos. São mais de 30 mil projetos entregues e mais de 10 mil clientes atendidos, de pequenas lojas a grandes redes como Assaí, Carrefour, Pão de Açúcar, Sonda e St Marche.</p>
      <p>Nosso diferencial é cuidar do projeto por inteiro. A mesma equipe que entende a necessidade define a solução técnica, acompanha a fabricação em mais de 7.000 m² de área fabril e coordena a instalação em campo, com equipe própria e parceiros homologados em todo o território nacional.</p>
      <p class="about__tagline">Somos <strong>Inplakáveis</strong>: imagine e nós fazemos.</p>
    </div>
    <div class="about__media reveal">
      ${picture('totem-assai-atacadista-instalacao', { alt: 'Instalação de totem do Assaí Atacadista com guindaste', sizes: '(max-width: 900px) 100vw, 45vw' })}
      <div class="about__mascot" aria-hidden="true">${picture('camaleao', { alt: '', sizes: '140px' })}</div>
    </div>
  </div>
</section>

<section class="section section--brand" aria-labelledby="numeros-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Em números', title: 'Uma trajetória construída projeto a projeto.', id: 'numeros-titulo', light: true })}
    ${statsRow()}
  </div>
</section>

<section class="section" aria-labelledby="valores-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'O que nos guia', title: 'Inovação, qualidade, tecnologia e parceria.', id: 'valores-titulo' })}
    <ul class="value-grid">
      ${join(pillars, (d) => `<li class="value reveal"><span class="why__icon">${icon(d.icon, { size: 24 })}</span><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></li>`)}
    </ul>
  </div>
</section>

${folderTeaser({ id: 'folder-sobre', title: 'Conheça a Inplak no nosso folder virtual.' })}

<section class="section section--soft" aria-labelledby="como-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Como trabalhamos', title: 'Do desenvolvimento à instalação, sem repasses.', id: 'como-titulo' })}
    ${processList({ light: false })}
  </div>
</section>

${clientsMarquee()}

<section class="section" aria-labelledby="trabalhos-titulo">
  <div class="container">
    ${sectionHead({ eyebrow: 'Nosso trabalho', title: 'Alguns projetos que levam a nossa assinatura', id: 'trabalhos-titulo' })}
    ${gallery(['fachada-rede-market', 'interna-acougue', 'mobiliario-loja-de-calcados', 'totem-st-marche', 'fachada-agibank', 'interna-adega-forro-ripado'], { label: 'Projetos da Inplak' })}
    <div class="section-actions"><a class="btn btn--dark" href="/projetos/">Ver portfólio completo ${icon('arrow', { size: 18 })}</a></div>
  </div>
</section>

<section class="section section--soft" aria-labelledby="empresa-titulo">
  <div class="container visit">
    <div class="visit__body">
      ${sectionHead({ eyebrow: 'Dados da empresa', title: 'Venha nos visitar em Santo André.', id: 'empresa-titulo' })}
      <dl class="company-data">
        <div><dt>Razão social</dt><dd>${esc(site.legalName)}</dd></div>
        <div><dt>CNPJ</dt><dd>${esc(site.cnpj)}</dd></div>
        <div><dt>Endereço</dt><dd>${esc(site.address.street)} — ${esc(site.address.district)}, ${esc(site.address.city)}/${esc(site.address.state)}, ${esc(site.address.zip)}</dd></div>
        <div><dt>Atendimento</dt><dd>${esc(site.hours.display)}</dd></div>
      </dl>
      <div class="visit__actions">
        <a class="btn btn--whatsapp" href="${waLink('Olá! Gostaria de agendar uma visita à Inplak.')}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="sobre_visita">${icon('whatsapp', { size: 20 })} Agendar visita</a>
        <a class="btn btn--ghost" href="${site.mapsUrl}" target="_blank" rel="noopener">Como chegar</a>
      </div>
    </div>
    ${mapBlock()}
  </div>
</section>
${lightbox()}`;
  return { page, content };
}

// ---------- /contato/ ----------

export function contactPage() {
  const crumbs = [{ name: 'Contato', path: '/contato/' }];
  const page = {
    path: '/contato/',
    title: 'Contato e Orçamento | Inplak Comunicação Visual — Santo André/SP',
    description:
      'Peça um orçamento de fachada, totem, sinalização ou mobiliário. Atendimento de segunda a sexta, das 8h às 18h, pelo WhatsApp (11) 99224-3088, telefone ou e-mail.',
    og: 'og-contato',
    breadcrumbs: crumbs,
    pageType: 'ContactPage',
    hasForm: true,
    hideCtaBand: true,
  };
  const content = `
${pageHero({
  eyebrow: 'Contato',
  title: 'Vamos tirar o seu projeto do papel',
  lead: 'Preencha o formulário com o máximo de detalhes que puder, ou fale direto com a nossa equipe pelo WhatsApp. Respondemos de segunda a sexta, das 8h às 18h.',
  crumbs,
})}
<section class="section contact contact--page" id="orcamento" aria-labelledby="orcamento-titulo" tabindex="-1">
  <div class="container contact__grid contact__grid--page">
    <div class="contact__form contact__form--first">
      <h2 class="section-title section-title--sm" id="orcamento-titulo">Solicite seu orçamento</h2>
      <p class="muted">Campos com * são obrigatórios. Se tiver fotos, medidas, planta ou referências, anexe: isso agiliza a proposta.</p>
      ${contactForm({ id: 'orcamento', origin: '/contato/' })}
    </div>
    <aside class="contact__aside">
      <div class="aside-card">
        <h2 class="aside-card__title">Fale com a Inplak</h2>
        ${contactAside()}
        <div class="aside-card__social">
          ${join(site.social, (s) => `<a href="${s.url}" target="_blank" rel="noopener">${icon(s.icon, { size: 20 })} ${esc(s.handle)}</a>`)}
        </div>
      </div>
      ${mapBlock()}
    </aside>
  </div>
</section>
<section class="section section--soft" aria-labelledby="faq-contato-titulo">
  <div class="container narrow">
    ${sectionHead({ eyebrow: 'Antes de enviar', title: 'Dúvidas sobre orçamento', id: 'faq-contato-titulo', align: 'center' })}
    ${faqList(['orcamento', 'o-que-enviar', 'prazo', 'outras-cidades', 'pagamento'])}
  </div>
</section>`;
  page.schema = [faqSchema(['orcamento', 'o-que-enviar', 'prazo', 'outras-cidades', 'pagamento'])];
  return { page, content };
}

// ---------- /faq/ ----------

export function faqPage() {
  const crumbs = [{ name: 'Perguntas frequentes', path: '/faq/' }];
  const page = {
    path: '/faq/',
    title: 'Perguntas Frequentes sobre Comunicação Visual e Orçamentos | Inplak',
    description:
      'Respostas sobre projetos personalizados, padronização de redes, levantamento técnico, prazos, orçamento, formas de pagamento e atendimento em todo o Brasil.',
    og: 'og-padrao',
    breadcrumbs: crumbs,
    schema: [faqSchema(faqs.map((f) => f.id))],
  };
  const content = `
${pageHero({
  eyebrow: 'Perguntas frequentes',
  title: 'Perguntas que ouvimos com frequência',
  lead: 'Reunimos aqui as dúvidas mais comuns de quem está planejando uma fachada, uma sinalização ou um mobiliário. Se a sua não estiver na lista, fale com a gente.',
  crumbs,
})}
<section class="section">
  <div class="container faq-page">
    <nav class="faq-page__nav" aria-label="Temas">
      <ul>${join(faqGroups, (g) => `<li><a href="#${g.id}">${esc(g.label)}</a></li>`)}</ul>
    </nav>
    <div class="faq-page__groups">
      ${join(
        faqGroups,
        (g) => `
      <section class="faq-group" id="${g.id}" aria-labelledby="${g.id}-titulo">
        <h2 class="faq-group__title" id="${g.id}-titulo">${esc(g.label)}</h2>
        ${faqList(faqs.filter((f) => f.group === g.id).map((f) => f.id))}
      </section>`,
      )}
    </div>
    <aside class="help-card help-card--sticky" aria-label="Atendimento">
      ${picture('camaleao', { alt: '', sizes: '120px', cls: 'help-card__mascot' })}
      <h2 class="help-card__title">Ainda com dúvida?</h2>
      <p>Fale com um especialista de segunda a sexta, das 8h às 18h.</p>
      <a class="btn btn--whatsapp btn--block" href="${waLink('Olá! Tenho uma dúvida sobre um projeto.')}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="faq_page">${icon('whatsapp', { size: 20 })} WhatsApp</a>
      <a class="btn btn--ghost btn--block" href="${telLink}" data-track="phone_click">${icon('phone', { size: 18 })} ${esc(site.phone.display)}</a>
    </aside>
  </div>
</section>`;
  return { page, content };
}

// ---------- /obrigado/ ----------

export function thanksPage() {
  const page = {
    path: '/obrigado/',
    title: 'Pedido recebido | Inplak Comunicação Visual',
    description: 'Recebemos o seu pedido de orçamento. A equipe da Inplak vai entrar em contato em breve.',
    noindex: true,
    hideCtaBand: true,
  };
  const content = `
<section class="section thanks">
  <div class="container narrow thanks__inner">
    <div class="thanks__mascot" aria-hidden="true">${picture('camaleao', { alt: '', sizes: '160px', eager: true })}</div>
    <p class="eyebrow">Pedido recebido</p>
    <h1 class="section-title">Obrigado! Sua mensagem chegou até nós.</h1>
    <p class="lead">Um especialista da Inplak vai analisar as informações e entrar em contato em breve, dentro do nosso horário de atendimento: ${esc(site.hours.display.toLowerCase())}.</p>
    <ol class="next-steps">
      <li><strong>Análise:</strong> entendemos a necessidade, o local e o prazo do projeto.</li>
      <li><strong>Contato:</strong> falamos com você para tirar dúvidas e, se preciso, agendar o levantamento técnico.</li>
      <li><strong>Proposta:</strong> enviamos a proposta comercial com escopo, valores e prazo estimado.</li>
    </ol>
    <div class="thanks__actions">
      <a class="btn btn--whatsapp" href="${waLink('Olá! Acabei de enviar um pedido de orçamento pelo site.')}" target="_blank" rel="noopener" data-track="whatsapp_click" data-track-label="obrigado">${icon('whatsapp', { size: 20 })} Adiantar pelo WhatsApp</a>
      <a class="btn btn--ghost" href="/projetos/">Ver projetos enquanto isso</a>
    </div>
  </div>
</section>`;
  return { page, content };
}

// ---------- 404 ----------

export function notFoundPage() {
  const page = {
    path: '/404.html',
    title: 'Página não encontrada | Inplak Comunicação Visual',
    description: 'A página que você procurou não existe ou mudou de endereço. Veja os serviços, os projetos e os contatos da Inplak Comunicação Visual.',
    noindex: true,
  };
  const content = `
<section class="section thanks">
  <div class="container narrow thanks__inner">
    <div class="thanks__mascot" aria-hidden="true">${picture('camaleao', { alt: '', sizes: '160px', eager: true })}</div>
    <p class="eyebrow">Erro 404</p>
    <h1 class="section-title">Essa página se camuflou.</h1>
    <p class="lead">O endereço que você acessou não existe ou mudou de lugar. Veja alguns caminhos para continuar:</p>
    <ul class="quick-links">
      <li><a href="/">${icon('arrow', { size: 16 })} Página inicial</a></li>
      <li><a href="/servicos/">${icon('arrow', { size: 16 })} Serviços</a></li>
      <li><a href="/projetos/">${icon('arrow', { size: 16 })} Projetos</a></li>
      <li><a href="/contato/">${icon('arrow', { size: 16 })} Contato e orçamento</a></li>
    </ul>
  </div>
</section>`;
  return { page, content };
}

// ---------- /politica-de-privacidade/ ----------

export function privacyPage() {
  const crumbs = [{ name: 'Política de privacidade', path: '/politica-de-privacidade/' }];
  const page = {
    path: '/politica-de-privacidade/',
    title: 'Política de Privacidade | Inplak Comunicação Visual',
    description: 'Como a Inplak coleta, usa, armazena e protege os dados pessoais enviados pelo site, em conformidade com a Lei Geral de Proteção de Dados (LGPD).',
    breadcrumbs: crumbs,
    hideCtaBand: true,
  };
  const analyticsOn = Boolean(site.analytics.ga4 || site.analytics.gtm);
  const mode = formMode();
  const hosting = site.target === 'github' ? 'o GitHub (serviço que hospeda o site)' : 'o provedor de hospedagem do site';
  const formData = {
    php: {
      technical:
        'para proteger o formulário contra abuso e envio automático de mensagens, registramos temporariamente o endereço IP de quem envia o formulário. O provedor de hospedagem também mantém registros de acesso ao servidor, como determina o Marco Civil da Internet (Lei nº 12.965/2014).',
      sharing: `${hosting} e o provedor de e-mail, onde os pedidos são recebidos e guardados`,
      retentionExtra: ' Os registros de IP usados para proteção contra abuso são descartados automaticamente em poucas horas.',
    },
    'apps-script': {
      technical: `${hosting} mantém registros técnicos de acesso às páginas. Para evitar envios automáticos, o formulário controla temporariamente quantos pedidos chegam de um mesmo e-mail.`,
      sharing: `${hosting} e o Google (Gmail, Planilhas e Drive da empresa), onde os pedidos e os anexos são recebidos e guardados`,
      retentionExtra: '',
    },
    whatsapp: {
      technical: `${hosting} mantém registros técnicos de acesso às páginas. O formulário não envia seus dados a nenhum servidor: ele apenas monta a mensagem e abre o WhatsApp, onde você decide enviá-la.`,
      sharing: `${hosting} e a plataforma WhatsApp (Meta), por onde o pedido é enviado`,
      retentionExtra: '',
    },
  }[mode];
  const content = `
${pageHero({ eyebrow: 'LGPD', title: 'Política de privacidade', lead: 'Última atualização: 21 de outubro de 2026.', crumbs })}
<section class="section">
  <div class="container narrow prose">
    <p>Esta política explica como a <strong>${esc(site.legalName)}</strong> (“Inplak”), inscrita no CNPJ sob o nº ${esc(site.cnpj)}, com sede na ${esc(site.address.street)}, ${esc(site.address.district)}, ${esc(site.address.city)}/${esc(site.address.state)}, CEP ${esc(site.address.zip)}, trata os dados pessoais de quem visita o site <strong>inplak.com.br</strong> e entra em contato conosco, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD).</p>

    <h2>1. Quais dados coletamos</h2>
    <p><strong>Dados que você nos envia pelo formulário de orçamento:</strong> nome, empresa, e-mail, telefone/WhatsApp, cidade, serviço de interesse, quantidade de unidades, prazo desejado, a mensagem que você escrever e os arquivos que anexar (fotos, plantas, referências).</p>
    <p><strong>Dados técnicos:</strong> ${esc(formData.technical)}</p>
    <p><strong>Contatos por WhatsApp, telefone ou e-mail:</strong> quando você escolhe falar conosco por esses canais, recebemos as informações que você mesmo compartilhar na conversa.</p>

    <h2>2. Para que usamos os dados</h2>
    <ul>
      <li>Responder ao seu pedido, tirar dúvidas e elaborar a proposta comercial;</li>
      <li>Agendar visitas e levantamentos técnicos, quando você solicitar;</li>
      <li>Manter o histórico do atendimento e da negociação;</li>
      <li>Proteger o site contra fraudes, spam e uso indevido;</li>
      <li>Cumprir obrigações legais e regulatórias.</li>
    </ul>
    <p>Não vendemos, não alugamos e não usamos os seus dados para enviar propagandas sem a sua autorização.</p>

    <h2>3. Bases legais</h2>
    <p>Tratamos os dados com base na execução de procedimentos preliminares relacionados a contrato a pedido do titular (art. 7º, V, da LGPD), quando você solicita um orçamento; no legítimo interesse (art. 7º, IX), para segurança do site e melhoria do atendimento; no cumprimento de obrigação legal (art. 7º, II); e no consentimento (art. 7º, I), quando aplicável, como no uso de cookies de medição.</p>

    <h2>4. Com quem compartilhamos</h2>
    <p>Os dados podem ser tratados por fornecedores que nos ajudam a operar o site e o atendimento, sempre na medida do necessário: ${esc(formData.sharing)} e, quando você escolhe falar pelo WhatsApp, a própria plataforma WhatsApp (Meta). ${analyticsOn ? 'Se você aceitar os cookies de medição, o Google também receberá dados de navegação (veja a seção 6).' : ''} Também poderemos compartilhar dados com autoridades, quando houver obrigação legal ou ordem judicial.</p>
    <p>Alguns desses fornecedores podem armazenar dados fora do Brasil. Nesses casos, a transferência ocorre de acordo com o que a LGPD permite.</p>

    <h2>5. Por quanto tempo guardamos</h2>
    <p>Os dados de pedidos de orçamento são mantidos pelo tempo necessário para o atendimento e a negociação e por até 24 meses após o último contato, para que possamos consultar o histórico caso você retome o projeto. Se o orçamento resultar em contrato, os dados passam a seguir os prazos legais aplicáveis à relação comercial.${formData.retentionExtra}</p>

    <h2 id="cookies">6. Cookies e armazenamento no navegador</h2>
    ${
      analyticsOn
        ? `<p>O site usa armazenamento essencial para lembrar a sua escolha sobre cookies. Com a sua permissão, também usamos o <strong>Google Analytics</strong> para entender, de forma estatística, como o site é usado (páginas visitadas, origem do acesso, cliques em botões de contato). Esses cookies só são ativados se você clicar em “Aceitar” no aviso de cookies, e você pode mudar a sua escolha a qualquer momento pelo link “Preferências de cookies”, no rodapé.</p>`
        : `<p>O site não usa cookies de publicidade nem de medição. Usamos apenas armazenamento essencial no seu navegador para o funcionamento das páginas. O mapa da página de contato, fornecido pelo Google, só é carregado se você clicar para exibi-lo; ao fazer isso, o Google pode coletar dados de navegação de acordo com a política de privacidade dele.</p>`
    }

    <h2>7. Segurança</h2>
    <p>Adotamos medidas técnicas e organizacionais para proteger os dados, como conexão criptografada (HTTPS), acesso restrito às informações recebidas e proteção do formulário contra envios automatizados. Nenhum sistema é totalmente imune a incidentes; se algum ocorrer, agiremos conforme a LGPD, inclusive comunicando os titulares e a Autoridade Nacional de Proteção de Dados quando necessário.</p>

    <h2>8. Seus direitos</h2>
    <p>Você pode, a qualquer momento, solicitar: confirmação de que tratamos seus dados; acesso aos dados; correção de dados incompletos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários; portabilidade; informação sobre compartilhamentos; e revogação do consentimento, quando essa for a base legal (art. 18 da LGPD).</p>
    <p>Para exercer seus direitos, escreva para <a href="mailto:${site.email}?subject=LGPD%20-%20Solicita%C3%A7%C3%A3o%20do%20titular">${esc(site.email)}</a> com o assunto “LGPD”. Responderemos no prazo previsto em lei. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</p>

    <h2>9. Alterações desta política</h2>
    <p>Esta política pode ser atualizada para refletir mudanças no site ou na legislação. A data da última atualização aparece no topo da página.</p>

    <h2>10. Contato</h2>
    <p>${esc(site.legalName)} · CNPJ ${esc(site.cnpj)}<br>${esc(site.address.street)} — ${esc(site.address.district)}, ${esc(site.address.city)}/${esc(site.address.state)}, ${esc(site.address.zip)}<br>E-mail: <a href="mailto:${site.email}">${esc(site.email)}</a> · Telefone: <a href="${telLink}">${esc(site.phone.display)}</a></p>
  </div>
</section>`;
  return { page, content };
}

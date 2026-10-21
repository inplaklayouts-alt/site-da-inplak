# Formulário de orçamento — Google Apps Script

O site no GitHub Pages não tem servidor próprio. Os pedidos do formulário são recebidos por este script, que roda de graça na conta Google da Inplak e:

- envia cada pedido por e-mail, **com os anexos**;
- guarda o pedido numa **Planilha Google** (aba "Pedidos");
- salva os anexos numa pasta do **Google Drive** ("Inplak - anexos do site");
- manda uma **confirmação** para o cliente;
- bloqueia robôs (campo isca, tempo mínimo e limite de envios) e confere o conteúdo real dos anexos.

Enquanto o script não estiver ativado, o formulário do site funciona pelo WhatsApp: ele monta a mensagem com os dados preenchidos e abre a conversa com a Inplak.

---

## Ativação (cerca de 10 minutos, uma vez só)

Use a conta Google que deve receber e guardar os pedidos.

1. **Crie a planilha.** Em [sheets.new](https://sheets.new), crie uma planilha e dê o nome "Pedidos do site Inplak".
2. **Abra o editor de script.** Na planilha: *Extensões → Apps Script*.
3. **Cole o código.** Apague o que estiver no arquivo `Código.gs` e cole todo o conteúdo de [`Code.gs`](Code.gs). Salve (ícone de disquete).
4. **Confira os dados.** No começo do código, em `CONFIG`, confira o e-mail em `TO` (quem recebe os pedidos) e o endereço do site em `SITE_URL`.
5. **Autorize e teste.** No topo do editor, escolha a função `configurar` e clique em **Executar**. O Google pede autorização:
   *Revisar permissões → escolha a conta → Avançado → Acessar "Pedidos do site Inplak" (não seguro) → Permitir.*
   O aviso de "app não verificado" aparece porque o script é da própria empresa. Depois disso, a planilha ganha as abas "Pedidos" e "Erros", a pasta é criada no Drive e chega um e-mail de teste.
6. **Publique.** *Implantar → Nova implantação →* engrenagem → *App da Web*.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
   Clique em *Implantar* e copie a **URL do app da Web** (termina em `/exec`).
7. **Ligue ao site.** No GitHub, em *Settings → Secrets and variables → Actions → aba Variables → New repository variable*:
   - Name: `FORM_ENDPOINT`
   - Value: a URL copiada no passo 6
   Depois, em *Actions → Publicar no GitHub Pages → Run workflow*. Em cerca de 2 minutos o formulário passa a enviar pelo Apps Script, com anexos.
8. **Teste.** Envie um pedido pelo site e confira o e-mail, a planilha e a pasta do Drive.

Para testar a URL antes, abra-a no navegador: deve aparecer `{"ok":true,"service":"inplak-formulario",...}`.

---

## Limites do Google

- **E-mails por dia:** 100 numa conta Gmail comum e 1.500 no Google Workspace. Cada pedido usa 2 (aviso para a Inplak e confirmação ao cliente). Para economizar, mude `AUTOREPLY` para `false`.
- **Anexos:** até 5 arquivos, 10 MB cada e 20 MB no total.

## Alterar o script depois

Edite o código, salve e vá em *Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar*. A URL continua a mesma.

## Privacidade (LGPD)

Os pedidos ficam na conta Google da empresa (planilha e Drive). Apague periodicamente os pedidos com mais de 24 meses, como informa a Política de privacidade do site.

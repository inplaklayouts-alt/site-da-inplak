<?php
/*
 * Configuração do formulário de orçamento.
 * Este arquivo não pode ser acessado pelo navegador (bloqueado no .htaccess).
 *
 * Envio de e-mail:
 *  - Sem SMTP configurado, o site usa a função mail() da hospedagem.
 *  - Para melhor entrega (menos chance de cair no spam), preencha o bloco "smtp"
 *    com os dados da caixa de e-mail. Na Hostinger: host smtp.hostinger.com,
 *    porta 465, secure "ssl", usuário = o próprio e-mail, senha = a senha da caixa.
 */

return [
    // Quem recebe os pedidos (pode ter mais de um endereço).
    'to' => ['comercial@inplak.com.br'],

    // Remetente técnico. Precisa ser um e-mail existente do domínio inplak.com.br.
    'from_email' => 'comercial@inplak.com.br',
    'from_name' => 'Site Inplak',

    'subject_prefix' => '[Site] ',

    // Envia ao cliente uma confirmação de recebimento.
    'autoreply' => true,

    // Guarda uma cópia de cada pedido em api/dados/leads.csv (protegido contra acesso público).
    'store_leads' => true,

    // Proteção contra abuso: no máximo "max" envios por IP a cada "window" segundos.
    'rate_limit' => ['max' => 5, 'window' => 600],

    // Tempo mínimo (segundos) entre abrir a página e enviar. Robôs costumam enviar na hora.
    'min_seconds' => 3,

    // Página para onde o visitante vai depois de enviar.
    'redirect_ok' => '/obrigado/',

    // Outros endereços que podem usar este formulário (sem barra no final). Ex.: o site no GitHub Pages.
    'allowed_origins' => ['https://inplaklayouts-alt.github.io'],

    // Envio por SMTP (opcional). Deixe "host" vazio para usar mail().
    'smtp' => [
        'host' => '',
        'port' => 465,
        'secure' => 'ssl', // 'ssl' (porta 465), 'tls' (porta 587) ou 'none'
        'user' => '',
        'pass' => '',
        'timeout' => 20,
    ],

    // Frase usada para anonimizar IPs no controle de abuso. Pode trocar por qualquer texto longo.
    'salt' => 'inplak-6f1c9e0b2d7a4c58a3e9b1f04d6c2e87',
];

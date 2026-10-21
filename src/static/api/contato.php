<?php
/*
 * Recebe o formulário de orçamento do site da Inplak.
 *
 * - Funciona com JavaScript (responde JSON) e sem JavaScript (redireciona ou mostra uma página simples).
 * - Valida todos os campos no servidor, independentemente do navegador.
 * - Anti-spam: campo isca (honeypot), tempo mínimo de preenchimento e limite de envios por IP.
 * - Anexos: até 5 arquivos, 10 MB cada, 20 MB no total, com conferência do tipo real do arquivo.
 * - Envia o pedido por e-mail (com anexos), guarda uma cópia em CSV e confirma o recebimento ao cliente.
 */

declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');

$config = require __DIR__ . '/config.php';
if (is_file(__DIR__ . '/config.local.php')) {
    $config = array_replace_recursive($config, require __DIR__ . '/config.local.php');
}
foreach (($config['php_ini'] ?? []) as $key => $value) {
    ini_set((string) $key, (string) $value);
}

const DATA_DIR = __DIR__ . '/dados';
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

const SERVICE_OPTIONS = [
    'Comunicação visual externa e fachadas',
    'Comunicação visual interna e sinalização',
    'Mobiliário, marcenaria e expositores',
    'Totens e letreiros',
    'Projeto completo para supermercado',
    'Estrutura metálica',
    'Outro assunto',
];
const UNIT_OPTIONS = ['1 unidade', '2 a 5 unidades', '6 a 20 unidades', 'Mais de 20 unidades'];
const DEADLINE_OPTIONS = ['Até 30 dias', 'De 1 a 3 meses', 'Mais de 3 meses', 'Ainda não sei'];

// Extensão => tipos MIME aceitos (conferidos com finfo).
const FILE_TYPES = [
    'pdf' => ['application/pdf'],
    'jpg' => ['image/jpeg'],
    'jpeg' => ['image/jpeg'],
    'png' => ['image/png'],
    'webp' => ['image/webp'],
    'heic' => ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence', 'application/octet-stream'],
    'dwg' => ['image/vnd.dwg', 'image/x-dwg', 'application/acad', 'application/x-acad', 'application/dwg', 'application/x-dwg', 'application/octet-stream'],
    'dxf' => ['image/vnd.dxf', 'application/dxf', 'application/x-dxf', 'text/plain', 'text/x-c', 'application/octet-stream'],
];

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

// ---------------------------------------------------------------------------
// Respostas
// ---------------------------------------------------------------------------

function finish(bool $ok, int $status, string $message, array $errors = [], ?string $redirect = null): never
{
    global $wantsJson, $config;
    http_response_code($status);

    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(
            array_filter(['ok' => $ok, 'message' => $message, 'errors' => $errors ?: null, 'redirect' => $redirect], fn($v) => $v !== null),
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
        exit;
    }

    if ($ok) {
        header('Location: ' . ($redirect ?? $config['redirect_ok']), true, 303);
        exit;
    }

    // Sem JavaScript: página simples com o problema e um link de volta.
    $back = safe_origin($_POST['origem'] ?? '/');
    header('Content-Type: text/html; charset=utf-8');
    $items = '';
    foreach ($errors as $err) {
        $items .= '<li>' . h($err) . '</li>';
    }
    echo '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex"><title>Não foi possível enviar | Inplak</title>'
        . '<style>body{font-family:system-ui,Segoe UI,Arial,sans-serif;margin:0;background:#f4f6f8;color:#111827}'
        . 'main{max-width:560px;margin:10vh auto;padding:32px;background:#fff;border-radius:16px;box-shadow:0 18px 45px rgba(17,24,39,.12)}'
        . 'h1{font-size:1.5rem;margin:0 0 12px;color:#013e69}li{margin:6px 0}a{color:#013e69;font-weight:700}</style></head><body><main>'
        . '<h1>Não foi possível enviar o pedido</h1><p>' . h($message) . '</p>' . ($items ? '<ul>' . $items . '</ul>' : '')
        . '<p><a href="' . h($back) . '#orcamento">Voltar ao formulário</a> · <a href="https://wa.me/5511992243088">Falar pelo WhatsApp</a></p>'
        . '</main></body></html>';
    exit;
}

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function safe_origin(string $path): string
{
    $path = trim($path);
    return preg_match('#^/[a-z0-9/\-]{0,150}$#', $path) ? $path : '/';
}

function clean(string $key, int $max, bool $multiline = false): string
{
    $value = (string) ($_POST[$key] ?? '');
    if (!mb_check_encoding($value, 'UTF-8')) {
        $value = mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
    }
    // Remove caracteres de controle (mantém quebras de linha apenas em textos longos).
    $value = $multiline
        ? preg_replace('/[^\P{C}\n\t]/u', '', str_replace("\r\n", "\n", $value))
        : preg_replace('/\p{C}+/u', ' ', $value);
    $value = trim(preg_replace($multiline ? '/[ \t]+/' : '/\s+/u', ' ', (string) $value));
    return mb_substr($value, 0, $max);
}

function log_error(string $message): void
{
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0750, true);
    }
    @file_put_contents(DATA_DIR . '/erros.log', '[' . date('c') . '] ' . $message . PHP_EOL, FILE_APPEND | LOCK_EX);
}

// ---------------------------------------------------------------------------
// Verificações iniciais
// ---------------------------------------------------------------------------

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    finish(false, 405, 'Use o formulário do site para enviar seu pedido.');
}

// Aceita apenas envios feitos a partir do próprio site ou dos endereços listados em
// "allowed_origins" (ex.: o site publicado no GitHub Pages usando este PHP como servidor do formulário).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && $origin !== 'null') {
    $parts = parse_url($origin);
    $authority = ($parts['host'] ?? '') . (isset($parts['port']) ? ':' . $parts['port'] : '');
    $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
    $bare = static fn(string $h) => preg_replace('/^www\./', '', strtolower($h));
    $allowed = array_map(static fn($o) => rtrim(strtolower((string) $o), '/'), $config['allowed_origins'] ?? []);
    if (in_array(strtolower($origin), $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    } elseif ($bare($authority) !== $bare($host)) {
        finish(false, 403, 'Envio não autorizado.');
    }
}

// Quando o envio passa do limite do servidor, o PHP descarta tudo e $_POST chega vazio.
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    finish(false, 413, 'Os arquivos enviados são grandes demais.', ['anexos' => 'Os anexos ultrapassam o limite. Envie até 20 MB no total ou mande pelo WhatsApp.']);
}

// Honeypot: robôs preenchem o campo escondido. Fingimos sucesso para não dar pistas.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    finish(true, 200, 'Recebido.', [], $config['redirect_ok']);
}

// Tempo mínimo de preenchimento (quando o JavaScript informou a hora de abertura da página).
$started = (string) ($_POST['iniciado'] ?? '');
if ($started !== '' && ctype_digit($started)) {
    $elapsed = (microtime(true) * 1000 - (float) $started) / 1000;
    if ($elapsed >= 0 && $elapsed < (float) $config['min_seconds']) {
        finish(true, 200, 'Recebido.', [], $config['redirect_ok']);
    }
}

// ---------------------------------------------------------------------------
// Limite de envios por IP (IPs guardados apenas como hash e descartados em 1 hora)
// ---------------------------------------------------------------------------

function rate_limited(array $config): bool
{
    if (!is_dir(DATA_DIR) && !@mkdir(DATA_DIR, 0750, true)) {
        return false;
    }
    $file = DATA_DIR . '/limite.json';
    $fp = @fopen($file, 'c+');
    if (!$fp) {
        return false;
    }
    flock($fp, LOCK_EX);
    $data = json_decode((string) stream_get_contents($fp), true) ?: [];
    $now = time();
    $window = (int) $config['rate_limit']['window'];
    $key = hash('sha256', ($config['salt'] ?? '') . ($_SERVER['REMOTE_ADDR'] ?? ''));

    foreach ($data as $k => $stamps) {
        $data[$k] = array_values(array_filter($stamps, fn($t) => $t > $now - 3600));
        if (!$data[$k]) {
            unset($data[$k]);
        }
    }
    $recent = array_filter($data[$key] ?? [], fn($t) => $t > $now - $window);
    $blocked = count($recent) >= (int) $config['rate_limit']['max'];
    if (!$blocked) {
        $data[$key][] = $now;
    }
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    flock($fp, LOCK_UN);
    fclose($fp);
    return $blocked;
}

if (rate_limited($config)) {
    finish(false, 429, 'Recebemos muitos envios em sequência. Aguarde alguns minutos ou fale conosco pelo WhatsApp.');
}

// ---------------------------------------------------------------------------
// Validação dos campos
// ---------------------------------------------------------------------------

$lead = [
    'nome' => clean('nome', 120),
    'empresa' => clean('empresa', 120),
    'email' => strtolower(clean('email', 160)),
    'telefone' => clean('telefone', 20),
    'cidade' => clean('cidade', 80),
    'servico' => clean('servico', 80),
    'unidades' => clean('unidades', 40),
    'prazo' => clean('prazo', 40),
    'mensagem' => clean('mensagem', 4000, true),
    'origem' => safe_origin((string) ($_POST['origem'] ?? '/')),
];

$errors = [];
if (mb_strlen($lead['nome']) < 2) {
    $errors['nome'] = 'Informe seu nome.';
}
if (!filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Informe um e-mail válido.';
}
$digits = preg_replace('/\D/', '', $lead['telefone']);
if (strlen($digits) < 10 || strlen($digits) > 13) {
    $errors['telefone'] = 'Informe um telefone ou WhatsApp com DDD.';
}
if (($_POST['consentimento'] ?? '') !== 'sim') {
    $errors['consentimento'] = 'Para enviarmos a resposta, precisamos do seu consentimento.';
}
if ($lead['servico'] !== '' && !in_array($lead['servico'], SERVICE_OPTIONS, true)) {
    $lead['servico'] = 'Outro assunto';
}
if ($lead['unidades'] !== '' && !in_array($lead['unidades'], UNIT_OPTIONS, true)) {
    $lead['unidades'] = '';
}
if ($lead['prazo'] !== '' && !in_array($lead['prazo'], DEADLINE_OPTIONS, true)) {
    $lead['prazo'] = '';
}

// ---------------------------------------------------------------------------
// Anexos
// ---------------------------------------------------------------------------

function normalized_files(): array
{
    $raw = $_FILES['anexos'] ?? null;
    if (!$raw || !is_array($raw['name'] ?? null)) {
        return [];
    }
    $files = [];
    foreach ($raw['name'] as $i => $name) {
        if (($raw['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        $files[] = [
            'name' => (string) $name,
            'tmp' => (string) ($raw['tmp_name'][$i] ?? ''),
            'size' => (int) ($raw['size'][$i] ?? 0),
            'error' => (int) ($raw['error'][$i] ?? UPLOAD_ERR_NO_FILE),
        ];
    }
    return $files;
}

function safe_filename(string $name): string
{
    $name = basename(str_replace('\\', '/', $name));
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $base = pathinfo($name, PATHINFO_FILENAME);
    $base = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $base) ?: 'arquivo';
    $base = trim(preg_replace('/[^A-Za-z0-9._-]+/', '-', $base), '-.') ?: 'arquivo';
    return mb_substr($base, 0, 70) . ($ext ? '.' . $ext : '');
}

$attachments = [];
$files = normalized_files();
if (count($files) > MAX_FILES) {
    $errors['anexos'] = 'Envie no máximo ' . MAX_FILES . ' arquivos.';
} else {
    $total = 0;
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    foreach ($files as $f) {
        $label = safe_filename($f['name']);
        if ($f['error'] === UPLOAD_ERR_INI_SIZE || $f['error'] === UPLOAD_ERR_FORM_SIZE || $f['size'] > MAX_FILE_BYTES) {
            $errors['anexos'] = "O arquivo {$label} passa de 10 MB.";
            break;
        }
        if ($f['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($f['tmp'])) {
            $errors['anexos'] = "Não foi possível receber o arquivo {$label}. Tente novamente.";
            break;
        }
        $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
        $mime = (string) $finfo->file($f['tmp']);
        if (!isset(FILE_TYPES[$ext]) || !in_array($mime, FILE_TYPES[$ext], true)) {
            $errors['anexos'] = "O arquivo {$label} não está em um formato aceito (PDF, JPG, PNG, WEBP, HEIC, DWG ou DXF).";
            break;
        }
        $total += $f['size'];
        if ($total > MAX_TOTAL_BYTES) {
            $errors['anexos'] = 'Os anexos passam de 20 MB no total.';
            break;
        }
        $attachments[] = ['name' => $label, 'path' => $f['tmp'], 'mime' => $mime === 'application/octet-stream' || str_starts_with($mime, 'text/') ? 'application/octet-stream' : $mime];
    }
}

if ($errors) {
    finish(false, 422, 'Confira os campos destacados.', $errors);
}

// ---------------------------------------------------------------------------
// Cópia do pedido em CSV (abre direto no Excel)
// ---------------------------------------------------------------------------

function csv_safe(string $v): string
{
    // Evita que o Excel interprete o conteúdo como fórmula.
    return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v;
}

function store_lead(array $lead, array $attachments): bool
{
    if (!is_dir(DATA_DIR) && !@mkdir(DATA_DIR, 0750, true)) {
        return false;
    }
    $file = DATA_DIR . '/leads.csv';
    $isNew = !is_file($file);
    $fp = @fopen($file, 'a');
    if (!$fp) {
        return false;
    }
    flock($fp, LOCK_EX);
    if ($isNew) {
        fwrite($fp, "\xEF\xBB\xBF");
        fputcsv($fp, ['Data', 'Nome', 'Empresa', 'E-mail', 'Telefone', 'Cidade', 'Serviço', 'Unidades', 'Prazo', 'Mensagem', 'Anexos', 'Página'], ';', '"', '');
    }
    $row = [
        date('d/m/Y H:i'), $lead['nome'], $lead['empresa'], $lead['email'], $lead['telefone'], $lead['cidade'],
        $lead['servico'], $lead['unidades'], $lead['prazo'], $lead['mensagem'],
        implode(', ', array_column($attachments, 'name')), $lead['origem'],
    ];
    fputcsv($fp, array_map(fn($v) => csv_safe((string) $v), $row), ';', '"', '');
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// ---------------------------------------------------------------------------
// E-mail
// ---------------------------------------------------------------------------

function encode_header(string $text): string
{
    return preg_match('/[^\x20-\x7E]/', $text) ? '=?UTF-8?B?' . base64_encode($text) . '?=' : $text;
}

function address(string $email, string $name = ''): string
{
    $email = str_replace(["\r", "\n"], '', $email);
    return $name !== '' ? encode_header(str_replace(["\r", "\n", '"'], '', $name)) . " <{$email}>" : $email;
}

/**
 * Monta a mensagem MIME. Retorna [cabeçalhos (sem To/Subject), corpo].
 */
function build_mime(array $o): array
{
    $mixed = 'mix_' . bin2hex(random_bytes(12));
    $alt = 'alt_' . bin2hex(random_bytes(12));
    $domain = substr(strrchr($o['from_email'], '@') ?: '@inplak.com.br', 1);

    $headers = [
        'Date: ' . date(DATE_RFC2822),
        'From: ' . address($o['from_email'], $o['from_name']),
        'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . $domain . '>',
        'MIME-Version: 1.0',
    ];
    if (!empty($o['reply_to'])) {
        $headers[] = 'Reply-To: ' . address($o['reply_to'], $o['reply_name'] ?? '');
    }
    $headers[] = 'X-Mailer: Inplak site';

    $alternative = "--{$alt}\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n"
        . quoted_printable_encode(str_replace("\n", "\r\n", str_replace("\r\n", "\n", $o['text']))) . "\r\n"
        . "--{$alt}\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n"
        . quoted_printable_encode($o['html']) . "\r\n"
        . "--{$alt}--\r\n";

    if (empty($o['attachments'])) {
        $headers[] = "Content-Type: multipart/alternative; boundary=\"{$alt}\"";
        return [$headers, $alternative];
    }

    $headers[] = "Content-Type: multipart/mixed; boundary=\"{$mixed}\"";
    $body = "--{$mixed}\r\nContent-Type: multipart/alternative; boundary=\"{$alt}\"\r\n\r\n" . $alternative;
    foreach ($o['attachments'] as $a) {
        $name = encode_header($a['name']);
        $body .= "--{$mixed}\r\n"
            . "Content-Type: {$a['mime']}; name=\"{$name}\"\r\n"
            . "Content-Transfer-Encoding: base64\r\n"
            . "Content-Disposition: attachment; filename=\"{$name}\"\r\n\r\n"
            . chunk_split(base64_encode((string) file_get_contents($a['path'])), 76, "\r\n");
    }
    $body .= "--{$mixed}--\r\n";
    return [$headers, $body];
}

function smtp_expect($fp, array $codes, string &$log): bool
{
    $response = '';
    while (($line = fgets($fp, 515)) !== false) {
        $response .= $line;
        if (strlen($line) < 4 || $line[3] === ' ') {
            break;
        }
    }
    $log .= $response;
    return in_array((int) substr($response, 0, 3), $codes, true);
}

function smtp_cmd($fp, string $cmd, array $codes, string &$log): bool
{
    fwrite($fp, $cmd . "\r\n");
    return smtp_expect($fp, $codes, $log);
}

function send_smtp(array $smtp, string $from, array $to, string $subject, array $headers, string $body, string &$error): bool
{
    $log = '';
    $secure = $smtp['secure'] ?? 'ssl';
    $target = ($secure === 'ssl' ? 'ssl://' : 'tcp://') . $smtp['host'] . ':' . (int) $smtp['port'];
    $ctx = stream_context_create(['ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true]]);
    $fp = @stream_socket_client($target, $errno, $errstr, (float) ($smtp['timeout'] ?? 20), STREAM_CLIENT_CONNECT, $ctx);
    if (!$fp) {
        $error = "SMTP: não conectou em {$target} ({$errstr})";
        return false;
    }
    stream_set_timeout($fp, (int) ($smtp['timeout'] ?? 20));
    $ehlo = 'EHLO ' . (preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['SERVER_NAME'] ?? '') ?: 'localhost');

    $ok = smtp_expect($fp, [220], $log) && smtp_cmd($fp, $ehlo, [250], $log);
    if ($ok && $secure === 'tls') {
        $ok = smtp_cmd($fp, 'STARTTLS', [220], $log)
            && stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)
            && smtp_cmd($fp, $ehlo, [250], $log);
    }
    if ($ok && !empty($smtp['user'])) {
        $ok = smtp_cmd($fp, 'AUTH LOGIN', [334], $log)
            && smtp_cmd($fp, base64_encode($smtp['user']), [334], $log)
            && smtp_cmd($fp, base64_encode($smtp['pass']), [235], $log);
    }
    $ok = $ok && smtp_cmd($fp, "MAIL FROM:<{$from}>", [250], $log);
    foreach ($to as $rcpt) {
        $ok = $ok && smtp_cmd($fp, "RCPT TO:<{$rcpt}>", [250, 251], $log);
    }
    if ($ok && smtp_cmd($fp, 'DATA', [354], $log)) {
        $message = implode("\r\n", array_merge(['To: ' . implode(', ', $to), 'Subject: ' . $subject], $headers)) . "\r\n\r\n" . $body;
        // Pontos no início de linha precisam ser duplicados (RFC 5321).
        $message = preg_replace('/^\./m', '..', str_replace("\r\n", "\n", $message));
        fwrite($fp, str_replace("\n", "\r\n", $message) . "\r\n.\r\n");
        $ok = smtp_expect($fp, [250], $log);
    } else {
        $ok = false;
    }
    @smtp_cmd($fp, 'QUIT', [221], $log);
    fclose($fp);
    if (!$ok) {
        $error = 'SMTP falhou: ' . trim(substr($log, -400));
    }
    return $ok;
}

function send_mail(array $config, array $to, string $subject, array $mime, string &$error): bool
{
    [$headers, $body] = $mime;
    $subjectEncoded = encode_header($subject);
    if (!empty($config['smtp']['host'])) {
        return send_smtp($config['smtp'], $config['from_email'], $to, $subjectEncoded, $headers, $body, $error);
    }
    $ok = @mail(implode(', ', $to), $subjectEncoded, $body, implode("\r\n", $headers), '-f' . $config['from_email']);
    if (!$ok) {
        $error = 'mail() retornou falso: ' . (error_get_last()['message'] ?? 'sem detalhes');
    }
    return $ok;
}

// Conteúdo do e-mail para a equipe
$labels = [
    'nome' => 'Nome', 'empresa' => 'Empresa', 'email' => 'E-mail', 'telefone' => 'Telefone/WhatsApp', 'cidade' => 'Cidade/UF',
    'servico' => 'Serviço', 'unidades' => 'Unidades', 'prazo' => 'Prazo', 'origem' => 'Página de origem',
];
$waDigits = strlen($digits) <= 11 ? '55' . $digits : $digits;
$text = "Novo pedido de orçamento pelo site\n\n";
$rows = '';
foreach ($labels as $key => $label) {
    $value = $lead[$key] !== '' ? $lead[$key] : '—';
    $text .= "{$label}: {$value}\n";
    $cell = h($value);
    if ($key === 'email' && $lead['email']) {
        $cell = '<a href="mailto:' . h($lead['email']) . '">' . h($lead['email']) . '</a>';
    }
    if ($key === 'telefone') {
        $cell .= ' · <a href="https://wa.me/' . h($waDigits) . '">abrir no WhatsApp</a>';
    }
    $rows .= '<tr><th align="left" style="padding:8px 12px;background:#f4f6f8;border-bottom:1px solid #dbe1e8;width:170px">' . h($label) . '</th>'
        . '<td style="padding:8px 12px;border-bottom:1px solid #dbe1e8">' . $cell . '</td></tr>';
}
$text .= "\nMensagem:\n" . ($lead['mensagem'] !== '' ? $lead['mensagem'] : '—') . "\n";
if ($attachments) {
    $text .= "\nAnexos: " . implode(', ', array_column($attachments, 'name')) . "\n";
}
$text .= "\nConsentimento LGPD: sim (" . date('d/m/Y H:i') . ")\n";

$html = '<!doctype html><html><body style="margin:0;padding:24px;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;color:#111827">'
    . '<table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border-collapse:collapse">'
    . '<tr><td style="background:#013e69;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:700">Novo pedido de orçamento pelo site</td></tr>'
    . '<tr><td style="padding:16px 24px"><table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">' . $rows . '</table>'
    . '<p style="margin:20px 0 6px;font-weight:700">Mensagem</p><div style="white-space:pre-wrap;font-size:14px;line-height:1.6;padding:12px;background:#f4f6f8;border-radius:8px">'
    . h($lead['mensagem'] !== '' ? $lead['mensagem'] : '—') . '</div>'
    . ($attachments ? '<p style="font-size:14px"><strong>Anexos:</strong> ' . h(implode(', ', array_column($attachments, 'name'))) . '</p>' : '')
    . '<p style="font-size:12px;color:#5b6575">O cliente autorizou o uso dos dados para resposta a este pedido (LGPD) em ' . date('d/m/Y H:i') . '.</p>'
    . '</td></tr></table></body></html>';

$subject = $config['subject_prefix'] . 'Orçamento: ' . $lead['nome'] . ($lead['empresa'] ? " ({$lead['empresa']})" : '') . ($lead['servico'] ? " — {$lead['servico']}" : '');

$stored = !empty($config['store_leads']) ? store_lead($lead, $attachments) : false;

$mailError = '';
$sent = send_mail(
    $config,
    $config['to'],
    $subject,
    build_mime([
        'from_email' => $config['from_email'],
        'from_name' => $config['from_name'],
        'reply_to' => $lead['email'],
        'reply_name' => $lead['nome'],
        'text' => $text,
        'html' => $html,
        'attachments' => $attachments,
    ]),
    $mailError
);

if (!$sent) {
    log_error($mailError);
}

// Confirmação para o cliente
if ($sent && !empty($config['autoreply'])) {
    $first = explode(' ', $lead['nome'])[0];
    $replyText = "Olá, {$first}!\n\nRecebemos o seu pedido de orçamento e um especialista da Inplak vai entrar em contato em breve, "
        . "de segunda a sexta, das 8h às 18h.\n\nSe quiser adiantar, fale com a gente pelo WhatsApp: https://wa.me/5511992243088\n\n"
        . "Equipe Inplak Comunicação Visual\ninplak.com.br\n\n"
        . "Você recebeu esta mensagem porque preencheu o formulário de orçamento em inplak.com.br.";
    $replyHtml = '<!doctype html><html><body style="margin:0;padding:24px;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;color:#111827">'
        . '<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border-collapse:collapse">'
        . '<tr><td style="background:#013e69;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:700">Recebemos o seu pedido</td></tr>'
        . '<tr><td style="padding:24px;font-size:15px;line-height:1.6">'
        . '<p>Olá, ' . h($first) . '!</p>'
        . '<p>Recebemos o seu pedido de orçamento e um especialista da Inplak vai entrar em contato em breve, de segunda a sexta, das 8h às 18h.</p>'
        . '<p><a href="https://wa.me/5511992243088" style="display:inline-block;padding:12px 20px;background:#138046;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:700">Adiantar pelo WhatsApp</a></p>'
        . '<p>Equipe Inplak Comunicação Visual<br><a href="https://inplak.com.br" style="color:#013e69">inplak.com.br</a></p>'
        . '<p style="font-size:12px;color:#5b6575">Você recebeu esta mensagem porque preencheu o formulário de orçamento em inplak.com.br.</p>'
        . '</td></tr></table></body></html>';
    $replyError = '';
    $ok = send_mail(
        $config,
        [$lead['email']],
        'Recebemos o seu pedido de orçamento — Inplak',
        build_mime([
            'from_email' => $config['from_email'],
            'from_name' => 'Inplak Comunicação Visual',
            'reply_to' => $config['to'][0],
            'reply_name' => 'Inplak Comunicação Visual',
            'text' => $replyText,
            'html' => $replyHtml,
            'attachments' => [],
        ]),
        $replyError
    );
    if (!$ok) {
        log_error('Confirmação ao cliente: ' . $replyError);
    }
}

if ($sent || $stored) {
    finish(true, 200, 'Pedido enviado com sucesso.', [], $config['redirect_ok']);
}

finish(false, 500, 'Não conseguimos enviar o seu pedido agora.');

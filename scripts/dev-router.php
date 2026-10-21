<?php
// Roteador para o servidor embutido do PHP (somente desenvolvimento local):
//   php -S localhost:8080 -t dist scripts/dev-router.php
// Serve os arquivos de dist/, as pastas com index.html e a página 404, e aplica às páginas
// a mesma Content-Security-Policy do .htaccess, para que problemas apareçam já no teste local.

$root = $_SERVER['DOCUMENT_ROOT'];
$path = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$file = realpath($root . $path);

function serve_html(string $file, int $status = 200): bool
{
    global $root;
    $htaccess = @file_get_contents($root . '/.htaccess') ?: '';
    if (preg_match('/Content-Security-Policy "([^"]+)"/', $htaccess, $m)) {
        // upgrade-insecure-requests quebraria o http://localhost
        header('Content-Security-Policy: ' . str_replace('; upgrade-insecure-requests', '', $m[1]));
    }
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    readfile($file);
    return true;
}

if ($file !== false && str_starts_with($file, realpath($root))) {
    if (is_dir($file)) {
        if (!str_ends_with($path, '/')) {
            $qs = $_SERVER['QUERY_STRING'] ?? '';
            header('Location: ' . $path . '/' . ($qs !== '' ? '?' . $qs : ''), true, 301);
            return true;
        }
        if (is_file($file . '/index.html')) {
            return serve_html($file . '/index.html');
        }
    } elseif (is_file($file)) {
        if (preg_match('#/(config(\.local)?\.php|\.[^/]+)$#', $path) || str_contains($path, '/api/dados/')) {
            http_response_code(403);
            echo 'Proibido';
            return true;
        }
        if (str_ends_with($file, '.html')) {
            return serve_html($file);
        }
        return false;
    }
}

return serve_html($root . '/404.html', 404);

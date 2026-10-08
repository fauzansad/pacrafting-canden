<?php
require_once __DIR__ . '/_lib.php';

header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

$ip = client_ip();
if (!hit_rate_limit("login:$ip", 10, 15 * 60 * 1000)['allowed']) {
    json_out(429, ['success' => false, 'message' => 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.']);
}

$body = read_json_body();
$username = trim((string)($body['username'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($username === '' || $password === '') {
    json_out(400, ['success' => false, 'message' => 'Username dan password wajib diisi.']);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
    json_out(500, ['success' => false, 'message' => 'Verifikasi login belum dikonfigurasi di server.']);
}

try {
    $cred = supabase_read_row('admin_cred');
    if (!is_array($cred) || empty($cred)) {
        json_out(500, ['success' => false, 'message' => 'Akun admin belum terdaftar di database.']);
    }

    $inputHash = sha256($password);
    $isUserMatch =
        strcasecmp($username, (string)($cred['username'] ?? '')) === 0 ||
        (!empty($cred['email']) && strcasecmp($username, (string)$cred['email']) === 0);
    $isPassMatch = !empty($cred['passwordHash']) && hash_equals((string)$cred['passwordHash'], $inputHash);

    if (!$isUserMatch || !$isPassMatch) {
        json_out(401, ['success' => false, 'message' => 'Username atau password salah.']);
    }

    json_out(200, [
        'success' => true,
        'token' => sign_token($cred['username'] ?? 'admin'),
        'username' => $cred['username'] ?? 'admin',
        'email' => $cred['email'] ?? '',
    ]);
} catch (Exception $e) {
    error_log('admin-auth error: ' . $e->getMessage());
    json_out(500, ['success' => false, 'message' => 'Gagal memverifikasi akun. Coba lagi beberapa saat lagi.']);
}

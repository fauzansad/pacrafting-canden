<?php
require_once __DIR__ . '/_lib.php';

header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
    json_out(500, ['success' => false, 'message' => 'Penyimpanan cloud belum dikonfigurasi di server.']);
}

$session = verify_token($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '');
if (!$session) {
    json_out(401, ['success' => false, 'message' => 'Sesi admin tidak valid atau sudah kedaluwarsa. Silakan masuk kembali.']);
}

$body = read_json_body();
$key = (string)($body['key'] ?? '');

$WRITABLE_KEYS = [
    'brand', 'banners', 'hero_slides', 'paket', 'operation_schedule',
    'galeri', 'video', 'testimonials', 'wisata_info', 'faq'
];

try {
    // ---- Info akun (tanpa hash) ----
    if (($body['action'] ?? '') === 'info') {
        $cred = supabase_read_row('admin_cred');
        if (!$cred) {
            json_out(404, ['success' => false, 'message' => 'Akun admin tidak ditemukan.']);
        }
        json_out(200, ['success' => true, 'username' => $cred['username'] ?? 'admin', 'email' => $cred['email'] ?? '']);
    }

    // ---- Ganti password admin ----
    if (($body['action'] ?? '') === 'credentials') {
        $newPassword = (string)($body['newPassword'] ?? '');
        $currentPassword = (string)($body['currentPassword'] ?? '');
        $newEmail = trim((string)($body['newEmail'] ?? ''));

        if (strlen($newPassword) < 8) {
            json_out(400, ['success' => false, 'message' => 'Password baru minimal 8 karakter.']);
        }
        if (!$newEmail || strpos($newEmail, '@') === false) {
            json_out(400, ['success' => false, 'message' => 'Email admin tidak valid.']);
        }

        $cred = supabase_read_row('admin_cred');
        if (!$cred || empty($cred['passwordHash'])) {
            json_out(500, ['success' => false, 'message' => 'Akun admin tidak ditemukan di database.']);
        }

        if (sha256($currentPassword) !== $cred['passwordHash']) {
            json_out(401, ['success' => false, 'message' => 'Password saat ini salah.']);
        }

        $payload = [
            'username' => trim((string)($body['newUsername'] ?? $cred['username'] ?? 'admin')),
            'email' => $newEmail,
            'passwordHash' => sha256($newPassword),
            'updatedAt' => gmdate('c'),
            'legacyHash' => null,
        ];
        supabase_upsert_row('admin_cred', $payload);
        json_out(200, ['success' => true, 'username' => $payload['username'], 'email' => $payload['email']]);
    }

    $value = $body['value'] ?? null;
    if ($key === '' || $value === null) {
        json_out(400, ['success' => false, 'message' => 'Data tidak lengkap.']);
    }
    if (!in_array($key, $WRITABLE_KEYS, true)) {
        json_out(403, ['success' => false, 'message' => 'Kunci "' . $key . '" tidak boleh diubah dari panel ini.']);
    }

    $serialized = json_encode($value);
    if (strlen($serialized) > 4 * 1024 * 1024) {
        json_out(413, ['success' => false, 'message' => 'Data terlalu besar untuk disimpan. Gunakan URL gambar, bukan file gambar.']);
    }

    supabase_upsert_row($key, $value);
    json_out(200, ['success' => true]);
} catch (Exception $e) {
    error_log('admin-save error: ' . $e->getMessage());
    json_out(500, ['success' => false, 'message' => 'Gagal menghubungi database.']);
}

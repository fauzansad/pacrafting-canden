<?php
// Helper bersama untuk endpoint api/*.php
require_once __DIR__ . '/config.php';

function now_ms() {
    return (int)(microtime(true) * 1000);
}

function sha256($value) {
    return hash('sha256', (string)$value);
}

function client_ip() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Throttle berbasis file (berjalan di shared hosting, bukan memori).
function hit_rate_limit($bucket, $limit, $windowMs) {
    $dir = sys_get_temp_dir() . '/auraquina_rl';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $file = $dir . '/' . sha256($bucket);
    $now = now_ms();
    $entry = @json_decode(@file_get_contents($file), true);
    if (!is_array($entry) || $now > ($entry['resetAt'] ?? 0)) {
        file_put_contents($file, json_encode(['count' => 1, 'resetAt' => $now + $windowMs]));
        return ['allowed' => true, 'retryAfter' => 0];
    }
    $entry['count']++;
    file_put_contents($file, json_encode($entry));
    if ($entry['count'] > $limit) {
        return ['allowed' => false, 'retryAfter' => (int)ceil(($entry['resetAt'] - $now) / 1000)];
    }
    return ['allowed' => true, 'retryAfter' => 0];
}

function supabase_headers($key, $extra = []) {
    return array_merge([
        'apikey: ' . $key,
        'Authorization: Bearer ' . $key,
    ], $extra);
}

function supabase_request($method, $url, $key, $extraHeaders = [], $body = null) {
    $ch = curl_init($url);
    $headers = supabase_headers($key, $extraHeaders);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 20,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$status, $raw];
}

function supabase_read_row($keyRow) {
    $key = SUPABASE_SERVICE_ROLE_KEY ?: SUPABASE_ANON_KEY;
    [$status, $raw] = supabase_request('GET',
        SUPABASE_URL . '/rest/v1/site_data?key=eq.' . urlencode($keyRow) . '&select=*',
        $key, ['Cache-Control: no-cache']);
    if ($status < 200 || $status >= 300) {
        throw new Exception("Gagal membaca $keyRow dari database ($status)");
    }
    $records = json_decode($raw, true);
    return (is_array($records) && count($records)) ? $records[0]['value'] : null;
}

function supabase_upsert_row($keyRow, $value) {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
        throw new Exception('SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server.');
    }
    [$status, $raw] = supabase_request('POST', SUPABASE_URL . '/rest/v1/site_data',
        SUPABASE_SERVICE_ROLE_KEY,
        ['Prefer: resolution=merge-duplicates'],
        ['key' => $keyRow, 'value' => $value, 'updated_at' => gmdate('c')]);
    if ($status < 200 || $status >= 300) {
        throw new Exception("Gagal menyimpan ke database ($status): $raw");
    }
}

function sign_token($username) {
    $secret = ADMIN_SESSION_SECRET ?: SUPABASE_SERVICE_ROLE_KEY;
    $expiresAt = now_ms() + 2 * 60 * 60 * 1000;
    $payload = $username . '.' . $expiresAt;
    $signature = hash_hmac('sha256', $payload, $secret);
    return base64_encode($payload) . '.' . $signature;
}

function verify_token($token) {
    $secret = ADMIN_SESSION_SECRET ?: SUPABASE_SERVICE_ROLE_KEY;
    if (!$token || !$secret) return null;
    $parts = explode('.', (string)$token);
    if (count($parts) !== 2) return null;
    $payload = base64_decode($parts[0], true);
    if ($payload === false) return null;
    $seg = explode('.', $payload);
    if (count($seg) !== 2 || !$seg[0] || !$seg[1]) return null;
    if (now_ms() > (int)$seg[1]) return null;
    $expected = hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($expected, $parts[1])) return null;
    return ['username' => $seg[0], 'expiresAt' => (int)$seg[1]];
}

function json_out($status, $data) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data);
    exit;
}

function read_json_body() {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    return is_array($body) ? $body : [];
}

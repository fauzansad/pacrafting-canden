<?php
// Terjemahan otomatis Bahasa Indonesia -> Inggris memakai MyMemory (gratis).
// Dipakai panel admin: field _en dikosongkan akan diisi otomatis dari _id.
require_once __DIR__ . '/_lib.php';

header('Cache-Control: no-store');

// GET JSON ke pihak ketiga tanpa header kredensial Supabase.
function http_get_json($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
        CURLOPT_TIMEOUT => 20,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($raw === false) {
        return [0, (string)$err];
    }
    return [(int)$status, $raw];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

$session = verify_token($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '');
if (!$session) {
    json_out(401, ['success' => false, 'message' => 'Sesi admin tidak valid atau sudah kedaluwarsa.']);
}

$ip = client_ip();
if (!hit_rate_limit("translate:$ip", 30, 10 * 60 * 1000)['allowed']) {
    json_out(429, ['success' => false, 'message' => 'Terlalu banyak permintaan translate. Coba lagi dalam 10 menit.']);
}

$body = read_json_body();
$texts = $body['texts'] ?? null;

if (!is_array($texts) || empty($texts)) {
    json_out(400, ['success' => false, 'message' => 'Tidak ada teks untuk diterjemahkan.']);
}
if (count($texts) > 20) {
    json_out(400, ['success' => false, 'message' => 'Maksimal 20 teks per permintaan.']);
}

// MyMemory batas anonimnya ~5000 karakter/hari per IP, jadi bail out
// sebelum mencoba request berikutnya kalau kuota sudah habis (responseStatus 429).
$translated = [];
$failed = [];
$quota_exhausted = false;

foreach ($texts as $key => $text) {
    $text = trim((string)$text);
    if ($text === '') { $translated[$key] = ''; continue; }
    if ($quota_exhausted) { $failed[] = $key; $translated[$key] = ''; continue; }

    $url = 'https://api.mymemory.translated.net/get?q=' . urlencode($text)
         . '&langpair=id%7Cen';

    // PENTING: pakai curl polos. supabase_request() menambahkan header
    // apikey/Authorization milik Supabase, dan itu akan dikirim ke domain
    // pihak ketiga. Jangan pakai helper itu untuk panggilan non-Supabase.
    [$status, $raw] = http_get_json($url);

    if ($status < 200 || $status >= 300) {
        $failed[] = $key;
        $translated[$key] = '';
        continue;
    }

    $j = json_decode($raw, true);
    $responseStatus = (string)($j['responseStatus'] ?? '');
    $out = trim((string)($j['responseData']['translatedText'] ?? ''));

    // Kuota habis -> sisa teks di request ini dilewati.
    if ($responseStatus === '429' || stripos($responseStatus, 'TOO MANY REQUESTS') !== false) {
        $quota_exhausted = true;
        $failed[] = $key;
        $translated[$key] = '';
        continue;
    }

    // MyMemory memberi responseStatus non-numerik ("INVALID LANGUAGE PAIR",
    // "PLEASE SELECT TWO DISTINCT LANGUAGES", dst) kalau permintaan tidak valid.
    if ($out === '' || !preg_match('/^\d+$/', $responseStatus) || (int)$responseStatus !== 200) {
        $failed[] = $key;
        $translated[$key] = '';
        continue;
    }

    // Fallback: MyMemory sempat mengembalikan hasil berupa peringatan, bukan
    // terjemahan (mis. "MYMEMORY WARNING: ..." / "PLEASE SELECT TWO DISTINCT
    // LANGUAGES"). Kalau isinya sama persis dengan input, itu bukan terjemahan.
    if (stripos($out, 'MYMEMORY WARNING') !== false
        || stripos($out, 'PLEASE SELECT TWO DISTINCT LANGUAGES') !== false
        || stripos($out, 'INVALID LANGUAGE PAIR') !== false
        || stripos($out, 'QUERY LENGTH LIMIT') !== false
        || stripos($out, 'YOU USED ALL AVAILABLE FREE TRANSLATIONS') !== false) {
        $failed[] = $key;
        $translated[$key] = '';
        continue;
    }

    $out = html_entity_decode($out, ENT_QUOTES, 'UTF-8');

    // Input dikembalikan apa adanya = terjemahan gagal diam-diam.
    if (trim($out) === $text) {
        $failed[] = $key;
        $translated[$key] = '';
        continue;
    }

    $translated[$key] = trim($out);
}

json_out(200, [
    'success' => empty($failed),
    'translated' => $translated,
    'failed' => $failed,
]);
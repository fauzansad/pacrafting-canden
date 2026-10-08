<?php
require_once __DIR__ . '/_lib.php';

header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(405, ['success' => false, 'message' => 'Method Not Allowed']);
}

$ip = client_ip();
$body = read_json_body();
$action = strtolower((string)($body['action'] ?? ''));

const OTP_TTL_MS = 600000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60000;

function otp_html($otp) {
    $e = htmlspecialchars((string)$otp, ENT_QUOTES, 'UTF-8');
    return '<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#0b1710,#1b4332);padding:22px 26px;color:#ffffff;">
      <h1 style="margin:0;font-size:18px;letter-spacing:.3px;">Packrafting Canden</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#a7f3d0;">Reset Password Admin</p>
    </div>
    <div style="padding:26px;">
      <p style="margin:0 0 6px;font-size:14px;color:#334155;">Halo Admin,</p>
      <p style="margin:0 0 18px;font-size:14px;color:#334155;line-height:1.6;">Berikut kode verifikasi untuk mereset password akun admin Packrafting Canden:</p>
      <div style="background:#fff7ed;border:2px solid #f97316;border-radius:10px;padding:18px;text-align:center;">
        <span style="font-family:monospace;font-size:32px;font-weight:700;letter-spacing:10px;color:#c2410c;">' . $e . '</span>
      </div>
      <p style="margin:18px 0 0;font-size:13px;color:#64748b;line-height:1.6;">Berlaku <strong>10 menit</strong> dan hanya bisa dipakai <strong>satu kali</strong>.</p>
      <p style="margin:14px 0 0;padding:12px;background:#fef2f2;border-radius:8px;font-size:12px;color:#991b1b;line-height:1.6;">Jangan bagikan kode ini kepada siapa pun. Abaikan email ini jika Anda tidak meminta penggantian password.</p>
    </div>
  </div>
</body></html>';
}

function send_otp_email($to, $otp) {
    $subject = 'Kode OTP Reset Password Admin Packrafting Canden';
    $html = otp_html($otp);
    $text = "Packrafting Canden - Reset Password Admin\n\nKode verifikasi OTP Anda: $otp\n\nBerlaku 10 menit dan hanya bisa dipakai satu kali.";

    if (RESEND_API_KEY) {
        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . RESEND_API_KEY, 'Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode(['from' => MAIL_FROM, 'to' => [$to], 'subject' => $subject, 'html' => $html, 'text' => $text]),
        ]);
        $raw = curl_exec($ch); $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        $j = json_decode($raw, true);
        return ['ok' => $status >= 200 && $status < 300, 'status' => $status, 'message' => $j['message'] ?? ''];
    }
    if (BREVO_API_KEY) {
        $m = []; preg_match('/<([^>]+)>/', MAIL_FROM, $m); preg_match('/^([^<]*)</', MAIL_FROM, $n);
        $sender = ['email' => $m[1] ?? 'noreply@packraftingcanden.com'];
        if (!empty($n[1])) $sender['name'] = trim($n[1]);
        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => ['api-key: ' . BREVO_API_KEY, 'Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_POSTFIELDS => json_encode(['sender' => $sender, 'to' => [['email' => $to]], 'subject' => $subject, 'htmlContent' => $html, 'textContent' => $text]),
        ]);
        $raw = curl_exec($ch); $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        $j = json_decode($raw, true);
        return ['ok' => $status >= 200 && $status < 300, 'status' => $status, 'message' => $j['message'] ?? ($j['error'] ?? '')];
    }
    // Fallback: mail() bawaan hosting.
    $headers = "MIME-Version: 1.0\r\nContent-type: text/html; charset=UTF-8\r\nFrom: " . MAIL_FROM;
    $ok = @mail($to, $subject, $html, $headers);
    return ['ok' => $ok, 'status' => $ok ? 200 : 0, 'message' => $ok ? '' : 'mail() gagal'];
}

try {
    if ($action === 'request') {
        $limit = hit_rate_limit("req:$ip", 5, 15 * 60 * 1000);
        if (!$limit['allowed']) json_out(429, ['success' => false, 'message' => "Terlalu banyak permintaan. Coba lagi dalam {$limit['retryAfter']} detik."]);

        $requestedEmail = strtolower(trim((string)($body['email'] ?? '')));
        $cred = supabase_read_row('admin_cred');
        $adminEmail = strtolower(trim((string)($cred['email'] ?? '')));
        if (!$adminEmail) json_out(500, ['success' => false, 'message' => 'Admin belum terdaftar di database.']);

        if ($requestedEmail !== $adminEmail) {
            json_out(403, ['success' => false, 'message' => 'Alamat email tidak terdaftar sebagai admin.']);
        }

        $existing = supabase_read_row('admin_otp');
        if ($existing && !empty($existing['sentAt']) && now_ms() - (int)$existing['sentAt'] < RESEND_COOLDOWN_MS) {
            $wait = (int)ceil((RESEND_COOLDOWN_MS - (now_ms() - (int)$existing['sentAt'])) / 1000);
            json_out(429, ['success' => false, 'message' => "Kode baru sudah diminta. Tunggu $wait detik sebelum meminta lagi."]);
        }

        if (!SUPABASE_SERVICE_ROLE_KEY) {
            json_out(500, ['success' => false, 'message' => 'Reset password belum dikonfigurasi di server. Hubungi pengelola situs.']);
        }

        $otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $salt = bin2hex(random_bytes(16));

        supabase_upsert_row('admin_otp', [
            'email' => $adminEmail, 'salt' => $salt, 'hash' => sha256($salt . $otp),
            'expiry' => now_ms() + OTP_TTL_MS, 'sentAt' => now_ms(), 'attempts' => 0,
        ]);

        $result = null;
        for ($i = 0; $i < 2; $i++) {
            $result = send_otp_email($adminEmail, $otp);
            if ($result['ok']) break;
            if ($i === 0) usleep(1200000);
        }

        if (!$result['ok']) {
            supabase_upsert_row('admin_otp', ['email' => $adminEmail, 'salt' => null, 'hash' => null, 'expiry' => 0, 'sentAt' => 0, 'attempts' => 0]);
            error_log('[send-otp] pengiriman email gagal');
            json_out(502, ['success' => false, 'message' => 'Email gagal dikirim' . ($result['message'] ? ': ' . $result['message'] : '.') . ' Silakan coba lagi.']);
        }

        json_out(200, ['success' => true, 'message' => 'Kode OTP berhasil dikirim ke email admin.']);
    }

    if ($action === 'verify') {
        $limit = hit_rate_limit("verify:$ip", 10, 15 * 60 * 1000);
        if (!$limit['allowed']) json_out(429, ['success' => false, 'message' => "Terlalu banyak percobaan verifikasi. Coba lagi dalam {$limit['retryAfter']} detik."]);

        $cred = supabase_read_row('admin_cred');
        $adminEmail = strtolower(trim((string)($cred['email'] ?? '')));
        $record = supabase_read_row('admin_otp');

        if (!$record || empty($record['hash']) || empty($record['salt'])) {
            json_out(400, ['success' => false, 'message' => 'Belum ada kode OTP aktif. Silakan minta kode baru.']);
        }
        if (now_ms() > (int)($record['expiry'] ?? 0)) {
            supabase_upsert_row('admin_otp', ['email' => $adminEmail, 'salt' => null, 'hash' => null, 'expiry' => 0, 'sentAt' => 0, 'attempts' => 0]);
            json_out(400, ['success' => false, 'message' => 'Kode OTP telah kedaluwarsa (lebih dari 10 menit). Silakan kirim ulang.']);
        }
        if ((int)($record['attempts'] ?? 0) >= MAX_ATTEMPTS) {
            supabase_upsert_row('admin_otp', ['email' => $adminEmail, 'salt' => null, 'hash' => null, 'expiry' => 0, 'sentAt' => 0, 'attempts' => 0]);
            json_out(429, ['success' => false, 'message' => 'Terlalu banyak percobaan salah. Silakan minta kode OTP baru.']);
        }

        $submitted = trim((string)($body['otp'] ?? ''));
        if (strlen($submitted) !== 6 || sha256($record['salt'] . $submitted) !== $record['hash']) {
            $attempts = (int)($record['attempts'] ?? 0) + 1;
            supabase_upsert_row('admin_otp', array_merge($record, ['attempts' => $attempts]));
            json_out(400, ['success' => false, 'message' => 'Kode OTP salah. Sisa percobaan: ' . max(0, MAX_ATTEMPTS - $attempts) . '.']);
        }

        supabase_upsert_row('admin_otp', array_merge($record, ['verified' => true, 'verifiedAt' => now_ms()]));
        json_out(200, ['success' => true, 'message' => 'Kode verifikasi valid.']);
    }

    if ($action === 'reset') {
        $limit = hit_rate_limit("reset:$ip", 5, 15 * 60 * 1000);
        if (!$limit['allowed']) json_out(429, ['success' => false, 'message' => "Terlalu banyak percobaan. Coba lagi dalam {$limit['retryAfter']} detik."]);

        $newPassword = (string)($body['newPassword'] ?? '');
        if (strlen($newPassword) < 8) json_out(400, ['success' => false, 'message' => 'Password baru minimal 8 karakter.']);

        $cred = supabase_read_row('admin_cred');
        $adminEmail = strtolower(trim((string)($cred['email'] ?? '')));
        $record = supabase_read_row('admin_otp');

        $isVerified = $record && ($record['verified'] ?? false) === true && now_ms() - (int)($record['verifiedAt'] ?? 0) < 5 * 60 * 1000;
        if (!$isVerified) {
            json_out(403, ['success' => false, 'message' => 'Sesi verifikasi tidak valid atau sudah kedaluwarsa. Silakan ulangi prosesnya.']);
        }

        supabase_upsert_row('admin_cred', [
            'username' => $cred['username'] ?? 'admin',
            'email' => $adminEmail,
            'passwordHash' => sha256($newPassword),
            'updatedAt' => gmdate('c'),
        ]);
        supabase_upsert_row('admin_otp', ['email' => $adminEmail, 'salt' => null, 'hash' => null, 'expiry' => 0, 'sentAt' => 0, 'attempts' => 0]);

        json_out(200, ['success' => true, 'message' => 'Password berhasil diperbarui.']);
    }

    json_out(400, ['success' => false, 'message' => 'Aksi tidak dikenal.']);
} catch (Exception $e) {
    error_log('send-otp error: ' . $e->getMessage());
    json_out(500, ['success' => false, 'message' => 'Terjadi kesalahan sistem. Silakan coba lagi.']);
}

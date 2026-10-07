// Serverless function: Admin password reset (OTP request / verify / commit).
//
// All three steps run HERE, on the server. The browser never sees the OTP and
// never decides whether a code is valid. The previous version generated the code
// with Math.random(), stashed it in the visitor's sessionStorage and "verified"
// it client-side, so anyone could read the code from DevTools and reset the
// admin password without ever touching the mailbox.
//
// NOTE: this function still relies on Supabase RLS being enabled for the
// `site_data` table. See supabase-rls.sql for the required policy.

const crypto = require('crypto');

const SUPABASE_URL = 'https://fnyocuashzlrklduehzu.supabase.co';

// Tulis OTP & kredensial butuh hak tulis, yang setelah RLS diaktifkan hanya
// dimiliki service_role. Set SUPABASE_SERVICE_ROLE_KEY di environment Vercel.
// Tanpa key itu, reset password akan gagal dengan pesan yang jelas (bukan diam).
const SUPABASE_WRITE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_READ_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ordvwXeWl8ggR2glcfDwYQ_NvFC_Tgv';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_ROW_KEY = 'admin_otp';
const CRED_ROW_KEY = 'admin_cred';

// Simple in-memory throttles. Serverless instances are ephemeral, so this is a
// speed bump against casual abuse rather than a hard guarantee.
const rateLimits = new Map();

function hitRateLimit(bucket, limit, windowMs) {
  const now = Date.now();
  const entry = rateLimits.get(bucket);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(bucket, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : 'unknown';
}

function supabaseHeaders(key, extra) {
  return Object.assign({
    apikey: key,
    Authorization: `Bearer ${key}`
  }, extra || {});
}

async function supabaseReadRow(key) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_data?key=eq.${encodeURIComponent(key)}&select=*`, {
    headers: supabaseHeaders(SUPABASE_READ_KEY, { 'Cache-Control': 'no-cache' })
  });
  if (!res.ok) throw new Error(`Gagal membaca ${key} dari database (${res.status})`);
  const records = await res.json();
  return Array.isArray(records) && records.length ? records[0].value : null;
}

async function supabaseUpsertRow(key, value) {
  if (!SUPABASE_WRITE_KEY) {
    // Jangan diam-diam gagal: tanpa service_role key, RLS akan menolak semua
    // tulisan dari peran anon.
    throw new Error('SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di environment server.');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_data`, {
    method: 'POST',
    headers: supabaseHeaders(SUPABASE_WRITE_KEY, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    }),
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gagal menyimpan ke database (${res.status}): ${detail}`);
  }
}

// The reset target is whatever email is currently registered as the admin.
// No substring matching: the old `includes('candenpackraft')` check let anyone
// mail arbitrary third parties through this project.
async function resolveAdminEmail() {
  const cred = await supabaseReadRow(CRED_ROW_KEY);
  const registered = cred && typeof cred.email === 'string' ? cred.email.trim().toLowerCase() : '';
  if (!registered) throw new Error('Admin belum terdaftar di database.');
  return registered;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const ip = clientIp(req);
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const action = String(body.action || '').toLowerCase();

  try {
    // ---- Step 1: request an OTP -------------------------------------------
    if (action === 'request') {
      const limit = hitRateLimit(`req:${ip}`, 5, 15 * 60 * 1000);
      if (!limit.allowed) {
        return res.status(429).json({
          success: false,
          message: `Terlalu banyak permintaan. Coba lagi dalam ${limit.retryAfter} detik.`
        });
      }

      const requestedEmail = String(body.email || '').trim().toLowerCase();
      const adminEmail = await resolveAdminEmail();

      if (requestedEmail !== adminEmail) {
        // Do not confirm which addresses are registered.
        return res.status(403).json({ success: false, message: 'Alamat email tidak terdaftar sebagai admin.' });
      }

      const existing = await supabaseReadRow(OTP_ROW_KEY).catch(() => null);
      if (existing && existing.sentAt && Date.now() - existing.sentAt < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.sentAt)) / 1000);
        return res.status(429).json({
          success: false,
          message: `Kode baru sudah diminta. Tunggu ${wait} detik sebelum meminta lagi.`
        });
      }

      // Pastikan hak tulis siap sebelum membakar kode OTP lama.
      if (!SUPABASE_WRITE_KEY) {
        return res.status(500).json({
          success: false,
          message: 'Reset password belum dikonfigurasi di server. Hubungi pengelola situs.'
        });
      }

      // Server-generated code. Only its hash is ever persisted.
      const otp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
      const salt = crypto.randomBytes(16).toString('hex');

      await supabaseUpsertRow(OTP_ROW_KEY, {
        email: adminEmail,
        salt,
        hash: sha256(salt + otp),
        expiry: Date.now() + OTP_TTL_MS,
        sentAt: Date.now(),
        attempts: 0
      });

      const mailRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(adminEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: '[Packrafting Canden] Kode OTP Reset Password Admin',
          _template: 'box',
          'Halo Admin': 'Berikut kode verifikasi OTP resmi untuk mereset password akun admin Packrafting Canden:',
          'KODE VERIFIKASI (OTP)': otp,
          'Waktu Berlaku': '10 Menit sejak permintaan dibuat',
          'Email Terdaftar': adminEmail,
          'Penting': 'Jangan bagikan kode ini kepada anybody demi keamanan website. Abaikan email ini jika Anda tidak meminta penggantian password.'
        })
      });

      if (!mailRes.ok) {
        await supabaseUpsertRow(OTP_ROW_KEY, { email: adminEmail, salt: null, hash: null, expiry: 0, sentAt: 0, attempts: 0 });
        return res.status(502).json({
          success: false,
          message: 'Email gagal dikirim. Silakan coba lagi beberapa saat lagi.'
        });
      }

      return res.status(200).json({ success: true, message: 'Kode OTP berhasil dikirim ke email admin.' });
    }

    // ---- Step 2: verify the OTP -------------------------------------------
    if (action === 'verify') {
      const limit = hitRateLimit(`verify:${ip}`, 10, 15 * 60 * 1000);
      if (!limit.allowed) {
        return res.status(429).json({
          success: false,
          message: `Terlalu banyak percobaan verifikasi. Coba lagi dalam ${limit.retryAfter} detik.`
        });
      }

      const adminEmail = await resolveAdminEmail();
      const record = await supabaseReadRow(OTP_ROW_KEY);

      if (!record || !record.hash || !record.salt) {
        return res.status(400).json({ success: false, message: 'Belum ada kode OTP aktif. Silakan minta kode baru.' });
      }
      if (Date.now() > Number(record.expiry || 0)) {
        await supabaseUpsertRow(OTP_ROW_KEY, { email: adminEmail, salt: null, hash: null, expiry: 0, sentAt: 0, attempts: 0 });
        return res.status(400).json({ success: false, message: 'Kode OTP telah kedaluwarsa (lebih dari 10 menit). Silakan kirim ulang.' });
      }
      if (Number(record.attempts || 0) >= MAX_ATTEMPTS) {
        await supabaseUpsertRow(OTP_ROW_KEY, { email: adminEmail, salt: null, hash: null, expiry: 0, sentAt: 0, attempts: 0 });
        return res.status(429).json({ success: false, message: 'Terlalu banyak percobaan salah. Silakan minta kode OTP baru.' });
      }

      const submitted = String(body.otp || '').trim();
      const expected = sha256(record.salt + submitted);

      if (submitted.length !== 6 || expected !== record.hash) {
        const attempts = Number(record.attempts || 0) + 1;
        await supabaseUpsertRow(OTP_ROW_KEY, Object.assign({}, record, { attempts }));
        return res.status(400).json({
          success: false,
          message: `Kode OTP salah. Sisa percobaan: ${Math.max(0, MAX_ATTEMPTS - attempts)}.`
        });
      }

      // Single-use marker so the commit step cannot be replayed.
      await supabaseUpsertRow(OTP_ROW_KEY, Object.assign({}, record, {
        verified: true,
        verifiedAt: Date.now(),
        attempts: Number(record.attempts || 0)
      }));

      return res.status(200).json({ success: true, message: 'Kode verifikasi valid.' });
    }

    // ---- Step 3: commit the new password ----------------------------------
    if (action === 'reset') {
      const limit = hitRateLimit(`reset:${ip}`, 5, 15 * 60 * 1000);
      if (!limit.allowed) {
        return res.status(429).json({
          success: false,
          message: `Terlalu banyak percobaan. Coba lagi dalam ${limit.retryAfter} detik.`
        });
      }

      const newPassword = String(body.newPassword || '');
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter.' });
      }

      const adminEmail = await resolveAdminEmail();
      const record = await supabaseReadRow(OTP_ROW_KEY);

      const isVerified =
        record && record.verified === true && Date.now() - Number(record.verifiedAt || 0) < 5 * 60 * 1000;
      if (!isVerified) {
        return res.status(403).json({ success: false, message: 'Sesi verifikasi tidak valid atau sudah kedaluwarsa. Silakan ulangi prosesnya.' });
      }

      const cred = (await supabaseReadRow(CRED_ROW_KEY)) || {};
      await supabaseUpsertRow(CRED_ROW_KEY, {
        username: cred.username || 'admin',
        email: adminEmail,
        passwordHash: sha256(newPassword),
        legacyHash: undefined,
        updatedAt: new Date().toISOString()
      });

      // Burn the OTP so a captured session cannot reset again.
      await supabaseUpsertRow(OTP_ROW_KEY, { email: adminEmail, salt: null, hash: null, expiry: 0, sentAt: 0, attempts: 0 });

      return res.status(200).json({ success: true, message: 'Password berhasil diperbarui.' });
    }

    return res.status(400).json({ success: false, message: 'Aksi tidak dikenal.' });
  } catch (error) {
    console.error('send-otp error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem. Silakan coba lagi.' });
  }
};
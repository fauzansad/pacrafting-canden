// Serverless function: reset password admin memakai Kode Pemulihan.
//
// Kenapa channel ini ada: layanan email pihak ketiga (FormSubmit) memblokir
// permintaan yang datang dari IP data center/server, sehingga OTP email tidak
// pernah sampai ketika situs di-host di Vercel. Kode pemulihan tidak butuh
// email sama sekali, jadi tidak bisa gagal karena alasan itu.
//
// Format kode: XXXX-XXXX-XXXX-XXXX (16 karakter dari alfabet tanpa huruf/
// angka yang mudah tertukar: 0/O/1/I/L/S/Z tidak dipakai).
//
// Environment variables:
//   SUPABASE_SERVICE_ROLE_KEY  (wajib)

const crypto = require('crypto');

const SUPABASE_URL = 'https://fnyocuashzlrklduehzu.supabase.co';
const SUPABASE_WRITE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const CRED_ROW_KEY = 'admin_cred';
const RECOVERY_ROW_KEY = 'admin_recovery';

// Batasi brute force: 5 percobaan per IP per 15 menit.
const MAX_IP_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map();

// Alfabet tanpa karakter ambigu: tidak memakai O/0, I/1/l, L/1, S/5, Z/2, B/8.
const CODE_ALPHABET = '34679ACDEFGHJKMNPQRTUVWXY';

function hitRateLimit(bucket, limit, windowMs) {
  const now = Date.now();
  const entry = attempts.get(bucket);
  if (!entry || now > entry.resetAt) {
    attempts.set(bucket, { count: 1, resetAt: now + windowMs });
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

// Perbandingan waktu-tetap supaya tidak bisa dikurangi lewat timing.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch (e) {
    return false;
  }
}

// Normalisasi input user: buang spasi, huruf kecil, dan tanda hubung.
function normalizeCode(input) {
  return String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function generateCode() {
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let chunk = '';
    for (let i = 0; i < 4; i++) {
      chunk += CODE_ALPHABET[crypto.randomInt(0, CODE_ALPHABET.length)];
    }
    groups.push(chunk);
  }
  return groups.join('-');
}

// Dipakai juga oleh admin-save.js agar formatnya identik.
function hashCode(code, salt) {
  return sha256(salt + normalizeCode(code));
}

function supabaseHeaders(key, extra) {
  return Object.assign({ apikey: key, Authorization: `Bearer ${key}` }, extra || {});
}

async function readRow(key) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_data?key=eq.${encodeURIComponent(key)}&select=value`, {
    headers: supabaseHeaders(SUPABASE_WRITE_KEY, { 'Cache-Control': 'no-cache' })
  });
  if (!res.ok) throw new Error(`Gagal membaca ${key} (${res.status})`);
  const records = await res.json();
  return Array.isArray(records) && records.length ? records[0].value : null;
}

async function writeRow(key, value) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_data`, {
    method: 'POST',
    headers: supabaseHeaders(SUPABASE_WRITE_KEY, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    }),
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error(`Gagal menyimpan ${key} (${res.status})`);
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : 'unknown';
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  if (!SUPABASE_WRITE_KEY) {
    return res.status(500).json({ success: false, message: 'Fitur pemulihan belum dikonfigurasi di server.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const ip = clientIp(req);

  try {
    const action = String(body.action || 'recover').toLowerCase();

    // ---- Periksa apakah kode tersedia (untuk UI) --------------------------
    if (action === 'status') {
      const record = await readRow(RECOVERY_ROW_KEY);
      return res.status(200).json({
        success: true,
        available: !!(record && record.hash),
        createdAt: record ? record.createdAt || null : null
      });
    }

    // ---- Reset password dengan kode pemulihan ----------------------------
    const limit = hitRateLimit(`recover:${ip}`, MAX_IP_ATTEMPTS, WINDOW_MS);
    if (!limit.allowed) {
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak percobaan. Coba lagi dalam ${limit.retryAfter} detik.`
      });
    }

    const submitted = normalizeCode(body.code);
    const newPassword = String(body.newPassword || '');

    if (submitted.length !== 16) {
      return res.status(400).json({ success: false, message: 'Kode pemulihan harus 16 karakter (XXXX-XXXX-XXXX-XXXX).' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter.' });
    }

    const record = await readRow(RECOVERY_ROW_KEY);
    if (!record || !record.hash || !record.salt) {
      return res.status(400).json({
        success: false,
        message: 'Belum ada kode pemulihan yang dibuat. Hubungi pengelola situs.'
      });
    }
    if (record.usedAt) {
      return res.status(410).json({
        success: false,
        message: 'Kode pemulihan ini sudah pernah dipakai. Hubungi pengelola situs untuk membuat kode baru.'
      });
    }

    const matches = safeEqual(hashCode(submitted, record.salt), String(record.hash));
    if (!matches) {
      const used = Number(record.failures || 0) + 1;
      await writeRow(RECOVERY_ROW_KEY, Object.assign({}, record, { failures: used }));
      const left = Math.max(0, MAX_IP_ATTEMPTS - used);
      return res.status(401).json({
        success: false,
        message: 'Kode pemulihan salah' + (left > 0 ? `. Sisa percobaan: ${left}.` : '.')
      });
    }

    const cred = (await readRow(CRED_ROW_KEY)) || {};
    await writeRow(CRED_ROW_KEY, {
      username: cred.username || 'admin',
      email: cred.email || '',
      passwordHash: sha256(newPassword),
      legacyHash: null,
      updatedAt: new Date().toISOString()
    });

    // Bakar kode: sekali pakai.
    await writeRow(RECOVERY_ROW_KEY, {
      hash: record.hash,
      salt: record.salt,
      createdAt: record.createdAt,
      usedAt: new Date().toISOString(),
      failures: 0
    });

    console.log(`[recovery] Kode pemulihan dipakai dari ${ip}. Kode sudah dinonaktifkan.`);
    return res.status(200).json({
      success: true,
      message: 'Password berhasil diganti. Kode pemulihan ini sudah tidak berlaku — buat kode baru dari panel admin setelah login.'
    });
  } catch (error) {
    console.error('recovery error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem. Silakan coba lagi.' });
  }
};

module.exports.normalizeCode = normalizeCode;
module.exports.generateCode = generateCode;
module.exports.hashCode = hashCode;
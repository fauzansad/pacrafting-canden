// Serverless function: login admin terverifikasi di server.
//
// Menggantikan login yang murni client-side. Sebelumnya password di-hash di
// browser lalu dibandingkan dengan hash yang tersimpan di tabel yang bisa dibaca
// publik — jadi siapa pun bisa membaca hash tersebut dan menyamar sebagai admin.
//
// Alur baru:
//   1. Browser mengirim password (bukan hash) ke server lewat HTTPS.
//   2. Server membandingkan hash-nya dengan hash di database.
//   3. Server mengembalikan token HMAC yang Berlaku 2 jam.
//   4. Token itulah yang dipakai untuk menyimpan data lewat /api/admin-save.
//
// Catatan: `admin-save.js` dan `send-otp.js` butuh SUPABASE_SERVICE_ROLE_KEY.

const crypto = require('crypto');

const SUPABASE_URL = 'https://fnyocuashzlrklduehzu.supabase.co';
// `admin_cred` sengaja tidak lagi bisa dibaca peran anon (lihat supabase-rls.sql),
// jadi server WAJIB memakai service_role untuk membacanya.
const SUPABASE_WRITE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_READ_KEY = SUPABASE_WRITE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_ordvwXeWl8ggR2glcfDwYQ_NvFC_Tgv';
const SECRET = process.env.ADMIN_SESSION_SECRET || SUPABASE_WRITE_KEY;

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 jam, sama dengan timeout UI

// Simple in-memory throttle; instance serverless bersifat ephemeral.
const attempts = new Map();

function throttle(bucket, limit, windowMs) {
  const now = Date.now();
  const entry = attempts.get(bucket);
  if (!entry || now > entry.resetAt) {
    attempts.set(bucket, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function signToken(username) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${username}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${signature}`;
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

  const ip = clientIp(req);
  if (!throttle(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ success: false, message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const username = String(body.username || '').trim();
  const password = String(body.password || '');

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  if (!SUPABASE_WRITE_KEY) {
    return res.status(500).json({ success: false, message: 'Verifikasi login belum dikonfigurasi di server.' });
  }

  try {
    const readRes = await fetch(`${SUPABASE_URL}/rest/v1/site_data?key=eq.admin_cred&select=*`, {
      headers: {
        apikey: SUPABASE_READ_KEY,
        Authorization: `Bearer ${SUPABASE_READ_KEY}`,
        'Cache-Control': 'no-cache'
      }
    });
    if (!readRes.ok) throw new Error(`Database tidak dapat dibaca (${readRes.status})`);

    const records = await readRes.json();
    if (!Array.isArray(records) || records.length === 0 || !records[0].value) {
      return res.status(500).json({ success: false, message: 'Akun admin belum terdaftar di database.' });
    }

    const cred = records[0].value;
    const inputHash = sha256(password);

    // legacyHash sengaja tidak dipakai lagi: kata sandi lama yang lemah
    // ("admin123") tetap hidup selamanya lewat cabang ini.
    const isUserMatch =
      username.toLowerCase() === String(cred.username || '').toLowerCase() ||
      (cred.email && username.toLowerCase() === String(cred.email).toLowerCase());
    const isPassMatch = cred.passwordHash && inputHash === cred.passwordHash;

    if (!isUserMatch || !isPassMatch) {
      // Respons sengaja tidak membedakan "user tidak ada" vs "password salah".
      return res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }

    return res.status(200).json({
      success: true,
      token: signToken(cred.username || 'admin'),
      username: cred.username || 'admin',
      email: cred.email || ''
    });
  } catch (error) {
    console.error('admin-auth error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memverifikasi akun. Coba lagi beberapa saat lagi.' });
  }
};
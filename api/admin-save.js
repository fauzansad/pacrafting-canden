// Serverless function: menyimpan satu baris `site_data` atas nama admin.
//
// Setelah RLS diaktifkan (lihat supabase-rls.sql), peran `anon` hanya boleh
// MEMBACA. Semua tulisan harus lewat server ini dengan token sesi dari
// /api/admin-auth, memakai service_role key.
//
// Selain menyimpan konten, endpoint ini juga menangani penggantian password
// admin (`action: 'credentials'`) karena `admin_cred` tidak boleh diubah lewat
// jalur `key` biasa â€” harus butuh sesi admin yang valid.
//
// Environment variables:
//   SUPABASE_SERVICE_ROLE_KEY  (wajib)
//   ADMIN_SESSION_SECRET      (disarankan diisi; fallback ke service_role key)

const crypto = require('crypto');

const SUPABASE_URL = 'https://fnyocuashzlrklduehzu.supabase.co';
const SUPABASE_WRITE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SECRET = process.env.ADMIN_SESSION_SECRET || SUPABASE_WRITE_KEY;

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

// Kunci yang boleh diubah admin. `admin_otp` hanya untuk reset password,
// sedangkan `admin_cred` ditangani oleh /api/send-otp agar tidak bisa diubah
// lewat panel biasa.
const WRITABLE_KEYS = [
  'brand', 'banners', 'hero_slides', 'paket', 'operation_schedule',
  'galeri', 'video', 'testimonials', 'wisata_info', 'faq'
];

function verifyToken(token) {
  if (!token || !SECRET) return null;
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;
  try {
    const payload = Buffer.from(parts[0], 'base64').toString('utf8');
    const [username, expiresAt] = payload.split('.');
    if (!username || !expiresAt) return null;
    if (Date.now() > Number(expiresAt)) return null;
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    const given = parts[1];
    if (given.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return null;
    return { username, expiresAt: Number(expiresAt) };
  } catch (e) {
    return null;
  }
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
    return res.status(500).json({ success: false, message: 'Penyimpanan cloud belum dikonfigurasi di server.' });
  }

  const session = verifyToken(req.headers['x-admin-token']);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Sesi admin tidak valid atau sudah kedaluwarsa. Silakan masuk kembali.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const key = String(body.key || '');
  const value = body.value;

  // ---- Info akun (username + email saja, TANPA hash) ----
  // Dipakai untuk mengisi label form ganti password. Hash sengaja tidak
  // pernah dikirim ke browser.
  if (body.action === 'info') {
    const readRes = await fetch(`${SUPABASE_URL}/rest/v1/site_data?key=eq.admin_cred&select=value`, {
      headers: {
        apikey: SUPABASE_WRITE_KEY,
        Authorization: `Bearer ${SUPABASE_WRITE_KEY}`,
        'Cache-Control': 'no-cache'
      }
    });
    const readRecords = await readRes.json();
    const cred = Array.isArray(readRecords) && readRecords.length ? readRecords[0].value : null;
    if (!cred) {
      return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan.' });
    }
    return res.status(200).json({
      success: true,
      username: cred.username || 'admin',
      email: cred.email || ''
    });
  }

  // ---- Ganti password admin (butuh sesi valid + password lama benar) ----
  if (body.action === 'credentials') {
    const newPassword = String(body.newPassword || '');
    const currentPassword = String(body.currentPassword || '');
    const newEmail = String(body.newEmail || '').trim();

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter.' });
    }
    if (!newEmail || newEmail.indexOf('@') === -1) {
      return res.status(400).json({ success: false, message: 'Email admin tidak valid.' });
    }

    const readRes = await fetch(`${SUPABASE_URL}/rest/v1/site_data?key=eq.admin_cred&select=*`, {
      headers: {
        apikey: SUPABASE_WRITE_KEY,
        Authorization: `Bearer ${SUPABASE_WRITE_KEY}`,
        'Cache-Control': 'no-cache'
      }
    });
    const readRecords = await readRes.json();
    const cred = Array.isArray(readRecords) && readRecords.length ? readRecords[0].value : null;
    if (!cred || !cred.passwordHash) {
      return res.status(500).json({ success: false, message: 'Akun admin tidak ditemukan di database.' });
    }

    const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (currentHash !== cred.passwordHash) {
      return res.status(401).json({ success: false, message: 'Password saat ini salah.' });
    }

    const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    const payload = {
      username: String(body.newUsername || cred.username || 'admin').trim(),
      email: newEmail,
      passwordHash: newHash,
      updatedAt: new Date().toISOString()
    };
    // legacyHash dihapus supaya password lama yang lemah tidak tetap berlaku.
    payload.legacyHash = null;

    const writeRes = await fetch(`${SUPABASE_URL}/rest/v1/site_data`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_WRITE_KEY,
        Authorization: `Bearer ${SUPABASE_WRITE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ key: 'admin_cred', value: payload, updated_at: new Date().toISOString() })
    });
    if (!writeRes.ok) {
      return res.status(502).json({ success: false, message: `Database menolak penyimpanan (${writeRes.status}).` });
    }

    return res.status(200).json({ success: true, username: payload.username, email: payload.email });
  }

  if (!key || value === undefined) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
  }
  if (!WRITABLE_KEYS.includes(key)) {
    return res.status(403).json({ success: false, message: `Kunci "${key}" tidak boleh diubah dari panel ini.` });
  }

  // Batasi ukuran payload agar request tidak membanjiri database.
  const serialized = JSON.stringify(value);
  if (serialized.length > 4 * 1024 * 1024) {
    return res.status(413).json({ success: false, message: 'Data terlalu besar untuk disimpan. Gunakan URL gambar, bukan file gambar.' });
  }

  try {
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/site_data`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_WRITE_KEY,
        Authorization: `Bearer ${SUPABASE_WRITE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
    });

    if (!res2.ok) {
      const detail = await res2.text();
      console.error(`admin-save gagal untuk "${key}":`, detail);
      return res.status(502).json({ success: false, message: `Database menolak penyimpanan (${res2.status}).` });
    }

    console.log(`[admin-save] "${key}" diperbarui oleh ${session.username} dari ${clientIp(req)}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('admin-save error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghubungi database.' });
  }
};

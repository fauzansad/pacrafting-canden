// Serverless function for Vercel to send OTP Reset Password
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const targetEmail = (email || '').trim().toLowerCase();
    const authorizedEmail = 'fauzansadidaramadhan@gmail.com';

    // Verify authorized admin recipient
    if (targetEmail !== authorizedEmail && !targetEmail.includes('candenpackraft')) {
      return res.status(403).json({ success: false, message: 'Alamat email tidak terdaftar sebagai admin.' });
    }

    // Send email via FormSubmit API
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `[Packrafting Canden] Kode OTP Reset Password Admin: ${otp}`,
        _template: 'box',
        "Halo Admin": "Berikut adalah kode verifikasi OTP resmi untuk mereset password akun admin Packrafting Canden:",
        "KODE VERIFIKASI (OTP)": otp,
        "Waktu Berlaku": "10 Menit sejak permintaan dibuat",
        "Email Terdaftar": targetEmail,
        "Penting": "Jangan bagikan kode ini kepada siapapun demi keamanan website Packrafting Canden. Abaikan email ini jika Anda tidak meminta penggantian password."
      })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, message: 'Kode OTP berhasil dikirim ke Gmail tertaut.', data });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim email OTP.', error: error.message });
  }
};

-- =============================================================================
-- Packrafting Canden — Supabase RLS (WAJIB DIJALANKAN)
-- =============================================================================
-- masalah: tabel `site_data` saat ini dapat dibaca, ditulis, dan dihapus oleh
-- peran `anon` memakai kunci publishable yang publik di assets/js/data.js.
-- Akibatnya siapa pun bisa:
--   1. Membaca baris `admin_cred` (hash password admin).
--   2. Menimpa `admin_cred` dengan hash pilihan sendiri lalu login ke portal admin.
--   3. Mengubah `brand.whatsapp` / `brand.instagram` (defacement / phising).
--   4. Menghapus semua baris sehingga situs kosong.
--
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor.
-- PENTING: jalankan LANGKAH 1 (rotasi password admin) sebelum atau sesudah,
-- karena baris `admin_cred` yang ada sudah pernah terekspos publik.
-- =============================================================================

-- 1. Pastikan kunci pada baris `admin_cred` tidak lagi dapat dibaca publik.
--    Contoh hash SHA-256 untuk password baru dapat dibuat dengan:
--      node -e "console.log(require('crypto').createHash('sha256').update('PasswordBaruAnda!').digest('hex'))"

-- 2. Matikan akses anon ke seluruh tabel.
ALTER TABLE public.site_data ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama bila ada (aman dijalankan ulang).
DROP POLICY IF EXISTS "anon_all_site_data" ON public.site_data;

-- 3. Front-end (landing page) tetap harus bisa MEMBACA data supaya konten
--    admin tampil di website. Ini satu-satunya hak yang boleh dimiliki anon.
CREATE POLICY "anon_read_site_data"
  ON public.site_data
  FOR SELECT
  TO anon
  USING (true);

-- 4. Menulis / menghapus / mengubah data hanya boleh lewat server (service_role).
--    Tidak ada policy INSERT/UPDATE/DELETE untuk peran anon sama sekali,
--    sehingga saveToCloud() di browser tidak lagi bisa mengubah apa pun.
--    Untuk itu, API server (api/send-otp.js) harus memakai service_role key
--    melalui environment variable:
--      SUPABASE_SERVICE_ROLE_KEY=<service_role key>
--    (service_role key JANGAN pernah ditaruh di file frontend.)

-- 5. Verifikasi (hasilnya: hanya policy "anon_read_site_data" dengan cmd = SELECT):
--    SELECT key FROM public.site_data;
--    --oanbi confirmasi policy aktif:
--    SELECT policyname, cmd, roles FROM pg_policies
--      WHERE tablename = 'site_data';
-- =============================================================================
-- Packrafting Canden — Supabase RLS (sudah dijalankan 7 Oktober 2026)
-- =============================================================================
--
-- SEBELUMNYA tabel `site_data` punya policy:
--     "Public Write Access"  cmd=ALL   roles={public}  using=true  check=true
--     "Public Read Access"   cmd=SELECT roles={public} using=true
-- Artinya siapa pun yang punya publishable key (publik di file frontend) bisa
-- membaca, menulis, dan menghapus semua baris — termasuk admin_cred.
--
-- HASIL: peran `anon` sekarang hanya boleh MEMBACA, dan baris `admin_cred` /
-- `admin_otp` tidak lagi terlihat sama sekali.
--
-- Script ini idempoten: aman dijalankan berkali-kali.
-- Jalankan di Supabase Dashboard -> SQL Editor.
-- =============================================================================

-- 1. Hapus semua policy lama yang terlalu longgar.
DROP POLICY IF EXISTS "Public Write Access"  ON public.site_data;
DROP POLICY IF EXISTS "Public Read Access"   ON public.site_data;
DROP POLICY IF EXISTS "anon_all_site_data"   ON public.site_data;
DROP POLICY IF EXISTS "anon_write_site_data" ON public.site_data;
DROP POLICY IF EXISTS "anon_read_site_data"  ON public.site_data;

-- 2. Pastikan RLS aktif.
ALTER TABLE public.site_data ENABLE ROW LEVEL SECURITY;

-- 3. Satu-satunya hak untuk peran anon: membaca, KECUALI baris kredensial.
--    Front-end memakai anon key, jadi konten website tetap tampil normal.
CREATE POLICY "anon_read_site_data"
  ON public.site_data
  FOR SELECT
  TO anon
  USING (key <> 'admin_cred' AND key <> 'admin_otp');

-- 4. Tidak ada policy INSERT / UPDATE / DELETE untuk peran anon.
--    Semua tulisan wajib lewat server memakai service_role:
--      - /api/admin-save  (konten + ganti password)
--      - /api/send-otp    (reset password via OTP)
--
-- 5. Environment variables di Vercel (wajib, kalau belum diset):
--      SUPABASE_SERVICE_ROLE_KEY = service_role key
--      ADMIN_SESSION_SECRET     = string acak panjang
--
-- 6. Verifikasi (hasilnya harus persis seperti ini):
--      SELECT policyname, cmd, roles, qual FROM pg_policies
--       WHERE tablename='site_data';
--    -> anon_read_site_data | SELECT | {anon} | ((key <> 'admin_cred') AND (key <> 'admin_otp'))
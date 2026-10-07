# PACKRAFTING CANDEN — Adventure on the River
**Destinasi Wisata Petualangan Air Desa Canden, Bantul, D.I. Yogyakarta**

> *"Jelajahi Sungai, Rasakan Petualangannya."*

Website promosi dan reservasi resmi wisata petualangan sungai (**Packrafting Canden**) yang berlokasi di Desa Canden, Kapanewon Jetis, Kabupaten Bantul, Daerah Istimewa Yogyakarta.

---

## 🌊 Konsep Website

Website ini memadukan konsep **destinasi wisata + outdoor adventure + direct WhatsApp booking**, dengan tampilan visual yang energik, modern, profesional, dan instagramable.

- **Warna Utama**:
  - Deep Forest Green (`#1b4332`)
  - River Blue / Teal (`#0e7490` & `#06b6d4`)
  - Warm Adventure Orange (`#f97316`)
  - Off-White / Warm River Bank Beige (`#fcfbf9` & `#f4f1ea`)
- **Tipografi**:
  - Heading: *Plus Jakarta Sans*
  - Body: *Inter*

---

## 🧭 Alur Halaman Utama (14 Section)

1. **Navbar** — Transparan di atas hero, otomatis solid + blur saat scroll, tombol quick CTA Booking.
2. **Hero Section** — Teks besar *"PACKRAFTING CANDEN"*, *"Adventure on the River"*, tombol *Booking Sekarang* & *Lihat Paket*, badge lokasi *📍 Desa Canden, Bantul, Yogyakarta*.
3. **Intro Section** — *"Petualangan Dimulai di Sini"*, pengenalan sensasi menyusuri sungai dengan perahu packraft.
4. **Why Packrafting Canden** — 4 kartu keunggulan: *Adventure*, *Nature*, *Safe Experience*, *Fun Together*.
5. **Paket Wisata** — Kartu paket petualangan:
   - *Packrafting Experience* (Populer)
   - *Family Adventure* (Keluarga & Anak)
   - *Group / Community* (Outbound & Gathering)
6. **Alur Pengalaman (Timeline)** — 6 tahapan seru: *01 Arrival &bull; 02 Briefing &bull; 03 Preparation &bull; 04 Start &bull; 05 River Ride &bull; 06 Finish*.
7. **Safety First** — Standar perlengkapan (life jacket, helmet, river guide bersertifikasi, monitoring debit air) dan kebijakan keselamatan.
8. **Galeri Petualangan** — Masonry grid foto aksi jeram sungai, pemandangan, dan kebersamaan + fitur *Lightbox Modal*.
9. **Video Pengalaman** — *"Feel the Ride"* video container interaktif.
10. **Lokasi & Meeting Point** — Info rute dari pusat Jogja/Bantul dan peta interaktif Leaflet.js.
11. **FAQ Accordion** — Jawaban pertanyaan seputar pemula, kemampuan berenang, batasan usia, perlengkapan bawaan, dokumentasi, dan cuaca.
12. **Testimonial** — Cerita dan ulasan seru wisatawan.
13. **CTA Booking Utama** — *"SIAP UNTUK PETUALANGAN?"* dengan tombol direct WhatsApp pemesanan.
14. **Footer** — Identitas Desa Canden, tautan navigasi, sosial media, dan hak cipta.
15. **Floating WhatsApp Button** — Tombol melayang di pojok kanan bawah untuk reservasi cepat.

---

## 🛠 Struktur File Proyek

```
desa-canden/
│
├── index.html              # Halaman utama (All-in-one river adventure landing page)
├── galeri.html             # Halaman galeri foto & dokumentasi
├── kontak.html             # Halaman kontak, meeting point, & peta
│
├── admin/
│   ├── login.html          # Login portal admin
│   ├── index.html          # Dashboard metrik wisata
│   ├── banner.html         # Manajemen hero banner (posisi foto, teks, CTA)
│   ├── paket.html          # CRUD paket wisata (harga, durasi, fasilitas)
│   └── kontak.html         # Konfigurasi nomor WhatsApp & meeting point
│
├── assets/
│   ├── css/
│   │   ├── style.css       # Stylesheet outdoor river adventure
│   │   └── admin.css       # Stylesheet admin panel packrafting
│   │
│   ├── js/
│   │   ├── data.js         # Pusat data store (Paket, FAQ, WhatsApp message template)
│   │   ├── main.js         # Fitur interaktif (Scroll navbar, lightbox, FAQ, map)
│   │   └── admin.js        # Logika CRUD admin panel
│   │
│   └── images/             # Direktori aset foto (hero, galeri, profil, potensi)
│
└── README.md
```

---

## 📱 Format Pesan WhatsApp Booking Otomatis

Ketika calon wisatawan mengklik tombol booking, tautan akan langsung mengarah ke WhatsApp dengan format pesan rapi:

```text
Halo, saya ingin booking Packrafting Canden.

Nama:
Jumlah peserta:
Pilihan paket: [Nama Paket]
Tanggal:
Jam:

Mohon informasi ketersediaannya.
```

---

## ✏️ Cara Mengganti Data Placeholder

Buka file [`assets/js/data.js`](file:///d:/PROJEK/DESA%20CANDEN/assets/js/data.js) untuk mengganti data placeholder:

1. **Nomor WhatsApp**: Ganti `whatsapp: '[NOMOR_WHATSAPP]'` dengan nomor resmi (misal: `'6281234567890'`).
2. **Harga & Durasi Paket**: Ganti nilai `harga: '[HARGA]'` dan `durasi: '± [DURASI]'` pada array `paket`.
3. **Meeting Point**: Ganti `meetingPoint: '[Alamat / Titik Kumpul Meeting Point]'`.
4. **Koordinat Peta**: Ganti `koordinat: { lat: -7.885, lng: 110.365 }` dengan titik koordinat GPS meeting point sebenarnya.
5. **Foto Asli**: Letakkan foto beresolusi tinggi di folder `assets/images/` dan perbarui path foto pada data/HTML.

---

## 🚀 Cara Menjalankan Website

Karena website ini dibangun murni menggunakan **HTML5, CSS3, dan Vanilla JavaScript**, Anda dapat membukanya dengan cara:

- **Cara 1**: Langsung *double-click* file `index.html` di File Explorer.
- **Cara 2 (Live Server)**: Klik kanan `index.html` di VS Code &rarr; *Open with Live Server*.
- **Cara 3 (Built-in Server)**:
  ```powershell
  php -S localhost:8000
  ```
  atau
  ```powershell
  npx serve . -l 3000
  ```

---

## 🔐 Portal Admin

- **URL**: [`admin/login.html`](file:///d:/PROJEK/DESA%20CANDEN/admin/login.html)
- Login diverifikasi di **server** (`/api/admin-auth`), bukan di browser. Password tidak pernah
  tersimpan di `localStorage` dan hash-nya tidak pernah dikirim ke klien.
- Panel hanya bisa **menulis lewat** `/api/admin-save` dengan token sesi. Front-end publik
  hanya punya hak **membaca**.

> ⚠️ Login hanya bisa dipakai lewat `https://` (localhost atau Vercel). Membuka
> `admin/login.html` lewat `file://` akan membuat verifikasi & penyimpanan gagal,
> karena fungsi serverless tidak tersedia.

---

## 🚨 Checklist Wajib Sebelum Go-Live

Perubahan keamanan berikut **tidak aktif** sampai langkah manual ini dikerjakan.

Perubahan keamanan berikut **tidak aktif** sampai langkah manual ini dikerjakan.

### 1. Jalankan RLS di Supabase (paling penting)

Sebelum Oktober 2026, tabel `site_data` bisa read/write/delete oleh siapa pun yang
memiliki publishable key. Buka **Supabase Dashboard → SQL Editor**, jalankan
[`supabase-rls.sql`](supabase-rls.sql). Setelah itu peran `anon` hanya bisa
membaca, dan semua tulisan harus lewat server.

### 2. Set environment variables di Vercel

| Name | Isi |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key dari Supabase → Project Settings → API |
| `ADMIN_SESSION_SECRET` | string acak panjang, mis. hasil `openssl rand -hex 32` |
| `RESEND_API_KEY` | API key dari Resend (opsional, untuk OTP email) |
| `MAIL_FROM` | pengirim email, mis. `Packrafting Canden <noreply@domainmu.id>` |

Tanpa `SUPABASE_SERVICE_ROLE_KEY`, login dan penyimpanan dari panel akan gagal
dengan pesan "belum dikonfigurasi di server".

### Layanan email untuk OTP

OTP email memakai provider transactional yang dipilih dari environment:

| Provider | Env var | Free tier |
| --- | --- | --- |
| Resend | `RESEND_API_KEY` | 3.000 email/bulan |
| Brevo | `BREVO_API_KEY` | 300 email/hari |

Kalau keduanya kosong, kode jatuh ke FormSubmit — **tapi FormSubmit memblokir
permintaan dari IP data center**, jadi email tidak akan sampai dari Vercel.
(FormSubmit membalas 200 dari IP rumah, 403 dari server.) Kalau itu terjadi,
pastikan salah satu env var di atas sudah diisi.

### 3. Rotasi password admin

Baris `admin_cred` pernah bisa dibaca publik, jadi **wajib** ganti password
sekarang lewat panel (menu *Ganti Password*). Password bawaan yang lama sudah
dihapus dari source code dan tidak lagi diterima. FormSubmit juga perlu
konfirmasi sekali untuk alamat email admin baru.

### 4. Deploy ulang

```powershell
npx vercel --prod
```

`vercel.json` sekarang mengatur `functions`, CSP, dan `no-store` untuk `/admin/*`.

### 5. Perbarui baris FAQ di database

Teks FAQ sudah dikoreksi di `data.js` menjadi **4,5 km** (bukan 3,5 km), tapi
database masih menyimpan versi lama. Buka **Panduan & Info Wisata → 5.
Pertanyaan Umum (FAQ)**, klik *Simpan*, atau ubah nilainya langsung di
Supabase. Section 5 baru itulah yang membuat data ini bisa diperbaiki admin.

---

## 🧪 Verifikasi

Tidak ada framework test di proyek ini. Pemeriksaan dilakukan dengan:

```powershell
node --check assets/js/data.js
node --check assets/js/main.js
node --check assets/js/admin.js
node --check assets/js/i18n.js
node --check api/admin-auth.js
node --check api/admin-save.js
node --check api/send-otp.js
```

Untuk uji perilaku `DataStore` (getter tahan data rusak, `admin_cred` tidak bocor,
penulisan lewat server), lihat bagian pengujian pada dokumentasi internal.

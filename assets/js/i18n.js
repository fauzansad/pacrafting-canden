/* ============================================================
   I18N.JS - Multi-Language Internationalization System
   Packrafting Canden — Adventure on the River
   Supported: Bahasa Indonesia (ID) & English (EN)
   ============================================================ */

(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'packraft_lang';
  const DEFAULT_LANG = 'id';

  const translations = {
    // ==========================================
    // BAHASA INDONESIA (ID)
    // ==========================================
    id: {
      // Document
      page_title: "Packrafting Canden | Wisata Susur Sungai Opak Bantul",
      page_meta_desc: "Nikmati pengalaman wisata packrafting dan petualangan susur Sungai Opak dari Starting Point Canden hingga finish di Wisata Potrobayan, Bantul, Yogyakarta.",

      // Navbar
      nav_home: "Home",
      nav_about: "Tentang",
      nav_packages: "Paket",
      nav_experience: "Pengalaman",
      nav_safety: "SOP & Safety",
      nav_gallery: "Galeri",
      nav_location: "Rute & Peta",
      nav_faq: "FAQ",
      nav_toggle_menu: "Buka Menu",

      // Hero
      hero_location: '<i class="fa-solid fa-route text-accent"></i> Rute Sungai Opak &bull; 4,5 KM (± 1,5 Jam) &bull; Canden &rarr; Wisata Potrobayan',
      hero_title: 'PACKRAFTING <span>CANDEN</span>',
      hero_sub: "Adventure on the River",
      hero_lead: "Rasakan sensasi menyusuri Sungai Opak dari Starting Point Canden hingga finish di Wisata Potrobayan. Petualangan air seru, alami, dan tak terlupakan!",
      hero_cta: '<i class="fa-solid fa-compass"></i> Lihat Pilihan Paket Wisata',
      hero_scroll: "Scroll ke Bawah",

      // About
      about_eyebrow: "Pesona Desa Wisata Canden",
      about_title: "PETUALANGAN, KESEHATAN &amp; KEARIFAN LOKAL",
      about_sub: "Sensasi Packrafting Pertama di Yogyakarta Berbalut Nuansa Asri Pedesaan",
      about_p1: "<strong>Packrafting Canden</strong> memadukan petualangan mendayung perahu di alam terbuka dengan kehangatan kearifan lokal Desa Canden, Bantul. Cocok untuk wisatawan keluarga, komunitas, maupun rombongan yang mendambakan liburan Jogja yang tenang, menyehatkan, dan menyenangkan.",
      about_p2: "Menyusuri jernihnya aliran Sungai Opak sejauh <strong>4,5 km selama ± 1,5 jam</strong>, Anda akan disuguhi rimbunnya pepohonan, tebing alami tepian kali, serta sajian jamu tradisional khas Canden yang menyegarkan tubuh dan pikiran.",
      about_badge_km: "4,5 KM",
      about_badge_duration: "Durasi ± 1,5 Jam",
      about_manager_title: "Pokdarwis &amp; Pengelola Susur Sungai Desa Canden",
      about_manager_desc: "Pengelola resmi aktivitas wisata petualangan air Packrafting di Sungai Opak, Desa Canden, Kapanewon Jetis, Kabupaten Bantul. Tim pemandu lokal bersertifikat siap mendampingi setiap perjalanan susur kali Anda.",
      about_manager_cert: "Binaan Dinas Pariwisata &amp; Pemerintah Kalurahan Canden — Standar Keamanan &amp; River Guide Bersertifikasi.",
      about_btn: 'Pilih Paket Wisata <i class="fa-solid fa-arrow-right"></i>',

      // Why Us
      why_eyebrow: "Pengalaman Berkesan",
      why_title: "Kenapa Memilih Packrafting Canden?",
      why_desc: "Pengalaman wisata susur kali otentik di Desa Canden yang aman, menyehatkan, dan penuh kehangatan keramahan warga.",
      why_1_title: "Petualangan Air Alami",
      why_1_desc: "Menyusuri arus Sungai Opak yang ramah pemula namun tetap memacu adrenalin di atas perahu packraft yang stabil.",
      why_2_title: "Standar Keamanan Terjamin",
      why_2_desc: "Peralatan APD lengkap berstandar resmi (helm, life jacket, dayung) dengan pendampingan river guide &amp; tim rescue.",
      why_3_title: "Kebugaran &amp; Jamu Desa",
      why_3_desc: "Sentra jamu tradisional Desa Canden dan kelapa muda segar untuk memulihkan vitalitas setelah menyusuri sungai.",
      why_4_title: "Finish Wisata Potrobayan",
      why_4_desc: "Pendaratan istimewa di muara pertemuan Sungai Opak &amp; Sungai Oya dengan panorama lembah yang asri.",

      // Packages
      pkg_eyebrow: "Pilihan Trip Wisata",
      pkg_title: "PILIHAN PAKET WISATA",
      pkg_desc: "Nikmati sensasi mendayung di Sungai Opak dengan fasilitas lengkap, pemandu ramah, kuliner desa, dan proteksi asuransi resmi.",
      pkg_ribbon_fav: "Trip Favorit",
      pkg_ribbon_meal: "Lengkap + Makan",
      pkg_1_title: "PAKET 1 &mdash; ADVENTURE",
      pkg_1_sub: "Sensasi Pengarungan Sungai + Jamu Tradisional / Kelapa Muda",
      pkg_unit: "/ orang",
      pkg_duration_label: "Durasi Trip",
      pkg_duration_val: "± 1,5 Jam (4,5 km)",
      pkg_boat_label: "Perahu",
      pkg_boat_val: "1 Orang / Packraft",
      pkg_features_title: "Fasilitas Termasuk:",
      pkg_f_gear: "Packrafting Kit Lengkap (Helm, Pelampung, Paddle)",
      pkg_f_transport: "Transportasi Lokal Penjemputan (Finish kembali ke Start)",
      pkg_f_guide: "Pemandu / River Guide Profesional",
      pkg_f_rescue: "Tim Rescue Standby di Jalur Sungai",
      pkg_f_snack: "Tradisional Snack Khas Desa Canden",
      pkg_f_drink: "Welcome Drink: <strong>Jamu Tradisional</strong> atau <strong>Kelapa Muda</strong>",
      pkg_f_insurance: "Perlindungan Asuransi Resmi",
      pkg_btn_1: '<i class="fa-brands fa-whatsapp"></i> Reservasi Paket 1',

      pkg_2_title: "PAKET 2 &mdash; KOMPLIT",
      pkg_2_sub: "Pengarungan Lengkap + Sajian Makan Prasmanan Khas Ndeso",
      pkg_f_all_pkg1: "<strong>Semua fasilitas Paket 1 lengkap</strong>",
      pkg_f_buffet: "<strong>Makan Menu Prasmanan sajian masakan khas Ndeso Canden</strong>",
      pkg_f_transport_start_finish: "Transportasi Lokal Antar-Jemput Start &amp; Finish",
      pkg_btn_2: '<i class="fa-brands fa-whatsapp"></i> Reservasi Paket 2',

      // Addons & Info
      addons_eyebrow: '<i class="fa-solid fa-camera"></i> Layanan Dokumentasi',
      addons_title: "Fasilitas Tambahan (Opsional)",
      addons_desc: "Abadikan momen petualangan wellness Anda dengan dokumentasi foto kamera dan video udara drone sinematik.",
      addon_card1_title: "Dokumentasi Standar Foto",
      addon_card1_sub: "Foto aksi pengarungan sungai jernih &amp; tajam",
      addon_item_camera: '<i class="fa-solid fa-camera text-accent"></i> Dokumentasi Kamera Standar',
      addon_item_iphone: '<i class="fa-brands fa-apple text-accent"></i> Kamera iPhone + Edit',
      addon_item_dslr: '<i class="fa-solid fa-camera-rotate text-accent"></i> Kamera DSLR/Mirrorless + Edit',
      addon_card2_title: "Dokumentasi Drone Udara",
      addon_card2_sub: "Video udara sinematik pemandangan alam dari langit",
      addon_item_drone: '<i class="fa-solid fa-film text-accent"></i> Video Sinematik Drone (Full HD / 4K)',
      addon_note: '<i class="fa-solid fa-circle-info text-accent"></i> Biaya dokumentasi dapat disesuaikan dengan kebutuhan rombongan dan kondisi cuaca saat pengarungan.',
      
      info_title: "Informasi Tambahan &amp; Ketentuan Kegiatan",
      info_cap: "Kapasitas Perahu:",
      info_cap_val: "1 Orang dewasa per perahu packraft untuk stabilitas dan manuver maksimal.",
      info_tandem: "Tandem untuk Anak-anak:",
      info_tandem_val: "Bisa dilakukan dengan pendampingan orang tua (anak usia mulai 7 tahun).",
      info_age: "Batas Usia Minimal:",
      info_age_val: "12 tahun untuk mendayung mandiri (kondisi fisik sehat &amp; bugar).",
      info_route: "Jalur &amp; Durasi:",
      info_route_val: "Rute pengarungan sungai sepanjang ± 4,5 KM dengan durasi ± 1,5 jam.",
      meeting_points_title: '<i class="fa-solid fa-location-dot text-accent"></i> 5 Pilihan Lokasi Titik Kumpul (Meeting Point):',
      meeting_points_desc: "Lokasi titik kumpul fleksibel dan akan diinformasikan serta dikoordinasikan lebih lanjut oleh tim admin:",
      meeting_pt_1: "1. Rumah Makan Kongkow",
      meeting_pt_2: "2. Rumah Makan Kopi Klotok Paris",
      meeting_pt_3: "3. Rumah Makan Paon Darmo",
      meeting_pt_4: "4. Kantor BUMKal Candi Arta Kalurahan Canden",
      meeting_pt_5: "5. Basecamp Packrafting Canden",

      // Wellness
      wellness_eyebrow: "Wisata Sehat &amp; Bugar",
      wellness_title: "WELLNESS TOURISM DI DESA CANDEN",
      wellness_desc: "Harmonisasi petualangan alam bebas dengan kesehatan raga, ketenangan jiwa, dan kearifan racikan jamu tradisional nusantara.",
      wellness_1_title: "Olahraga Air Alami",
      wellness_1_desc: "Sensasi olahraga dayung aktif yang melatih otot inti dan menyehatkan tubuh di tengah gemericik arus Sungai Opak.",
      wellness_2_title: "Tradisi Jamu Canden",
      wellness_2_desc: "Racikan jamu tradisional khas Desa Canden atau kelapa muda segar untuk memulihkan vitalitas tubuh.",
      wellness_3_title: "Relaksasi Pikiran",
      wellness_3_desc: "Pemandangan asri pepohonan hijau dan tebing alami sungai yang memberi ketenangan jiwa (refreshing mind &amp; soul).",
      wellness_4_title: "Budaya &amp; Kearifan Lokal",
      wellness_4_desc: "Mengenal keramahan warga Desa Canden dan sejarah Sungai Opak dalam balutan wisata edukasi pedesaan.",

      // Experience Timeline
      exp_eyebrow: "Alur Petualangan",
      exp_title: "Alur Pengarungan Sungai",
      exp_desc: "Tahapan seru petualangan packrafting dari Starting Point Canden hingga pendaratan di Wisata Potrobayan.",
      exp_step1_title: "MEETING POINT &amp; KUMPUL",
      exp_step1_desc: "Tiba di Basecamp / Meeting Point Canden, registrasi peserta, dan sambutan hangat tim pemandu lokal.",
      exp_step2_title: "SAFETY BRIEFING",
      exp_step2_desc: "River guide bersertifikasi memberikan pengarahan keselamatan, teknik dasar mendayung paddle, dan simulasi arus sungai.",
      exp_step3_title: "FITTING GEAR &amp; APD",
      exp_step3_desc: "Pemasangan rompi pelampung (life jacket), helm pelindung bersertifikasi, dan penyerahan double blade paddle standar.",
      exp_step4_title: "START PENGARUNGAN",
      exp_step4_desc: "Perahu packraft meluncur ke aliran Sungai Opak! Mulai mendayung santai beradaptasi dengan segarnya air sungai.",
      exp_step5_title: "JERAM SERU &amp; REST AREA",
      exp_step5_desc: "Menaklukkan jeram-jeram ringan yang seru, rehat sejenak di Rest Area, dan menikmati keelokan tebing alam nan asri.",
      exp_step6_title: "FINISH DI POTROBAYAN",
      exp_step6_desc: "Mendarat di Wisata Potrobayan (pertemuan Sungai Opak &amp; Oya), bilas bersih, dokumentasi, dan penjemputan shuttle kembali.",

      // Safety First & SOP
      sop_eyebrow: "Prosedur Keselamatan",
      sop_title: "Standar Keselamatan &amp; SOP Pengarungan",
      sop_desc: "Petualangan yang berkesan berawal dari rasa aman. Kami menerapkan <strong>8 Standar Operasional Prosedur (SOP)</strong> wajib demi keselamatan dan kenyamanan seluruh wisatawan selama pengarungan Sungai Opak.",
      sop_p1_title: "APD Bersertifikasi",
      sop_p1_desc: "Helm pelindung &amp; life jacket berdaya apung tinggi.",
      sop_p2_title: "River Guide Terlatih",
      sop_p2_desc: "Pemandu dan tim rescue berpengalaman di arus sungai.",
      sop_p3_title: "Safety Briefing",
      sop_p3_desc: "Simulasi dayung dan arahan evakuasi sebelum start.",
      sop_p4_title: "Monitoring Arus Realtime",
      sop_p4_desc: "Pemeriksaan debit sungai dan prakiraan cuaca berkala.",
      
      sop_tag_wajib: "Wajib",
      sop_tag_age: "Kriteria Usia",
      sop_tag_warn: "Himbauan",
      sop_tag_health: "Kesehatan",
      sop_tag_emergency: "Darurat",
      sop_tag_insurance: "Asuransi",
      sop_tag_prohibit: "Larangan Keras",
      sop_tag_ban: "Larangan",

      sop_1_title: "Wajib Mengenakan APD",
      sop_1_desc: "Seluruh peserta <strong>WAJIB</strong> mengenakan Alat Pelindung Diri (APD) resmi berupa <strong>Helm pengaman</strong>, <strong>Life Jacket (rompi pelampung)</strong>, serta <strong>sepatu air atau sandal gunung</strong> yang mengikat kuat selama kegiatan di sungai.",
      sop_2_title: "Usia Minimal 7 Tahun",
      sop_2_desc: "Peserta memiliki batas <strong>usia minimal 7 tahun</strong> dalam kondisi fisik sehat dan bugar. Peserta anak-anak wajib mendapatkan pendampingan dari orang tua atau wali dewasa.",
      sop_3_title: "Himbauan Ibu Hamil",
      sop_3_desc: "Ibu hamil <strong>tidak disarankan</strong> untuk mengikuti aktivitas packrafting ini demi memprioritaskan kesehatan, keselamatan, dan kenyamanan ibu beserta janin.",
      sop_4_title: "Riwayat Penyakit Bawaan",
      sop_4_desc: "Peserta dengan penyakit bawaan seperti <strong>epilepsi, asma, dan penyakit jantung TIDAK DIPERBOLEHKAN</strong> mengikuti aktivitas pengarungan sungai demi mencegah risiko medis darurat di air.",
      sop_5_title: "Kondisi Penghentian Aktivitas",
      sop_5_desc: "Aktivitas akan segera <strong>dihentikan atau dialihkan</strong> jika: 1. Terjadi perubahan iklim ekstrem (angin kencang, badai, luapan arus). 2. Terjadi situasi darurat yang membutuhkan evakuasi.",
      sop_6_title: "Simpan Tiket untuk Asuransi",
      sop_6_desc: "Pengunjung <strong>wajib menyimpan tiket resmi</strong> kegiatan dengan baik sebagai bukti sah kepesertaan guna memproses <strong>klaim asuransi</strong> bila sewaktu-waktu dibutuhkan.",
      sop_7_title: "Bebas Alkohol &amp; Obat Terlarang",
      sop_7_desc: "Peserta <strong>TIDAK BOLEH</strong> mengikuti aktivitas apabila berada di bawah pengaruh minuman beralkohol, narkotika, maupun obat-obatan terlarang atau zat adiktif berbahaya lainnya.",
      sop_8_title: "Dilarang Merokok",
      sop_8_desc: "<strong>Dilarang merokok</strong> (rokok tembakau maupun rokok elektrik/vape) selama seluruh rangkaian aktivitas pengarungan sungai berlangsung demi keselamatan dan kenyamanan bersama.",
      
      sop_alert_title: "Kebijakan &amp; Diskresi Keselamatan River Guide",
      sop_alert_desc: "Instruktur dan river guide kami memiliki wewenang penuh untuk menyesuaikan rute, menunda trip, atau membatalkan keikutsertaan peserta yang tidak memenuhi SOP demi keselamatan bersama. Keputusan river guide bersifat mutlak demi proteksi seluruh peserta.",
      sop_consult_btn: '<i class="fa-brands fa-whatsapp"></i> Konsultasi Safety',

      // Gallery
      gal_eyebrow: "Dokumentasi Wisata",
      gal_title: "Galeri Foto &amp; Momen Seru",
      gal_desc: "Dokumentasi keceriaan dan keindahan panorama alam di sepanjang rute Packrafting Canden.",
      gal_more_btn: '<i class="fa-solid fa-images"></i> Lihat Semua Foto Galeri &rarr;',
      gal_filter_all: "Semua",
      gal_filter_act: "Aktivitas",
      gal_filter_scenery: "Pemandangan",
      gal_filter_comm: "Komunitas",
      gal_filter_prep: "Persiapan",
      gal_filter_family: "Keluarga",

      // Video
      video_eyebrow: "Video Petualangan",
      video_title: "Keseruan di Atas Sungai",
      video_desc: "Cuplikan keseruan dan keasrian alam saat mendayung packraft di Sungai Opak.",
      video_play_label: '<i class="fa-solid fa-circle-play" style="color:var(--accent);margin-right:0.4rem;"></i> Tonton Video Petualangan Packrafting Canden',

      // Location & Maps
      loc_eyebrow: "Panduan Rute &amp; Peta",
      loc_title: "Rute Susur Sungai &amp; Titik Kumpul",
      loc_desc: "Jalur pengarungan air sepanjang 4,5 km (durasi ± 1,5 jam) dari Starting Point Canden menuju Finish di Wisata Potrobayan.",
      loc_start_badge: "TITIK START &amp; MEETING POINT",
      loc_start_desc: "Lokasi titik kumpul, registrasi, safety briefing, dan awal keberangkatan perahu packraft di Desa Canden, Jetis, Bantul.",
      loc_start_btn: '<i class="fa-solid fa-location-dot"></i> Buka Google Maps Titik Start',
      loc_rest_badge: "TITIK REST AREA &amp; OUTBOUND",
      loc_rest_desc: "Spot istirahat di pertengahan rute pengarungan susur sungai, rehat sejenak, menikmati kelapa muda segar, dan area outbound alam terbuka tepi kali.",
      loc_rest_btn: '<i class="fa-solid fa-location-dot"></i> Buka Google Maps Rest Area',
      loc_finish_badge: "TITIK FINISH &amp; BILAS",
      loc_finish_desc: "Titik akhir pendaratan di pertemuan Sungai Opak &amp; Oya, area bilas bersih, dokumentasi, dan penjemputan kembali.",
      loc_finish_btn: '<i class="fa-solid fa-location-dot"></i> Buka Google Maps Titik Finish',
      loc_hours_label: "Jam Operasional:",
      loc_hours_val: "Setiap Hari: 07.30 – 16.30 WIB",
      loc_basecamp_label: "Basecamp:",
      loc_basecamp_val: "Toilet, Kamar Mandi Bilas, Tempat Ganti, Mushola, Gazebo, Loker",
      loc_surround_label: "Fasilitas Sekitar:",
      loc_surround_val: "Area Parkir Luas &amp; Aman, Warung Makan Tradisional, Spot Foto Alami Tepi Sungai.",
      loc_access_label: "Akses Jalan:",
      loc_access_val: "Dapat diakses dengan mobil, motor, maupun bus pariwisata.",
      loc_transport_banner: '<i class="fa-solid fa-van-shuttle" style="margin-right:0.4rem;"></i> <strong>Fasilitas Transportasi:</strong> Disediakan kendaraan penjemputan dari titik finish Potrobayan kembali ke starting point Canden.',
      loc_metrics_river_sub: "Alur Alami Bantul",
      loc_metrics_dist_sub: "Jarak Pengarungan",
      loc_metrics_dur_sub: "Durasi Rata-rata",
      loc_metrics_grade_sub: "Aman &amp; Ramah Pemula",
      loc_3points_title: '<i class="fa-solid fa-map-location-dot" style="color:#0891b2;margin-right:0.4rem;"></i> 3 Titik Kunci Pengarungan',
      loc_step1_badge: "1. START",
      loc_step1_title: "Starting Point Canden",
      loc_step1_desc: "Meeting point &amp; briefing",
      loc_step2_badge: "2. REST AREA",
      loc_step2_title: "Rest Area &amp; Outbound",
      loc_step2_desc: "Rehat kelapa muda",
      loc_step3_badge: "3. FINISH",
      loc_step3_title: "Wisata Potrobayan",
      loc_step3_desc: "Bilas &amp; penjemputan",

      // FAQ
      faq_eyebrow: "Bantuan &amp; Panduan",
      faq_title: "Pertanyaan yang Sering Diajukan",
      faq_desc: "Informasi seputar persiapan, kriteria peserta, dan standar keselamatan susur sungai.",
      faq_q1: "Di mana lokasi titik kumpul (meeting point) dan start finish?",
      faq_a1: 'Tersedia <strong>5 pilihan Meeting Point</strong> resmi:<br>&bull; Rumah Makan Kongkow<br>&bull; Rumah Makan Kopi Klotok Paris<br>&bull; Rumah Makan Paon Darmo<br>&bull; Kantor BUMKal Candi Arta Kalurahan Canden<br>&bull; Basecamp Packrafting Canden<br><em>(Titik kumpul yang dipilih akan diinformasikan dan dikonfirmasi lebih lanjut oleh admin saat reservasi)</em>.<br><br>Pengarungan dimulai dari <strong>Starting Point Sungai Opak Canden</strong> dan berakhir di <strong>Wisata Potrobayan</strong> (disediakan transportasi lokal penjemputan kembali ke start).',
      faq_q2: "Berapa jarak dan durasi rute susur sungai?",
      faq_a2: 'Rute pengarungan menyusuri Sungai Opak Canden menempuh jarak <strong>4,5 kilometer</strong> dengan durasi pengarungan sekitar <strong>1,5 jam</strong>. Arus air aman namun cukup memacu adrenalin dengan pemandangan pedesaan asri dan menyejukkan pikiran.',
      faq_q3: "Apakah pemula boleh ikut packrafting?",
      faq_a3: 'Tentu saja! Aktivitas Packrafting Canden dirancang sangat ramah untuk pemula. Sebelum turun ke sungai, tim instruktur kami akan memberikan safety briefing serta latihan dasar mendayung dan mengendalikan perahu.',
      faq_q4: "Apakah peserta harus bisa berenang?",
      faq_a4: 'Tidak wajib. Seluruh peserta diwajibkan menggunakan rompi pelampung (life jacket) berdaya apung tinggi berstandar keselamatan dan selalu didampingi oleh river guide selama berada di air.',
      faq_q5: "Berapa minimal usia peserta yang diperbolehkan?",
      faq_a5: 'Sesuai ketentuan, kapasitas perahu adalah 1 orang dewasa. Batas usia minimal mengayuh mandiri adalah <strong>12 tahun</strong>. Bagi anak-anak (usia minimal <strong>7 tahun</strong> sesuai SOP APD), dapat melakukan <strong>tandem</strong> dalam satu perahu dengan pendampingan orang tua.',
      faq_q6: "Apa saja yang harus dibawa peserta?",
      faq_a6: 'Bawalah pakaian ganti lengkap siap basah, sandal gunung / sepatu air yang mengikat kuat di kaki (sesuai SOP APD), kantong waterproof jika membawa smartphone, serta perlengkapan mandi pribadi.',
      faq_q7: "Apa saja SOP keselamatan &amp; syarat kesehatan yang wajib dipatuhi?",
      faq_a7: 'Setiap peserta wajib mematuhi 8 Standar Operasional Prosedur (SOP) keselamatan Packrafting Canden yang telah dijelaskan di bagian atas (menggunakan APD resmi, sehat jasmani, bebas zat adiktif/rokok, dan mematuhi panduan river guide).',

      // Testimonials
      testi_eyebrow: "Ulasan &amp; Rating Wisatawan",
      testi_title: "Kesan &amp; Cerita Wisatawan",
      testi_desc: "Ulasan jujur dari wisatawan yang telah merasakan sensasi petualangan Packrafting di Sungai Opak Canden.",
      testi_badge_reviews: "&bull; 85+ Ulasan Google Terverifikasi",
      testi_btn_rate: '<i class="fa-brands fa-google"></i> Beri Rating Google',
      testi_swipe_hint: '<i class="fa-solid fa-arrows-left-right"></i> Geser / swipe ke kanan &amp; kiri untuk melihat ulasan lainnya',
      testi_form_banner_title: "Beri Rating dengan Akun Google",
      testi_form_banner_desc: "Ulasan Anda akan tampil dengan foto profil &amp; badge Google Terverifikasi",
      testi_form_title: "Tulis Ulasan &amp; Rating Anda",
      testi_form_sub: "Bagikan kesan dan cerita petualangan Anda menyusuri Sungai Opak bersama kami.",
      testi_form_star_label: "Rating Pengalaman Anda",
      testi_form_review_label: "Ulasan &amp; Kesan Pengalaman",
      testi_form_placeholder: "Ceritakan bagaimana keseruan jeram, keramahan pemandu, pemandangan, atau suasana asri Sungai Opak Canden...",
      testi_form_submit: '<i class="fa-brands fa-google"></i> Kirim Ulasan dengan Akun Google',
      testi_form_cancel: "Batal",

      // Booking
      book_eyebrow: '<i class="fa-solid fa-calendar-check"></i> Reservasi &amp; Cara Booking',
      book_title: "Cara Mudah Reservasi Trip",
      book_desc: "Hanya 3 langkah praktis untuk mengamankan jadwal petualangan susur sungai Anda di Sungai Opak!",
      book_step1_title: "Hubungi Admin",
      book_step1_desc: "Hubungi WhatsApp Admin untuk konfirmasi tanggal, paket, &amp; kuota perahu.",
      book_step2_title: "Pembayaran DP 50%",
      book_step2_desc: "Lakukan pembayaran DP 50% per paket untuk mengunci jadwal pengarungan Anda.",
      book_step3_title: "Pelunasan Maks. H-1",
      book_step3_desc: "Pelunasan dilakukan maksimal <strong>H-1 kegiatan</strong> sebelum river guide menyambut di meeting point.",
      book_quote: "&ldquo;Ciptakan Kenangan Tak Terlupakan Bersama Kami di Sungai Opak Canden!&rdquo;",
      book_quote_sub: "Cocok untuk Anda yang sedang berlibur di Jogja bersama pasangan, teman, keluarga, ataupun tim kerja.",
      book_wa_btn_text: '<i class="fa-brands fa-whatsapp"></i> Chat WhatsApp: <span data-display-wa>0812 6009 2044</span>',
      book_insurance_pill: '<i class="fa-solid fa-shield-halved"></i> Terlindungi Asuransi &amp; SOP Resmi',
      book_sop_note: "Setiap peserta terlindungi asuransi resmi &amp; wajib mematuhi 8 SOP Keselamatan Packrafting Canden.",

      // Footer
      footer_support_title: "Didukung Oleh",
      footer_desc: "Destinasi wisata petualangan susur Sungai Opak dengan konsep Wellness Tourism pertama di Yogyakarta dari Starting Point Canden (Jetis) menuju Finish di Wisata Potrobayan, Bantul.",
      footer_route_tag: "Rute Pengarungan Sungai Opak 4,5 km &bull; Canden ke Potrobayan",
      footer_nav_title: "Lokasi &amp; Peta",
      footer_contact_title: "Hubungi Kami",
      footer_address: "Starting Point Susur Sungai Opak, Canden, Bantul",
      footer_rights: "&copy; 2026 Packrafting Canden. All Rights Reserved.",
      footer_bottom_route: "Rute Susur Sungai Opak: Canden &rarr; Wisata Potrobayan, Bantul.",

      // Floating WA
      float_wa_text: "Booking via WhatsApp",

      // Subpages (galeri.html & kontak.html)
      sub_galeri_title: "GALERI PETUALANGAN",
      sub_galeri_desc: "Saksikan keceriaan, keindahan alam, dan adrenalin menyusuri sungai di Desa Canden.",
      sub_kontak_badge: "Rute Sungai &amp; Reservasi",
      sub_kontak_title: "LOKASI &amp; TITIK KUMPUL",
      sub_kontak_desc: "Rute pengarungan Sungai Opak dari Starting Point Canden hingga finish di Wisata Potrobayan."
    },

    // ==========================================
    // ENGLISH (EN)
    // ==========================================
    en: {
      // Document
      page_title: "Packrafting Canden | Opak River Adventure Yogyakarta",
      page_meta_desc: "Experience premier packrafting and wellness tourism on the Opak River from Canden Starting Point to Potrobayan, Bantul, Yogyakarta.",

      // Navbar
      nav_home: "Home",
      nav_about: "About",
      nav_packages: "Packages",
      nav_experience: "Experience",
      nav_safety: "SOP & Safety",
      nav_gallery: "Gallery",
      nav_location: "Route & Map",
      nav_faq: "FAQ",
      nav_toggle_menu: "Toggle Menu",

      // Hero
      hero_location: '<i class="fa-solid fa-route text-accent"></i> Opak River Route &bull; 4.5 KM (± 1.5 Hours) &bull; Canden &rarr; Potrobayan Tourism',
      hero_title: 'PACKRAFTING <span>CANDEN</span>',
      hero_sub: "Adventure on the River",
      hero_lead: "Feel the thrilling rush of paddling along the scenic Opak River from Canden Starting Point to Potrobayan. An exhilarating, natural, and unforgettable water adventure!",
      hero_cta: '<i class="fa-solid fa-compass"></i> Explore Tour Packages',
      hero_scroll: "Scroll Down",

      // About
      about_eyebrow: "The Charm of Canden Tourism Village",
      about_title: "ADVENTURE, WELLNESS &amp; LOCAL WISDOM",
      about_sub: "The First Packrafting Experience in Yogyakarta Wrapped in Rural Serenity",
      about_p1: "<strong>Packrafting Canden</strong> seamlessly blends open-air river paddling adventure with the genuine warmth of Canden Village, Bantul. Perfect for families, communities, and travel groups seeking a refreshing, healthy, and delightful Yogyakarta getaway.",
      about_p2: "Paddling along the clear currents of Opak River for <strong>4.5 km over ± 1.5 hours</strong>, you will enjoy lush canopy trees, natural riverbank cliffs, and authentic traditional herbal wellness drinks (jamu) native to Canden.",
      about_badge_km: "4.5 KM",
      about_badge_duration: "Duration ± 1.5 Hours",
      about_manager_title: "Tourism Awareness Group &amp; River Management of Canden",
      about_manager_desc: "Official management of Packrafting water adventure tourism on the Opak River, Canden Village, Jetis, Bantul Regency. Certified local river guides are dedicated to ensuring a safe, exciting journey.",
      about_manager_cert: "Supervised by Bantul Tourism Office &amp; Canden Village Government — Certified River Guides &amp; Safety Standards.",
      about_btn: 'Choose Tour Package <i class="fa-solid fa-arrow-right"></i>',

      // Why Us
      why_eyebrow: "Memorable Experiences",
      why_title: "Why Choose Packrafting Canden?",
      why_desc: "An authentic river paddling experience in Canden Village that is safe, rejuvenating, and embraced by heartwarming local hospitality.",
      why_1_title: "Natural River Adventure",
      why_1_desc: "Navigate the beginner-friendly yet thrilling currents of Opak River on highly stable, modern packraft boats.",
      why_2_title: "Certified Safety Standards",
      why_2_desc: "Full certified protective equipment (helmets, high-buoyancy vests, paddles) with river guide and dedicated rescue backup.",
      why_3_title: "Village Wellness &amp; Jamu",
      why_3_desc: "Authentic herbal wellness drinks (jamu) from Canden Village and fresh young coconut to revitalize your energy after paddling.",
      why_4_title: "Scenic Potrobayan Finish",
      why_4_desc: "Spectacular landing at the scenic confluence of the Opak and Oya Rivers with panoramic valley vistas.",

      // Packages
      pkg_eyebrow: "Trip Options",
      pkg_title: "TOUR PACKAGES",
      pkg_desc: "Enjoy the sensation of paddling on the Opak River with complete amenities, friendly certified guides, village cuisine, and official insurance protection.",
      pkg_ribbon_fav: "Most Popular",
      pkg_ribbon_meal: "Complete + Meals",
      pkg_1_title: "PACKAGE 1 &mdash; ADVENTURE",
      pkg_1_sub: "River Paddling Sensation + Traditional Herbal Drink / Fresh Coconut",
      pkg_unit: "/ person",
      pkg_duration_label: "Trip Duration",
      pkg_duration_val: "± 1.5 Hours (4.5 km)",
      pkg_boat_label: "Boat Capacity",
      pkg_boat_val: "1 Person / Packraft",
      pkg_features_title: "Included Amenities:",
      pkg_f_gear: "Complete Packrafting Kit (Helmet, Life Jacket, Paddle)",
      pkg_f_transport: "Local Return Shuttle Transport (Finish point back to Start)",
      pkg_f_guide: "Professional Certified River Guides",
      pkg_f_rescue: "Dedicated River Rescue Team on Standby",
      pkg_f_snack: "Traditional Canden Village Snacks",
      pkg_f_drink: "Welcome Drink: <strong>Traditional Herbal Drink</strong> or <strong>Fresh Young Coconut</strong>",
      pkg_f_insurance: "Official Insurance Coverage",
      pkg_btn_1: '<i class="fa-brands fa-whatsapp"></i> Book Package 1',

      pkg_2_title: "PACKAGE 2 &mdash; COMPLETE",
      pkg_2_sub: "Complete Paddling + Traditional Village Buffet Lunch",
      pkg_f_all_pkg1: "<strong>All Package 1 amenities included</strong>",
      pkg_f_buffet: "<strong>Authentic Canden Village Buffet Lunch</strong>",
      pkg_f_transport_start_finish: "Local Shuttle Transport between Start &amp; Finish",
      pkg_btn_2: '<i class="fa-brands fa-whatsapp"></i> Book Package 2',

      // Addons & Info
      addons_eyebrow: '<i class="fa-solid fa-camera"></i> Documentation Services',
      addons_title: "Optional Add-on Facilities",
      addons_desc: "Capture your unforgettable adventure with professional photography and cinematic aerial drone video documentation.",
      addon_card1_title: "Standard Photography",
      addon_card1_sub: "Crisp and vibrant river paddling action photos",
      addon_item_camera: '<i class="fa-solid fa-camera text-accent"></i> Standard Action Camera',
      addon_item_iphone: '<i class="fa-brands fa-apple text-accent"></i> iPhone Photography + Color Grading',
      addon_item_dslr: '<i class="fa-solid fa-camera-rotate text-accent"></i> DSLR / Mirrorless Camera + Editing',
      addon_card2_title: "Cinematic Aerial Drone",
      addon_card2_sub: "Breathtaking aerial 4K video capturing nature from above",
      addon_item_drone: '<i class="fa-solid fa-film text-accent"></i> Cinematic Drone Video (Full HD / 4K)',
      addon_note: '<i class="fa-solid fa-circle-info text-accent"></i> Documentation packages can be customized based on group requirements and weather conditions.',
      
      info_title: "Additional Information &amp; Regulations",
      info_cap: "Boat Capacity:",
      info_cap_val: "1 Adult per packraft boat for maximum maneuverability and safety.",
      info_tandem: "Tandem for Children:",
      info_tandem_val: "Children aged 7+ can ride tandem in one boat with a parent/guardian.",
      info_age: "Minimum Age Limit:",
      info_age_val: "12 years old for solo paddling (good physical condition required).",
      info_route: "Route &amp; Duration:",
      info_route_val: "River course length ± 4.5 KM with an average duration of ± 1.5 hours.",
      meeting_points_title: '<i class="fa-solid fa-location-dot text-accent"></i> 5 Official Meeting Point Options:',
      meeting_points_desc: "Meeting points are flexible and will be coordinated directly by our admin team:",
      meeting_pt_1: "1. Kongkow Restaurant",
      meeting_pt_2: "2. Kopi Klotok Paris Restaurant",
      meeting_pt_3: "3. Paon Darmo Restaurant",
      meeting_pt_4: "4. BUMKal Candi Arta Office Canden",
      meeting_pt_5: "5. Packrafting Canden Basecamp",

      // Wellness
      wellness_eyebrow: "Healthy &amp; Mindful Living",
      wellness_title: "WELLNESS TOURISM IN CANDEN VILLAGE",
      wellness_desc: "Harmonizing open-air adventure with physical fitness, peaceful mindfulness, and traditional Indonesian herbal wisdom.",
      wellness_1_title: "Natural Water Fitness",
      wellness_1_desc: "Active paddling exercise that engages your core muscles while revitalizing your body along the soothing Opak River.",
      wellness_2_title: "Authentic Jamu Heritage",
      wellness_2_desc: "Authentic traditional Indonesian herbal concoctions (jamu) or refreshing young coconut to restore inner vitality.",
      wellness_3_title: "Mindful Serenity",
      wellness_3_desc: "Picturesque emerald foliage and natural river cliffs offering peaceful relaxation for both mind and soul.",
      wellness_4_title: "Culture &amp; Local Wisdom",
      wellness_4_desc: "Experience the warm hospitality of Canden villagers and the history of Opak River in an enriching rural setting.",

      // Experience Timeline
      exp_eyebrow: "Adventure Itinerary",
      exp_title: "River Paddling Journey",
      exp_desc: "Step-by-step itinerary from Canden Starting Point to your scenic landing at Potrobayan.",
      exp_step1_title: "MEETING POINT &amp; GATHERING",
      exp_step1_desc: "Arrive at Canden Basecamp / Meeting Point, complete registration, and enjoy a warm welcome from local guides.",
      exp_step2_title: "SAFETY BRIEFING",
      exp_step2_desc: "Certified river guides give comprehensive safety instructions, paddle techniques, and river current simulations.",
      exp_step3_title: "GEAR FITTING &amp; PPE",
      exp_step3_desc: "Fitting of certified helmets, high-buoyancy life jackets, and distribution of standard double-blade paddles.",
      exp_step4_title: "RIVER LAUNCH",
      exp_step4_desc: "Packraft boats launch onto the Opak River! Begin relaxed paddling while adapting to refreshing river waters.",
      exp_step5_title: "FUN RAPIDS &amp; REST AREA",
      exp_step5_desc: "Navigate exciting beginner-friendly rapids, take a break at the Rest Area, and marvel at scenic limestone cliffs.",
      exp_step6_title: "FINISH AT POTROBAYAN",
      exp_step6_desc: "Land at Potrobayan (confluence of Opak &amp; Oya Rivers), fresh shower, photo session, and shuttle ride back.",

      // Safety First & SOP
      sop_eyebrow: "Safety Protocols",
      sop_title: "River Safety Standards &amp; SOP",
      sop_desc: "A truly memorable adventure begins with peace of mind. We enforce <strong>8 Mandatory Standard Operating Procedures (SOP)</strong> for the safety and comfort of all adventurers on the Opak River.",
      sop_p1_title: "Certified Safety Gear",
      sop_p1_desc: "Certified safety helmets &amp; high-buoyancy life vests.",
      sop_p2_title: "Certified River Guides",
      sop_p2_desc: "Experienced river instructors &amp; rescue team.",
      sop_p3_title: "Safety Briefing",
      sop_p3_desc: "Paddle drill &amp; water safety protocols before launch.",
      sop_p4_title: "Real-time Monitoring",
      sop_p4_desc: "Regular river discharge checks and meteorological forecasts.",
      
      sop_tag_wajib: "Mandatory",
      sop_tag_age: "Age Criteria",
      sop_tag_warn: "Advisory",
      sop_tag_health: "Health",
      sop_tag_emergency: "Emergency",
      sop_tag_insurance: "Insurance",
      sop_tag_prohibit: "Strictly Prohibited",
      sop_tag_ban: "Prohibited",

      sop_1_title: "Mandatory Safety Gear",
      sop_1_desc: "All participants <strong>MUST</strong> wear official protective gear: <strong>Safety helmet</strong>, <strong>Life jacket (high buoyancy vest)</strong>, and <strong>water shoes or mountain sandals</strong> firmly strapped during the river activity.",
      sop_2_title: "Minimum Age: 7 Years",
      sop_2_desc: "Participants must be at least <strong>7 years old</strong> in healthy, fit physical condition. Children must be accompanied by a parent or adult guardian.",
      sop_3_title: "Pregnancy Advisory",
      sop_3_desc: "Pregnant women are <strong>advised not to participate</strong> in packrafting to prioritize maternal and fetal health and safety.",
      sop_4_title: "Pre-existing Medical Conditions",
      sop_4_desc: "Participants with chronic conditions such as <strong>epilepsy, severe asthma, or heart disease are NOT PERMITTED</strong> to participate to prevent emergency medical risks in the water.",
      sop_5_title: "Weather &amp; Stoppage Protocol",
      sop_5_desc: "Activities will be immediately <strong>halted or rerouted</strong> in case of extreme weather changes (gale, storms, surge in river discharge) or emergency evacuation situations.",
      sop_6_title: "Retain Ticket for Insurance",
      sop_6_desc: "Visitors <strong>must keep their official ticket</strong> as valid proof of participation to facilitate <strong>insurance claim</strong> processing if needed.",
      sop_7_title: "Zero Alcohol &amp; Drugs Policy",
      sop_7_desc: "Participants <strong>MUST NOT</strong> engage in activities under the influence of alcohol, narcotics, or dangerous illegal substances.",
      sop_8_title: "No Smoking Allowed",
      sop_8_desc: "<strong>Smoking is strictly prohibited</strong> (both tobacco and e-cigarettes/vapes) throughout the entire river trip for safety and mutual comfort.",
      
      sop_alert_title: "River Guide Safety Authority &amp; Discretion",
      sop_alert_desc: "Our instructors and river guides hold full discretion to adapt routes, postpone trips, or cancel participation of anyone not complying with SOPs. Guide safety decisions are final.",
      sop_consult_btn: '<i class="fa-brands fa-whatsapp"></i> Safety Consultation',

      // Gallery
      gal_eyebrow: "Tour Documentation",
      gal_title: "Photo Gallery &amp; Exciting Moments",
      gal_desc: "Capturing joyful moments and breathtaking natural panoramas along the Packrafting Canden route.",
      gal_more_btn: '<i class="fa-solid fa-images"></i> View All Gallery Photos &rarr;',
      gal_filter_all: "All",
      gal_filter_act: "Activities",
      gal_filter_scenery: "Scenery",
      gal_filter_comm: "Community",
      gal_filter_prep: "Preparation",
      gal_filter_family: "Family",

      // Video
      video_eyebrow: "Adventure Video",
      video_title: "Excitement on the River",
      video_desc: "Experience the excitement and pure river nature while packrafting along the Opak River.",
      video_play_label: '<i class="fa-solid fa-circle-play" style="color:var(--accent);margin-right:0.4rem;"></i> Watch Packrafting Canden Adventure Video',

      // Location & Maps
      loc_eyebrow: "Route Guide &amp; Maps",
      loc_title: "River Route &amp; Meeting Points",
      loc_desc: "4.5 km river journey (± 1.5 hours duration) from Canden Starting Point to Finish at Potrobayan Tourism.",
      loc_start_badge: "STARTING POINT &amp; GATHERING",
      loc_start_desc: "Official gathering spot, registration, safety briefing, and launch site in Canden Village, Jetis, Bantul.",
      loc_start_btn: '<i class="fa-solid fa-location-dot"></i> Open Start Point on Google Maps',
      loc_rest_badge: "REST AREA &amp; OUTBOUND POINT",
      loc_rest_desc: "Mid-way rest stop on the river route to relax, enjoy fresh young coconut, and experience the riverside outdoor area.",
      loc_rest_btn: '<i class="fa-solid fa-location-dot"></i> Open Rest Area on Google Maps',
      loc_finish_badge: "FINISH &amp; SHOWER POINT",
      loc_finish_desc: "Final landing point at the confluence of Opak &amp; Oya Rivers, fresh showers, photos, and return shuttle pickup.",
      loc_finish_btn: '<i class="fa-solid fa-location-dot"></i> Open Finish Point on Google Maps',
      loc_hours_label: "Operating Hours:",
      loc_hours_val: "Daily: 07:30 AM – 04:30 PM (UTC+7)",
      loc_basecamp_label: "Basecamp Amenities:",
      loc_basecamp_val: "Restrooms, Fresh Showers, Changing Rooms, Prayer Room (Mushola), Gazebos, Lockers",
      loc_surround_label: "Surrounding Amenities:",
      loc_surround_val: "Spacious &amp; Secure Parking, Traditional Food Stalls, Scenic Riverside Photo Spots.",
      loc_access_label: "Road Access:",
      loc_access_val: "Easily accessible by car, motorcycle, and tourist buses.",
      loc_transport_banner: '<i class="fa-solid fa-van-shuttle" style="margin-right:0.4rem;"></i> <strong>Transport Service:</strong> Return shuttle pickup service provided from Potrobayan finish point back to Canden starting point.',
      loc_metrics_river_sub: "Scenic Bantul River",
      loc_metrics_dist_sub: "Route Distance",
      loc_metrics_dur_sub: "Average Duration",
      loc_metrics_grade_sub: "Safe &amp; Beginner Friendly",
      loc_3points_title: '<i class="fa-solid fa-map-location-dot" style="color:#0891b2;margin-right:0.4rem;"></i> 3 Key River Landmarks',
      loc_step1_badge: "1. START",
      loc_step1_title: "Starting Point Canden",
      loc_step1_desc: "Meeting point &amp; briefing",
      loc_step2_badge: "2. REST AREA",
      loc_step2_title: "Rest Area &amp; Outbound",
      loc_step2_desc: "Fresh coconut break",
      loc_step3_badge: "3. FINISH",
      loc_step3_title: "Potrobayan Tourism",
      loc_step3_desc: "Shower &amp; pickup",

      // FAQ
      faq_eyebrow: "Help &amp; Guidelines",
      faq_title: "Frequently Asked Questions",
      faq_desc: "Everything you need to know about preparation, participant criteria, and river safety.",
      faq_q1: "Where are the meeting point and start/finish locations?",
      faq_a1: 'There are <strong>5 official Meeting Points</strong> available:<br>&bull; Kongkow Restaurant<br>&bull; Kopi Klotok Paris Restaurant<br>&bull; Paon Darmo Restaurant<br>&bull; BUMKal Candi Arta Office Canden<br>&bull; Packrafting Canden Basecamp<br><em>(Your selected meeting point will be confirmed directly by admin upon booking)</em>.<br><br>The river journey starts at <strong>Opak River Canden Starting Point</strong> and concludes at <strong>Potrobayan Tourism</strong> (with return shuttle transport back to starting point).',
      faq_q2: "What is the distance and duration of the river trip?",
      faq_a2: 'The Opak River Canden route covers <strong>4.5 kilometers</strong> with an approximate paddling duration of <strong>1.5 hours</strong>. The water flow is beginner-friendly yet pleasantly thrilling, accompanied by lush rural scenery.',
      faq_q3: "Can beginners join packrafting?",
      faq_a3: 'Absolutely! Packrafting Canden is specially designed to be beginner-friendly. Our certified instructor team provides a comprehensive safety briefing and basic paddle practice before launch.',
      faq_q4: "Do participants need to know how to swim?",
      faq_a4: 'Swimming ability is not required. All participants must wear certified high-buoyancy life jackets and are accompanied by professional river guides throughout the entire trip.',
      faq_q5: "What is the minimum age requirement for participants?",
      faq_a5: 'Single packrafts are for 1 adult. The minimum age for solo paddling is <strong>12 years</strong>. Children (minimum <strong>7 years</strong> per safety standards) can ride <strong>tandem</strong> with a parent.',
      faq_q6: "What should participants bring?",
      faq_a6: 'Please bring a change of clothes, strapped water shoes or sport sandals (per safety regulations), a waterproof pouch for phones, and personal shower toiletries.',
      faq_q7: "What safety protocols and health conditions must be observed?",
      faq_a7: 'All participants must comply with our 8 Mandatory Safety Standards (wearing certified PPE, good physical health, zero alcohol/smoking policy, and following river guide instructions).',

      // Testimonials
      testi_eyebrow: "Guest Reviews &amp; Ratings",
      testi_title: "What Adventurers Say",
      testi_desc: "Real experiences shared by adventurers who have explored Packrafting on the Opak River Canden.",
      testi_badge_reviews: "&bull; 85+ Verified Google Reviews",
      testi_btn_rate: '<i class="fa-brands fa-google"></i> Leave a Review',
      testi_swipe_hint: '<i class="fa-solid fa-arrows-left-right"></i> Swipe left &amp; right to see more guest reviews',
      testi_form_banner_title: "Rate with Your Google Account",
      testi_form_banner_desc: "Your review will appear with your Google profile picture &amp; verified badge",
      testi_form_title: "Write Your Review &amp; Rating",
      testi_form_sub: "Share your exciting impressions and river paddling story with us.",
      testi_form_star_label: "Your Experience Rating",
      testi_form_review_label: "Review &amp; Feedback",
      testi_form_placeholder: "Tell us about the thrill of rapids, friendly guides, scenery, and peaceful atmosphere of Opak River Canden...",
      testi_form_submit: '<i class="fa-brands fa-google"></i> Submit Review with Google Account',
      testi_form_cancel: "Cancel",

      // Booking
      book_eyebrow: '<i class="fa-solid fa-calendar-check"></i> Reservations &amp; Booking Guide',
      book_title: "Easy 3-Step Trip Booking",
      book_desc: "Just 3 simple steps to secure your river paddling adventure on the Opak River!",
      book_step1_title: "Contact Admin",
      book_step1_desc: "Contact our WhatsApp Admin to check date availability, package choices, &amp; boat quota.",
      book_step2_title: "50% Deposit Payment",
      book_step2_desc: "Make a 50% deposit payment per package to secure your reserved schedule.",
      book_step3_title: "Final Payment by Day-1",
      book_step3_desc: "Complete payment by <strong>D-1</strong> before your river guides greet you at the meeting point.",
      book_quote: "&ldquo;Create Unforgettable Memories With Us on the Opak River Canden!&rdquo;",
      book_quote_sub: "Perfect for couples, friends, families, or corporate team outings visiting Yogyakarta.",
      book_wa_btn_text: '<i class="fa-brands fa-whatsapp"></i> Chat WhatsApp: <span data-display-wa>0812 6009 2044</span>',
      book_insurance_pill: '<i class="fa-solid fa-shield-halved"></i> Official Insurance &amp; Certified Safety',
      book_sop_note: "Every participant is covered by official insurance and must follow the 8 Safety Protocols of Packrafting Canden.",

      // Footer
      footer_support_title: "Supported By",
      footer_desc: "The premier Wellness Tourism river packrafting destination in Yogyakarta, paddling from Canden Starting Point (Jetis) to Potrobayan Finish Point, Bantul.",
      footer_route_tag: "Opak River Paddling Route 4.5 km &bull; Canden to Potrobayan",
      footer_nav_title: "Location &amp; Maps",
      footer_contact_title: "Contact Us",
      footer_address: "Opak River Starting Point, Canden, Bantul, Yogyakarta",
      footer_rights: "&copy; 2026 Packrafting Canden. All Rights Reserved.",
      footer_bottom_route: "Opak River Route: Canden &rarr; Potrobayan Tourism, Bantul.",

      // Floating WA
      float_wa_text: "Book via WhatsApp",

      // Subpages (galeri.html & kontak.html)
      sub_galeri_title: "ADVENTURE GALLERY",
      sub_galeri_desc: "Witness the joy, natural beauty, and adrenaline of river paddling in Canden Village.",
      sub_kontak_badge: "River Route &amp; Booking",
      sub_kontak_title: "LOCATION &amp; MEETING POINTS",
      sub_kontak_desc: "Opak River route from Canden Starting Point to Finish at Potrobayan Tourism."
    }
  };

  const I18n = {
    currentLang: DEFAULT_LANG,

    init() {
      // 1. Get saved language or fallback to default
      let saved = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch (e) {}

      if (!saved || (saved !== 'id' && saved !== 'en')) {
        saved = DEFAULT_LANG;
      }

      this.currentLang = saved;
      this.applyTranslations(this.currentLang);
      this.setupSwitcherListeners();
    },

    getLanguage() {
      return this.currentLang;
    },

    setLanguage(lang) {
      if (lang !== 'id' && lang !== 'en') return;
      this.currentLang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {}

      this.applyTranslations(lang);

      // Dispatch global event for other components (maps, testimonials, booking URL)
      window.dispatchEvent(new CustomEvent('packraft_lang_changed', { detail: { lang } }));
    },

    t(key, fallback = '') {
      const dict = translations[this.currentLang] || translations.id;
      return dict[key] !== undefined ? dict[key] : (fallback || key);
    },

    applyTranslations(lang) {
      const dict = translations[lang] || translations.id;

      // Update html lang attribute
      document.documentElement.lang = lang;

      // Update Page Title if translation exists
      if (dict.page_title && window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        document.title = dict.page_title;
      }

      // Update text elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined) {
          el.textContent = dict[key];
        }
      });

      // Update HTML elements with data-i18n-html
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (dict[key] !== undefined) {
          el.innerHTML = dict[key];
        }
      });

      // Update Placeholders with data-i18n-placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key] !== undefined) {
          el.placeholder = dict[key];
        }
      });

      // Update Titles with data-i18n-title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (dict[key] !== undefined) {
          el.title = dict[key];
        }
      });

      // Update Aria Labels with data-i18n-aria
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (dict[key] !== undefined) {
          el.setAttribute('aria-label', dict[key]);
        }
      });

      // Update Switcher Active States
      document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        }
      });

      // Update WhatsApp booking links if DataStore is present
      if (typeof window.DataStore !== 'undefined' && typeof window.DataStore.getBookingWhatsAppUrl === 'function') {
        const waUrl = window.DataStore.getBookingWhatsAppUrl('');
        document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
          const pkg = el.getAttribute('data-booking-wa');
          if (pkg) {
            el.href = window.DataStore.getBookingWhatsAppUrl(pkg, lang);
          } else if (el.id === 'float-wa-btn' || el.id === 'cta-bottom-booking-btn' || el.hasAttribute('data-social-wa')) {
            el.href = waUrl;
          }
        });
      }
    },

    setupSwitcherListeners() {
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetLang = btn.getAttribute('data-lang');
          if (targetLang && targetLang !== this.currentLang) {
            this.setLanguage(targetLang);
          }
        });
      });
    }
  };

  // Expose to window
  window.I18n = I18n;

  // Initialize on script load or DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18n.init());
  } else {
    I18n.init();
  }

})(window, document);

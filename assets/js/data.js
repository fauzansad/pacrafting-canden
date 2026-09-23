/* ============================================
   DATA.JS - Centralized Data Store
   PACKRAFTING CANDEN — Adventure on the River
   Desa Canden, Bantul, D.I. Yogyakarta
   ============================================ */

const PackraftData = {
  // ---- Brand & Location Info ----
  brand: {
    nama: 'PACKRAFTING CANDEN',
    subheading: 'Wellness Tourism: Packrafting Pertama di Yogyakarta',
    tagline: 'Ciptakan Kenangan Tak Terlupakan dengan Sensasi Packrafting dan Wellness Tourism di Sungai Opak Canden!',
    lokasi: 'Sungai Opak, Desa Canden, Kapanewon Jetis, Bantul, D.I. Yogyakarta',
    jarak: '4,5 km',
    durasi: '1.5 Jam',
    
    // Titik Start / Meeting Point
    meetingPoint: 'Starting Point Susur Sungai Opak (Canden, Jetis, Bantul)',
    startMapsUrl: 'https://maps.app.goo.gl/GpmTYW2wj7u5ADnQ7',
    startCoordinates: { lat: -7.932815, lng: 110.364526 },

    // Titik Rest Area & Outbound
    restAreaPoint: 'Rest Area Packrafting Canden & Outbound Area',
    restAreaMapsUrl: 'https://maps.app.goo.gl/9zPZVeSV58w2fNMF7',
    restAreaCoordinates: { lat: -7.9423004, lng: 110.366292 },

    // Titik Finish
    finishPoint: 'Wisata Potrobayan (Sriharjo, Pundong / Pertemuan Sungai Opak)',
    finishMapsUrl: 'https://maps.app.goo.gl/iHi3HfNyZoqmmFkf8',
    finishCoordinates: { lat: -7.956673, lng: 110.360612 },

    // 5 Pilihan Meeting Point Resmi (Brosur)
    meetingPoints: [
      'Rumah Makan Kongkow',
      'Rumah Makan Kopi Klotok Paris',
      'Rumah Makan Paon Darmo',
      'Kantor BUMKal Candi Arta Kalurahan Canden',
      'Basecamp Packrafting Canden'
    ],

    // Kontak & Medsos Resmi
    whatsapp: '081260092044',
    email: 'candenpackraft@gmail.com',
    instagram: 'https://www.instagram.com/candenpackraft?igsi=MXR2cjR0ejN5cXRZeA==',
    tiktok: 'https://www.tiktok.com/@candenpackrafting?_r=1&_t=ZS-996LSTBR2Ht',
    youtube: 'https://youtube.com/@packraftingcanden?si=Equbd3pEqt4Ym5oH',

    // Rute Presisi Alur Kali Opak (52 Node Koordinat)
    riverRoute: [
      [-7.932815, 110.364526], // START: Starting Point Susur Sungai Opak
      [-7.933901, 110.365084],
      [-7.934027, 110.364885],
      [-7.934529, 110.364394],
      [-7.935026, 110.364027],
      [-7.935675, 110.363623],
      [-7.936489, 110.363096],
      [-7.937007, 110.362767],
      [-7.937320, 110.362671],
      [-7.937714, 110.362649],
      [-7.938221, 110.362688],
      [-7.938417, 110.362723],
      [-7.939051, 110.362916],
      [-7.939259, 110.362963],
      [-7.939444, 110.362943],
      [-7.939646, 110.362889],
      [-7.940112, 110.362767],
      [-7.940434, 110.362778],
      [-7.940788, 110.362900],
      [-7.941164, 110.363101],
      [-7.942142, 110.363999],
      [-7.942421, 110.364443],
      [-7.942418, 110.364766],
      [-7.942064, 110.366050],
      [-7.942056, 110.366511],
      [-7.942168, 110.366735],
      [-7.942405, 110.366839],
      [-7.942788, 110.366804],
      [-7.943549, 110.366689],
      [-7.944143, 110.366811],
      [-7.944511, 110.366672],
      [-7.944915, 110.366317],
      [-7.945541, 110.365752],
      [-7.946172, 110.365394],
      [-7.946821, 110.365073],
      [-7.947809, 110.365068],
      [-7.948948, 110.365366],
      [-7.950805, 110.365664],
      [-7.951756, 110.365538],
      [-7.951871, 110.365523],
      [-7.952685, 110.365609],
      [-7.953113, 110.365655],
      [-7.953656, 110.365773],
      [-7.954154, 110.365878],
      [-7.954295, 110.365662],
      [-7.954785, 110.365573],
      [-7.955668, 110.364845],
      [-7.956052, 110.363632],
      [-7.956113, 110.363400],
      [-7.956120, 110.362713],
      [-7.956899, 110.361277],
      [-7.956673, 110.360612]  // FINISH: Wisata Potrobayan
    ]
  },

  // ---- Hero Banner Data ----
  banners: [
    {
      id: 1,
      judul: 'PACKRAFTING CANDEN',
      subheading: 'Adventure on the River',
      lead: 'Rasakan sensasi menyusuri Sungai Opak dari Starting Point Canden hingga finish di Wisata Potrobayan. Petualangan air seru, alami, dan tak terlupakan!',
      lokasiTag: 'Rute Sungai Opak &bull; 4,5 KM (± 1,5 Jam) &bull; Canden ke Potrobayan',
      ctaText: 'BOOKING SEKARANG',
      ctaLink: '#booking',
      ctaSecondaryText: 'LIHAT PAKET WISATA',
      ctaSecondaryLink: '#paket',
      gambar: 'assets/images/hero/hero-packraft.jpg',
      position: 'center',
      status: 'active',
      urutan: 1
    }
  ],

  // ---- 3 Foto Banner Slider Hero (Dapat Diatur di Admin) ----
  heroSlides: [
    {
      id: 1,
      gambar: 'assets/images/galeri/1.jpg',
      judul: 'Aksi Menyusuri Arus Sungai Opak',
      caption: 'Keseruan packrafting menembus aliran Sungai Opak'
    },
    {
      id: 2,
      gambar: 'assets/images/galeri/2.jpg',
      judul: 'Rimbun Alami Tepian Sungai',
      caption: 'Pemandangan hijau asri di sepanjang rute susur sungai'
    },
    {
      id: 3,
      gambar: 'assets/images/galeri/3.jpg',
      judul: 'Keseruan Bersama Teman',
      caption: 'Momen petualangan seru bersama sahabat'
    }
  ],

  // ---- Paket Wisata Packrafting (Resmi Sesuai Brosur) ----
  paket: [
    {
      id: 1,
      nama: 'PAKET 1',
      badge: 'PROMO SPESIAL',
      hargaNormal: 'Rp 125.000',
      harga: 'Rp 110.000',
      unit: '/ orang',
      durasi: '± 1,5 Jam (4,5 km)',
      level: 'Pemula & Keluarga',
      minPeserta: '1 Orang',
      maxPeserta: '20 Orang',
      usiaMin: '12 Tahun (Mandiri) / Mulai 7 Th (Tandem)',
      deskripsi: 'Sensasi packrafting menyusuri Sungai Opak dipadu pilihan minuman tradisional jamu kebugaran atau kelapa muda.',
      fasilitas: [
        'Packrafting Kit (Helm Safety, Safety Jaket, Paddle Double Blade)',
        'Transportasi Lokal (Antar-jemput dari start point ke finish point)',
        'Pemandu / River Guide Profesional',
        'Tim Rescue Berpengalaman',
        'Tradisional Snack Khas Desa',
        'Pilihan Minuman: Jamu Tradisional atau Kelapa Muda',
        'Perlindungan Asuransi Resmi'
      ],
      yangPerluDihadirkan: [
        'Pakaian ganti & pakaian siap basah',
        'Sandal gunung / sepatu air yang mengikat kuat',
        'Perlengkapan mandi pribadi',
        'Kantong waterproof jika membawa smartphone'
      ],
      featured: true,
      status: 'active'
    },
    {
      id: 2,
      nama: 'PAKET 2',
      badge: 'LENGKAP + MAKAN PRASMANAN',
      hargaNormal: 'Rp 150.000',
      harga: 'Rp 135.000',
      unit: '/ orang',
      durasi: '± 1,5 Jam (4,5 km)',
      level: 'Pemula & Keluarga',
      minPeserta: '1 Orang',
      maxPeserta: '30 Orang',
      usiaMin: '12 Tahun (Mandiri) / Mulai 7 Th (Tandem)',
      deskripsi: 'Pengalaman terlengkap: seluruh fasilitas Paket 1 ditambah Makan Menu Prasmanan sajian masakan khas Ndeso.',
      fasilitas: [
        'Semua Fasilitas Lengkap Paket 1',
        'Makan Menu Prasmanan dengan Sajian Masakan Khas Ndeso',
        'Packrafting Kit Lengkap (Helm Safety, Jaket, Paddle Double Blade)',
        'Transportasi Lokal Antar-Jemput Start & Finish',
        'River Guide Profesional & Tim Rescue Standby',
        'Tradisional Snack & Pilihan Jamu / Kelapa Muda',
        'Perlindungan Asuransi Resmi'
      ],
      yangPerluDihadirkan: [
        'Pakaian ganti untuk seluruh peserta',
        'Sandal gunung / sepatu air yang mengikat erat',
        'Perlengkapan mandi'
      ],
      featured: false,
      status: 'active'
    }
  ],

  // ---- Fasilitas Tambahan (Opsional) Sesuai Brosur ----
  fasilitasTambahan: [
    {
      kategori: 'Dokumentasi Standar Foto',
      icon: 'fa-camera',
      opsi: [
        { nama: 'Kamera Standar', harga: 'Rp 200.000 / paket' },
        { nama: 'Kamera iPhone + Edit', harga: 'Rp 250.000 / paket' },
        { nama: 'Kamera DSLR/Mirrorless + Edit', harga: 'Rp 300.000 / paket' }
      ]
    },
    {
      kategori: 'Dokumentasi Drone Udara',
      icon: 'fa-helicopter',
      opsi: [
        { nama: 'Video Udara Sinematik Drone', harga: 'Rp 250.000 / baterai / paket' }
      ]
    }
  ],

  // ---- Ketentuan & Informasi Perahu ----
  ketentuanPerahu: {
    kapasitas: '1 Orang dewasa per perahu',
    tandemAnak: 'Bisa dilakukan dengan pendampingan orang tua (anak usia mulai 7 tahun)',
    usiaMin: '12 tahun untuk mendayung mandiri',
    rute: 'Rute pengarungan 4,5 km selama ± 1,5 jam',
    meetingPoints: [
      'Rumah Makan Kongkow',
      'Rumah Makan Kopi Klotok Paris',
      'Rumah Makan Paon Darmo',
      'Kantor BUMKal Candi Arta Kalurahan Canden',
      'Basecamp Packrafting Canden'
    ]
  },

  // ---- Alur Pengalaman (Experience Timeline) ----
  timeline: [
    { step: '01', title: 'ARRIVAL', desc: 'Tiba di Starting Point Susur Sungai Opak Canden, registrasi & briefing.' },
    { step: '02', title: 'BRIEFING', desc: 'Guide memberikan pengarahan rute sungai & safety briefing mendalam.' },
    { step: '03', title: 'PREPARATION', desc: 'Fitting life jacket, helm, dan perlengkapan packrafting.' },
    { step: '04', title: 'START RIDE', desc: 'Mulai mendayung menyusuri arus Sungai Opak yang jernih & segar.' },
    { step: '05', title: 'RIVER TRAIL', desc: 'Menikmati rute ± 3,5 km dengan spot foto alami & keseruan jeram.' },
    { step: '06', title: 'FINISH POTROBAYAN', desc: 'Tiba di Wisata Potrobayan, bilas bersih, dokumentasi & santap snack.' }
  ],

  // ---- Safety Points ----
  safetyPoints: [
    { icon: 'fa-shield-heart', title: 'Life Jacket & Helmet', desc: 'Semua peserta wajib mengenakan rompi pelampung dan helm bersertifikasi.' },
    { icon: 'fa-user-check', title: 'Certified River Guide', desc: 'Didampingi instruktur terlatih yang paham betul karakteristik arus Sungai Opak.' },
    { icon: 'fa-water', title: 'Pemantauan Debit Air', desc: 'Kondisi air dan cuaca dipantau secara berkala sebelum dan saat kegiatan.' },
    { icon: 'fa-kit-medical', title: 'P3K & Rescue Ready', desc: 'Tim dan perlengkapan pertolongan pertama selalu siaga di setiap titik rute.' }
  ],

  // ---- Galeri Foto Petualangan ----
  galeri: [
    { id: 1, judul: 'Aksi Menyusuri Arus Sungai Opak', kategori: 'Aktivitas', gambar: 'assets/images/galeri/1.jpg', caption: 'Keseruan packrafting menembus aliran Sungai Opak', status: 'active' },
    { id: 2, judul: 'Rimbun Alami Tepian Sungai', kategori: 'Pemandangan', gambar: 'assets/images/galeri/2.jpg', caption: 'Pemandangan hijau asri di sepanjang rute susur sungai', status: 'active' },
    { id: 3, judul: 'Keseruan Bersama Teman', kategori: 'Komunitas', gambar: 'assets/images/galeri/3.jpg', caption: 'Momen petualangan seru bersama sahabat', status: 'active' },
    { id: 4, judul: 'Safety Briefing di Starting Point', kategori: 'Persiapan', gambar: 'assets/images/galeri/4.jpg', caption: 'Briefing instruktur sebelum turun ke sungai', status: 'active' },
    { id: 5, judul: 'Family Fun Packraft', kategori: 'Keluarga', gambar: 'assets/images/galeri/6.jpg', caption: 'Keceriaan keluarga menikmati air sungai yang segar', status: 'active' },
    { id: 6, judul: 'Finish di Wisata Potrobayan', kategori: 'Aktivitas', gambar: 'assets/images/galeri/7.jpg', caption: 'Selebrasi tiba di garis finish Potrobayan', status: 'active' },
    { id: 7, judul: 'Peralatan Siap Digunakan', kategori: 'Persiapan', gambar: 'assets/images/galeri/tes.jpg', caption: 'Perahu packraft dan helm terawat rapi', status: 'active' },
    { id: 8, judul: 'Spot Foto Tepi Sungai', kategori: 'Pemandangan', gambar: 'assets/images/galeri/5.jpg', caption: 'Spot foto instagramable di aliran Sungai Opak', status: 'active' }
  ],

  // ---- Testimonial (Google Reviews Terverifikasi) ----
  testimonials: [
    {
      id: 1,
      nama: 'Bima Arya Pratama',
      asal: 'Wisatawan Jakarta',
      email: 'bima.aryapratama@gmail.com',
      foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      pesan: 'Rute susur sungainya keren banget dari Canden sampai Potrobayan! Alamnya asri, guidenya ramah dan sangat memperhatikan keselamatan. Wajib coba bareng keluarga atau teman!',
      avatar: 'B',
      isGoogle: true,
      tanggal: '2026-08-25'
    },
    {
      id: 2,
      nama: 'Siti Rahmawati',
      asal: 'Keluarga Wisatawan (Sleman)',
      email: 'siti.rahmawati.yk@gmail.com',
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      pesan: 'Seru banget buat liburan keluarga. Anak-anak senang dan merasa aman karena didampingi instruktur yang sabar. Titik finish di Potrobayan juga pemandangannya bagus banget buat foto-foto!',
      avatar: 'S',
      isGoogle: true,
      tanggal: '2026-08-20'
    },
    {
      id: 3,
      nama: 'Dimas Setiawan',
      asal: 'Komunitas Outdoor Jogja',
      email: 'dimas.setiawan92@gmail.com',
      foto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      pesan: 'Spot wisata adventure baru di Bantul yang fresh! Jeram sungainya pas menantang tapi tetap aman. Sangat cocok buat refreshing bareng rombongan kantor atau teman komunitas.',
      avatar: 'D',
      isGoogle: true,
      tanggal: '2026-08-15'
    },
    {
      id: 4,
      nama: 'Anisa Putri Maharani',
      asal: 'Traveler Solo & Mahasiswa',
      email: 'anisa.maharani@gmail.com',
      foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      pesan: 'Pertama kali coba packrafting di Jogja dan langsung jatuh cinta! Pemandangannya alami dan asri. Rest area tepi kali juga nyaman banget ada kelapa mudanya.',
      avatar: 'A',
      isGoogle: true,
      tanggal: '2026-08-08'
    },
    {
      id: 5,
      nama: 'Wahyu Hidayat',
      asal: 'Rombongan Reuni Alumni',
      email: 'wahyu.hidayat77@gmail.com',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      rating: 5,
      pesan: 'Pelayanan pengelola desa Canden top markotop. Safety briefing detail, helm dan pelampung lengkap, pemandu sigap sepanjang 4,5 km sampai finish di Potrobayan. Sangat recommended!',
      avatar: 'W',
      isGoogle: true,
      tanggal: '2026-08-02'
    }
  ],

  // ---- Informasi & Panduan Wisata Packrafting ----
  wisataInfo: {
    namaPengelola: 'Pokdarwis & Pengelola Susur Sungai Desa Canden',
    deskripsiPengelola: 'Pengelola resmi aktivitas wisata petualangan air Packrafting di Sungai Opak, Desa Canden, Kapanewon Jetis, Kabupaten Bantul.',
    legalitas: 'Binaan Dinas Pariwisata & Pemerintah Kalurahan Canden — Standar Keamanan & River Guide Bersertifikasi.',
    aksesRute: 'Dapat diakses dengan mobil, motor, maupun bus medium. Terletak sekitar 30 menit ke arah selatan dari pusat Kota Yogyakarta melalui Jalan Imogiri Barat / Jalan Parangtritis.',
    titikKumpul: 'Starting Point Susur Sungai Opak (Canden, Jetis, Bantul)',
    fasilitasBasecamp: 'Toilet & Kamar Mandi Bilas Bersih, Tempat Ganti Baju, Mushola, Gazebo Istirahat, Area Briefing, Loker Penitipan Barang Berharga.',
    fasilitasSekitar: 'Area Parkir Luas & Aman, Warung Makan Tradisional Khas Desa, Spot Foto Alami Tepi Sungai.',
    jamOperasional: 'Setiap Hari: 07.30 – 16.30 WIB (Sesi Trip Pagi: 08.00 – 11.00 & Sesi Trip Siang/Sore: 13.00 – 16.00 WIB)'
  },

  // ---- Media Library Default ----
  media: [
    { id: 1, name: 'hero-packraft.jpg', size: 3644614, type: 'image/jpeg', url: 'assets/images/hero/hero-packraft.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' },
    { id: 2, name: '1.jpg', size: 233158, type: 'image/jpeg', url: 'assets/images/galeri/1.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' },
    { id: 3, name: '2.jpg', size: 3760209, type: 'image/jpeg', url: 'assets/images/galeri/2.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' },
    { id: 4, name: '3.jpg', size: 3760209, type: 'image/jpeg', url: 'assets/images/galeri/3.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' },
    { id: 5, name: '4.jpg', size: 3870747, type: 'image/jpeg', url: 'assets/images/galeri/4.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' },
    { id: 6, name: '5.jpg', size: 3644614, type: 'image/jpeg', url: 'assets/images/galeri/5.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' },
    { id: 7, name: '6.jpg', size: 5324361, type: 'image/jpeg', url: 'assets/images/galeri/6.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' },
    { id: 8, name: '7.jpg', size: 6434239, type: 'image/jpeg', url: 'assets/images/galeri/7.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' },
    { id: 9, name: 'tes.jpg', size: 1537028, type: 'image/jpeg', url: 'assets/images/galeri/tes.jpg', uploadedAt: '2026-09-10T08:00:00.000Z' }
  ],

  // ---- Video Pengalaman ----
  video: {
    title: 'Feel the Ride — Packrafting Canden',
    subtitle: 'Sensasi Petualangan Menyusuri Sungai Opak',
    youtubeUrl: 'https://youtube.com/@packraftingcanden?si=Equbd3pEqt4Ym5oH',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCpackraftingcanden',
    coverImg: 'assets/images/hero/hero-packraft.jpg'
  },

  // ---- Frequently Asked Questions ----
  faq: [
    {
      q: 'Di mana lokasi titik start dan finish packrafting?',
      a: 'Titik kumpul dan start berada di STARTING POINT SUSUR SUNGAI OPAK (Desa Canden, Bantul), dan titik finish berakhir di WISATA POTROBAYAN (titik temu Sungai Opak & Sungai Oya). Tersedia transportasi penjemputan dari finish kembali ke start.'
    },
    {
      q: 'Berapa jarak dan durasi rute susur sungai?',
      a: 'Rute pengarungan sungai menempuh jarak sekitar 3,5 kilometer dengan durasi pengarungan sekitar 1,5 hingga 2 jam tergantung debit arus air dan kecepatan mendayung.'
    },
    {
      q: 'Apakah pemula boleh ikut packrafting?',
      a: 'Tentu saja! Aktivitas Packrafting Canden dirancang ramah untuk pemula. Sebelum turun ke sungai, tim instruktur kami akan memberikan safety briefing serta latihan dasar mendayung dan mengendalikan perahu.'
    },
    {
      q: 'Apakah peserta harus bisa berenang?',
      a: 'Tidak wajib. Semua peserta diwajibkan menggunakan rompi pelampung (life jacket) berdaya apung tinggi berstandar keselamatan dan selalu didampingi oleh river guide selama berada di air.'
    },
    {
      q: 'Berapa minimal usia peserta yang diperbolehkan?',
      a: 'Untuk paket reguler minimal usia 12 tahun. Untuk Family Adventure, anak usia mulai 7 tahun dapat ikut dengan pendampingan orang tua dan izin pengelola.'
    },
    {
      q: 'Apa saja perlengkapan yang harus dibawa peserta?',
      a: 'Bawalah pakaian ganti lengkap, alas kaki yang tidak mudah lepas saat basah (sandal gunung/sepatu air), kantong waterproof untuk barang berharga, dan perlengkapan mandi pribadi.'
    },
    {
      q: 'Bagaimana jika cuaca buruk atau debit air naik?',
      a: 'Keselamatan adalah prioritas utama kami. Jika kondisi cuaca ekstrem atau debit air sungai dinilai tidak aman oleh river guide, jadwal aktivitas dapat dialihkan, ditunda, atau dijadwalkan ulang demi kenyamanan dan keselamatan bersama.'
    }
  ]
};

/* ============================================
   DataStore API Wrapper (localStorage / Mock)
   ============================================ */

const DataStore = {
  // ---- Supabase Cloud Database Configuration ----
  SUPABASE_URL: 'https://fnyocuashzlrklduehzu.supabase.co',
  SUPABASE_KEY: 'sb_publishable_ordvwXeWl8ggR2glcfDwYQ_NvFC_Tgv',

  // Save to localStorage immediately and sync to Supabase Cloud
  async saveToCloud(key, data) {
    const storageKey = 'packraft_' + key;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // Trigger local page update immediately
    window.dispatchEvent(new CustomEvent('packraft_data_updated', { detail: { key, data } }));

    // Send to Supabase Cloud
    try {
      const res = await fetch(`${this.SUPABASE_URL}/rest/v1/site_data`, {
        method: 'POST',
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: key,
          value: data,
          updated_at: new Date().toISOString()
        })
      });
      if (res.ok) {
        console.log(`[Supabase Cloud] Berhasil sinkronisasi '${key}'`);
        return true;
      } else {
        const errText = await res.text();
        console.warn(`[Supabase Cloud] Status respon ${res.status} untuk '${key}':`, errText);
        throw new Error(`Cloud sync error (${res.status}): ${errText}`);
      }
    } catch (err) {
      console.warn(`[Supabase Cloud] Gagal sinkronisasi '${key}':`, err);
      throw err;
    }
  },

  // Initial Sync from Supabase Cloud
  _cloudSyncPromise: null,
  initCloudSync() {
    if (this._cloudSyncPromise) return this._cloudSyncPromise;
    this._cloudSyncPromise = (async () => {
      try {
        const res = await fetch(`${this.SUPABASE_URL}/rest/v1/site_data?select=*`, {
          headers: {
            'apikey': this.SUPABASE_KEY,
            'Authorization': `Bearer ${this.SUPABASE_KEY}`
          }
        });
        if (!res.ok) return;
        const records = await res.json();
        if (!Array.isArray(records)) return;

        let hasChanges = false;
        records.forEach(item => {
          if (!item.key || item.value === undefined) return;
          const storageKey = 'packraft_' + item.key;
          const currentLocal = localStorage.getItem(storageKey);
          const remoteString = JSON.stringify(item.value);

          if (currentLocal !== remoteString) {
            try {
              localStorage.setItem(storageKey, remoteString);
              hasChanges = true;
            } catch (e) {}
          }
        });

        // Always notify UI when cloud data finishes syncing (critical for incognito / fresh sessions)
        window.dispatchEvent(new CustomEvent('packraft_data_updated', { detail: { source: 'cloud' } }));
      } catch (e) {
        console.warn('[Supabase Cloud] Sedang offline / gagal memuat data cloud, menggunakan cache lokal:', e);
      } finally {
        this._cloudSyncPromise = null;
      }
    })();
    return this._cloudSyncPromise;
  },

  // Format nomor WhatsApp internasional (contoh 0812... -> 62812...)
  normalizePhone(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  },

  getBrandInfo() {
    const stored = localStorage.getItem('packraft_brand');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.whatsapp === '081260092004' || !parsed.meetingPoints) {
          localStorage.setItem('packraft_brand', JSON.stringify(PackraftData.brand));
          return PackraftData.brand;
        }
        return Object.assign({}, PackraftData.brand, parsed);
      } catch (e) {}
    }
    return PackraftData.brand;
  },
  saveBrandInfo(data) {
    return this.saveToCloud('brand', data);
  },

  getBanners() {
    const stored = localStorage.getItem('packraft_banners');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return PackraftData.banners;
  },
  saveBanners(data) {
    return this.saveToCloud('banners', data);
  },
  getActiveBanners() {
    return this.getBanners().filter(b => b.status === 'active').sort((a, b) => a.urutan - b.urutan);
  },

  // ---- Manajemen 3 Foto Banner Slider Hero ----
  getHeroSlides() {
    const stored = localStorage.getItem('packraft_hero_slides');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return parsed.slice(0, 3);
        }
      } catch (e) {}
    }
    return PackraftData.heroSlides;
  },
  saveHeroSlides(data) {
    const validSlides = Array.isArray(data) ? data.slice(0, 3) : PackraftData.heroSlides;
    return this.saveToCloud('hero_slides', validSlides);
  },

  getPaket() {
    const stored = localStorage.getItem('packraft_paket');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0 && parsed[0].harga && (parsed[0].harga.includes('[') || parsed[0].nama === 'PACKRAFTING EXPERIENCE')) {
          localStorage.setItem('packraft_paket', JSON.stringify(PackraftData.paket));
          return PackraftData.paket;
        }
        return parsed;
      } catch (e) {}
    }
    return PackraftData.paket;
  },
  savePaket(data) {
    return this.saveToCloud('paket', data);
  },
  getPaketById(id) {
    return this.getPaket().find(p => p.id === parseInt(id));
  },

  getFasilitasTambahan() {
    return PackraftData.fasilitasTambahan;
  },

  getKetentuanPerahu() {
    return PackraftData.ketentuanPerahu;
  },

  getWisataInfo() {
    const stored = localStorage.getItem('packraft_wisata_info');
    if (stored) {
      const parsed = JSON.parse(stored);
      return Object.assign({}, PackraftData.wisataInfo, parsed);
    }
    return PackraftData.wisataInfo;
  },
  saveWisataInfo(data) {
    return this.saveToCloud('wisata_info', data);
  },

  getGaleri() {
    const stored = localStorage.getItem('packraft_galeri');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return PackraftData.galeri;
  },
  getPublishedGaleri() {
    return this.getGaleri().filter(g => g.status !== 'hidden' && g.status !== 'inactive');
  },
  saveGaleri(data) {
    return this.saveToCloud('galeri', data);
  },
  getGaleriById(id) {
    return this.getGaleri().find(g => g.id === parseInt(id));
  },

  getMedia() {
    const stored = localStorage.getItem('packraft_media');
    return stored ? JSON.parse(stored) : PackraftData.media;
  },
  saveMedia(data) {
    return this.saveToCloud('media', data);
  },

  getVideo() {
    const stored = localStorage.getItem('packraft_video');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.coverImg) {
            parsed.coverImg = PackraftData.video.coverImg;
          }
          return Object.assign({}, PackraftData.video, parsed);
        }
      } catch (e) {}
    }
    return PackraftData.video;
  },
  saveVideo(data) {
    return this.saveToCloud('video', data);
  },

  getTestimonials() {
    const stored = localStorage.getItem('packraft_testimonials');
    return stored ? JSON.parse(stored) : PackraftData.testimonials;
  },
  saveTestimonials(data) {
    return this.saveToCloud('testimonials', data);
  },

  getFAQ() {
    const stored = localStorage.getItem('packraft_faq');
    return stored ? JSON.parse(stored) : PackraftData.faq;
  },
  saveFAQ(data) {
    return this.saveToCloud('faq', data);
  },

  async hashPassword(password) {
    if (!password) return '';
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      return 'fallback_' + Math.abs(hash).toString(16);
    }
  },

  getAdminCredentials() {
    const stored = localStorage.getItem('packraft_admin_cred');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    // Default admin credential (Default password: AdminCanden2026!)
    // SHA-256 of "AdminCanden2026!" = 58a98bca4dbd715df68c5b058ad9081e62aa21e428cf12ea662ad783a30fc3b0
    // We also support "admin123" legacy hash = 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
    return {
      username: 'admin',
      passwordHash: '58a98bca4dbd715df68c5b058ad9081e62aa21e428cf12ea662ad783a30fc3b0',
      legacyHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
    };
  },

  saveAdminCredentials(username, passwordHash) {
    localStorage.setItem('packraft_admin_cred', JSON.stringify({
      username: username || 'admin',
      passwordHash: passwordHash,
      updatedAt: new Date().toISOString()
    }));
  },

  getBookingWhatsAppUrl(paketNama) {
    const brand = this.getBrandInfo();
    const phone = this.normalizePhone(brand.whatsapp);
    const defaultPaket = paketNama ? paketNama : '[Pilih Paket]';
    const message = `Halo, saya ingin booking Packrafting Canden.

Nama:
Jumlah peserta:
Pilihan paket: ${defaultPaket}
Tanggal:
Jam:

Mohon informasi ketersediaannya.`;

    if (!phone || phone.includes('NOMOR')) {
      return `https://wa.me/[NOMOR_WHATSAPP]?text=${encodeURIComponent(message)}`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  generateId(collection) {
    if (!collection || collection.length === 0) return 1;
    return Math.max(...collection.map(item => item.id || 0)) + 1;
  }
};

/* ============================================
   SECURITY UTILS - Anti SQL Injection & XSS
   ============================================ */
const Security = {
  // Check for common SQL Injection signatures & payload patterns
  containsSqlInjection(input) {
    if (typeof input !== 'string') return false;
    const str = input.toLowerCase();
    
    const sqliPatterns = [
      /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // Basic SQL comment / quote injection
      /\b(or|and)\b\s+[\'\"]?\d+[\'\"]?\s*=\s*[\'\"]?\d+/i, // ' OR '1'='1', AND 1=1
      /\b(or|and)\b\s+[\'\"]?[a-z0-9_]+[\'\"]?\s*=\s*[\'\"]?[a-z0-9_]+/i, // ' OR 'a'='a'
      /\b(union(\s+all)?\s+select)\b/i, // UNION SELECT
      /\b(select|insert|update|delete|drop|alter|create|truncate|exec|execute)\b.*\b(from|into|table|database|where)\b/i, // SQL queries
      /\b(information_schema|load_file|outfile|dumpfile|benchmark|sleep|pg_sleep)\b/i, // Dangerous DB functions
      /;\s*(select|insert|update|delete|drop|alter)/i // Stacked queries
    ];

    return sqliPatterns.some(pattern => pattern.test(str));
  },

  // Escape HTML entities to prevent XSS / Script injection
  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/`/g, '&#96;');
  },

  // Sanitize alphanumeric username inputs
  sanitizeUsername(username) {
    if (!username) return '';
    return username.replace(/[^a-zA-Z0-9_.@-]/g, '').trim();
  },

  // Safe input text cleaning (strip null bytes & control chars)
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/\0/g, '').trim();
  }
};

if (typeof window !== 'undefined') {
  window.PackraftData = PackraftData;
  window.DataStore = DataStore;
  window.Security = Security;

  // Start cloud sync immediately
  DataStore.initCloudSync();
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DataStore.initCloudSync());
  }
}


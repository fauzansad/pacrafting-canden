/* ============================================
   MAIN.JS - Interactive Core
   PACKRAFTING CANDEN — Adventure on the River
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ---- 0. Shared helpers ----
  // Nilai yang berasal dari database/cloud adalah input yang tidak dipercaya:
  // setiap renderer wajib escape sebelum masuk ke innerHTML.

  // Cache satu elemen textarea untuk decode entity. Using innerHTML pada
  // <textarea> tidak mengeksekusi skrip, jadi aman dipakai untuk decode.
  let _entityDecoder = null;
  function decodeEntities(str) {
    if (typeof str !== 'string' || str.indexOf('&') === -1) return str;
    try {
      if (!_entityDecoder) _entityDecoder = document.createElement('textarea');
      _entityDecoder.innerHTML = str;
      return _entityDecoder.value;
    } catch (err) {
      return str;
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    // Decode dulu supaya entity dari database (&bull; &amp; &ldquo; dst) tampil
    // sebagai karakter aslinya, bukan "&bull;". Setelah di-decode, baru di-escape
    // untuk mencegah XSS.
    return String(decodeEntities(String(str)))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Terapkan teks dari database ke elemen. `defaultValue` = nilai bawaan di
  // PackraftData. Kalau nilainya masih sama dengan bawaan, biarkan i18n yang
  // mengurus (agar versi English tetap ter terjemahan). Kalau admin sudah
  // mengubahnya, tandai `data-db-driven` supaya kamus statis tidak menimpa.
  function applyDbText(el, value, defaultValue, useHtml) {
    if (!el) return;
    // Tanpa nilai untuk bahasa aktif, atribut data-db-driven harus dilepas.
    // Kalau tidak, atribut basi dari render bahasa sebelumnya membuat
    // i18n.applyTranslations() melewati elemen ini dan teks lama tidak pernah
    // diganti (mis. subheading Indonesia tetap tampil saat pilih Inggris).
    if (!value) {
      el.removeAttribute('data-db-driven');
      return;
    }
    const decoded = decodeEntities(String(value));
    const isCustomized = decoded !== decodeEntities(String(defaultValue || ''));
    if (isCustomized) {
      if (useHtml) {
        el.innerHTML = decoded;
      } else {
        el.textContent = decoded;
      }
      el.setAttribute('data-db-driven', '1');
    } else {
      el.removeAttribute('data-db-driven');
    }
  }

  // URL aset dari database bisa absolut path dari admin panel. Samakan jadi
  // document-relative supaya front-end & admin melihat hasil yang sama.
  function resolveAssetUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) return trimmed;
    return trimmed.replace(/^\/+/, '').replace(/^\.\.\/+/, '');
  }

  // ---- 1. Dynamic Brand & Social Data Sync ----
  function syncBrandData() {
    if (typeof DataStore === 'undefined') return;

    const brand = DataStore.getBrandInfo();
    const cleanPhone = DataStore.normalizePhone(brand.whatsapp);
    const waBookingUrl = DataStore.getBookingWhatsAppUrl('');

    // Update all WhatsApp buttons & links
    document.querySelectorAll('[data-social-wa], a[href*="wa.me"]').forEach(function (el) {
      if (!el.hasAttribute('data-booking-wa')) {
        el.href = waBookingUrl;
        el.target = '_blank';
      }
    });

    // Update Instagram links
    if (brand.instagram && !brand.instagram.includes('[INSTAGRAM]')) {
      document.querySelectorAll('[data-social-ig], a[href*="instagram.com"]').forEach(function (el) {
        el.href = brand.instagram;
        el.target = '_blank';
      });
    }

    // Update TikTok links
    if (brand.tiktok && !brand.tiktok.includes('[TIKTOK]')) {
      document.querySelectorAll('[data-social-tiktok], a[href*="tiktok.com"]').forEach(function (el) {
        el.href = brand.tiktok;
        el.target = '_blank';
      });
    }

    // Update YouTube links
    if (brand.youtube && !brand.youtube.includes('[YOUTUBE]')) {
      document.querySelectorAll('[data-social-yt], a[href*="youtube.com"]').forEach(function (el) {
        el.href = brand.youtube;
        el.target = '_blank';
      });
    }

    // Update Start Point Maps links & text
    if (brand.startMapsUrl) {
      document.querySelectorAll('[data-start-maps]').forEach(function (el) {
        el.href = brand.startMapsUrl;
        el.target = '_blank';
      });
    }
    if (brand.meetingPoint) {
      document.querySelectorAll('[data-display-start-name]').forEach(function (el) {
        el.textContent = brand.meetingPoint;
      });
    }

    // Update Finish Point Maps links & text
    if (brand.finishMapsUrl) {
      document.querySelectorAll('[data-finish-maps]').forEach(function (el) {
        el.href = brand.finishMapsUrl;
        el.target = '_blank';
      });
    }
    if (brand.finishPoint) {
      document.querySelectorAll('[data-display-finish-name]').forEach(function (el) {
        el.textContent = brand.finishPoint;
      });
    }

    // Update Rest Area Maps links & text
    if (brand.restAreaMapsUrl) {
      document.querySelectorAll('[data-rest-maps]').forEach(function (el) {
        el.href = brand.restAreaMapsUrl;
        el.target = '_blank';
      });
    }
    if (brand.restAreaPoint) {
      document.querySelectorAll('[data-display-rest-name]').forEach(function (el) {
        el.textContent = brand.restAreaPoint;
      });
    }

    // Update phone text displays
    if (brand.whatsapp && !brand.whatsapp.includes('[NOMOR')) {
      document.querySelectorAll('[data-display-wa]').forEach(function (el) {
        el.textContent = brand.whatsapp;
      });
    }

    // Update email text displays & mailto links
    if (brand.email && !brand.email.includes('[EMAIL')) {
      document.querySelectorAll('[data-display-email]').forEach(function (el) {
        el.textContent = brand.email;
      });
      document.querySelectorAll('[data-social-email], a[href^="mailto:"]').forEach(function (el) {
        el.href = 'mailto:' + brand.email;
      });
    }
  }

  // ---- 2. Dynamic Paket Wisata Rendering from DataStore ----
  function renderDynamicPaket() {
    const container = document.getElementById('paket-container');
    if (!container || typeof DataStore === 'undefined') return;

    const paketList = DataStore.getPaket().filter(p => p.status !== 'inactive');
    if (!paketList || paketList.length === 0) return;

    const lang = (window.I18n && window.I18n.getLanguage) ? window.I18n.getLanguage() : 'id';
    const isEn = lang === 'en';

    const i18nText = function (key, fallback) {
      const fb = (fallback === undefined || fallback === null) ? '' : fallback;
      try {
        if (window.I18n && typeof window.I18n.t === 'function') {
          const val = window.I18n.t(key, fb);
          // I18n.t mengembalikan nama key-nya sendiri kalau tidak ada di kamus
          // dan fallback kosong; nilai seperti itu dianggap "tidak ada".
          if (val && val !== key) return val;
        }
      } catch (err) {}
      return fb;
    };

    container.innerHTML = paketList.map(function (p, idx) {
      // Field _en dari DB dipakai kalau bahasa Inggris aktif. Kalau kolom _en
      // kosong (paket lama / admin belum pernah menyimpan), jatuh kembali ke
      // teks Indonesia agar kartu tidak pernah tampil kosong.
      const pick = function (idVal, enVal) {
        if (!isEn) return idVal;
        const en = (enVal === undefined || enVal === null) ? '' : String(enVal).trim();
        return en || idVal;
      };
      // Array harus diperlakukan sebagai satu kesatuan: kalau versi Inggris
      // tidak ada / kosong, pakai utuh array Indonesia.
      const pickList = function (idList, enList) {
        if (isEn && Array.isArray(enList) && enList.length) return enList;
        return idList;
      };

      const nama = pick(p.nama, p.nama_en);
      const badge = pick(p.badge, p.badge_en);
      const deskripsi = pick(p.deskripsi, p.deskripsi_en);
      const durasi = pick(p.durasi, p.durasi_en);
      const level = pick(p.level, p.level_en);
      const minPeserta = pick(p.minPeserta, p.minPeserta_en);
      const maxPeserta = pick(p.maxPeserta, p.maxPeserta_en);
      const usiaMin = pick(p.usiaMin, p.usiaMin_en);
      // `unit` tidak punya pasangan `_en`: isinya singkatan singkat ("/ orang",
      // "/ pax") yang tidak layak dikirim ke API translate. Label "/ orang"
      // yang perlu diterjemahkan sudah ditangani i18n key `pkg_unit_orang`.
      const unit = p.unit;
      const fasilitas = pickList(p.fasilitas || [], p.fasilitas_en);
      const yangPerluDihadirkan = pickList(p.yangPerluDihadirkan || [], p.yangPerluDihadirkan_en);

      const ribbonText = badge || (idx === 0 ? 'Trip Favorit' : 'Lengkap + Makan');
      const ribbonHtml = ribbonText ? `<span class="paket-ribbon">${escapeHtml(ribbonText)}</span>` : '';
      const defaultImg = idx === 0 ? 'assets/images/galeri/3.jpg' : 'assets/images/galeri/6.jpg';
      const imgSrc = resolveAssetUrl(p.gambar) || defaultImg;
      const btnClass = idx === 0 ? 'btn btn-primary' : 'btn btn-accent';
      const fasilitasItems = (fasilitas || []).map(f => `<li><i class="fa-solid fa-circle-check"></i> ${escapeHtml(f)}</li>`).join('');

      // Handle price formatting
      let displayPrice = p.harga || '110.000';
      if (!displayPrice.startsWith('Rp') && !displayPrice.startsWith('Mulai') && !displayPrice.includes('[')) {
        displayPrice = 'Rp ' + displayPrice;
      }

      // Harga normal dicoret saat harga promo lebih rendah, supaya edit admin
      // untuk `hargaNormal` ikut terlihat di landing page.
      const normalPrice = p.hargaNormal && p.hargaNormal !== displayPrice
        ? `<div class="paket-price-original"><s>${escapeHtml(p.hargaNormal)}</s></div>`
        : '';

      // Info-meta yang dikelola admin (level, kuota peserta, syarat usia).
      const metaExtras = [];
      if (level) metaExtras.push(`<div><strong>${i18nText('pkg_label_level', 'Level')}</strong>${escapeHtml(level)}</div>`);
      if (minPeserta || maxPeserta) {
        metaExtras.push(`<div><strong>${i18nText('pkg_label_kuota', 'Kuota Peserta')}</strong>${escapeHtml(minPeserta || '')}${minPeserta && maxPeserta ? ' &ndash; ' : ''}${escapeHtml(maxPeserta || '')}</div>`);
      }
      if (usiaMin) metaExtras.push(`<div><strong>${i18nText('pkg_label_usia', 'Syarat Usia')}</strong>${escapeHtml(usiaMin)}</div>`);

      const bawaanHtml = (yangPerluDihadirkan && yangPerluDihadirkan.length)
        ? `<div class="paket-features-title">${i18nText('pkg_label_bawaan', 'Yang Perlu Dihadirkan:')}</div>
           <ul class="paket-features">${yangPerluDihadirkan.map(b => `<li><i class="fa-solid fa-circle-exclamation"></i> ${escapeHtml(b)}</li>`).join('')}</ul>`
        : '';

      return `
        <div class="paket-card reveal revealed">
          <div class="paket-img-header">
            <img src="${imgSrc}" alt="${escapeHtml(nama)}" loading="lazy">
            ${ribbonHtml}
          </div>
          <div class="paket-header">
            <h3>${escapeHtml(nama)}</h3>
            <div class="paket-subtitle">${escapeHtml(deskripsi || i18nText('pkg_default_desc', 'Sensasi Packrafting Wellness Tourism Canden'))}</div>
            <div class="paket-price-box">
              <div class="paket-price">
                ${normalPrice}
                <span class="amount">${escapeHtml(displayPrice)}</span>
                <span class="unit">${escapeHtml(unit || i18nText('pkg_unit_orang', '/ orang'))}</span>
              </div>
            </div>
          </div>
          <div class="paket-body">
            <div class="paket-meta-list">
              <div class="paket-meta-item">
                <i class="fa-regular fa-clock"></i>
                <div><strong>${i18nText('pkg_duration_label', 'Durasi Trip')}</strong>${escapeHtml(durasi || i18nText('pkg_duration_val', '± 1,5 Jam (4,5 km)'))}</div>
              </div>
              <div class="paket-meta-item">
                <i class="fa-solid fa-sailboat"></i>
                <div><strong>${i18nText('pkg_boat_label', 'Perahu')}</strong>${i18nText('pkg_boat_val', '1 Orang / Packraft')}</div>
              </div>
              ${metaExtras.join('')}
            </div>

            <div class="paket-features-title">${i18nText('pkg_features_title', 'Fasilitas Termasuk:')}</div>
            <ul class="paket-features">
              ${fasilitasItems}
            </ul>
            ${bawaanHtml}

            <div class="paket-footer">
              <button type="button" data-reserve-paket="${p.id}" data-booking-wa="${escapeHtml(nama)}" class="${btnClass}">
                <i class="fa-brands fa-whatsapp"></i> ${i18nText('pkg_btn_reserve', 'Reservasi')} ${escapeHtml(nama)}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDisplayDate(dateKey) {
    const parts = dateKey.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  let bookingCalendarState = {
    paket: null,
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  };

  function ensureBookingCalendarModal() {
    let modal = document.getElementById('booking-calendar-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'booking-calendar-modal';
    modal.className = 'modal-overlay booking-calendar-modal';
    modal.innerHTML = `
      <div class="modal-card booking-calendar-card">
        <button type="button" class="booking-calendar-close" aria-label="Tutup Kalender">&times;</button>
        <div class="booking-calendar-head">
          <span>Pilih Tanggal Reservasi</span>
          <h3 id="booking-calendar-paket">Reservasi Paket</h3>
          <p>Hanya tanggal hijau yang bisa dipesan. Tanggal lain belum beroperasi.</p>
        </div>
        <div class="booking-calendar-nav">
          <button type="button" data-calendar-nav="prev"><i class="fa-solid fa-chevron-left"></i></button>
          <strong id="booking-calendar-month"></strong>
          <button type="button" data-calendar-nav="next"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="booking-calendar-weekdays">
          <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
        </div>
        <div class="booking-calendar-grid" id="booking-calendar-grid"></div>
        <div class="booking-calendar-note"><span></span> Tidak beroperasi</div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('.booking-calendar-close')) {
        closeBookingCalendar();
        return;
      }
      const navBtn = e.target.closest('[data-calendar-nav]');
      if (navBtn) {
        bookingCalendarState.month += navBtn.dataset.calendarNav === 'next' ? 1 : -1;
        if (bookingCalendarState.month < 0) {
          bookingCalendarState.month = 11;
          bookingCalendarState.year -= 1;
        }
        if (bookingCalendarState.month > 11) {
          bookingCalendarState.month = 0;
          bookingCalendarState.year += 1;
        }
        renderBookingCalendar();
        return;
      }
      const dateBtn = e.target.closest('[data-booking-date]');
      if (dateBtn) {
        handleBookingDate(dateBtn.dataset.bookingDate);
      }
    });
    return modal;
  }

  function openBookingCalendar(paket) {
    bookingCalendarState = {
      paket,
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    };
    const modal = ensureBookingCalendarModal();
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    renderBookingCalendar();
  }

  function closeBookingCalendar() {
    const modal = document.getElementById('booking-calendar-modal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }

  function renderBookingCalendar() {
    const grid = document.getElementById('booking-calendar-grid');
    const title = document.getElementById('booking-calendar-paket');
    const monthTitle = document.getElementById('booking-calendar-month');
    if (!grid || !monthTitle) return;

    const { paket, month, year } = bookingCalendarState;
    const firstDate = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const schedule = (typeof DataStore !== 'undefined' && DataStore.getOperationSchedule) ? DataStore.getOperationSchedule() : { operationDates: [] };
    const operationDates = Array.isArray(schedule.operationDates) ? schedule.operationDates : [];
    const monthName = firstDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    if (title) title.textContent = paket ? `Reservasi ${paket.nama}` : 'Reservasi Paket';
    monthTitle.textContent = monthName;

    let html = '';
    for (let i = 0; i < firstDate.getDay(); i++) {
      html += '<span class="booking-calendar-empty"></span>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(new Date(year, month, day));
      const open = operationDates.includes(dateKey);
      html += `<button type="button" class="booking-date ${open ? 'is-open' : 'is-closed'}" data-booking-date="${dateKey}">${day}</button>`;
    }
    grid.innerHTML = html;
  }

  function handleBookingDate(dateKey) {
    const schedule = (typeof DataStore !== 'undefined' && DataStore.getOperationSchedule) ? DataStore.getOperationSchedule() : { operationDates: [] };
    const operationDates = Array.isArray(schedule.operationDates) ? schedule.operationDates : [];
    if (!operationDates.includes(dateKey)) {
      alert(schedule.closedReason || 'Tanggal ini belum dijadwalkan beroperasi oleh Packrafting Canden.');
      return;
    }
    const paket = bookingCalendarState.paket;
    const url = DataStore.getBookingWhatsAppUrl(paket ? paket.nama : '', null, formatDisplayDate(dateKey));
    window.open(url, '_blank');
    closeBookingCalendar();
  }

  // ---- 3. Dynamic Hero Banner Content Sync ----
  function syncHeroBanner() {
    if (typeof DataStore === 'undefined') return;
    const banners = DataStore.getActiveBanners();
    if (!banners || banners.length === 0) return;

    const b = banners[0];
    const heroTitleEl = document.querySelector('.hero-title');
    const heroSubEl = document.querySelector('.hero-sub');
    const heroLeadEl = document.querySelector('.hero-lead');
    const heroCtaBtn = document.getElementById('main-booking-wa-btn') || document.querySelector('.hero-actions a.btn');
    // `.hero-slide-art` tidak ada di template mana pun, jadi gunakan elemen
    // slider yang benar-benar ada. Tanpa ini, gambar banner dari admin tidak
    // pernah tampil sama sekali.
    const heroSlideArt = document.querySelector('.hero-slide-art') || document.getElementById('hero-slider');
    const heroLocationEl = document.querySelector('.hero-location');

    // Dynamic Background Image & Focal Position
    if (heroSlideArt && b.gambar) {
      const imgSrc = resolveAssetUrl(b.gambar);
      if (imgSrc) {
        const safeSrc = imgSrc.replace(/"/g, '%22');
        heroSlideArt.style.backgroundImage = `url("${safeSrc}")`;
        heroSlideArt.style.backgroundSize = 'cover';
        heroSlideArt.style.backgroundPosition = b.position || 'center';
        heroSlideArt.style.backgroundRepeat = 'no-repeat';
      }
    }

    const defaultBanner = (typeof PackraftData !== 'undefined' && PackraftData.banners && PackraftData.banners[0]) || {};

    const lang = (window.I18n && window.I18n.getLanguage) ? window.I18n.getLanguage() : 'id';
    const fieldSuffix = lang === 'en' ? '_en' : '_id';

    if (heroTitleEl) {
      const customTitle = b['judul' + fieldSuffix];
      const customized = customTitle && decodeEntities(String(customTitle)) !== decodeEntities(String(defaultBanner.judul || ''));
      if (customized) {
        const safeTitle = escapeHtml(decodeEntities(String(customTitle)));
        heroTitleEl.innerHTML = safeTitle.replace('CANDEN', '<span>CANDEN</span>');
        heroTitleEl.setAttribute('data-db-driven', '1');
      } else {
        heroTitleEl.removeAttribute('data-db-driven');
      }
    }
    applyDbText(heroSubEl, b['sub' + fieldSuffix], defaultBanner.subheading, false);
    applyDbText(heroLeadEl, b['lead' + fieldSuffix], defaultBanner.lead, false);

    if (heroCtaBtn) {
      const customized = b.ctaText && decodeEntities(String(b.ctaText)) !== decodeEntities(String(defaultBanner.ctaText || ''));
      if (customized) {
        heroCtaBtn.innerHTML = `<i class="fa-solid fa-compass"></i> ${escapeHtml(decodeEntities(String(b.ctaText)))}`;
        heroCtaBtn.setAttribute('data-db-driven', '1');
      } else {
        heroCtaBtn.removeAttribute('data-db-driven');
      }
      // ctaLink bisa diatur dari admin; default ke section paket.
      const ctaHref = b.ctaLink && b.ctaLink !== defaultBanner.ctaLink ? b.ctaLink : null;
      if (ctaHref) heroCtaBtn.href = ctaHref;
    }
    // lokasiTag hanya punya versi Bahasa Indonesia (field admin-nya sudah
    // dihapus). Saat bahasa aktif Inggris, atribut data-db-driven dari render
    // sebelumnya HARUS dilepas: i18n.applyTranslations() melewati setiap
    // elemen ber-atribut itu (i18n.js isDbDriven), sehingga tanpa removeAttribute
    // teks Indonesia tetap nempel dan tidak pernah diganti ke Inggris.
    if (heroLocationEl) {
      if (lang === 'en') {
        heroLocationEl.removeAttribute('data-db-driven');
      } else if (b.lokasiTag) {
        const customized = decodeEntities(String(b.lokasiTag)) !== decodeEntities(String(defaultBanner.lokasiTag || ''));
        if (customized) {
          const cleanTag = escapeHtml(decodeEntities(String(b.lokasiTag)).replace(/^[📍\s]+/, ''));
          heroLocationEl.innerHTML = `<i class="fa-solid fa-route text-accent"></i> <span>${cleanTag}</span>`;
          heroLocationEl.setAttribute('data-db-driven', '1');
        } else {
          heroLocationEl.removeAttribute('data-db-driven');
        }
      }
    }
  }

  // ---- 3b. Dynamic Homepage Gallery Rendering ----
  function renderDynamicHomepageGallery() {
    const galleryGrid = document.querySelector('#galeri .gallery-grid');
    if (!galleryGrid || typeof DataStore === 'undefined') return;

    const galeriList = DataStore.getPublishedGaleri ? DataStore.getPublishedGaleri() : DataStore.getGaleri().filter(g => g.status !== 'hidden');
    if (!galeriList || galeriList.length === 0) {
      galleryGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:3rem;">Belum ada foto galeri yang ditampilkan.</p>';
      return;
    }

    const displayList = galeriList;

    // Galeri dari database menyimpan teks dwibahasa dengan sufiks _en / _id.
    // Saat bahasa Inggris aktif, pakai field _en; kalau kosong, kembali ke
    // teks Indonesia supaya kartu tidak pernah tampil tanpa judul.
    const lang = (window.I18n && window.I18n.getLanguage) ? window.I18n.getLanguage() : 'id';

    galleryGrid.innerHTML = displayList.map(function (g, idx) {
      const isFirst = (idx === 0 && displayList.length >= 4);
      const isWide = (displayList.length === 8 && idx === 7) || (displayList.length === 6 && (idx === 4 || idx === 5));
      let spanClass = '';
      if (isFirst) spanClass = 'span-2-row span-2-col';
      else if (isWide) spanClass = 'span-2-col';

      let imgSrc = resolveAssetUrl(g.gambar);
      const hasImg = Boolean(imgSrc);
      const judulEn = (g.judul_en || '').trim();
      const kategoriEn = (g.kategori_en || '').trim();
      const captionEn = (g.caption_en || '').trim();

      const judul = (lang === 'en' && judulEn) ? judulEn : (g.judul || judulEn);
      const kategori = (lang === 'en' && kategoriEn) ? kategoriEn : (g.kategori || kategoriEn);
      const captionSrc = (lang === 'en' && captionEn) ? captionEn : (g.caption || g.judul || captionEn);

      const safeTitle = escapeHtml(judul);
      const safeKategori = escapeHtml(kategori || 'Aktivitas Sungai Opak');
      const safeCaption = escapeHtml(captionSrc);

      const content = hasImg
        ? `<img src="${escapeHtml(imgSrc)}" alt="${safeTitle}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;">`
        : `
          <div class="gallery-card-placeholder">
            <i class="fa-solid fa-water"></i>
            <h5>${safeTitle}</h5>
            <span>${safeKategori}</span>
          </div>
        `;

      return `
        <div class="gallery-card ${spanClass} reveal revealed" data-lightbox="${escapeHtml(imgSrc)}" data-caption="${safeCaption}">
          ${content}
          <div class="gallery-card-overlay">
            <h5>${safeTitle}</h5>
            <span>${safeKategori}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ---- 3c. Dynamic FAQ Rendering ----
  function renderDynamicFaq() {
    const faqContainer = document.querySelector('#faq .faq-container');
    if (!faqContainer || typeof DataStore === 'undefined') return;

    const faqList = DataStore.getFAQ();
    if (!faqList || faqList.length === 0) return;

    const lang = (window.I18n && window.I18n.getLanguage) ? window.I18n.getLanguage() : 'id';

    faqContainer.innerHTML = faqList.map(function (item, index) {
      const isActive = index === 0;
      const i18nText = function (key) {
        try {
          if (window.I18n && typeof window.I18n.t === 'function') {
            const val = window.I18n.t(key, '');
            // I18n.t mengembalikan nama key-nya sendiri kalau tidak ada di kamus.
            // Nilai seperti itu harus dianggap "tidak ada terjemahan".
            if (val && val !== key) return val;
          }
        } catch (err) {}
        return '';
      };

      const qEn = (item.q_en || '').trim();
      const aEn = (item.a_en || '').trim();

      // Pertanyaan: _en (DB) -> kamus i18n -> teks Indonesia dari DB.
      let question = item.q || '';
      if (lang === 'en') {
        question = qEn || i18nText('faq_q' + (index + 1)) || question;
      }
      const safeQ = escapeHtml(question);

      // Jawaban: pertanyaan di bawah memakai dua sumber dengan aturan keamanan
      // BERBEDA, dan itu disengaja:
      //  - Teks dari DATABASE selalu di-escape, karena isinya input admin /
      //    pihak ketiga dan tidak boleh bisa menyuntik HTML ke halaman.
      //  - Teks dari KAMUS i18n (assets/js/i18n.js) adalah string first-party
      //    milik proyek sendiri yang memang sengaja memuat markup seperti
      //    <strong>, <br>, dan <em> untuk format FAQ. String tepercaya ini
      //    TIDAK boleh di-escape, karena escapingnya akan membuat tag-nya
      //    tampil sebagai teks mentah "&lt;strong&gt;".
      let answerHtml;
      if (lang === 'en' && !aEn) {
        const i18nAnswer = i18nText('faq_a' + (index + 1));
        if (i18nAnswer) {
          answerHtml = i18nAnswer; // tepercaya, sudah HTML -> pakai apa adanya
        } else {
          answerHtml = escapeHtml(item.a).replace(/\r?\n/g, '<br>');
        }
      } else {
        const rawAnswer = (lang === 'en' && aEn) ? aEn : item.a;
        answerHtml = escapeHtml(rawAnswer).replace(/\r?\n/g, '<br>');
      }

      return `
        <div class="faq-item ${isActive ? 'active' : ''}">
          <div class="faq-header">
            <span>${safeQ}</span>
            <div class="faq-icon"><i class="fa-solid fa-chevron-down"></i></div>
          </div>
          <div class="faq-body" style="${isActive ? 'max-height: 250px;' : ''}">
            <div class="faq-body-inner">
              ${answerHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    initFaq();
  }

  // ---- 3d. Dynamic Wisata Info & Basecamp Sync ----
  function syncWisataInfo() {
    if (typeof DataStore === 'undefined') return;
    const info = DataStore.getWisataInfo();
    if (!info) return;

    const defaults = Object.assign({},
      (typeof PackraftData !== 'undefined' && PackraftData.wisataInfo) ? PackraftData.wisataInfo : {},
      (typeof PackraftData !== 'undefined' && PackraftData.ketentuanPerahu) ? { ketentuanPerahu: PackraftData.ketentuanPerahu.kapasitas } : {}
    );
    const mapFields = [
      ['pengelola', 'namaPengelola'],
      ['deskripsi', 'deskripsiPengelola'],
      ['legalitas', 'legalitas'],
      ['titik-kumpul', 'titikKumpul'],
      ['jam', 'jamOperasional'],
      ['basecamp', 'fasilitasBasecamp'],
      ['akses', 'aksesRute'],
      ['sekitar', 'fasilitasSekitar'],
      ['ketentuan-perahu', 'ketentuanPerahu'],
      ['fasilitas-tambahan', 'fasilitasTambahan']
    ];

    mapFields.forEach(function (pair) {
      document.querySelectorAll('[data-info-' + pair[0] + ']').forEach(function (el) {
        applyDbText(el, info[pair[1]], defaults[pair[1]], false);
      });
    });

    const lang = (window.I18n && window.I18n.getLanguage) ? window.I18n.getLanguage() : 'id';
    const fieldSuffix = lang === 'en' ? '_en' : '_id';
    const wellnessDefaults = (typeof PackraftData !== 'undefined' && PackraftData.wisataInfo) ? PackraftData.wisataInfo : {};

    const wellnessTitleEl = document.querySelector('#wellness [data-i18n="wellness_title"]');
    if (wellnessTitleEl) {
      const customTitle = info['wellness_title' + fieldSuffix];
      const customized = customTitle && decodeEntities(String(customTitle)) !== decodeEntities(String(wellnessDefaults.wellness_title || ''));
      if (customized) {
        wellnessTitleEl.textContent = decodeEntities(String(customTitle));
        wellnessTitleEl.setAttribute('data-db-driven', '1');
      } else {
        wellnessTitleEl.removeAttribute('data-db-driven');
      }
    }

    const wellnessDescEl = document.querySelector('#wellness [data-i18n="wellness_desc"]');
    if (wellnessDescEl) {
      const customDesc = info['wellness_desc' + fieldSuffix];
      const customized = customDesc && decodeEntities(String(customDesc)) !== decodeEntities(String(wellnessDefaults.wellness_desc || ''));
      if (customized) {
        wellnessDescEl.textContent = decodeEntities(String(customDesc));
        wellnessDescEl.setAttribute('data-db-driven', '1');
      } else {
        wellnessDescEl.removeAttribute('data-db-driven');
      }
    }
  }

  // ---- 3e. Re-render Peta & Kalender saat data berubah ----
  // Peta Leaflet dan kalender booking dibangun sekali di awal; tanpa ini, admin
  // yang mengganti titik kumpul / tanggal tutup tidak terlihat sampai reload.
  //
  // PENTING: blok ini WAJIB di atas refreshAllDynamicContent(). Kalau `let`
  // ini belum diinialisasi saat fungsi dipanggil (Temporal Dead Zone),
  // ReferenceError-nya keluar dari handler DOMContentLoaded dan menghentikan
  // SEMUA kode setelahnya — termasuk animasi reveal, scrollspy, map, testimonial
  // dan hero slider. Gejalanya: seluruh section tetap opacity: 0 / halaman kosong.
  let mapRefreshInFlight = false;
  function refreshMapIfPresent() {
    if (mapRefreshInFlight || typeof DataStore === 'undefined') return;
    const mapEl = document.getElementById('map');
    if (!mapEl || !window.L || !window.__packraftMapInstance) return;
    mapRefreshInFlight = true;
    try {
      window.__packraftMapInstance.invalidateSize();
    } catch (err) {
      /* ignore */
    } finally {
      mapRefreshInFlight = false;
    }
  }

  function refreshBookingCalendarIfOpen() {
    const modal = document.getElementById('booking-calendar-modal');
    if (modal && modal.classList && modal.classList.contains('active')) {
      try { renderBookingCalendar(); } catch (err) { /* ignore */ }
    }
  }

  // Execute dynamic rendering
  // Setiap renderer dibungkus try/catch sendiri. Sebelumnya satu nilai JSON
  // rusak di salah satu getter menghentikan seluruh DOMContentLoaded handler,
  // sehingga navbar, map, testimonial, slider, dan kalender booking ikut mati.
  const dynamicRenderers = [
    ['renderDynamicPaket', renderDynamicPaket],
    ['renderDynamicHomepageGallery', renderDynamicHomepageGallery],
    ['renderDynamicFaq', renderDynamicFaq],
    ['syncHeroBanner', syncHeroBanner],
    ['syncBrandData', syncBrandData],
    ['syncWisataInfo', syncWisataInfo],
    ['syncVideoSection', syncVideoSection]
  ];

  function refreshAllDynamicContent() {
    dynamicRenderers.forEach(function (entry) {
      try {
        entry[1]();
      } catch (err) {
        console.warn('[main.js] Gagal menjalankan "' + entry[0] + '":', err);
      }
    });
    // Render dinamis menulis ulang teks Indonesia ke DOM, menimpa terjemahan
    // i18n. Terapkan ulang terjemahan yang aktif setelah render selesai.
    reapplyTranslations();
    refreshMapIfPresent();
    refreshBookingCalendarIfOpen();
  }

  function reapplyTranslations() {
    try {
      if (window.I18n && typeof window.I18n.applyTranslations === 'function') {
        window.I18n.applyTranslations(window.I18n.getLanguage());
      }
    } catch (err) {
      console.warn('[main.js] Gagal menerapkan terjemahan:', err);
    }
  }

  refreshAllDynamicContent();

  // Re-render automatically whenever Supabase Cloud syncs new data or local tab changes
  window.addEventListener('packraft_data_updated', refreshAllDynamicContent);

  // Pergantian bahasa harus ikut diterapkan ke konten yang sudah dirender
  // dari database, bukan hanya elemen statis.
  window.addEventListener('packraft_lang_changed', refreshAllDynamicContent);

  // Hanya bereaksi untuk perubahan data situs, bukan key lain di localStorage
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key.indexOf('packraft_') === 0) {
      if (e.key === 'packraft_lang') { reapplyTranslations(); return; }
      refreshAllDynamicContent();
    }
  });

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-reserve-paket]');
    if (!btn || typeof DataStore === 'undefined') return;
    const paket = DataStore.getPaketById(btn.dataset.reservePaket);
    if (paket) openBookingCalendar(paket);
  });

  // ---- 4. Navbar Scroll Effect & Scroll Progress ----
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('nav-scroll-progress') || (function() {
    if (!navbar) return null;
    let bar = navbar.querySelector('.nav-scroll-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'nav-scroll-progress';
      bar.id = 'nav-scroll-progress';
      navbar.appendChild(bar);
    }
    return bar;
  })();

  // Throttle to one run per animation frame. These handlers read scrollHeight /
  // offsetTop / offsetHeight, so running them on every scroll tick forced
  // synchronous layout and caused jank on low-end phones.
  let navbarRafId = null;
  function checkNavbar() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
      scrollProgress.style.width = percent + '%';
    }
  }

  function requestNavbarCheck() {
    if (navbarRafId !== null) return;
    navbarRafId = requestAnimationFrame(function () {
      navbarRafId = null;
      checkNavbar();
    });
  }

  if (navbar) {
    window.addEventListener('scroll', requestNavbarCheck, { passive: true });
    checkNavbar();
    // The mobile URL bar collapsing changes innerHeight without a scroll event,
    // which left the progress bar stale.
    window.addEventListener('resize', requestNavbarCheck, { passive: true });
    window.addEventListener('orientationchange', requestNavbarCheck, { passive: true });
  }

  // ---- Back to Top (desa pages) ----
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    let backToTopRafId = null;
    function requestBackToTop() {
      if (backToTopRafId !== null) return;
      backToTopRafId = requestAnimationFrame(function () {
        backToTopRafId = null;
        backToTop.classList.toggle('visible', window.scrollY > 320);
      });
    }
    window.addEventListener('scroll', requestBackToTop, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    requestBackToTop();
  }

  // ---- Demografi bar widths (profil.html uses data-width) ----
  const demoFills = document.querySelectorAll('.demo-bar-fill[data-width]');
  if (demoFills.length > 0) {
    function fillDemoBars() {
      demoFills.forEach(function (el) {
        el.style.width = Math.min(100, Math.max(0, parseFloat(el.getAttribute('data-width')) || 0)) + '%';
      });
    }
    if (typeof IntersectionObserver !== 'undefined') {
      const demoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fillDemoBars();
            demoObserver.disconnect();
          }
        });
      }, { threshold: 0.2 });
      demoFills.forEach(function (el) { demoObserver.observe(el); });
    } else {
      fillDemoBars();
    }
  }

  const navMenu = document.getElementById('nav-menu');

  // ScrollSpy Active Link Indicator
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const spySections = [];

  navLinks.forEach(function (link) {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        spySections.push({ id: href, el: target, link: link });
      }
    }

    // Click handler: immediate glide
    link.addEventListener('click', function () {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  function updateActiveNavLink() {
    if (spySections.length === 0) return;
    const scrollPos = window.scrollY + 130;
    const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);

    let activeItem = null;

    if (isAtBottom) {
      activeItem = spySections[spySections.length - 1];
    } else {
      for (let i = 0; i < spySections.length; i++) {
        const item = spySections[i];
        const top = item.el.offsetTop;
        const height = item.el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          activeItem = item;
          break;
        }
      }
      if (!activeItem && window.scrollY < 200) {
        activeItem = spySections[0];
      }
    }

    if (activeItem) {
      navLinks.forEach(l => l.classList.remove('active'));
      activeItem.link.classList.add('active');
    }
  }

  // Same rAF throttle as the navbar: this also reads offsetTop/offsetHeight for
  // every tracked section on each scroll tick.
  let spyRafId = null;
  function requestActiveNavLink() {
    if (spyRafId !== null) return;
    spyRafId = requestAnimationFrame(function () {
      spyRafId = null;
      updateActiveNavLink();
    });
  }

  window.addEventListener('scroll', requestActiveNavLink, { passive: true });
  updateActiveNavLink();

  // ---- 5. Mobile Menu Toggle ----
  const navToggle = document.getElementById('nav-toggle');
  const navOverlay = document.getElementById('nav-overlay') || document.querySelector('.nav-overlay');

  if (navToggle && navMenu) {
    function openMenu() {
      navToggle.classList.add('active');
      navMenu.classList.add('active');
      if (navOverlay) navOverlay.classList.add('active');
      document.body.classList.add('menu-open');
      document.documentElement.classList.add('menu-open');
    }

    function closeMenu() {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      if (navOverlay) navOverlay.classList.remove('active');
      document.body.classList.remove('menu-open');
      document.documentElement.classList.remove('menu-open');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      if (navMenu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    navToggle.addEventListener('click', toggleMenu);

    if (navOverlay) {
      navOverlay.addEventListener('click', closeMenu);
      navOverlay.addEventListener('touchmove', function (e) {
        e.preventDefault();
      }, { passive: false });
    }

    // Prevent scrolling body when touching navbar area outside navMenu while open
    const navbarEl = document.getElementById('navbar');
    if (navbarEl) {
      navbarEl.addEventListener('touchmove', function (e) {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target)) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    // Close on navigation link click & immediately update active state
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        closeMenu();
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    // Auto-close on resize to desktop.
    // 1100px matches the CSS breakpoint where the inline menu is restored;
    // between 769px and 1100px the nav is still a drawer, so keep it open there.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100 && navMenu.classList.contains('active')) {
        closeMenu();
      }
    }, { passive: true });
  }

  // ---- 6. Scroll Reveal Animation ----
  var revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  var reveals = document.querySelectorAll(revealSelectors);
  if (reveals.length > 0 && typeof IntersectionObserver !== 'undefined') {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // Stagger children inside grid containers
  var staggerGrids = document.querySelectorAll(
    '.why-grid, .wellness-grid, .timeline-grid, .timeline-visual-grid, ' +
    '.sop-grid, .sop-pillars-grid, .booking-steps-grid, .testi-grid, ' +
    '.addons-grid, .gallery-grid'
  );
  if (staggerGrids.length > 0 && typeof IntersectionObserver !== 'undefined') {
    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var children = entry.target.children;
          for (var i = 0; i < children.length; i++) {
            (function (child, index) {
              child.style.opacity = '0';
              child.style.transform = 'translateY(20px)';
              child.style.transition = 'opacity 1.1s cubic-bezier(0.25,0.46,0.45,0.94), transform 1.1s cubic-bezier(0.25,0.46,0.45,0.94)';
              child.style.transitionDelay = (index * 0.15) + 's';
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  child.style.opacity = '1';
                  child.style.transform = 'translateY(0)';
                });
              });
            })(children[i], i);
          }
          staggerObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    staggerGrids.forEach(function (grid) {
      // Set initial hidden state
      var ch = grid.children;
      for (var j = 0; j < ch.length; j++) {
        ch[j].style.opacity = '0';
        ch[j].style.transform = 'translateY(20px)';
      }
      staggerObserver.observe(grid);
    });
  }

  // ---- 7. FAQ Accordion ----
  function initFaq() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      const header = item.querySelector('.faq-header');
      const body = item.querySelector('.faq-body');

      if (header && body) {
        // Remove existing listener clone if any to avoid duplicate listeners
        header.onclick = function () {
          const isActive = item.classList.contains('active');

          faqItems.forEach(function (other) {
            other.classList.remove('active');
            const otherBody = other.querySelector('.faq-body');
            if (otherBody) otherBody.style.maxHeight = null;
          });

          if (!isActive) {
            item.classList.add('active');
            body.style.maxHeight = (body.scrollHeight + 50) + 'px';
          }
          header.setAttribute('aria-expanded', isActive ? 'false' : 'true');
        };

        // .faq-header is a plain div, so keyboard and screen-reader users had no
        // way to open a question at any viewport size.
        if (!header.hasAttribute('role')) {
          header.setAttribute('role', 'button');
          header.setAttribute('tabindex', '0');
        }
        // renderDynamicFaq pre-opens the first item, so seed the state from the DOM
        // rather than assuming nothing is open.
        header.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
        header.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            header.click();
          }
        });
      }
    });
  }

  // ---- 8. Dynamic Video Pengalaman & Play Interaction ----
  function syncVideoSection() {
    if (typeof DataStore === 'undefined') return;
    const v = DataStore.getVideo();
    if (!v) return;

    const sectionTitle = document.querySelector('#video .section-header h2') || document.querySelector('#video .section-title');
    const sectionLead = document.querySelector('#video .section-header p') || document.querySelector('#video .section-lead');
    const videoThumb = document.querySelector('.video-thumb');

    const videoDefaults = (typeof PackraftData !== 'undefined' && PackraftData.video) ? PackraftData.video : {};
    applyDbText(sectionTitle, v.title, videoDefaults.title, false);
    applyDbText(sectionLead, v.subtitle, videoDefaults.subtitle, false);
    // Dynamic thumbnail detection
    let coverSrc = resolveAssetUrl(v.coverImg);
    const rawVideoUrl = v.youtubeUrl || '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = rawVideoUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!coverSrc) {
      if (videoId) {
        coverSrc = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      } else {
        coverSrc = 'assets/images/hero/hero-packraft.jpg';
      }
    }

    if (videoThumb && coverSrc) {
      const safeCover = coverSrc.replace(/"/g, '%22');
      videoThumb.style.backgroundImage = `linear-gradient(135deg, rgba(9, 26, 17, 0.45) 0%, rgba(4, 18, 22, 0.75) 100%), url("${safeCover}")`;
      videoThumb.style.backgroundSize = 'cover';
      videoThumb.style.backgroundPosition = 'center';
    }

    const videoPlayBtn = document.getElementById('video-play-btn');
    if (videoPlayBtn) {
      videoPlayBtn.onclick = function () {
        const url = v.youtubeUrl || v.embedUrl || 'https://youtube.com/@packraftingcanden';
        // Convert to embed URL
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;

        if (videoId) {
          const videoBox = document.querySelector('.video-box');
          if (videoBox) {
            videoBox.innerHTML = `
              <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
              </div>
            `;
          }
        } else {
          window.open(url, '_blank');
        }
      };
    }
  }
  syncVideoSection();

  // ---- 9. Lightbox Gallery ----
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('[data-lightbox]');
      if (trigger) {
        const src = trigger.getAttribute('data-lightbox');
        const caption = trigger.getAttribute('data-caption') || '';
        if (src) {
          lightboxImg.src = src;
          if (lightboxCaption) lightboxCaption.textContent = caption;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (lightboxImg) lightboxImg.src = '';
    }
  }

  // ---- 10. Initialize Leaflet Map with Exact River Trail (Kali Opak) ----
  const mapEl = document.getElementById('map');
  if (mapEl && typeof L !== 'undefined') {
    const brand = typeof DataStore !== 'undefined' ? DataStore.getBrandInfo() : PackraftData.brand;
    const startCoord = brand.startCoordinates || { lat: -7.932815, lng: 110.364526 };
    const finishCoord = brand.finishCoordinates || { lat: -7.956673, lng: 110.360612 };
    const riverRoute = brand.riverRoute || [
      [startCoord.lat, startCoord.lng],
      [finishCoord.lat, finishCoord.lng]
    ];

    const map = L.map('map', { scrollWheelZoom: false });
    window.__packraftMapInstance = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // River Polyline Glow Layer
    L.polyline(riverRoute, {
      color: '#06b6d4',
      weight: 10,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // River Polyline Solid Stroke
    L.polyline(riverRoute, {
      color: '#0891b2',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // River Polyline Animated Water Pulse Dash
    L.polyline(riverRoute, {
      color: '#ffffff',
      weight: 2,
      opacity: 0.9,
      dashArray: '8, 14',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Custom Start Pin Icon
    const startIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="background:#10b981;color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(16,185,129,0.7);border:3px solid #fff;font-weight:bold;font-size:15px;cursor:pointer;">
          <i class="fa-solid fa-play"></i>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Custom Rest Area Pin Icon
    const restIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="background:#f59e0b;color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(245,158,11,0.7);border:3px solid #fff;font-weight:bold;font-size:15px;cursor:pointer;">
          <i class="fa-solid fa-mug-hot"></i>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Custom Finish Pin Icon
    const finishIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="background:#ef4444;color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(239,68,68,0.7);border:3px solid #fff;font-weight:bold;font-size:15px;cursor:pointer;">
          <i class="fa-solid fa-flag-checkered"></i>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const restCoord = brand.restAreaCoordinates || { lat: -7.9423004, lng: 110.366292 };

    // Start Marker
    L.marker([startCoord.lat, startCoord.lng], { icon: startIcon }).addTo(map)
      .bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:210px;">
          <div style="background:#dcfce7;color:#16a34a;padding:3px 8px;border-radius:4px;display:inline-block;font-size:10px;font-weight:800;margin-bottom:5px;">TITIK START / MEETING POINT</div>
          <strong style="display:block;font-size:13px;color:#081c15;">${brand.meetingPoint || 'Starting Point Susur Sungai Opak'}</strong>
          <p style="font-size:11px;color:#64748b;margin:3px 0 8px;">Canden, Kapanewon Jetis, Bantul</p>
          <a href="${brand.startMapsUrl || 'https://maps.app.goo.gl/GpmTYW2wj7u5ADnQ7'}" target="_blank" style="display:inline-block;background:#10b981;color:#fff;padding:5px 12px;border-radius:6px;font-size:11px;text-decoration:none;font-weight:700;">
            Buka Google Maps &rarr;
          </a>
        </div>
      `);

    // Rest Area Marker
    L.marker([restCoord.lat, restCoord.lng], { icon: restIcon }).addTo(map)
      .bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:215px;">
          <div style="background:#fef3c7;color:#d97706;padding:3px 8px;border-radius:4px;display:inline-block;font-size:10px;font-weight:800;margin-bottom:5px;">REST AREA &amp; OUTBOUND</div>
          <strong style="display:block;font-size:13px;color:#081c15;">${brand.restAreaPoint || 'Rest Area Packrafting Canden &amp; Outbound Area'}</strong>
          <p style="font-size:11px;color:#64748b;margin:3px 0 8px;">Spot istirahat tengah rute, kelapa muda &amp; area outbound</p>
          <a href="${brand.restAreaMapsUrl || 'https://maps.app.goo.gl/9zPZVeSV58w2fNMF7'}" target="_blank" style="display:inline-block;background:#f59e0b;color:#fff;padding:5px 12px;border-radius:6px;font-size:11px;text-decoration:none;font-weight:700;">
            Buka Google Maps &rarr;
          </a>
        </div>
      `);

    // Finish Marker
    L.marker([finishCoord.lat, finishCoord.lng], { icon: finishIcon }).addTo(map)
      .bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:210px;">
          <div style="background:#fee2e2;color:#dc2626;padding:3px 8px;border-radius:4px;display:inline-block;font-size:10px;font-weight:800;margin-bottom:5px;">TITIK FINISH & BILAS</div>
          <strong style="display:block;font-size:13px;color:#081c15;">${brand.finishPoint || 'Wisata Potrobayan'}</strong>
          <p style="font-size:11px;color:#64748b;margin:3px 0 8px;">Pertemuan Sungai Opak &amp; Oya</p>
          <a href="${brand.finishMapsUrl || 'https://maps.app.goo.gl/iHi3HfNyZoqmmFkf8'}" target="_blank" style="display:inline-block;background:#ef4444;color:#fff;padding:5px 12px;border-radius:6px;font-size:11px;text-decoration:none;font-weight:700;">
            Buka Google Maps &rarr;
          </a>
        </div>
      `);

    // Fit map bounds
    const bounds = L.latLngBounds(riverRoute);
    map.fitBounds(bounds, { padding: [45, 45] });
  }

  // ---- 15. Dynamic Testimonials & Interactive Review Submission ----
  function initTestimonialSection() {
    const testiContainer = document.getElementById('testi-container');
    if (!testiContainer) return;

    // Helper: Show User Toast Notification
    function showUserToast(message, type = 'success') {
      let container = document.getElementById('user-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'user-toast-container';
        document.body.appendChild(container);
      }
      const icons = {
        success: 'fa-circle-check',
        warning: 'fa-triangle-exclamation',
        error: 'fa-circle-xmark',
        info: 'fa-circle-info'
      };
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<i class="fa-solid ${icons[type] || 'fa-circle-info'}"></i><span>${message}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // Star rating description labels
    const ratingLabels = {
      1: '1/5 — Perlu Banyak Peningkatan',
      2: '2/5 — Kurang Memuaskan',
      3: '3/5 — Cukup Baik & Standar',
      4: '4/5 — Sangat Bagus & Seru!',
      5: '5/5 — Luar Biasa & Tak Terlupakan!'
    };

    // Rata-rata & jumlah ulasan di header harus dihitung dari data, bukan
    // angka hardcoded "5.0" / "85+" yang bisa berbeda dari data asli.
    function renderTestimonialsSummary() {
      const list = (typeof DataStore !== 'undefined') ? (DataStore.getTestimonials() || []) : [];
      if (!list.length) return;
      const total = list.length;
      const sum = list.reduce((acc, t) => acc + (parseInt(t.rating) || 5), 0);
      const avg = (sum / total).toFixed(1);

      document.querySelectorAll('[data-testi-avg-rating]').forEach(el => { el.textContent = avg; });
      document.querySelectorAll('[data-testi-count]').forEach(el => { el.textContent = String(total); });
      document.querySelectorAll('[data-testi-stars-avg]').forEach(el => {
        el.setAttribute('aria-label', avg + ' dari 5 bintang');
      });
    }

    // Render Testimonials Horizontal Track (Desain Bersih & Elegan Ala Referensi)
    function renderTestimonials(highlightId = null) {
      if (typeof DataStore === 'undefined' || !testiContainer) return;
      const list = DataStore.getTestimonials() || [];
      if (list.length === 0) {
        testiContainer.innerHTML = `
          <div style="flex: 1; text-align: center; padding: 3rem 1rem; color: #64748b; background: #fff; border-radius: 12px; border: 1.5px dashed var(--gray-300);">
            <i class="fa-regular fa-comment-dots" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: #94a3b8; display: block;"></i>
            <h4 style="color: #334155; margin-bottom: 0.25rem;">Belum ada ulasan wisatawan</h4>
            <p style="margin: 0; font-size: 0.9rem;">Jadilah yang pertama memberikan ulasan &amp; rating Google untuk petualangan Packrafting di Sungai Opak Canden!</p>
          </div>
        `;
        return;
      }

      testiContainer.innerHTML = list.map(item => {
        const rating = Math.max(1, Math.min(5, parseInt(item.rating) || 5));
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          starsHtml += i <= rating 
            ? '<i class="fa-solid fa-star"></i>' 
            : '<i class="fa-regular fa-star" style="color:#e2e8f0;"></i>';
        }

        const isHighlight = highlightId && String(item.id) === String(highlightId);
        const avatarInitial = (item.avatar || (item.nama ? item.nama.charAt(0) : 'G')).toUpperCase();
        
        // Gradient color for fallback avatar circle
        const charCode = avatarInitial.charCodeAt(0) || 65;
        const hue = (charCode * 47) % 360;
        const avatarBg = `linear-gradient(135deg, hsl(${hue}, 70%, 85%), hsl(${(hue + 40) % 360}, 75%, 70%))`;
        const avatarColor = `hsl(${hue}, 80%, 25%)`;

        // Avatar: Image or Initials
        const avatarHtml = item.foto 
          ? `<img src="${escapeHtml(item.foto)}" alt="${escapeHtml(item.nama || 'Reviewer')}" class="testi-avatar-img" loading="lazy">` 
          : `<div class="testi-avatar" style="background:${avatarBg}; color:${avatarColor};">${avatarInitial}</div>`;

        // Reply / Tanggapan Resmi dari Pengelola
        const hasReply = !!(item.balasan && (typeof item.balasan === 'string' ? item.balasan.trim().length > 0 : (item.balasan.pesan && item.balasan.pesan.trim().length > 0)));
        let replyHtml = '';
        if (hasReply) {
          const replyText = typeof item.balasan === 'object' && item.balasan ? item.balasan.pesan : item.balasan;
          const replyDate = (typeof item.balasan === 'object' && item.balasan ? item.balasan.tanggal : item.balasanTanggal) || '';
          const replyAuthor = (typeof item.balasan === 'object' && item.balasan ? item.balasan.oleh : item.balasanOleh) || 'Pengelola Packrafting Canden';

          replyHtml = `
            <div class="testi-reply-box">
              <div class="testi-reply-header">
                <div class="testi-reply-badge">
                  <div class="testi-reply-avatar">
                    <img src="assets/images/logo/logo-square.png" alt="Logo Pengelola" onerror="this.parentElement.innerHTML='<i class=\\'fa-solid fa-water\\'></i>'">
                  </div>
                  <div class="testi-reply-author-info">
                    <span class="testi-reply-title">${escapeHtml(replyAuthor)}</span>
                    <span class="testi-reply-status"><i class="fa-solid fa-circle-check"></i> Respon Resmi</span>
                  </div>
                </div>
                ${replyDate ? `<span class="testi-reply-date"><i class="fa-regular fa-calendar-check"></i> ${escapeHtml(replyDate)}</span>` : ''}
              </div>
              <p class="testi-reply-text">${escapeHtml(replyText)}</p>
            </div>
          `;
        }

        // Badge "Terverifikasi" hanya untuk ulasan Google. Sebelumnya semua ulasan
        // (termasuk kiriman pengunjung) mendapat badge yang sama.
        const verifiedBadge = (item.isGoogle !== false)
          ? `<span class="testi-reviewer-badge" title="Ulasan Terverifikasi"><i class="fa-solid fa-star"></i></span>`
          : '';

        // Asal & tanggal ulasan adalah data yang dikelola admin; tampilkan agar
        // tidak jadi data mati.
        const metaBits = [];
        if (item.asal) metaBits.push(escapeHtml(item.asal));
        if (item.tanggal) metaBits.push(escapeHtml(item.tanggal));
        const reviewerMeta = metaBits.length
          ? `<span class="testi-reviewer-meta">${metaBits.join(' &bull; ')}</span>`
          : '';

        return `
          <div class="testi-card ${isHighlight ? 'new-highlight' : ''} ${hasReply ? 'has-reply' : ''}" id="testi-card-${item.id}">
            <div class="testi-card-content">
              <div class="testi-stars" aria-label="${rating} dari 5 bintang">
                ${starsHtml}
              </div>
              <p class="testi-text">
                ${escapeHtml(item.pesan || '')}
              </p>
              ${replyHtml}
            </div>
            <div class="testi-reviewer">
              <div class="testi-reviewer-avatar-wrap">
                ${avatarHtml}
                ${verifiedBadge}
              </div>
              <span class="testi-reviewer-name">${escapeHtml(item.nama || 'Wisatawan')}</span>
              ${reviewerMeta}
            </div>
          </div>
        `;
      }).join('');
    }

    // Horizontal Swipe & Drag-to-Scroll (Mulus Geser Kanan/Kiri tanpa tombol panah)
    // Pointer events instead of mousedown/mousemove/mouseup: the old handlers
    // never fired on touch, so the hasDragged click-suppression guard did
    // nothing on phones. The stray window mouseup listener also leaked.
    function initTestiSwipe(container) {
      if (!container) return;
      let isDown = false;
      let pointerId = null;
      let startX = 0;
      let scrollLeft = 0;
      let hasDragged = false;

      function endDrag() {
        if (!isDown) return;
        isDown = false;
        pointerId = null;
        container.classList.remove('is-dragging');
      }

      container.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return; // Hanya klik kiri
        isDown = true;
        pointerId = e.pointerId;
        hasDragged = false;
        container.classList.add('is-dragging');
        startX = e.clientX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      });

      container.addEventListener('pointermove', function (e) {
        if (!isDown || e.pointerId !== pointerId) return;
        const x = e.clientX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 4) {
          hasDragged = true;
        }
        container.scrollLeft = scrollLeft - walk;
      });

      container.addEventListener('pointerup', endDrag);
      container.addEventListener('pointercancel', endDrag);
      container.addEventListener('pointerleave', endDrag);

      // Cegah klik tidak disengaja saat menyeret / drag
      container.addEventListener('click', function (e) {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    }

    initTestiSwipe(testiContainer);



    // Official Google OAuth Client ID provided by user
    const GOOGLE_CLIENT_ID = '782413984770-3vlvs6ifijmps9lolfmjd5lsj2u2e9pi.apps.googleusercontent.com';

    // Helper to decode Base64Url JWT token from Google Identity Services
    function parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error('Failed to parse Google JWT token', e);
        return null;
      }
    }

    // Callback when user signs in via official Google Sign-In SDK
    function handleGoogleCredentialResponse(response) {
      if (!response || !response.credential) return;
      const payload = parseJwt(response.credential);
      if (payload && payload.email) {
        const user = {
          nama: payload.name || payload.given_name || 'Pengguna Google',
          email: payload.email,
          foto: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'G')}&background=1b4332&color=fff&size=120`,
          isGoogleVerified: true
        };
        setActiveGoogleUser(user);
        closeGoogleModal();
        showUserToast(`Berhasil masuk dengan akun Google: ${user.nama}!`, 'success');
      }
    }

    function renderGsiButtons() {
      if (typeof window.google === 'undefined' || !window.google.accounts || !window.google.accounts.id) return;
      
      const modalSlot = document.getElementById('gsi-modal-button-slot');
      if (modalSlot) {
        modalSlot.innerHTML = '';
        try {
          // Was hard-coded to 320px, which overflowed the ~301px inner width of
          // .google-auth-card on a 360px phone. Fit the slot instead.
          const slotWidth = Math.max(180, Math.floor(modalSlot.clientWidth || 320));
          window.google.accounts.id.renderButton(modalSlot, {
            type: 'standard',
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: slotWidth
          });
        } catch (e) {
          console.warn('GSI renderButton modal error:', e);
        }
      }

      const barSlot = document.getElementById('gsi-bar-button-slot');
      if (barSlot && !getActiveGoogleUser()) {
        barSlot.innerHTML = '';
        try {
          window.google.accounts.id.renderButton(barSlot, {
            type: 'standard',
            theme: 'filled_blue',
            size: 'medium',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        } catch (e) {
          console.warn('GSI renderButton bar error:', e);
        }
      }
    }

    function initGoogleIdentityServices() {
      if (typeof window.google === 'undefined' || !window.google.accounts || !window.google.accounts.id) {
        setTimeout(initGoogleIdentityServices, 350);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        renderGsiButtons();

        // Prompt Google One-Tap automatically if user is unlinked
        if (!getActiveGoogleUser()) {
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
              console.log('Google One Tap suppressed:', notification.getNotDisplayedReason());
            }
          });
        }
      } catch (err) {
        console.warn('Google Identity Services initialization warning:', err);
      }
    }

    // Google Account State Management for Reviews (Dynamic per Browser Profile)
    function getActiveGoogleUser() {
      try {
        const stored = localStorage.getItem('packraft_google_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Pembersihan otomatis: Hapus semua template dummy / akun lama yang tidak terverifikasi Google resmi
          if (
            !parsed ||
            !parsed.isGoogleVerified ||
            !parsed.email ||
            parsed.email.toLowerCase().includes('anisa') ||
            parsed.email.toLowerCase().includes('rian') ||
            parsed.email.toLowerCase().includes('contoh') ||
            parsed.email.toLowerCase() === 'fauzansad@gmail.com' ||
            (parsed.nama && (parsed.nama.includes('Anisa') || parsed.nama.includes('Rian')))
          ) {
            localStorage.removeItem('packraft_google_user');
            return null;
          }
          return parsed;
        }
      } catch (e) {}
      return null;
    }

    function setActiveGoogleUser(user) {
      try {
        if (user) {
          localStorage.setItem('packraft_google_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('packraft_google_user');
        }
      } catch (e) {}
      syncGoogleUserUI(user);
    }

    // Google Modal Helpers
    function openGoogleModal() {
      const modal = document.getElementById('modal-google-auth');
      if (modal) {
        const u = getActiveGoogleUser();
        const btnLogout = document.getElementById('btn-logout-google');
        if (btnLogout) {
          btnLogout.style.display = u ? 'inline-flex' : 'none';
        }

        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Render official Google button inside modal
        renderGsiButtons();
      }
    }

    function closeGoogleModal() {
      const modal = document.getElementById('modal-google-auth');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    function syncGoogleUserUI(user) {
      const u = (user !== undefined) ? user : getActiveGoogleUser();
      const container = document.getElementById('google-active-account-bar');
      if (!container) return;

      if (u && u.email) {
        container.className = 'google-active-account-bar connected';
        const photoSrc = u.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nama || 'User')}&background=1b4332&color=fff&size=120`;
        container.innerHTML = `
          <div class="g-account-info">
            <div class="g-account-avatar-wrap" title="Akun Google Terverifikasi">
              <img id="g-active-avatar" src="${photoSrc}" alt="Akun Google" class="g-account-avatar">
            </div>
            <div class="g-account-details">
              <div class="g-account-name">
                <span id="g-active-name">${escapeHtml(u.nama)}</span>
                <span class="g-badge-pill"><i class="fa-brands fa-google"></i> Terhubung</span>
              </div>
              <div class="g-account-email" id="g-active-email">${escapeHtml(u.email)}</div>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-sm g-switch-btn" id="btn-switch-google" title="Ganti / Keluar Akun Google">
            <i class="fa-solid fa-arrow-right-arrow-left"></i> Ganti Akun
          </button>
        `;
      } else {
        container.className = 'google-active-account-bar unlinked';
        container.innerHTML = `
          <div class="g-account-info">
            <div class="g-account-avatar-placeholder">
              <i class="fa-brands fa-google"></i>
            </div>
            <div class="g-account-details">
              <div class="g-account-name" style="color:#1e293b;">
                <span>Masuk dengan Google</span>
              </div>
              <div class="g-account-email" style="color:#64748b;">
                Hubungkan akun Google resmi Anda untuk identitas ulasan &amp; foto otomatis
              </div>
            </div>
          </div>
          <div id="gsi-bar-button-slot" style="min-height:40px;display:flex;align-items:center;">
            <button type="button" class="btn btn-primary btn-sm g-switch-btn" id="btn-switch-google">
              <i class="fa-brands fa-google"></i> Masuk dengan Google
            </button>
          </div>
        `;
        renderGsiButtons();
      }
    }

    // Global Delegated Listeners for Google Actions
    document.addEventListener('click', function (e) {
      if (e.target.closest('#btn-switch-google')) {
        e.preventDefault();
        openGoogleModal();
        return;
      }

      if (e.target.closest('#btn-close-google-modal')) {
        e.preventDefault();
        closeGoogleModal();
        return;
      }

      const modal = document.getElementById('modal-google-auth');
      if (modal && e.target === modal) {
        closeGoogleModal();
        return;
      }
    });

    // Toggle Form Collapse
    const btnToggle = document.getElementById('btn-toggle-ulasan');
    const formWrapper = document.getElementById('ulasan-form-wrapper');
    const btnTutup = document.getElementById('btn-tutup-ulasan');
    const btnCancel = document.getElementById('btn-cancel-ulasan');

    function openForm() {
      if (formWrapper) {
        formWrapper.style.display = 'block';
        setTimeout(() => {
          formWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const pesanEl = document.getElementById('ulasan-pesan');
          if (pesanEl) pesanEl.focus();
        }, 100);
      }
    }

    function closeForm() {
      if (formWrapper) {
        formWrapper.style.display = 'none';
      }
    }

    if (btnToggle) btnToggle.addEventListener('click', openForm);
    if (btnTutup) btnTutup.addEventListener('click', closeForm);
    if (btnCancel) btnCancel.addEventListener('click', closeForm);

    // Modal Logout Button Listener
    const btnLogoutGoogle = document.getElementById('btn-logout-google');
    if (btnLogoutGoogle) {
      btnLogoutGoogle.addEventListener('click', function () {
        setActiveGoogleUser(null);
        closeGoogleModal();
        showUserToast('Akun Google berhasil dilepas dari browser ini.', 'info');
      });
    }

    // Run initial UI sync & Google Identity Services SDK
    syncGoogleUserUI();
    initGoogleIdentityServices();

    // Interactive Star Rating Picker
    const starBtns = document.querySelectorAll('#rating-stars .star-btn');
    const ratingInput = document.getElementById('ulasan-rating-val');
    const ratingText = document.getElementById('rating-text');

    function updateStarsUI(val) {
      starBtns.forEach(btn => {
        const starVal = parseInt(btn.dataset.rating);
        if (starVal <= val) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      if (ratingText && ratingLabels[val]) {
        ratingText.textContent = ratingLabels[val];
      }
    }

    starBtns.forEach(btn => {
      btn.addEventListener('mouseenter', function () {
        const hoverVal = parseInt(this.dataset.rating);
        starBtns.forEach(b => {
          const bVal = parseInt(b.dataset.rating);
          if (bVal <= hoverVal) {
            b.classList.add('hover');
          } else {
            b.classList.remove('hover');
          }
        });
        if (ratingText && ratingLabels[hoverVal]) {
          ratingText.textContent = ratingLabels[hoverVal];
        }
      });

      btn.addEventListener('mouseleave', function () {
        starBtns.forEach(b => b.classList.remove('hover'));
        const currentVal = parseInt(ratingInput ? ratingInput.value : 5) || 5;
        updateStarsUI(currentVal);
      });

      btn.addEventListener('click', function () {
        const chosenVal = parseInt(this.dataset.rating);
        if (ratingInput) ratingInput.value = chosenVal;
        updateStarsUI(chosenVal);
      });
    });

    // Handle Form Submit (Only stars & review text needed, Google account is auto-integrated!)
    const formUlasan = document.getElementById('form-ulasan');
    if (formUlasan) {
      formUlasan.addEventListener('submit', function (e) {
        e.preventDefault();

        const pesanEl = document.getElementById('ulasan-pesan');
        const ratingVal = parseInt(ratingInput ? ratingInput.value : 5) || 5;
        const pesan = pesanEl ? pesanEl.value.trim() : '';

        // Validation: Only checks star rating & review message
        if (ratingVal < 1 || ratingVal > 5) {
          showUserToast('Silakan pilih rating bintang antara 1 sampai 5.', 'warning');
          return;
        }

        if (!pesan) {
          showUserToast('Mohon tuliskan ulasan pengalaman Anda.', 'warning');
          if (pesanEl) pesanEl.focus();
          return;
        }

        if (pesan.length < 5) {
          showUserToast('Ulasan terlalu singkat. Mohon tulis minimal 5 karakter.', 'warning');
          if (pesanEl) pesanEl.focus();
          return;
        }

        const activeGoogleUser = getActiveGoogleUser();
        if (!activeGoogleUser) {
          showUserToast('Silakan pilih atau masuk dengan Akun Google terlebih dahulu.', 'info');
          openGoogleModal();
          return;
        }

        const submitBtn = document.getElementById('btn-submit-ulasan');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghubungkan Google...';
        }

        setTimeout(() => {
          const newId = Date.now();
          const newReview = {
            id: newId,
            nama: activeGoogleUser.nama,
            email: activeGoogleUser.email,
            foto: activeGoogleUser.foto,
            asal: 'Ulasan Google Maps',
            rating: ratingVal,
            pesan: pesan,
            avatar: activeGoogleUser.nama.charAt(0).toUpperCase() || 'G',
            isGoogle: true,
            // Tandai asal data agar admin bisa membedakan ulasan Geographic yang
            // masuk lewat form publik dari ulasan Google yang diimpor manual.
            dariFormPublik: true,
            tanggal: new Date().toISOString().split('T')[0]
          };

          // Save into DataStore (localStorage & cloud sync)
          const currentList = DataStore.getTestimonials() || [];
          currentList.unshift(newReview);

          // Tunggu sinkronisasi cloud selesai sebelum menyatakan berhasil.
          DataStore.saveTestimonials(currentList)
            .then(function () {
              // Re-render testimonials track with new card highlighted
              renderTestimonials(newId);
              renderTestimonialsSummary();
            })
            .catch(function (err) {
              console.error('Gagal menyimpan ulasan:', err);
              showUserToast('Ulasan tersimpan di perangkat ini, tetapi gagal sinkron ke server. Coba beberapa saat lagi.', 'warning');
            });

          // Reset form fields
          pesanEl.value = '';
          if (ratingInput) ratingInput.value = '5';
          updateStarsUI(5);

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-brands fa-google"></i> Kirim Ulasan dengan Akun Google';
          }

          // Close form & show success toast
          closeForm();
          showUserToast(`Terima kasih! Ulasan & rating Google Anda (${activeGoogleUser.nama}) telah berhasil dipublikasikan.`, 'success');

          // Scroll horizontal slider to position 0 to show newly published review
          setTimeout(() => {
            if (testiContainer) {
              testiContainer.scrollTo({ left: 0, behavior: 'smooth' });
            }
          }, 150);
        }, 350);
      });
    }

    // Initial render
    renderTestimonials();
    renderTestimonialsSummary();

    // Re-render when data updates from cloud or other tabs
    window.addEventListener('packraft_data_updated', function () {
      renderTestimonials();
      renderTestimonialsSummary();
    });
  }

  // Initialize Testimonial Feature
  initTestimonialSection();

  // ---- Hero Auto-Slide Carousel (Geser Kanan ke Kiri Mulus Tak Terbatas) ----
  function initHeroSlider() {
    const slider = document.getElementById('hero-slider');
    const track = document.getElementById('hero-slider-track');
    const dotsContainer = document.getElementById('hero-slider-dots');
    if (!slider || !track) return;

    // Fetch 3 slides from DataStore or fallback
    let slidesData = (typeof DataStore !== 'undefined' && typeof DataStore.getHeroSlides === 'function')
      ? DataStore.getHeroSlides()
      : [
          { id: 1, gambar: 'assets/images/galeri/1.jpg', judul: 'Aksi Menyusuri Arus Sungai Opak' },
          { id: 2, gambar: 'assets/images/galeri/2.jpg', judul: 'Rimbun Alami Tepian Sungai' },
          { id: 3, gambar: 'assets/images/galeri/3.jpg', judul: 'Keseruan Bersama Teman' }
        ];

    if (!slidesData || slidesData.length === 0) return;
    slidesData = slidesData.slice(0, 3);
    const totalRealSlides = slidesData.length;

    // Render slides into track + clone of slide 0 for seamless forward loop
    let slidesHtml = slidesData.map((s, idx) => {
      const imgSrc = resolveAssetUrl(s.gambar) || 'assets/images/galeri/1.jpg';
      return `
        <div class="hero-slide" data-slide="${idx}">
          <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(s.judul || 'Packrafting Canden')}" class="hero-slide-img" onerror="this.onerror=null;this.src='assets/images/galeri/1.jpg';">
        </div>
      `;
    }).join('');

    // Append clone of first slide to allow right-to-left seamless transition from last to first
    const firstImg = resolveAssetUrl(slidesData[0].gambar) || 'assets/images/galeri/1.jpg';
    slidesHtml += `
      <div class="hero-slide hero-slide-clone" data-slide="clone">
        <img src="${escapeHtml(firstImg)}" alt="${escapeHtml(slidesData[0].judul || 'Packrafting Canden')}" class="hero-slide-img">
      </div>
    `;

    track.innerHTML = slidesHtml;

    // Render dots (exactly 3 dots)
    if (dotsContainer) {
      dotsContainer.innerHTML = slidesData.map((_, idx) => `
        <button type="button" class="hero-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
      `).join('');
    }

    let currentIndex = 0;
    let timer = null;
    let isTransitioning = false;
    const transitionStyle = 'transform 0.85s cubic-bezier(0.25, 1, 0.5, 1)';

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.hero-dot') : [];

    function updateDots(activeIdx) {
      dots.forEach((dot, i) => {
        if (i === activeIdx) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function moveToSlide(index, animate = true) {
      if (animate) {
        track.style.transition = transitionStyle;
        isTransitioning = true;
      } else {
        track.style.transition = 'none';
      }

      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      updateDots(currentIndex % totalRealSlides);
    }

    // Handle seamless reset when reaching clone.
    // initHeroSlider() dipanggil ulang setiap sinkronisasi cloud, jadi handler
    // sebelumnya harus dilepas dulu agar tidak menumpuk (dan slider tidak
    // selalu melompat kembali ke slide 1 setiap kali data masuk).
    const onTransitionEnd = () => {
      isTransitioning = false;
      if (currentIndex === totalRealSlides) {
        // Jump back to real slide 0 without animation
        moveToSlide(0, false);
      }
    };
    if (track.__packraftTransitionHandler) {
      track.removeEventListener('transitionend', track.__packraftTransitionHandler);
    }
    track.__packraftTransitionHandler = onTransitionEnd;
    track.addEventListener('transitionend', onTransitionEnd);

    function nextSlide() {
      if (isTransitioning) return;
      if (currentIndex >= totalRealSlides) {
        moveToSlide(0, false);
        void track.offsetWidth;
      }
      moveToSlide(currentIndex + 1, true);
    }

    function prevSlide() {
      if (isTransitioning) return;
      if (currentIndex === 0) {
        moveToSlide(totalRealSlides, false);
        void track.offsetWidth;
        moveToSlide(totalRealSlides - 1, true);
      } else {
        moveToSlide(currentIndex - 1, true);
      }
    }

    function startAutoSlide() {
      stopAutoSlide();
      // Hentikan timer milik instance slider sebelumnya, kalau ada.
      if (window.__packraftHeroTimer) {
        clearInterval(window.__packraftHeroTimer);
      }
      timer = setInterval(nextSlide, 4500);
      window.__packraftHeroTimer = timer;
    }

    function stopAutoSlide() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (window.__packraftHeroTimer) {
        clearInterval(window.__packraftHeroTimer);
        window.__packraftHeroTimer = null;
      }
    }

    // Dot click listeners
    dots.forEach((dot) => {
      dot.addEventListener('click', function () {
        const targetIndex = parseInt(this.getAttribute('data-index'), 10);
        if (!isNaN(targetIndex)) {
          moveToSlide(targetIndex, true);
          startAutoSlide();
        }
      });
    });

    // Swipe/hover target is the whole .hero section, not #hero-slider.
    // .hero-content sits on top of the slider (z-index 3 vs 1), so a finger
    // starting on the headline never reached the slider's own listeners.
    // Capture phase makes these fire no matter which child was touched.
    const heroEl = slider.closest('.hero') || slider;

    // Pause on hover, but only for a real mouse. On touch devices the browser
    // fires emulated mouseenter after a tap and may never fire mouseleave, which
    // used to leave the carousel permanently frozen after the first tap.
    // pointerenter/pointerleave expose pointerType, so touch never matches.
    heroEl.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') stopAutoSlide();
    });
    heroEl.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') startAutoSlide();
    });

    // Touch swipe support (Swipe left -> next slide right-to-left)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;

    heroEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      stopAutoSlide();
    }, { passive: true, capture: true });

    heroEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      // Horizontal intent only, so vertical scrolling is never hijacked.
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoSlide();
    }, { passive: true, capture: true });

    // A cancelled gesture (incoming call, browser UI pull-down) never fires
    // touchend, so without this the carousel would stay stopped forever.
    heroEl.addEventListener('touchcancel', () => {
      startAutoSlide();
    }, { passive: true, capture: true });

    // Initialize track position
    moveToSlide(0, false);
    startAutoSlide();
  }

  // Initialize Hero Auto Slider
  initHeroSlider();

  // Re-initialize slider whenever admin updates data
  window.addEventListener('packraft_data_updated', function (e) {
    if (!e.detail || e.detail.key === 'hero_slides' || e.detail.source === 'cloud') {
      initHeroSlider();
    }
  });

  // ---- FAQ: keep open answers correct after a reflow ----
  // The accordion animates with a pixel max-height computed at open time. After
  // a rotation or font-size change that value is stale and can clip the text.
  function refreshFaqHeights() {
    document.querySelectorAll('.faq-item.active .faq-body').forEach(function (body) {
      if (body.style.maxHeight) {
        body.style.maxHeight = body.scrollHeight + 60 + 'px';
      }
    });
  }

  if (typeof ResizeObserver !== 'undefined' && document.querySelector('.faq-body')) {
    const faqResizeObserver = new ResizeObserver(refreshFaqHeights);
    document.querySelectorAll('.faq-body').forEach(function (b) { faqResizeObserver.observe(b); });
  }
  window.addEventListener('resize', refreshFaqHeights, { passive: true });
  window.addEventListener('orientationchange', refreshFaqHeights, { passive: true });

});

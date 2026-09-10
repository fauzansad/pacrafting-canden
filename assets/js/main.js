/* ============================================
   MAIN.JS - Interactive Core
   PACKRAFTING CANDEN — Adventure on the River
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

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

    // Update Start Point Maps links
    if (brand.startMapsUrl) {
      document.querySelectorAll('[data-start-maps]').forEach(function (el) {
        el.href = brand.startMapsUrl;
        el.target = '_blank';
      });
    }

    // Update Finish Point Maps links
    if (brand.finishMapsUrl) {
      document.querySelectorAll('[data-finish-maps]').forEach(function (el) {
        el.href = brand.finishMapsUrl;
        el.target = '_blank';
      });
    }

    // Update phone text displays
    if (brand.whatsapp && !brand.whatsapp.includes('[NOMOR')) {
      document.querySelectorAll('[data-display-wa]').forEach(function (el) {
        el.textContent = brand.whatsapp;
      });
    }
  }

  // ---- 2. Dynamic Paket Wisata Rendering from DataStore ----
  function renderDynamicPaket() {
    const container = document.getElementById('paket-container');
    if (!container || typeof DataStore === 'undefined') return;

    const paketList = DataStore.getPaket().filter(p => p.status !== 'inactive');
    if (!paketList || paketList.length === 0) return;

    container.innerHTML = paketList.map(function (p, index) {
      const isFeatured = p.featured || index === 0;
      const ribbonHtml = p.badge ? `<div class="paket-ribbon">${p.badge}</div>` : (isFeatured ? `<div class="paket-ribbon">Populer</div>` : '');
      const btnClass = isFeatured ? 'btn btn-accent' : 'btn btn-outline';
      const fasilitasItems = (p.fasilitas || []).map(f => `<li><i class="fa-solid fa-circle-check"></i> ${f}</li>`).join('');
      const waUrl = DataStore.getBookingWhatsAppUrl(p.nama);

      // Handle price formatting
      let displayPrice = p.harga || '[HARGA]';
      if (!displayPrice.startsWith('Rp') && !displayPrice.startsWith('Mulai') && !displayPrice.includes('[')) {
        displayPrice = 'Rp ' + displayPrice;
      }

      let normalPriceHtml = '';
      if (p.hargaNormal) {
        normalPriceHtml = `
          <div class="paket-price-normal">
            <span>Harga Normal: <s>${p.hargaNormal}</s></span>
            <span class="badge-promo-tag">PROMO</span>
          </div>
        `;
      }

      return `
        <div class="paket-card ${isFeatured ? 'featured' : ''} reveal revealed">
          ${ribbonHtml}
          <div class="paket-header">
            <h3>${p.nama}</h3>
            <div class="paket-subtitle">${p.deskripsi || 'Sensasi Packrafting Wellness Tourism'}</div>
            <div class="paket-price">
              ${normalPriceHtml}
              <span class="amount">${displayPrice}</span>
              <span class="unit">${p.unit || '/ orang'}</span>
            </div>
          </div>
          <div class="paket-body">
            <div class="paket-meta-list">
              <div class="paket-meta-item">
                <i class="fa-regular fa-clock"></i>
                <div><strong>Durasi</strong>${p.durasi || '± 1,5 Jam (4,5 km)'}</div>
              </div>
              <div class="paket-meta-item">
                <i class="fa-solid fa-person-swimming"></i>
                <div><strong>Kapasitas</strong>1 Orang / Perahu</div>
              </div>
            </div>

            <div class="paket-features-title">Fasilitas Termasuk:</div>
            <ul class="paket-features">
              ${fasilitasItems}
            </ul>

            <div class="paket-footer">
              <a href="${waUrl}" target="_blank" data-booking-wa="${p.nama}" class="${btnClass}">
                <i class="fa-brands fa-whatsapp"></i> PILIH PAKET INI
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
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
    const heroCtaBtn = document.getElementById('main-booking-wa-btn');
    const heroSlideArt = document.querySelector('.hero-slide-art');

    // Dynamic Background Image & Focal Position
    if (heroSlideArt) {
      if (b.gambar && b.gambar.trim() !== '') {
        heroSlideArt.style.backgroundImage = `url("${b.gambar}")`;
        heroSlideArt.style.backgroundSize = 'cover';
        heroSlideArt.style.backgroundPosition = b.position || 'center';
      } else {
        heroSlideArt.style.backgroundImage = '';
        heroSlideArt.style.backgroundSize = '';
        heroSlideArt.style.backgroundPosition = '';
      }
    }

    if (b.judul && heroTitleEl) {
      // Split words for accent span if desired
      heroTitleEl.innerHTML = b.judul.replace('CANDEN', '<span>CANDEN</span>');
    }
    if (b.subheading && heroSubEl) {
      heroSubEl.textContent = b.subheading;
    }
    if (b.lead && heroLeadEl) {
      heroLeadEl.textContent = b.lead;
    }
    if (b.ctaText && heroCtaBtn) {
      heroCtaBtn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> ${b.ctaText}`;
    }
  }

  // ---- 3b. Dynamic Homepage Gallery Rendering ----
  function renderDynamicHomepageGallery() {
    const galleryGrid = document.querySelector('#galeri .gallery-grid');
    if (!galleryGrid || typeof DataStore === 'undefined') return;

    const galeriList = DataStore.getPublishedGaleri ? DataStore.getPublishedGaleri() : DataStore.getGaleri();
    if (!galeriList || galeriList.length === 0) return;

    const displayList = galeriList.slice(0, 6);
    galleryGrid.innerHTML = displayList.map(function (g, idx) {
      const isFirst = idx === 0;
      const spanClass = isFirst ? 'span-2-row span-2-col' : '';
      const hasImg = g.gambar && g.gambar.trim() !== '';

      const content = hasImg
        ? `<img src="${g.gambar}" alt="${g.judul}" style="width:100%;height:100%;object-fit:cover;">`
        : `
          <div class="gallery-card-placeholder">
            <i class="fa-solid fa-water"></i>
            <h5>${g.judul}</h5>
            <span>${g.kategori || 'Packrafting Canden'}</span>
          </div>
        `;

      return `
        <div class="gallery-card ${spanClass} reveal revealed" data-lightbox="${g.gambar || ''}" data-caption="${g.caption || g.judul}">
          ${content}
          <div class="gallery-card-overlay">
            <h5>${g.judul}</h5>
            <span>${g.kategori || 'Aktivitas Sungai Opak'}</span>
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

    faqContainer.innerHTML = faqList.map(function (item, index) {
      const isActive = index === 0;
      return `
        <div class="faq-item ${isActive ? 'active' : ''}">
          <div class="faq-header">
            <span>${item.q}</span>
            <div class="faq-icon"><i class="fa-solid fa-chevron-down"></i></div>
          </div>
          <div class="faq-body" style="${isActive ? 'max-height: 250px;' : ''}">
            <div class="faq-body-inner">
              ${item.a}
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

    document.querySelectorAll('[data-info-pengelola]').forEach(el => el.textContent = info.namaPengelola || '');
    document.querySelectorAll('[data-info-jam]').forEach(el => el.textContent = info.jamOperasional || '');
    document.querySelectorAll('[data-info-basecamp]').forEach(el => el.textContent = info.fasilitasBasecamp || '');
    document.querySelectorAll('[data-info-akses]').forEach(el => el.textContent = info.aksesRute || '');
  }

  // Execute dynamic rendering
  function refreshAllDynamicContent() {
    renderDynamicPaket();
    renderDynamicHomepageGallery();
    renderDynamicFaq();
    syncHeroBanner();
    syncBrandData();
    syncWisataInfo();
  }
  refreshAllDynamicContent();

  // Re-render automatically whenever Supabase Cloud syncs new data
  window.addEventListener('packraft_data_updated', refreshAllDynamicContent);

  // ---- 4. Navbar Scroll Effect ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    function checkNavbar() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', checkNavbar, { passive: true });
    checkNavbar();
  }

  // ---- 5. Mobile Menu Toggle ----
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navOverlay = document.getElementById('nav-overlay');

  if (navToggle && navMenu) {
    function toggleMenu() {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      if (navOverlay) navOverlay.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    navToggle.addEventListener('click', toggleMenu);

    if (navOverlay) {
      navOverlay.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Close on navigation link click
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- 6. Scroll Reveal Animation ----
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0 && typeof IntersectionObserver !== 'undefined') {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) {
      revealObserver.observe(el);
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
        };
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

    if (v.title && sectionTitle) sectionTitle.textContent = v.title;
    if (v.subtitle && sectionLead) sectionLead.textContent = v.subtitle;
    if (v.coverImg && videoThumb) {
      videoThumb.style.backgroundImage = `url("${v.coverImg}")`;
      videoThumb.style.backgroundSize = 'cover';
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

    // Start Marker
    L.marker([startCoord.lat, startCoord.lng], { icon: startIcon }).addTo(map)
      .bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:210px;">
          <div style="background:#dcfce7;color:#16a34a;padding:3px 8px;border-radius:4px;display:inline-block;font-size:10px;font-weight:800;margin-bottom:5px;">TITIK START / MEETING POINT</div>
          <strong style="display:block;font-size:13px;color:#081c15;">Starting Point Susur Sungai Opak</strong>
          <p style="font-size:11px;color:#64748b;margin:3px 0 8px;">Canden, Kapanewon Jetis, Bantul</p>
          <a href="${brand.startMapsUrl || 'https://maps.app.goo.gl/GpmTYW2wj7u5ADnQ7'}" target="_blank" style="display:inline-block;background:#10b981;color:#fff;padding:5px 12px;border-radius:6px;font-size:11px;text-decoration:none;font-weight:700;">
            Buka Google Maps &rarr;
          </a>
        </div>
      `);

    // Finish Marker
    L.marker([finishCoord.lat, finishCoord.lng], { icon: finishIcon }).addTo(map)
      .bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:210px;">
          <div style="background:#fee2e2;color:#dc2626;padding:3px 8px;border-radius:4px;display:inline-block;font-size:10px;font-weight:800;margin-bottom:5px;">TITIK FINISH & BILAS</div>
          <strong style="display:block;font-size:13px;color:#081c15;">Wisata Potrobayan</strong>
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

});

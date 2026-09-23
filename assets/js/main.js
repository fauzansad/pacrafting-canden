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

    container.innerHTML = paketList.map(function (p, idx) {
      const ribbonText = p.badge || (idx === 0 ? 'Trip Favorit' : 'Lengkap + Makan');
      const ribbonHtml = ribbonText ? `<span class="paket-ribbon">${ribbonText}</span>` : '';
      const defaultImg = idx === 0 ? 'assets/images/galeri/3.jpg' : 'assets/images/galeri/6.jpg';
      const imgSrc = p.gambar || defaultImg;
      const btnClass = idx === 0 ? 'btn btn-primary' : 'btn btn-accent';
      const fasilitasItems = (p.fasilitas || []).map(f => `<li><i class="fa-solid fa-circle-check"></i> ${f}</li>`).join('');
      const waUrl = DataStore.getBookingWhatsAppUrl(p.nama);

      // Handle price formatting
      let displayPrice = p.harga || '110.000';
      if (!displayPrice.startsWith('Rp') && !displayPrice.startsWith('Mulai') && !displayPrice.includes('[')) {
        displayPrice = 'Rp ' + displayPrice;
      }

      return `
        <div class="paket-card reveal revealed">
          <div class="paket-img-header">
            <img src="${imgSrc}" alt="${p.nama}" loading="lazy">
            ${ribbonHtml}
          </div>
          <div class="paket-header">
            <h3>${p.nama}</h3>
            <div class="paket-subtitle">${p.deskripsi || 'Sensasi Packrafting Wellness Tourism Canden'}</div>
            <div class="paket-price-box">
              <div class="paket-price">
                <span class="amount">${displayPrice}</span>
                <span class="unit">${p.unit || '/ orang'}</span>
              </div>
            </div>
          </div>
          <div class="paket-body">
            <div class="paket-meta-list">
              <div class="paket-meta-item">
                <i class="fa-regular fa-clock"></i>
                <div><strong>Durasi Trip</strong>${p.durasi || '± 1,5 Jam (4,5 km)'}</div>
              </div>
              <div class="paket-meta-item">
                <i class="fa-solid fa-sailboat"></i>
                <div><strong>Perahu</strong>1 Orang / Packraft</div>
              </div>
            </div>

            <div class="paket-features-title">Fasilitas Termasuk:</div>
            <ul class="paket-features">
              ${fasilitasItems}
            </ul>

            <div class="paket-footer">
              <a href="${waUrl}" target="_blank" data-booking-wa="${p.nama}" class="${btnClass}">
                <i class="fa-brands fa-whatsapp"></i> Reservasi ${p.nama}
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
    const heroCtaBtn = document.getElementById('main-booking-wa-btn') || document.querySelector('.hero-actions a.btn');
    const heroSlideArt = document.querySelector('.hero-slide-art');
    const heroLocationEl = document.querySelector('.hero-location');

    // Dynamic Background Image & Focal Position
    if (heroSlideArt) {
      if (b.gambar && b.gambar.trim() !== '') {
        let imgSrc = b.gambar.trim();
        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
          imgSrc = imgSrc.replace(/^\/+/, '');
        }
        heroSlideArt.style.backgroundImage = `url("${imgSrc}")`;
        heroSlideArt.style.backgroundSize = 'cover';
        heroSlideArt.style.backgroundPosition = b.position || 'center';
        heroSlideArt.style.backgroundRepeat = 'no-repeat';
      } else {
        heroSlideArt.style.backgroundImage = '';
        heroSlideArt.style.backgroundSize = '';
        heroSlideArt.style.backgroundPosition = '';
        heroSlideArt.style.backgroundRepeat = '';
        if (typeof heroSlideArt.style.removeProperty === 'function') {
          heroSlideArt.style.removeProperty('background-image');
          heroSlideArt.style.removeProperty('background-size');
          heroSlideArt.style.removeProperty('background-position');
          heroSlideArt.style.removeProperty('background-repeat');
        }
      }
    }

    if (b.judul && heroTitleEl) {
      heroTitleEl.innerHTML = b.judul.replace('CANDEN', '<span>CANDEN</span>');
    }
    if (b.subheading && heroSubEl) {
      heroSubEl.textContent = b.subheading;
    }
    if (b.lead && heroLeadEl) {
      heroLeadEl.textContent = b.lead;
    }
    if (b.ctaText && heroCtaBtn) {
      heroCtaBtn.innerHTML = `<i class="fa-solid fa-compass"></i> ${b.ctaText}`;
    }
    if (b.lokasiTag && heroLocationEl) {
      const cleanTag = b.lokasiTag.replace(/^[📍\s]+/, '');
      heroLocationEl.innerHTML = `<i class="fa-solid fa-route text-accent"></i> <span>${cleanTag}</span>`;
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
    galleryGrid.innerHTML = displayList.map(function (g, idx) {
      const isFirst = (idx === 0 && displayList.length >= 4);
      const isWide = (displayList.length === 8 && idx === 7) || (displayList.length === 6 && (idx === 4 || idx === 5));
      let spanClass = '';
      if (isFirst) spanClass = 'span-2-row span-2-col';
      else if (isWide) spanClass = 'span-2-col';

      let imgSrc = g.gambar ? g.gambar.trim() : '';
      if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
        imgSrc = imgSrc.replace(/^\/+/, '');
      }
      const hasImg = Boolean(imgSrc);

      const content = hasImg
        ? `<img src="${imgSrc}" alt="${g.judul}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;">`
        : `
          <div class="gallery-card-placeholder">
            <i class="fa-solid fa-water"></i>
            <h5>${g.judul}</h5>
            <span>${g.kategori || 'Packrafting Canden'}</span>
          </div>
        `;

      return `
        <div class="gallery-card ${spanClass} reveal revealed" data-lightbox="${imgSrc}" data-caption="${g.caption || g.judul}">
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
    document.querySelectorAll('[data-info-deskripsi]').forEach(el => el.textContent = info.deskripsiPengelola || '');
    document.querySelectorAll('[data-info-legalitas]').forEach(el => el.textContent = info.legalitas || '');
    document.querySelectorAll('[data-info-titik-kumpul]').forEach(el => el.textContent = info.titikKumpul || '');
    document.querySelectorAll('[data-info-jam]').forEach(el => el.textContent = info.jamOperasional || '');
    document.querySelectorAll('[data-info-basecamp]').forEach(el => el.textContent = info.fasilitasBasecamp || '');
    document.querySelectorAll('[data-info-akses]').forEach(el => el.textContent = info.aksesRute || '');
    document.querySelectorAll('[data-info-sekitar]').forEach(el => el.textContent = info.fasilitasSekitar || '');
  }

  // Execute dynamic rendering
  function refreshAllDynamicContent() {
    renderDynamicPaket();
    renderDynamicHomepageGallery();
    renderDynamicFaq();
    syncHeroBanner();
    syncBrandData();
    syncWisataInfo();
    syncVideoSection();
  }
  refreshAllDynamicContent();

  // Re-render automatically whenever Supabase Cloud syncs new data or local tab changes
  window.addEventListener('packraft_data_updated', refreshAllDynamicContent);
  window.addEventListener('storage', refreshAllDynamicContent);

  // ---- 4. Navbar Scroll Effect & ScrollSpy ----
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

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

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

    // Close on navigation link click & immediately update active state
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
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
    // Dynamic thumbnail detection
    let coverSrc = v.coverImg ? v.coverImg.trim() : '';
    const rawVideoUrl = v.youtubeUrl || v.embedUrl || '';
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
      if (!coverSrc.startsWith('http') && !coverSrc.startsWith('data:')) {
        coverSrc = coverSrc.replace(/^\/+/, '');
      }
      videoThumb.style.backgroundImage = `linear-gradient(135deg, rgba(9, 26, 17, 0.45) 0%, rgba(4, 18, 22, 0.75) 100%), url("${coverSrc}")`;
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

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Render Testimonials Horizontal Track
    function renderTestimonials(highlightId = null) {
      if (typeof DataStore === 'undefined' || !testiContainer) return;
      const list = DataStore.getTestimonials() || [];
      if (list.length === 0) {
        testiContainer.innerHTML = `
          <div style="flex: 1; text-align: center; padding: 3rem 1rem; color: #64748b; background: #fff; border-radius: 8px; border: 1.5px dashed var(--gray-300);">
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
            : '<i class="fa-regular fa-star" style="color:#d2ccbf;"></i>';
        }

        const isHighlight = highlightId && String(item.id) === String(highlightId);
        const avatarInitial = (item.avatar || (item.nama ? item.nama.charAt(0) : 'G')).toUpperCase();
        
        // Gradient color for fallback avatar circle
        const charCode = avatarInitial.charCodeAt(0) || 65;
        const hue = (charCode * 47) % 360;
        const avatarBg = `linear-gradient(135deg, hsl(${hue}, 70%, 85%), hsl(${(hue + 40) % 360}, 75%, 70%))`;
        const avatarColor = `hsl(${hue}, 80%, 25%)`;

        const displayDate = item.tanggal 
          ? (typeof formatTanggal === 'function' ? formatTanggal(item.tanggal) : item.tanggal) 
          : 'Ulasan Terverifikasi';

        // Avatar: Image or Initials
        const avatarHtml = item.foto 
          ? `<img src="${escapeHtml(item.foto)}" alt="${escapeHtml(item.nama || 'Reviewer')}" class="testi-avatar-img" loading="lazy">` 
          : `<div class="testi-avatar" style="background:${avatarBg}; color:${avatarColor};">${avatarInitial}</div>`;

        // Account Handle/Role
        const roleText = item.email ? item.email : (item.asal || 'Akun Google Terverifikasi');

        return `
          <div class="testi-card ${isHighlight ? 'new-highlight' : ''}" id="testi-card-${item.id}">
            <div>
              <div class="testi-card-top">
                <div class="testi-rating" aria-label="${rating} dari 5 bintang">
                  ${starsHtml}
                </div>
                <div class="testi-google-badge">
                  <i class="fa-brands fa-google"></i>
                  <span>Google Review</span>
                </div>
              </div>
              <p class="testi-quote">
                "${escapeHtml(item.pesan || '')}"
              </p>
            </div>
            <div class="testi-author">
              ${avatarHtml}
              <div style="flex:1;min-width:0;">
                <div class="testi-name-row">
                  <span class="testi-name">${escapeHtml(item.nama || 'Wisatawan')}</span>
                  <i class="fa-solid fa-circle-check" style="color:#16a34a;font-size:0.85rem;" title="Reviewer Terverifikasi Google"></i>
                </div>
                <div class="testi-role" title="${escapeHtml(roleText)}">${escapeHtml(roleText)}</div>
                <div class="testi-date"><i class="fa-regular fa-clock" style="font-size:0.65rem;margin-right:0.25rem;"></i>${displayDate}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Horizontal Slider Controls (Kesamping ala Pentingsari)
    const btnTestiPrev = document.getElementById('btn-testi-prev');
    const btnTestiNext = document.getElementById('btn-testi-next');

    if (btnTestiPrev && testiContainer) {
      btnTestiPrev.addEventListener('click', function () {
        const cardWidth = 390;
        testiContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      });
    }

    if (btnTestiNext && testiContainer) {
      btnTestiNext.addEventListener('click', function () {
        const cardWidth = 390;
        testiContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
      });
    }



    // Google Account State Management for Reviews
    const DEFAULT_GOOGLE_USER = {
      nama: 'Fauzan Sadida',
      email: 'fauzansad@gmail.com',
      foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
    };

    function getActiveGoogleUser() {
      try {
        const stored = localStorage.getItem('packraft_google_user');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return DEFAULT_GOOGLE_USER;
    }

    function setActiveGoogleUser(user) {
      try {
        localStorage.setItem('packraft_google_user', JSON.stringify(user));
      } catch (e) {}
      syncGoogleUserUI(user);
    }

    function syncGoogleUserUI(user) {
      const u = user || getActiveGoogleUser();
      const elAvatar = document.getElementById('g-active-avatar');
      const elName = document.getElementById('g-active-name');
      const elEmail = document.getElementById('g-active-email');
      if (elAvatar) elAvatar.src = u.foto || DEFAULT_GOOGLE_USER.foto;
      if (elName) elName.textContent = u.nama || DEFAULT_GOOGLE_USER.nama;
      if (elEmail) elEmail.textContent = `${u.email || DEFAULT_GOOGLE_USER.email} • Foto Profil Google`;

      document.querySelectorAll('.google-acc-item').forEach(item => {
        if (item.dataset.email === u.email) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    syncGoogleUserUI();

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

    // Google Account Switcher Modal Handlers
    const btnSwitchGoogle = document.getElementById('btn-switch-google');
    const modalGoogleAuth = document.getElementById('modal-google-auth');
    const btnCloseGoogleModal = document.getElementById('btn-close-google-modal');
    const btnCustomGoogleToggle = document.getElementById('btn-custom-google-toggle');
    const customGoogleForm = document.getElementById('google-custom-login-form');
    const btnSaveCustomGoogle = document.getElementById('btn-save-custom-google');

    if (btnSwitchGoogle && modalGoogleAuth) {
      btnSwitchGoogle.addEventListener('click', function () {
        modalGoogleAuth.style.display = 'flex';
      });
    }

    if (btnCloseGoogleModal && modalGoogleAuth) {
      btnCloseGoogleModal.addEventListener('click', function () {
        modalGoogleAuth.style.display = 'none';
      });
    }

    if (modalGoogleAuth) {
      modalGoogleAuth.addEventListener('click', function (e) {
        if (e.target === modalGoogleAuth) {
          modalGoogleAuth.style.display = 'none';
        }
      });
    }

    // Preset Google account items selection
    document.querySelectorAll('.google-acc-item').forEach(item => {
      item.addEventListener('click', function () {
        const user = {
          nama: this.dataset.name,
          email: this.dataset.email,
          foto: this.dataset.photo
        };
        setActiveGoogleUser(user);
        if (modalGoogleAuth) modalGoogleAuth.style.display = 'none';
        showUserToast(`Akun Google beralih ke: ${user.nama}`, 'info');
      });
    });

    if (btnCustomGoogleToggle && customGoogleForm) {
      btnCustomGoogleToggle.addEventListener('click', function () {
        customGoogleForm.style.display = (customGoogleForm.style.display === 'none' || !customGoogleForm.style.display) ? 'block' : 'none';
      });
    }

    if (btnSaveCustomGoogle) {
      btnSaveCustomGoogle.addEventListener('click', function () {
        const nameInput = document.getElementById('custom-google-name');
        const emailInput = document.getElementById('custom-google-email');
        const customName = nameInput ? nameInput.value.trim() : '';
        const customEmail = emailInput ? emailInput.value.trim() : '';

        if (!customName) {
          showUserToast('Masukkan nama akun Google Anda.', 'warning');
          return;
        }

        const emailVal = (customEmail && customEmail.includes('@')) ? customEmail : `${customName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(customName)}&background=1b4332&color=fff&size=120`;

        const user = {
          nama: customName,
          email: emailVal,
          foto: avatarUrl
        };

        setActiveGoogleUser(user);
        if (modalGoogleAuth) modalGoogleAuth.style.display = 'none';
        showUserToast(`Terhubung dengan Akun Google: ${customName}`, 'success');
      });
    }

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

        const submitBtn = document.getElementById('btn-submit-ulasan');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghubungkan Google...';
        }

        setTimeout(() => {
          // Auto-integrate active Google user credentials & photo
          const activeGoogleUser = getActiveGoogleUser();
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
            tanggal: new Date().toISOString().split('T')[0]
          };

          // Save into DataStore (localStorage & cloud sync)
          const currentList = DataStore.getTestimonials() || [];
          currentList.unshift(newReview);
          DataStore.saveTestimonials(currentList);

          // Re-render testimonials track with new card highlighted
          renderTestimonials(newId);

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

    // Re-render when data updates from cloud or other tabs
    window.addEventListener('packraft_data_updated', function () {
      renderTestimonials();
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
      const imgSrc = (s.gambar && s.gambar.trim() !== '') ? s.gambar.trim().replace(/^\/+/, '') : 'assets/images/galeri/1.jpg';
      return `
        <div class="hero-slide" data-slide="${idx}">
          <img src="${imgSrc}" alt="${s.judul || 'Packrafting Canden'}" class="hero-slide-img" onerror="this.onerror=null;this.src='assets/images/galeri/1.jpg';">
        </div>
      `;
    }).join('');

    // Append clone of first slide to allow right-to-left seamless transition from last to first
    const firstImg = (slidesData[0].gambar && slidesData[0].gambar.trim() !== '') ? slidesData[0].gambar.trim().replace(/^\/+/, '') : 'assets/images/galeri/1.jpg';
    slidesHtml += `
      <div class="hero-slide hero-slide-clone" data-slide="clone">
        <img src="${firstImg}" alt="${slidesData[0].judul || 'Packrafting Canden'}" class="hero-slide-img">
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

    // Handle seamless reset when reaching clone
    track.addEventListener('transitionend', () => {
      isTransitioning = false;
      if (currentIndex === totalRealSlides) {
        // Jump back to real slide 0 without animation
        moveToSlide(0, false);
      }
    });

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
      timer = setInterval(nextSlide, 4500);
    }

    function stopAutoSlide() {
      if (timer) {
        clearInterval(timer);
        timer = null;
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

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', startAutoSlide);

    // Touch swipe support (Swipe left -> next slide right-to-left)
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoSlide();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoSlide();
    }, { passive: true });

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

});

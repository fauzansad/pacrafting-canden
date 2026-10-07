/* ============================================
   ADMIN.JS - PACKRAFTING CANDEN ADMIN PANEL
   ============================================ */

// Helper to normalize image URLs for admin views (supporting both web server / and local file:// ../)
function formatAdminAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const clean = url.replace(/^\/+/, '').replace(/^\.\.\/+/, '');
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    return '/' + clean;
  }
  return '../' + clean;
}

function clearAdminSession() {
  sessionStorage.removeItem('admin_logged_in');
  sessionStorage.removeItem('admin_user');
  sessionStorage.removeItem('admin_session_time');
  sessionStorage.removeItem('admin_session_token');
}

function redirectToLogin() {
  const isFile = window.location.protocol === 'file:';
  window.location.href = isFile ? 'login.html' : '/admin/login.html';
}

function checkAuth() {
  if (window.location.pathname.includes('login')) {
    return true;
  }
  const loggedIn = sessionStorage.getItem('admin_logged_in');
  const sessionTime = sessionStorage.getItem('admin_session_time');
  const token = sessionStorage.getItem('admin_session_token');
  const now = Date.now();
  const maxSessionDuration = 2 * 60 * 60 * 1000; // 2 jam timeout

  // Token sesi dari server WAJIB ada: tanpa itu, panel tidak akan bisa
  // menyimpan apa pun karena peran anon tidak lagi punya hak tulis.
  if (!loggedIn || !sessionTime || !token || (now - parseInt(sessionTime)) > maxSessionDuration) {
    clearAdminSession();
    redirectToLogin();
    return false;
  }
  // Refresh activity timestamp
  sessionStorage.setItem('admin_session_time', now.toString());
  return true;
}

function logout() {
  if (confirm('Apakah Anda yakin ingin keluar (logout)?')) {
    clearAdminSession();
    redirectToLogin();
  }
}

// ---- Change Password Modal Feature ----
function openChangePasswordModal() {
  // Close mobile sidebar immediately if open
  const sidebar = document.querySelector('.admin-sidebar');
  const sidebarOverlay = document.querySelector('.admin-sidebar-overlay');
  if (sidebar && sidebar.classList.contains('active')) {
    sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
    document.documentElement.classList.remove('sidebar-open');
  }

  let modal = document.getElementById('change-pwd-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'change-pwd-modal';
    modal.className = 'admin-modal-overlay';

    const cred = (typeof DataStore !== 'undefined' && DataStore.getAdminCredentials) ? DataStore.getAdminCredentials() : { username: 'admin' };

    modal.innerHTML = `
      <div class="admin-modal-dialog">
        <div style="background:linear-gradient(135deg,#0b1710,#1b4332);color:#fff;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;border-top-left-radius:16px;border-top-right-radius:16px;">
          <h3 style="margin:0;font-size:1.1rem;font-family:'Plus Jakarta Sans',sans-serif;color:#fff;display:flex;align-items:center;gap:0.5rem;">
            <i class="fa-solid fa-shield-halved" style="color:#f97316;"></i> Keamanan &amp; Ganti Password
          </h3>
          <button type="button" onclick="closeChangePasswordModal()" style="background:none;border:none;color:#cbd5e1;font-size:1.25rem;cursor:pointer;padding:0.25rem;line-height:1;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="change-pwd-form" style="padding:1.5rem;" class="admin-form">
          <div class="form-group">
            <label for="cp-username">Username Admin</label>
            <input type="text" id="cp-username" value="${cred.username || 'admin'}" required>
          </div>
          <div class="form-group">
            <label for="cp-email">Gmail Admin Tertaut (untuk Reset OTP)</label>
            <input type="email" id="cp-email" value="${cred.email || 'fauzansadidaramadhan@gmail.com'}" required>
            <small style="color:#059669;display:block;margin-top:0.35rem;font-size:0.78rem;">
              <i class="fa-solid fa-envelope-circle-check"></i> Email penerima kode OTP jika lupa password
            </small>
          </div>
          <div class="form-group">
            <label for="cp-old-pwd">Password Saat Ini *</label>
            <input type="password" id="cp-old-pwd" placeholder="Masukkan password lama" required>
          </div>
          <div class="form-group">
            <label for="cp-new-pwd">Password Baru * (Min. 8 Karakter)</label>
            <input type="password" id="cp-new-pwd" placeholder="Masukkan password baru" required>
          </div>
          <div class="form-group">
            <label for="cp-confirm-pwd">Konfirmasi Password Baru *</label>
            <input type="password" id="cp-confirm-pwd" placeholder="Ulangi password baru" required>
          </div>
          <div style="display:flex;gap:0.75rem;margin-top:1.5rem;">
            <button type="submit" class="btn-admin btn-admin-primary" style="flex:1;justify-content:center;padding:0.75rem;">
              <i class="fa-solid fa-floppy-disk"></i> Simpan Password Baru
            </button>
            <button type="button" class="btn-admin btn-admin-outline" onclick="closeChangePasswordModal()" style="padding:0.75rem 1rem;">
              Batal
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Dismiss when clicking backdrop
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeChangePasswordModal();
      }
    });

    document.getElementById('change-pwd-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const rawUser = document.getElementById('cp-username').value;
      const newEmail = (document.getElementById('cp-email').value || 'fauzansadidaramadhan@gmail.com').trim();
      const oldPwd = document.getElementById('cp-old-pwd').value;
      const newPwd = document.getElementById('cp-new-pwd').value;
      const confirmPwd = document.getElementById('cp-confirm-pwd').value;

      if (typeof Security !== 'undefined') {
        if (Security.containsSqlInjection(rawUser) || Security.containsSqlInjection(oldPwd) || Security.containsSqlInjection(newPwd)) {
          showToast('Karakter atau sintaks query berbahaya terdeteksi!', 'error');
          return;
        }
      }

      const newUsername = (typeof Security !== 'undefined') ? Security.sanitizeUsername(rawUser) : rawUser.trim();

      if (!newUsername || !newEmail || !oldPwd || !newPwd || !confirmPwd) {
        showToast('Semua kolom wajib diisi dengan format valid!', 'warning');
        return;
      }

      if (newPwd.length < 8) {
        showToast('Password baru minimal 8 karakter!', 'warning');
        return;
      }

      if (newPwd !== confirmPwd) {
        showToast('Konfirmasi password tidak cocok!', 'warning');
        return;
      }

      const submitBtn = document.getElementById('change-pwd-form').querySelector('button[type="submit"]');
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : '<i class="fa-solid fa-floppy-disk"></i> Simpan Password Baru';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Cloud...';
      }

      // Verifikasi password lama & penyimpanan hash dilakukan di server, bukan
      // di browser, supaya tidak ada hash password yang terekspos di storage.
      try {
        const res = await fetch('/api/admin-save', {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, DataStore.adminAuthHeader()),
          body: JSON.stringify({
            action: 'credentials',
            currentPassword: oldPwd,
            newPassword: newPwd,
            newUsername: newUsername,
            newEmail: newEmail
          })
        });

        let payload = {};
        try { payload = await res.json(); } catch (e) {}

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }

        if (!res.ok || !payload.success) {
          showToast(payload.message || 'Gagal menyimpan kredensial ke cloud.', 'error');
          return;
        }

        sessionStorage.setItem('admin_user', payload.username || newUsername);
        showToast('Kredensial berhasil diperbarui & disinkronkan ke seluruh perangkat!', 'success');
        closeChangePasswordModal();
      } catch (err) {
        console.error('Gagal mengganti password:', err);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
        }
        showToast('Gagal menghubungi server. Periksa koneksi Anda.', 'error');
      }
    });
  } else {
    modal.style.display = 'flex';
  }

  // Sinkronkan input username & email dengan data terbaru dari cloud
  if (typeof DataStore !== 'undefined' && DataStore.getAdminCredentialsAsync) {
    DataStore.getAdminCredentialsAsync().then(c => {
      const uInput = document.getElementById('cp-username');
      const eInput = document.getElementById('cp-email');
      if (uInput && c.username) uInput.value = c.username;
      if (eInput && c.email) eInput.value = c.email;
    }).catch(() => {});
  }

  // Lock body scroll while modal is open
  document.body.classList.add('modal-open');
  document.documentElement.classList.add('modal-open');
}

function closeChangePasswordModal() {
  const modal = document.getElementById('change-pwd-modal');
  if (modal) {
    modal.style.display = 'none';
    const form = document.getElementById('change-pwd-form');
    if (form) form.reset();
  }
  document.body.classList.remove('modal-open');
  document.documentElement.classList.remove('modal-open');
}

// Close password modal on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const cpModal = document.getElementById('change-pwd-modal');
    if (cpModal && cpModal.style.display !== 'none') {
      closeChangePasswordModal();
    }
  }
});

// ---- 2. Toast Notifications ----
function showToast(message, type) {
  type = type || 'success';
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || 'fa-info'}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(function () { toast.remove(); }, 3500);
}

// ---- 3. Dashboard Statistics ----
function renderDashboardStats() {
  const slides = (typeof DataStore !== 'undefined' && typeof DataStore.getHeroSlides === 'function')
    ? DataStore.getHeroSlides()
    : [];
  const bannerCount = (Array.isArray(slides) && slides.length > 0) ? slides.length : 3;
  const paket = (typeof DataStore !== 'undefined' && typeof DataStore.getPaket === 'function')
    ? DataStore.getPaket()
    : [];
  const galeri = (typeof DataStore !== 'undefined' && typeof DataStore.getGaleri === 'function')
    ? DataStore.getGaleri()
    : [];
  const testi = (typeof DataStore !== 'undefined' && typeof DataStore.getTestimonials === 'function')
    ? DataStore.getTestimonials()
    : [];
  const faq = (typeof DataStore !== 'undefined' && typeof DataStore.getFAQ === 'function')
    ? DataStore.getFAQ()
    : [];

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('stat-banner', bannerCount);
  setEl('stat-paket', paket.length);
  setEl('stat-galeri', galeri.length);
  setEl('stat-testi', testi.length);
  setEl('stat-faq', faq.length);
}

// ---- 4. Hero Banner & 3 Photo Slots Management ----
let adminHeroSlidesState = [];
let currentPickerSlotIndex = null;

function initBannerAdminPage() {
  renderHeroSlotsAdmin();
  loadBannerHeadlineAdmin();
}

function renderHeroSlotsAdmin() {
  const container = document.getElementById('hero-slots-container');
  if (!container) return;

  adminHeroSlidesState = (typeof DataStore !== 'undefined' && typeof DataStore.getHeroSlides === 'function')
    ? DataStore.getHeroSlides()
    : [
        { id: 1, gambar: 'assets/images/galeri/1.jpg', judul: 'Aksi Menyusuri Arus Sungai Opak' },
        { id: 2, gambar: 'assets/images/galeri/2.jpg', judul: 'Rimbun Alami Tepian Sungai' },
        { id: 3, gambar: 'assets/images/galeri/3.jpg', judul: 'Keseruan Bersama Teman' }
      ];

  if (!Array.isArray(adminHeroSlidesState) || adminHeroSlidesState.length < 3) {
    adminHeroSlidesState = [
      { id: 1, gambar: 'assets/images/galeri/1.jpg', judul: 'Aksi Menyusuri Arus Sungai Opak' },
      { id: 2, gambar: 'assets/images/galeri/2.jpg', judul: 'Rimbun Alami Tepian Sungai' },
      { id: 3, gambar: 'assets/images/galeri/3.jpg', judul: 'Keseruan Bersama Teman' }
    ];
  }
  adminHeroSlidesState = adminHeroSlidesState.slice(0, 3);

  const slotLabels = ['Slot 1 • Tampil Pertama', 'Slot 2 • Tampil Kedua', 'Slot 3 • Tampil Ketiga'];
  const badgeClasses = ['slot-badge-1', 'slot-badge-2', 'slot-badge-3'];

  container.innerHTML = adminHeroSlidesState.map((slide, idx) => {
    const previewSrc = formatAdminAssetUrl(slide.gambar || 'assets/images/galeri/1.jpg');
    return `
      <div class="banner-slot-card" id="slot-card-${idx}">
        <div class="slot-header">
          <strong style="font-size:0.92rem;color:#0f172a;">Slide #${idx + 1}</strong>
          <span class="slot-badge ${badgeClasses[idx]}">${slotLabels[idx]}</span>
        </div>
        <div class="slot-preview-box">
          <img src="${escapeHtmlAdmin(previewSrc)}" id="slot-img-preview-${idx}" class="slot-preview-img" alt="Slide ${idx + 1}" onerror="this.onerror=null;this.src=this.dataset.fallback;" data-fallback="${escapeHtmlAdmin(formatAdminAssetUrl('assets/images/galeri/1.jpg'))}">
        </div>
        <div class="slot-body" style="padding:1rem;display:flex;flex-direction:column;gap:0.75rem;">
          <div class="slot-btn-group" style="display:flex;gap:0.5rem;">
            <button type="button" class="btn-admin btn-admin-primary btn-admin-sm" onclick="openGaleriPickerModal(${idx})" style="flex:1;justify-content:center;padding:0.65rem 0.5rem;font-size:0.82rem;">
              <i class="fa-solid fa-photo-film"></i> Pilih dari Galeri
            </button>
            <button type="button" class="btn-admin btn-admin-outline btn-admin-sm" onclick="document.getElementById('slot-file-input-${idx}').click()" style="flex:1;justify-content:center;padding:0.65rem 0.5rem;font-size:0.82rem;">
              <i class="fa-solid fa-upload"></i> Upload Foto
            </button>
            <input type="file" id="slot-file-input-${idx}" accept="image/*" style="display:none;" onchange="handleSlotFileUpload(${idx}, this)">
          </div>

          <!-- Hidden inputs for background data sync -->
          <input type="hidden" id="slot-url-input-${idx}" value="${escapeHtmlAdmin(slide.gambar || '')}">
          <input type="hidden" id="slot-title-input-${idx}" value="${escapeHtmlAdmin(slide.judul || '')}">
          <input type="hidden" id="slot-caption-input-${idx}" value="${escapeHtmlAdmin(slide.caption || '')}">
        </div>
      </div>
    `;
  }).join('');
}

function updateSlotImageUrl(slotIdx, url) {
  if (!adminHeroSlidesState[slotIdx]) return;
  adminHeroSlidesState[slotIdx].gambar = url.trim();
  const imgEl = document.getElementById(`slot-img-preview-${slotIdx}`);
  if (imgEl && url.trim()) {
    imgEl.src = formatAdminAssetUrl(url.trim());
  }
}

function updateSlotTitle(slotIdx, title) {
  if (!adminHeroSlidesState[slotIdx]) return;
  adminHeroSlidesState[slotIdx].judul = title.trim();
}

function handleSlotFileUpload(slotIdx, input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast(`Mengompres foto untuk Slot ${slotIdx + 1}...`, 'info');
    compressImage(file, 1600, 900, 0.78)
      .then(dataUrl => {
        adminHeroSlidesState[slotIdx].gambar = dataUrl;
        const imgEl = document.getElementById(`slot-img-preview-${slotIdx}`);
        const urlInput = document.getElementById(`slot-url-input-${slotIdx}`);
        if (imgEl) imgEl.src = dataUrl;
        if (urlInput) urlInput.value = '(Foto Hasil Upload Tersimpan)';
        showToast(`Foto berhasil dimuat pada Slot ${slotIdx + 1}. Klik "Simpan 3 Foto Banner" untuk menerapkan!`, 'success');
      })
      .catch(err => {
        console.error(err);
        showToast('Gagal memproses foto: ' + err.message, 'error');
      });
  }
}

// Modal Galeri Picker
function openGaleriPickerModal(slotIdx) {
  currentPickerSlotIndex = slotIdx;
  const modal = document.getElementById('modal-galeri-picker');
  const grid = document.getElementById('picker-gallery-grid');
  const subtitle = document.getElementById('picker-modal-subtitle');
  if (!modal || !grid) return;

  if (subtitle) {
    subtitle.innerHTML = `Pilih salah satu foto dari galeri untuk dimasukkan ke <strong>Slot #${slotIdx + 1}</strong>.`;
  }

  const galeriList = DataStore.getGaleri();
  if (!galeriList || galeriList.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:2rem;">Belum ada foto di Galeri Foto. Anda dapat mengunggah foto baru lewat tombol Upload.</p>';
  } else {
    grid.innerHTML = galeriList.map((g, idx) => {
      const imgSrc = formatAdminAssetUrl(g.gambar || 'assets/images/galeri/1.jpg');
      const title = g.judul || 'Foto Galeri';
      return `
        <div class="picker-photo-card" data-picker-index="${idx}">
          <img src="${escapeHtmlAdmin(imgSrc)}" class="picker-photo-img" alt="${escapeHtmlAdmin(title)}" onerror="this.onerror=null;this.src=this.dataset.fallback;" data-fallback="${escapeHtmlAdmin(formatAdminAssetUrl('assets/images/galeri/1.jpg'))}">
          <div class="picker-photo-info">
            <h5 class="picker-photo-title" title="${escapeHtmlAdmin(title)}">${escapeHtmlAdmin(title)}</h5>
            <span class="picker-photo-tag"><i class="fa-solid fa-check-circle"></i> Gunakan Foto Ini</span>
          </div>
        </div>
      `;
    }).join('');

    // Delegasi event, bukan onclick inline: judul berisi tanda kutip tidak lagi
    // bisa merusak markup.
    grid.querySelectorAll('[data-picker-index]').forEach(function (card) {
      card.addEventListener('click', function () {
        const item = galeriList[parseInt(this.getAttribute('data-picker-index'), 10)];
        if (item) selectPhotoFromGallery(item.gambar || '', item.judul || '');
      });
    });
  }

  modal.classList.add('active');
}

function closeGaleriPickerModal() {
  const modal = document.getElementById('modal-galeri-picker');
  if (modal) modal.classList.remove('active');
  currentPickerSlotIndex = null;
}

function selectPhotoFromGallery(imgUrl, title) {
  if (currentPickerSlotIndex === null || !adminHeroSlidesState[currentPickerSlotIndex]) return;

  adminHeroSlidesState[currentPickerSlotIndex].gambar = imgUrl;
  if (title) adminHeroSlidesState[currentPickerSlotIndex].judul = title;

  // Update DOM elements
  const imgEl = document.getElementById(`slot-img-preview-${currentPickerSlotIndex}`);
  const urlInput = document.getElementById(`slot-url-input-${currentPickerSlotIndex}`);
  const titleInput = document.getElementById(`slot-title-input-${currentPickerSlotIndex}`);

  if (imgEl) imgEl.src = formatAdminAssetUrl(imgUrl);
  if (urlInput) urlInput.value = imgUrl;
  if (titleInput && title) titleInput.value = title;

  closeGaleriPickerModal();
  showToast(`Foto berhasil dipilih untuk Slot #${currentPickerSlotIndex + 1}! Klik "Simpan 3 Foto Banner".`, 'success');
}

async function saveAllHeroSlides() {
  const btn = document.getElementById('btn-save-hero-slides');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Cloud...';
  }

  // Pastikan state terisi 3 slot sebelum disimpan, supaya pemanggilan dari
  // halaman lain (mis. tombol reset) tidak melempar TypeError.
  if (!Array.isArray(adminHeroSlidesState) || adminHeroSlidesState.length < 3) {
    renderHeroSlotsAdmin();
  }

  // Ensure current inputs are synced
  for (let i = 0; i < 3; i++) {
    if (!adminHeroSlidesState[i]) adminHeroSlidesState[i] = { id: i + 1, gambar: '', judul: '', caption: '' };
    const urlInput = document.getElementById(`slot-url-input-${i}`);
    const titleInput = document.getElementById(`slot-title-input-${i}`);
    const captionInput = document.getElementById(`slot-caption-input-${i}`);
    if (urlInput && urlInput.value.trim() && !urlInput.value.startsWith('(Foto Hasil')) {
      adminHeroSlidesState[i].gambar = urlInput.value.trim().replace(/^\/+/, '');
    }
    if (titleInput) {
      adminHeroSlidesState[i].judul = titleInput.value.trim();
    }
    // caption ikut dipertahankan; sebelumnya hilang setiap kali admin menyimpan.
    if (captionInput && captionInput.value.trim()) {
      adminHeroSlidesState[i].caption = captionInput.value.trim();
    }
    adminHeroSlidesState[i].id = i + 1;
  }

  try {
    showToast('Menyimpan 3 foto banner ke cloud database...', 'info');
    await DataStore.saveHeroSlides(adminHeroSlidesState);
    showToast('3 Foto banner berhasil diperbarui dan aktif di website!', 'success');
  } catch (err) {
    console.error('Gagal menyimpan hero slides:', err);
    showToast('Gagal menyimpan: ' + (err.message || err), 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

async function resetHeroSlidesToDefault() {
  if (!confirm('Apakah Anda yakin ingin mereset 3 banner ke foto default galeri Canden?')) return;
  adminHeroSlidesState = [
    { id: 1, gambar: 'assets/images/galeri/1.jpg', judul: 'Aksi Menyusuri Arus Sungai Opak' },
    { id: 2, gambar: 'assets/images/galeri/2.jpg', judul: 'Rimbun Alami Tepian Sungai' },
    { id: 3, gambar: 'assets/images/galeri/3.jpg', judul: 'Keseruan Bersama Teman' }
  ];
  await saveAllHeroSlides();
  renderHeroSlotsAdmin();
}

// Headline Text Admin Sync
function loadBannerHeadlineAdmin() {
  const banners = DataStore.getBanners();
  if (!banners || banners.length === 0) return;
  const b = banners[0];

  const setVal = (id, val, fallback) => {
    const el = document.getElementById(id);
    if (el) el.value = val || fallback || '';
  };

  setVal('banner-judul', b.judul, 'PACKRAFTING CANDEN');
  setVal('banner-sub', b.subheading, 'Adventure on the River');
  setVal('banner-lead', b.lead, '');
  setVal('banner-cta', b.ctaText, 'JELAJAHI PAKET WISATA');
  setVal('banner-lokasi', b.lokasiTag, 'Rute Sungai Opak • 4,5 KM (± 1,5 Jam) • Canden ke Potrobayan');
  setVal('banner-cta-link', b.ctaLink, '#paket');
  setVal('banner-gambar', b.gambar, '');
}

async function saveBannerHeadlineText() {
  const btn = document.getElementById('btn-save-banner-text');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
  }

  // Pertahankan banner lain yang mungkin tersimpan; sebelumnya seluruh array
  // ditimpa menjadi satu elemen.
  const banners = DataStore.getBanners().map(function (x) { return Object.assign({}, x); });
  const b = banners[0] || Object.assign({}, PackraftData.banners[0], { id: 1, status: 'active', urutan: 1 });

  b.judul = (document.getElementById('banner-judul') ? document.getElementById('banner-judul').value.trim() : '') || 'PACKRAFTING CANDEN';
  b.subheading = document.getElementById('banner-sub') ? document.getElementById('banner-sub').value.trim() : 'Adventure on the River';
  b.lead = document.getElementById('banner-lead') ? document.getElementById('banner-lead').value.trim() : '';
  b.ctaText = document.getElementById('banner-cta') ? document.getElementById('banner-cta').value.trim() : 'JELAJAHI PAKET WISATA';
  b.lokasiTag = document.getElementById('banner-lokasi') ? document.getElementById('banner-lokasi').value.trim() : '';

  const ctaLinkInput = document.getElementById('banner-cta-link');
  if (ctaLinkInput) b.ctaLink = ctaLinkInput.value.trim();
  const gambarInput = document.getElementById('banner-gambar');
  if (gambarInput) b.gambar = gambarInput.value.trim();

  // Simpan seluruh array, bukan hanya elemen pertama.
  banners[0] = b;

  try {
    showToast('Menyimpan teks headline banner...', 'info');
    await DataStore.saveBanners(banners);
    showToast('Teks headline banner berhasil disimpan!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Gagal menyimpan teks: ' + (err.message || err), 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

// Backward compatibility helper
function renderBannerList() {
  if (document.getElementById('hero-slots-container')) {
    initBannerAdminPage();
  }
}

let currentBannerImageData = '';

// ---- Helper: Client-side Image Resizing & Compression ----
function compressImage(file, maxWidth = 1600, maxHeight = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File bukan gambar yang valid'));
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

// ---- 5. Paket Wisata Management ----
function renderPaketAdmin() {
  const container = document.getElementById('paket-admin-list');
  if (!container) return;

  const paketList = DataStore.getPaket();
  container.innerHTML = paketList.map(function (p) {
      const formattedHarga = p.harga ? (p.harga.startsWith('Rp') ? p.harga : 'Rp ' + p.harga) : '-';
      const normalHarga = (p.hargaNormal && p.hargaNormal !== p.harga)
        ? `<br><small style="color:#94a3b8;text-decoration:line-through;">${escapeHtmlAdmin(p.hargaNormal)}</small>`
        : '';
      const statusBadge = (p.status === 'inactive')
        ? '<span style="display:inline-block;background:#fef2f2;color:#dc2626;padding:0.1rem 0.45rem;border-radius:4px;font-size:0.7rem;font-weight:700;border:1px solid #fecaca;">Disembunyikan</span>'
        : '<span style="display:inline-block;background:#ecfdf5;color:#059669;padding:0.1rem 0.45rem;border-radius:4px;font-size:0.7rem;font-weight:700;border:1px solid #a7f3d0;">Tampil</span>';
      return `
      <tr>
        <td><strong>${escapeHtmlAdmin(p.nama)}</strong> ${statusBadge}<br><small style="color:#64748b;">${escapeHtmlAdmin(p.level || '')}</small></td>
        <td><span style="color:#ea580c;font-weight:700;">${escapeHtmlAdmin(formattedHarga)}</span>${normalHarga}</td>
        <td>${escapeHtmlAdmin(p.durasi || '-')}</td>
        <td>${p.fasilitas ? p.fasilitas.length : 0} Fasilitas</td>
        <td>
          <div style="display:flex;gap:0.4rem;">
            <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editPaket(${p.id})"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deletePaket(${p.id})"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

const PAKET_FORM_FIELDS = [
  'paket-nama', 'paket-badge', 'paket-harga-normal', 'paket-harga', 'paket-unit',
  'paket-durasi', 'paket-level', 'paket-gambar', 'paket-min-peserta',
  'paket-max-peserta', 'paket-usia-min', 'paket-deskripsi', 'paket-fasilitas',
  'paket-bawaan', 'paket-status'
];

function setPaketFormValues(values) {
  PAKET_FORM_FIELDS.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = values[id] !== undefined ? values[id] : '';
  });
}

function readPaketFormValues() {
  const get = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };
  const lines = (id) => get(id).split('\n').map(s => s.trim()).filter(Boolean);

  return {
    nama: get('paket-nama'),
    badge: get('paket-badge'),
    hargaNormal: get('paket-harga-normal'),
    harga: get('paket-harga'),
    unit: get('paket-unit') || '/ orang',
    durasi: get('paket-durasi'),
    level: get('paket-level'),
    gambar: get('paket-gambar'),
    minPeserta: get('paket-min-peserta'),
    maxPeserta: get('paket-max-peserta'),
    usiaMin: get('paket-usia-min'),
    deskripsi: get('paket-deskripsi'),
    fasilitas: lines('paket-fasilitas'),
    yangPerluDihadirkan: lines('paket-bawaan'),
    status: get('paket-status') || 'active'
  };
}

function addPaket() {
  const form = document.getElementById('paket-form');
  if (form) {
    form.style.display = 'block';
    form.dataset.mode = 'add';
    form.dataset.editId = '';
    setPaketFormValues({
      'paket-level': 'Pemula & Keluarga',
      'paket-unit': '/ orang',
      'paket-status': 'active'
    });
    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }
}

function editPaket(id) {
  const paket = DataStore.getPaketById(id);
  if (!paket) return;

  const form = document.getElementById('paket-form');
  if (form) {
    form.style.display = 'block';
    form.dataset.mode = 'edit';
    form.dataset.editId = id;
    setPaketFormValues({
      'paket-nama': paket.nama || '',
      'paket-badge': paket.badge || '',
      'paket-harga-normal': paket.hargaNormal || '',
      'paket-harga': paket.harga || '',
      'paket-unit': paket.unit || '',
      'paket-durasi': paket.durasi || '',
      'paket-level': paket.level || '',
      'paket-gambar': paket.gambar || '',
      'paket-min-peserta': paket.minPeserta || '',
      'paket-max-peserta': paket.maxPeserta || '',
      'paket-usia-min': paket.usiaMin || '',
      'paket-deskripsi': paket.deskripsi || '',
      'paket-fasilitas': (paket.fasilitas || []).join('\n'),
      'paket-bawaan': (paket.yangPerluDihadirkan || []).join('\n'),
      'paket-status': paket.status || 'active'
    });
    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }
}

async function savePaket() {
  const form = document.getElementById('paket-form');
  if (!form) return;

  const mode = form.dataset.mode;
  const values = readPaketFormValues();

  if (!values.nama) { showToast('Nama paket harus diisi', 'error'); return; }
  if (!values.harga) { showToast('Harga finale harus diisi', 'error'); return; }

  const paketList = DataStore.getPaket().map(function (p) { return Object.assign({}, p); });

  if (mode === 'edit') {
    const id = parseInt(form.dataset.editId, 10);
    const index = paketList.findIndex(p => p.id === id);
    if (index === -1) { showToast('Paket tidak ditemukan', 'error'); return; }
    paketList[index] = Object.assign({}, paketList[index], values);
  } else {
    paketList.push(Object.assign({}, values, {
      id: DataStore.generateId(paketList),
      featured: false
    }));
  }

  try {
    await DataStore.savePaket(paketList);
    form.style.display = 'none';
    renderPaketAdmin();
    showToast(mode === 'edit' ? 'Paket berhasil diperbarui' : 'Paket baru berhasil ditambahkan', 'success');
  } catch (err) {
    console.error('Gagal menyimpan paket:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

async function deletePaket(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus paket ini?')) return;
  const list = DataStore.getPaket().filter(p => p.id !== id);
  try {
    await DataStore.savePaket(list);
    showToast('Paket berhasil dihapus', 'success');
    renderPaketAdmin();
  } catch (err) {
    console.error('Gagal menghapus paket:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

function normalizeDateLines(value) {
  return (value || '')
    .split(/\r?\n|,/)
    .map(d => d.trim())
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .filter((d, index, arr) => arr.indexOf(d) === index)
    .sort();
}

function loadOperationScheduleAdmin() {
  if (typeof DataStore === 'undefined' || typeof DataStore.getOperationSchedule !== 'function') return;
  const schedule = DataStore.getOperationSchedule();
  const datesEl = document.getElementById('operation-dates-list');
  const reasonEl = document.getElementById('operation-closed-reason');
  if (datesEl) datesEl.value = (schedule.operationDates || []).join('\n');
  if (reasonEl) reasonEl.value = schedule.closedReason || '';
}

function addOperationDate() {
  const input = document.getElementById('operation-date-input');
  const list = document.getElementById('operation-dates-list');
  if (!input || !list || !input.value) {
    showToast('Pilih tanggal terlebih dahulu', 'warning');
    return;
  }
  const dates = normalizeDateLines(list.value + '\n' + input.value);
  list.value = dates.join('\n');
  input.value = '';
}

function saveOperationScheduleAdmin() {
  if (typeof DataStore === 'undefined' || typeof DataStore.saveOperationSchedule !== 'function') return;
  const datesEl = document.getElementById('operation-dates-list');
  const reasonEl = document.getElementById('operation-closed-reason');
  const operationDates = normalizeDateLines(datesEl ? datesEl.value : '');
  const closedReason = (reasonEl && reasonEl.value.trim()) || 'Tanggal ini belum dijadwalkan beroperasi oleh Packrafting Canden.';
  DataStore.saveOperationSchedule({ operationDates, closedReason })
    .then(() => showToast('Jadwal operasional berhasil disimpan', 'success'))
    .catch(() => showToast('Jadwal tersimpan lokal, tetapi sinkron cloud gagal', 'warning'));
  if (datesEl) datesEl.value = operationDates.join('\n');
}

// ---- 6. Kontak & Rute Settings ----
function loadKontakAdmin() {
  const brand = DataStore.getBrandInfo();
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v || '';
  };

  setVal('kontak-start-name', brand.meetingPoint);
  setVal('kontak-start-url', brand.startMapsUrl);
  setVal('kontak-rest-name', brand.restAreaPoint);
  setVal('kontak-rest-url', brand.restAreaMapsUrl);
  setVal('kontak-finish-name', brand.finishPoint);
  setVal('kontak-finish-url', brand.finishMapsUrl);
  setVal('kontak-wa', brand.whatsapp);
  setVal('kontak-email', brand.email);
  setVal('kontak-ig', brand.instagram);
  setVal('kontak-tiktok', brand.tiktok);
  setVal('kontak-youtube', brand.youtube);
}

async function saveKontakAdmin() {
  const brand = Object.assign({}, DataStore.getBrandInfo());
  brand.meetingPoint = document.getElementById('kontak-start-name').value.trim();
  brand.startMapsUrl = document.getElementById('kontak-start-url').value.trim();
  if (document.getElementById('kontak-rest-name')) {
    brand.restAreaPoint = document.getElementById('kontak-rest-name').value.trim();
  }
  if (document.getElementById('kontak-rest-url')) {
    brand.restAreaMapsUrl = document.getElementById('kontak-rest-url').value.trim();
  }
  brand.finishPoint = document.getElementById('kontak-finish-name').value.trim();
  brand.finishMapsUrl = document.getElementById('kontak-finish-url').value.trim();
  brand.whatsapp = document.getElementById('kontak-wa').value.trim();
  brand.email = document.getElementById('kontak-email').value.trim();
  brand.instagram = document.getElementById('kontak-ig').value.trim();
  brand.tiktok = document.getElementById('kontak-tiktok').value.trim();
  brand.youtube = document.getElementById('kontak-youtube').value.trim();

  // Cegah nomor WhatsApp kosong / placeholder: tanpa ini semua tautan booking
  // di situs menghasilkan wa.me/[NOMOR_WHATSAPP] yang tidak bisa diklik.
  if (!brand.whatsapp || brand.whatsapp.includes('[')) {
    showToast('Nomor WhatsApp wajib diisi dengan angka yang valid!', 'error');
    return;
  }

  try {
    await DataStore.saveBrandInfo(brand);
    showToast('Pengaturan rute sungai, kontak & WhatsApp berhasil disimpan!', 'success');
  } catch (err) {
    console.error('Gagal menyimpan kontak:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

// ---- 7. Galeri Foto Management -----
let currentGaleriImageData = '';
let currentGaleriFilter = 'all';

function filterGaleriAdmin(status, btn) {
  currentGaleriFilter = status;
  if (btn) {
    document.querySelectorAll('#galeri-filter-tabs button').forEach(b => {
      b.classList.remove('btn-admin-primary');
      b.classList.add('btn-admin-outline');
    });
    btn.classList.remove('btn-admin-outline');
    btn.classList.add('btn-admin-primary');
  }
  renderGaleriAdmin();
}

async function toggleGaleriStatus(id) {
  const list = DataStore.getGaleri().map(function (g) { return Object.assign({}, g); });
  const item = list.find(g => g.id === id);
  if (!item) return;

  const isCurrentlyActive = (item.status !== 'hidden');
  item.status = isCurrentlyActive ? 'hidden' : 'active';
  try {
    await DataStore.saveGaleri(list);
    showToast(`Foto "${item.judul}" ${item.status === 'active' ? 'DITAMPILKAN di website' : 'TIDAK DITAMPILKAN (disembunyikan)'}!`, item.status === 'active' ? 'success' : 'warning');
    renderGaleriAdmin();
  } catch (err) {
    console.error('Gagal mengubah status galeri:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
    renderGaleriAdmin();
  }
}

function renderGaleriAdmin() {
  const container = document.getElementById('galeri-admin-grid');
  if (!container) return;

  const galeriList = DataStore.getGaleri();

  // Update counters
  const countAll = galeriList.length;
  const countActive = galeriList.filter(g => g.status !== 'hidden').length;
  const countHidden = galeriList.filter(g => g.status === 'hidden').length;

  const elAll = document.getElementById('count-all');
  const elActive = document.getElementById('count-active');
  const elHidden = document.getElementById('count-hidden');
  if (elAll) elAll.textContent = countAll;
  if (elActive) elActive.textContent = countActive;
  if (elHidden) elHidden.textContent = countHidden;

  if (galeriList.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:2rem;">Belum ada foto galeri. Klik "Tambah Foto" untuk mengunggah.</p>';
    return;
  }

  // Filter based on active tab
  let filtered = galeriList;
  if (currentGaleriFilter === 'active') {
    filtered = galeriList.filter(g => g.status !== 'hidden');
  } else if (currentGaleriFilter === 'hidden') {
    filtered = galeriList.filter(g => g.status === 'hidden');
  }

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#64748b;padding:2rem;">Tidak ada foto dengan status ${currentGaleriFilter === 'active' ? '"Ditampilkan"' : '"Disembunyikan"'}.</p>`;
    return;
  }

  container.innerHTML = filtered.map(function (g) {
    let imgSrc = formatAdminAssetUrl(g.gambar);
    if (!imgSrc) {
      imgSrc = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60';
    }

    const isShown = (g.status !== 'hidden');
    const statusBadge = isShown
      ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;background:#ecfdf5;color:#059669;padding:0.2rem 0.55rem;border-radius:6px;font-size:0.75rem;font-weight:700;border:1px solid #a7f3d0;"><i class="fa-solid fa-circle-check"></i> Ditampilkan</span>`
      : `<span style="display:inline-flex;align-items:center;gap:0.3rem;background:#fef2f2;color:#dc2626;padding:0.2rem 0.55rem;border-radius:6px;font-size:0.75rem;font-weight:700;border:1px solid #fecaca;"><i class="fa-solid fa-eye-slash"></i> Disembunyikan</span>`;

    const toggleBtn = isShown
      ? `<button class="btn-admin btn-admin-outline btn-admin-sm" title="Klik untuk sembunyikan dari website" onclick="toggleGaleriStatus(${g.id})" style="color:#dc2626;border-color:#fca5a5;padding:0.25rem 0.5rem;font-size:0.75rem;"><i class="fa-solid fa-eye-slash"></i> Sembunyikan</button>`
      : `<button class="btn-admin btn-admin-primary btn-admin-sm" title="Klik untuk tampilkan di website" onclick="toggleGaleriStatus(${g.id})" style="background:#059669;border-color:#059669;padding:0.25rem 0.5rem;font-size:0.75rem;"><i class="fa-solid fa-eye"></i> Tampilkan</button>`;

    const cardStyle = isShown ? '' : 'style="opacity:0.8;border:1.5px dashed #f87171;background:#fffaf0;"';

    return `
      <div class="media-item" ${cardStyle}>
        <div style="position:relative;">
          <img src="${escapeHtmlAdmin(imgSrc)}" alt="${escapeHtmlAdmin(g.judul)}" onerror="this.onerror=null;this.src=this.dataset.fallback;" data-fallback="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60" style="height:150px;width:100%;object-fit:cover;">
          <div style="position:absolute;top:8px;right:8px;">
            ${statusBadge}
          </div>
        </div>
        <div class="media-item-info">
          <h4 class="media-item-title">${escapeHtmlAdmin(g.judul)}</h4>
          <div style="font-size:0.775rem;color:#64748b;margin-bottom:0.5rem;">
            <span><i class="fa-solid fa-tag"></i> ${escapeHtmlAdmin(g.kategori || 'Petualangan')}</span>
          </div>
          <div class="media-item-meta" style="flex-wrap:wrap;gap:0.4rem;padding-top:0.4rem;border-top:1px solid #f1f5f9;">
            ${toggleBtn}
            <div style="display:flex;gap:0.25rem;margin-left:auto;">
              <button class="btn-admin btn-admin-outline btn-admin-sm" title="Edit Foto" onclick="editGaleriAdmin(${g.id})"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-admin btn-admin-danger btn-admin-sm" title="Hapus Foto" onclick="deleteGaleriAdmin(${g.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function addGaleriAdmin() {
  const form = document.getElementById('galeri-form');
  if (form) {
    form.style.display = 'block';
    form.dataset.mode = 'add';
    form.dataset.editId = '';
    currentGaleriImageData = '';
    document.getElementById('galeri-judul').value = '';
    document.getElementById('galeri-kategori').value = 'Aktivitas';
    document.getElementById('galeri-deskripsi').value = '';
    if (document.getElementById('galeri-status')) {
      document.getElementById('galeri-status').value = 'active';
    }
    const prev = document.getElementById('galeri-preview-img');
    if (prev) prev.innerHTML = '';
    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }
}

function editGaleriAdmin(id) {
  const galeri = DataStore.getGaleriById(id);
  if (!galeri) return;

  const form = document.getElementById('galeri-form');
  if (form) {
    form.style.display = 'block';
    form.dataset.mode = 'edit';
    form.dataset.editId = id;
    currentGaleriImageData = galeri.gambar || '';
    document.getElementById('galeri-judul').value = galeri.judul || '';
    document.getElementById('galeri-kategori').value = galeri.kategori || 'Kegiatan Desa';
    document.getElementById('galeri-deskripsi').value = galeri.caption || galeri.deskripsi || '';
    if (document.getElementById('galeri-status')) {
      document.getElementById('galeri-status').value = (galeri.status === 'hidden') ? 'hidden' : 'active';
    }
    
    const prev = document.getElementById('galeri-preview-img');
    if (prev && galeri.gambar) {
      let prevSrc = formatAdminAssetUrl(galeri.gambar);
      prev.innerHTML = `<img src="${prevSrc}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60';" style="max-height:120px;border-radius:8px;margin-top:0.75rem;">`;
    }
    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }
}

async function saveGaleriAdmin() {
  const form = document.getElementById('galeri-form');
  if (!form) return;
  const mode = form.dataset.mode;
  const judul = document.getElementById('galeri-judul').value.trim();
  const kategori = document.getElementById('galeri-kategori').value;
  const deskripsi = document.getElementById('galeri-deskripsi').value.trim();
  const status = document.getElementById('galeri-status') ? document.getElementById('galeri-status').value : 'active';

  if (!judul) {
    showToast('Judul foto harus diisi!', 'error');
    return;
  }

  const list = DataStore.getGaleri().map(function (g) { return Object.assign({}, g); });

  if (mode === 'edit') {
    const id = parseInt(form.dataset.editId, 10);
    const item = list.find(g => g.id === id);
    if (item) {
      item.judul = judul;
      item.kategori = kategori;
      item.caption = deskripsi;
      item.deskripsi = deskripsi;
      item.status = status;
      if (currentGaleriImageData) item.gambar = currentGaleriImageData;
    }
  } else {
    list.unshift({
      id: DataStore.generateId(list),
      judul: judul,
      kategori: kategori,
      caption: deskripsi,
      deskripsi: deskripsi,
      gambar: currentGaleriImageData || '',
      status: status
    });
  }

  try {
    await DataStore.saveGaleri(list);
    form.style.display = 'none';
    currentGaleriImageData = '';
    const prev = document.getElementById('galeri-preview-img');
    if (prev) prev.innerHTML = '';
    renderGaleriAdmin();
    showToast(mode === 'edit' ? 'Foto galeri berhasil diperbarui!' : 'Foto baru berhasil ditambahkan ke galeri!', 'success');
  } catch (err) {
    console.error('Gagal menyimpan galeri:', err);
    // Jangan diam-diam memotong daftar foto jadi 15 item; itu membuat data
    // hilang tanpa sepengetahuan admin.
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

async function deleteGaleriAdmin(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus foto galeri ini?')) return;
  const list = DataStore.getGaleri().filter(g => g.id !== id);
  try {
    await DataStore.saveGaleri(list);
    showToast('Foto galeri berhasil dihapus', 'success');
    renderGaleriAdmin();
  } catch (err) {
    console.error('Gagal menghapus foto galeri:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

// Galeri file upload listener setup with automatic compression
function initGaleriFileListener() {
  const fileInput = document.getElementById('galeri-file');
  if (fileInput) {
    fileInput.onchange = function(e) {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const prev = document.getElementById('galeri-preview-img');
        if (prev) prev.innerHTML = '<span style="color:#0e7490;font-size:0.85rem;"><i class="fa-solid fa-spinner fa-spin"></i> Mengompres dan mengoptimalkan foto...</span>';

        compressImage(file, 960, 720, 0.70)
          .then(dataUrl => {
            currentGaleriImageData = dataUrl;
            if (prev) {
              prev.innerHTML = `
                <div style="margin-top:0.75rem;">
                  <img src="${currentGaleriImageData}" style="max-height:130px;border-radius:8px;border:1px solid #cbd5e1;object-fit:cover;">
                  <div style="font-size:0.75rem;color:#10b981;font-weight:600;margin-top:0.25rem;"><i class="fa-solid fa-circle-check"></i> Foto berhasil dioptimalkan & siap disimpan</div>
                </div>
              `;
            }
            showToast('Foto berhasil dimuat & dioptimalkan!', 'info');
          })
          .catch(err => {
            console.error(err);
            if (prev) prev.innerHTML = '';
            showToast('Gagal memproses foto: ' + err.message, 'error');
          });
      }
    };
  }
}

// ---- 8.4 FAQ / Pertanyaan Umum Admin Management ----
// Sebelumnya tidak ada UI sama sekali untuk FAQ, padahal landing page
// merender isinya dari database. Admin tidak bisa memperbaiki teks salah ketik.
let adminFaqDraft = [];

function initFaqAdminPage() {
  renderFaqAdmin();
}

function renderFaqAdmin() {
  const container = document.getElementById('faq-admin-list');
  if (!container || typeof DataStore === 'undefined') return;

  const list = DataStore.getFAQ();
  adminFaqDraft = list.map(function (item) {
    return Object.assign({}, item);
  });

  if (adminFaqDraft.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#64748b;padding:2rem;">Belum ada pertanyaan. Klik "Tambah Pertanyaan" untuk membuat.</p>';
    return;
  }

  container.innerHTML = adminFaqDraft.map(function (item, idx) {
    return `
      <div style="border:1px solid var(--admin-border);border-radius:10px;padding:1rem;margin-bottom:0.75rem;background:#fff;">
        <div class="form-group" style="margin-bottom:0.65rem;">
          <label for="faq-q-${idx}">Pertanyaan</label>
          <input type="text" id="faq-q-${idx}" value="${escapeHtmlAdmin(item.q || '')}">
        </div>
        <div class="form-group" style="margin-bottom:0.65rem;">
          <label for="faq-a-${idx}">Jawaban</label>
          <textarea id="faq-a-${idx}" rows="3">${escapeHtmlAdmin(item.a || '')}</textarea>
        </div>
        <div style="display:flex;gap:0.5rem;">
          <button type="button" class="btn-admin btn-admin-outline btn-admin-sm" onclick="moveFaqAdmin(${idx}, -1)" title="Naik"><i class="fa-solid fa-arrow-up"></i></button>
          <button type="button" class="btn-admin btn-admin-outline btn-admin-sm" onclick="moveFaqAdmin(${idx}, 1)" title="Turun"><i class="fa-solid fa-arrow-down"></i></button>
          <button type="button" class="btn-admin btn-admin-danger btn-admin-sm" style="margin-left:auto;" onclick="deleteFaqAdmin(${idx})"><i class="fa-solid fa-trash"></i> Hapus</button>
        </div>
      </div>
    `;
  }).join('');
}

function addFaqAdmin() {
  adminFaqDraft.push({ q: '', a: '' });
  renderFaqAdmin();
}

function moveFaqAdmin(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= adminFaqDraft.length) return;
  const item = adminFaqDraft.splice(index, 1)[0];
  adminFaqDraft.splice(target, 0, item);
  renderFaqAdmin();
}

function deleteFaqAdmin(index) {
  if (!confirm('Hapus pertanyaan ini dari website?')) return;
  adminFaqDraft.splice(index, 1);
  renderFaqAdmin();
}

async function saveFaqAdmin() {
  if (typeof DataStore === 'undefined') return;

  // Kumpulkan nilai input terbaru sebelum menyimpan.
  const collected = [];
  for (let i = 0; i < adminFaqDraft.length; i++) {
    const qEl = document.getElementById('faq-q-' + i);
    const aEl = document.getElementById('faq-a-' + i);
    const q = qEl ? qEl.value.trim() : '';
    const a = aEl ? aEl.value.trim() : '';
    if (!q) continue;
    collected.push({ q: q, a: a });
  }

  if (collected.length === 0) {
    showToast('Minimal satu pertanyaan harus diisi!', 'error');
    return;
  }

  const btn = document.getElementById('btn-save-faq');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
  }

  try {
    await DataStore.saveFAQ(collected);
    showToast('Pertanyaan umum berhasil disimpan!', 'success');
    renderFaqAdmin();
  } catch (err) {
    console.error('Gagal menyimpan FAQ:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

// ---- 8.5 Testimonial / Ulasan & Rating Admin Management ----
let adminTestiFilterRating = 'all';
let adminTestiSearchQuery = '';

// <textarea> dengan innerHTML memperlakukan isi sebagai TEKS, jadi aman dipakai
// untuk decode entity tanpa risiko eksekusi skrip.
let _adminEntityDecoder = null;
function decodeEntitiesAdmin(str) {
  if (typeof str !== 'string' || str.indexOf('&') === -1) return str;
  try {
    if (!_adminEntityDecoder) _adminEntityDecoder = document.createElement('textarea');
    _adminEntityDecoder.innerHTML = str;
    return _adminEntityDecoder.value;
  } catch (err) {
    return str;
  }
}

function escapeHtmlAdmin(str) {
      if (!str) return '';
      // Decode dulu supaya entity dari database tampil sebagai karakter aslinya
      // (mis. "&bull;" menjadi "•"), baru escape untuk mencegah XSS.
      return String(decodeEntitiesAdmin(String(str)))
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

function hasReplyHelper(item) {
  if (!item || !item.balasan) return false;
  if (typeof item.balasan === 'string') return item.balasan.trim().length > 0;
  if (typeof item.balasan === 'object' && item.balasan.pesan) return item.balasan.pesan.trim().length > 0;
  return false;
}

function getReplyDetails(item) {
  if (!hasReplyHelper(item)) return null;
  const replyText = typeof item.balasan === 'object' && item.balasan ? item.balasan.pesan : item.balasan;
  const replyDate = (typeof item.balasan === 'object' && item.balasan ? item.balasan.tanggal : item.balasanTanggal) || '';
  const replyAuthor = (typeof item.balasan === 'object' && item.balasan ? item.balasan.oleh : item.balasanOleh) || 'Pengelola Packrafting Canden';
  return {
    pesan: replyText.trim(),
    tanggal: replyDate,
    oleh: replyAuthor
  };
}

function initTestimoniAdminPage() {
  renderTestimoniAdmin();

  const searchInput = document.getElementById('search-testi');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      adminTestiSearchQuery = this.value.trim().toLowerCase();
      renderTestimoniAdmin();
    });
  }

  const filterBtns = document.querySelectorAll('.testi-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      adminTestiFilterRating = this.getAttribute('data-rating') || 'all';
      renderTestimoniAdmin();
    });
  });
}

function renderTestimoniAdmin() {
  const container = document.getElementById('testimoni-admin-list');
  if (!container) return;

  const rawList = DataStore.getTestimonials() || [];

  // Update statistics
  const totalCount = rawList.length;
  const count5 = rawList.filter(t => (parseInt(t.rating) || 5) === 5).length;
  const count4 = rawList.filter(t => (parseInt(t.rating) || 5) === 4).length;
  const repliedCount = rawList.filter(hasReplyHelper).length;
  const unrepliedCount = totalCount - repliedCount;
  const sumRating = rawList.reduce((acc, t) => acc + (parseInt(t.rating) || 5), 0);
  const avgRating = totalCount > 0 ? (sumRating / totalCount).toFixed(1) : '5.0';

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('stat-total-testi', totalCount);
  setEl('stat-avg-rating', avgRating);
  setEl('stat-star-5', count5);
  setEl('stat-star-4', count4);
  setEl('stat-replied', repliedCount);
  setEl('stat-unreplied', unrepliedCount);

  let list = [...rawList];

  // Filter by rating or reply status
  if (adminTestiFilterRating === 'unreplied') {
    list = list.filter(t => !hasReplyHelper(t));
  } else if (adminTestiFilterRating === 'replied') {
    list = list.filter(hasReplyHelper);
  } else if (adminTestiFilterRating === '3down') {
    list = list.filter(t => (parseInt(t.rating) || 5) <= 3);
  } else if (adminTestiFilterRating !== 'all') {
    const targetRating = parseInt(adminTestiFilterRating, 10);
    list = list.filter(t => (parseInt(t.rating) || 5) === targetRating);
  }

  // Filter by search query (nama, pesan, asal, email, atau isi balasan)
  if (adminTestiSearchQuery) {
    list = list.filter(t => {
      const reply = getReplyDetails(t);
      const replyMatch = reply && reply.pesan && reply.pesan.toLowerCase().includes(adminTestiSearchQuery);
      return (
        (t.nama && t.nama.toLowerCase().includes(adminTestiSearchQuery)) ||
        (t.pesan && t.pesan.toLowerCase().includes(adminTestiSearchQuery)) ||
        (t.asal && t.asal.toLowerCase().includes(adminTestiSearchQuery)) ||
        (t.email && t.email.toLowerCase().includes(adminTestiSearchQuery)) ||
        replyMatch
      );
    });
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #64748b; background: #fff; border-radius: 12px; border: 1.5px dashed var(--admin-border);">
        <i class="fa-regular fa-comment-dots" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: #94a3b8; display: block;"></i>
        <h4 style="color: #334155; margin-bottom: 0.25rem;">Tidak ada ulasan ditemukan</h4>
        <p style="margin: 0; font-size: 0.875rem;">Ubah kata kunci pencarian atau tab filter untuk melihat ulasan lainnya.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(item => {
    const rating = Math.max(1, Math.min(5, parseInt(item.rating) || 5));
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= rating 
        ? '<i class="fa-solid fa-star" style="color:#f59e0b;"></i>' 
        : '<i class="fa-regular fa-star" style="color:#cbd5e1;"></i>';
    }

    const avatarInitial = (item.avatar || (item.nama ? item.nama.charAt(0) : 'G')).toUpperCase();
    const photoHtml = item.foto 
      ? `<img src="${escapeHtmlAdmin(item.foto)}" alt="${escapeHtmlAdmin(item.nama)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;box-shadow:0 2px 5px rgba(0,0,0,0.1);flex-shrink:0;">` 
      : `<div style="width:44px;height:44px;border-radius:50%;background:#e2e8f0;color:#334155;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${escapeHtmlAdmin(avatarInitial)}</div>`;

    const isGoogle = item.isGoogle !== false;
    const badgeSourceHtml = isGoogle 
      ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;background:#e0f2fe;color:#0369a1;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:4px;"><i class="fa-brands fa-google"></i> Google</span>`
      : `<span style="display:inline-flex;align-items:center;gap:0.3rem;background:#f1f5f9;color:#475569;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:4px;"><i class="fa-solid fa-user"></i> Pengunjung</span>`;

    const reply = getReplyDetails(item);
    const hasReply = !!reply;

    const replyStatusBadge = hasReply
      ? `<span style="display:inline-flex;align-items:center;gap:0.25rem;background:#dcfce7;color:#166534;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:4px;"><i class="fa-solid fa-circle-check"></i> Sudah Dibalas</span>`
      : `<span style="display:inline-flex;align-items:center;gap:0.25rem;background:#fff7ed;color:#c2410c;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:4px;border:1px solid #fed7aa;"><i class="fa-solid fa-clock"></i> Belum Dibalas</span>`;

    let replyBlockHtml = '';
    if (hasReply) {
      replyBlockHtml = `
        <div class="admin-testi-reply" style="margin-top:0.85rem;background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:8px;padding:0.85rem 1rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;flex-wrap:wrap;gap:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.45rem;">
              <span style="background:#16a34a;color:#fff;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.65rem;"><i class="fa-solid fa-reply"></i></span>
              <strong style="font-size:0.83rem;color:#166534;">${escapeHtmlAdmin(reply.oleh)}</strong>
              <span style="font-size:0.7rem;color:#15803d;background:#dcfce7;padding:0.12rem 0.45rem;border-radius:4px;font-weight:600;"><i class="fa-solid fa-circle-check"></i> Respon Resmi</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <span style="font-size:0.72rem;color:#64748b;"><i class="fa-regular fa-clock" style="margin-right:0.25rem;"></i>${reply.tanggal || 'Terkini'}</span>
              <button type="button" onclick="openReplyTestimoniModal(${item.id})" title="Edit Respon" style="background:#dcfce7;color:#166534;border:none;padding:0.25rem 0.55rem;border-radius:6px;font-size:0.75rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:0.25rem;">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button type="button" onclick="deleteReplyAdmin(${item.id})" title="Hapus Respon" style="background:#fee2e2;color:#ef4444;border:none;padding:0.25rem 0.55rem;border-radius:6px;font-size:0.75rem;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:0.25rem;">
                <i class="fa-solid fa-trash-can"></i> Hapus
              </button>
            </div>
          </div>
          <p style="margin:0;font-size:0.85rem;color:#14532d;line-height:1.6;white-space:pre-line;">${escapeHtmlAdmin(reply.pesan)}</p>
        </div>
      `;
    } else {
      replyBlockHtml = `
        <div style="margin-top:0.85rem;display:flex;align-items:center;justify-content:space-between;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:8px;padding:0.65rem 0.85rem;gap:0.5rem;flex-wrap:wrap;">
          <span style="font-size:0.8rem;color:#64748b;display:inline-flex;align-items:center;gap:0.35rem;">
            <i class="fa-solid fa-comment-dots" style="color:#94a3b8;"></i> Belum ada tanggapan pengelola
          </span>
          <button type="button" onclick="openReplyTestimoniModal(${item.id})" class="btn-admin btn-admin-primary" style="padding:0.4rem 0.85rem;font-size:0.8rem;border-radius:6px;display:inline-flex;align-items:center;gap:0.35rem;white-space:nowrap;">
            <i class="fa-solid fa-reply"></i> Jawab Ulasan
          </button>
        </div>
      `;
    }

    return `
      <div class="admin-testi-card" id="admin-testi-${item.id}">
        <div>
          <div class="admin-testi-header">
            <div style="display:flex;align-items:center;gap:0.75rem;min-width:0;">
              ${photoHtml}
              <div style="min-width:0;">
                <div style="font-weight:700;color:var(--admin-text);font-size:0.95rem;display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                  <span>${escapeHtmlAdmin(item.nama)}</span>
                  ${badgeSourceHtml}
                  ${replyStatusBadge}
                </div>
                <div style="font-size:0.78rem;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtmlAdmin(item.email || item.asal || 'Wisatawan')} • ${item.tanggal || '-'}</div>
              </div>
            </div>
            <button type="button" onclick="deleteTestimoniAdmin(${item.id})" title="Hapus Ulasan dari Website" style="background:#fee2e2;color:#ef4444;border:none;width:34px;height:34px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div style="margin:0.85rem 0 0.5rem;display:flex;align-items:center;gap:0.25rem;">
            ${starsHtml}
            <span style="font-size:0.82rem;font-weight:700;color:#f59e0b;margin-left:0.35rem;">${escapeHtmlAdmin(String(rating))}.0</span>
          </div>
          <p style="margin:0 0 0.5rem 0;font-size:0.88rem;color:#334155;line-height:1.6;white-space:pre-line;">
            ${escapeHtmlAdmin(item.pesan)}
          </p>
          ${replyBlockHtml}
        </div>
        <div style="font-size:0.72rem;color:#94a3b8;border-top:1px solid #f1f5f9;margin-top:0.85rem;padding-top:0.6rem;display:flex;justify-content:space-between;align-items:center;">
          <span>ID: #${item.id}</span>
          <span><i class="fa-regular fa-calendar" style="margin-right:0.25rem;"></i>${item.tanggal || 'Terkini'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Modal Balas Ulasan Controls
let activeReplyTargetItem = null;

function openReplyTestimoniModal(id) {
  const list = DataStore.getTestimonials() || [];
  const item = list.find(t => String(t.id) === String(id));
  if (!item) {
    showToast('Ulasan tidak ditemukan!', 'error');
    return;
  }

  activeReplyTargetItem = item;

  const modal = document.getElementById('modal-reply-testi');
  if (!modal) return;

  const inputId = document.getElementById('reply-testi-id');
  const previewAuthor = document.getElementById('reply-preview-author');
  const previewRating = document.getElementById('reply-preview-rating');
  const previewPesan = document.getElementById('reply-preview-pesan');
  const inputAuthor = document.getElementById('reply-author-name');
  const textareaPesan = document.getElementById('reply-testi-pesan');

  if (inputId) inputId.value = item.id;
  if (previewAuthor) previewAuthor.textContent = item.nama || 'Wisatawan';
  if (previewPesan) previewPesan.textContent = `"${item.pesan || ''}"`;

  const rating = Math.max(1, Math.min(5, parseInt(item.rating) || 5));
  let starsText = '';
  for (let i = 0; i < rating; i++) starsText += '⭐';
  if (previewRating) previewRating.textContent = `${starsText} (${rating}.0)`;

  const reply = getReplyDetails(item);
  if (reply) {
    if (inputAuthor) inputAuthor.value = reply.oleh || 'Pengelola Packrafting Canden';
    if (textareaPesan) textareaPesan.value = reply.pesan || '';
  } else {
    if (inputAuthor) inputAuthor.value = 'Pengelola Packrafting Canden';
    if (textareaPesan) textareaPesan.value = '';
  }

  modal.style.display = 'flex';
  if (textareaPesan) {
    setTimeout(() => textareaPesan.focus(), 100);
  }
}

function closeReplyTestimoniModal() {
  const modal = document.getElementById('modal-reply-testi');
  if (modal) {
    modal.style.display = 'none';
    const form = document.getElementById('form-reply-testi');
    if (form) form.reset();
  }
  activeReplyTargetItem = null;
}

function applyReplyTemplate(templateType) {
  const textarea = document.getElementById('reply-testi-pesan');
  if (!textarea) return;

  const name = (activeReplyTargetItem && activeReplyTargetItem.nama) ? activeReplyTargetItem.nama : 'Kakak';
  const rating = (activeReplyTargetItem && activeReplyTargetItem.rating) ? activeReplyTargetItem.rating : '5';

  if (templateType === 'terima_kasih') {
    textarea.value = `Halo Kak ${name}, terima kasih banyak atas ulasan dan rating bintang ${rating}-nya! Kami sangat senang Kakak menikmati pengalaman petualangan susur Sungai Opak bersama tim kami. Ditunggu kunjungan seru berikutnya ya! Salam hangat dari tim Pengelola Packrafting Canden.`;
  } else if (templateType === 'undangan') {
    textarea.value = `Terima kasih banyak atas kunjungannya, Kak ${name}! Keselamatan, kenyamanan, dan senyum puas wisatawan selalu menjadi prioritas utama kami. Jangan lupa ajak keluarga dan teman-teman di pengarungan berikutnya ya! Sampai jumpa di Canden.`;
  } else if (templateType === 'masukan') {
    textarea.value = `Halo Kak ${name}, terima kasih banyak atas ulasan dan masukan berharga yang diberikan kepada kami. Masukan Kakak sangat berarti bagi pengembangan fasilitas dan kualitas layanan susur Sungai Opak agar semakin prima. Sehat selalu dan sukses untuk Kakak!`;
  }

  textarea.focus();
}

async function saveReplyAdmin(e) {
  if (e) e.preventDefault();
  const id = document.getElementById('reply-testi-id').value;
  const author = document.getElementById('reply-author-name').value.trim() || 'Pengelola Packrafting Canden';
  const pesan = document.getElementById('reply-testi-pesan').value.trim();

  if (!id || !pesan) {
    showToast('Isi balasan wajib diisi!', 'warning');
    return;
  }

  let list = DataStore.getTestimonials() || [];
  const idx = list.findIndex(t => String(t.id) === String(id));

  if (idx === -1) {
    showToast('Ulasan tidak ditemukan!', 'error');
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  list[idx].balasan = {
    pesan: pesan,
    tanggal: todayStr,
    oleh: author
  };
  list[idx].balasanTanggal = todayStr;
  list[idx].balasanOleh = author;

  try {
    await DataStore.saveTestimonials(list);
    showToast('Jawaban pengelola berhasil dipublikasikan!', 'success');
    closeReplyTestimoniModal();
    renderTestimoniAdmin();
    renderDashboardStats();
  } catch (err) {
    console.error('Gagal menyimpan balasan:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

async function deleteReplyAdmin(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus balasan/tanggapan resmi untuk ulasan ini?')) return;
  const list = DataStore.getTestimonials() || [];
  const idx = list.findIndex(t => String(t.id) === String(id));
  if (idx === -1) return;

  delete list[idx].balasan;
  delete list[idx].balasanTanggal;
  delete list[idx].balasanOleh;

  try {
    await DataStore.saveTestimonials(list);
    showToast('Balasan resmi berhasil dihapus!', 'success');
    renderTestimoniAdmin();
    renderDashboardStats();
  } catch (err) {
    console.error('Gagal menghapus balasan:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

async function deleteTestimoniAdmin(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini dari website?')) return;
  const list = (DataStore.getTestimonials() || []).filter(t => String(t.id) !== String(id));
  try {
    await DataStore.saveTestimonials(list);
    showToast('Ulasan berhasil dihapus dari website!', 'success');
    renderTestimoniAdmin();
    renderDashboardStats();
  } catch (err) {
    console.error('Gagal menghapus ulasan:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

function openAddTestimoniModal() {
  const modal = document.getElementById('modal-add-testi');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeAddTestimoniModal() {
  const modal = document.getElementById('modal-add-testi');
  if (modal) {
    modal.style.display = 'none';
    const form = document.getElementById('form-add-testi');
    if (form) form.reset();
  }
}

async function saveNewTestimoniAdmin(e) {
  if (e) e.preventDefault();
  const nama = document.getElementById('new-testi-nama').value.trim();
  const asal = document.getElementById('new-testi-asal').value.trim() || 'Wisatawan';
  const rating = parseInt(document.getElementById('new-testi-rating').value, 10) || 5;
  const pesan = document.getElementById('new-testi-pesan').value.trim();
  const foto = document.getElementById('new-testi-foto').value.trim();

  if (!nama || !pesan) {
    showToast('Nama dan isi ulasan wajib diisi!', 'warning');
    return;
  }

  const newReview = {
    id: Date.now(),
    nama: nama,
    asal: asal,
    email: '',
    foto: foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=1b4332&color=fff&size=120`,
    rating: rating,
    pesan: pesan,
    avatar: nama.charAt(0).toUpperCase(),
    // Ulasan yang ditambahkan admin bukan dari Google Maps, jadi jangan tandai
    // sebagai Google: tanpa ini semua ulasan dapat badge "Terverifikasi".
    isGoogle: false,
    tanggal: new Date().toISOString().split('T')[0]
  };

  const list = DataStore.getTestimonials() || [];
  list.unshift(newReview);

  try {
    await DataStore.saveTestimonials(list);
    showToast('Ulasan baru berhasil ditambahkan!', 'success');
    closeAddTestimoniModal();
    renderTestimoniAdmin();
    renderDashboardStats();
  } catch (err) {
    console.error('Gagal menambahkan ulasan:', err);
    showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
  }
}

// ---- 9. Init Admin System ----
document.addEventListener('DOMContentLoaded', function () {
  if (!window.location.pathname.includes('login')) {
    checkAuth();
  }

  // Ensure admin links resolve correctly even if URL has no trailing slash (e.g. localhost:3000/admin)
  const isHttp = window.location.protocol.startsWith('http');
  if (isHttp) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('/') && !href.startsWith('../') && !href.startsWith('javascript:')) {
        link.setAttribute('href', '/admin/' + href);
      }
    });
  }

  // Mobile sidebar toggle & overlay handling
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebar) {
    let overlay = document.querySelector('.admin-sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'admin-sidebar-overlay';
      document.body.appendChild(overlay);
    }

    function openSidebar() {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('sidebar-open');
      document.documentElement.classList.add('sidebar-open');
    }

    function closeSidebar() {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      document.documentElement.classList.remove('sidebar-open');
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (sidebar.classList.contains('active')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    overlay.addEventListener('click', closeSidebar);
    overlay.addEventListener('touchmove', function (e) {
      e.preventDefault();
    }, { passive: false });

    // Add close button inside sidebar header for mobile if not present
    const sidebarHeader = sidebar.querySelector('.sidebar-header');
    if (sidebarHeader && !sidebarHeader.querySelector('.sidebar-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'sidebar-close-btn';
      closeBtn.setAttribute('aria-label', 'Tutup Sidebar');
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      closeBtn.addEventListener('click', closeSidebar);
      sidebarHeader.appendChild(closeBtn);
    }

    // Close on navigation link click on mobile
    sidebar.querySelectorAll('.sidebar-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          closeSidebar();
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebar();
      }
    });

    // Auto-close on resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
        closeSidebar();
      }
    }, { passive: true });
  }

  initGaleriFileListener();
  if (document.getElementById('faq-admin-list')) initFaqAdminPage();
  if (document.getElementById('testimoni-admin-list')) initTestimoniAdminPage();

  // Auto-refresh admin views when cloud database updates
  window.addEventListener('packraft_data_updated', function () {
    if (document.getElementById('hero-slots-container')) renderHeroSlotsAdmin();
    // Id lama (`banner-list` / `banner-admin-list`) tidak pernah ada di halaman
    // banner, sehingga field headline tidak pernah ter-refresh.
    if (document.getElementById('banner-judul')) loadBannerHeadlineAdmin();
    if (document.getElementById('faq-admin-list')) renderFaqAdmin();
    if (document.getElementById('paket-admin-list')) renderPaketAdmin();
    if (document.getElementById('operation-dates-list')) loadOperationScheduleAdmin();
    if (document.getElementById('galeri-admin-grid') || document.getElementById('galeri-admin-list')) renderGaleriAdmin();
    if (document.getElementById('stat-paket')) renderDashboardStats();
    if (document.getElementById('testimoni-admin-list')) renderTestimoniAdmin();
    if (document.getElementById('kontak-wa') && typeof loadKontakAdmin === 'function') loadKontakAdmin();
    if (document.getElementById('info-nama-pengelola') && typeof loadWisataInfoAdmin === 'function') loadWisataInfoAdmin();
    if (document.getElementById('video-url') && typeof loadVideoAdmin === 'function') loadVideoAdmin();
  });
});

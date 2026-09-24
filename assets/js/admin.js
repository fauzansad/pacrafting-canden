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

function checkAuth() {
  if (window.location.pathname.includes('login')) {
    return true;
  }
  const loggedIn = sessionStorage.getItem('admin_logged_in');
  const sessionTime = sessionStorage.getItem('admin_session_time');
  const now = Date.now();
  const maxSessionDuration = 2 * 60 * 60 * 1000; // 2 jam timeout

  if (!loggedIn || !sessionTime || (now - parseInt(sessionTime)) > maxSessionDuration) {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_session_time');
    const isFile = window.location.protocol === 'file:';
    if (isFile) {
      window.location.href = 'login.html';
    } else {
      window.location.href = '/admin/login.html';
    }
    return false;
  }
  // Refresh activity timestamp
  sessionStorage.setItem('admin_session_time', now.toString());
  return true;
}

function logout() {
  if (confirm('Apakah Anda yakin ingin keluar (logout)?')) {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_session_time');
    const isFile = window.location.protocol === 'file:';
    if (isFile) {
      window.location.href = 'login.html';
    } else {
      window.location.href = '/admin/login.html';
    }
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

      const oldHash = await DataStore.hashPassword(oldPwd);
      const currentCred = DataStore.getAdminCredentials();

      const isOldValid = (oldHash === currentCred.passwordHash || (currentCred.legacyHash && oldHash === currentCred.legacyHash));
      if (!isOldValid) {
        showToast('Password saat ini salah!', 'error');
        return;
      }

      const newHash = await DataStore.hashPassword(newPwd);
      DataStore.saveAdminCredentials(newUsername, newHash, newEmail);
      sessionStorage.setItem('admin_user', newUsername);

      showToast('Kredensial & Gmail tertaut berhasil diperbarui!', 'success');
      closeChangePasswordModal();
    });
  } else {
    modal.style.display = 'flex';
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
  const banners = DataStore.getBanners();
  const paket = DataStore.getPaket();
  const galeri = DataStore.getGaleri();
  const testi = DataStore.getTestimonials();
  const faq = DataStore.getFAQ();

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('stat-banner', banners.length);
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
          <img src="${previewSrc}" id="slot-img-preview-${idx}" class="slot-preview-img" alt="Slide ${idx + 1}" onerror="this.onerror=null;this.src='../assets/images/galeri/1.jpg';">
        </div>
        <div class="slot-body">
          <div class="slot-btn-group">
            <button type="button" class="btn-admin btn-admin-primary btn-admin-sm" onclick="openGaleriPickerModal(${idx})">
              <i class="fa-solid fa-photo-film"></i> Pilih dari Galeri
            </button>
            <button type="button" class="btn-admin btn-admin-outline btn-admin-sm" onclick="document.getElementById('slot-file-input-${idx}').click()">
              <i class="fa-solid fa-upload"></i> Upload
            </button>
            <input type="file" id="slot-file-input-${idx}" accept="image/*" style="display:none;" onchange="handleSlotFileUpload(${idx}, this)">
          </div>

          <div class="form-group" style="margin:0;">
            <label style="font-size:0.75rem;margin-bottom:0.25rem;display:block;">Path / URL Gambar:</label>
            <input type="text" id="slot-url-input-${idx}" value="${slide.gambar || ''}" placeholder="assets/images/..." oninput="updateSlotImageUrl(${idx}, this.value)" style="font-size:0.8rem;padding:0.45rem 0.65rem;">
          </div>

          <div class="form-group" style="margin:0;">
            <label style="font-size:0.75rem;margin-bottom:0.25rem;display:block;">Keterangan Foto (Alt):</label>
            <input type="text" id="slot-title-input-${idx}" value="${slide.judul || ''}" placeholder="Keterangan foto" oninput="updateSlotTitle(${idx}, this.value)" style="font-size:0.8rem;padding:0.45rem 0.65rem;">
          </div>
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
    grid.innerHTML = galeriList.map(g => {
      const imgSrc = formatAdminAssetUrl(g.gambar || 'assets/images/galeri/1.jpg');
      const safeTitle = (g.judul || 'Foto Galeri').replace(/"/g, '&quot;');
      const safeImg = (g.gambar || '').replace(/'/g, "\\'");
      const safeJsTitle = (g.judul || '').replace(/'/g, "\\'");
      return `
        <div class="picker-photo-card" onclick="selectPhotoFromGallery('${safeImg}', '${safeJsTitle}')">
          <img src="${imgSrc}" class="picker-photo-img" alt="${safeTitle}" onerror="this.onerror=null;this.src='../assets/images/galeri/1.jpg';">
          <div class="picker-photo-info">
            <h5 class="picker-photo-title" title="${safeTitle}">${safeTitle}</h5>
            <span class="picker-photo-tag"><i class="fa-solid fa-check-circle"></i> Gunakan Foto Ini</span>
          </div>
        </div>
      `;
    }).join('');
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

  // Ensure current inputs are synced
  for (let i = 0; i < 3; i++) {
    const urlInput = document.getElementById(`slot-url-input-${i}`);
    const titleInput = document.getElementById(`slot-title-input-${i}`);
    if (urlInput && urlInput.value.trim() && !urlInput.value.startsWith('(Foto Hasil')) {
      adminHeroSlidesState[i].gambar = urlInput.value.trim().replace(/^\/+/, '');
    }
    if (titleInput) {
      adminHeroSlidesState[i].judul = titleInput.value.trim();
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

  const judulInput = document.getElementById('banner-judul');
  const subInput = document.getElementById('banner-sub');
  const leadInput = document.getElementById('banner-lead');
  const ctaInput = document.getElementById('banner-cta');
  const lokasiInput = document.getElementById('banner-lokasi');

  if (judulInput) judulInput.value = b.judul || 'PACKRAFTING CANDEN';
  if (subInput) subInput.value = b.subheading || 'Adventure on the River';
  if (leadInput) leadInput.value = b.lead || '';
  if (ctaInput) ctaInput.value = b.ctaText || 'JELAJAHI PAKET WISATA';
  if (lokasiInput) lokasiInput.value = b.lokasiTag || 'Rute Sungai Opak • 4,5 KM (± 1,5 Jam) • Canden ke Potrobayan';
}

async function saveBannerHeadlineText() {
  const btn = document.getElementById('btn-save-banner-text');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
  }

  const banners = DataStore.getBanners();
  const b = banners[0] || { id: 1, status: 'active', urutan: 1 };

  b.judul = (document.getElementById('banner-judul') ? document.getElementById('banner-judul').value.trim() : '') || 'PACKRAFTING CANDEN';
  b.subheading = document.getElementById('banner-sub') ? document.getElementById('banner-sub').value.trim() : 'Adventure on the River';
  b.lead = document.getElementById('banner-lead') ? document.getElementById('banner-lead').value.trim() : '';
  b.ctaText = document.getElementById('banner-cta') ? document.getElementById('banner-cta').value.trim() : 'JELAJAHI PAKET WISATA';
  b.lokasiTag = document.getElementById('banner-lokasi') ? document.getElementById('banner-lokasi').value.trim() : '';

  try {
    showToast('Menyimpan teks headline banner...', 'info');
    await DataStore.saveBanners([b]);
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
      return `
      <tr>
        <td><strong>${p.nama}</strong><br><small style="color:#64748b;">${p.level || ''}</small></td>
        <td><span style="color:#ea580c;font-weight:700;">${formattedHarga}</span></td>
        <td>${p.durasi}</td>
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

function addPaket() {
  const form = document.getElementById('paket-form');
  if (form) {
    form.style.display = 'block';
    form.dataset.mode = 'add';
    form.dataset.editId = '';
    document.getElementById('paket-nama').value = '';
    document.getElementById('paket-harga').value = '';
    document.getElementById('paket-durasi').value = '';
    document.getElementById('paket-level').value = 'Pemula & Menengah';
    document.getElementById('paket-deskripsi').value = '';
    document.getElementById('paket-fasilitas').value = '';
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
    document.getElementById('paket-nama').value = paket.nama || '';
    document.getElementById('paket-harga').value = paket.harga || '';
    document.getElementById('paket-durasi').value = paket.durasi || '';
    document.getElementById('paket-level').value = paket.level || '';
    document.getElementById('paket-deskripsi').value = paket.deskripsi || '';
    document.getElementById('paket-fasilitas').value = (paket.fasilitas || []).join('\n');
    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }
}

function savePaket() {
  const form = document.getElementById('paket-form');
  const mode = form.dataset.mode;
  const nama = document.getElementById('paket-nama').value.trim();
  const harga = document.getElementById('paket-harga').value.trim();
  const durasi = document.getElementById('paket-durasi').value.trim();
  const level = document.getElementById('paket-level').value.trim();
  const deskripsi = document.getElementById('paket-deskripsi').value.trim();
  const fasilitas = document.getElementById('paket-fasilitas').value.trim().split('\n').filter(f => f.trim());

  if (!nama) { showToast('Nama paket harus diisi', 'error'); return; }

  const paketList = DataStore.getPaket();

  if (mode === 'edit') {
    const id = parseInt(form.dataset.editId);
    const item = paketList.find(p => p.id === id);
    if (item) {
      item.nama = nama;
      item.harga = harga;
      item.durasi = durasi;
      item.level = level;
      item.deskripsi = deskripsi;
      item.fasilitas = fasilitas;
      showToast('Paket berhasil diperbarui', 'success');
    }
  } else {
    paketList.push({
      id: DataStore.generateId(paketList),
      nama: nama,
      badge: 'PAKET BARU',
      harga: harga || '[HARGA]',
      unit: '/ orang',
      durasi: durasi || '± [DURASI]',
      level: level,
      deskripsi: deskripsi,
      fasilitas: fasilitas,
      status: 'active'
    });
    showToast('Paket baru berhasil ditambahkan', 'success');
  }

  DataStore.savePaket(paketList);
  form.style.display = 'none';
  renderPaketAdmin();
}

function deletePaket(id) {
  if (confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
    let list = DataStore.getPaket().filter(p => p.id !== id);
    DataStore.savePaket(list);
    showToast('Paket berhasil dihapus', 'success');
    renderPaketAdmin();
  }
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

function saveKontakAdmin() {
  const brand = DataStore.getBrandInfo();
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

  DataStore.saveBrandInfo(brand);
  showToast('Pengaturan rute sungai, kontak & WhatsApp berhasil disimpan!', 'success');
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

function toggleGaleriStatus(id) {
  const list = DataStore.getGaleri();
  const item = list.find(g => g.id === id);
  if (item) {
    const isCurrentlyActive = (item.status !== 'hidden');
    item.status = isCurrentlyActive ? 'hidden' : 'active';
    DataStore.saveGaleri(list);
    showToast(`Foto "${item.judul}" ${item.status === 'active' ? 'DITAMPILKAN di website' : 'TIDAK DITAMPILKAN (disembunyikan)'}!`, item.status === 'active' ? 'success' : 'warning');
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
          <img src="${imgSrc}" alt="${g.judul}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60';" style="height:150px;width:100%;object-fit:cover;">
          <div style="position:absolute;top:8px;right:8px;">
            ${statusBadge}
          </div>
        </div>
        <div class="media-item-info">
          <h4 class="media-item-title">${g.judul}</h4>
          <div style="font-size:0.775rem;color:#64748b;margin-bottom:0.5rem;">
            <span><i class="fa-solid fa-tag"></i> ${g.kategori || 'Petualangan'}</span>
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

function saveGaleriAdmin() {
  const form = document.getElementById('galeri-form');
  const mode = form.dataset.mode;
  const judul = document.getElementById('galeri-judul').value.trim();
  const kategori = document.getElementById('galeri-kategori').value;
  const deskripsi = document.getElementById('galeri-deskripsi').value.trim();
  const status = document.getElementById('galeri-status') ? document.getElementById('galeri-status').value : 'active';

  if (!judul) {
    showToast('Judul foto harus diisi!', 'error');
    return;
  }

  const list = DataStore.getGaleri();

  if (mode === 'edit') {
    const id = parseInt(form.dataset.editId);
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
    DataStore.saveGaleri(list);
    form.style.display = 'none';
    currentGaleriImageData = '';
    const prev = document.getElementById('galeri-preview-img');
    if (prev) prev.innerHTML = '';
    renderGaleriAdmin();
    showToast(mode === 'edit' ? 'Foto galeri berhasil diperbarui!' : 'Foto baru berhasil ditambahkan ke galeri!', 'success');
  } catch (err) {
    console.error('Storage error:', err);
    try {
      const trimmedList = list.slice(0, 15);
      DataStore.saveGaleri(trimmedList);
      form.style.display = 'none';
      currentGaleriImageData = '';
      renderGaleriAdmin();
      showToast('Foto galeri berhasil disimpan!', 'success');
    } catch(e2) {
      showToast('Memori browser penuh. Silakan gunakan foto yang lebih kecil atau bersihkan data browser.', 'error');
    }
  }
}

function deleteGaleriAdmin(id) {
  if (confirm('Apakah Anda yakin ingin menghapus foto galeri ini?')) {
    let list = DataStore.getGaleri().filter(g => g.id !== id);
    DataStore.saveGaleri(list);
    showToast('Foto galeri berhasil dihapus', 'success');
    renderGaleriAdmin();
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

// ---- 8.5 Testimonial / Ulasan & Rating Admin Management ----
let adminTestiFilterRating = 'all';
let adminTestiSearchQuery = '';

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

  let list = [...rawList];

  // Filter by rating
  if (adminTestiFilterRating !== 'all') {
    const targetRating = parseInt(adminTestiFilterRating, 10);
    if (adminTestiFilterRating === '3down') {
      list = list.filter(t => (parseInt(t.rating) || 5) <= 3);
    } else {
      list = list.filter(t => (parseInt(t.rating) || 5) === targetRating);
    }
  }

  // Filter by search query
  if (adminTestiSearchQuery) {
    list = list.filter(t => 
      (t.nama && t.nama.toLowerCase().includes(adminTestiSearchQuery)) ||
      (t.pesan && t.pesan.toLowerCase().includes(adminTestiSearchQuery)) ||
      (t.asal && t.asal.toLowerCase().includes(adminTestiSearchQuery)) ||
      (t.email && t.email.toLowerCase().includes(adminTestiSearchQuery))
    );
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
      ? `<img src="${item.foto}" alt="${item.nama}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;box-shadow:0 2px 5px rgba(0,0,0,0.1);flex-shrink:0;">` 
      : `<div style="width:44px;height:44px;border-radius:50%;background:#e2e8f0;color:#334155;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${avatarInitial}</div>`;

    const isGoogle = item.isGoogle !== false;
    const badgeHtml = isGoogle 
      ? `<span style="display:inline-flex;align-items:center;gap:0.3rem;background:#e0f2fe;color:#0369a1;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:4px;"><i class="fa-brands fa-google"></i> Google</span>`
      : `<span style="display:inline-flex;align-items:center;gap:0.3rem;background:#f1f5f9;color:#475569;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:4px;"><i class="fa-solid fa-user"></i> Pengunjung</span>`;

    return `
      <div class="admin-testi-card" id="admin-testi-${item.id}">
        <div>
          <div class="admin-testi-header">
            <div style="display:flex;align-items:center;gap:0.75rem;min-width:0;">
              ${photoHtml}
              <div style="min-width:0;">
                <div style="font-weight:700;color:var(--admin-text);font-size:0.95rem;display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;">
                  <span>${item.nama}</span>
                  ${badgeHtml}
                </div>
                <div style="font-size:0.78rem;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.email || item.asal || 'Wisatawan'} • ${item.tanggal || '-'}</div>
              </div>
            </div>
            <button type="button" onclick="deleteTestimoniAdmin(${item.id})" title="Hapus Ulasan" style="background:#fee2e2;color:#ef4444;border:none;width:34px;height:34px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div style="margin:0.85rem 0 0.5rem;display:flex;align-items:center;gap:0.25rem;">
            ${starsHtml}
            <span style="font-size:0.82rem;font-weight:700;color:#f59e0b;margin-left:0.35rem;">${rating}.0</span>
          </div>
          <p style="margin:0 0 1rem 0;font-size:0.88rem;color:#334155;line-height:1.6;white-space:pre-line;">
            ${item.pesan}
          </p>
        </div>
        <div style="font-size:0.72rem;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:0.6rem;display:flex;justify-content:space-between;align-items:center;">
          <span>ID: #${item.id}</span>
          <span><i class="fa-regular fa-calendar" style="margin-right:0.25rem;"></i>${item.tanggal || 'Terkini'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function deleteTestimoniAdmin(id) {
  if (confirm('Apakah Anda yakin ingin menghapus ulasan ini dari website?')) {
    let list = DataStore.getTestimonials() || [];
    list = list.filter(t => String(t.id) !== String(id));
    DataStore.saveTestimonials(list);
    showToast('Ulasan berhasil dihapus dari website!', 'success');
    renderTestimoniAdmin();
    renderDashboardStats();
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

function saveNewTestimoniAdmin(e) {
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
    isGoogle: true,
    tanggal: new Date().toISOString().split('T')[0]
  };

  const list = DataStore.getTestimonials() || [];
  list.unshift(newReview);
  DataStore.saveTestimonials(list);

  showToast('Ulasan baru berhasil ditambahkan!', 'success');
  closeAddTestimoniModal();
  renderTestimoniAdmin();
  renderDashboardStats();
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
  if (document.getElementById('testimoni-admin-list')) initTestimoniAdminPage();

  // Auto-refresh admin views when cloud database updates
  window.addEventListener('packraft_data_updated', function () {
    if (document.getElementById('hero-slots-container')) renderHeroSlotsAdmin();
    if (document.getElementById('banner-list') || document.getElementById('banner-admin-list')) renderBannerList();
    if (document.getElementById('paket-admin-list')) renderPaketAdmin();
    if (document.getElementById('galeri-admin-grid') || document.getElementById('galeri-admin-list')) renderGaleriAdmin();
    if (document.getElementById('stat-paket')) renderDashboardStats();
    if (document.getElementById('testimoni-admin-list')) renderTestimoniAdmin();
    if (document.getElementById('kontak-wa') && typeof loadKontakAdmin === 'function') loadKontakAdmin();
    if (document.getElementById('info-nama-pengelola') && typeof loadWisataInfoAdmin === 'function') loadWisataInfoAdmin();
    if (document.getElementById('video-url') && typeof loadVideoAdmin === 'function') loadVideoAdmin();
  });
});

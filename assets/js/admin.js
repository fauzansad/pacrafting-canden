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
  let modal = document.getElementById('change-pwd-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'change-pwd-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.zIndex = '99999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '1rem';

    const cred = DataStore.getAdminCredentials();

    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;max-width:440px;width:100%;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;animation:modalFadeIn 0.2s ease;">
        <div style="background:linear-gradient(135deg,#0b1710,#1b4332);color:#fff;padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;">
          <h3 style="margin:0;font-size:1.1rem;font-family:'Plus Jakarta Sans',sans-serif;color:#fff;display:flex;align-items:center;gap:0.5rem;">
            <i class="fa-solid fa-shield-halved" style="color:#f97316;"></i> Keamanan &amp; Ganti Password
          </h3>
          <button type="button" onclick="closeChangePasswordModal()" style="background:none;border:none;color:#94a3b8;font-size:1.2rem;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="change-pwd-form" style="padding:1.5rem;" class="admin-form">
          <div class="form-group">
            <label for="cp-username">Username Admin</label>
            <input type="text" id="cp-username" value="${cred.username}" required>
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

    document.getElementById('change-pwd-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const rawUser = document.getElementById('cp-username').value;
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

      if (!newUsername || !oldPwd || !newPwd || !confirmPwd) {
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
      DataStore.saveAdminCredentials(newUsername, newHash);
      sessionStorage.setItem('admin_user', newUsername);

      showToast('Username & Password berhasil diperbarui!', 'success');
      closeChangePasswordModal();
    });
  } else {
    modal.style.display = 'flex';
  }
}

function closeChangePasswordModal() {
  const modal = document.getElementById('change-pwd-modal');
  if (modal) {
    modal.style.display = 'none';
    const form = document.getElementById('change-pwd-form');
    if (form) form.reset();
  }
}

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

// ---- 4. Banner Homepage Management ----
function renderBannerList() {
  const container = document.getElementById('banner-list');
  if (!container) return;

  const banners = DataStore.getBanners();
  if (banners.length === 0) {
    container.innerHTML = '<p style="color:var(--admin-text-light);text-align:center;padding:2rem;">Belum ada banner hero.</p>';
    return;
  }

  container.innerHTML = banners.map(function (b) {
    const hasImg = b.gambar && b.gambar.trim() !== '';
    const previewSrc = formatAdminAssetUrl(b.gambar);
    const imgPreview = hasImg 
      ? `<img src="${previewSrc}" alt="Banner" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=60';" style="width:110px;height:75px;object-fit:cover;object-position:${b.position || 'center'};border-radius:8px;border:1px solid #cbd5e1;">`
      : `<div style="width:110px;height:75px;border-radius:8px;background:linear-gradient(135deg, #091a11 0%, #164e32 60%, #0d4653 100%);display:flex;align-items:center;justify-content:center;color:#67e8f9;font-size:1.5rem;"><i class="fa-solid fa-water"></i></div>`;

    return `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:1.25rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:1.25rem;box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <div style="display:flex;align-items:center;gap:1.25rem;flex:1;">
          ${imgPreview}
          <div>
            <h4 style="margin:0 0 0.35rem;font-family:'Plus Jakarta Sans',sans-serif;font-size:1.05rem;color:#0f172a;">${b.judul}</h4>
            <p style="margin:0 0 0.35rem;font-size:0.875rem;color:#64748b;">${b.subheading || 'Tanpa Subheading'} &bull; Posisi: <strong style="color:#0e7490;">${b.position || 'center'}</strong></p>
            <span style="font-size:0.75rem;color:${hasImg ? '#16a34a' : '#ea580c'};font-weight:600;">
              <i class="fa-solid ${hasImg ? 'fa-image' : 'fa-wand-magic-sparkles'}"></i> ${hasImg ? 'Foto Kustom Aktif' : 'Background Efek Gradasi Default'}
            </span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:0.6rem;">
          <span class="badge" style="background:#dcfce7;color:#16a34a;padding:0.35rem 0.85rem;border-radius:999px;font-size:0.75rem;font-weight:700;">${b.status === 'active' ? 'Aktif di Web' : 'Nonaktif'}</span>
          <button class="btn-admin btn-admin-primary btn-admin-sm" onclick="editBanner(${b.id})"><i class="fa-solid fa-pen-to-square"></i> Edit Banner</button>
        </div>
      </div>
    `;
  }).join('');
}

let currentBannerImageData = '';

function updatePreviewPosition(pos) {
  const imgEl = document.getElementById('banner-img-preview');
  if (imgEl) {
    imgEl.style.objectPosition = pos || 'center';
  }
}

// ---- Helper: Client-side Image Resizing & Compression ----
function compressImage(file, maxWidth = 960, maxHeight = 720, quality = 0.70) {
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

function handleBannerFileUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast('Mengompres dan memuat foto...', 'info');

    compressImage(file, 1400, 800, 0.75)
      .then(dataUrl => {
        currentBannerImageData = dataUrl;
        document.getElementById('banner-img-url').value = '';
        showBannerImagePreview(currentBannerImageData);
        showToast('Foto berhasil dimuat, klik Simpan untuk menerapkan!', 'success');
      })
      .catch(err => {
        console.error(err);
        showToast('Gagal memuat foto: ' + err.message, 'error');
      });
  }
}

function handleBannerUrlInput(url) {
  const trimmed = url.trim();
  currentBannerImageData = trimmed;
  if (trimmed) {
    showBannerImagePreview(trimmed);
  } else {
    removeBannerImage(false);
  }
}

function showBannerImagePreview(src) {
  const img = document.getElementById('banner-img-preview');
  const empty = document.getElementById('banner-img-empty');
  const removeBtn = document.getElementById('btn-remove-banner-img');
  const pos = document.getElementById('banner-position') ? document.getElementById('banner-position').value : 'center';

  if (img && empty) {
    let displaySrc = formatAdminAssetUrl(src);
    img.src = displaySrc;
    img.style.display = 'block';
    img.style.objectPosition = pos;
    empty.style.display = 'none';
  }
  if (removeBtn) removeBtn.style.display = 'inline-flex';
}

function removeBannerImage(notify = true) {
  currentBannerImageData = '';
  const img = document.getElementById('banner-img-preview');
  const empty = document.getElementById('banner-img-empty');
  const removeBtn = document.getElementById('btn-remove-banner-img');
  const urlInput = document.getElementById('banner-img-url');
  const fileInput = document.getElementById('banner-file-input');

  if (img) { img.src = ''; img.style.display = 'none'; }
  if (empty) { empty.style.display = 'block'; }
  if (removeBtn) { removeBtn.style.display = 'none'; }
  if (urlInput) { urlInput.value = ''; }
  if (fileInput) { fileInput.value = ''; }

  if (notify) {
    showToast('Foto latar dihapus (kembali ke efek gradasi default). Klik Simpan.', 'info');
  }
}

function editBanner(id) {
  const banners = DataStore.getBanners();
  const banner = banners.find(b => b.id === id) || banners[0];
  if (!banner) return;

  const form = document.getElementById('banner-form');
  if (form) {
    form.style.display = 'block';
    form.dataset.editId = banner.id;

    document.getElementById('banner-judul').value = banner.judul || '';
    document.getElementById('banner-sub').value = banner.subheading || '';
    document.getElementById('banner-lead').value = banner.lead || '';
    document.getElementById('banner-cta').value = banner.ctaText || '';
    document.getElementById('banner-position').value = banner.position || 'center';

    currentBannerImageData = banner.gambar || '';
    if (banner.gambar && banner.gambar.trim() !== '') {
      document.getElementById('banner-img-url').value = banner.gambar.startsWith('data:') ? '' : banner.gambar;
      showBannerImagePreview(banner.gambar);
    } else {
      removeBannerImage(false);
    }

    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }
}

async function saveBanner() {
  const form = document.getElementById('banner-form');
  const id = parseInt(form.dataset.editId) || 1;
  const banners = DataStore.getBanners();
  const banner = banners.find(b => b.id === id) || banners[0];

  if (banner) {
    const saveBtn = form.querySelector('button.btn-admin-primary');
    const originalHtml = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Cloud...';
    }

    banner.judul = document.getElementById('banner-judul').value.trim();
    banner.subheading = document.getElementById('banner-sub').value.trim();
    banner.lead = document.getElementById('banner-lead').value.trim();
    banner.ctaText = document.getElementById('banner-cta').value.trim();
    banner.position = document.getElementById('banner-position').value;

    const urlInput = document.getElementById('banner-img-url');
    const urlVal = urlInput ? urlInput.value.trim() : '';
    if (urlVal && (!currentBannerImageData || !currentBannerImageData.startsWith('data:'))) {
      currentBannerImageData = urlVal;
    }
    if (currentBannerImageData && !currentBannerImageData.startsWith('http') && !currentBannerImageData.startsWith('data:')) {
      currentBannerImageData = currentBannerImageData.replace(/^\/+/, '');
    }
    banner.gambar = currentBannerImageData;

    try {
      showToast('Menyimpan perubahan ke cloud database...', 'info');
      await DataStore.saveBanners(banners);
      showToast('Banner hero & gambar latar berhasil disimpan ke cloud!', 'success');
      form.style.display = 'none';
      renderBannerList();
    } catch (err) {
      console.error('Gagal menyimpan banner:', err);
      showToast('Gagal menyimpan ke cloud: ' + (err.message || err), 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalHtml;
      }
    }
  }
}

// ---- 5. Paket Wisata Management ----
function renderPaketAdmin() {
  const container = document.getElementById('paket-admin-list');
  if (!container) return;

  const paketList = DataStore.getPaket();
  container.innerHTML = paketList.map(function (p) {
    return `
      <tr>
        <td><strong>${p.nama}</strong><br><small style="color:#64748b;">${p.level || ''}</small></td>
        <td><span style="color:#ea580c;font-weight:700;">Rp ${p.harga}</span></td>
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

// ---- 7. Berita Desa Management ----
function execCmd(command, value = null) {
  document.execCommand(command, false, value);
}

function renderBeritaAdmin() {
  const container = document.getElementById('berita-admin-list');
  if (!container) return;

  const beritaList = DataStore.getBerita();
  if (beritaList.length === 0) {
    container.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:2rem;">Belum ada berita/artikel. Klik "Tambah Berita" untuk membuat.</td></tr>';
    return;
  }

  container.innerHTML = beritaList.map(function (b) {
    return `
      <tr>
        <td><strong>${b.judul}</strong><br><small style="color:#64748b;">${b.penulis || 'Admin'}</small></td>
        <td><span class="badge" style="background:#e0f2fe;color:#0284c7;padding:0.25rem 0.6rem;border-radius:6px;font-size:0.75rem;font-weight:600;">${b.kategori || 'Umum'}</span></td>
        <td>${b.tanggal || '-'}</td>
        <td><span class="badge" style="background:#dcfce7;color:#16a34a;padding:0.25rem 0.6rem;border-radius:6px;font-size:0.75rem;font-weight:700;">${b.status === 'published' ? 'Terbit' : 'Draft'}</span></td>
        <td>
          <div style="display:flex;gap:0.4rem;">
            <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editBeritaAdmin(${b.id})"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteBeritaAdmin(${b.id})"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function addBeritaAdmin() {
  const form = document.getElementById('berita-form');
  if (form) {
    form.style.display = 'block';
    form.dataset.mode = 'add';
    form.dataset.editId = '';
    document.getElementById('berita-judul').value = '';
    document.getElementById('berita-kategori').value = 'Kegiatan Desa';
    document.getElementById('berita-tanggal').value = new Date().toISOString().split('T')[0];
    document.getElementById('berita-penulis').value = 'Admin Packrafting';
    document.getElementById('berita-ringkasan').value = '';
    document.getElementById('berita-isi').innerHTML = '';
    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }
}

function editBeritaAdmin(id) {
  const berita = DataStore.getBeritaById(id);
  if (!berita) return;

  const form = document.getElementById('berita-form');
  if (form) {
    form.style.display = 'block';
    form.dataset.mode = 'edit';
    form.dataset.editId = id;
    document.getElementById('berita-judul').value = berita.judul || '';
    document.getElementById('berita-kategori').value = berita.kategori || 'Kegiatan Desa';
    document.getElementById('berita-tanggal').value = berita.tanggal || '';
    document.getElementById('berita-penulis').value = berita.penulis || '';
    document.getElementById('berita-ringkasan').value = berita.ringkasan || '';
    document.getElementById('berita-isi').innerHTML = berita.isi || '';
    window.scrollTo({ top: form.offsetTop - 80, behavior: 'smooth' });
  }
}

function saveBeritaAdmin() {
  const form = document.getElementById('berita-form');
  const mode = form.dataset.mode;
  const judul = document.getElementById('berita-judul').value.trim();
  const kategori = document.getElementById('berita-kategori').value;
  const tanggal = document.getElementById('berita-tanggal').value;
  const penulis = document.getElementById('berita-penulis').value.trim() || 'Admin';
  const ringkasan = document.getElementById('berita-ringkasan').value.trim();
  const isi = document.getElementById('berita-isi').innerHTML.trim();

  if (!judul) { showToast('Judul berita harus diisi!', 'error'); return; }

  const list = DataStore.getBerita();

  if (mode === 'edit') {
    const id = parseInt(form.dataset.editId);
    const item = list.find(b => b.id === id);
    if (item) {
      item.judul = judul;
      item.kategori = kategori;
      item.tanggal = tanggal;
      item.penulis = penulis;
      item.ringkasan = ringkasan;
      item.isi = isi;
      showToast('Berita berhasil diperbarui', 'success');
    }
  } else {
    list.unshift({
      id: DataStore.generateId(list),
      judul: judul,
      kategori: kategori,
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      penulis: penulis,
      ringkasan: ringkasan,
      isi: isi,
      status: 'published'
    });
    showToast('Berita baru berhasil ditambahkan', 'success');
  }

  DataStore.saveBerita(list);
  form.style.display = 'none';
  renderBeritaAdmin();
}

function deleteBeritaAdmin(id) {
  if (confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
    let list = DataStore.getBerita().filter(b => b.id !== id);
    DataStore.saveBerita(list);
    showToast('Berita berhasil dihapus', 'success');
    renderBeritaAdmin();
  }
}

// ---- 8. Galeri Foto Management ----
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

    if (toggle) {
      toggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
      });
    }

    overlay.addEventListener('click', function () {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });

    // Close on navigation link click on mobile
    sidebar.querySelectorAll('.sidebar-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
        }
      });
    });
  }

  initGaleriFileListener();

  // Auto-refresh admin views when cloud database updates
  window.addEventListener('packraft_data_updated', function () {
    if (document.getElementById('banner-admin-list')) renderBannerList();
    if (document.getElementById('paket-admin-list')) renderPaketAdmin();
    if (document.getElementById('berita-admin-list')) renderBeritaAdmin();
    if (document.getElementById('galeri-admin-list')) renderGaleriAdmin();
  });
});

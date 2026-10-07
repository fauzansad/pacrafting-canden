/* ============================================
   GALERI.JS - Gallery Page Features
   Filter, Dynamic Grid from DataStore, Lightbox
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // Nilai dari database bisa masih berupa HTML entity ("&bull;", "&amp;").
  // Kalau langsung di-escape, "&bull;" tampil mentah di layar. Decode dulu,
  // baru escape untuk mencegah XSS.
  var _entityDecoder = null;
  function decodeEntities(str) {
    if (typeof str !== 'string' || str.indexOf('&') === -1) return str;
    try {
      if (!_entityDecoder) _entityDecoder = document.createElement('textarea');
      _entityDecoder.innerHTML = str;
      return _entityDecoder.value;
    } catch (e) {
      return str;
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(decodeEntities(String(str)))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ---- Galeri Page Dynamic Rendering ----
  const galeriContainer = document.getElementById('galeri-container') || document.querySelector('.gallery-grid');
  if (galeriContainer) {
    const filterTabs = document.querySelectorAll('.galeri-filter .filter-tab');
    let currentFilter = 'Semua';

    function renderGaleri() {
      if (typeof DataStore === 'undefined') return;
      let galeri = DataStore.getPublishedGaleri ? DataStore.getPublishedGaleri() : DataStore.getGaleri().filter(g => g.status !== 'hidden');

      if (currentFilter !== 'Semua') {
        galeri = galeri.filter(function (g) {
          return (g.kategori || '').toLowerCase() === currentFilter.toLowerCase();
        });
      }

      if (galeri.length === 0) {
        galeriContainer.innerHTML = `
          <div class="no-results" style="grid-column: 1/-1;text-align:center;padding:3rem 1rem;color:var(--text-light,#64748b);">
            <i class="fa-solid fa-images" style="font-size:2.5rem;margin-bottom:1rem;display:block;color:var(--primary-300,#94a3b8);"></i>
            <h4>Belum ada foto untuk kategori "${currentFilter}"</h4>
            <p style="font-size:0.9rem;">Foto akan muncul saat admin menambahkan dokumentasi baru.</p>
          </div>
        `;
        return;
      }

      galeriContainer.innerHTML = galeri.map(function (g, idx) {
        let imgSrc = g.gambar ? g.gambar.trim() : '';
        if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
          imgSrc = imgSrc.replace(/^\/+/, '');
        }
        const hasImg = Boolean(imgSrc);
        const safeTitle = escapeHtml(g.judul);
        const safeKategori = escapeHtml(g.kategori || 'Packrafting Canden');
        const safeCaption = escapeHtml(g.caption || g.judul);

        const isFirst = (idx === 0 && galeri.length >= 4);
        const isWide = (galeri.length === 8 && idx === 7) || (galeri.length === 6 && (idx === 4 || idx === 5));
        let spanClass = '';
        if (isFirst) spanClass = 'span-2-row span-2-col';
        else if (isWide) spanClass = 'span-2-col';

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
              <span>${escapeHtml(g.kategori || 'Dokumentasi')}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Filter Tabs Click Handling
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterTabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter') || 'Semua';
        renderGaleri();
      });
    });

    renderGaleri();
    window.addEventListener('packraft_data_updated', renderGaleri);
    window.addEventListener('storage', renderGaleri);
  }

});

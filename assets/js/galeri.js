/* ============================================
   GALERI.JS - Gallery Page Features
   Filter, Grid, Lightbox
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Galeri Page ----
  const galeriContainer = document.getElementById('galeri-container');
  if (galeriContainer) {
    const filterTabs = document.querySelectorAll('.galeri-filter .filter-tab');
    let currentFilter = 'Semua';

    function renderGaleri() {
      let galeri = DataStore.getPublishedGaleri();

      if (currentFilter !== 'Semua') {
        galeri = galeri.filter(function (g) {
          return g.kategori === currentFilter;
        });
      }

      if (galeri.length === 0) {
        galeriContainer.innerHTML = `
          <div class="no-results" style="grid-column: 1/-1;">
            <i class="fa-solid fa-images"></i>
            <h4>Belum ada foto</h4>
            <p>Belum ada foto untuk kategori ini.</p>
          </div>
        `;
        return;
      }

      galeriContainer.innerHTML = galeri.map(function (g) {
        const imgSrc = g.gambar || '';
        return `
          <div class="galeri-item" 
               ${imgSrc ? `data-lightbox="${imgSrc}" data-caption="${g.judul}"` : ''}>
            ${imgSrc
            ? `<img src="${imgSrc}" alt="${g.judul}" loading="lazy">`
            : `<div class="galeri-item-placeholder">
                <i class="fa-solid fa-image"></i>
                <span>${g.judul}</span>
              </div>`
          }
            <div class="galeri-item-overlay">
              <h5>${g.judul}</h5>
              <span>${g.kategori}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Filter
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterTabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter');
        renderGaleri();
      });
    });

    renderGaleri();
  }

  // ---- Homepage Galeri Preview ----
  const galeriPreview = document.getElementById('galeri-preview');
  if (galeriPreview) {
    const galeri = DataStore.getPublishedGaleri().slice(0, 5);

    galeriPreview.innerHTML = galeri.map(function (g) {
      const imgSrc = g.gambar || '';
      return `
        <div class="galeri-preview-item"
             ${imgSrc ? `data-lightbox="${imgSrc}" data-caption="${g.judul}"` : ''}>
          ${imgSrc
          ? `<img class="galeri-img" src="${imgSrc}" alt="${g.judul}" loading="lazy">`
          : `<div class="galeri-placeholder"><i class="fa-solid fa-image"></i></div>`
        }
          <div class="galeri-overlay">
            <i class="fa-solid fa-expand"></i>
          </div>
        </div>
      `;
    }).join('');
  }

});

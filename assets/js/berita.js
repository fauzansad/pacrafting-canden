/* ============================================
   BERITA.JS - Berita Page Features
   Search, Filter, Pagination, Detail
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ---- Berita List Page ----
  const beritaContainer = document.getElementById('berita-container');
  if (beritaContainer) {
    const searchInput = document.getElementById('berita-search');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const paginationContainer = document.getElementById('berita-pagination');

    let currentFilter = 'Semua';
    let currentSearch = '';
    let currentPage = 1;
    const perPage = 6;

    function getFilteredBerita() {
      let berita = DataStore.getPublishedBerita();

      // Filter by kategori
      if (currentFilter !== 'Semua') {
        berita = berita.filter(function (b) {
          return b.kategori === currentFilter;
        });
      }

      // Search
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        berita = berita.filter(function (b) {
          return b.judul.toLowerCase().includes(q) ||
            b.ringkasan.toLowerCase().includes(q) ||
            b.kategori.toLowerCase().includes(q);
        });
      }

      return berita;
    }

    function renderBerita() {
      const filtered = getFilteredBerita();
      const totalPages = Math.ceil(filtered.length / perPage);
      if (currentPage > totalPages) currentPage = 1;

      const start = (currentPage - 1) * perPage;
      const pageBerita = filtered.slice(start, start + perPage);

      if (pageBerita.length === 0) {
        beritaContainer.innerHTML = `
          <div class="no-results" style="grid-column: 1/-1;">
            <i class="fa-solid fa-magnifying-glass"></i>
            <h4>Tidak ada berita ditemukan</h4>
            <p>Coba ubah kata kunci pencarian atau filter kategori.</p>
          </div>
        `;
      } else {
        beritaContainer.innerHTML = pageBerita.map(function (b) {
          return `
            <article class="berita-card reveal revealed">
              <div class="berita-card-image">
                ${b.thumbnail
              ? `<img src="${b.thumbnail}" alt="${b.judul}" loading="lazy">`
              : `<i class="fa-solid fa-newspaper"></i>`
            }
              </div>
              <div class="berita-card-body">
                <div class="berita-meta">
                  <span class="berita-category">${b.kategori}</span>
                  <span class="berita-date">${formatTanggal(b.tanggal)}</span>
                </div>
                <h4><a href="detail-berita.html?id=${b.id}">${b.judul}</a></h4>
                <p>${truncateText(b.ringkasan, 120)}</p>
                <a href="detail-berita.html?id=${b.id}" class="read-more">
                  Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </article>
          `;
        }).join('');
      }

      // Render pagination
      if (paginationContainer && totalPages > 1) {
        let paginationHTML = '';
        paginationHTML += `<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
          paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
        paginationContainer.innerHTML = paginationHTML;

        paginationContainer.querySelectorAll('button').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (!this.disabled) {
              currentPage = parseInt(this.getAttribute('data-page'));
              renderBerita();
              beritaContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        });
      } else if (paginationContainer) {
        paginationContainer.innerHTML = '';
      }
    }

    // Search
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
          currentSearch = searchInput.value.trim();
          currentPage = 1;
          renderBerita();
        }, 300);
      });
    }

    // Filter
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterTabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter');
        currentPage = 1;
        renderBerita();
      });
    });

    // Initial render
    renderBerita();
    window.addEventListener('packraft_data_updated', renderBerita);
  }

  // ---- Berita Homepage Preview ----
  const beritaPreview = document.getElementById('berita-preview');
  if (beritaPreview) {
    const berita = DataStore.getPublishedBerita().slice(0, 6);
    beritaPreview.innerHTML = berita.map(function (b) {
      return `
        <article class="berita-card reveal">
          <div class="berita-card-image">
            ${b.thumbnail
          ? `<img src="${b.thumbnail}" alt="${b.judul}" loading="lazy">`
          : `<i class="fa-solid fa-newspaper"></i>`
        }
          </div>
          <div class="berita-card-body">
            <div class="berita-meta">
              <span class="berita-category">${b.kategori}</span>
              <span class="berita-date">${formatTanggal(b.tanggal)}</span>
            </div>
            <h4><a href="detail-berita.html?id=${b.id}">${b.judul}</a></h4>
            <p>${truncateText(b.ringkasan, 100)}</p>
            <a href="detail-berita.html?id=${b.id}" class="read-more">
              Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </article>
      `;
    }).join('');

    // Re-observe reveal elements
    const revealEls = beritaPreview.querySelectorAll('.reveal');
    if (revealEls.length > 0 && typeof IntersectionObserver !== 'undefined') {
      const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      revealEls.forEach(function (el) { obs.observe(el); });
    }
  }

  // ---- Detail Berita ----
  const detailContainer = document.getElementById('detail-berita');
  if (detailContainer) {
    const id = getUrlParam('id');
    if (id) {
      const berita = DataStore.getBeritaById(id);
      if (berita) {
        // Update page title
        document.title = berita.judul + ' | Desa Canden';

        // Update breadcrumb
        const breadcrumbCurrent = document.querySelector('.breadcrumb .current');
        if (breadcrumbCurrent) {
          breadcrumbCurrent.textContent = truncateText(berita.judul, 40);
        }

        detailContainer.innerHTML = `
          <div class="detail-header">
            <div class="berita-meta">
              <span class="berita-category">${berita.kategori}</span>
              <span class="berita-date"><i class="fa-regular fa-calendar"></i> ${formatTanggal(berita.tanggal)}</span>
            </div>
            <h1>${berita.judul}</h1>
          </div>

          <div class="detail-image">
            ${berita.thumbnail
            ? `<img src="${berita.thumbnail}" alt="${berita.judul}">`
            : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--primary-50),var(--bg-alt));display:flex;align-items:center;justify-content:center;color:var(--primary-200);font-size:3rem;"><i class="fa-solid fa-newspaper"></i></div>`
          }
          </div>

          <div class="detail-author">
            <div class="detail-author-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="detail-author-info">
              <h5>${berita.penulis}</h5>
              <p>${formatTanggal(berita.tanggal)}</p>
            </div>
          </div>

          <div class="detail-body">
            ${berita.isi}
          </div>
        `;

        // Related articles
        const relatedContainer = document.getElementById('related-articles');
        if (relatedContainer) {
          const related = DataStore.getPublishedBerita()
            .filter(function (b) { return b.id !== berita.id; })
            .slice(0, 3);

          if (related.length > 0) {
            relatedContainer.innerHTML = `
              <h3>Berita Lainnya</h3>
              <div class="berita-grid">
                ${related.map(function (b) {
              return `
                    <article class="berita-card">
                      <div class="berita-card-image">
                        ${b.thumbnail
                  ? `<img src="${b.thumbnail}" alt="${b.judul}" loading="lazy">`
                  : `<i class="fa-solid fa-newspaper"></i>`
                }
                      </div>
                      <div class="berita-card-body">
                        <div class="berita-meta">
                          <span class="berita-category">${b.kategori}</span>
                          <span class="berita-date">${formatTanggal(b.tanggal)}</span>
                        </div>
                        <h4><a href="detail-berita.html?id=${b.id}">${b.judul}</a></h4>
                        <p>${truncateText(b.ringkasan, 80)}</p>
                      </div>
                    </article>
                  `;
            }).join('')}
              </div>
            `;
          }
        }
      } else {
        detailContainer.innerHTML = `
          <div class="no-results">
            <i class="fa-solid fa-circle-exclamation"></i>
            <h4>Berita tidak ditemukan</h4>
            <p>Berita yang Anda cari tidak tersedia.</p>
            <a href="berita.html" class="btn btn-primary" style="margin-top:1rem;">← Kembali ke Berita</a>
          </div>
        `;
      }
    }
  }

});

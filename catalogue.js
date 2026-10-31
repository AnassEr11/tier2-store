/* ═══════════════════════════════════════════════════
   TIER II — catalogue.js
   Handles: data, filtering, sorting, pagination, rendering
   ═══════════════════════════════════════════════════ */

/* ── 1. Product data (32 placeholder items) ─────── */
const PRODUCTS = Array.from({ length: 32 }, (_, i) => {
  const categories = ['tops', 'bottoms', 'outerwear', 'accessories'];
  const names = [
    'Classic Tee', 'Cargo Pants', 'Oversized Hoodie', 'Linen Shirt',
    'Relaxed Shorts', 'Canvas Sneakers', 'Track Jacket', 'Knit Sweater',
    'Bomber Jacket', 'Wide Trousers', 'Polo Shirt', 'Denim Shorts',
    'Puffer Vest', 'Bucket Hat', 'Ribbed Tank', 'Chino Pants',
    'Coach Jacket', 'Fleece Pullover', 'Utility Shorts', 'Snapback Cap',
    'Mesh Top', 'Jogger Pants', 'Zip Hoodie', 'Corduroy Shirt',
    'Rain Jacket', 'Pleated Trousers', 'Muscle Tee', 'Swim Shorts',
    'Sherpa Jacket', 'Crossbody Bag', 'Graphic Tee', 'Biker Shorts',
  ];
  const cat = categories[i % 4];
  const base = 30 + (i * 7) % 90;
  const discount = Math.random() > 0.35 ? Math.round(base * 0.75) : null;

  return {
    id: i + 1,
    name: names[i] || `Item ${i + 1}`,
    category: cat,
    priceBefore: discount ? base : null,
    priceAfter: discount ? discount : base,
  };
});

/* ── 2. State & Search URL param ────────────────── */
const PER_PAGE = 12;

const urlParams = new URLSearchParams(window.location.search);
const initialSearch = (urlParams.get('search') || '').trim();

let state = {
  filter: 'all',
  sort: 'default',
  search: initialSearch,
  page: 1,
};

// Sync navbar search input with initial search query if present
const navSearchInput = document.getElementById('nav-search-input');
if (navSearchInput && initialSearch) {
  navSearchInput.value = initialSearch;
}

/* ── 3. Helpers ─────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getFiltered() {
  let list = state.filter === 'all'
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => p.category === state.filter);

  // Filter by search query if active
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  switch (state.sort) {
    case 'price-asc':  list.sort((a, b) => a.priceAfter - b.priceAfter); break;
    case 'price-desc': list.sort((a, b) => b.priceAfter - a.priceAfter); break;
    case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
  }

  return list;
}

function bagSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>`;
}

function cardHTML(product) {
  const priceSection = product.priceBefore
    ? `<span class="price-before">$${product.priceBefore}</span>
       <span class="price-after">$${product.priceAfter}</span>`
    : `<span class="price-after">$${product.priceAfter}</span>`;

  return `
    <div class="product-card" data-name="${escapeHtml(product.name)}" data-price="$${product.priceAfter}">
      <div class="card-img"></div>
      <div class="card-body">
        <p class="card-name">${escapeHtml(product.name)}</p>
        <div class="card-pricing">
          <div class="card-prices">${priceSection}</div>
          <button class="add-to-cart">${bagSVG()} Add</button>
        </div>
      </div>
    </div>`;
}

/* ── 4. Render ──────────────────────────────────── */
function render() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  // Clamp page
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  // Item count
  const countEl = document.getElementById('catalogue-count');
  if (state.search) {
    countEl.innerHTML = `<span>${filtered.length} item${filtered.length !== 1 ? 's' : ''} for <span class="search-term">"${escapeHtml(state.search)}"</span></span><button id="clear-search-link" class="clear-search-link" type="button" title="Clear search">✕ Clear</button>`;
    const clearLink = document.getElementById('clear-search-link');
    if (clearLink) {
      clearLink.addEventListener('click', () => {
        state.search = '';
        state.page = 1;
        if (navSearchInput) navSearchInput.value = '';
        const url = new URL(window.location);
        url.searchParams.delete('search');
        window.history.replaceState({}, '', url);
        render();
      });
    }
  } else {
    countEl.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;
  }

  // Grid
  const grid = document.getElementById('catalogue-grid');
  if (pageItems.length === 0) {
    if (state.search) {
      grid.innerHTML = `<div class="catalogue-empty">
        <p>No items found for "${escapeHtml(state.search)}".</p>
        <button class="clear-search-btn" id="empty-clear-btn" type="button">View All Products</button>
      </div>`;
      const emptyClear = document.getElementById('empty-clear-btn');
      if (emptyClear) {
        emptyClear.addEventListener('click', () => {
          state.search = '';
          state.filter = 'all';
          state.page = 1;
          if (navSearchInput) navSearchInput.value = '';
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
          const url = new URL(window.location);
          url.searchParams.delete('search');
          window.history.replaceState({}, '', url);
          render();
        });
      }
    } else {
      grid.innerHTML = '<p class="catalogue-empty">No items found.</p>';
    }
  } else {
    grid.innerHTML = pageItems.map(cardHTML).join('');
  }

  // Pagination
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const current = state.page;
  let html = '';

  // Prev button
  html += `<button class="page-btn" id="pg-prev" ${current === 1 ? 'disabled' : ''}>‹</button>`;

  // Page numbers with smart ellipsis
  const pages = buildPageRange(current, totalPages);
  pages.forEach(p => {
    if (p === '…') {
      html += `<span class="page-ellipsis">…</span>`;
    } else {
      html += `<button class="page-btn ${p === current ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
  });

  // Next button
  html += `<button class="page-btn" id="pg-next" ${current === totalPages ? 'disabled' : ''}>›</button>`;

  container.innerHTML = html;

  // Events
  container.querySelector('#pg-prev').addEventListener('click', () => {
    if (state.page > 1) { state.page--; render(); scrollToTop(); }
  });
  container.querySelector('#pg-next').addEventListener('click', () => {
    if (state.page < totalPages) { state.page++; render(); scrollToTop(); }
  });
  container.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = Number(btn.dataset.page);
      render();
      scrollToTop();
    });
  });
}

/** Returns an array of page numbers + '…' strings */
function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);

  if (current > 3) pages.push('…');

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }

  if (current < total - 2) pages.push('…');

  pages.push(total);
  return pages;
}

function scrollToTop() {
  document.querySelector('.catalogue-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── 5. Event listeners ─────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    state.page = 1;
    render();
  });
});

document.getElementById('sort-select').addEventListener('change', e => {
  state.sort = e.target.value;
  state.page = 1;
  render();
});

/* ── 6. Init ────────────────────────────────────── */
render();

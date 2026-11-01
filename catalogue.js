


const CAFTAN_NAMES = [
  'قفطان ملكي مطرز بالصقلي الحر',
  'قفطان مخملي بالراندة والجوهر',
  'قفطان كريب فاخر بسفيفة ذهبية',
  'قفطان جوهرة أصيل بتطريز المعلم',
  'قفطان أطلس حريري بالزواق الفاسي',
  'قفطان ملكي بصنعة اليد الفاسية',
  'قفطان سهرة عصري بقصة مغربية',
  'قفطان بروكار فخم للمناسبات الكبرى'
];

const DJELLABA_NAMES = [
  'جلابة صوفية براندة عصرية',
  'جلابة مليفة بتطريز المعلم الأصيل',
  'جلابة كريب ناعمة بخياطة الدبانة',
  'جلابة شتوية دافئة بالقب الملكي',
  'جلابة سوسية مطروزة بالحرير الطبيعي',
  'جلابة كاجوال يومية بالعقاد الحريرية',
  'جلابة خفيفة براندة الشبيكة',
  'جلابة فاسية ببرشمان يدوي متقن'
];

const JABADOUR_NAMES = [
  'جبادور فاس فاخر قطعتين',
  'جبادور سوسي بتطريز تقليدي راق',
  'جبادور مخملي بالأزرار الحريرية',
  'جبادور ملكي للمناسبات الرسمية والأعياد',
  'جبادور شبابي عصري بتطريز يدوي',
  'جبادور كريب فاخر ثلاث قطع بالصدرة',
  'جبادور حريري بصنعة المعلم الأصيل',
  'جبادور تقليدي بالزواق الرباطي المميز'
];

const GANDOURA_NAMES = [
  'قندورة سوداء ملكية بالطرز الفاسي',
  'قندورة حريرية مريحة للمناسبات',
  'عباية كيمونو عصرية بالطرز المغربي',
  'قندورة صيفية خفيفة بالعقاد الحريرية',
  'قندورة قطنية مريحة للبيت والاستجمام',
  'عباية بشت مغربية فاخرة بتطريز ذهبي',
  'قندورة مطروزة بنصف طوق أصيل',
  'قندورة تقليدية بأكمام كيمونو أنيقة'
];

const PRODUCTS = [];

function buildProducts() {

  CAFTAN_NAMES.forEach((name, i) => {
    const base = 850 + (i * 40);
    const hasDiscount = i % 2 === 0;
    const priceAfter = hasDiscount ? base - 120 : base;
    PRODUCTS.push({
      id: PRODUCTS.length + 1,
      name,
      category: 'caftans',
      image: i % 2 === 0 ? 'imgs/caftan-brown.png' : 'imgs/product-secondary-1.png',
      priceBefore: hasDiscount ? base : null,
      priceAfter: priceAfter
    });
  });

  DJELLABA_NAMES.forEach((name, i) => {
    const base = 520 + (i * 30);
    const hasDiscount = i % 3 === 0;
    const priceAfter = hasDiscount ? base - 80 : base;
    PRODUCTS.push({
      id: PRODUCTS.length + 1,
      name,
      category: 'djellabas',
      image: 'imgs/djellaba.png',
      priceBefore: hasDiscount ? base : null,
      priceAfter: priceAfter
    });
  });

  JABADOUR_NAMES.forEach((name, i) => {
    const base = 620 + (i * 35);
    const hasDiscount = i % 2 === 1;
    const priceAfter = hasDiscount ? base - 90 : base;
    PRODUCTS.push({
      id: PRODUCTS.length + 1,
      name,
      category: 'jabadours',
      image: 'imgs/jabadour.png',
      priceBefore: hasDiscount ? base : null,
      priceAfter: priceAfter
    });
  });

  GANDOURA_NAMES.forEach((name, i) => {
    const base = 350 + (i * 25);
    const hasDiscount = i % 3 === 1;
    const priceAfter = hasDiscount ? base - 60 : base;
    PRODUCTS.push({
      id: PRODUCTS.length + 1,
      name,
      category: 'gandouras',
      image: i % 2 === 0 ? 'imgs/gandoura-black.png' : 'imgs/gandoura.png',
      priceBefore: hasDiscount ? base : null,
      priceAfter: priceAfter
    });
  });
}

buildProducts();


const PER_PAGE = 12;

const urlParams = new URLSearchParams(window.location.search);
const initialSearch = (urlParams.get('search') || '').trim();
const initialCat = (urlParams.get('cat') || '').trim().toLowerCase();

const validCats = ['caftans', 'djellabas', 'jabadours', 'gandouras'];
const startingFilter = validCats.includes(initialCat) ? initialCat : 'all';

let state = {
  filter: startingFilter,
  sort: 'default',
  search: initialSearch,
  page: 1,
};

if (startingFilter !== 'all') {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === startingFilter);
  });
}

const navSearchInput = document.getElementById('nav-search-input');
if (navSearchInput && initialSearch) {
  navSearchInput.value = initialSearch;
}


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

  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  switch (state.sort) {
    case 'price-asc':  list.sort((a, b) => a.priceAfter - b.priceAfter); break;
    case 'price-desc': list.sort((a, b) => b.priceAfter - a.priceAfter); break;
    case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name, 'ar')); break;
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
    ? `<span class="price-before">${product.priceBefore} د.م.</span>
       <span class="price-after">${product.priceAfter} د.م.</span>`
    : `<span class="price-after">${product.priceAfter} د.م.</span>`;

  return `
    <div class="product-card" data-name="${escapeHtml(product.name)}" data-price="${product.priceAfter} د.م.">
      <a href="product.html" class="card-media-link">
        <div class="card-img" style="background-image: url('${product.image}');"></div>
        <div class="card-body">
          <p class="card-name">${escapeHtml(product.name)}</p>
        </div>
      </a>
      <div class="card-body" style="padding-top:0;">
        <div class="card-pricing">
          <div class="card-prices">${priceSection}</div>
          <button class="add-to-cart">${bagSVG()} أضف</button>
        </div>
      </div>
    </div>`;
}


function render() {
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  const countEl = document.getElementById('catalogue-count');
  if (state.search) {
    countEl.innerHTML = `<span>${filtered.length} منتج لـ <span class="search-term">"${escapeHtml(state.search)}"</span></span><button id="clear-search-link" class="clear-search-link" type="button" title="مسح تصفية البحث">✕ مسح</button>`;
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
    countEl.textContent = `${filtered.length} منتج`;
  }

  const grid = document.getElementById('catalogue-grid');
  if (pageItems.length === 0) {
    if (state.search) {
      grid.innerHTML = `<div class="catalogue-empty">
        <p>لم يتم العثور على أي منتج يطابق "${escapeHtml(state.search)}".</p>
        <button class="clear-search-btn" id="empty-clear-btn" type="button">عرض جميع المنتجات</button>
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
          url.searchParams.delete('cat');
          window.history.replaceState({}, '', url);
          render();
        });
      }
    } else {
      grid.innerHTML = `<div class="catalogue-empty"><p>لا توجد منتجات متوفرة في هذه الفئة حالياً.</p></div>`;
    }
  } else {
    grid.innerHTML = pageItems.map(cardHTML).join('');
  }

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('pagination');
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const current = state.page;
  let html = '';

  html += `<button class="page-btn" id="pg-prev" ${current === 1 ? 'disabled' : ''} aria-label="الصفحة السابقة">السابق</button>`;

  const pages = buildPageRange(current, totalPages);
  pages.forEach(p => {
    if (p === '…') {
      html += `<span class="page-ellipsis">…</span>`;
    } else {
      html += `<button class="page-btn ${p === current ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
  });

  html += `<button class="page-btn" id="pg-next" ${current === totalPages ? 'disabled' : ''} aria-label="الصفحة التالية">التالي</button>`;

  container.innerHTML = html;

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

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    state.page = 1;
    render();
  });
});

const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
  sortSelect.addEventListener('change', e => {
    state.sort = e.target.value;
    state.page = 1;
    render();
  });
}


render();

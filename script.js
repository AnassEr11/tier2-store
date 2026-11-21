


(function () {
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function handleNavbar() {
    const currentY = window.scrollY;

    if (currentY > lastScrollY && currentY > 80) {

      navbar.classList.add('hidden');
    } else {

      navbar.classList.remove('hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleNavbar);
      ticking = true;
    }
  }, { passive: true });
})();


// ─── Shopping Bag System ──────────────────────────────────────────────────
(function () {
  const STORAGE_KEY = 'tier2_webstore_bag';
  let bag = loadBag(); // Array of { id, name, price, priceNum, qty, image, size, color }
  let nextId = Date.now();

  const bagBtn        = document.getElementById('bag-btn');
  const bagPanel      = document.getElementById('bag-panel');
  const bagOverlay    = document.getElementById('bag-overlay');
  const bagCloseBtn   = document.getElementById('bag-close-btn');
  const bagItemsEl    = document.getElementById('bag-items');
  const bagEmptyEl    = document.getElementById('bag-empty');
  const bagCountEl    = document.getElementById('bag-count');
  const bagCheckoutBtn = document.getElementById('bag-checkout-btn');

  function loadBag() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveBag() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bag));
    } catch (e) {}
  }

  function parsePrice(str) {
    if (typeof str === 'number') return str;
    const num = parseInt(String(str).replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }

  function formatPrice(num) {
    return num.toLocaleString('ar-MA') + ' د.م.';
  }

  function openBag() {
    if (!bagPanel) return;
    bagPanel.classList.add('open');
    if (bagOverlay) bagOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBag() {
    if (!bagPanel) return;
    bagPanel.classList.remove('open');
    if (bagOverlay) bagOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function addToBag(name, price, image = '', size = '', color = '') {
    const priceNum = parsePrice(price);
    const existing = bag.find(item =>
      item.name === name &&
      item.size === size &&
      item.color === color
    );

    if (existing) {
      existing.qty += 1;
    } else {
      bag.push({
        id: ++nextId,
        name,
        price,
        priceNum,
        qty: 1,
        image,
        size,
        color
      });
    }

    saveBag();
    renderBag();
    openBag();
  }

  function updateQty(id, delta) {
    const item = bag.find(i => i.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      bag = bag.filter(i => i.id !== id);
    }

    saveBag();
    renderBag();
  }

  function removeFromBag(id) {
    bag = bag.filter(item => item.id !== id);
    saveBag();
    renderBag();
  }

  function clearBag() {
    bag = [];
    saveBag();
    renderBag();
  }

  function getTotalCount() {
    return bag.reduce((sum, item) => sum + item.qty, 0);
  }

  function getTotalPrice() {
    return bag.reduce((sum, item) => sum + (item.priceNum * item.qty), 0);
  }

  function renderBag() {
    const totalCount = getTotalCount();
    const totalPrice = getTotalPrice();

    if (bagCountEl) {
      bagCountEl.textContent = totalCount;
      bagCountEl.classList.toggle('visible', totalCount > 0);
    }

    if (!bagItemsEl) return;

    if (totalCount === 0) {
      bagItemsEl.innerHTML = `
        <div class="bag-empty" id="bag-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p>حقيبتك فارغة حالياً.</p>
          <span style="font-size:0.8rem;color:#999;">تصفح التشكيلات الراقية وأضف ما يعجبك</span>
        </div>
      `;
    } else {
      bagItemsEl.innerHTML = '';
      bag.forEach(item => {
        const row = document.createElement('div');
        row.className = 'bag-item';
        row.dataset.id = item.id;

        const imgHtml = item.image
          ? `<div class="bag-item-img" style="background-image: url('${escapeHtml(item.image)}');"></div>`
          : `<div class="bag-item-img" style="display:flex;align-items:center;justify-content:center;background:#eee;color:#999;">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
             </div>`;

        let metaHtml = '';
        if (item.size || item.color) {
          metaHtml = '<div class="bag-item-meta">';
          if (item.size) metaHtml += `<span class="bag-item-tag">المقاس: ${escapeHtml(item.size)}</span>`;
          if (item.color) metaHtml += `<span class="bag-item-tag">اللون: ${escapeHtml(item.color)}</span>`;
          metaHtml += '</div>';
        }

        const lineTotal = item.priceNum ? formatPrice(item.priceNum * item.qty) : item.price;

        row.innerHTML = `
          ${imgHtml}
          <div class="bag-item-info">
            <p class="bag-item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</p>
            ${metaHtml}
            <div class="bag-item-price-row">
              <span class="bag-item-price">${lineTotal}</span>
              <div class="bag-item-qty">
                <button type="button" class="bag-qty-btn minus" data-action="minus" aria-label="تقليل الكمية">−</button>
                <span class="bag-qty-num">${item.qty}</span>
                <button type="button" class="bag-qty-btn plus" data-action="plus" aria-label="زيادة الكمية">+</button>
              </div>
            </div>
          </div>
          <button type="button" class="bag-item-remove" data-action="remove" aria-label="حذف المنتج">✕</button>
        `;

        row.querySelector('[data-action="minus"]').addEventListener('click', (e) => {
          e.stopPropagation();
          updateQty(item.id, -1);
        });

        row.querySelector('[data-action="plus"]').addEventListener('click', (e) => {
          e.stopPropagation();
          updateQty(item.id, 1);
        });

        row.querySelector('[data-action="remove"]').addEventListener('click', (e) => {
          e.stopPropagation();
          removeFromBag(item.id);
        });

        bagItemsEl.appendChild(row);
      });
    }

    updateCheckoutArea(totalCount, totalPrice);
  }

  function updateCheckoutArea(totalCount, totalPrice) {
    const checkoutContainer = document.querySelector('.bag-checkout');
    if (!checkoutContainer) return;

    let summaryEl = document.getElementById('bag-summary');
    if (!summaryEl) {
      summaryEl = document.createElement('div');
      summaryEl.id = 'bag-summary';
      summaryEl.className = 'bag-summary';
      checkoutContainer.insertBefore(summaryEl, checkoutContainer.firstChild);
    }

    let clearBtn = document.getElementById('bag-clear-btn');
    if (!clearBtn) {
      clearBtn = document.createElement('button');
      clearBtn.id = 'bag-clear-btn';
      clearBtn.className = 'bag-clear-btn';
      clearBtn.textContent = 'إفراغ الحقيبة';
      clearBtn.type = 'button';
      clearBtn.addEventListener('click', clearBag);
      checkoutContainer.appendChild(clearBtn);
    }

    if (totalCount === 0) {
      summaryEl.style.display = 'none';
      clearBtn.style.display = 'none';
      if (bagCheckoutBtn) {
        bagCheckoutBtn.style.opacity = '0.5';
        bagCheckoutBtn.style.pointerEvents = 'none';
        bagCheckoutBtn.href = '#';
      }
      return;
    }

    summaryEl.style.display = 'flex';
    clearBtn.style.display = 'inline-block';
    if (bagCheckoutBtn) {
      bagCheckoutBtn.style.opacity = '1';
      bagCheckoutBtn.style.pointerEvents = 'all';
    }

    summaryEl.innerHTML = `
      <div class="bag-summary-row">
        <span>مجموع القطع:</span>
        <span><strong>${totalCount}</strong></span>
      </div>
      <div class="bag-summary-row total">
        <span>المجموع الإجمالي:</span>
        <span>${formatPrice(totalPrice)}</span>
      </div>
    `;

    const lines = bag.map(item => {
      let meta = '';
      if (item.size || item.color) {
        const parts = [];
        if (item.size) parts.push(`المقاس: ${item.size}`);
        if (item.color) parts.push(`اللون: ${item.color}`);
        meta = ` (${parts.join('، ')})`;
      }
      const lineCost = item.priceNum ? formatPrice(item.priceNum * item.qty) : item.price;
      return `• ${item.name}${meta} × ${item.qty} — ${lineCost}`;
    }).join('\n');

    const msg = `مرحباً! أود طلب المنتجات التالية من متجر TIER II:\n\n${lines}\n\nالمجموع الإجمالي: ${formatPrice(totalPrice)}\n\nيرجى تأكيد التوفر والتوصيل وشكراً.`;
    bagCheckoutBtn.href = `https://wa.me/212770734332?text=${encodeURIComponent(msg)}`;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function extractBgImage(element) {
    if (!element) return '';
    const img = element.querySelector('img');
    if (img && img.getAttribute('src')) return img.getAttribute('src');
    const styleBg = element.style.backgroundImage || window.getComputedStyle(element).backgroundImage;
    const match = styleBg && styleBg.match(/url\(["']?([^"']+)["']?\)/);
    return match ? match[1] : '';
  }

  if (bagBtn) bagBtn.addEventListener('click', openBag);
  if (bagCloseBtn) bagCloseBtn.addEventListener('click', closeBag);
  if (bagOverlay) bagOverlay.addEventListener('click', closeBag);

  // Add to cart from cards
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    if (btn.classList.contains('add-to-bag')) return; // handled separately

    const card = btn.closest('.product-card');
    if (card) {
      const name = card.dataset.name || card.querySelector('.card-name')?.textContent?.trim() || 'منتج مغربي';
      const price = card.dataset.price || card.querySelector('.price-after')?.textContent?.trim() || '';
      const imgEl = card.querySelector('.card-img');
      const image = extractBgImage(imgEl);
      addToBag(name, price, image);
      return;
    }

    const name  = btn.dataset.name  || 'منتج مغربي';
    const price = btn.dataset.price || '';
    addToBag(name, price);
  });

  // Add to bag from product detail page
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-bag');
    if (!btn) return;

    const nameEl  = document.querySelector('.product-name');
    const priceEl = document.querySelector('.product-price');
    const name    = btn.dataset.name  || nameEl?.textContent?.trim() || 'قفطان ملكي';
    const price   = btn.dataset.price || priceEl?.textContent?.trim() || '';

    const activeSizeEl  = document.querySelector('.size-btn.active');
    const activeColorEl = document.querySelector('.color-btn.active') || document.getElementById('color-selected-name');
    const size  = activeSizeEl ? (activeSizeEl.dataset.size || activeSizeEl.textContent.trim()) : '';
    const color = activeColorEl ? (activeColorEl.dataset.color || activeColorEl.textContent.trim()) : '';

    const mainImgEl = document.getElementById('gallery-main-img');
    const image = extractBgImage(mainImgEl) || 'imgs/caftan-brown.png';

    addToBag(name, price, image, size, color);
  });

  // Initial render
  renderBag();
})();


// ─── Product Detail Page: Swappable Gallery & Colors ──────────────────────
(function () {
  const gallery = document.getElementById('product-gallery');
  const mainWrap = document.getElementById('gallery-main-wrap');
  const mainImg = document.getElementById('gallery-main-img');
  const thumbsContainer = document.getElementById('gallery-thumbs');
  const prevBtn = document.getElementById('gallery-nav-prev');
  const nextBtn = document.getElementById('gallery-nav-next');
  const dotsContainer = document.getElementById('gallery-dots');
  const colorSelectedName = document.getElementById('color-selected-name');
  const directWaBtn = document.getElementById('btn-whatsapp-direct');

  if (!gallery || !mainImg) return;

  const thumbs = Array.from(gallery.querySelectorAll('.gallery-thumb'));
  let currentIndex = thumbs.findIndex(t => t.classList.contains('active'));
  if (currentIndex < 0) currentIndex = 0;

  // Build dots
  if (dotsContainer && thumbs.length > 1) {
    dotsContainer.innerHTML = '';
    thumbs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('aria-label', `صورة ${i + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToImage(i);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDirectWaLink() {
    if (!directWaBtn) return;
    const name = document.querySelector('.product-name')?.textContent?.trim() || 'قفطان ملكي';
    const price = document.querySelector('.product-price')?.textContent?.trim() || '890 د.م.';
    const sizeBtn = document.querySelector('.size-btn.active');
    const size = sizeBtn ? (sizeBtn.dataset.size || sizeBtn.textContent.trim()) : 'M';
    const colorBtn = document.querySelector('.color-btn.active');
    const color = colorBtn ? (colorBtn.dataset.color || colorBtn.getAttribute('title')) : (colorSelectedName?.textContent?.trim() || 'بني ملكي');

    const msg = `مرحباً! أود طلب ${name} (${price}) - المقاس: ${size}، اللون: ${color}`;
    directWaBtn.href = `https://wa.me/212770734332?text=${encodeURIComponent(msg)}`;
  }

  function goToImage(index, direction = 0) {
    if (!thumbs.length) return;
    if (index < 0) index = thumbs.length - 1;
    if (index >= thumbs.length) index = 0;

    currentIndex = index;
    const targetThumb = thumbs[currentIndex];

    // Smooth transition
    mainImg.style.opacity = '0.4';
    mainImg.style.transform = direction !== 0 ? `translateX(${direction * 8}px)` : 'scale(0.98)';

    setTimeout(() => {
      thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));

      const imgUrl = targetThumb.dataset.image;
      if (imgUrl) {
        mainImg.style.backgroundImage = `url('${imgUrl}')`;
        const innerImg = mainImg.querySelector('.gallery-main-img-tag') || mainImg.querySelector('img');
        if (innerImg) {
          innerImg.src = imgUrl;
          innerImg.style.display = 'block';
        }
      } else {
        const gradient = targetThumb.dataset.gradient || targetThumb.style.background;
        if (gradient) mainImg.style.background = gradient;
        const innerImg = mainImg.querySelector('.gallery-main-img-tag') || mainImg.querySelector('img');
        if (innerImg) innerImg.style.display = 'none';
      }

      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.gallery-dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
      }

      // Scroll thumbnail into view
      targetThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      mainImg.style.opacity = '1';
      mainImg.style.transform = 'none';
    }, 120);
  }

  // Thumb clicks
  gallery.addEventListener('click', function (e) {
    const thumb = e.target.closest('.gallery-thumb');
    if (!thumb) return;
    const idx = thumbs.indexOf(thumb);
    if (idx !== -1) goToImage(idx);
  });

  // Next / Prev button clicks
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToImage(currentIndex + 1, 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToImage(currentIndex - 1, -1);
    });
  }

  // Touch Swipe Gesture for Phones
  const swipeTarget = mainWrap || mainImg;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let isSwiping = false;

  swipeTarget.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchEndX = touchStartX;
    touchEndY = touchStartY;
    isSwiping = true;
  }, { passive: true });

  swipeTarget.addEventListener('touchmove', function (e) {
    if (!isSwiping || e.touches.length !== 1) return;
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // If mostly horizontal, prevent vertical scroll jitter
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      if (e.cancelable) e.preventDefault();
    }
  }, { passive: false });

  swipeTarget.addEventListener('touchend', function () {
    if (!isSwiping) return;
    isSwiping = false;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const minSwipeDist = 38;

    if (Math.abs(diffX) > minSwipeDist && Math.abs(diffX) > Math.abs(diffY)) {
      // Swiping right (diffX > 0) advances to NEXT image
      // Swiping left (diffX < 0) goes back to PREV image
      if (diffX > 0) {
        goToImage(currentIndex + 1, 1);
      } else {
        goToImage(currentIndex - 1, -1);
      }
    }
  }, { passive: true });

  // Size Button selection
  document.addEventListener('click', function (e) {
    const sizeBtn = e.target.closest('.size-btn');
    if (!sizeBtn) return;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    sizeBtn.classList.add('active');
    updateDirectWaLink();
  });

  // Color Swatch selection
  document.addEventListener('click', function (e) {
    const colorBtn = e.target.closest('.color-btn');
    if (!colorBtn) return;

    document.querySelectorAll('.color-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    colorBtn.classList.add('active');
    colorBtn.setAttribute('aria-checked', 'true');

    const colorName = colorBtn.dataset.color || colorBtn.getAttribute('title');
    if (colorSelectedName && colorName) {
      colorSelectedName.textContent = colorName;
    }

    // If color button has linked product image, switch main image to it
    const colorImg = colorBtn.dataset.image;
    if (colorImg) {
      const matchingThumbIdx = thumbs.findIndex(t => t.dataset.image === colorImg);
      if (matchingThumbIdx !== -1) {
        goToImage(matchingThumbIdx);
      } else {
        mainImg.style.backgroundImage = `url('${colorImg}')`;
        const innerImg = mainImg.querySelector('.gallery-main-img-tag') || mainImg.querySelector('img');
        if (innerImg) {
          innerImg.src = colorImg;
          innerImg.style.display = 'block';
        }
      }
    }

    updateDirectWaLink();
  });

  // Initialize direct WhatsApp link
  updateDirectWaLink();
})();


(function () {
  document.addEventListener('click', function (e) {

    if (e.target.closest('.add-to-cart, .add-to-bag, .bag-item-remove, button, a, select, input, label')) {
      return;
    }
    const card = e.target.closest('.product-card');
    if (card) {
      window.location.href = 'product.html';
    }
  });
})();


(function () {
  const selects = document.querySelectorAll('.nav-select');
  selects.forEach(sel => {
    sel.addEventListener('change', function () {
      const val = this.value;
      selects.forEach(s => { s.value = val; });
    });
  });
})();


(function () {
  const burgerBtn = document.getElementById('nav-burger-btn');
  const navMenu = document.getElementById('nav-menu');
  if (!burgerBtn || !navMenu) return;

  function toggleMenu(e) {
    e.stopPropagation();
    const isOpen = navMenu.classList.toggle('open');
    burgerBtn.classList.toggle('open', isOpen);
    burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    burgerBtn.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }

  burgerBtn.addEventListener('click', toggleMenu);

  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (!navMenu.contains(e.target) && !burgerBtn.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  let lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    if (Math.abs(window.scrollY - lastY) > 30 && navMenu.classList.contains('open')) {
      closeMenu();
    }
    lastY = window.scrollY;
  }, { passive: true });
})();


(function () {
  const searchBtn     = document.getElementById('nav-search-btn');
  const searchOverlay = document.getElementById('nav-search-overlay');
  const searchClose   = document.getElementById('nav-search-close');
  const searchInput   = document.getElementById('nav-search-input');
  const searchForm    = document.getElementById('nav-search-form');

  if (!searchBtn || !searchOverlay) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    if (searchInput) {
      setTimeout(() => {
        searchInput.focus();
        searchInput.select();
      }, 60);
    }
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
  }

  searchBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (searchOverlay.classList.contains('open')) {
      closeSearch();
    } else {
      openSearch();
    }
  });

  if (searchClose) {
    searchClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeSearch();
    });
  }

  searchOverlay.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-search-form')) {
      closeSearch();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
      closeSearch();
    }
  });

  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = (searchInput?.value || '').trim();
      window.location.href = 'catalogue.html' + (val ? '?search=' + encodeURIComponent(val) : '');
    });
  }
})();

/* ═══════════════════════════════════════════════════
   TIER II — WEBSTORE  |  script.js
   ═══════════════════════════════════════════════════ */

/* ── Hide / Show Navbar on Scroll ─────────────────── */
(function () {
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function handleNavbar() {
    const currentY = window.scrollY;

    if (currentY > lastScrollY && currentY > 80) {
      // Scrolling DOWN — hide navbar
      navbar.classList.add('hidden');
    } else {
      // Scrolling UP — show navbar
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

/* ── Shopping Bag ──────────────────────────────────── */
(function () {
  /* ── State ── */
  let bag = []; // Array of { id, name, price }
  let nextId = 1;

  /* ── DOM refs (may be null on pages without bag panel) ── */
  const bagBtn     = document.getElementById('bag-btn');
  const bagPanel   = document.getElementById('bag-panel');
  const bagOverlay = document.getElementById('bag-overlay');
  const bagCloseBtn = document.getElementById('bag-close-btn');
  const bagItemsEl = document.getElementById('bag-items');
  const bagEmptyEl = document.getElementById('bag-empty');
  const bagCountEl = document.getElementById('bag-count');
  const bagCheckoutBtn = document.getElementById('bag-checkout-btn');

  /* ── Open / close ── */
  function openBag() {
    if (!bagPanel) return;
    bagPanel.classList.add('open');
    bagOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBag() {
    if (!bagPanel) return;
    bagPanel.classList.remove('open');
    bagOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Add item ── */
  function addToBag(name, price) {
    bag.push({ id: nextId++, name, price });
    renderBag();
    openBag();
  }

  /* ── Remove item ── */
  function removeFromBag(id) {
    bag = bag.filter(item => item.id !== id);
    renderBag();
  }

  /* ── Render bag UI ── */
  function renderBag() {
    if (!bagItemsEl) return;

    // Update count badge
    if (bagCountEl) {
      bagCountEl.textContent = bag.length;
      bagCountEl.classList.toggle('visible', bag.length > 0);
    }

    // Empty state
    if (bagEmptyEl) {
      bagEmptyEl.style.display = bag.length === 0 ? 'block' : 'none';
    }

    // Remove old item rows (keep the empty-state element)
    const existingItems = bagItemsEl.querySelectorAll('.bag-item');
    existingItems.forEach(el => el.remove());

    // Render each item
    bag.forEach(item => {
      const row = document.createElement('div');
      row.className = 'bag-item';
      row.dataset.id = item.id;
      row.innerHTML = `
        <div class="bag-item-info">
          <p class="bag-item-name">${escapeHtml(item.name)}</p>
          <p class="bag-item-price">${escapeHtml(item.price)}</p>
        </div>
        <button class="bag-item-remove" aria-label="Remove ${escapeHtml(item.name)}">✕</button>
      `;
      row.querySelector('.bag-item-remove').addEventListener('click', () => removeFromBag(item.id));
      bagItemsEl.appendChild(row);
    });

    // Update WhatsApp checkout link
    updateCheckoutLink();
  }

  /* ── Build WhatsApp checkout URL ── */
  function updateCheckoutLink() {
    if (!bagCheckoutBtn) return;
    if (bag.length === 0) {
      bagCheckoutBtn.href = '#';
      return;
    }
    const lines = bag.map(item => `• ${item.name} — ${item.price}`).join('\n');
    const msg = `Hello! I'd like to order the following items:\n\n${lines}\n\nPlease confirm availability.`;
    bagCheckoutBtn.href = `https://wa.me/21300000000?text=${encodeURIComponent(msg)}`;
  }

  /* ── Helper: escape HTML ── */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Wire up bag button ── */
  if (bagBtn) bagBtn.addEventListener('click', openBag);
  if (bagCloseBtn) bagCloseBtn.addEventListener('click', closeBag);
  if (bagOverlay) bagOverlay.addEventListener('click', closeBag);

  /* ── Event delegation: .add-to-cart buttons (index.html static cards) ── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;

    // Read name/price from the closest product-card
    const card = btn.closest('.product-card');
    if (card) {
      const name  = card.dataset.name  || card.querySelector('.card-name')?.textContent?.trim()  || 'Item';
      const price = card.dataset.price || card.querySelector('.price-after')?.textContent?.trim() || '';
      addToBag(name, price);
      return;
    }

    // Fallback: product.html "Add to Bag" buttons (use data attrs on button itself)
    const name  = btn.dataset.name  || 'Item';
    const price = btn.dataset.price || '';
    addToBag(name, price);
  });

  /* ── Event delegation: .add-to-bag buttons (product.html) ── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.add-to-bag');
    if (!btn) return;
    const name  = btn.dataset.name  || document.querySelector('.product-name')?.textContent?.trim() || 'Item';
    const price = btn.dataset.price || document.querySelector('.product-price')?.textContent?.trim() || '';
    addToBag(name, price);
  });

  /* ── Initial render (badge hidden when 0) ── */
  renderBag();
})();

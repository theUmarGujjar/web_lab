/* ============================================================
   MAIN.JS — ShopZone Interactive Logic
   1. Mobile hamburger menu
   2. Mobile filter sidebar drawer
   3. Add to Cart (UI only — updates badge count)
   ============================================================ */

// ── DOM References ──
const hamburgerBtn  = document.getElementById('hamburgerBtn');
const hamburgerIcon = document.getElementById('hamburgerIcon');
const mobileNav     = document.getElementById('mobileNav');
const filterToggle  = document.getElementById('filterToggleBtn');
const filterSidebar = document.getElementById('filterSidebar');
const filterOverlay = document.getElementById('filterOverlay');
const sidebarClose  = document.getElementById('sidebarClose');
const cartBadge     = document.getElementById('cartBadge');
const addToCartBtns = document.querySelectorAll('.btn-add-cart');

// ── Cart count (persisted in sessionStorage) ──
let cartCount = parseInt(sessionStorage.getItem('cartCount') || '0', 10);
if (cartBadge) cartBadge.textContent = cartCount;

// ── Mobile Hamburger ──
if (hamburgerBtn && mobileNav) {
  hamburgerBtn.addEventListener('click', function () {
    const isOpen = mobileNav.classList.toggle('open');
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
    if (hamburgerIcon) {
      hamburgerIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-header') && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      if (hamburgerIcon) hamburgerIcon.className = 'fa-solid fa-bars';
    }
  });
}

// ── Filter Sidebar (mobile drawer) ──
function openFilterSidebar() {
  if (!filterSidebar || !filterOverlay) return;
  filterSidebar.classList.add('open');
  filterOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeFilterSidebar() {
  if (!filterSidebar || !filterOverlay) return;
  filterSidebar.classList.remove('open');
  filterOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (filterToggle)  filterToggle.addEventListener('click', openFilterSidebar);
if (sidebarClose)  sidebarClose.addEventListener('click', closeFilterSidebar);
if (filterOverlay) filterOverlay.addEventListener('click', closeFilterSidebar);

// ── Add to Cart ──
addToCartBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    // Visual feedback
    btn.classList.add('added');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
    btn.disabled = true;

    // Increment cart
    cartCount++;
    sessionStorage.setItem('cartCount', cartCount);
    if (cartBadge) cartBadge.textContent = cartCount;

    // Reset button after 2s
    setTimeout(function () {
      btn.classList.remove('added');
      btn.innerHTML = original;
      btn.disabled = false;
    }, 2000);
  });
});

// ── Sync search category dropdown on shop page ──
const searchCat = document.getElementById('searchCatSelect');
if (searchCat && typeof filters !== 'undefined' && filters.category && filters.category !== 'all') {
  const opt = searchCat.querySelector(`option[value="${filters.category}"]`);
  if (opt) opt.selected = true;
}

// ── Motion One Animations ──
const { animate, stagger, inView } = window.Motion || {};

if (animate && inView) {
  // Simple slide-up fade-in for headers
  document.querySelectorAll('[data-animate="slide-up"]').forEach(el => {
    inView(el, () => {
      animate(el, { y: [30, 0], opacity: [0, 1] }, { duration: 0.6, easing: "ease-out" });
    });
  });

  // Staggered categories
  const catContainer = document.getElementById('staggerCategories');
  if (catContainer) {
    inView(catContainer, () => {
      const tiles = catContainer.querySelectorAll('.cat-tile');
      animate(tiles, { y: [30, 0], opacity: [0, 1] }, { delay: stagger(0.1), duration: 0.5, easing: "ease-out" });
    });
  }

  // Staggered featured products
  const featContainer = document.getElementById('staggerFeatured');
  if (featContainer) {
    inView(featContainer, () => {
      const cards = featContainer.querySelectorAll('.product-card');
      animate(cards, { y: [30, 0], opacity: [0, 1] }, { delay: stagger(0.1), duration: 0.6, easing: "ease-out" });
    });
  }

  // Staggered shop grid
  const shopContainer = document.getElementById('staggerShop');
  if (shopContainer) {
    const cards = shopContainer.querySelectorAll('.product-card');
    animate(cards, { y: [30, 0], opacity: [0, 1] }, { delay: stagger(0.05), duration: 0.4, easing: "ease-out" });
  }

  // Fade in empty state
  const emptyState = document.querySelector('[data-animate="fade-in"]');
  if (emptyState) {
    animate(emptyState, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.4 });
  }
}

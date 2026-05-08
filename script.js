// Простой JavaScript для сайта магазина одежды
  // Init Telegram
  const tg = window.Telegram?.WebApp;
  if (tg) { tg.ready(); tg.expand(); }

  // Data
  const allProducts = [
    { id:1, name:'Базовая футболка', sub:'Унисекс', price:990, oldPrice:1490, emoji:'👕', cat:'tops', badge:'−33%' },
    { id:2, name:'Прямые джинсы', sub:'Мужские', price:2490, oldPrice:null, emoji:'👖', cat:'bottoms', badge:null },
    { id:3, name:'Оверсайз худи', sub:'Унисекс', price:1990, oldPrice:2690, emoji:'🧥', cat:'tops', badge:'−26%' },
    { id:4, name:'Мини-юбка', sub:'Женские', price:1290, oldPrice:null, emoji:'👗', cat:'bottoms', badge:'Новинка' },
    { id:5, name:'Пуховик', sub:'Унисекс', price:4990, oldPrice:6990, emoji:'🧣', cat:'outerwear', badge:'−29%' },
    { id:6, name:'Кепка', sub:'Аксессуар', price:590, oldPrice:null, emoji:'🧢', cat:'accessories', badge:null },
    { id:7, name:'Кожаная куртка', sub:'Унисекс', price:5990, oldPrice:7990, emoji:'🥻', cat:'outerwear', badge:'−25%' },
    { id:8, name:'Носки 3 пары', sub:'Унисекс', price:390, oldPrice:null, emoji:'🧦', cat:'accessories', badge:'Хит' },
  ];

  let cart = [];
  let favorites = new Set();
  let currentCat = 'all';
  let searchQuery = '';

  function getFiltered() {
    return allProducts.filter(p => {
      const catOk = currentCat === 'all' || p.cat === currentCat;
      const searchOk = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return catOk && searchOk;
    });
  }

  function renderProducts() {
    const list = getFiltered();
    const el = document.getElementById('products');
    if (list.length === 0) {
      el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 0;color:var(--text-muted);font-size:14px">Ничего не найдено 😕</div>`;
      return;
    }
    el.innerHTML = list.map(p => `
      <div class="product-card" style="animation: fadeUp 0.4s ease both">
        <div style="position:relative">
          <div class="product-img-placeholder">${p.emoji}</div>
          ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
          <button class="fav-btn" onclick="toggleFav(${p.id}, this)">
            ${favorites.has(p.id) ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-sub">${p.sub}</div>
          <div class="product-footer">
            <div>
              <span class="product-price">${p.price.toLocaleString('ru')} ₽</span>
              ${p.oldPrice ? `<span class="product-old-price">${p.oldPrice.toLocaleString('ru')} ₽</span>` : ''}
            </div>
            <button class="add-btn ${isInCart(p.id) ? 'added' : ''}" onclick="addToCart(${p.id}, this)">
              ${isInCart(p.id) ? '✓' : '+'}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function isInCart(id) { return cart.some(i => i.id === id); }

  function addToCart(id, btn) {
    const product = allProducts.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
      btn.classList.add('added');
      btn.textContent = '✓';
    }
    updateCartCount();
    showToast(`${product.name} добавлен в корзину`);
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  }

  function toggleFav(id, btn) {
    if (favorites.has(id)) {
      favorites.delete(id);
      btn.textContent = '🤍';
      showToast('Убрано из избранного');
    } else {
      favorites.add(id);
      btn.textContent = '❤️';
      showToast('Добавлено в избранное ❤️');
    }
    if (tg) tg.HapticFeedback?.impactOccurred('light');
  }

  function updateCartCount() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    const el = document.getElementById('cartCount');
    el.textContent = total;
    el.classList.toggle('visible', total > 0);
  }

  function filterCat(cat, el) {
    currentCat = cat;
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    renderProducts();
  }

  function filterProducts(q) {
    searchQuery = q;
    renderProducts();
  }

  function toggleSearch() {
    const bar = document.getElementById('searchBar');
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) bar.querySelector('input').focus();
  }

  function scrollToProducts() {
    document.getElementById('productsSection').scrollIntoView({ behavior: 'smooth' });
  }

  // CART
  function openCart() {
    document.getElementById('cartOverlay').classList.add('open');
    document.getElementById('cartDrawer').classList.add('open');
    renderCart();
  }

  function closeCart() {
    document.getElementById('cartOverlay').classList.remove('open');
    document.getElementById('cartDrawer').classList.remove('open');
  }

  function renderCart() {
    const el = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const checkoutEl = document.getElementById('checkoutBtn');

    if (cart.length === 0) {
      el.innerHTML = `<div class="cart-empty">🛍️<br><br>Корзина пуста<br><span style="font-size:12px">Добавьте что-нибудь!</span></div>`;
      totalEl.style.display = 'none';
      checkoutEl.style.display = 'none';
      return;
    }

    el.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${(item.price * item.qty).toLocaleString('ru')} ₽</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="removeItem(${item.id})">🗑</button>
      </div>
    `).join('');

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    document.getElementById('totalPrice').textContent = total.toLocaleString('ru') + ' ₽';
    totalEl.style.display = 'flex';
    checkoutEl.style.display = 'block';
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeItem(id);
    else { updateCartCount(); renderCart(); }
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartCount();
    renderCart();
    renderProducts();
    if (tg) tg.HapticFeedback?.impactOccurred('medium');
  }

  function checkout() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (tg) {
      tg.sendData(JSON.stringify({ action: 'order', items: cart, total }));
    }
    showToast('Заказ оформлен! 🎉');
    cart = [];
    updateCartCount();
    closeCart();
    renderProducts();
    if (tg) tg.HapticFeedback?.notificationOccurred('success');
  }

  // TOAST
  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
  }

  // Init
  renderProducts();
// Обработчик для кнопок "Купить"
document.addEventListener('DOMContentLoaded', function() {
    const buyButtons = document.querySelectorAll('.banner-btn, .product-card');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('Товар добавлен в корзину!');
        });
    });

    // Обработчик для поиска
    const searchBtn = document.querySelector('.search-btn');
    const searchBar = document.querySelector('.search-bar');
    const searchInput = document.querySelector('.search-input');

    if (searchBtn && searchBar) {
        searchBtn.addEventListener('click', function() {
            searchBar.classList.toggle('open');
            if (searchBar.classList.contains('open')) {
                searchInput.focus();
            }
        });
    }

    // Обработчик для корзины (просто показать/скрыть счетчик)
    const cartBtn = document.querySelector('.cart-btn');
    const cartCount = document.querySelector('.cart-count');

    if (cartBtn && cartCount) {
        cartBtn.addEventListener('click', function() {
            cartCount.classList.toggle('visible');
        });
    }

    // Обработчик для категорий
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.addEventListener('click', function() {
            alert('Категория: ' + this.querySelector('.category-name').textContent);
        });
    });
});
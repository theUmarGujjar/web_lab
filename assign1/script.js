// Simple product data
const products = [
  { id: 1, title: "Wireless Headphones", price: 59.99, image: "images/headphones.png" },
  { id: 2, title: "Smart Watch", price: 129.99, image: "images/smartwatch.png" },
  { id: 3, title: "Bluetooth Speaker", price: 39.99, image: "images/speaker.png" },
  { id: 4, title: "Fitness Tracker", price: 49.99, image: "images/fitnesstracker.png" },
  { id: 5, title: "E-Reader", price: 89.99, image: "images/ereader.png" }
];

const cart = [];

function renderProducts() {
  const productsDiv = document.querySelector('.products');
  productsDiv.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <div class="product-title">${product.title}</div>
      <div class="product-price">$${product.price.toFixed(2)}</div>
      <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productsDiv.appendChild(div);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const cartDiv = document.querySelector('.cart');
  const cartItemsDiv = cartDiv.querySelector('.cart-items');
  cartItemsDiv.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <span>${item.title} x${item.qty}</span>
      <span>$${(item.price * item.qty).toFixed(2)}</span>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });
  cartDiv.querySelector('.cart-total').textContent = `Total: $${total.toFixed(2)}`;
}

function toggleCart() {
  document.querySelector('.cart').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  document.querySelector('.cart-icon').addEventListener('click', toggleCart);
  document.querySelector('.checkout-btn').addEventListener('click', () => {
    alert('Checkout is not implemented in this demo.');
  });

  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('main-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
    hamburger.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        nav.classList.toggle('open');
      }
    });
  }
});

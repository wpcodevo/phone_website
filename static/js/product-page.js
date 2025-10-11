document.addEventListener('DOMContentLoaded', () => {
  // thumbnail clicks change main image
  const thumbnails = document.querySelectorAll('.product__pictures .picture');
  const mainImg = document.getElementById('pic');
  const zoom = document.getElementById('zoom');

  thumbnails.forEach((t) => {
    t.addEventListener('click', (e) => {
      const src = e.target.src;
      if (mainImg) mainImg.src = src;
      if (zoom) zoom.style.backgroundImage = `url(${src})`;
      // open lightbox on click (desktop behavior)
      if (window.innerWidth > 720) {
        openLightbox(src);
      }
    });
  });

  // Dynamic subtotal calculation
  const qtyInput = document.getElementById('product-quantity');
  const subtotalEl = document.getElementById('subtotal-price');
  const plusBtn = document.querySelector('.plus-btn');
  const minusBtn = document.querySelector('.minus-btn');
  
  // Get product price from the page
  const priceEl = document.querySelector('.new__price');
  let basePrice = 0;
  if (priceEl) {
    const priceText = priceEl.textContent.replace('$', '').replace(',', '');
    basePrice = parseFloat(priceText) || 0;
  }

  function updateSubtotal() {
    if (qtyInput && subtotalEl && basePrice > 0) {
      const quantity = parseInt(qtyInput.value) || 1;
      const subtotal = (basePrice * quantity).toFixed(2);
      subtotalEl.textContent = `$${subtotal}`;
    }
  }

  // Quantity controls
  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || 1;
      const max = parseInt(qtyInput.getAttribute('max')) || 999;
      if (current < max) {
        qtyInput.value = current + 1;
        updateSubtotal();
      }
    });
  }

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || 1;
      const min = parseInt(qtyInput.getAttribute('min')) || 1;
      if (current > min) {
        qtyInput.value = current - 1;
        updateSubtotal();
      }
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('input', updateSubtotal);
    qtyInput.addEventListener('change', () => {
      const min = parseInt(qtyInput.getAttribute('min')) || 1;
      const max = parseInt(qtyInput.getAttribute('max')) || 999;
      let value = parseInt(qtyInput.value) || min;
      
      if (value < min) value = min;
      if (value > max) value = max;
      
      qtyInput.value = value;
      updateSubtotal();
    });
  }

  // Initialize subtotal on page load
  updateSubtotal();

  // Wire Add To Cart and Buy Now
  const addBtn = document.querySelector('.product__btn');
  const buyBtn = document.getElementById('buy-now');

  async function addToCart(productId, qty) {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ product_id: productId, quantity: qty })
      });

      if (res.status === 401) {
        // redirect to login
        sessionStorage.setItem('post_login_redirect', window.location.pathname + window.location.search);
        window.location.href = '/login/';
        return;
      }

      const data = await res.json();
      if (data.success) {
        // Show success message with animation
        showSuccessMessage(data.message || 'Added to cart');
        // update cart count badge if possible
        if (window.cartManager && typeof window.cartManager.updateCartCount === 'function') {
          window.cartManager.updateCartCount(data.cart_count);
        }
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Add to cart failed', err);
      alert('Network error');
    }
  }

  function showSuccessMessage(message) {
    // Create or reuse success notification
    let notification = document.getElementById('cart-success-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'cart-success-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        font-family: 'Archivo', sans-serif;
        font-weight: 500;
      `;
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
    }, 3000);
  }

  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const pid = parseInt(addBtn.dataset.productId);
      const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
      if (pid) addToCart(pid, qty);
    });
  }

  if (buyBtn) {
    buyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const pid = parseInt(buyBtn.dataset.productId);
      const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
      if (!pid) return;
      // Add to cart then go to checkout/cart
      await addToCart(pid, qty);
      window.location.href = '/cart/';
    });
  }

  // Enhanced product tabs functionality
  const tabBtns = document.querySelectorAll('.detail-btn');
  const tabContents = document.querySelectorAll('.content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.id;
      
      // Remove active class from all tabs and contents
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      btn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // Lightbox utility
  function ensureLightbox() {
    let modal = document.getElementById('lightboxModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'lightboxModal';
      modal.className = 'lightbox-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      `;
      modal.innerHTML = `
        <div class="lightbox-inner" style="max-width: 90%; max-height: 90%;">
          <img id="lightboxImg" src="" alt="" style="max-width: 100%; max-height: 100%; object-fit: contain;"/>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', () => {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
      });
    }
    return modal;
  }

  function openLightbox(src) {
    const modal = ensureLightbox();
    const img = modal.querySelector('#lightboxImg');
    if (img) img.src = src;
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
  }
});
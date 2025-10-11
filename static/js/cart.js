/**
 * Dynamic Cart Management System
 * Handles all cart operations with real-time updates and user feedback
 */

class CartManager {
    constructor() {
        this.cartCountElement = document.getElementById('cart__total');
        console.log('Cart Manager initialized');
        console.log('Cart count element:', this.cartCountElement);
        // Ensure cart badge shows 0 by default until we fetch the real count
        if (this.cartCountElement) this.cartCountElement.textContent = '0';
        this.init();
    }

    init() {
        // Initialize cart count on page load
        this.updateCartCount();
        
        // Add event listeners for cart buttons
        this.addEventListeners();
        
        // If on cart page, load cart items
        if (window.location.pathname === '/cart/') {
            this.loadCartPage();
        }
    }

    addEventListeners() {
        // Add to cart buttons (both static and dynamic)
        document.addEventListener('click', (e) => {
            // Handle both direct buttons and buttons inside links
            const button = e.target.closest('.product__btn');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                this.handleAddToCart(button);
                return;
            }
            
            // Cart page quantity controls
            if (e.target.matches('.plus-btn, .plus-btn svg, .plus-btn use')) {
                e.preventDefault();
                this.handleQuantityChange(e.target, 'increase');
            }
            
            if (e.target.matches('.minus-btn, .minus-btn svg, .minus-btn use')) {
                e.preventDefault();
                this.handleQuantityChange(e.target, 'decrease');
            }
            
            // Remove from cart
            if (e.target.matches('.remove__cart-item, .remove__cart-item svg, .remove__cart-item use')) {
                e.preventDefault();
                this.handleRemoveFromCart(e.target);
            }
        });

        // Quantity input direct change
        document.addEventListener('change', (e) => {
            if (e.target.matches('.counter-btn')) {
                this.handleQuantityInputChange(e.target);
            }
        });
    }

    async handleAddToCart(button) {
        try {
            console.log('Add to cart clicked', button);
            
            // Extract product data from the product element
            const productElement = button.closest('.product');
            console.log('Product element:', productElement);
            
            if (!productElement) {
                this.showNotification('Product information not found', 'error');
                return;
            }

            // Get product data
            const productData = this.extractProductData(productElement);
            console.log('Extracted product data:', productData);
            
            if (!productData) {
                this.showNotification('Could not extract product data', 'error');
                return;
            }

            // Show loading state
            const originalText = button.textContent;
            button.textContent = 'Adding...';
            button.disabled = true;

            // Add to cart via API
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    product_id: productData.id,
                    quantity: 1
                })
            });

            if (response.status === 401) {
                // Not authenticated -> redirect to login
                this.redirectToLogin();
                return;
            }

            const result = await response.json();
            console.log('API response:', result);

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.updateCartCount(result.cart_count);
                
                // Animate button
                button.style.background = '#28a745';
                setTimeout(() => {
                    button.style.background = '';
                }, 1000);
            } else {
                this.showNotification(result.message || 'Failed to add to cart', 'error');
            }

        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            // Reset button state
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 1000);
        }
    }

    extractProductData(productElement) {
        try {
            // Method 1: From data attributes (preferred for dynamic products)
            let productId = productElement.dataset.productId;
            
            if (productId) {
                // Get other data from DOM elements
                const titleElement = productElement.querySelector('h3, .product__title');
                const priceElement = productElement.querySelector('h4, .product__price h4, .price span');
                const imgElement = productElement.querySelector('img');

                return {
                    id: parseInt(productId),
                    title: titleElement ? titleElement.textContent.trim() : 'Product',
                    price: priceElement ? priceElement.textContent.replace('$', '').trim() : '0',
                    image: imgElement ? imgElement.src : ''
                };
            }

            // Method 2: Extract from DOM elements (fallback for static products)
            const imgElement = productElement.querySelector('img');
            const titleElement = productElement.querySelector('h3, .product__title');
            const priceElement = productElement.querySelector('h4, .product__price h4, .price span');

            if (imgElement && titleElement && priceElement) {
                // Extract ID from image path and product title
                const imgSrc = imgElement.src;
                const imageName = imgSrc.split('/').pop();
                const title = titleElement.textContent.trim().toLowerCase();
                
                console.log('Extracting from:', { imageName, title, imgSrc });
                
                // Enhanced mapping for both image names and titles
                let mappedId = null;
                
                // Map by image name first
                const imageToIdMap = {
                    'iphone1.jpeg': 1001, 'iphone2.jpeg': 1002, 'iphone3.jpeg': 1003,
                    'iphone4.jpeg': 1004, 'iphone5.jpeg': 1005, 'iphone6.jpeg': 1006,
                    'samsung1.jpeg': 2001, 'samsung2.jpeg': 2002, 'samsung3.jpeg': 2003,
                    'samsung4.jpeg': 2004, 'samsung5.jpeg': 2005, 'samsung6.jpeg': 2006,
                    'headphone1.jpeg': 3001, 'headphone2.jpeg': 3002, 'headphone3.jpeg': 3003,
                    'headphone4.jpeg': 3004, 'headphone5.jpeg': 3005, 'headphone6.jpeg': 3006,
                    'headphone7.jpeg': 3007, 'headphone8.jpeg': 3008, 'headphone9.jpeg': 3009,
                    'headphone10.jpeg': 3010, 'headphone11.jpeg': 3011, 'headphone12.jpeg': 3012
                };

                mappedId = imageToIdMap[imageName];
                
                // If no ID from image, try to map by product title
                if (!mappedId) {
                    if (title.includes('iphone') || title.includes('apple')) {
                        // Default to iPhone 6 for Apple products
                        mappedId = 1006;
                    } else if (title.includes('samsung') || title.includes('galaxy')) {
                        // Default to Samsung Galaxy for Samsung products  
                        mappedId = 2005;
                    } else if (title.includes('headphone') || title.includes('sony')) {
                        // Default to Sony headphones
                        mappedId = 3001;
                    } else {
                        // Generic fallback
                        mappedId = 1001;
                    }
                }
                
                console.log('Mapped product ID:', mappedId);
                
                if (mappedId) {
                    return { 
                        id: mappedId, 
                        title: titleElement.textContent.trim(),
                        price: priceElement.textContent.replace('$', '').trim(),
                        image: imgElement.src
                    };
                }
            }

            console.error('Could not extract product data from element:', productElement);
            return null;

        } catch (error) {
            console.error('Error extracting product data:', error);
            return null;
        }
    }

    async handleQuantityChange(element, action) {
        const row = element.closest('tr');
        if (!row) return;

        const quantityInput = row.querySelector('.counter-btn');
        const productId = this.getProductIdFromRow(row);
        
        if (!quantityInput || !productId) return;

        let currentQuantity = parseInt(quantityInput.value) || 1;
        let newQuantity = action === 'increase' ? currentQuantity + 1 : currentQuantity - 1;
        
        // Ensure minimum quantity is 1
        if (newQuantity < 1) newQuantity = 1;
        if (newQuantity > 10) newQuantity = 10; // Maximum limit

        await this.updateCartQuantity(productId, newQuantity, quantityInput, row);
    }

    async handleQuantityInputChange(input) {
        const row = input.closest('tr');
        if (!row) return;

        const productId = this.getProductIdFromRow(row);
        let quantity = parseInt(input.value) || 1;
        
        // Validate quantity
        if (quantity < 1) quantity = 1;
        if (quantity > 10) quantity = 10;
        
        input.value = quantity; // Update input with validated value
        
        await this.updateCartQuantity(productId, quantity, input, row);
    }

    async updateCartQuantity(productId, quantity, quantityInput, row) {
        try {
            const response = await fetch('/api/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
                })
            });

            if (response.status === 401) {
                this.redirectToLogin();
                return;
            }

            const result = await response.json();

            if (result.success) {
                quantityInput.value = quantity;
                this.updateRowTotal(row, quantity);
                this.updateCartTotals(result.total);
                this.updateCartCount(result.count);
                this.showNotification('Quantity updated', 'success');
            } else {
                this.showNotification(result.message || 'Failed to update quantity', 'error');
            }

        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    async handleRemoveFromCart(element) {
        const row = element.closest('tr');
        if (!row) return;

        const productId = this.getProductIdFromRow(row);
        if (!productId) return;

        if (!confirm('Are you sure you want to remove this item from your cart?')) {
            return;
        }

        try {
            const response = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    product_id: productId
                })
            });

            if (response.status === 401) {
                this.redirectToLogin();
                return;
            }

            const result = await response.json();

            if (result.success) {
                // Animate row removal
                row.style.transition = 'opacity 0.3s ease';
                row.style.opacity = '0';
                
                setTimeout(() => {
                    row.remove();
                    this.updateCartTotals(result.total);
                    this.updateCartCount(result.count);
                    
                    // Check if cart is empty
                    if (result.count === 0) {
                        this.showEmptyCart();
                    }
                }, 300);

                this.showNotification(result.message, 'success');
            } else {
                this.showNotification(result.message || 'Failed to remove item', 'error');
            }

        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    getProductIdFromRow(row) {
        // Try to get product ID from data attribute
        let productId = row.dataset.productId;
        
        if (!productId) {
            // Extract from image source
            const img = row.querySelector('img');
            if (img) {
                const imageName = img.src.split('/').pop();
                const imageToIdMap = {
                    'iphone1.jpeg': 1001, 'iphone2.jpeg': 1002, 'iphone3.jpeg': 1003,
                    'iphone4.jpeg': 1004, 'iphone5.jpeg': 1005, 'iphone6.jpeg': 1006,
                    'samsung1.jpeg': 2001, 'samsung2.jpeg': 2002, 'samsung3.jpeg': 2003,
                    'samsung4.jpeg': 2004, 'samsung5.jpeg': 2005, 'samsung6.jpeg': 2006,
                    'headphone1.jpeg': 3001, 'headphone2.jpeg': 3002, 'headphone3.jpeg': 3003,
                    'headphone4.jpeg': 3004, 'headphone5.jpeg': 3005, 'headphone6.jpeg': 3006,
                    'headphone7.jpeg': 3007, 'headphone8.jpeg': 3008, 'headphone9.jpeg': 3009,
                    'headphone10.jpeg': 3010, 'headphone11.jpeg': 3011, 'headphone12.jpeg': 3012
                };
                productId = imageToIdMap[imageName];
            }
        }
        
        return productId;
    }

    updateRowTotal(row, quantity) {
        const priceElement = row.querySelector('.product__price .new__price');
        const totalElement = row.querySelector('.product__subtotal .new__price');
        
        if (priceElement && totalElement) {
            const price = parseFloat(priceElement.textContent.replace('$', ''));
            const total = price * quantity;
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
    }

    updateCartTotals(newTotal) {
        // Update cart totals section
        const subtotalElements = document.querySelectorAll('.cart__totals .new__price');
        if (subtotalElements.length >= 2) {
            subtotalElements[0].textContent = `$${newTotal.toFixed(2)}`; // Subtotal
            subtotalElements[1].textContent = `$${newTotal.toFixed(2)}`; // Total (assuming no shipping)
        }
    }

    async updateCartCount(count = null) {
        try {
            if (count === null) {
                // Fetch current cart count
                const response = await fetch('/api/cart/get', {
                    credentials: 'same-origin'
                });
                if (response.status === 401) {
                    // If not authenticated, treat count as zero (do not redirect here)
                    count = 0;
                } else {
                    const result = await response.json();
                    count = result.count || 0;
                }
            }

            if (this.cartCountElement) {
                this.cartCountElement.textContent = count;
                
                // Animate cart count
                if (count > 0) {
                    this.cartCountElement.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        this.cartCountElement.style.transform = 'scale(1)';
                    }, 200);
                }
            }

        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    async loadCartPage() {
        try {
            const response = await fetch('/api/cart/get', {
                credentials: 'same-origin'
            });

            if (response.status === 401) {
                // If user is not logged in, redirect to login page
                this.redirectToLogin();
                return;
            }
            const result = await response.json();

            const tableBody = document.querySelector('.cart__table tbody');
            if (!tableBody) return;

            if (result.cart_items.length === 0) {
                this.showEmptyCart();
                return;
            }

            // Clear existing static content
            tableBody.innerHTML = '';

            // Populate with real cart items
            result.cart_items.forEach(item => {
                const row = this.createCartRow(item);
                tableBody.appendChild(row);
            });

            // Update totals
            this.updateCartTotals(result.total);
            this.updateCartCount(result.count);

        } catch (error) {
            console.error('Error loading cart page:', error);
            this.showNotification('Failed to load cart items', 'error');
        }
    }

    createCartRow(item) {
        const row = document.createElement('tr');
        row.dataset.productId = item.product_id;
        
        const subtotal = (item.product_price * item.quantity).toFixed(2);
        
        row.innerHTML = `
            <td class="product__thumbnail">
                <a href="#">
                    <img src="${item.product_image}" alt="${item.product_title}">
                </a>
            </td>
            <td class="product__name">
                <a href="#">${item.product_title}</a>
            </td>
            <td class="product__price">
                <div class="price">
                    <span class="new__price">$${item.product_price.toFixed(2)}</span>
                </div>
            </td>
            <td class="product__quantity">
                <div class="input-counter">
                    <div>
                        <span class="minus-btn">
                            <svg>
                                <use xlink:href="./static/images/sprite.svg#icon-minus"></use>
                            </svg>
                        </span>
                        <input type="text" min="1" value="${item.quantity}" max="10" class="counter-btn">
                        <span class="plus-btn">
                            <svg>
                                <use xlink:href="./static/images/sprite.svg#icon-plus"></use>
                            </svg>
                        </span>
                    </div>
                </div>
            </td>
            <td class="product__subtotal">
                <div class="price">
                    <span class="new__price">$${subtotal}</span>
                </div>
                <a href="#" class="remove__cart-item">
                    <svg>
                        <use xlink:href="./static/images/sprite.svg#icon-trash"></use>
                    </svg>
                </a>
            </td>
        `;
        
        return row;
    }

    showEmptyCart() {
        const tableBody = document.querySelector('.cart__table tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started!</p>
                        <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #eb0028; color: white; text-decoration: none; border-radius: 5px;">
                            Continue Shopping
                        </a>
                    </td>
                </tr>
            `;
        }
        
        // Reset totals
        this.updateCartTotals(0);
        this.updateCartCount(0);
    }

    showNotification(message, type = 'info') {
        // Create or update notification element
        let notification = document.getElementById('cart-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(notification);
        }

        // Set notification style based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    }

    redirectToLogin() {
        // store current path to return after login
        try {
            const returnTo = window.location.pathname + window.location.search;
            sessionStorage.setItem('post_login_redirect', returnTo);
        } catch (e) {}
        window.location.href = '/login/';
    }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}
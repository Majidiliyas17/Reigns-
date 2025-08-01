document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const domCache = {
        backToTopButton: document.querySelector('.back-to-top'),
        cartCount: document.querySelector('.cart-count'),
        cartItemsContainer: document.querySelector('.cart-items'),
        subtotalElement: document.querySelector('.amount'),
        quickViewModal: document.getElementById('quickViewModal'),
        shoppingCart: document.getElementById('shoppingCart')
    };

    // Initialize Bootstrap components
    const initBootstrapComponents = () => {
        // Tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        
        // Modal and Offcanvas instances
        return {
            quickViewModal: new bootstrap.Modal(domCache.quickViewModal),
            shoppingCart: new bootstrap.Offcanvas(domCache.shoppingCart)
        };
    };

    const bsComponents = initBootstrapComponents();

    // Back to top button
    const handleBackToTop = () => {
        window.addEventListener('scroll', function() {
            domCache.backToTopButton.classList.toggle('active', window.pageYOffset > 300);
        });
        
        domCache.backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    };

    // Shopping cart functionality
    let cart = [];
    
    const updateCartCount = () => {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        domCache.cartCount.textContent = totalItems;
    };
    
    const createCartItemHTML = (item) => {
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h5>${item.name}</h5>
                    <p>Size: ${item.size}</p>
                    <p>Color: ${item.color}</p>
                    <div class="cart-item-price">
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </div>
                <button class="btn-remove" data-id="${item.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    };
    
    const updateCartUI = () => {
        if (cart.length === 0) {
            domCache.cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your bag is empty</p>
                </div>
            `;
            domCache.subtotalElement.textContent = '$0.00';
            return;
        }
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        domCache.cartItemsContainer.innerHTML = cart.map(createCartItemHTML).join('');
        domCache.subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        
        // Delegate events for cart items
        domCache.cartItemsContainer.addEventListener('click', function(e) {
            const target = e.target.closest('.quantity-btn.minus, .quantity-btn.plus, .btn-remove');
            if (!target) return;
            
            const id = target.getAttribute('data-id');
            if (target.classList.contains('minus')) {
                decreaseQuantity(id);
            } else if (target.classList.contains('plus')) {
                increaseQuantity(id);
            } else if (target.classList.contains('btn-remove')) {
                removeFromCart(id);
            }
        });
    };
    
    const addToCart = (product) => {
        const defaultProduct = {
            id: Date.now(),
            name: 'Sample Product',
            price: 49.99,
            image: 'https://via.placeholder.com/100',
            size: 'M',
            color: 'Blue',
            quantity: 1
        };
        
        const newProduct = product ? {...defaultProduct, ...product} : defaultProduct;
        
        const existingItem = cart.find(item => 
            item.name === newProduct.name && 
            item.size === newProduct.size && 
            item.color === newProduct.color
        );
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(newProduct);
        }
        
        updateCartCount();
        updateCartUI();
        showToast('Item added to cart');
    };
    
    const removeFromCart = (id) => {
        cart = cart.filter(item => item.id != id);
        updateCartCount();
        updateCartUI();
    };
    
    const increaseQuantity = (id) => {
        const item = cart.find(item => item.id == id);
        if (item) {
            item.quantity += 1;
            updateCartUI();
        }
    };
    
    const decreaseQuantity = (id) => {
        const item = cart.find(item => item.id == id);
        if (!item) return;
        
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            removeFromCart(id);
        }
        updateCartUI();
    };
    
    // Toast notification system
    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
    
    // Quick view modal
    const showCard = (imgElement) => {
        const productImage = document.getElementById('modalProductImage');
        const productTitle = document.getElementById('modalProductTitle');
        
        productImage.src = imgElement.src;
        productImage.alt = imgElement.alt;
        productTitle.textContent = imgElement.alt || 'Product Title';
        
        bsComponents.quickViewModal.show();
    };
    
    // Event delegation for product interactions
    document.addEventListener('click', function(e) {
        // Quick view buttons
        if (e.target.closest('.btn-quickview')) {
            const card = e.target.closest('.product-card');
            const img = card.querySelector('img');
            showCard(img);
        }
        
        // Add to cart buttons
        if (e.target.closest('[onclick="addToCart()"]')) {
            const card = e.target.closest('.product-card');
            const product = {
                name: card.querySelector('.product-title').textContent,
                price: parseFloat(card.querySelector('.price').textContent.replace('$', '')),
                image: card.querySelector('img').src
            };
            addToCart(product);
        }
    });
    
    // Navigation system
    const navigateTo = (sectionId) => {
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
        
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.scrollIntoView({behavior: 'smooth'});
        } else if (sectionId === 'home') {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };
    
    // Expose navigation functions to window
    window.home = () => navigateTo('home');
    window.shop = () => navigateTo('shop');
    window.blog = () => navigateTo('blog');
    window.about = () => navigateTo('about');
    window.contact = () => navigateTo('contact');
    window.addItem = () => bsComponents.shoppingCart.show();
    
    // Initialize
    handleBackToTop();
    updateCartCount();
    updateCartUI();
    
    // Add toast styles dynamically
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
    .toast-message {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #2ecc71;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1100;
    }
    .toast-message.show {
        opacity: 1;
        bottom: 30px;
    }
    .toast-message i {
        font-size: 20px;
    }`;
    document.head.appendChild(toastStyle);
});
/**
 * Fish Shop - Cart Module
 * Handles shopping cart functionality with localStorage persistence
 */

class ShoppingCart {
	constructor() {
		this.items = this.loadFromStorage()
		this.listeners = []
		this.bindEvents()
		this.updateUI()
	}

	/**
	 * Load cart from localStorage
	 */
	loadFromStorage() {
		try {
			const stored = localStorage.getItem('fishShopCart')
			return stored ? JSON.parse(stored) : []
		} catch (error) {
			console.error('Error loading cart from storage:', error)
			return []
		}
	}

	/**
	 * Save cart to localStorage
	 */
	saveToStorage() {
		try {
			localStorage.setItem('fishShopCart', JSON.stringify(this.items))
		} catch (error) {
			console.error('Error saving cart to storage:', error)
		}
	}

	/**
	 * Add item to cart
	 */
	addItem(product, quantity = 1) {
		if (!product || !product.id) {
			throw new Error('Invalid product data')
		}

		const existingItem = this.items.find(item => item.id === product.id)

		if (existingItem) {
			existingItem.quantity += quantity
		} else {
			this.items.push({
				id: product.id,
				name: product.name,
				price: product.price,
				image: product.image,
				quantity: quantity,
				addedAt: new Date().toISOString(),
			})
		}

		this.saveToStorage()
		this.updateUI()
		this.notifyListeners('itemAdded', { product, quantity })

		console.log(`Added ${quantity}x ${product.name} to cart`)
	}

	/**
	 * Remove item from cart
	 */
	removeItem(productId) {
		const index = this.items.findIndex(item => item.id === productId)
		if (index > -1) {
			const removedItem = this.items.splice(index, 1)[0]
			this.saveToStorage()
			this.updateUI()
			this.notifyListeners('itemRemoved', { item: removedItem })
			console.log(`Removed ${removedItem.name} from cart`)
		}
	}

	/**
	 * Update item quantity
	 */
	updateQuantity(productId, quantity) {
		const item = this.items.find(item => item.id === productId)
		if (item) {
			if (quantity <= 0) {
				this.removeItem(productId)
			} else {
				item.quantity = quantity
				this.saveToStorage()
				this.updateUI()
				this.notifyListeners('quantityUpdated', { item, quantity })
			}
		}
	}

	/**
	 * Get cart total
	 */
	getTotal() {
		return this.items.reduce(
			(total, item) => total + item.price * item.quantity,
			0
		)
	}

	/**
	 * Get total items count
	 */
	getTotalItems() {
		return this.items.reduce((total, item) => total + item.quantity, 0)
	}

	/**
	 * Clear entire cart
	 */
	clear() {
		this.items = []
		this.saveToStorage()
		this.updateUI()
		this.notifyListeners('cartCleared')
		console.log('Cart cleared')
	}

	/**
	 * Add event listener
	 */
	addEventListener(callback) {
		this.listeners.push(callback)
	}

	/**
	 * Notify all listeners
	 */
	notifyListeners(event, data) {
		this.listeners.forEach(callback => {
			try {
				callback(event, data)
			} catch (error) {
				console.error('Error in cart listener:', error)
			}
		})
	}

	/**
	 * Bind UI events
	 */
	bindEvents() {
		// Cart toggle
		const cartToggle = document.getElementById('cart-toggle')
		const closeCart = document.getElementById('close-cart')
		const cartOverlay = document.getElementById('cart-overlay')

		if (cartToggle) cartToggle.addEventListener('click', () => this.openCart())
		if (closeCart) closeCart.addEventListener('click', () => this.closeCart())
		if (cartOverlay)
			cartOverlay.addEventListener('click', () => this.closeCart())

		// ESC key to close cart
		document.addEventListener('keydown', e => {
			if (e.key === 'Escape') this.closeCart()
		})
	}

	/**
	 * Open cart sidebar
	 */
	openCart() {
		const cartOverlay = document.getElementById('cart-overlay')
		if (cartOverlay) {
			cartOverlay.classList.add('active')
			document.body.style.overflow = 'hidden'
		}
	}

	/**
	 * Close cart sidebar
	 */
	closeCart() {
		const cartOverlay = document.getElementById('cart-overlay')
		if (cartOverlay) {
			cartOverlay.classList.remove('active')
			document.body.style.overflow = ''
		}
	}

	/**
	 * Update cart UI elements
	 */
	updateUI() {
		this.updateCartCount()
		this.updateCartItems()
		this.updateCartSummary()
	}

	/**
	 * Update cart count badge
	 */
	updateCartCount() {
		const totalItems = this.getTotalItems()
		const cartCount = document.getElementById('cart-count')

		if (cartCount) {
			cartCount.textContent = totalItems
			cartCount.classList.toggle('hidden', totalItems === 0)
		}
	}

	/**
	 * Update cart items display
	 */
	updateCartItems() {
		const cartEmpty = document.getElementById('cart-empty')
		const cartItems = document.getElementById('cart-items')

		if (!cartItems) return

		if (this.items.length === 0) {
			if (cartEmpty) cartEmpty.style.display = 'block'
			cartItems.style.display = 'none'
			return
		}

		if (cartEmpty) cartEmpty.style.display = 'none'
		cartItems.style.display = 'block'

		// Render cart items
		const cartItemsContainer = document.getElementById('cart-items')
		if (cartItemsContainer) {
			cartItemsContainer.innerHTML = this.items
				.map(
					item => `
				<div class="cart-item" data-id="${item.id}">
					<div class="cart-item-image">
						<img src="${item.image}" alt="${
						item.name
					}" onerror="this.src='images/fish-placeholder.svg'">
					</div>
					<div class="cart-item-details">
						<h4>${item.name}</h4>
						<div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
						<div class="cart-item-controls">
							<button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${
						item.quantity - 1
					})">-</button>
							<span class="quantity">${item.quantity}</span>
							<button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${
						item.quantity + 1
					})">+</button>
							<button class="remove-btn" onclick="cart.removeItem('${item.id}')">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</div>
					<div class="cart-item-total">
						${(item.price * item.quantity).toLocaleString()} ₽
					</div>
				</div>
			`
				)
				.join('')
		}
	}

	/**
	 * Update cart summary
	 */
	updateCartSummary() {
		const total = this.getTotal()
		const totalElements = document.querySelectorAll('.cart-total')

		totalElements.forEach(element => {
			element.textContent = `${total.toLocaleString()} ₽`
		})
	}
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ShoppingCart
}

/**
 * Fish Shop - Main Application
 * Orchestrates all modules and handles app initialization
 */

class FishShopApp {
	constructor() {
		this.cart = null
		this.productsManager = null
		this.initialized = false
		this.debug = localStorage.getItem('fishShop_debug') === 'true'

		// Bind methods
		this.handleAddToCart = this.handleAddToCart.bind(this)
		this.handleCartEvents = this.handleCartEvents.bind(this)
	}

	/**
	 * Initialize the application
	 */
	async init() {
		if (this.initialized) {
			console.warn('App already initialized')
			return
		}

		try {
			this.log('Initializing Fish Shop App...')

			// Initialize modules
			this.cart = new ShoppingCart()
			this.productsManager = new ProductsManager()

			// Make cart globally accessible for HTML onclick handlers
			window.cart = this.cart

			// Set up event listeners
			this.setupEventListeners()

			// Initialize UI components
			this.initLoadingScreen()
			this.initNavigation()
			this.initContactForm()
			this.initAddressAutocomplete()

			// Load products
			await this.productsManager.loadProducts()

			this.initialized = true
			this.log('App initialized successfully')
		} catch (error) {
			console.error('Failed to initialize app:', error)
			this.showInitializationError(error)
		}
	}

	/**
	 * Set up global event listeners
	 */
	setupEventListeners() {
		// Add to cart buttons (using delegation) - only for add-to-cart buttons
		document.addEventListener('click', e => {
			// Only handle clicks on add-to-cart buttons or their children
			if (e.target.closest('.add-to-cart')) {
				this.handleAddToCart(e)
			}
		})

		// Cart UI events (cart drawer, buttons, etc.)
		this.setupCartUIEvents()

		// Global keyboard shortcuts
		document.addEventListener('keydown', e => {
			// Ctrl/Cmd + K for search
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault()
				this.focusSearch()
			}

			// F5 to refresh products
			if (e.key === 'F5' && !e.ctrlKey) {
				e.preventDefault()
				this.productsManager.loadProducts(true)
			}
		})

		// Online/offline events
		window.addEventListener('online', () => {
			this.log('Connection restored')
			this.productsManager.loadProducts(true)
		})

		window.addEventListener('offline', () => {
			this.log('Connection lost - using cached data')
		})

		// Visibility change (tab focus)
		document.addEventListener('visibilitychange', () => {
			if (!document.hidden) {
				// Refresh products when tab becomes visible (if cache is stale)
				if (!this.productsManager.isCacheValid()) {
					this.productsManager.loadProducts()
				}
			}
		})

		// Order form submission
		const orderForm = document.getElementById('order-form')
		if (orderForm) {
			orderForm.addEventListener('submit', e => {
				e.preventDefault()
				this.handleOrderSubmission(e)
			})
		}
	}

	/**
	 * Handle add to cart button clicks
	 */
	handleAddToCart(e) {
		const button = e.target.closest('.add-to-cart')

		if (!button) {
			console.log('❌ No add-to-cart button found')
			return
		}

		console.log('🛒 Adding product to cart', button)

		e.preventDefault()
		e.stopPropagation()

		// Check if button is disabled
		if (button.disabled || button.hasAttribute('disabled')) {
			this.log('Add to cart button is disabled')
			return
		}

		try {
			// Get product data from button attributes
			const productId = button.dataset.id
			const productName = button.dataset.name
			const productPrice = parseFloat(button.dataset.price)
			const productImage = button.dataset.image
			const productUnit = button.dataset.unit

			if (!productId || !productName || !productPrice) {
				throw new Error('Missing product data on button')
			}

			// Create product object
			const product = {
				id: productId,
				name: productName,
				price: productPrice,
				image: productImage,
				unit: productUnit,
				inStock: true,
			}

			this.log('Adding product to cart:', product.name)

			// Add to cart
			this.cart.addItem(product)

			// Show success animation
			this.showAddToCartSuccess(button)
		} catch (error) {
			console.error('Error adding to cart:', error)
			this.showAddToCartError(button, error.message)
		}
	}

	/**
	 * Handle cart events
	 */
	handleCartEvents(event, data) {
		this.log(`Cart event: ${event}`, data)

		switch (event) {
			case 'itemAdded':
				// Could trigger analytics, notifications, etc.
				break
			case 'itemRemoved':
				// Could trigger undo functionality
				break
			case 'cartCleared':
				// Could trigger confirmation
				break
		}
	}

	/**
	 * Show add to cart success animation
	 */
	showAddToCartSuccess(button) {
		const originalContent = button.innerHTML

		button.innerHTML = '<i class="fas fa-check"></i> Добавлено!'
		button.classList.add('success')
		button.disabled = true

		setTimeout(() => {
			button.innerHTML = originalContent
			button.classList.remove('success')
			button.disabled = false
		}, 2000)
	}

	/**
	 * Show add to cart error
	 */
	showAddToCartError(button, errorMessage) {
		const originalContent = button.innerHTML

		button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка'
		button.classList.add('error')

		setTimeout(() => {
			button.innerHTML = originalContent
			button.classList.remove('error')
		}, 3000)

		// Could also show a toast notification
		console.error('Add to cart error:', errorMessage)
	}

	/**
	 * Toggle cart visibility
	 */
	toggleCart(forceClose = false) {
		const cartSidebar = document.getElementById('cart-sidebar')
		const cartOverlay = document.getElementById('cart-overlay')

		if (!cartSidebar) {
			console.error('Cart sidebar element not found')
			return
		}

		const isOpen = cartSidebar.classList.contains('open')

		if (forceClose || isOpen) {
			// Close cart
			cartSidebar.classList.remove('open')
			cartOverlay?.classList.remove('active')
			document.body.classList.remove('cart-open')
			this.log('Cart closed')
		} else {
			// Open cart
			cartSidebar.classList.add('open')
			cartOverlay?.classList.add('active')
			document.body.classList.add('cart-open')
			this.log('Cart opened')
		}

		// Update cart content when opening
		if (!isOpen && !forceClose) {
			this.cart?.updateUI()
		}
	}

	/**
	 * Setup cart UI event listeners
	 */
	setupCartUIEvents() {
		// Main cart toggle button (header cart icon)
		const cartToggleBtn = document.getElementById('cart-toggle')
		console.log('🛒 Setting up cart events, button found:', !!cartToggleBtn)
		if (cartToggleBtn) {
			cartToggleBtn.addEventListener('click', e => {
				console.log('🛒 Cart button clicked!')
				e.preventDefault()
				e.stopPropagation()
				this.toggleCart()
			})
		} else {
			console.error('❌ Cart toggle button not found!')
		}

		// Cart toggle buttons with data attribute (if any)
		const cartButtons = document.querySelectorAll('[data-action="toggle-cart"]')
		cartButtons.forEach(button => {
			button.addEventListener('click', e => {
				e.preventDefault()
				e.stopPropagation()
				this.toggleCart()
			})
		})

		// Main cart close button
		const cartCloseBtn = document.getElementById('close-cart')
		if (cartCloseBtn) {
			cartCloseBtn.addEventListener('click', e => {
				e.preventDefault()
				e.stopPropagation()
				this.toggleCart(true)
			})
		}

		// Cart close buttons with data attribute (if any)
		const closeButtons = document.querySelectorAll('[data-action="close-cart"]')
		closeButtons.forEach(button => {
			button.addEventListener('click', e => {
				e.preventDefault()
				e.stopPropagation()
				this.toggleCart(true)
			})
		})

		// Cart overlay click to close
		const cartOverlay = document.getElementById('cart-overlay')
		if (cartOverlay) {
			cartOverlay.addEventListener('click', e => {
				// Only close if clicked on overlay itself, not on cart content
				if (e.target === cartOverlay) {
					this.toggleCart(true)
				}
			})
		}

		// ESC key to close cart
		document.addEventListener('keydown', e => {
			if (e.key === 'Escape') {
				const cartSidebar = document.getElementById('cart-sidebar')
				if (cartSidebar && cartSidebar.classList.contains('open')) {
					this.toggleCart(true)
				}
			}
		})

		// Prevent body scroll when cart is open
		const observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (
					mutation.type === 'attributes' &&
					mutation.attributeName === 'class'
				) {
					const cartSidebar = document.getElementById('cart-sidebar')
					if (cartSidebar && cartSidebar.classList.contains('open')) {
						document.body.style.overflow = 'hidden'
					} else {
						document.body.style.overflow = ''
					}
				}
			})
		})

		const cartSidebar = document.getElementById('cart-sidebar')
		if (cartSidebar) {
			observer.observe(cartSidebar, {
				attributes: true,
				attributeFilter: ['class'],
			})
		}

		// Checkout button
		const checkoutBtn = document.getElementById('show-checkout-form')
		if (checkoutBtn) {
			checkoutBtn.addEventListener('click', e => {
				e.preventDefault()
				this.showCheckoutForm()
			})
		}
	}

	/**
	 * Initialize loading screen
	 */
	initLoadingScreen() {
		const loadingScreen = document.getElementById('loading-screen')
		if (!loadingScreen) return

		// Hide loading screen after delay
		setTimeout(() => {
			loadingScreen.classList.add('fade-out')
			setTimeout(() => {
				loadingScreen.style.display = 'none'
			}, 500)
		}, 1500)
	}

	/**
	 * Initialize navigation
	 */
	initNavigation() {
		// Mobile menu toggle
		const mobileMenuToggle = document.querySelector('.mobile-menu-toggle')
		const mainNav = document.querySelector('.main-nav')

		if (mobileMenuToggle && mainNav) {
			mobileMenuToggle.addEventListener('click', () => {
				mainNav.classList.toggle('active')
			})
		}

		// Smooth scrolling for anchor links
		document.querySelectorAll('a[href^="#"]').forEach(link => {
			link.addEventListener('click', e => {
				e.preventDefault()
				const targetId = link.getAttribute('href').substring(1)
				const targetElement = document.getElementById(targetId)

				if (targetElement) {
					targetElement.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
					})
				}
			})
		})
	}

	/**
	 * Initialize contact form
	 */
	initContactForm() {
		const contactForm = document.getElementById('contact-form')
		if (!contactForm) return

		contactForm.addEventListener('submit', e => {
			e.preventDefault()
			// Handle form submission
			this.log('Contact form submitted')
		})
	}

	/**
	 * Initialize address autocomplete
	 */
	initAddressAutocomplete() {
		const addressInput = document.getElementById('address-input')
		const addressSuggestions = document.getElementById('address-suggestions')

		if (addressInput && addressSuggestions) {
			// TODO: Implement AddressAutocomplete class
			console.log('Address autocomplete placeholder - implement when needed')

			// Simple fallback for now
			addressInput.addEventListener('input', e => {
				const value = e.target.value.trim()
				if (value.length > 2) {
					addressSuggestions.innerHTML = `
						<div class="suggestion-item">
							<i class="fas fa-map-marker-alt"></i>
							${value} (демо - автодополнение отключено)
						</div>
					`
				} else {
					addressSuggestions.innerHTML = ''
				}
			})
		}
	}

	/**
	 * Focus search input
	 */
	focusSearch() {
		const searchInput = document.querySelector('.search-input')
		if (searchInput) {
			searchInput.focus()
		}
	}

	/**
	 * Show initialization error
	 */
	showInitializationError(error) {
		const errorDiv = document.createElement('div')
		errorDiv.className = 'app-error'
		errorDiv.innerHTML = `
			<div class="error-content">
				<h2>Ошибка инициализации</h2>
				<p>Не удалось загрузить приложение: ${error.message}</p>
				<button onclick="location.reload()" class="btn btn-primary">
					Перезагрузить страницу
				</button>
			</div>
		`

		document.body.insertBefore(errorDiv, document.body.firstChild)
	}

	/**
	 * Debug logging
	 */
	log(...args) {
		if (this.debug) {
			console.log('[FishShop]', ...args)
		}
	}

	/**
	 * Toggle debug mode
	 */
	toggleDebug() {
		this.debug = !this.debug
		localStorage.setItem('fishShop_debug', this.debug)
		console.log(`Debug mode ${this.debug ? 'enabled' : 'disabled'}`)
	}

	/**
	 * Show checkout form
	 */
	showCheckoutForm() {
		// Проверяем, что корзина не пуста
		if (this.cart.getTotalItems() === 0) {
			alert('Ваша корзина пуста')
			return
		}

		// Показываем форму оформления заказа
		const checkoutForm = document.getElementById('checkout-form')
		const cartSummary = document.getElementById('cart-summary')

		if (checkoutForm && cartSummary) {
			cartSummary.style.display = 'none'
			checkoutForm.classList.remove('hidden')

			// Обновляем итоговую сумму в форме
			this.cart.updateUI()
		}
	}

	/**
	 * Handle order form submission
	 */
	async handleOrderSubmission(e) {
		const form = e.target
		const formData = new FormData(form)

		// Получаем данные формы
		const orderData = {
			name: formData.get('name'),
			phone: formData.get('phone'),
			address: formData.get('address'),
			payment: formData.get('payment'),
			comment: formData.get('comment') || '',
			items: this.cart.items,
			total: this.cart.getTotal() + 300, // + доставка
		}

		try {
			// Показываем индикатор загрузки
			const submitBtn = form.querySelector('button[type="submit"]')
			if (submitBtn) {
				submitBtn.disabled = true
				submitBtn.textContent = 'Отправляем заказ...'
			}

			// Здесь можно отправить заказ на сервер
			console.log('Отправка заказа:', orderData)

			// Имитируем отправку
			await new Promise(resolve => setTimeout(resolve, 1000))

			// Показываем сообщение об успехе
			alert('Заказ успешно отправлен! Мы свяжемся с вами в ближайшее время.')

			// Очищаем корзину
			this.cart.clear()

			// Закрываем корзину
			this.toggleCart(true)
		} catch (error) {
			console.error('Ошибка отправки заказа:', error)
			alert(
				'Произошла ошибка при отправке заказа. Пожалуйста, попробуйте еще раз.'
			)
		} finally {
			// Возвращаем кнопку в исходное состояние
			const submitBtn = form.querySelector('button[type="submit"]')
			if (submitBtn) {
				submitBtn.disabled = false
				submitBtn.textContent = 'Оформить заказ'
			}
		}
	}
}

// Global instances
let fishShopApp
let cart
let productsManager

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
	try {
		fishShopApp = new FishShopApp()
		await fishShopApp.init()

		// Expose globals for backward compatibility
		cart = fishShopApp.cart
		productsManager = fishShopApp.productsManager

		// Expose debug toggle globally
		window.toggleDebug = () => fishShopApp.toggleDebug()
	} catch (error) {
		console.error('Failed to initialize Fish Shop App:', error)
	}
})

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { FishShopApp, ShoppingCart, ProductsManager }
}

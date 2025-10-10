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
		// Add to cart buttons (using delegation)
		document.addEventListener('click', this.handleAddToCart)

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
	}

	/**
	 * Handle add to cart button clicks
	 */
	handleAddToCart(e) {
		console.log('🛒 handleAddToCart called', e.target)

		// Сначала проверяем, клик был на самой кнопке
		let button = e.target.closest('.add-to-cart')

		// Если не на кнопке, ищем кнопку в карточке товара
		if (!button) {
			const productCard = e.target.closest('.product-card')
			if (productCard) {
				button = productCard.querySelector('.add-to-cart')
				console.log('🔍 Found button in product card:', button)
			}
		}

		if (!button) {
			console.log('❌ No add-to-cart button found')
			return
		}
		console.log('✅ Found add-to-cart button', button)

		e.preventDefault()
		e.stopPropagation()

		// Check if button is disabled
		if (button.disabled || button.hasAttribute('disabled')) {
			this.log('Add to cart button is disabled')
			return
		}

		try {
			const productCard = button.closest('.product-card')
			if (!productCard) {
				throw new Error('Product card not found')
			}

			const productId = productCard.dataset.id
			if (!productId) {
				throw new Error('Product ID not found')
			}

			// Get product data
			const product = this.productsManager.getProductById(productId)
			if (!product) {
				throw new Error('Product not found in manager')
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
	 * Setup cart UI event listeners
	 */
	setupCartUIEvents() {
		// Cart toggle buttons
		const cartButtons = document.querySelectorAll('[data-action="toggle-cart"]')
		cartButtons.forEach(button => {
			button.addEventListener('click', () => {
				const cartDrawer = document.getElementById('cart-drawer')
				if (cartDrawer) {
					cartDrawer.classList.toggle('open')
				}
			})
		})

		// Cart close buttons
		const closeButtons = document.querySelectorAll('[data-action="close-cart"]')
		closeButtons.forEach(button => {
			button.addEventListener('click', () => {
				const cartDrawer = document.getElementById('cart-drawer')
				if (cartDrawer) {
					cartDrawer.classList.remove('open')
				}
			})
		})

		// Cart overlay click
		const cartOverlay = document.getElementById('cart-overlay')
		if (cartOverlay) {
			cartOverlay.addEventListener('click', () => {
				const cartDrawer = document.getElementById('cart-drawer')
				if (cartDrawer) {
					cartDrawer.classList.remove('open')
				}
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

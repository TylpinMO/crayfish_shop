/**
 * Fish Shop - Products Module
 * Handles product loading and display
 */

class ProductsManager {
	constructor() {
		this.products = []
		this.categories = []
		this.loading = false
		this.error = null
		this.cache = {
			data: null,
			timestamp: 0,
			ttl: 5 * 60 * 1000, // 5 minutes
		}
	}

	/**
	 * Load products from API
	 */
	async loadProducts(forceRefresh = false) {
		// Check cache first
		if (!forceRefresh && this.isCacheValid()) {
			console.log('Using cached products data')
			this.updateUI(this.cache.data.products)
			return this.cache.data
		}

		if (this.loading) {
			console.log('Products already loading...')
			return
		}

		this.loading = true
		this.showLoadingState()

		try {
			console.log('Fetching products from API...')
			const response = await fetch('/api/products', {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
				},
			})

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			}

			const data = await response.json()
			console.log('API Response:', data)

			if (!data.success) {
				throw new Error(data.message || 'API returned error')
			}

			// Cache the data
			this.cache = {
				data: data,
				timestamp: Date.now(),
				ttl: 5 * 60 * 1000,
			}

			this.products = data.products || []
			this.categories = data.categories || []
			this.error = null

			console.log(`Loaded ${this.products.length} products successfully`)
			console.log('Products sample:', this.products.slice(0, 2))
			this.updateUI(this.products)

			return data
		} catch (error) {
			console.error('Failed to load products:', error)
			this.error = error.message
			this.showErrorState(error.message)

			// Try to show cached data if available
			if (this.cache.data) {
				console.log('Using stale cached data due to error')
				this.updateUI(this.cache.data.products)
			}

			throw error
		} finally {
			this.loading = false
		}
	}

	/**
	 * Check if cache is valid
	 */
	isCacheValid() {
		return this.cache.data && Date.now() - this.cache.timestamp < this.cache.ttl
	}

	/**
	 * Show loading state
	 */
	showLoadingState() {
		const productGrid = document.querySelector('#products-grid')
		if (productGrid) {
			productGrid.innerHTML = `
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<h3>Загрузка товаров...</h3>
					<p>Получаем актуальную информацию о товарах</p>
				</div>
			`
		}
	}

	/**
	 * Show error state
	 */
	showErrorState(errorMessage) {
		const productGrid = document.querySelector('#products-grid')
		if (productGrid) {
			productGrid.innerHTML = `
				<div class="error-state">
					<div class="error-icon">
						<i class="fas fa-exclamation-triangle"></i>
					</div>
					<h3>Ошибка загрузки товаров</h3>
					<p>${errorMessage}</p>
					<button class="btn btn-primary" onclick="productsManager.loadProducts(true)">
						<i class="fas fa-redo"></i> Попробовать снова
					</button>
				</div>
			`
		}
	}

	/**
	 * Show empty state
	 */
	showEmptyState() {
		const productGrid = document.querySelector('#products-grid')
		if (productGrid) {
			productGrid.innerHTML = `
				<div class="empty-state">
					<div class="empty-icon">
						<i class="fas fa-fish"></i>
					</div>
					<h3>В данный момент товаров нет, но они скоро появятся</h3>
					<p>Мы работаем над пополнением ассортимента</p>
				</div>
			`
		}
	}

	/**
	 * Update products UI
	 */
	updateUI(products) {
		const productGrid = document.querySelector('#products-grid')
		if (!productGrid) return

		if (!products || products.length === 0) {
			this.showEmptyState()
			return
		}

		productGrid.innerHTML = products
			.map(product => this.renderProductCard(product))
			.join('')

		console.log(`Rendered ${products.length} products`)
	}

	/**
	 * Render single product card
	 */
	renderProductCard(product) {
		const priceDisplay = product.oldPrice
			? `<span class="price">${product.price.toLocaleString()} ₽</span>
			 <span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>`
			: `<span class="price">${product.price.toLocaleString()} ₽</span>`

		return `
			<div class="product-card" data-id="${product.id}">
				<div class="product-image">
					<img src="${product.image}" 
						 alt="${product.name}" 
						 loading="lazy" 
						 onerror="this.onerror=null; this.src='images/fish-placeholder.svg'">
					${product.isFeatured ? '<span class="featured-badge">Хит продаж</span>' : ''}
					${
						!product.inStock
							? '<span class="out-of-stock-badge">Нет в наличии</span>'
							: ''
					}
				</div>
				<div class="product-info">
					<div class="product-category">${product.category}</div>
					<h3>${product.name}</h3>
					<p class="product-description">${product.description || ''}</p>
					<div class="product-price">
						${priceDisplay}
						<span class="unit">за ${product.unit}</span>
					</div>
					<button class="add-to-cart btn btn-primary" 
						data-id="${product.id}"
						data-name="${product.name}"
						data-price="${product.price}"
						data-image="${product.image}"
						data-unit="${product.unit}"
						${!product.inStock ? 'disabled' : ''}>
						<i class="fas fa-shopping-cart"></i>
						${product.inStock ? 'В корзину' : 'Нет в наличии'}
					</button>
				</div>
			</div>
		`
	}

	/**
	 * Filter products by category
	 */
	filterByCategory(categorySlug) {
		if (!categorySlug || categorySlug === 'all') {
			this.updateUI(this.products)
			return
		}

		const filtered = this.products.filter(
			product => product.categorySlug === categorySlug
		)

		this.updateUI(filtered)
		console.log(
			`Filtered ${filtered.length} products for category: ${categorySlug}`
		)
	}

	/**
	 * Search products
	 */
	searchProducts(query) {
		if (!query || query.trim().length < 2) {
			this.updateUI(this.products)
			return
		}

		const searchTerm = query.toLowerCase().trim()
		const filtered = this.products.filter(
			product =>
				product.name.toLowerCase().includes(searchTerm) ||
				product.description.toLowerCase().includes(searchTerm) ||
				product.category.toLowerCase().includes(searchTerm)
		)

		this.updateUI(filtered)
		console.log(`Found ${filtered.length} products for query: ${query}`)
	}

	/**
	 * Get product by ID
	 */
	getProductById(id) {
		return this.products.find(product => product.id === id)
	}

	/**
	 * Get products by category
	 */
	getProductsByCategory(categorySlug) {
		return this.products.filter(
			product => product.categorySlug === categorySlug
		)
	}

	/**
	 * Get featured products
	 */
	getFeaturedProducts() {
		return this.products.filter(product => product.isFeatured)
	}
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ProductsManager
}

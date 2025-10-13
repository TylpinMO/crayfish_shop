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
		const weightDisplay = product.weight
			? `${product.weight} ${product.unit}`
			: product.unit

		return `
			<div class="product-card" data-id="${
				product.id
			}" onclick="productsManager.showProductModal(${product.id})">
				<div class="product-image">
					<img src="${product.image}" 
						 alt="${product.name}" 
						 loading="lazy" 
						 onerror="this.onerror=null; this.src='/images/products/placeholder.svg'">
					${product.isFeatured ? '<span class="featured-badge">Хит</span>' : ''}
					${
						!product.isInStock
							? '<span class="out-of-stock-badge">Нет в наличии</span>'
							: ''
					}
				</div>
				<div class="product-info">
					<div class="product-category">${product.category}</div>
					<h3>${product.name}</h3>
					<div class="product-price">
						<span class="price">${product.price.toLocaleString()} ₽</span>
						<span class="unit">за ${weightDisplay}</span>
					</div>
					<button class="add-to-cart btn btn-primary" 
						data-id="${product.id}"
						data-name="${product.name}"
						data-price="${product.price}"
						data-image="${product.image}"
						data-unit="${weightDisplay}"
						onclick="event.stopPropagation()"
						${!product.isInStock ? 'disabled' : ''}>
						<i class="fas fa-shopping-cart"></i>
						${product.isInStock ? 'В корзину' : 'Нет в наличии'}
					</button>
				</div>
			</div>
		`
	}

	/**
	 * Show product modal with full description
	 */
	showProductModal(productId) {
		const product = this.products.find(p => p.id == productId)
		if (!product) return

		const weightDisplay = product.weight
			? `${product.weight} ${product.unit}`
			: product.unit

		const modalHTML = `
			<div class="product-modal-overlay" id="product-modal-overlay" onclick="this.remove()">
				<div class="product-modal" onclick="event.stopPropagation()">
					<button class="modal-close" onclick="document.getElementById('product-modal-overlay').remove()">
						<i class="fas fa-times"></i>
					</button>
					<div class="modal-content">
						<div class="modal-image">
							<img src="${product.image}" alt="${product.name}" 
								onerror="this.src='/images/products/placeholder.svg'">
							${product.isFeatured ? '<span class="featured-badge">Хит</span>' : ''}
						</div>
						<div class="modal-info">
							<div class="product-category">${product.category}</div>
							<h2>${product.name}</h2>
							<div class="product-description">
								${product.description || 'Описание товара отсутствует'}
							</div>
							<div class="product-details">
								<div class="detail-row">
									<span>Вес/количество:</span>
									<span>${weightDisplay}</span>
								</div>
								<div class="detail-row">
									<span>Наличие:</span>
									<span class="${product.isInStock ? 'in-stock' : 'out-of-stock'}">
										${
											product.isInStock
												? `В наличии (${product.stockQuantity} шт)`
												: 'Нет в наличии'
										}
									</span>
								</div>
							</div>
							<div class="modal-price">
								<span class="price">${product.price.toLocaleString()} ₽</span>
								<span class="unit">за ${weightDisplay}</span>
							</div>
							<button class="add-to-cart btn btn-primary btn-large" 
								data-id="${product.id}"
								data-name="${product.name}"
								data-price="${product.price}"
								data-image="${product.image}"
								data-unit="${weightDisplay}"
								${!product.isInStock ? 'disabled' : ''}>
								<i class="fas fa-shopping-cart"></i>
								${product.isInStock ? 'Добавить в корзину' : 'Нет в наличии'}
							</button>
						</div>
					</div>
				</div>
			</div>
		`

		document.body.insertAdjacentHTML('beforeend', modalHTML)

		// Add escape key handler
		const handleEscape = e => {
			if (e.key === 'Escape') {
				document.getElementById('product-modal-overlay')?.remove()
				document.removeEventListener('keydown', handleEscape)
			}
		}
		document.addEventListener('keydown', handleEscape)
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

	/**
	 * Load and display category filters
	 */
	async loadCategoryFilters() {
		try {
			console.log('Loading categories from API...')
			// Get categories from new API endpoint
			const response = await fetch('/api/products?type=categories')
			if (response.ok) {
				const data = await response.json()
				if (data.success && data.data) {
					this.categories = data.data
					console.log('Categories loaded:', this.categories)
				}
			}
		} catch (error) {
			console.log('Could not load categories from API, using fallback')
			// Use fallback categories if API fails (new structure)
			this.categories = [
				{ id: 0, name: 'Все', productCount: 0 },
				{ id: 1, name: 'Рыба', productCount: 0 },
				{ id: 2, name: 'Рак', productCount: 0 },
				{ id: 3, name: 'Сыр', productCount: 0 },
			]
		}

		this.renderCategoryFilters()
	}

	/**
	 * Render category filter buttons
	 */
	renderCategoryFilters() {
		const filtersContainer = document.getElementById('category-filters')
		if (!filtersContainer) {
			console.warn('Category filters container not found')
			return
		}

		// Render all categories including "Все"
		const categoryButtons = this.categories
			.map(
				category => `
				<button class="category-btn ${
					category.id === 0 ? 'active' : ''
				}" data-category="${category.id}">
					<i class="fas fa-${this.getCategoryIcon(category.name)}"></i>
					${category.name}
				</button>
			`
			)
			.join('')

		filtersContainer.innerHTML = categoryButtons

		// Bind click events
		this.bindCategoryFilters()
	}

	/**
	 * Get icon for category
	 */
	getCategoryIcon(categoryName) {
		const icons = {
			Все: 'th-large',
			Рыба: 'fish',
			Рак: 'shrimp',
			Сыр: 'cheese',
		}
		return icons[categoryName] || 'tag'
	}

	/**
	 * Bind category filter events
	 */
	bindCategoryFilters() {
		const filterButtons = document.querySelectorAll('.category-btn')
		filterButtons.forEach(button => {
			button.addEventListener('click', e => {
				e.preventDefault()

				// Update active state
				filterButtons.forEach(btn => btn.classList.remove('active'))
				button.classList.add('active')

				// Filter products
				const categoryId = button.dataset.category
				this.filterProductsByCategory(categoryId)
			})
		})
	}

	/**
	 * Filter products by category
	 */
	filterProductsByCategory(categoryId) {
		console.log('Filtering by category:', categoryId)

		if (categoryId == 0 || categoryId === 'all') {
			// Show all products
			this.updateUI(this.products)
		} else {
			// Filter by specific category
			const filteredProducts = this.products.filter(
				product => product.categoryId == categoryId
			)
			this.updateUI(filteredProducts)
		}
	}
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ProductsManager
}

// Admin UI Components and Navigation
class AdminUI {
	constructor() {
		this.currentPage = 'dashboard'
		this.init()
	}

	init() {
		this.bindNavigation()
		this.bindSidebarToggle()
		this.loadPage('dashboard')
	}

	bindNavigation() {
		const navItems = document.querySelectorAll('.nav-item')
		navItems.forEach(item => {
			item.addEventListener('click', e => {
				e.preventDefault()
				const page = item.dataset.page
				if (page) {
					this.loadPage(page)
					this.setActiveNavItem(item)
				}
			})
		})
	}

	bindSidebarToggle() {
		const toggle = document.getElementById('sidebar-toggle')
		const sidebar = document.querySelector('.admin-sidebar')

		if (toggle) {
			toggle.addEventListener('click', () => {
				sidebar.classList.toggle('mobile-open')
			})
		}
	}

	setActiveNavItem(activeItem) {
		document.querySelectorAll('.nav-item').forEach(item => {
			item.classList.remove('active')
		})
		activeItem.classList.add('active')
	}

	async loadPage(pageName) {
		this.currentPage = pageName
		document.getElementById('page-title').textContent =
			this.getPageTitle(pageName)

		const content = await this.getPageContent(pageName)
		document.getElementById('page-content').innerHTML = content

		// Initialize page-specific functionality
		this.initPageFunctionality(pageName)
	}

	getPageTitle(page) {
		const titles = {
			dashboard: 'Dashboard',
			products: 'Управление товарами',
			categories: 'Категории',
			orders: 'Заказы',
			settings: 'Настройки',
		}
		return titles[page] || 'Admin Panel'
	}

	async getPageContent(page) {
		switch (page) {
			case 'dashboard':
				return this.getDashboardContent()
			case 'products':
				return this.getProductsContent()
			case 'categories':
				return this.getCategoriesContent()
			case 'orders':
				return this.getOrdersContent()
			case 'settings':
				return this.getSettingsContent()
			default:
				return '<div class="page-error">Страница не найдена</div>'
		}
	}

	getDashboardContent() {
		return `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3><i class="fas fa-shopping-cart"></i> Заказы</h3>
                    </div>
                    <div class="card-content">
                        <div class="stat-large" id="total-orders">0</div>
                        <div class="stat-label">Всего заказов</div>
                        <div class="stat-small">
                            <span class="stat-new" id="new-orders">0 новых</span>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3><i class="fas fa-fish"></i> Товары</h3>
                    </div>
                    <div class="card-content">
                        <div class="stat-large" id="total-products">0</div>
                        <div class="stat-label">Товаров в каталоге</div>
                        <div class="stat-small">
                            <span class="stat-warning" id="low-stock">0 заканчивается</span>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3><i class="fas fa-ruble-sign"></i> Выручка</h3>
                    </div>
                    <div class="card-content">
                        <div class="stat-large" id="total-revenue">0₽</div>
                        <div class="stat-label">За текущий месяц</div>
                        <div class="stat-small">
                            <span class="stat-success" id="revenue-change">+0%</span>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-card wide">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-line"></i> Последние заказы</h3>
                        <a href="#orders" class="btn-link">Все заказы</a>
                    </div>
                    <div class="card-content">
                        <div class="orders-table" id="recent-orders">
                            <div class="loading">Загрузка...</div>
                        </div>
                    </div>
                </div>
            </div>
        `
	}

	getProductsContent() {
		return `
            <div class="page-header">
                <div class="page-actions">
                    <button class="btn btn-primary" id="create-product-btn">
                        <i class="fas fa-plus"></i> Добавить товар
                    </button>
                </div>
            </div>
            
            <div class="products-grid" id="products-grid">
                <div class="loading">Загрузка товаров...</div>
            </div>
            
            <!-- Product Modal будет добавлен динамически -->
        `
	}

	getCategoriesContent() {
		return `
            <div class="page-header">
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-category-btn">
                        <i class="fas fa-plus"></i> Добавить категорию
                    </button>
                </div>
            </div>
            
            <div class="categories-list" id="categories-list">
                <div class="loading">Загрузка категорий...</div>
            </div>
        `
	}

	getOrdersContent() {
		return `
            <div class="page-header">
                <div class="orders-filters">
                    <select id="status-filter">
                        <option value="">Все статусы</option>
                        <option value="new">Новые</option>
                        <option value="confirmed">Подтверждены</option>
                        <option value="preparing">Готовятся</option>
                        <option value="delivering">Доставляются</option>
                        <option value="completed">Выполнены</option>
                        <option value="cancelled">Отменены</option>
                    </select>
                    
                    <input type="date" id="date-filter" class="form-control">
                    
                    <input type="text" id="search-filter" placeholder="Поиск по имени или телефону" class="form-control">
                </div>
            </div>
            
            <div class="orders-table" id="orders-table">
                <div class="loading">Загрузка заказов...</div>
            </div>
        `
	}

	getSettingsContent() {
		return `
            <div class="settings-sections">
                <div class="settings-section">
                    <h3>Основные настройки</h3>
                    <div class="settings-form" id="main-settings">
                        <div class="loading">Загрузка настроек...</div>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Доставка и оплата</h3>
                    <div class="settings-form" id="delivery-settings">
                        <div class="loading">Загрузка настроек...</div>
                    </div>
                </div>
            </div>
        `
	}

	initPageFunctionality(page) {
		switch (page) {
			case 'dashboard':
				this.loadDashboardData()
				break
			case 'products':
				this.loadProducts()
				this.bindProductActions()
				break
			case 'categories':
				this.loadCategories()
				this.bindCategoryActions()
				break
			case 'orders':
				this.loadOrders()
				this.bindOrderFilters()
				break
			case 'settings':
				this.loadSettings()
				break
		}
	}

	async loadDashboardData() {
		try {
			// Load comprehensive dashboard data from new API
			const response = await fetch('/api/admin-api?action=dashboard', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}

			const result = await response.json()

			if (!result.success) {
				throw new Error(result.error || 'Failed to load dashboard')
			}

			const data = result.data

			// Update overview stats
			document.getElementById('total-products').textContent =
				data.overview.totalProducts || '0'
			document.getElementById('low-stock').textContent = `${
				data.inventory.lowStockProducts || 0
			} заканчивается`
			document.getElementById('total-revenue').textContent = `${
				data.inventory.totalValue || 0
			}₽`
			document.getElementById('new-orders').textContent = `${
				data.overview.recentProducts || 0
			} новых за неделю`

			// Update header counters
			const totalProductsElement = document.getElementById(
				'total-products-count'
			)
			if (totalProductsElement) {
				totalProductsElement.textContent = data.overview.totalProducts || '0'
			}

			const lowStockElement = document.getElementById('low-stock-count')
			if (lowStockElement) {
				lowStockElement.textContent = data.inventory.lowStockProducts || '0'
			}

			// Update navigation badge
			const productsBadge = document.getElementById('products-count')
			if (productsBadge) {
				productsBadge.textContent = data.overview.totalProducts || '0'
			}

			// Show detailed dashboard info
			document.getElementById('recent-orders').innerHTML =
				this.generateDashboardSummary(data)
		} catch (error) {
			console.error('Dashboard loading error:', error)
			// Show fallback data
			document.getElementById('total-products').textContent = '0'
			document.getElementById('low-stock').textContent = '0 заканчивается'
			document.getElementById('total-revenue').textContent = '0₽'
			document.getElementById('new-orders').textContent = '0 новых'

			document.getElementById('recent-orders').innerHTML = `
				<div class="admin-message error">
					<i class="fas fa-exclamation-triangle"></i>
					<p>Ошибка загрузки дашборда</p>
					<small>${error.message}</small>
				</div>
			`
		}
	}

	generateDashboardSummary(data) {
		const alerts = []

		if (data.alerts.lowStock) {
			alerts.push(
				`<span class="alert warning"><i class="fas fa-exclamation-triangle"></i> ${data.inventory.lowStockProducts} товаров заканчивается</span>`
			)
		}

		if (data.alerts.outOfStock) {
			alerts.push(
				`<span class="alert error"><i class="fas fa-times-circle"></i> ${data.inventory.outOfStockProducts} товаров нет в наличии</span>`
			)
		}

		if (data.alerts.missingImages) {
			alerts.push(
				`<span class="alert warning"><i class="fas fa-image"></i> У ${data.content.productsWithoutImages} товаров нет изображений</span>`
			)
		}

		const topCategories = data.content.categoryStats
			.slice(0, 3)
			.map(cat => `<li>${cat.name}: ${cat.count} товаров</li>`)
			.join('')

		return `
			<div class="dashboard-summary">
				<div class="summary-section">
					<h4><i class="fas fa-chart-bar"></i> Обзор</h4>
					<ul>
						<li>Активных товаров: ${data.overview.activeProducts}</li>
						<li>Неактивных товаров: ${data.overview.inactiveProducts}</li>
						<li>Рекомендуемых товаров: ${data.overview.featuredProducts}</li>
						<li>Категорий: ${data.overview.totalCategories}</li>
						<li>Изображений: ${data.overview.totalImages}</li>
					</ul>
				</div>
				
				<div class="summary-section">
					<h4><i class="fas fa-warehouse"></i> Склад</h4>
					<ul>
						<li>Общая стоимость: ${data.inventory.totalValue}₽</li>
						<li>Средняя цена: ${data.inventory.avgProductValue}₽</li>
						<li>Заканчивается: ${data.inventory.lowStockProducts}</li>
						<li>Нет в наличии: ${data.inventory.outOfStockProducts}</li>
					</ul>
				</div>
				
				${
					topCategories
						? `
				<div class="summary-section">
					<h4><i class="fas fa-tags"></i> Топ категории</h4>
					<ul>${topCategories}</ul>
				</div>
				`
						: ''
				}
				
				${
					alerts.length > 0
						? `
				<div class="summary-section alerts">
					<h4><i class="fas fa-bell"></i> Уведомления</h4>
					${alerts.join('')}
				</div>
				`
						: ''
				}
			</div>
		`
	}

	async loadProductsCount() {
		try {
			const response = await fetch('/api/products')
			const data = await response.json()
			if (data.success) {
				console.log('📊 Admin products data:', data.products.slice(0, 2))
				// Count products with stock <= 5 as low stock
				const lowStockCount = data.products.filter(p => {
					const stock = p.stockQuantity || 0
					console.log(`Product ${p.name}: stock=${stock} (≤5: ${stock <= 5})`)
					return stock <= 5
				}).length
				console.log(
					`📊 Low stock count: ${lowStockCount} (краб=5, икра=3 должны быть ≤5)`
				)
				return {
					total: data.products.length,
					lowStock: lowStockCount,
				}
			}
		} catch (error) {
			console.error('Failed to load products count:', error)
		}
		return { total: 0, lowStock: 0 }
	}

	async loadOrdersCount() {
		// Placeholder - orders API not implemented yet
		return { total: 0, new: 0 }
	}

	async loadProducts() {
		const grid = document.getElementById('products-grid')
		grid.innerHTML = '<div class="loading">Загрузка товаров...</div>'

		try {
			const response = await fetch('/api/products')
			const data = await response.json()

			if (data.success && data.products.length > 0) {
				grid.innerHTML = data.products
					.map(
						product => `
					<div class="product-card-admin">
						<div class="product-image">
							<img src="${product.image}" alt="${
							product.name
						}" onerror="this.src='/images/products/crayfish-1.svg'">
						</div>
						<div class="product-info">
							<h4>${product.name}</h4>
							<p class="product-category">${product.category}</p>
							<div class="product-price">${product.price.toLocaleString()} ₽</div>
							<div class="product-stock">Остаток: ${
								product.inStock
									? `${product.weight || 0} ${product.unit}`
									: 'Нет в наличии'
							}</div>
							<div class="product-actions">
								<button class="btn btn-sm btn-primary edit-product" data-id="${product.id}">
									<i class="fas fa-edit"></i> Редактировать
								</button>
								<button class="btn btn-sm btn-danger delete-product" data-id="${product.id}">
									<i class="fas fa-trash"></i> Удалить
								</button>
							</div>
						</div>
					</div>
				`
					)
					.join('')
			} else {
				grid.innerHTML = `
					<div class="empty-state">
						<i class="fas fa-fish"></i>
						<h3>Товары не найдены</h3>
						<p>Добавьте товары через SQL или выполните sample_products.sql</p>
						<button class="btn btn-primary" onclick="window.open('https://supabase.com', '_blank')">
							Открыть Supabase
						</button>
					</div>
				`
			}
		} catch (error) {
			console.error('Failed to load products:', error)
			grid.innerHTML = `
				<div class="error-state">
					<i class="fas fa-exclamation-triangle"></i>
					<h3>Ошибка загрузки</h3>
					<p>Не удалось загрузить товары: ${error.message}</p>
				</div>
			`
		}
	}

	bindProductActions() {
		const addBtn = document.getElementById('add-product-btn')
		if (addBtn) {
			addBtn.addEventListener('click', () => {
				this.showNotification(
					'Функция будет доступна в следующей итерации',
					'info'
				)
			})
		}
	}

	async loadCategories() {
		// Placeholder
		document.getElementById('categories-list').innerHTML = `
            <div class="demo-message">
                <i class="fas fa-tags"></i>
                <p>Управление категориями будет доступно после настройки API</p>
            </div>
        `
	}

	bindCategoryActions() {
		const addBtn = document.getElementById('add-category-btn')
		if (addBtn) {
			addBtn.addEventListener('click', () => {
				this.showNotification(
					'Функция будет доступна в следующей итерации',
					'info'
				)
			})
		}
	}

	async loadOrders() {
		// Placeholder
		document.getElementById('orders-table').innerHTML = `
            <div class="demo-message">
                <i class="fas fa-shopping-cart"></i>
                <p>Заказы будут отображаться после интеграции с основным сайтом</p>
                <small>Итерация 3: Управление заказами</small>
            </div>
        `
	}

	bindOrderFilters() {
		// Placeholder for order filtering
	}

	async loadSettings() {
		// Placeholder
		document.getElementById('main-settings').innerHTML = `
            <div class="demo-message">
                <i class="fas fa-cog"></i>
                <p>Настройки сайта будут доступны в следующей итерации</p>
            </div>
        `
	}

	showNotification(message, type = 'info') {
		// Используем метод из AdminAuth
		if (window.adminAuth) {
			window.adminAuth.showNotification(message, type)
		}
	}
}

// Initialize UI when admin panel is shown
window.adminUI = new AdminUI()

// App Initialization and Global Setup
document.addEventListener('DOMContentLoaded', () => {
	console.log('🔐 Fish Shop Admin Panel loaded successfully!')

	// Ensure all components are initialized
	if (window.adminAPI && window.adminAuth && window.adminUI) {
		console.log('✅ All admin components initialized')

		if (window.adminAuth.currentUser) {
			console.log(
				'👤 User already authenticated:',
				window.adminAuth.currentUser.email
			)
		}
	} else {
		console.error('❌ Missing admin components:', {
			adminAPI: !!window.adminAPI,
			adminAuth: !!window.adminAuth,
			adminUI: !!window.adminUI,
		})
	}

	setupGlobalErrorHandling()
	setupKeyboardShortcuts()
})

function setupGlobalErrorHandling() {
	window.addEventListener('unhandledrejection', event => {
		console.error('Unhandled promise rejection:', event.reason)
		if (window.adminAuth) {
			window.adminAuth.showNotification(
				'Произошла ошибка. Попробуйте обновить страницу.',
				'error'
			)
		}
	})

	window.addEventListener('error', event => {
		console.error('JavaScript error:', event.error)
	})
}

function setupKeyboardShortcuts() {
	document.addEventListener('keydown', e => {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			console.log('Quick navigation shortcut pressed')
		}

		if (e.key === 'Escape') {
			const modals = document.querySelectorAll('.modal.show, .dropdown.open')
			modals.forEach(modal => {
				modal.classList.remove('show', 'open')
			})
		}
	})
}

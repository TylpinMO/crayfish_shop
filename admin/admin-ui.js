// Admin UI Components and Navigation
class AdminUI {
	constructor() {
		this.currentPage = 'dashboard'
		this.init()
	}

	init() {
		this.bindNavigation()
		// Sidebar toggle handled in index.html
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

	// bindSidebarToggle moved to index.html to avoid duplicates

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
			// Try to load dashboard data, but don't require authentication
			const token = localStorage.getItem('adminToken')

			// Load comprehensive dashboard data from new API
			const headers = {
				'Content-Type': 'application/json',
			}

			// Add auth header only if token exists
			if (token) {
				headers.Authorization = `Bearer ${token}`
			}

			const response = await fetch('/api/admin-api?action=dashboard', {
				headers: headers,
			})

			if (!response.ok) {
				// Don't block dashboard for auth errors, just show basic info
				if (response.status === 401) {
					console.log('No authentication - showing basic dashboard')
					this.showBasicDashboard()
					return
				}
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

	showBasicDashboard() {
		// Show basic dashboard without authentication
		const content = `
			<div class="dashboard-summary">
				<div class="summary-section">
					<h4><i class="fas fa-info-circle"></i> Статус системы</h4>
					<ul>
						<li>API статус: Работает</li>
						<li>База данных: Подключена</li>
						<li>Последнее обновление: ${new Date().toLocaleString('ru-RU')}</li>
					</ul>
				</div>
				
				<div class="summary-section">
					<h4><i class="fas fa-chart-bar"></i> Быстрая статистика</h4>
					<p>Для подробной статистики требуется авторизация</p>
					<button class="btn btn-primary" onclick="window.location.reload()">
						Войти в систему
					</button>
				</div>
			</div>
		`
		document.getElementById('page-content').innerHTML = content
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
			const token = localStorage.getItem('adminToken')
			if (!token) return { total: 0, lowStock: 0 }

			const response = await fetch('/api/admin-api?action=products', {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) return { total: 0, lowStock: 0 }

			const data = await response.json()
			if (data.success && data.products) {
				const lowStockCount = data.products.filter(
					p => p.stock_quantity <= 5
				).length
				return {
					total: data.products.length,
					lowStock: lowStockCount,
				}
			}
		} catch (error) {
			console.error('Products count error:', error)
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
			// Try public API first, then admin API
			let response = await fetch('/api/products')
			let isPublicAPI = true

			if (!response.ok) {
				// Fallback to admin API
				const token = localStorage.getItem('adminToken')
				const headers = {
					'Content-Type': 'application/json',
				}

				if (token) {
					headers.Authorization = `Bearer ${token}`
				}

				response = await fetch('/api/admin-api?action=products', {
					headers: headers,
				})
				isPublicAPI = false
			}

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}

			const data = await response.json()
			let products = []

			// Handle different API response formats
			if (isPublicAPI && data.success && data.products) {
				products = data.products
			} else if (!isPublicAPI && data.success && data.products) {
				products = data.products
			} else if (data.products) {
				products = data.products
			}

			if (products && products.length > 0) {
				grid.innerHTML = products
					.map(product => {
						// Handle different data structures
						const primaryImage = isPublicAPI
							? null // Public API doesn't have product_images relation
							: product.product_images?.find(img => img.is_primary) ||
							  product.product_images?.[0]

						const imageUrl = isPublicAPI
							? product.image || '/images/products/crayfish-1.svg'
							: primaryImage?.public_url ||
							  primaryImage?.image_url ||
							  '/images/products/crayfish-1.svg'

						const categoryName = isPublicAPI
							? product.category || 'Без категории'
							: product.categories?.name || 'Без категории'

						const stockQuantity =
							product.stock_quantity || product.stockQuantity || 0
						const isInStock = stockQuantity > 0

						return `
					<div class="product-card-admin">
						<div class="product-image">
							<img src="${imageUrl}" alt="${
							product.name
						}" onerror="this.src='/images/products/crayfish-1.svg'">
						</div>
						<div class="product-info">
							<h4>${product.name}</h4>
							<p class="product-category">${categoryName}</p>
							<div class="product-price">${Number(product.price).toLocaleString()} ₽</div>
							<div class="product-stock">Остаток: ${
								isInStock
									? `${stockQuantity} шт (${product.weight || 0} ${
											product.unit || 'кг'
									  })`
									: 'Нет в наличии'
							}</div>
							<div class="product-status">
								<span class="status ${product.is_active !== false ? 'active' : 'inactive'}">
									${product.is_active !== false ? 'Активен' : 'Неактивен'}
								</span>
								${
									product.is_featured || product.featured
										? '<span class="featured">★ Рекомендуемый</span>'
										: ''
								}
							</div>
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
					})
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

	// Categories Management
	async loadCategories() {
		const container = document.getElementById('categories-list')
		container.innerHTML = '<div class="loading">Загрузка категорий...</div>'

		try {
			// Try to load categories without strict auth requirement
			const token = localStorage.getItem('adminToken')
			const headers = {
				'Content-Type': 'application/json',
			}

			if (token) {
				headers.Authorization = `Bearer ${token}`
			}

			const response = await fetch('/api/admin-api?action=categories', {
				headers: headers,
			})

			if (!response.ok) {
				// Show placeholder if no auth
				if (response.status === 401) {
					container.innerHTML = `
						<div class="info-state">
							<i class="fas fa-tags"></i>
							<h3>Управление категориями</h3>
							<p>Войдите в систему для управления категориями товаров</p>
							<button class="btn btn-primary" onclick="window.location.reload()">
								Войти в админку
							</button>
						</div>
					`
					return
				}
				throw new Error(`HTTP ${response.status}`)
			}

			const data = await response.json()

			if (data.success && data.categories && data.categories.length > 0) {
				container.innerHTML = data.categories
					.map(
						category => `
						<div class="category-card">
							<div class="category-info">
								<h4>${category.name}</h4>
								<p class="category-description">${category.description || 'Без описания'}</p>
								<div class="category-stats">
									<span class="products-count">Товаров: ${category.product_count || 0}</span>
									<span class="status ${category.is_active ? 'active' : 'inactive'}">
										${category.is_active ? 'Активна' : 'Неактивна'}
									</span>
								</div>
							</div>
							<div class="category-actions">
								<button class="btn btn-sm btn-primary edit-category" data-id="${category.id}">
									<i class="fas fa-edit"></i> Редактировать
								</button>
								<button class="btn btn-sm btn-danger delete-category" data-id="${category.id}">
									<i class="fas fa-trash"></i> Удалить
								</button>
							</div>
						</div>
					`
					)
					.join('')
			} else {
				container.innerHTML = `
					<div class="empty-state">
						<i class="fas fa-tags"></i>
						<h3>Категории не найдены</h3>
						<p>Создайте первую категорию товаров</p>
						<button class="btn btn-primary" onclick="document.getElementById('add-category-btn').click()">
							Добавить категорию
						</button>
					</div>
				`
			}
		} catch (error) {
			console.error('Categories loading error:', error)
			container.innerHTML = `
				<div class="error-state">
					<i class="fas fa-exclamation-triangle"></i>
					<h3>Ошибка загрузки категорий</h3>
					<p>${error.message}</p>
					<button class="btn btn-secondary" onclick="window.adminUI.loadCategories()">
						Попробовать снова
					</button>
				</div>
			`
		}
	}

	bindCategoryActions() {
		// Implement category CRUD actions
		console.log('Category actions bound')
	}

	loadOrders() {
		const container = document.getElementById('orders-table')
		container.innerHTML = `
			<div class="info-state">
				<i class="fas fa-shopping-cart"></i>
				<h3>Система заказов</h3>
				<p>Функциональность заказов будет добавлена в следующих обновлениях</p>
				<p>Сейчас сайт работает как каталог товаров</p>
			</div>
		`
	}

	bindOrderFilters() {
		console.log('Order filters bound')
	}

	loadSettings() {
		const container = document.getElementById('page-content')
		container.innerHTML = `
			<div class="settings-container">
				<div class="settings-section">
					<h3><i class="fas fa-store"></i> Магазин</h3>
					<div class="form-group">
						<label>Название магазина</label>
						<input type="text" value="РакоМаркет" class="form-control">
					</div>
					<div class="form-group">
						<label>Описание</label>
						<textarea class="form-control" rows="3">Свежие морепродукты с доставкой по городу</textarea>
					</div>
					<div class="form-group">
						<label>Телефон</label>
						<input type="tel" value="+7 (999) 123-45-67" class="form-control">
					</div>
					<div class="form-group">
						<label>Email</label>
						<input type="email" value="info@rakomarket.ru" class="form-control">
					</div>
				</div>

				<div class="settings-section">
					<h3><i class="fas fa-truck"></i> Доставка</h3>
					<div class="form-group">
						<label>Минимальная сумма заказа</label>
						<input type="number" value="1000" class="form-control">
						<small>₽</small>
					</div>
					<div class="form-group">
						<label>Стоимость доставки</label>
						<input type="number" value="300" class="form-control">
						<small>₽</small>
					</div>
					<div class="form-group">
						<label>Бесплатная доставка от</label>
						<input type="number" value="3000" class="form-control">
						<small>₽</small>
					</div>
				</div>

				<div class="settings-section">
					<h3><i class="fas fa-palette"></i> Внешний вид</h3>
					<div class="form-group">
						<label>Основной цвет</label>
						<input type="color" value="#ff6b3d" class="form-control">
					</div>
					<div class="form-group">
						<label>Цвет кнопок</label>
						<input type="color" value="#1a365d" class="form-control">
					</div>
					<div class="form-group checkbox-group">
						<label>
							<input type="checkbox" checked>
							<span class="checkmark"></span>
							Показывать рекомендуемые товары
						</label>
					</div>
				</div>

				<div class="settings-section">
					<h3><i class="fas fa-database"></i> База данных</h3>
					<div class="form-group">
						<label>Статус подключения</label>
						<div class="status-indicator">
							<span class="status active">✓ Подключено</span>
							<small>Supabase PostgreSQL</small>
						</div>
					</div>
					<div class="form-group">
						<label>Последняя синхронизация</label>
						<input type="text" value="${new Date().toLocaleString(
							'ru-RU'
						)}" class="form-control" readonly>
					</div>
				</div>

				<div class="settings-actions">
					<button class="btn btn-primary">
						<i class="fas fa-save"></i> Сохранить настройки
					</button>
					<button class="btn btn-secondary">
						<i class="fas fa-undo"></i> Сбросить
					</button>
				</div>
			</div>
		`
	}
}

// AdminUI class ready for initialization from index.html

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

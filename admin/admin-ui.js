/**
 * Simple Admin UI - using Netlify Functions
 */

class AdminPanel {
	constructor() {
		this.token = localStorage.getItem('adminToken')
		this.products = []
		this.init()
	}

	async init() {
		console.log('Initializing Admin Panel...')
		
		// Check if already authenticated
		if (this.token) {
			this.showDashboard()
			await this.loadProducts()
		} else {
			this.showLogin()
		}
		
		this.hideLoading()
		this.setupEventListeners()
	}

	setupEventListeners() {
		// Login form
		const loginForm = document.getElementById('login-form')
		if (loginForm) {
			loginForm.addEventListener('submit', (e) => this.handleLogin(e))
		}

		// Logout button
		document.addEventListener('click', (e) => {
			if (e.target.matches('[data-action="logout"]')) {
				this.logout()
			}
		})
	}

	async handleLogin(e) {
		e.preventDefault()
		
		const email = document.getElementById('email').value
		const password = document.getElementById('password').value
		
		try {
			const response = await fetch('/.netlify/functions/admin-auth', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password })
			})

			const data = await response.json()

			if (response.ok && data.token) {
				this.token = data.token
				localStorage.setItem('adminToken', this.token)
				this.showDashboard()
				await this.loadProducts()
			} else {
				this.showError(data.error || 'Login failed')
			}
		} catch (error) {
			console.error('Login error:', error)
			this.showError('Network error. Please try again.')
		}
	}

	async loadProducts() {
		try {
			const response = await fetch('/.netlify/functions/products')
			const data = await response.json()
			
			if (response.ok) {
				this.products = data.products || []
				this.displayProducts()
			} else {
				this.showError('Failed to load products')
			}
		} catch (error) {
			console.error('Error loading products:', error)
			this.showError('Failed to connect to database')
		}
	}

	displayProducts() {
		const container = document.getElementById('products-container')
		if (!container) {
			// Create basic dashboard
			this.createDashboard()
			return
		}

		container.innerHTML = this.products.map(product => `
			<div class="product-item">
				<h4>${product.name}</h4>
				<p>Price: $${product.price}</p>
				<p>Stock: ${product.stock_quantity}</p>
			</div>
		`).join('')
	}

	createDashboard() {
		const adminDashboard = document.getElementById('admin-dashboard')
		if (!adminDashboard) {
			// Simple fallback dashboard
			document.body.innerHTML = `
				<div class="admin-header">
					<h1>Admin Dashboard</h1>
					<button data-action="logout">Logout</button>
				</div>
				<div class="admin-content">
					<h2>Products (${this.products.length})</h2>
					<div id="products-container"></div>
				</div>
			`
			this.displayProducts()
		}
	}

	showLogin() {
		const loginContainer = document.getElementById('login-container')
		const adminDashboard = document.getElementById('admin-dashboard')
		
		if (loginContainer) loginContainer.style.display = 'block'
		if (adminDashboard) adminDashboard.style.display = 'none'
	}

	showDashboard() {
		const loginContainer = document.getElementById('login-container')
		const adminDashboard = document.getElementById('admin-dashboard')
		
		if (loginContainer) loginContainer.style.display = 'none'
		if (adminDashboard) adminDashboard.style.display = 'block'
	}

	hideLoading() {
		const loadingScreen = document.getElementById('loading-screen')
		if (loadingScreen) {
			loadingScreen.style.display = 'none'
		}
	}

	logout() {
		this.token = null
		localStorage.removeItem('adminToken')
		this.showLogin()
	}

	showError(message) {
		console.error('Admin Error:', message)
		alert(message) // Simple error display
	}
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	window.adminPanel = new AdminPanel()
})
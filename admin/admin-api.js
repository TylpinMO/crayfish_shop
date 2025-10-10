// Admin API через защищенные Netlify Functions
// Никаких ключей в браузере!

class AdminAPI {
	constructor() {
		this.baseURL = '/.netlify/functions'
	}

	async login(email, password) {
		return this.request('/admin-auth', {
			method: 'POST',
			body: { action: 'login', email, password },
		})
	}

	async logout() {
		return this.request('/admin-auth', {
			method: 'POST',
			body: { action: 'logout' },
		})
	}

	async getProducts() {
		return this.request('/admin-products', {
			method: 'GET',
		})
	}

	async createProduct(productData) {
		return this.request('/admin-products', {
			method: 'POST',
			body: productData,
		})
	}

	async updateProduct(id, productData) {
		return this.request('/admin-products', {
			method: 'PUT',
			body: { id, ...productData },
		})
	}

	async deleteProduct(id) {
		return this.request('/admin-products', {
			method: 'DELETE',
			body: { id },
		})
	}

	async getOrders() {
		return this.request('/admin-orders', {
			method: 'GET',
		})
	}

	async updateOrderStatus(orderId, status) {
		return this.request('/admin-orders', {
			method: 'PUT',
			body: { orderId, status },
		})
	}

	async uploadImage(file) {
		const formData = new FormData()
		formData.append('image', file)

		return fetch(`${this.baseURL}/admin-upload`, {
			method: 'POST',
			body: formData,
			headers: {
				Authorization: 'Bearer ' + this.getToken(),
			},
		}).then(res => res.json())
	}

	async request(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.getToken(),
				...options.headers,
			},
			...options,
		}

		if (options.body && typeof options.body === 'object') {
			config.body = JSON.stringify(options.body)
		}

		const response = await fetch(url, config)
		const data = await response.json()

		if (!response.ok) {
			throw new Error(data.error || 'API Error')
		}

		return data
	}

	getToken() {
		return localStorage.getItem('admin_token') || ''
	}

	setToken(token) {
		localStorage.setItem('admin_token', token)
	}

	removeToken() {
		localStorage.removeItem('admin_token')
	}
}

window.adminAPI = new AdminAPI()

// Secure Admin Authentication via Netlify Functions
// No database credentials exposed to client!

class AdminAuth {
	constructor() {
		this.currentUser = null
		this.init()
	}

	async init() {
		try {
			// Check if we have a stored token
			const token = window.adminAPI.getToken()
			if (token) {
				// Verify token with server
				const result = await window.adminAPI.request('/admin-auth', {
					method: 'POST',
					body: { action: 'verify' },
				})

				if (result.success) {
					this.currentUser = result.user
					this.showAdminPanel()
				} else {
					window.adminAPI.removeToken()
					this.showLoginForm()
				}
			} else {
				this.showLoginForm()
			}
		} catch (error) {
			console.error('Auth initialization error:', error)
			window.adminAPI.removeToken()
			this.showLoginForm()
		}
	}
	async login(email, password) {
		try {
			// Use serverless function instead of direct Supabase
			const result = await window.adminAPI.request('/admin-auth', {
				method: 'POST',
				body: { action: 'login', email, password }
			})

			if (result.success) {
				// Store token and user data
				window.adminAPI.setToken(result.token)
				this.currentUser = result.user
				
				this.showNotification('Успешный вход в систему', 'success')
				this.showAdminPanel()
				return { success: true, user: result.user }
			} else {
				throw new Error(result.error || 'Неверные данные для входа')
			}
		} catch (error) {
			console.error('Login error:', error)
			this.showNotification('Ошибка входа: ' + error.message, 'error')
			return { success: false, error: error.message }
		}
	}

	async logout() {
		try {
			// Clear local token and user data
			window.adminAPI.removeToken()
			this.currentUser = null
			
			this.showNotification('Выход выполнен', 'success')
			this.showLoginForm()
		} catch (error) {
			console.error('Logout error:', error)
			this.showNotification('Ошибка выхода: ' + error.message, 'error')
		}
	}

	showLoginForm() {
		document.getElementById('loading-screen').style.display = 'none'
		document.getElementById('login-container').style.display = 'flex'
		document.getElementById('admin-container').style.display = 'none'
	}

	showAdminPanel() {
		document.getElementById('loading-screen').style.display = 'none'
		document.getElementById('login-container').style.display = 'none'
		document.getElementById('admin-container').style.display = 'flex'

		// Update user info
		if (this.currentUser) {
			document.getElementById('current-user').textContent =
				this.currentUser.email || 'Admin'
		}

		// Initialize admin app
		if (window.adminApp) {
			window.adminApp.init()
		}
	}

	showConfigError() {
		document.getElementById('loading-screen').style.display = 'none'
		document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
                <div>
                    <h2>⚠️ Конфигурация не найдена</h2>
                    <p>Необходимо создать файл supabase-config.js с настройками Supabase</p>
                    <p>Скопируйте supabase-config.example.js и добавьте ваши данные</p>
                </div>
            </div>
        `
	}

	showError(message) {
		this.showNotification(message, 'error')
	}

	showNotification(message, type = 'info') {
		const container = document.getElementById('notifications-container')
		const notification = document.createElement('div')
		notification.className = `notification ${type}`
		notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-${
									type === 'success'
										? 'check-circle'
										: type === 'error'
										? 'exclamation-circle'
										: 'info-circle'
								}"></i>
                <span>${message}</span>
            </div>
        `

		container.appendChild(notification)

		// Auto remove after 5 seconds
		setTimeout(() => {
			if (notification.parentNode) {
				notification.remove()
			}
		}, 5000)
	}

	getUser() {
		return this.currentUser
	}

	getClient() {
		return this.supabase
	}

	isAuthenticated() {
		return !!this.currentUser
	}
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	window.adminAuth = new AdminAuth()

	// Bind login form
	const loginForm = document.getElementById('login-form')
	if (loginForm) {
		loginForm.addEventListener('submit', async e => {
			e.preventDefault()

			const email = document.getElementById('email').value
			const password = document.getElementById('password').value

			const loginBtn = loginForm.querySelector('.btn-login')
			const originalText = loginBtn.innerHTML

			loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...'
			loginBtn.disabled = true

			const result = await window.adminAuth.login(email, password)

			loginBtn.innerHTML = originalText
			loginBtn.disabled = false

			if (!result.success) {
				// Error is already shown in notification
				console.error('Login failed:', result.error)
			}
		})
	}

	// Bind logout button
	const logoutBtn = document.getElementById('logout-btn')
	if (logoutBtn) {
		logoutBtn.addEventListener('click', () => {
			window.adminAuth.logout()
		})
	}
})

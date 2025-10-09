// Shopping Cart System
class ShoppingCart {
	constructor() {
		this.items = JSON.parse(localStorage.getItem('cart')) || []
		this.deliveryFee = 300

		// Initialize when DOM is ready
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.init())
		} else {
			this.init()
		}
	}

	init() {
		this.bindEvents()
		this.updateCartUI()
	}

	bindEvents() {
		// Cart toggle
		const cartToggle = document.getElementById('cart-toggle')
		const closeCart = document.getElementById('close-cart')
		const cartOverlay = document.getElementById('cart-overlay')
		const checkoutBtn = document.getElementById('checkout-btn')

		if (cartToggle) cartToggle.addEventListener('click', () => this.openCart())
		if (closeCart) closeCart.addEventListener('click', () => this.closeCart())
		if (cartOverlay)
			cartOverlay.addEventListener('click', () => this.closeCart())
		if (checkoutBtn)
			checkoutBtn.addEventListener('click', () => this.checkout())
	}

	openCart() {
		document.getElementById('cart-sidebar').classList.add('open')
		document.getElementById('cart-overlay').classList.add('active')
		document.body.classList.add('cart-open')
	}

	closeCart() {
		document.getElementById('cart-sidebar').classList.remove('open')
		document.getElementById('cart-overlay').classList.remove('active')
		document.body.classList.remove('cart-open')
	}

	addItem(product, quantity = 1) {
		const existingItem = this.items.find(item => item.id === product.id)

		if (existingItem) {
			existingItem.quantity += quantity
		} else {
			this.items.push({
				...product,
				quantity: quantity,
			})
		}

		this.saveCart()
		this.updateCartUI()
		this.showNotification(`${product.name} добавлен в корзину`, 'success')
	}

	removeItem(productId) {
		this.items = this.items.filter(item => item.id !== productId)
		this.saveCart()
		this.updateCartUI()
		this.showNotification('Товар удален из корзины', 'info')
	}

	updateQuantity(productId, quantity) {
		if (quantity <= 0) {
			this.removeItem(productId)
			return
		}

		const item = this.items.find(item => item.id === productId)
		if (item) {
			item.quantity = quantity
			this.saveCart()
			this.updateCartUI()
		}
	}

	getTotal() {
		return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
	}

	getTotalWithDelivery() {
		const subtotal = this.getTotal()
		return subtotal > 0 ? subtotal + this.deliveryFee : 0
	}

	saveCart() {
		localStorage.setItem('cart', JSON.stringify(this.items))
	}

	updateCartUI() {
		// Update cart count badge
		const cartCount = document.getElementById('cart-count')
		const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0)
		cartCount.textContent = totalItems
		cartCount.classList.toggle('hidden', totalItems === 0)

		// Update cart items display
		this.renderCartItems()

		// Update totals
		this.updateCartTotals()

		// Show/hide empty state
		const cartEmpty = document.getElementById('cart-empty')
		const cartItems = document.getElementById('cart-items')
		const isEmpty = this.items.length === 0

		if (cartEmpty && cartItems) {
			cartEmpty.classList.toggle('hidden', !isEmpty)
			cartItems.classList.toggle('hidden', isEmpty)
		}
	}

	renderCartItems() {
		const cartItemsContainer = document.getElementById('cart-items')
		if (!cartItemsContainer) return

		cartItemsContainer.innerHTML = ''

		this.items.forEach(item => {
			const cartItemHTML = `
				<div class="cart-item" data-id="${item.id}">
					<img src="${item.image}" alt="${item.name}" class="cart-item-image">
					<div class="cart-item-info">
						<div class="cart-item-name">${item.name}</div>
						<div class="cart-item-price">${item.price}₽/кг</div>
						<div class="cart-item-controls">
							<button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${
				item.quantity - 1
			})">
								<i class="fas fa-minus"></i>
							</button>
							<span class="quantity-display">${item.quantity}</span>
							<button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${
				item.quantity + 1
			})">
								<i class="fas fa-plus"></i>
							</button>
							<button class="remove-item" onclick="cart.removeItem('${item.id}')">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</div>
				</div>
			`
			cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML)
		})
	}

	updateCartTotals() {
		const subtotalElement = document.getElementById('cart-subtotal')
		const deliveryElement = document.getElementById('cart-delivery')
		const totalElement = document.getElementById('cart-total')

		const subtotal = this.getTotal()
		const total = this.getTotalWithDelivery()

		if (subtotalElement) subtotalElement.textContent = `${subtotal}₽`
		if (deliveryElement)
			deliveryElement.textContent = subtotal > 0 ? `${this.deliveryFee}₽` : '0₽'
		if (totalElement) totalElement.textContent = `${total}₽`
	}

	checkout() {
		if (this.items.length === 0) {
			this.showNotification('Корзина пуста!', 'warning')
			return
		}

		const total = this.getTotalWithDelivery()
		this.showNotification(
			`Заказ на сумму ${total}₽ оформлен! Мы свяжемся с вами в ближайшее время.`,
			'success'
		)

		// Clear cart
		this.items = []
		this.saveCart()
		this.updateCartUI()
		this.closeCart()
	}

	showNotification(message, type = 'info') {
		const notification = document.createElement('div')
		notification.className = `notification notification-${type}`
		notification.textContent = message
		notification.style.cssText = `
			position: fixed;
			top: 100px;
			right: 20px;
			background: ${
				type === 'success'
					? '#38a169'
					: type === 'error'
					? '#e74c3c'
					: type === 'warning'
					? '#f39c12'
					: '#3498db'
			};
			color: white;
			padding: 15px 25px;
			border-radius: 25px;
			box-shadow: 0 4px 15px rgba(0,0,0,0.2);
			z-index: 1002;
			opacity: 0;
			transform: translateX(100%);
			transition: all 0.3s ease;
			max-width: 300px;
		`

		document.body.appendChild(notification)

		// Animate in
		setTimeout(() => {
			notification.style.opacity = '1'
			notification.style.transform = 'translateX(0)'
		}, 100)

		// Remove after delay
		setTimeout(() => {
			notification.style.opacity = '0'
			notification.style.transform = 'translateX(100%)'
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification)
				}
			}, 300)
		}, 3000)
	}
}

// Initialize cart
const cart = new ShoppingCart()

// Gallery functionality
function initGallery() {
	const products = document.querySelectorAll('.product-card')

	products.forEach(product => {
		const prevBtn = product.querySelector('.gallery-btn.prev')
		const nextBtn = product.querySelector('.gallery-btn.next')
		const images = product.querySelectorAll('.product-image')
		const indicators = product.querySelectorAll('.gallery-indicator')
		let currentIndex = 0

		if (images.length === 0) return

		function showImage(index) {
			// Hide all images
			images.forEach(img => {
				img.classList.remove('active')
				img.style.display = 'none'
			})

			if (indicators.length > 0) {
				indicators.forEach(indicator => indicator.classList.remove('active'))
			}

			// Show current image
			if (images[index]) {
				images[index].classList.add('active')
				images[index].style.display = 'block'

				if (indicators[index]) {
					indicators[index].classList.add('active')
				}
			}
		}

		function nextImage() {
			currentIndex = (currentIndex + 1) % images.length
			showImage(currentIndex)
		}

		function prevImage() {
			currentIndex = (currentIndex - 1 + images.length) % images.length
			showImage(currentIndex)
		}

		// Event listeners
		if (nextBtn) nextBtn.addEventListener('click', nextImage)
		if (prevBtn) prevBtn.addEventListener('click', prevImage)

		// Indicator clicks
		indicators.forEach((indicator, index) => {
			indicator.addEventListener('click', () => {
				currentIndex = index
				showImage(currentIndex)
			})
		})

		// Auto-play
		const autoPlayInterval = setInterval(nextImage, 5000)

		// Pause auto-play on hover
		product.addEventListener('mouseenter', () =>
			clearInterval(autoPlayInterval)
		)

		// Initialize first image
		showImage(0)
	})
}

// Navigation functionality
function initNavigation() {
	const navToggle = document.querySelector('.nav-toggle')
	const navMenu = document.querySelector('.nav-menu')

	if (navToggle && navMenu) {
		navToggle.addEventListener('click', () => {
			navMenu.classList.toggle('active')
			navToggle.classList.toggle('active')
		})
	}

	// Smooth scrolling for navigation links
	document.querySelectorAll('a[href^="#"]').forEach(anchor => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault()
			const target = document.querySelector(this.getAttribute('href'))
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				})
				// Close mobile menu if open
				navMenu.classList.remove('active')
				navToggle.classList.remove('active')
			}
		})
	})
}

// Contact form functionality
function initContactForm() {
	const contactForm = document.getElementById('contact-form')
	if (!contactForm) return

	contactForm.addEventListener('submit', function (e) {
		e.preventDefault()

		const formData = new FormData(this)
		const name = formData.get('name')
		const phone = formData.get('phone')
		const message = formData.get('message')

		// Simple validation
		if (!name || !phone) {
			cart.showNotification(
				'Пожалуйста, заполните все обязательные поля',
				'warning'
			)
			return
		}

		// Simulate form submission
		cart.showNotification(
			'Спасибо за обращение! Мы свяжемся с вами в ближайшее время.',
			'success'
		)

		// Reset form
		this.reset()
	})
}

// Enhanced add to cart functionality
function initAddToCart() {
	document.querySelectorAll('.btn-add-to-cart').forEach(button => {
		button.addEventListener('click', function () {
			const productCard = this.closest('.product-card')
			const productName = productCard.querySelector('h3').textContent
			const productPriceText =
				productCard.querySelector('.product-price').textContent
			const productImages = productCard.querySelectorAll('.product-image')
			const productImage = productImages.length > 0 ? productImages[0].src : ''

			// Extract price number from text (e.g., "от 800₽/кг" -> 800)
			const priceMatch = productPriceText.match(/(\d+)/)
			const price = priceMatch ? parseInt(priceMatch[1]) : 0

			// Create product object
			const product = {
				id: productName.toLowerCase().replace(/\s+/g, '-'),
				name: productName,
				price: price,
				image: productImage,
			}

			// Add to cart
			cart.addItem(product)

			// Animation effect
			const originalText = this.textContent
			this.textContent = 'Добавлено!'
			this.style.background = '#27ae60'

			setTimeout(() => {
				this.textContent = originalText
				this.style.background = ''
			}, 2000)
		})
	})

	// Quick order functionality
	document.querySelectorAll('.btn-quick-order').forEach(button => {
		button.addEventListener('click', function () {
			const productCard = this.closest('.product-card')
			const productName = productCard.querySelector('h3').textContent
			const productPriceText =
				productCard.querySelector('.product-price').textContent
			const productImages = productCard.querySelectorAll('.product-image')
			const productImage = productImages.length > 0 ? productImages[0].src : ''

			// Extract price number from text
			const priceMatch = productPriceText.match(/(\d+)/)
			const price = priceMatch ? parseInt(priceMatch[1]) : 0

			// Create product object
			const product = {
				id: productName.toLowerCase().replace(/\s+/g, '-'),
				name: productName,
				price: price,
				image: productImage,
			}

			// Add to cart and open it
			cart.addItem(product)
			cart.openCart()

			// Animation effect
			const originalText = this.textContent
			this.textContent = 'Добавлено!'
			this.style.background = '#27ae60'

			setTimeout(() => {
				this.textContent = originalText
				this.style.background = ''
			}, 2000)
		})
	})
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	initGallery()
	initNavigation()
	initContactForm()
	initAddToCart()
})

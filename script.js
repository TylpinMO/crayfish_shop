// Loading Screen
function initLoadingScreen() {
	const loadingScreen = document.getElementById('loading-screen')

	// Simulate loading time
	setTimeout(() => {
		loadingScreen.classList.add('fade-out')
		setTimeout(() => {
			loadingScreen.style.display = 'none'
		}, 500)
	}, 2000) // Show loading for 2 seconds
}

// Address Autocomplete (FIAS API integration)
class AddressAutocomplete {
	constructor(inputId, suggestionsId) {
		this.input = document.getElementById(inputId)
		this.suggestions = document.getElementById(suggestionsId)
		this.selectedIndex = -1
		this.currentSuggestions = []
		this.searchTimeout = null

		if (this.input) {
			this.bindEvents()
		}
	}

	bindEvents() {
		this.input.addEventListener('input', e => this.handleInput(e))
		this.input.addEventListener('keydown', e => this.handleKeydown(e))
		document.addEventListener('click', e => this.handleDocumentClick(e))
	}

	async handleInput(e) {
		const query = e.target.value.trim()

		if (query.length < 3) {
			this.hideSuggestions()
			return
		}

		// Clear previous timeout
		if (this.searchTimeout) {
			clearTimeout(this.searchTimeout)
		}

		// Debounce search requests
		this.searchTimeout = setTimeout(async () => {
			// Показать индикатор загрузки
			this.showLoading()

			try {
				// Используем DaData API для получения подсказок адресов
				const suggestions = await this.getDaDataSuggestions(query)

				if (suggestions && suggestions.length > 0) {
					console.log(`Найдено ${suggestions.length} адресов через DaData`)
					this.showSuggestions(suggestions)
				} else {
					this.showError('Адреса не найдены. Попробуйте изменить запрос.')
				}
			} catch (error) {
				console.error('Ошибка получения адресов:', error)
				this.showError(
					'Не удалось загрузить адреса. Проверьте подключение к интернету.'
				)
			}
		}, 300)
	}

	async getDaDataSuggestions(query) {
		try {
			// Используем только защищенный API через серверные функции
			const apiUrl = '/.netlify/functions/address-suggestions'

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: query,
					locations: [
						{
							region: 'Ростовская',
						},
					],
				}),
			})

			if (!response.ok) {
				throw new Error(`Server API Error: ${response.status}`)
			}

			const data = await response.json()

			if (data.error) {
				throw new Error(data.error)
			}

			if (data && data.suggestions && Array.isArray(data.suggestions)) {
				return data.suggestions
					.map(item => item.value)
					.filter(addr => addr && addr.includes('Ростов'))
					.slice(0, 5)
			}

			return []
		} catch (error) {
			console.warn(
				'Address API недоступен. Для работы автокомплита адресов необходим деплой на Netlify:',
				error
			)
			// Возвращаем пустой массив вместо ошибки для лучшего UX
			return []
		}
	}

	showLoading() {
		this.suggestions.innerHTML = `
			<div class="address-loading">
				<i class="fas fa-spinner fa-spin"></i>
			</div>
		`
		this.suggestions.style.display = 'block'
	}

	showError(message) {
		this.suggestions.innerHTML = `
			<div class="address-error">
				<i class="fas fa-exclamation-triangle"></i>
				${message}
			</div>
		`
		this.suggestions.style.display = 'block'

		// Скрыть ошибку через 3 секунды
		setTimeout(() => {
			this.hideSuggestions()
		}, 3000)
	}

	showSuggestions(suggestions) {
		this.currentSuggestions = suggestions
		this.suggestions.innerHTML = ''

		if (suggestions.length === 0) {
			this.hideSuggestions()
			return
		}

		suggestions.forEach((suggestion, index) => {
			const div = document.createElement('div')
			div.className = 'address-suggestion'
			div.textContent = suggestion
			div.addEventListener('click', () => this.selectSuggestion(suggestion))
			this.suggestions.appendChild(div)
		})

		this.suggestions.style.display = 'block'
		this.selectedIndex = -1
	}

	hideSuggestions() {
		this.suggestions.style.display = 'none'
		this.selectedIndex = -1
	}

	selectSuggestion(suggestion) {
		this.input.value = suggestion
		this.hideSuggestions()
	}

	handleKeydown(e) {
		if (this.suggestions.style.display === 'none') return

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				this.selectedIndex = Math.min(
					this.selectedIndex + 1,
					this.currentSuggestions.length - 1
				)
				this.highlightSuggestion()
				break
			case 'ArrowUp':
				e.preventDefault()
				this.selectedIndex = Math.max(this.selectedIndex - 1, -1)
				this.highlightSuggestion()
				break
			case 'Enter':
				e.preventDefault()
				if (this.selectedIndex >= 0) {
					this.selectSuggestion(this.currentSuggestions[this.selectedIndex])
				}
				break
			case 'Escape':
				this.hideSuggestions()
				break
		}
	}

	highlightSuggestion() {
		const suggestions = this.suggestions.querySelectorAll('.address-suggestion')
		suggestions.forEach((s, index) => {
			s.classList.toggle('selected', index === this.selectedIndex)
		})
	}

	handleDocumentClick(e) {
		if (
			!this.input.contains(e.target) &&
			!this.suggestions.contains(e.target)
		) {
			this.hideSuggestions()
		}
	}
}

// Phone validation utility
class PhoneValidator {
	constructor(inputElement) {
		this.input = inputElement
		if (this.input) {
			this.bindEvents()
		}
	}

	bindEvents() {
		this.input.addEventListener('input', e => this.handleInput(e))
		this.input.addEventListener('keydown', e => this.handleKeydown(e))
	}

	handleInput(e) {
		const input = e.target
		const value = input.value
		const formattedValue = PhoneValidator.formatAsYouType(value)

		if (formattedValue !== value) {
			const cursorPosition = input.selectionStart
			input.value = formattedValue
			// Restore cursor position
			input.setSelectionRange(cursorPosition, cursorPosition)
		}
	}

	handleKeydown(e) {
		// Allow: backspace, delete, tab, escape, enter
		if (
			[8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
			// Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
			(e.keyCode === 65 && e.ctrlKey === true) ||
			(e.keyCode === 67 && e.ctrlKey === true) ||
			(e.keyCode === 86 && e.ctrlKey === true) ||
			(e.keyCode === 88 && e.ctrlKey === true) ||
			// Allow: home, end, left, right
			(e.keyCode >= 35 && e.keyCode <= 39)
		) {
			return
		}
		// Ensure that it is a number and stop the keypress
		if (
			(e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
			(e.keyCode < 96 || e.keyCode > 105)
		) {
			e.preventDefault()
		}
	}

	static formatAsYouType(phone) {
		// Remove all non-digits
		const digits = phone.replace(/\D/g, '')

		// Don't format if too short
		if (digits.length < 1) return ''

		// Format based on length
		if (digits.length <= 1) {
			return '+7 ('
		} else if (digits.length <= 4) {
			return `+7 (${digits.slice(0, 3)}`
		} else if (digits.length <= 7) {
			return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}`
		} else if (digits.length <= 9) {
			return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
				6,
				8
			)}`
		} else if (digits.length <= 11) {
			return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
				6,
				8
			)}-${digits.slice(8, 10)}`
		}

		// If more than 11 digits, truncate
		return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
			6,
			8
		)}-${digits.slice(8, 10)}`
	}

	static formatPhone(phone) {
		// Remove all non-digits
		const digits = phone.replace(/\D/g, '')

		// Handle different input formats and convert to standard format
		let cleanDigits = digits

		// Remove country code if present
		if (
			cleanDigits.length === 11 &&
			(cleanDigits[0] === '7' || cleanDigits[0] === '8')
		) {
			cleanDigits = cleanDigits.slice(1)
		}

		// Format as +7 (XXX) XXX-XX-XX
		if (cleanDigits.length === 10) {
			return `+7 (${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(
				3,
				6
			)}-${cleanDigits.slice(6, 8)}-${cleanDigits.slice(8, 10)}`
		}

		return phone // Return original if can't format
	}

	static validatePhone(phone) {
		const digits = phone.replace(/\D/g, '')

		// Must be exactly 10 digits (without country code) or 11 digits (with 7 or 8)
		if (digits.length === 10) {
			return true
		} else if (
			digits.length === 11 &&
			(digits[0] === '7' || digits[0] === '8')
		) {
			return true
		}

		return false
	}

	static isValidRussianMobile(phone) {
		const digits = phone.replace(/\D/g, '')
		let phoneNumber = digits

		// Convert to format starting with 7
		if (phoneNumber.length === 11 && phoneNumber[0] === '8') {
			phoneNumber = '7' + phoneNumber.slice(1)
		} else if (phoneNumber.length === 10) {
			phoneNumber = '7' + phoneNumber
		}

		// Check length
		if (phoneNumber.length !== 11 || phoneNumber[0] !== '7') {
			return false
		}

		// Check if it's a valid Russian mobile number prefix
		const validPrefixes = [
			'900',
			'901',
			'902',
			'903',
			'904',
			'905',
			'906',
			'908',
			'909',
			'910',
			'911',
			'912',
			'913',
			'914',
			'915',
			'916',
			'917',
			'918',
			'919',
			'920',
			'921',
			'922',
			'923',
			'924',
			'925',
			'926',
			'927',
			'928',
			'929',
			'930',
			'931',
			'932',
			'933',
			'934',
			'936',
			'937',
			'938',
			'939',
			'950',
			'951',
			'952',
			'953',
			'954',
			'955',
			'956',
			'958',
			'960',
			'961',
			'962',
			'963',
			'964',
			'965',
			'966',
			'967',
			'968',
			'969',
			'970',
			'971',
			'977',
			'978',
			'980',
			'981',
			'982',
			'983',
			'984',
			'985',
			'986',
			'987',
			'988',
			'989',
			'991',
			'992',
			'993',
			'994',
			'995',
			'996',
			'997',
			'999',
		]

		const prefix = phoneNumber.slice(1, 4)
		return validPrefixes.includes(prefix)
	}
}

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
		const showCheckoutForm = document.getElementById('show-checkout-form')
		const backToCart = document.getElementById('back-to-cart')
		const orderForm = document.getElementById('order-form')

		// Payment and change handling
		const paymentSelect = document.getElementById('payment-select')
		const needChangeCheckbox = document.getElementById('need-change')

		// Initialize phone validator for checkout form
		const checkoutPhoneInput = document.getElementById('phone-input')
		if (checkoutPhoneInput) {
			new PhoneValidator(checkoutPhoneInput)
		}

		if (cartToggle) cartToggle.addEventListener('click', () => this.openCart())
		if (closeCart) closeCart.addEventListener('click', () => this.closeCart())
		if (cartOverlay)
			cartOverlay.addEventListener('click', () => this.closeCart())
		if (showCheckoutForm)
			showCheckoutForm.addEventListener('click', () => this.showCheckoutForm())
		if (backToCart)
			backToCart.addEventListener('click', () => this.hideCheckoutForm())
		if (orderForm)
			orderForm.addEventListener('submit', e => this.processOrder(e))
		if (paymentSelect)
			paymentSelect.addEventListener('change', e => this.handlePaymentChange(e))
		if (needChangeCheckbox)
			needChangeCheckbox.addEventListener('change', e =>
				this.handleChangeToggle(e)
			)
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

	showCheckoutForm() {
		if (this.items.length === 0) {
			this.showNotification('Корзина пуста!', 'warning')
			return
		}

		const cartSummary = document.getElementById('cart-summary')
		const checkoutForm = document.getElementById('checkout-form')

		if (cartSummary) cartSummary.classList.add('hidden')
		if (checkoutForm) checkoutForm.classList.remove('hidden')
	}

	hideCheckoutForm() {
		const cartSummary = document.getElementById('cart-summary')
		const checkoutForm = document.getElementById('checkout-form')

		if (cartSummary) cartSummary.classList.remove('hidden')
		if (checkoutForm) checkoutForm.classList.add('hidden')
	}

	handlePaymentChange(e) {
		const paymentMethod = e.target.value
		const cashChangeGroup = document.getElementById('cash-change-group')

		if (paymentMethod === 'cash') {
			cashChangeGroup.classList.remove('hidden')
		} else {
			cashChangeGroup.classList.add('hidden')
			// Reset change fields
			const needChangeCheckbox = document.getElementById('need-change')
			const changeAmountGroup = document.getElementById('change-amount-group')
			if (needChangeCheckbox) needChangeCheckbox.checked = false
			if (changeAmountGroup) changeAmountGroup.classList.add('hidden')
		}
	}

	handleChangeToggle(e) {
		const changeAmountGroup = document.getElementById('change-amount-group')
		const changeAmountInput = document.getElementById('change-amount')

		if (e.target.checked) {
			changeAmountGroup.classList.remove('hidden')
			changeAmountInput.focus()
		} else {
			changeAmountGroup.classList.add('hidden')
			changeAmountInput.value = ''
		}
	}

	processOrder(e) {
		e.preventDefault()

		const formData = new FormData(e.target)
		const orderData = {
			name: formData.get('name'),
			phone: formData.get('phone'),
			address: formData.get('address'),
			payment: formData.get('payment'),
			comment: formData.get('comment'),
			needChange: formData.get('needChange') === 'on',
			changeAmount: formData.get('changeAmount'),
			items: this.items,
			total: this.getTotalWithDelivery(),
		}

		// Validate phone number
		if (!PhoneValidator.validatePhone(orderData.phone)) {
			this.showNotification(
				'Пожалуйста, введите корректный номер телефона',
				'warning'
			)
			return
		}

		if (!PhoneValidator.isValidRussianMobile(orderData.phone)) {
			this.showNotification(
				'Пожалуйста, введите корректный российский мобильный номер',
				'warning'
			)
			return
		}

		// Format phone number
		orderData.phone = PhoneValidator.formatPhone(orderData.phone)

		// Validate change amount if needed
		if (orderData.payment === 'cash' && orderData.needChange) {
			const changeAmount = parseFloat(orderData.changeAmount)
			if (!changeAmount || changeAmount <= orderData.total) {
				this.showNotification(
					'Сумма для сдачи должна быть больше стоимости заказа',
					'warning'
				)
				return
			}
		}

		// Simulate order processing
		this.showNotification(
			`Заказ на сумму ${orderData.total}₽ принят! Мы свяжемся с вами в течение 15 минут для подтверждения.`,
			'success'
		)

		// Clear cart and close
		this.items = []
		this.saveCart()
		this.updateCartUI()
		this.hideCheckoutForm()
		this.closeCart()

		// Reset form
		e.target.reset()
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

	// Initialize phone validator for contact form
	const phoneInput = contactForm.querySelector('input[name="phone"]')
	if (phoneInput) {
		new PhoneValidator(phoneInput)
	}

	contactForm.addEventListener('submit', function (e) {
		e.preventDefault()

		const formData = new FormData(this)
		const name = formData.get('name')
		const phone = formData.get('phone')
		const message = formData.get('message')

		// Enhanced validation
		if (!name || !phone) {
			cart.showNotification(
				'Пожалуйста, заполните все обязательные поля',
				'warning'
			)
			return
		}

		// Validate phone number
		if (phone && !PhoneValidator.isValidRussianMobile(phone)) {
			cart.showNotification(
				'Пожалуйста, введите корректный номер мобильного телефона',
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
	// Use event delegation to handle dynamically added buttons
	document.addEventListener('click', function (e) {
		if (e.target.closest('.add-to-cart')) {
			const button = e.target.closest('.add-to-cart')
			if (button.disabled) return

			const productCard = button.closest('.product-card')
			const productName = productCard.querySelector('h3').textContent
			const productPriceElement = productCard.querySelector('.price')
			const productImage = productCard.querySelector('.product-image img')

			// Extract price number from text
			const priceText = productPriceElement.textContent
			const priceMatch = priceText.match(/(\d[\d\s]*)/)
			const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '')) : 0

			// Create product object
			const product = {
				id:
					productCard.dataset.id ||
					productName.toLowerCase().replace(/\s+/g, '-'),
				name: productName,
				price: price,
				image: productImage
					? productImage.src
					: '/images/products/crayfish-1.svg',
			}

			// Add to cart
			cart.addItem(product)

			// Animation effect
			const originalText = button.textContent
			button.textContent = 'Добавлено!'
			button.style.background = '#27ae60'

			setTimeout(() => {
				button.textContent = originalText
				button.style.background = ''
			}, 2000)
		}
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

// Load products from API
async function loadProducts() {
	try {
		const response = await fetch('/.netlify/functions/products')
		const data = await response.json()

		if (data.success) {
			updateProductsOnPage(data.products)
		} else {
			console.error('Failed to load products:', data.error)
		}
	} catch (error) {
		console.error('Products API error:', error)
		// Continue with hardcoded products if API fails
	}
}

function updateProductsOnPage(products) {
	const productGrid = document.querySelector('#products-grid')
	if (!productGrid) return

	// Clear loading message
	productGrid.innerHTML = ''

	if (products.length === 0) {
		productGrid.innerHTML = `
			<div class="no-products-message">
				<div class="no-products-icon">
					<i class="fas fa-fish"></i>
				</div>
				<h3>В данный момент товаров нет, но они скоро появятся</h3>
				<p>Мы работаем над пополнением ассортимента</p>
			</div>
		`
		return
	}

	// Render products from database
	productGrid.innerHTML = products
		.map(
			product => `
		<div class="product-card" data-id="${product.id}">
			<div class="product-image">
				<img src="${product.image}" alt="${
				product.name
			}" loading="lazy" onerror="this.src='/images/fish-placeholder.jpg'">
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
					<span class="price">${product.price.toLocaleString()} ₽</span>
					${
						product.oldPrice
							? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>`
							: ''
					}
					<span class="unit">за ${product.unit}</span>
				</div>
				<button class="add-to-cart" ${!product.inStock ? 'disabled' : ''}>
					<i class="fas fa-shopping-cart"></i>
					${product.inStock ? 'В корзину' : 'Нет в наличии'}
				</button>
			</div>
		</div>
	`
		)
		.join('')

	console.log(`Loaded ${products.length} products from database`)
} // Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	// Initialize loading screen
	initLoadingScreen()

	// Load products from database
	loadProducts()

	// Initialize address autocomplete
	new AddressAutocomplete('address-input', 'address-suggestions')

	// Initialize other functionality
	initGallery()
	initNavigation()
	initContactForm()
	initAddToCart()
})

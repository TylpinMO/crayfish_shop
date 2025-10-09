// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle')
const navMenu = document.getElementById('nav-menu')

navToggle.addEventListener('click', () => {
	navMenu.classList.toggle('active')
	navToggle.classList.toggle('active')
})

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
	link.addEventListener('click', () => {
		navMenu.classList.remove('active')
		navToggle.classList.remove('active')
	})
})

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault()
		const target = document.querySelector(this.getAttribute('href'))
		if (target) {
			const offsetTop =
				target.offsetTop - (this.getAttribute('href') === '#home' ? 0 : 70)
			window.scrollTo({
				top: offsetTop,
				behavior: 'smooth',
			})
		}
	})
})

// Navbar background change on scroll
window.addEventListener('scroll', () => {
	const navbar = document.querySelector('.navbar')
	if (window.scrollY > 50) {
		navbar.style.background = 'rgba(255, 255, 255, 0.98)'
		navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)'
	} else {
		navbar.style.background = 'rgba(255, 255, 255, 0.95)'
		navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'
	}
})

// Form submission
document
	.querySelector('.contact-form form')
	.addEventListener('submit', function (e) {
		e.preventDefault()

		// Get form data
		const formData = new FormData(this)
		const name = this.querySelector('input[type="text"]').value
		const phone = this.querySelector('input[type="tel"]').value
		const email = this.querySelector('input[type="email"]').value
		const message = this.querySelector('textarea').value

		// Simple validation
		if (!name || !phone || !message) {
			alert('Пожалуйста, заполните все обязательные поля')
			return
		}

		// Simulate form submission
		const submitBtn = this.querySelector('button[type="submit"]')
		const originalText = submitBtn.textContent
		submitBtn.textContent = 'Отправляется...'
		submitBtn.disabled = true

		setTimeout(() => {
			alert('Спасибо за заявку! Мы свяжемся с вами в ближайшее время.')
			this.reset()
			submitBtn.textContent = originalText
			submitBtn.disabled = false
		}, 2000)
	})

// Add to cart buttons
document.querySelectorAll('.btn-add-to-cart').forEach(button => {
	button.addEventListener('click', function () {
		const productCard = this.closest('.product-card')
		const productName = productCard.querySelector('h3').textContent

		// Animation effect
		this.textContent = 'Добавлено!'
		this.style.background = '#28a745'

		setTimeout(() => {
			this.textContent = 'Заказать'
			this.style.background = ''
		}, 2000)

		// You could add actual cart functionality here
		console.log(`Добавлен в корзину: ${productName}`)
	})
})

// Intersection Observer for animations
const observerOptions = {
	threshold: 0.1,
	rootMargin: '0px 0px -50px 0px',
}

const observer = new IntersectionObserver(entries => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.style.opacity = '1'
			entry.target.style.transform = 'translateY(0)'
		}
	})
}, observerOptions)

// Observe elements for scroll animations
document
	.querySelectorAll('.about-card, .product-card, .service-item')
	.forEach(el => {
		el.style.opacity = '0'
		el.style.transform = 'translateY(30px)'
		el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
		observer.observe(el)
	})

// Counter animation for stats (if you want to add some stats)
function animateCounter(element, target, duration = 2000) {
	let start = 0
	const increment = target / (duration / 16)

	const timer = setInterval(() => {
		start += increment
		element.textContent = Math.floor(start)

		if (start >= target) {
			element.textContent = target
			clearInterval(timer)
		}
	}, 16)
}

// Phone number formatting
document.querySelectorAll('input[type="tel"]').forEach(input => {
	input.addEventListener('input', function (e) {
		let value = e.target.value.replace(/\D/g, '')
		if (value.length > 0) {
			if (value.length <= 1) {
				value = '+7 (' + value
			} else if (value.length <= 4) {
				value = '+7 (' + value.substring(1)
			} else if (value.length <= 7) {
				value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4)
			} else if (value.length <= 9) {
				value =
					'+7 (' +
					value.substring(1, 4) +
					') ' +
					value.substring(4, 7) +
					'-' +
					value.substring(7)
			} else {
				value =
					'+7 (' +
					value.substring(1, 4) +
					') ' +
					value.substring(4, 7) +
					'-' +
					value.substring(7, 9) +
					'-' +
					value.substring(9, 11)
			}
		}
		e.target.value = value
	})
})

// Parallax effect for hero section
window.addEventListener('scroll', () => {
	const scrolled = window.pageYOffset
	const parallax = document.querySelector('.hero')
	const speed = scrolled * 0.5

	if (parallax) {
		parallax.style.transform = `translateY(${speed}px)`
	}
})

// Loading animation
window.addEventListener('load', () => {
	document.body.classList.add('loaded')
})

// Back to top button (optional)
const backToTopButton = document.createElement('button')
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>'
backToTopButton.classList.add('back-to-top')
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
`

document.body.appendChild(backToTopButton)

window.addEventListener('scroll', () => {
	if (window.pageYOffset > 300) {
		backToTopButton.style.opacity = '1'
		backToTopButton.style.visibility = 'visible'
	} else {
		backToTopButton.style.opacity = '0'
		backToTopButton.style.visibility = 'hidden'
	}
})

backToTopButton.addEventListener('click', () => {
	window.scrollTo({
		top: 0,
		behavior: 'smooth',
	})
})

// Add hover effects to social links
document.querySelectorAll('.social-links a').forEach(link => {
	link.addEventListener('mouseenter', function () {
		this.style.transform = 'translateY(-3px) scale(1.1)'
	})

	link.addEventListener('mouseleave', function () {
		this.style.transform = 'translateY(0) scale(1)'
	})
})

// Initialize tooltips (if you want to add some)
function initTooltips() {
	const tooltipElements = document.querySelectorAll('[data-tooltip]')

	tooltipElements.forEach(element => {
		element.addEventListener('mouseenter', function () {
			const tooltip = document.createElement('div')
			tooltip.className = 'tooltip'
			tooltip.textContent = this.getAttribute('data-tooltip')
			tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1001;
                pointer-events: none;
            `
			document.body.appendChild(tooltip)

			const rect = this.getBoundingClientRect()
			tooltip.style.left =
				rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px'
			tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px'
		})

		element.addEventListener('mouseleave', function () {
			const tooltip = document.querySelector('.tooltip')
			if (tooltip) {
				tooltip.remove()
			}
		})
	})
}

// Gallery functionality
function changeImage(button, direction) {
	const gallery = button.closest('.product-image-gallery')
	const images = gallery.querySelectorAll('.product-image')
	const dots = gallery.querySelectorAll('.dot')

	let currentIndex = Array.from(images).findIndex(img =>
		img.classList.contains('active')
	)
	let newIndex = currentIndex + direction

	if (newIndex >= images.length) newIndex = 0
	if (newIndex < 0) newIndex = images.length - 1

	// Remove active classes
	images[currentIndex].classList.remove('active')
	dots[currentIndex].classList.remove('active')

	// Add active classes
	images[newIndex].classList.add('active')
	dots[newIndex].classList.add('active')
}

function currentImage(dot, n) {
	const gallery = dot.closest('.product-image-gallery')
	const images = gallery.querySelectorAll('.product-image')
	const dots = gallery.querySelectorAll('.dot')

	// Remove all active classes
	images.forEach(img => img.classList.remove('active'))
	dots.forEach(d => d.classList.remove('active'))

	// Add active classes to selected
	images[n - 1].classList.add('active')
	dots[n - 1].classList.add('active')
}

// Initialize gallery - make first image active in each gallery
document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('.product-image-gallery').forEach(gallery => {
		const firstImage = gallery.querySelector('.product-image')
		const firstDot = gallery.querySelector('.dot')
		if (firstImage) firstImage.classList.add('active')
		if (firstDot) firstDot.classList.add('active')
	})
})

// Auto-slide gallery every 5 seconds
setInterval(() => {
	document.querySelectorAll('.product-image-gallery').forEach(gallery => {
		const nextBtn = gallery.querySelector('.gallery-btn.next')
		if (nextBtn) {
			changeImage(nextBtn, 1)
		}
	})
}, 5000)

// Enhanced add to cart functionality
document.querySelectorAll('.btn-add-to-cart').forEach(button => {
	button.addEventListener('click', function () {
		const productCard = this.closest('.product-card')
		const productName = productCard.querySelector('h3').textContent
		const productPrice = productCard.querySelector('.product-price').textContent

		// Animation effect
		const originalText = this.textContent
		this.textContent = 'Добавлено!'
		this.style.background = '#27ae60'

		// Show notification
		showNotification(`${productName} добавлен в корзину`, 'success')

		setTimeout(() => {
			this.textContent = originalText
			this.style.background = ''
		}, 2000)

		console.log(`Добавлен в корзину: ${productName} - ${productPrice}`)
	})
})

// Quick order functionality
document.querySelectorAll('.btn-quick-order').forEach(button => {
	button.addEventListener('click', function () {
		const productCard = this.closest('.product-card')
		const productName = productCard.querySelector('h3').textContent

		// Scroll to contact form and pre-fill message
		const contactForm = document.querySelector('.contact-form textarea')
		if (contactForm) {
			contactForm.value = `Хочу заказать: ${productName}`
			document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' })
		}

		showNotification('Форма заказа подготовлена', 'info')
	})
})

// Notification system
function showNotification(message, type = 'info') {
	const notification = document.createElement('div')
	notification.className = `notification notification-${type}`
	notification.textContent = message
	notification.style.cssText = `
		position: fixed;
		top: 100px;
		right: 20px;
		background: ${
			type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'
		};
		color: white;
		padding: 15px 25px;
		border-radius: 25px;
		box-shadow: 0 4px 15px rgba(0,0,0,0.2);
		z-index: 1001;
		opacity: 0;
		transform: translateX(100%);
		transition: all 0.3s ease;
	`

	document.body.appendChild(notification)

	// Show notification
	setTimeout(() => {
		notification.style.opacity = '1'
		notification.style.transform = 'translateX(0)'
	}, 100)

	// Hide and remove notification
	setTimeout(() => {
		notification.style.opacity = '0'
		notification.style.transform = 'translateX(100%)'
		setTimeout(() => notification.remove(), 300)
	}, 3000)
}

// Call initialize functions
initTooltips()

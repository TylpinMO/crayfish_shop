// Product Management Functions for Admin Panel

class ProductManager {
	constructor(adminUI) {
		this.adminUI = adminUI
		this.init()
	}

	init() {
		this.bindProductActions()
	}

	bindProductActions() {
		// Bind create product button
		const createBtn = document.getElementById('create-product-btn')
		if (createBtn) {
			createBtn.addEventListener('click', () => this.showProductModal())
		}

		// Delegate events for edit/delete buttons (since they're dynamically created)
		document.addEventListener('click', e => {
			if (e.target.matches('.edit-product, .edit-product *')) {
				const button = e.target.closest('.edit-product')
				const productId = button.dataset.id
				this.editProduct(productId)
			}

			if (e.target.matches('.delete-product, .delete-product *')) {
				const button = e.target.closest('.delete-product')
				const productId = button.dataset.id
				this.deleteProduct(productId)
			}
		})
	}

	showProductModal(product = null) {
		const isEdit = product !== null
		const modalHtml = `
			<div class="modal-overlay" id="product-modal-overlay">
				<div class="modal-container">
					<div class="modal-header">
						<h3>${isEdit ? 'Редактировать товар' : 'Добавить товар'}</h3>
						<button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
							<i class="fas fa-times"></i>
						</button>
					</div>
					<form id="product-form" class="modal-body">
						<div class="form-row">
							<div class="form-group">
								<label for="product-name">Название товара *</label>
								<input type="text" id="product-name" name="name" value="${
									product?.name || ''
								}" required>
							</div>
							<div class="form-group">
								<label for="product-category">Категория *</label>
								<select id="product-category" name="category_id" required>
									<option value="">Выберите категорию</option>
									<option value="1" ${product?.category_id === 1 ? 'selected' : ''}>Рыба</option>
									<option value="2" ${product?.category_id === 2 ? 'selected' : ''}>Рак</option>
									<option value="3" ${product?.category_id === 3 ? 'selected' : ''}>Сыр</option>
								</select>
							</div>
						</div>
						
						<div class="form-group">
							<label for="product-description">Описание</label>
							<textarea id="product-description" name="description" rows="3">${
								product?.description || ''
							}</textarea>
						</div>
						
						<div class="form-row">
							<div class="form-group">
								<label for="product-price">Цена (₽) *</label>
								<input type="number" id="product-price" name="price" value="${
									product?.price || ''
								}" step="0.01" min="0" required>
							</div>
							<div class="form-group">
								<label for="product-stock">Остаток на складе *</label>
								<input type="number" id="product-stock" name="stock_quantity" value="${
									product?.stock_quantity || ''
								}" min="0" required>
							</div>
						</div>
						
						<div class="form-row">
							<div class="form-group">
								<label for="product-weight">Вес/Количество *</label>
								<input type="number" id="product-weight" name="weight" value="${
									product?.weight || ''
								}" step="0.01" min="0" required>
							</div>
							<div class="form-group">
								<label for="product-unit">Единица измерения</label>
								<select id="product-unit" name="unit">
									<option value="кг" ${product?.unit === 'кг' ? 'selected' : ''}>кг</option>
									<option value="шт" ${product?.unit === 'шт' ? 'selected' : ''}>шт</option>
									<option value="упак" ${product?.unit === 'упак' ? 'selected' : ''}>упак</option>
								</select>
							</div>
						</div>
						
						<div class="form-group">
							<label for="product-image">URL изображения</label>
							<input type="url" id="product-image" name="image_url" value="${
								product?.image_url || ''
							}" placeholder="/images/products/product-1.svg">
							<small>Например: /images/products/fish-1.svg</small>
						</div>
						
						<div class="form-row">
							<div class="form-group checkbox-group">
								<label>
									<input type="checkbox" id="product-featured" name="is_featured" ${
										product?.is_featured ? 'checked' : ''
									}>
									<span class="checkmark"></span>
									Рекомендуемый товар
								</label>
							</div>
							<div class="form-group checkbox-group">
								<label>
									<input type="checkbox" id="product-active" name="is_active" ${
										product?.is_active !== false ? 'checked' : ''
									}>
									<span class="checkmark"></span>
									Активный товар
								</label>
							</div>
						</div>
					</form>
					
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
							Отмена
						</button>
						<button type="submit" form="product-form" class="btn btn-primary">
							<i class="fas fa-save"></i>
							${isEdit ? 'Сохранить изменения' : 'Создать товар'}
						</button>
					</div>
				</div>
			</div>
		`

		document.body.insertAdjacentHTML('beforeend', modalHtml)

		// Bind form submission
		document.getElementById('product-form').addEventListener('submit', e => {
			e.preventDefault()
			this.saveProduct(product?.id)
		})
	}

	async saveProduct(productId = null) {
		const form = document.getElementById('product-form')
		const formData = new FormData(form)

		const productData = {
			name: formData.get('name'),
			description: formData.get('description'),
			price: parseFloat(formData.get('price')),
			weight: parseFloat(formData.get('weight')),
			unit: formData.get('unit'),
			stock_quantity: parseInt(formData.get('stock_quantity')),
			image_url: formData.get('image_url'),
			is_featured: formData.has('is_featured'),
			is_active: formData.has('is_active'),
			category_id: parseInt(formData.get('category_id')),
		}

		try {
			const url = productId
				? `/api/admin-api?action=product&id=${productId}`
				: '/api/admin-api?action=product'
			const method = productId ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(productData),
			})

			const result = await response.json()

			if (result.success) {
				// Close modal
				document.getElementById('product-modal-overlay').remove()

				// Refresh products list
				if (this.adminUI && this.adminUI.loadProducts) {
					this.adminUI.loadProducts()
				}

				// Show success message
				this.showNotification(
					productId ? 'Товар успешно обновлен!' : 'Товар успешно создан!',
					'success'
				)
			} else {
				throw new Error(result.error || 'Ошибка сохранения товара')
			}
		} catch (error) {
			console.error('Save product error:', error)
			this.showNotification(`Ошибка: ${error.message}`, 'error')
		}
	}

	async editProduct(productId) {
		try {
			const response = await fetch(`/api/admin-api?action=products`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
				},
			})

			const result = await response.json()

			if (result.success) {
				const product = result.products.find(
					p => p.id.toString() === productId.toString()
				)
				if (product) {
					this.showProductModal(product)
				} else {
					this.showNotification('Товар не найден', 'error')
				}
			}
		} catch (error) {
			console.error('Edit product error:', error)
			this.showNotification('Ошибка загрузки товара', 'error')
		}
	}

	async deleteProduct(productId) {
		if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
			return
		}

		try {
			const response = await fetch(
				`/api/admin-api?action=product&id=${productId}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
					},
				}
			)

			const result = await response.json()

			if (result.success) {
				if (this.adminUI && this.adminUI.loadProducts) {
					this.adminUI.loadProducts()
				}
				this.showNotification('Товар удален', 'success')
			} else {
				throw new Error(result.error || 'Ошибка удаления товара')
			}
		} catch (error) {
			console.error('Delete product error:', error)
			this.showNotification(`Ошибка: ${error.message}`, 'error')
		}
	}

	showNotification(message, type = 'info') {
		const notification = document.createElement('div')
		notification.className = `notification ${type}`
		notification.innerHTML = `
			<div class="notification-content">
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

		document.body.appendChild(notification)

		setTimeout(() => notification.classList.add('show'), 100)
		setTimeout(() => {
			notification.classList.remove('show')
			setTimeout(() => notification.remove(), 300)
		}, 3000)
	}
}

// ProductManager class ready for initialization from index.html

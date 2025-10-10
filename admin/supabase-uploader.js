/**
 * Supabase Storage Image Upload Component
 * Handles image uploads to Supabase Storage with admin authentication
 */

class SupabaseImageUploader {
	constructor(supabaseClient) {
		this.supabase = supabaseClient
		this.bucket = 'product-images'
		this.allowedTypes = [
			'image/jpeg',
			'image/png',
			'image/svg+xml',
			'image/webp',
		]
		this.maxFileSize = 5 * 1024 * 1024 // 5MB
	}

	/**
	 * Upload image to Supabase Storage
	 */
	async uploadImage(file, productSku = null) {
		try {
			// Validate file
			const validation = this.validateFile(file)
			if (!validation.valid) {
				throw new Error(validation.error)
			}

			// Generate unique filename
			const fileName = this.generateFileName(file, productSku)

			// Upload to Supabase Storage
			console.log(`Uploading ${fileName} to ${this.bucket}...`)

			const { data, error } = await this.supabase.storage
				.from(this.bucket)
				.upload(fileName, file, {
					cacheControl: '3600',
					upsert: false,
				})

			if (error) {
				console.error('Upload error:', error)
				throw new Error(`Upload failed: ${error.message}`)
			}

			// Get public URL
			const {
				data: { publicUrl },
			} = this.supabase.storage.from(this.bucket).getPublicUrl(fileName)

			console.log('Upload successful:', { path: data.path, publicUrl })

			return {
				success: true,
				storagePath: data.path,
				publicUrl: publicUrl,
				fileName: fileName,
				fileSize: file.size,
				mimeType: file.type,
			}
		} catch (error) {
			console.error('Image upload error:', error)
			return {
				success: false,
				error: error.message,
			}
		}
	}

	/**
	 * Delete image from Supabase Storage
	 */
	async deleteImage(storagePath) {
		try {
			const { error } = await this.supabase.storage
				.from(this.bucket)
				.remove([storagePath])

			if (error) {
				throw new Error(`Delete failed: ${error.message}`)
			}

			return { success: true }
		} catch (error) {
			console.error('Image delete error:', error)
			return {
				success: false,
				error: error.message,
			}
		}
	}

	/**
	 * Validate uploaded file
	 */
	validateFile(file) {
		if (!file) {
			return { valid: false, error: 'Файл не выбран' }
		}

		if (!this.allowedTypes.includes(file.type)) {
			return {
				valid: false,
				error: `Неподдерживаемый тип файла. Разрешены: ${this.allowedTypes.join(
					', '
				)}`,
			}
		}

		if (file.size > this.maxFileSize) {
			return {
				valid: false,
				error: `Файл слишком большой. Максимум: ${
					this.maxFileSize / 1024 / 1024
				}MB`,
			}
		}

		return { valid: true }
	}

	/**
	 * Generate unique filename
	 */
	generateFileName(file, productSku = null) {
		const timestamp = Date.now()
		const random = Math.random().toString(36).substring(2, 8)
		const extension = file.name.split('.').pop()

		if (productSku) {
			return `products/${productSku}-${timestamp}-${random}.${extension}`
		}

		return `uploads/${timestamp}-${random}.${extension}`
	}

	/**
	 * Create image upload widget
	 */
	createUploadWidget(containerId, options = {}) {
		const container = document.getElementById(containerId)
		if (!container) {
			console.error(`Container ${containerId} not found`)
			return
		}

		const widget = document.createElement('div')
		widget.className = 'supabase-image-uploader'
		widget.innerHTML = `
            <div class="upload-area" onclick="this.querySelector('input').click()">
                <input type="file" accept="image/*" style="display: none;">
                <div class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Нажмите для выбора изображения</p>
                    <small>JPG, PNG, SVG, WebP до 5MB</small>
                </div>
                <div class="upload-preview" style="display: none;">
                    <img src="" alt="Preview">
                    <button type="button" class="remove-btn">&times;</button>
                </div>
            </div>
            <div class="upload-progress" style="display: none;">
                <div class="progress-bar"></div>
                <span class="progress-text">Загрузка...</span>
            </div>
        `

		// Add styles
		const styles = `
            <style>
            .supabase-image-uploader {
                margin: 10px 0;
            }
            .upload-area {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: border-color 0.3s;
            }
            .upload-area:hover {
                border-color: #007bff;
            }
            .upload-placeholder i {
                font-size: 2em;
                color: #ccc;
                margin-bottom: 10px;
            }
            .upload-preview {
                position: relative;
                display: inline-block;
            }
            .upload-preview img {
                max-width: 200px;
                max-height: 200px;
                border-radius: 4px;
            }
            .remove-btn {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 50%;
                width: 25px;
                height: 25px;
                cursor: pointer;
            }
            .upload-progress {
                margin-top: 10px;
            }
            .progress-bar {
                width: 100%;
                height: 4px;
                background: #e9ecef;
                border-radius: 2px;
                overflow: hidden;
            }
            .progress-bar::after {
                content: '';
                display: block;
                height: 100%;
                background: #007bff;
                width: 0%;
                transition: width 0.3s;
                animation: progress 2s ease-in-out;
            }
            @keyframes progress {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            </style>
        `

		// Add styles to head if not already present
		if (!document.querySelector('#supabase-uploader-styles')) {
			const styleElement = document.createElement('div')
			styleElement.id = 'supabase-uploader-styles'
			styleElement.innerHTML = styles
			document.head.appendChild(styleElement)
		}

		// Handle file selection
		const fileInput = widget.querySelector('input[type="file"]')
		const placeholder = widget.querySelector('.upload-placeholder')
		const preview = widget.querySelector('.upload-preview')
		const previewImg = widget.querySelector('.upload-preview img')
		const removeBtn = widget.querySelector('.remove-btn')
		const progress = widget.querySelector('.upload-progress')

		fileInput.addEventListener('change', async e => {
			const file = e.target.files[0]
			if (!file) return

			// Show preview
			const reader = new FileReader()
			reader.onload = e => {
				previewImg.src = e.target.result
				placeholder.style.display = 'none'
				preview.style.display = 'block'
			}
			reader.readAsDataURL(file)

			// Upload file
			if (options.autoUpload !== false) {
				progress.style.display = 'block'
				const result = await this.uploadImage(file, options.productSku)
				progress.style.display = 'none'

				if (result.success && options.onUpload) {
					options.onUpload(result)
				} else if (!result.success && options.onError) {
					options.onError(result.error)
				}
			}
		})

		// Remove button
		removeBtn.addEventListener('click', e => {
			e.stopPropagation()
			fileInput.value = ''
			placeholder.style.display = 'block'
			preview.style.display = 'none'

			if (options.onRemove) {
				options.onRemove()
			}
		})

		container.appendChild(widget)
		return widget
	}
}

// Export for use in admin panel
window.SupabaseImageUploader = SupabaseImageUploader

/**
 * Admin Image Upload API - handles image uploads to Supabase Storage
 * Requires admin authentication
 */

const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

// Initialize Supabase with service key for admin operations
const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_KEY,
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
)

// CORS headers
const headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Content-Type': 'application/json',
}

/**
 * Verify admin JWT token
 */
function verifyAdminToken(authHeader) {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new Error('Missing or invalid authorization header')
	}

	const token = authHeader.substring(7)
	const decoded = jwt.verify(token, process.env.JWT_SECRET)

	if (!decoded.isAdmin) {
		throw new Error('Admin access required')
	}

	return decoded
}

/**
 * Generate unique filename for uploaded image
 */
function generateFileName(originalName, productSku = null) {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 8)
	const extension = originalName.split('.').pop().toLowerCase()

	// Validate extension
	const allowedExtensions = ['jpg', 'jpeg', 'png', 'svg', 'webp']
	if (!allowedExtensions.includes(extension)) {
		throw new Error(`Unsupported file type: ${extension}`)
	}

	if (productSku) {
		return `products/${productSku}-${timestamp}-${random}.${extension}`
	}

	return `uploads/${timestamp}-${random}.${extension}`
}

/**
 * Main handler
 */
exports.handler = async (event, context) => {
	const startTime = Date.now()

	// Handle preflight requests
	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	try {
		// Verify admin authentication
		const admin = verifyAdminToken(event.headers.authorization)
		console.log(`Admin ${admin.email} uploading image`)

		// Only allow POST for uploads
		if (event.httpMethod !== 'POST') {
			return {
				statusCode: 405,
				headers,
				body: JSON.stringify({
					error: 'Method not allowed',
					allowed: ['POST', 'OPTIONS'],
				}),
			}
		}

		// Parse request body
		const body = JSON.parse(event.body)
		const { fileName, fileData, mimeType, productSku } = body

		if (!fileName || !fileData || !mimeType) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({
					error: 'Missing required fields: fileName, fileData, mimeType',
				}),
			}
		}

		// Decode base64 file data
		const fileBuffer = Buffer.from(fileData, 'base64')

		// Validate file size (5MB limit)
		if (fileBuffer.length > 5 * 1024 * 1024) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({
					error: 'File too large. Maximum size: 5MB',
				}),
			}
		}

		// Generate unique filename
		const storagePath = generateFileName(fileName, productSku)

		console.log(`Uploading ${storagePath} to Supabase Storage...`)

		// Upload to Supabase Storage
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('product-images')
			.upload(storagePath, fileBuffer, {
				contentType: mimeType,
				cacheControl: '3600',
				upsert: false,
			})

		if (uploadError) {
			console.error('Upload error:', uploadError)
			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({
					error: `Upload failed: ${uploadError.message}`,
				}),
			}
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from('product-images').getPublicUrl(storagePath)

		console.log(`Upload successful: ${publicUrl}`)

		// Return success response
		return {
			statusCode: 200,
			headers: {
				...headers,
				'X-Response-Time': `${Date.now() - startTime}ms`,
			},
			body: JSON.stringify({
				success: true,
				data: {
					storagePath: uploadData.path,
					publicUrl: publicUrl,
					fileName: fileName,
					fileSize: fileBuffer.length,
					mimeType: mimeType,
					uploadedBy: admin.email,
					uploadedAt: new Date().toISOString(),
				},
			}),
		}
	} catch (error) {
		console.error('Image upload error:', error)

		// Handle JWT errors
		if (error.name === 'JsonWebTokenError') {
			return {
				statusCode: 401,
				headers,
				body: JSON.stringify({
					error: 'Invalid token',
					code: 'INVALID_TOKEN',
				}),
			}
		}

		if (error.name === 'TokenExpiredError') {
			return {
				statusCode: 401,
				headers,
				body: JSON.stringify({
					error: 'Token expired',
					code: 'TOKEN_EXPIRED',
				}),
			}
		}

		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({
				error: error.message || 'Internal server error',
				timestamp: new Date().toISOString(),
			}),
		}
	}
}

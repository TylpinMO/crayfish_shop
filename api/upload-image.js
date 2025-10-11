/**
 * Image Upload API - Vercel Serverless Function
 * Migrated from Netlify Functions
 */

const jwt = require('jsonwebtoken')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
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

const JWT_SECRET = process.env.JWT_SECRET

function verifyAdminToken(authHeader) {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new Error('Missing or invalid authorization header')
	}

	const token = authHeader.substring(7)
	const decoded = jwt.verify(token, JWT_SECRET)

	if (!decoded.isAdmin) {
		throw new Error('Admin access required')
	}

	return decoded
}

function generateFileName(originalName, productSku = null) {
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 8)
	const extension = originalName.split('.').pop().toLowerCase()

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
 * Vercel API Route Handler
 */
export default async function handler(req, res) {
	// CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
	res.setHeader('Content-Type', 'application/json')

	if (req.method === 'OPTIONS') {
		return res.status(200).json({})
	}

	if (req.method !== 'POST') {
		return res.status(405).json({
			error: 'Method not allowed',
			allowed: ['POST', 'OPTIONS'],
		})
	}

	try {
		// Verify admin authentication
		const admin = verifyAdminToken(req.headers.authorization)
		console.log(`Admin ${admin.email} uploading image`)

		const { fileName, fileData, mimeType, productSku } = req.body

		if (!fileName || !fileData || !mimeType) {
			return res.status(400).json({
				error: 'Missing required fields: fileName, fileData, mimeType',
			})
		}

		// Decode base64 file data
		const fileBuffer = Buffer.from(fileData, 'base64')

		// Validate file size (5MB limit)
		if (fileBuffer.length > 5 * 1024 * 1024) {
			return res.status(400).json({
				error: 'File too large. Maximum size: 5MB',
			})
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
			return res.status(500).json({
				error: `Upload failed: ${uploadError.message}`,
			})
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from('product-images').getPublicUrl(storagePath)

		console.log(`Upload successful: ${publicUrl}`)

		// Return success response
		return res.status(200).json({
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
		})
	} catch (error) {
		console.error('Image upload error:', error)

		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				error: 'Invalid token',
				code: 'INVALID_TOKEN',
			})
		}

		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				error: 'Token expired',
				code: 'TOKEN_EXPIRED',
			})
		}

		return res.status(500).json({
			error: error.message || 'Internal server error',
		})
	}
}

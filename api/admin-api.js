/**
 * Admin API - Vercel Serverless Function
 * Migrated from Netlify Functions
 */

const jwt = require('jsonwebtoken')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase lazily
let supabase = null

function getSupabase() {
	if (!supabase) {
		if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
			throw new Error('Missing Supabase environment variables')
		}

		supabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_SERVICE_KEY,
			{
				auth: {
					autoRefreshToken: false,
					persistSession: false,
				},
			}
		)
	}
	return supabase
}

function getJWTSecret() {
	if (!process.env.JWT_SECRET) {
		throw new Error('Missing JWT_SECRET environment variable')
	}
	return process.env.JWT_SECRET
}

function verifyAdminToken(authHeader) {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new Error('Missing or invalid authorization header')
	}

	const token = authHeader.substring(7)
	const JWT_SECRET = getJWTSecret()
	const decoded = jwt.verify(token, JWT_SECRET)

	if (!decoded.isAdmin) {
		throw new Error('Admin access required')
	}

	return decoded
}

/**
 * Vercel API Route Handler
 */
export default async function handler(req, res) {
	// CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, OPTIONS'
	)
	res.setHeader('Content-Type', 'application/json')

	if (req.method === 'OPTIONS') {
		return res.status(200).json({})
	}

	try {
		const { action } = req.query

		// Some actions can be public (dashboard stats, products view)
		const publicActions = ['dashboard', 'products', 'categories']
		const isPublicAction = publicActions.includes(action)

		// Verify admin authentication for protected actions
		let admin = null
		if (!isPublicAction || req.headers.authorization) {
			try {
				admin = verifyAdminToken(req.headers.authorization)
				console.log(`Admin API access by: ${admin.email}`)
			} catch (authError) {
				if (!isPublicAction) {
					throw authError
				}
				console.log('Public access to', action)
			}
		}

		switch (req.method) {
			case 'GET':
				return await handleGet(req, res, action, admin)
			case 'POST':
				return await handlePost(req, res, action, admin)
			case 'PUT':
				return await handlePut(req, res, action, admin)
			case 'DELETE':
				return await handleDelete(req, res, action, admin)
			default:
				return res.status(405).json({
					error: 'Method not allowed',
				})
		}
	} catch (error) {
		console.error('🔥 Admin API error:', {
			message: error.message,
			name: error.name,
			stack: error.stack,
			action: req.query?.action,
			method: req.method,
		})

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

		if (error.message.includes('Missing Supabase environment variables')) {
			return res.status(500).json({
				error: 'Server configuration error',
				code: 'CONFIG_ERROR',
			})
		}

		return res.status(500).json({
			error: error.message || 'Internal server error',
			code: 'INTERNAL_ERROR',
			...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
		})
	}
}

async function handleGet(req, res, action, admin) {
	switch (action) {
		case 'products':
			return await getProducts(req, res)
		case 'categories':
			return await getCategories(req, res)
		case 'dashboard':
			return await getDashboard(req, res)
		default:
			return res.status(400).json({ error: 'Invalid action' })
	}
}

async function handlePost(req, res, action, admin) {
	switch (action) {
		case 'product':
			return await createProduct(req, res, admin)
		case 'category':
			return await createCategory(req, res, admin)
		default:
			return res.status(400).json({ error: 'Invalid action' })
	}
}

async function handlePut(req, res, action, admin) {
	switch (action) {
		case 'product':
			return await updateProduct(req, res, admin)
		case 'category':
			return await updateCategory(req, res, admin)
		default:
			return res.status(400).json({ error: 'Invalid action' })
	}
}

async function handleDelete(req, res, action, admin) {
	switch (action) {
		case 'product':
			return await deleteProduct(req, res, admin)
		case 'category':
			return await deleteCategory(req, res, admin)
		default:
			return res.status(400).json({ error: 'Invalid action' })
	}
}

// Implementation functions
async function getProducts(req, res) {
	const supabase = getSupabase()
	const { data: products, error } = await supabase
		.from('products')
		.select(
			`
			*,
			categories (id, name),
			product_images (
				id,
				image_url,
				alt_text,
				is_primary,
				storage_bucket,
				storage_path,
				public_url,
				mime_type,
				file_size
			)
		`
		)
		.order('created_at', { ascending: false })

	if (error) {
		return res.status(500).json({ error: error.message })
	}

	return res.status(200).json({ success: true, products })
}

async function getCategories(req, res) {
	const supabase = getSupabase()
	const { data: categories, error } = await supabase
		.from('categories')
		.select('*')
		.order('created_at', { ascending: true })

	if (error) {
		return res.status(500).json({ error: error.message })
	}

	return res.status(200).json({ success: true, categories })
}

async function getDashboard(req, res) {
	try {
		console.log('🔧 Dashboard API called')
		console.log(
			'🔧 Supabase URL:',
			process.env.SUPABASE_URL ? 'Set' : 'Missing'
		)
		console.log(
			'🔧 Service Key:',
			process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Missing'
		)

		const supabase = getSupabase()

		// Get comprehensive data
		const [productsResult, categoriesResult, imagesResult] = await Promise.all([
			supabase
				.from('products')
				.select(
					'id, name, price, stock_quantity, is_featured, is_active, created_at'
				),
			supabase.from('categories').select('id, name'),
			supabase.from('product_images').select('id, product_id'),
		])

		console.log('🔧 Database results:', {
			products: productsResult.error
				? 'ERROR: ' + productsResult.error.message
				: `${productsResult.data?.length} items`,
			categories: categoriesResult.error
				? 'ERROR: ' + categoriesResult.error.message
				: `${categoriesResult.data?.length} items`,
			images: imagesResult.error
				? 'ERROR: ' + imagesResult.error.message
				: `${imagesResult.data?.length} items`,
		})

		if (productsResult.error || categoriesResult.error || imagesResult.error) {
			const errors = {
				products: productsResult.error?.message,
				categories: categoriesResult.error?.message,
				images: imagesResult.error?.message,
			}
			console.error('🔧 Database errors:', errors)
			return res.status(500).json({
				error: 'Failed to fetch dashboard data',
				details: errors,
			})
		}

		const products = productsResult.data
		const categories = categoriesResult.data
		const images = imagesResult.data

		// Calculate statistics
		const totalProducts = products.length
		const activeProducts = products.filter(p => p.is_active).length
		const inactiveProducts = totalProducts - activeProducts
		const featuredProducts = products.filter(p => p.is_featured).length
		const lowStockProducts = products.filter(p => p.stock_quantity <= 5).length
		const outOfStockProducts = products.filter(
			p => p.stock_quantity === 0
		).length
		const totalCategories = categories.length
		const totalImages = images.length

		// Calculate total inventory value
		const totalValue = products.reduce(
			(sum, p) => sum + p.price * p.stock_quantity,
			0
		)

		// Recent products (last 7 days)
		const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
		const recentProducts = products.filter(p => p.created_at > weekAgo).length

		// Top categories by product count
		const categoryStats = categories
			.map(cat => ({
				name: cat.name,
				count: products.filter(p => p.category_id === cat.id).length,
			}))
			.sort((a, b) => b.count - a.count)

		// Products without images
		const productsWithImages = [...new Set(images.map(img => img.product_id))]
			.length
		const productsWithoutImages = totalProducts - productsWithImages

		return res.status(200).json({
			success: true,
			data: {
				overview: {
					totalProducts,
					activeProducts,
					inactiveProducts,
					featuredProducts,
					totalCategories,
					totalImages,
					recentProducts,
				},
				inventory: {
					lowStockProducts,
					outOfStockProducts,
					totalValue: Math.round(totalValue * 100) / 100,
					avgProductValue:
						totalProducts > 0
							? Math.round((totalValue / totalProducts) * 100) / 100
							: 0,
				},
				content: {
					productsWithImages,
					productsWithoutImages,
					categoryStats: categoryStats.slice(0, 5),
				},
				alerts: {
					lowStock: lowStockProducts > 0,
					outOfStock: outOfStockProducts > 0,
					missingImages: productsWithoutImages > 0,
					inactiveProducts: inactiveProducts > 0,
				},
			},
		})
	} catch (error) {
		console.error('Dashboard error:', error)
		return res.status(500).json({ error: 'Failed to generate dashboard' })
	}
}

async function createProduct(req, res, admin) {
	const product = req.body

	const { data, error } = await supabase
		.from('products')
		.insert([product])
		.select()

	if (error) {
		return res.status(500).json({ error: error.message })
	}

	return res.status(201).json({ success: true, product: data[0] })
}

async function updateProduct(req, res, admin) {
	const { id } = req.query
	const updates = req.body

	const { data, error } = await supabase
		.from('products')
		.update(updates)
		.eq('id', id)
		.select()

	if (error) {
		return res.status(500).json({ error: error.message })
	}

	return res.status(200).json({ success: true, product: data[0] })
}

async function deleteProduct(req, res, admin) {
	const { id } = req.query

	const { error } = await supabase.from('products').delete().eq('id', id)

	if (error) {
		return res.status(500).json({ error: error.message })
	}

	return res.status(200).json({ success: true, message: 'Product deleted' })
}

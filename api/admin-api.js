/**
 * Admin API - Vercel Serverless Function
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
		// Verify admin authentication
		const admin = verifyAdminToken(req.headers.authorization)
		console.log(`Admin API access by: ${admin.email}`)

		const { action } = req.query

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
		console.error('Admin API error:', error)

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
		.order('sort_order', { ascending: true })

	if (error) {
		return res.status(500).json({ error: error.message })
	}

	return res.status(200).json({ success: true, products })
}

async function getCategories(req, res) {
	const { data: categories, error } = await supabase
		.from('categories')
		.select('*')
		.order('sort_order', { ascending: true })

	if (error) {
		return res.status(500).json({ error: error.message })
	}

	return res.status(200).json({ success: true, categories })
}

async function getDashboard(req, res) {
	// Get counts
	const [productsResult, categoriesResult] = await Promise.all([
		supabase.from('products').select('id, stock_quantity, is_featured'),
		supabase.from('categories').select('id'),
	])

	if (productsResult.error || categoriesResult.error) {
		return res.status(500).json({
			error: 'Failed to fetch dashboard data',
		})
	}

	const totalProducts = productsResult.data.length
	const lowStockProducts = productsResult.data.filter(
		p => p.stock_quantity <= 5
	).length
	const featuredProducts = productsResult.data.filter(p => p.is_featured).length
	const totalCategories = categoriesResult.data.length

	return res.status(200).json({
		success: true,
		data: {
			totalProducts,
			lowStockProducts,
			featuredProducts,
			totalCategories,
		},
	})
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

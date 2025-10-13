/**
 * Public Products API - Vercel Serverless Function
 * Simplified version for INTEGER ID structure
 */

const { createClient } = require('@supabase/supabase-js')

// Cache for products data (in-memory, 5 min TTL)
let productsCache = null
let categoriesCache = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Initialize Supabase with server-side keys from environment
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

/**
 * Normalize image URL for display
 */
function normalizeImageUrl(imageUrl) {
	if (!imageUrl) return '/images/products/placeholder.svg'
	if (imageUrl.startsWith('/')) return imageUrl
	if (imageUrl.startsWith('http')) return imageUrl
	return `/images/products/${imageUrl}`
}

// CORS headers
const headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Content-Type': 'application/json',
}

/**
 * Vercel API Route Handler
 */
export default async function handler(req, res) {
	const startTime = Date.now()

	// Debug logging
	console.log('🔧 API Handler started')
	console.log('📊 Environment check:', {
		supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
		serviceKey: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING',
	})

	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return res.status(200).json({})
	}

	// Only allow GET requests
	if (req.method !== 'GET') {
		return res.status(405).json({
			error: 'Method not allowed',
			allowed: ['GET', 'OPTIONS'],
		})
	}

	// Set CORS headers
	Object.entries(headers).forEach(([key, value]) => {
		res.setHeader(key, value)
	})

	const { type } = req.query

	// Handle categories request
	if (type === 'categories') {
		try {
			const categories = await getCategories()
			return res.status(200).json({
				success: true,
				data: categories,
				timestamp: new Date().toISOString(),
			})
		} catch (error) {
			console.error('Categories API error:', error)
			return res.status(500).json({
				error: 'Failed to fetch categories',
				timestamp: new Date().toISOString(),
			})
		}
	}

	// Check cache first
	const now = Date.now()
	if (productsCache && now - cacheTimestamp < CACHE_TTL) {
		console.log('Returning cached products data')
		res.setHeader('X-Cache', 'HIT')
		res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`)
		return res.status(200).json(productsCache)
	}

	try {
		console.log('🗄️ Fetching products from database...')
		console.log('🔗 Supabase client created successfully')

		// Get all active products with categories (simplified structure)
		const { data: products, error } = await supabase
			.from('products')
			.select(
				`
				id,
				name,
				description,
				price,
				category_id,
				image_url,
				stock_quantity,
				weight,
				unit,
				is_featured,
				categories (
					id,
					name
				)
			`
			)
			.eq('is_active', true)
			.order('name', { ascending: true })

		if (error) {
			console.error('❌ Supabase query error:', error)
			console.error('❌ Error details:', JSON.stringify(error, null, 2))
			return res.status(500).json({
				error: 'Database query failed',
				details: error.message,
				code: error.code,
			})
		}

		if (!products || products.length === 0) {
			console.log('No products found')
			return res.status(200).json({
				success: true,
				products: [],
				categories: [],
				total: 0,
				message: 'No products found',
			})
		}

		console.log(`Processing ${products.length} products...`)

		// Transform data for frontend
		const transformedProducts = products
			.filter(product => product && product.name)
			.map(product => {
				try {
					const categoryName = product.categories?.name || 'Товары'
					const imageUrl = normalizeImageUrl(product.image_url)

					if (!product.name || typeof product.price !== 'number') {
						console.warn(`Invalid product data:`, {
							id: product.id,
							name: product.name,
							price: product.price,
						})
						return null
					}

					return {
						id: product.id,
						name: String(product.name).trim(),
						description: product.description
							? String(product.description).trim()
							: '',
						price: Number(product.price),
						category: categoryName,
						categoryId: product.category_id,
						image: imageUrl,
						imageAlt: product.name,
						stockQuantity: Number(product.stock_quantity) || 0,
						weight: Number(product.weight) || 0,
						unit: String(product.unit || 'шт').trim(),
						isFeatured: Boolean(product.is_featured),
						isInStock: Number(product.stock_quantity) > 0,
					}
				} catch (transformError) {
					console.error(
						`Error transforming product ${product.id}:`,
						transformError
					)
					return null
				}
			})
			.filter(Boolean)

		// Get unique categories
		const categories = [
			...new Set(transformedProducts.map(p => p.category)),
		].map(name => ({
			name,
			count: transformedProducts.filter(p => p.category === name).length,
		}))

		// Cache the result
		const result = {
			success: true,
			products: transformedProducts,
			categories,
			total: transformedProducts.length,
			featured: transformedProducts.filter(p => p.isFeatured).length,
			inStock: transformedProducts.filter(p => p.isInStock).length,
			cache: {
				cached: false,
				timestamp: new Date().toISOString(),
				ttl: CACHE_TTL / 1000,
			},
		}

		productsCache = result
		cacheTimestamp = now

		console.log(`Successfully processed ${transformedProducts.length} products`)

		res.setHeader('X-Cache', 'MISS')
		res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`)

		return res.status(200).json(result)
	} catch (error) {
		console.error('Products API error:', error)
		return res.status(500).json({
			error: error.message || 'Internal server error',
			timestamp: new Date().toISOString(),
		})
	}
}

/**
 * Get categories with product counts
 */
async function getCategories() {
	try {
		console.log('🏷️ Fetching categories from database...')
		const { data: categories, error } = await supabase
			.from('categories')
			.select(
				`
				id,
				name,
				description,
				products (count)
			`
			)
			.eq('is_active', true)
			.order('sort_order', { ascending: true })

		if (error) {
			console.error('❌ Categories query error:', error)
			console.error(
				'❌ Categories error details:',
				JSON.stringify(error, null, 2)
			)
			return []
		}

		console.log(`✅ Found ${categories?.length || 0} categories`)

		// Add "Все" category at the beginning
		const allCategories = [
			{
				id: 0,
				name: 'Все',
				description: 'Все товары',
				productCount: categories.reduce(
					(sum, cat) => sum + (cat.products?.[0]?.count || 0),
					0
				),
			},
			...categories.map(cat => ({
				id: cat.id,
				name: cat.name,
				description: cat.description,
				productCount: cat.products?.[0]?.count || 0,
			})),
		]

		return allCategories
	} catch (error) {
		console.error('Error fetching categories:', error)
		return []
	}
}

/**
 * Public Products API - Vercel Serverless Function
 * Migrated from Netlify Functions
 */

const { createClient } = require('@supabase/supabase-js')

// Cache for products data (in-memory, 5 min TTL)
let productsCache = null
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
 * Get Supabase Storage public URL for image
 */
function getStorageImageUrl(storagePath, publicUrl) {
	if (publicUrl && publicUrl.startsWith('http')) {
		return publicUrl
	}

	if (storagePath) {
		return `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images/${storagePath}`
	}

	return `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images/placeholders/fish-placeholder.svg`
}

function normalizeImageUrl(imageUrl) {
	if (!imageUrl) return 'images/fish-placeholder.svg'
	if (imageUrl.startsWith('/')) {
		return imageUrl.substring(1)
	}
	if (!imageUrl.trim()) {
		return 'images/fish-placeholder.svg'
	}
	return imageUrl
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

	// Check cache first
	const now = Date.now()
	if (productsCache && now - cacheTimestamp < CACHE_TTL) {
		console.log('Returning cached products data')
		res.setHeader('X-Cache', 'HIT')
		res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`)
		return res.status(200).json(productsCache)
	}

	try {
		console.log('Fetching products from database...')

		// Get all active products with categories and images
		const { data: products, error } = await supabase
			.from('products')
			.select(
				`
				id,
				name,
				description,
				price,
				old_price,
				stock_quantity,
				weight,
				unit,
				is_featured,
				sort_order,
				categories (
					id,
					name
				),
				product_images (
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
			.eq('is_active', true)
			.order('sort_order', { ascending: true })

		if (error) {
			console.error('Supabase query error:', error)
			return res.status(500).json({
				error: 'Database query failed',
				details: error.message,
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
					const primaryImage =
						product.product_images?.find(img => img.is_primary) ||
						product.product_images?.[0]
					const categoryName = product.categories?.name || 'Товары'

					// Get image URL from Supabase Storage or fallback
					let imageUrl
					if (primaryImage?.storage_path || primaryImage?.public_url) {
						imageUrl = getStorageImageUrl(
							primaryImage.storage_path,
							primaryImage.public_url
						)
					} else {
						imageUrl = normalizeImageUrl(primaryImage?.image_url)
					}

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
						oldPrice: product.old_price ? Number(product.old_price) : null,
						category: categoryName,
						categoryId: product.categories?.id,
						image: imageUrl,
						imageAlt: primaryImage?.alt_text || product.name,
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

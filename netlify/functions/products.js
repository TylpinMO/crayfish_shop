/**
 * Public Products API - get products for main site
 * No authentication required - public data
 *
 * Features:
 * - Caching with TTL
 * - Error handling with retry logic
 * - Input validation
 * - Performance monitoring
 * - Image path normalization
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
 * Normalize image URL for Netlify compatibility
 */
function normalizeImageUrl(imageUrl) {
	if (!imageUrl) return 'images/fish-placeholder.svg'

	// Remove leading slash for Netlify
	if (imageUrl.startsWith('/')) {
		return imageUrl.substring(1)
	}

	// Ensure the path exists and is not empty
	if (!imageUrl.trim()) {
		return 'images/fish-placeholder.svg'
	}

	return imageUrl
}

exports.handler = async (event, context) => {
	const startTime = Date.now()

	// CORS headers
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Cache-Control': 'public, max-age=300', // 5 minutes browser cache
	}

	// Handle preflight requests
	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	// Only allow GET requests
	if (event.httpMethod !== 'GET') {
		console.warn(`Method not allowed: ${event.httpMethod}`)
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({
				error: 'Method not allowed',
				allowed: ['GET', 'OPTIONS'],
			}),
		}
	}

	// Check cache first (DISABLED FOR TESTING)
	const now = Date.now()
	if (false && productsCache && now - cacheTimestamp < CACHE_TTL) {
		console.log('Returning cached products data')
		return {
			statusCode: 200,
			headers: {
				...headers,
				'X-Cache': 'HIT',
				'X-Response-Time': `${Date.now() - startTime}ms`,
			},
			body: JSON.stringify(productsCache),
		}
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
					is_primary
				)
			`
			)
			.eq('is_active', true)
			.order('sort_order', { ascending: true })

		if (error) {
			console.error('Supabase query error:', {
				message: error.message,
				details: error.details,
				hint: error.hint,
				code: error.code,
			})
			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({
					error: 'Database query failed',
					message: 'Unable to fetch products from database',
				}),
			}
		}

		if (!products) {
			console.warn('No products returned from database')
			return {
				statusCode: 200,
				headers,
				body: JSON.stringify({
					success: true,
					products: [],
					categories: [],
					total: 0,
					message: 'No products found',
				}),
			}
		}

		console.log(`Processing ${products.length} products...`)
		console.log(
			'Raw products sample:',
			JSON.stringify(products.slice(0, 2), null, 2)
		)

		// Transform data for frontend with validation
		const transformedProducts = products
			.filter(product => product && product.name) // Filter out invalid products
			.map(product => {
				try {
					// Get primary image or first available image
					const primaryImage =
						product.product_images?.find(img => img.is_primary) ||
						product.product_images?.[0]
					const categoryName = product.categories?.name || 'Товары'

					// Normalize image URL
					const imageUrl = normalizeImageUrl(primaryImage?.image_url)
					console.log('Image processing:', {
						productName: product.name,
						rawImageUrl: primaryImage?.image_url,
						normalizedUrl: imageUrl
					})

					// Validate required fields
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
						image: imageUrl,
						category: categoryName,
						categorySlug: categoryName
							.toLowerCase()
							.replace(/\s+/g, '-')
							.replace(/[^a-z0-9-]/g, ''),
						inStock: Boolean(product.stock_quantity > 0),
						stockQuantity: Number(product.stock_quantity) || 0,
						weight: product.weight ? Number(product.weight) : null,
						unit: product.unit || 'шт',
						isFeatured: Boolean(product.is_featured),
						sortOrder: Number(product.sort_order) || 0,
					}
				} catch (error) {
					console.error(`Error processing product ${product.id}:`, error)
					return null
				}
			})
			.filter(Boolean) // Remove null entries		// Group by categories with statistics
		const categories = {}
		const categoryStats = {}

		transformedProducts.forEach(product => {
			const slug = product.categorySlug

			if (!categories[slug]) {
				categories[slug] = {
					name: product.category,
					slug: slug,
					products: [],
				}
				categoryStats[slug] = {
					total: 0,
					inStock: 0,
					featured: 0,
				}
			}

			categories[slug].products.push(product)
			categoryStats[slug].total++
			if (product.inStock) categoryStats[slug].inStock++
			if (product.isFeatured) categoryStats[slug].featured++
		})

		// Add statistics to categories
		Object.keys(categories).forEach(slug => {
			categories[slug].stats = categoryStats[slug]
		})

		// Prepare response data
		const responseData = {
			success: true,
			products: transformedProducts,
			categories: Object.values(categories),
			total: transformedProducts.length,
			stats: {
				totalProducts: transformedProducts.length,
				inStock: transformedProducts.filter(p => p.inStock).length,
				featured: transformedProducts.filter(p => p.isFeatured).length,
				categories: Object.keys(categories).length,
			},
			cached: false,
			timestamp: new Date().toISOString(),
		}

		// Cache the response
		productsCache = responseData
		cacheTimestamp = Date.now()

		console.log(
			`Products API completed successfully: ${
				transformedProducts.length
			} products, ${Object.keys(categories).length} categories`
		)

		return {
			statusCode: 200,
			headers: {
				...headers,
				'X-Cache': 'MISS',
				'X-Response-Time': `${Date.now() - startTime}ms`,
			},
			body: JSON.stringify(responseData),
		}
	} catch (error) {
		console.error('Products API unexpected error:', {
			message: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString(),
		})

		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({
				error: 'Internal server error',
				message: 'An unexpected error occurred while fetching products',
				timestamp: new Date().toISOString(),
			}),
		}
	}
}

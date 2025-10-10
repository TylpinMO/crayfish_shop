// Public Products API - get products for main site
// No authentication required - public data

const { createClient } = require('@supabase/supabase-js')

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

exports.handler = async (event, context) => {
	// CORS headers
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
	}

	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	if (event.httpMethod !== 'GET') {
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ error: 'Method not allowed' }),
		}
	}

	try {
		// Get all active products with categories
		const { data: products, error } = await supabase
			.from('products')
			.select(
				`
				*,
				categories (
					id,
					name,
					slug
				)
			`
			)
			.eq('is_active', true)
			.order('sort_order', { ascending: true })

		if (error) {
			console.error('Products query error:', error)
			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({ error: 'Failed to fetch products' }),
			}
		}

		// Transform data for frontend
		const transformedProducts = products.map(product => ({
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.price,
			oldPrice: product.old_price,
			image: product.image_url || '/images/fish-placeholder.jpg',
			category: product.categories?.name || 'Товары',
			categorySlug: product.categories?.slug || 'products',
			inStock: product.stock_quantity > 0,
			weight: product.weight,
			unit: product.unit || 'кг',
			isFeatured: product.is_featured,
		}))

		// Group by categories
		const categories = {}
		transformedProducts.forEach(product => {
			if (!categories[product.categorySlug]) {
				categories[product.categorySlug] = {
					name: product.category,
					slug: product.categorySlug,
					products: [],
				}
			}
			categories[product.categorySlug].products.push(product)
		})

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({
				success: true,
				products: transformedProducts,
				categories: Object.values(categories),
				total: transformedProducts.length,
			}),
		}
	} catch (error) {
		console.error('Products API error:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: 'Internal server error' }),
		}
	}
}

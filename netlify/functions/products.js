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
		// Get all active products with categories and images
		const { data: products, error } = await supabase
			.from('products')
			.select(
				`
				*,
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
			console.error('Products query error:', error)
			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({ error: 'Failed to fetch products' }),
			}
		}

		// Transform data for frontend
		const transformedProducts = products.map(product => {
			// Get primary image or first available image
			const primaryImage =
				product.product_images?.find(img => img.is_primary) ||
				product.product_images?.[0]
			const categoryName = product.categories?.name || 'Товары'

			// Fix image paths - ensure they work on Netlify
			let imageUrl = primaryImage?.image_url || 'images/fish-placeholder.svg'
			// Remove leading slash if present (for Netlify compatibility)
			if (imageUrl.startsWith('/')) {
				imageUrl = imageUrl.substring(1)
			}

			return {
				id: product.id,
				name: product.name,
				description: product.description,
				price: product.price,
				oldPrice: product.old_price,
				image: imageUrl,
				category: categoryName,
				categorySlug: categoryName.toLowerCase().replace(/\s+/g, '-'),
				inStock: product.stock_quantity > 0,
				weight: product.weight,
				unit: product.unit || 'кг',
				isFeatured: product.is_featured,
			}
		})

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

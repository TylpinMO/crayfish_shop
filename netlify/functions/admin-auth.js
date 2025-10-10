// Secure Admin Authentication via Netlify Functions
// No Supabase keys exposed to client!

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase with server-side keys from environment
const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_KEY // SERVICE KEY, not anon key!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

exports.handler = async (event, context) => {
	// CORS headers
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
	}

	if (event.httpMethod === 'OPTIONS') {
		return { statusCode: 200, headers, body: '' }
	}

	if (event.httpMethod !== 'POST') {
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ error: 'Method not allowed' }),
		}
	}

	try {
		const { action, email, password } = JSON.parse(event.body)

		switch (action) {
			case 'login':
				return await handleLogin(email, password, headers)

			case 'logout':
				return await handleLogout(headers)

			case 'verify':
				return await handleVerifyToken(event.headers.authorization, headers)

			default:
				return {
					statusCode: 400,
					headers,
					body: JSON.stringify({ error: 'Invalid action' }),
				}
		}
	} catch (error) {
		console.error('Auth error:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: 'Internal server error' }),
		}
	}
}

async function handleLogin(email, password, headers) {
	try {
		// Check admin user in database
		const { data: adminUser, error } = await supabase
			.from('admin_users')
			.select('*')
			.eq('email', email)
			.eq('is_active', true)
			.single()

		if (error || !adminUser) {
			return {
				statusCode: 401,
				headers,
				body: JSON.stringify({ error: 'Неверные данные для входа' }),
			}
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(
			password,
			adminUser.password_hash
		)
		if (!isValidPassword) {
			return {
				statusCode: 401,
				headers,
				body: JSON.stringify({ error: 'Неверные данные для входа' }),
			}
		}

		// Update last login
		await supabase
			.from('admin_users')
			.update({ last_login: new Date().toISOString() })
			.eq('id', adminUser.id)

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: adminUser.id,
				email: adminUser.email,
				role: adminUser.role,
			},
			JWT_SECRET,
			{ expiresIn: '24h' }
		)

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({
				success: true,
				token,
				user: {
					id: adminUser.id,
					email: adminUser.email,
					full_name: adminUser.full_name,
					role: adminUser.role,
				},
			}),
		}
	} catch (error) {
		console.error('Login error:', error)
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ error: 'Ошибка входа в систему' }),
		}
	}
}

async function handleLogout(headers) {
	return {
		statusCode: 200,
		headers,
		body: JSON.stringify({ success: true, message: 'Logout successful' }),
	}
}

async function handleVerifyToken(authHeader, headers) {
	try {
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return {
				statusCode: 401,
				headers,
				body: JSON.stringify({ error: 'No token provided' }),
			}
		}

		const token = authHeader.substring(7)
		const decoded = jwt.verify(token, JWT_SECRET)

		// Check if user still exists and is active
		const { data: adminUser, error } = await supabase
			.from('admin_users')
			.select('id, email, full_name, role')
			.eq('id', decoded.userId)
			.eq('is_active', true)
			.single()

		if (error || !adminUser) {
			return {
				statusCode: 401,
				headers,
				body: JSON.stringify({ error: 'Invalid token' }),
			}
		}

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({
				success: true,
				user: adminUser,
			}),
		}
	} catch (error) {
		return {
			statusCode: 401,
			headers,
			body: JSON.stringify({ error: 'Invalid token' }),
		}
	}
}

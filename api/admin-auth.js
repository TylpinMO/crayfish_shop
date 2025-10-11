/**
 * Admin Authentication API - Vercel Serverless Function
 * Migrated from Netlify Functions
 */

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
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
const JWT_EXPIRES_IN = '24h'
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

// Simple rate limiting store
const loginAttempts = new Map()

function validateEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email)
}

function sanitizeInput(input) {
	if (typeof input !== 'string') return ''
	return input.trim().toLowerCase()
}

function checkRateLimit(email) {
	const attempts = loginAttempts.get(email)
	if (!attempts) return { allowed: true }

	const now = Date.now()
	const recentAttempts = attempts.filter(
		timestamp => now - timestamp < LOCKOUT_DURATION
	)

	if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
		const oldestAttempt = Math.min(...recentAttempts)
		const remainingTime = LOCKOUT_DURATION - (now - oldestAttempt)
		return {
			allowed: false,
			remainingTime: Math.ceil(remainingTime / 1000 / 60),
		}
	}

	loginAttempts.set(email, recentAttempts)
	return { allowed: true }
}

function recordFailedAttempt(email) {
	const attempts = loginAttempts.get(email) || []
	attempts.push(Date.now())
	loginAttempts.set(email, attempts)
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
		const { email, password } = req.body

		// Input validation
		if (!email || !password) {
			return res.status(400).json({
				error: 'Email and password are required',
				code: 'MISSING_CREDENTIALS',
			})
		}

		const sanitizedEmail = sanitizeInput(email)

		if (!validateEmail(sanitizedEmail)) {
			return res.status(400).json({
				error: 'Invalid email format',
				code: 'INVALID_EMAIL',
			})
		}

		// Rate limiting check
		const rateLimitCheck = checkRateLimit(sanitizedEmail)
		if (!rateLimitCheck.allowed) {
			return res.status(429).json({
				error: `Too many failed attempts. Try again in ${rateLimitCheck.remainingTime} minutes.`,
				code: 'RATE_LIMITED',
				remainingTime: rateLimitCheck.remainingTime,
			})
		}

		console.log(`Authentication attempt for: ${sanitizedEmail}`)

		// Get admin user from database
		const { data: adminUser, error: queryError } = await supabase
			.from('admin_users')
			.select(
				'id, email, password_hash, full_name, role, is_active, last_login'
			)
			.eq('email', sanitizedEmail)
			.eq('is_active', true)
			.single()

		if (queryError || !adminUser) {
			console.log(`Admin user not found: ${sanitizedEmail}`)
			recordFailedAttempt(sanitizedEmail)
			return res.status(401).json({
				error: 'Invalid credentials',
				code: 'INVALID_CREDENTIALS',
			})
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(
			password,
			adminUser.password_hash
		)

		if (!isPasswordValid) {
			console.log(`Invalid password for: ${sanitizedEmail}`)
			recordFailedAttempt(sanitizedEmail)
			return res.status(401).json({
				error: 'Invalid credentials',
				code: 'INVALID_CREDENTIALS',
			})
		}

		// Clear failed attempts on successful login
		loginAttempts.delete(sanitizedEmail)

		// Update last login
		await supabase
			.from('admin_users')
			.update({ last_login: new Date().toISOString() })
			.eq('id', adminUser.id)

		// Generate JWT token
		const tokenPayload = {
			id: adminUser.id,
			email: adminUser.email,
			name: adminUser.full_name,
			role: adminUser.role,
			isAdmin: true,
		}

		const token = jwt.sign(tokenPayload, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN,
		})

		console.log(`Successful login for: ${sanitizedEmail}`)

		return res.status(200).json({
			success: true,
			token,
			user: {
				id: adminUser.id,
				email: adminUser.email,
				name: adminUser.full_name,
				role: adminUser.role,
			},
			expiresIn: JWT_EXPIRES_IN,
		})
	} catch (error) {
		console.error('Authentication error:', error)

		if (error.name === 'JsonWebTokenError') {
			return res.status(500).json({
				error: 'Token generation failed',
				code: 'TOKEN_ERROR',
			})
		}

		return res.status(500).json({
			error: 'Authentication service temporarily unavailable',
			code: 'SERVICE_ERROR',
		})
	}
}

// Netlify Function для получения адресов от DaData
// Токен хранится в переменных окружения и недоступен клиенту

exports.handler = async (event, context) => {
	// Разрешаем CORS
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
	}

	// Обрабатываем preflight запрос
	if (event.httpMethod === 'OPTIONS') {
		return {
			statusCode: 200,
			headers,
			body: '',
		}
	}

	// Проверяем метод запроса
	if (event.httpMethod !== 'POST') {
		return {
			statusCode: 405,
			headers,
			body: JSON.stringify({ error: 'Method not allowed' }),
		}
	}

	try {
		// Получаем токен из переменных окружения
		const DADATA_TOKEN = process.env.DADATA_TOKEN

		if (!DADATA_TOKEN) {
			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({ error: 'DaData token not configured' }),
			}
		}

		// Парсим тело запроса
		const { query, locations } = JSON.parse(event.body)

		if (!query || query.length < 3) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: 'Query must be at least 3 characters' }),
			}
		}

		// Делаем запрос к DaData API
		const response = await fetch(
			'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: `Token ${DADATA_TOKEN}`,
				},
				body: JSON.stringify({
					query: query,
					locations: locations || [{ region: 'Ростовская' }],
					count: 5,
				}),
			}
		)

		if (!response.ok) {
			throw new Error(`DaData API error: ${response.status}`)
		}

		const data = await response.json()

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({
				suggestions: data.suggestions || [],
			}),
		}
	} catch (error) {
		console.error('Error in address-suggestions function:', error)

		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({
				error: 'Failed to fetch address suggestions',
				message: error.message,
			}),
		}
	}
}

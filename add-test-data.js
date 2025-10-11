const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_KEY
)

async function addTestData() {
	try {
		// Добавляем категории
		console.log('Добавляем категории...')
		const { data: categories, error: catError } = await supabase
			.from('categories')
			.upsert(
				[
					{
						name: 'Раки',
						description: 'Свежие речные раки различных размеров',
						is_active: true,
					},
					{
						name: 'Креветки',
						description: 'Морские креветки высшего качества',
						is_active: true,
					},
					{
						name: 'Крабы',
						description: 'Камчатские и морские крабы',
						is_active: true,
					},
					{
						name: 'Икра',
						description: 'Красная и черная икра премиум класса',
						is_active: true,
					},
					{
						name: 'Рыба',
						description: 'Охлажденная морская и речная рыба',
						is_active: true,
					},
					{
						name: 'Морепродукты',
						description: 'Разнообразные дары моря',
						is_active: true,
					},
				],
				{ onConflict: 'name' }
			)
			.select()

		if (catError) {
			console.error('Ошибка при добавлении категорий:', catError)
			return
		}

		console.log(`Добавлено ${categories.length} категорий`)

		// Получаем ID категорий
		const { data: allCategories } = await supabase
			.from('categories')
			.select('id, name')

		const categoryMap = {}
		allCategories.forEach(cat => {
			categoryMap[cat.name] = cat.id
		})

		// Добавляем товары
		console.log('Добавляем товары...')
		const products = [
			{
				name: 'Раки варёные крупные',
				description:
					'Отборные крупные речные раки, сваренные по традиционному рецепту с укропом и специями',
				price: 890,
				category_id: categoryMap['Раки'],
				stock_quantity: 25,
				weight: 1,
				unit: 'кг',
				is_active: true,
				is_featured: true,
			},
			{
				name: 'Раки варёные средние',
				description:
					'Свежие речные раки среднего размера, идеально подходят для семейного ужина',
				price: 690,
				category_id: categoryMap['Раки'],
				stock_quantity: 30,
				weight: 1,
				unit: 'кг',
				is_active: true,
				is_featured: false,
			},
			{
				name: 'Креветки королевские',
				description: 'Крупные королевские креветки в панцире, свежемороженые',
				price: 1250,
				category_id: categoryMap['Креветки'],
				stock_quantity: 20,
				weight: 0.5,
				unit: 'кг',
				is_active: true,
				is_featured: true,
			},
			{
				name: 'Краб камчатский',
				description:
					'Свежий камчатский краб, разделанный и готовый к употреблению',
				price: 2800,
				category_id: categoryMap['Крабы'],
				stock_quantity: 5,
				weight: 1,
				unit: 'кг',
				is_active: true,
				is_featured: true,
			},
			{
				name: 'Икра красная горбуши',
				description: 'Натуральная зернистая икра горбуши первого сорта',
				price: 890,
				category_id: categoryMap['Икра'],
				stock_quantity: 15,
				weight: 0.1,
				unit: 'кг',
				is_active: true,
				is_featured: false,
			},
			{
				name: 'Лосось атлантический',
				description: 'Свежий атлантический лосось, филе без кожи',
				price: 1150,
				category_id: categoryMap['Рыба'],
				stock_quantity: 12,
				weight: 1,
				unit: 'кг',
				is_active: true,
				is_featured: true,
			},
		]

		const { data: productsData, error: prodError } = await supabase
			.from('products')
			.insert(products)
			.select()

		if (prodError) {
			console.error('Ошибка при добавлении товаров:', prodError)
			return
		}

		console.log(`Добавлено ${productsData.length} товаров`)
		console.log('Тестовые данные успешно добавлены!')
	} catch (error) {
		console.error('Общая ошибка:', error)
	}
}

addTestData()

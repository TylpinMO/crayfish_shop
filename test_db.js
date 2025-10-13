const { createClient } = require('@supabase/supabase-js')

// Проверяем переменные окружения
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING')
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING')

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

async function testDB() {
    try {
        console.log('Testing categories...')
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
        
        if (catError) {
            console.error('Categories error:', catError)
        } else {
            console.log('Categories found:', categories.length)
            categories.forEach(cat => console.log(`  - ${cat.id}: ${cat.name}`))
        }

        console.log('\nTesting products...')
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, name, category_id')
            .limit(5)
        
        if (prodError) {
            console.error('Products error:', prodError)
        } else {
            console.log('Products found:', products.length)
            products.forEach(prod => console.log(`  - ${prod.id}: ${prod.name} (cat: ${prod.category_id})`))
        }

        console.log('\nTesting products with join...')
        const { data: joinTest, error: joinError } = await supabase
            .from('products')
            .select(`
                id,
                name,
                categories (
                    id,
                    name
                )
            `)
            .limit(3)
        
        if (joinError) {
            console.error('Join error:', joinError)
        } else {
            console.log('Join test result:', JSON.stringify(joinTest, null, 2))
        }

    } catch (error) {
        console.error('Test failed:', error)
    }
}

testDB()

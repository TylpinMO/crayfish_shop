-- Проверка и подготовка структуры БД перед добавлением тестовых данных

-- 1. Проверяем существование таблиц
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN '✅ Существует'
        ELSE '❌ Отсутствует'
    END as status
FROM (VALUES 
    ('categories'),
    ('products'), 
    ('product_images')
) AS required_tables(table_name);

-- 2. Проверяем структуру таблицы categories
SELECT 'Структура таблицы categories:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- 3. Проверяем структуру таблицы products  
SELECT 'Структура таблицы products:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 4. Проверяем структуру таблицы product_images
SELECT 'Структура таблицы product_images:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;

-- 5. Проверяем внешние ключи
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('products', 'product_images');

-- 6. Проверяем текущие данные
SELECT 
    'Текущее состояние БД:' as info,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM product_images) as images_count;

-- 7. Если нужно - исправляем структуру product_images
-- Добавляем недостающие колонки в product_images если их нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'product_images' AND column_name = 'storage_bucket'
    ) THEN
        ALTER TABLE product_images 
        ADD COLUMN storage_bucket VARCHAR(100) DEFAULT 'product-images',
        ADD COLUMN storage_path VARCHAR(500),
        ADD COLUMN public_url VARCHAR(1000),
        ADD COLUMN mime_type VARCHAR(100),
        ADD COLUMN file_size INTEGER;
        
        RAISE NOTICE 'Добавлены недостающие колонки в product_images';
    ELSE
        RAISE NOTICE 'Все колонки в product_images уже существуют';
    END IF;
END $$;

-- 8. Финальная проверка структуры
SELECT 'Финальная структура product_images:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;
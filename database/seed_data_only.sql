-- Добавление тестовых данных в очищенную базу данных
-- Использовать ПОСЛЕ полной очистки БД

-- 1. Создаем категории
INSERT INTO categories (name, description, is_active, created_at, updated_at) VALUES
('Раки', 'Свежие речные раки различных размеров', true, NOW(), NOW()),
('Креветки', 'Морские креветки высшего качества', true, NOW(), NOW()),
('Крабы', 'Камчатские и морские крабы', true, NOW(), NOW()),
('Икра', 'Красная и черная икра премиум класса', true, NOW(), NOW()),
('Рыба', 'Охлажденная морская и речная рыба', true, NOW(), NOW()),
('Морепродукты', 'Разнообразные дары моря', true, NOW(), NOW());

-- 2. Создаем товары с правильными UUID категорий
-- Сначала получаем UUID категорий
DO $$
DECLARE 
    raki_id UUID;
    krevetki_id UUID; 
    kraby_id UUID;
    ikra_id UUID;
    ryba_id UUID;
    moreprodukty_id UUID;
BEGIN
    -- Получаем UUID категорий
    SELECT id INTO raki_id FROM categories WHERE name = 'Раки';
    SELECT id INTO krevetki_id FROM categories WHERE name = 'Креветки';
    SELECT id INTO kraby_id FROM categories WHERE name = 'Крабы';
    SELECT id INTO ikra_id FROM categories WHERE name = 'Икра';
    SELECT id INTO ryba_id FROM categories WHERE name = 'Рыба';
    SELECT id INTO moreprodukty_id FROM categories WHERE name = 'Морепродукты';

    -- Добавляем товары с правильными UUID
    INSERT INTO products (
        name, 
        description, 
        price, 
        category_id, 
        stock_quantity, 
        weight, 
        unit, 
        is_active, 
        is_featured,
        created_at, 
        updated_at
    ) VALUES
    -- Раки
    ('Раки варёные крупные', 'Отборные крупные речные раки, сваренные по традиционному рецепту с укропом и специями', 890, raki_id, 25, 1, 'кг', true, true, NOW(), NOW()),
    ('Раки варёные средние', 'Свежие речные раки среднего размера, идеально подходят для семейного ужина', 690, raki_id, 30, 1, 'кг', true, false, NOW(), NOW()),
    ('Раки живые', 'Живые речные раки для самостоятельного приготовления', 750, raki_id, 15, 1, 'кг', true, true, NOW(), NOW()),

    -- Креветки  
    ('Креветки королевские', 'Крупные королевские креветки, очищенные и готовые к приготовлению', 1290, krevetki_id, 20, 0.5, 'кг', true, true, NOW(), NOW()),
    ('Креветки тигровые', 'Сочные тигровые креветки в панцире, заморожены в день вылова', 990, krevetki_id, 18, 0.5, 'кг', true, false, NOW(), NOW()),
    ('Креветки коктейльные', 'Мелкие креветки, идеальны для салатов и закусок', 450, krevetki_id, 35, 0.3, 'кг', true, false, NOW(), NOW()),

    -- Крабы
    ('Краб камчатский', 'Свежий камчатский краб, мясо сладкое и нежное', 2890, kraby_id, 5, 1.5, 'шт', true, true, NOW(), NOW()),
    ('Крабовые палочки премиум', 'Натуральные крабовые палочки без добавок', 1290, kraby_id, 12, 0.5, 'кг', true, false, NOW(), NOW()),

    -- Икра
    ('Икра красная горбуши', 'Зернистая икра горбуши первого сорта', 2490, ikra_id, 8, 0.25, 'кг', true, true, NOW(), NOW()),
    ('Икра черная осетровая', 'Премиальная черная икра осетра', 8900, ikra_id, 3, 0.1, 'кг', true, true, NOW(), NOW()),
    ('Икра красная кеты', 'Крупнозернистая икра кеты, отборное качество', 3200, ikra_id, 6, 0.25, 'кг', true, false, NOW(), NOW()),

    -- Рыба
    ('Семга слабосоленая', 'Норвежская семга слабого посола, нарезка', 1890, ryba_id, 15, 0.5, 'кг', true, true, NOW(), NOW()),
    ('Форель копченая', 'Форель горячего копчения, цельная тушка', 1290, ryba_id, 10, 0.8, 'шт', true, false, NOW(), NOW()),
    ('Скумбрия соленая', 'Атлантическая скумбрия домашнего посола', 490, ryba_id, 25, 0.4, 'шт', true, false, NOW(), NOW()),

    -- Морепродукты
    ('Мидии в раковинах', 'Свежие мидии в натуральных раковинах', 690, moreprodukty_id, 20, 1, 'кг', true, false, NOW(), NOW()),
    ('Кальмары очищенные', 'Охлажденные кальмары, готовы к приготовлению', 890, moreprodukty_id, 22, 0.5, 'кг', true, false, NOW(), NOW()),
    ('Морской коктейль', 'Замороженная смесь морепродуктов премиум качества', 1190, moreprodukty_id, 15, 0.8, 'кг', true, true, NOW(), NOW());
    
    RAISE NOTICE 'Товары добавлены успешно с правильными UUID категорий';
END $$;

-- 3. Добавляем основные изображения для товаров с правильными UUID
DO $$
DECLARE 
    product_uuid UUID;
BEGIN
    -- Добавляем изображения для каждого товара по названию
    
    -- Раки
    SELECT id INTO product_uuid FROM products WHERE name = 'Раки варёные крупные';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/crayfish-1.svg', 'Раки варёные крупные', true, 'product-images', '/images/products/crayfish-1.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Раки варёные средние';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/crayfish-2.svg', 'Раки варёные средние', true, 'product-images', '/images/products/crayfish-2.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Раки живые';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/crayfish-3.svg', 'Раки живые', true, 'product-images', '/images/products/crayfish-3.svg', 'image/svg+xml', NOW(), NOW());

    -- Креветки
    SELECT id INTO product_uuid FROM products WHERE name = 'Креветки королевские';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/shrimp-1.svg', 'Креветки королевские', true, 'product-images', '/images/products/shrimp-1.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Креветки тигровые';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/shrimp-2.svg', 'Креветки тигровые', true, 'product-images', '/images/products/shrimp-2.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Креветки коктейльные';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/shrimp-3.svg', 'Креветки коктейльные', true, 'product-images', '/images/products/shrimp-3.svg', 'image/svg+xml', NOW(), NOW());

    -- Крабы
    SELECT id INTO product_uuid FROM products WHERE name = 'Краб камчатский';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/crab-1.svg', 'Краб камчатский', true, 'product-images', '/images/products/crab-1.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Крабовые палочки премиум';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/crab-2.svg', 'Крабовые палочки премиум', true, 'product-images', '/images/products/crab-2.svg', 'image/svg+xml', NOW(), NOW());

    -- Икра
    SELECT id INTO product_uuid FROM products WHERE name = 'Икра красная горбуши';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/caviar-1.svg', 'Икра красная горбуши', true, 'product-images', '/images/products/caviar-1.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Икра черная осетровая';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/caviar-2.svg', 'Икра черная осетровая', true, 'product-images', '/images/products/caviar-2.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Икра красная кеты';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/caviar-3.svg', 'Икра красная кеты', true, 'product-images', '/images/products/caviar-3.svg', 'image/svg+xml', NOW(), NOW());

    -- Рыба
    SELECT id INTO product_uuid FROM products WHERE name = 'Семга слабосоленая';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/fish-1.svg', 'Семга слабосоленая', true, 'product-images', '/images/products/fish-1.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Форель копченая';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/fish-2.svg', 'Форель копченая', true, 'product-images', '/images/products/fish-2.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Скумбрия соленая';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/fish-3.svg', 'Скумбрия соленая', true, 'product-images', '/images/products/fish-3.svg', 'image/svg+xml', NOW(), NOW());

    -- Морепродукты
    SELECT id INTO product_uuid FROM products WHERE name = 'Мидии в раковинах';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/mussel-1.svg', 'Мидии в раковинах', true, 'product-images', '/images/products/mussel-1.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Кальмары очищенные';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/squid-1.svg', 'Кальмары очищенные', true, 'product-images', '/images/products/squid-1.svg', 'image/svg+xml', NOW(), NOW());
    
    SELECT id INTO product_uuid FROM products WHERE name = 'Морской коктейль';
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, storage_bucket, public_url, mime_type, created_at, updated_at) 
    VALUES (product_uuid, '/images/products/seafood-mix.svg', 'Морской коктейль', true, 'product-images', '/images/products/seafood-mix.svg', 'image/svg+xml', NOW(), NOW());
    
    RAISE NOTICE 'Изображения товаров добавлены успешно';
END $$;

-- 4. Проверяем что данные добавились
SELECT 
    'Результат добавления данных:' as info,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM product_images) as images_count,
    (SELECT COUNT(*) FROM products WHERE is_featured = true) as featured_products;

-- 5. Показываем товары по категориям
SELECT 
    c.name as category,
    COUNT(p.id) as products_count,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
GROUP BY c.id, c.name
ORDER BY c.id;
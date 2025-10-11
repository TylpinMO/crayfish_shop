-- Очистка и наполнение базы данных тестовыми данными
-- Запускать после очистки БД

-- 1. Очищаем все таблицы (если нужно)
TRUNCATE TABLE product_images CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Сбрасываем последовательности
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE product_images_id_seq RESTART WITH 1;

-- 2. Создаем категории
INSERT INTO categories (name, description, is_active, created_at, updated_at) VALUES
('Раки', 'Свежие речные раки различных размеров', true, NOW(), NOW()),
('Креветки', 'Морские креветки высшего качества', true, NOW(), NOW()),
('Крабы', 'Камчатские и морские крабы', true, NOW(), NOW()),
('Икра', 'Красная и черная икра премиум класса', true, NOW(), NOW()),
('Рыба', 'Охлажденная морская и речная рыба', true, NOW(), NOW()),
('Морепродукты', 'Разнообразные дары моря', true, NOW(), NOW());

-- 3. Создаем товары
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
('Раки варёные крупные', 'Отборные крупные речные раки, сваренные по традиционному рецепту с укропом и специями', 890, 1, 25, 1, 'кг', true, true, NOW(), NOW()),
('Раки варёные средние', 'Свежие речные раки среднего размера, идеально подходят для семейного ужина', 690, 1, 30, 1, 'кг', true, false, NOW(), NOW()),
('Раки живые', 'Живые речные раки для самостоятельного приготовления', 750, 1, 15, 1, 'кг', true, true, NOW(), NOW()),

-- Креветки  
('Креветки королевские', 'Крупные королевские креветки, очищенные и готовые к приготовлению', 1290, 2, 20, 0.5, 'кг', true, true, NOW(), NOW()),
('Креветки тигровые', 'Сочные тигровые креветки в панцире, заморожены в день вылова', 990, 2, 18, 0.5, 'кг', true, false, NOW(), NOW()),
('Креветки коктейльные', 'Мелкие креветки, идеальны для салатов и закусок', 450, 2, 35, 0.3, 'кг', true, false, NOW(), NOW()),

-- Крабы
('Краб камчатский', 'Свежий камчатский краб, мясо сладкое и нежное', 2890, 3, 5, 1.5, 'шт', true, true, NOW(), NOW()),
('Крабовые палочки премиум', 'Натуральные крабовые палочки без добавок', 1290, 3, 12, 0.5, 'кг', true, false, NOW(), NOW()),

-- Икра
('Икра красная горбуши', 'Зернистая икра горбуши первого сорта', 2490, 4, 8, 0.25, 'кг', true, true, NOW(), NOW()),
('Икра черная осетровая', 'Премиальная черная икра осетра', 8900, 4, 3, 0.1, 'кг', true, true, NOW(), NOW()),
('Икра красная кеты', 'Крупнозернистая икра кеты, отборное качество', 3200, 4, 6, 0.25, 'кг', true, false, NOW(), NOW()),

-- Рыба
('Семга слабосоленая', 'Норвежская семга слабого посола, нарезка', 1890, 5, 15, 0.5, 'кг', true, true, NOW(), NOW()),
('Форель копченая', 'Форель горячего копчения, цельная тушка', 1290, 5, 10, 0.8, 'шт', true, false, NOW(), NOW()),
('Скумбрия соленая', 'Атлантическая скумбрия домашнего посола', 490, 5, 25, 0.4, 'шт', true, false, NOW(), NOW()),

-- Морепродукты
('Мидии в раковинах', 'Свежие мидии в натуральных раковинах', 690, 6, 20, 1, 'кг', true, false, NOW(), NOW()),
('Кальмары очищенные', 'Охлажденные кальмары, готовы к приготовлению', 890, 6, 22, 0.5, 'кг', true, false, NOW(), NOW()),
('Морской коктейль', 'Замороженная смесь морепродуктов премиум качества', 1190, 6, 15, 0.8, 'кг', true, true, NOW(), NOW());

-- 4. Добавляем изображения для товаров
INSERT INTO product_images (
    product_id, 
    image_url, 
    alt_text, 
    is_primary,
    storage_bucket,
    public_url,
    mime_type,
    created_at, 
    updated_at
) VALUES
-- Раки (товары 1-3)
(1, '/images/products/crayfish-1.svg', 'Раки варёные крупные', true, 'product-images', '/images/products/crayfish-1.svg', 'image/svg+xml', NOW(), NOW()),
(2, '/images/products/crayfish-2.svg', 'Раки варёные средние', true, 'product-images', '/images/products/crayfish-2.svg', 'image/svg+xml', NOW(), NOW()),  
(3, '/images/products/crayfish-3.svg', 'Раки живые', true, 'product-images', '/images/products/crayfish-3.svg', 'image/svg+xml', NOW(), NOW()),

-- Креветки (товары 4-6)
(4, '/images/products/shrimp-1.svg', 'Креветки королевские', true, 'product-images', '/images/products/shrimp-1.svg', 'image/svg+xml', NOW(), NOW()),
(5, '/images/products/shrimp-2.svg', 'Креветки тигровые', true, 'product-images', '/images/products/shrimp-2.svg', 'image/svg+xml', NOW(), NOW()),
(6, '/images/products/shrimp-3.svg', 'Креветки коктейльные', true, 'product-images', '/images/products/shrimp-3.svg', 'image/svg+xml', NOW(), NOW()),

-- Крабы (товары 7-8)
(7, '/images/products/crab-1.svg', 'Краб камчатский', true, 'product-images', '/images/products/crab-1.svg', 'image/svg+xml', NOW(), NOW()),
(8, '/images/products/crab-2.svg', 'Крабовые палочки премиум', true, 'product-images', '/images/products/crab-2.svg', 'image/svg+xml', NOW(), NOW()),

-- Икра (товары 9-11)
(9, '/images/products/caviar-1.svg', 'Икра красная горбуши', true, 'product-images', '/images/products/caviar-1.svg', 'image/svg+xml', NOW(), NOW()),
(10, '/images/products/caviar-2.svg', 'Икра черная осетровая', true, 'product-images', '/images/products/caviar-2.svg', 'image/svg+xml', NOW(), NOW()),
(11, '/images/products/caviar-3.svg', 'Икра красная кеты', true, 'product-images', '/images/products/caviar-3.svg', 'image/svg+xml', NOW(), NOW()),

-- Рыба (товары 12-14)
(12, '/images/products/fish-1.svg', 'Семга слабосоленая', true, 'product-images', '/images/products/fish-1.svg', 'image/svg+xml', NOW(), NOW()),
(13, '/images/products/fish-2.svg', 'Форель копченая', true, 'product-images', '/images/products/fish-2.svg', 'image/svg+xml', NOW(), NOW()),
(14, '/images/products/fish-3.svg', 'Скумбрия соленая', true, 'product-images', '/images/products/fish-3.svg', 'image/svg+xml', NOW(), NOW()),

-- Морепродукты (товары 15-17)
(15, '/images/products/mussel-1.svg', 'Мидии в раковинах', true, 'product-images', '/images/products/mussel-1.svg', 'image/svg+xml', NOW(), NOW()),
(16, '/images/products/squid-1.svg', 'Кальмары очищенные', true, 'product-images', '/images/products/squid-1.svg', 'image/svg+xml', NOW(), NOW()),
(17, '/images/products/seafood-mix.svg', 'Морской коктейль', true, 'product-images', '/images/products/seafood-mix.svg', 'image/svg+xml', NOW(), NOW());

-- 5. Добавляем дополнительные изображения для некоторых товаров
INSERT INTO product_images (
    product_id, 
    image_url, 
    alt_text, 
    is_primary,
    storage_bucket,
    public_url,
    mime_type,
    created_at, 
    updated_at
) VALUES
-- Дополнительные фото для популярных товаров
(1, '/images/products/crayfish-1-alt.svg', 'Раки варёные крупные - вид сбоку', false, 'product-images', '/images/products/crayfish-1-alt.svg', 'image/svg+xml', NOW(), NOW()),
(4, '/images/products/shrimp-1-alt.svg', 'Креветки королевские - упаковка', false, 'product-images', '/images/products/shrimp-1-alt.svg', 'image/svg+xml', NOW(), NOW()),
(7, '/images/products/crab-1-alt.svg', 'Краб камчатский - клешни', false, 'product-images', '/images/products/crab-1-alt.svg', 'image/svg+xml', NOW(), NOW());

-- 6. Проверяем результат
SELECT 'Данные успешно добавлены!' as status;

SELECT 
    'Категории' as type,
    COUNT(*) as count
FROM categories
WHERE is_active = true

UNION ALL

SELECT 
    'Товары' as type,
    COUNT(*) as count  
FROM products
WHERE is_active = true

UNION ALL

SELECT 
    'Изображения' as type,
    COUNT(*) as count
FROM product_images

UNION ALL

SELECT 
    'Рекомендуемые товары' as type,
    COUNT(*) as count
FROM products 
WHERE is_featured = true AND is_active = true;

-- 7. Показываем товары с изображениями
SELECT 
    p.id,
    p.name,
    p.price,
    p.stock_quantity,
    c.name as category,
    COUNT(pi.id) as images_count,
    CASE WHEN p.is_featured THEN '★' ELSE '' END as featured
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name, p.price, p.stock_quantity, c.name, p.is_featured
ORDER BY p.id;
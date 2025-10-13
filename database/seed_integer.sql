-- Тестовые данные для новой структуры БД с INTEGER ID
-- Использовать после применения schema_integer.sql

-- Проверяем, что категории уже созданы
SELECT 'Текущие категории:' as info;
SELECT id, name, description FROM categories ORDER BY sort_order;

-- Добавляем товары
INSERT INTO products (
    name, 
    description, 
    price, 
    category_id, 
    image_url,
    stock_quantity, 
    weight, 
    unit, 
    is_active, 
    is_featured
) VALUES
-- Рыба (category_id = 1)
('Семга слабосоленая', 'Норвежская семга слабого посола, нарезанная ломтиками. Идеальна для бутербродов и салатов.', 1890.00, 1, '/images/products/fish-1.svg', 15, 0.5, 'кг', true, true),
('Форель копченая', 'Форель горячего копчения, цельная тушка. Нежное мясо с ароматом дымка.', 1290.00, 1, '/images/products/fish-2.svg', 10, 0.8, 'шт', true, false),
('Скумбрия соленая', 'Атлантическая скумбрия домашнего посола. Жирная и вкусная рыба.', 490.00, 1, '/images/products/fish-3.svg', 25, 0.4, 'шт', true, false),
('Лосось стейк', 'Стейки лосося для жарки и запекания. Свежий, охлажденный.', 2190.00, 1, '/images/products/fish-4.svg', 8, 0.3, 'кг', true, true),

-- Раки (category_id = 2)
('Раки варёные крупные', 'Отборные крупные речные раки, сваренные по традиционному рецепту с укропом и специями.', 890.00, 2, '/images/products/crayfish-1.svg', 25, 1.0, 'кг', true, true),
('Раки варёные средние', 'Свежие речные раки среднего размера, идеально подходят для семейного ужина.', 690.00, 2, '/images/products/crayfish-2.svg', 30, 1.0, 'кг', true, false),
('Раки живые', 'Живые речные раки для самостоятельного приготовления. Гарантия свежести.', 750.00, 2, '/images/products/crayfish-3.svg', 15, 1.0, 'кг', true, true),

-- Сыр (category_id = 3)
('Сыр Гауда выдержанный', 'Голландский сыр Гауда 18 месяцев выдержки. Пикантный вкус с ореховыми нотками.', 1490.00, 3, '/images/products/cheese-1.svg', 12, 0.2, 'кг', true, true),
('Сыр Камамбер', 'Французский мягкий сыр с белой плесенью. Кремовая текстура, богатый вкус.', 890.00, 3, '/images/products/cheese-2.svg', 18, 0.15, 'шт', true, false),
('Сыр Пармезан', 'Итальянский твердый сыр Пармиджано Реджано. Идеален для пасты и салатов.', 2290.00, 3, '/images/products/cheese-3.svg', 6, 0.3, 'кг', true, true),
('Сыр Дор Блю', 'Немецкий сыр с голубой плесенью. Острый и пикантный вкус.', 1190.00, 3, '/images/products/cheese-4.svg', 10, 0.2, 'кг', true, false);

-- Проверяем результат
SELECT 
    'Результат добавления данных:' as info,
    (SELECT COUNT(*) FROM categories) as categories_count,
    (SELECT COUNT(*) FROM products) as products_count,
    (SELECT COUNT(*) FROM products WHERE is_featured = true) as featured_products;

-- Показываем товары по категориям
SELECT 
    c.name as category,
    COUNT(p.id) as products_count,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
GROUP BY c.id, c.name
ORDER BY c.sort_order;

-- Показываем все товары с категориями
SELECT 
    p.id,
    p.name,
    c.name as category,
    p.price,
    p.weight,
    p.unit,
    p.is_featured
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
ORDER BY c.sort_order, p.name;
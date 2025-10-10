-- ======================================
-- РЫБНЫЙ МАГАЗИН - ТЕСТОВЫЕ ДАННЫЕ
-- ======================================
-- Скопируйте и выполните весь код целиком в Supabase SQL Editor

-- 1. Сначала добавляем категории
INSERT INTO categories (name, description, sort_order) VALUES
('Свежая рыба', 'Свежевыловленная рыба высшего качества', 1),
('Морепродукты', 'Креветки, мидии, кальмары и другие морепродукты', 2),
('Икра и деликатесы', 'Деликатесная икра и рыбные деликатесы', 3)
ON CONFLICT (name) DO NOTHING;

-- 2. Добавляем товары (используя прямые подзапросы)
INSERT INTO products (name, description, price, old_price, category_id, stock_quantity, weight, unit, is_featured, is_active, sku, sort_order) VALUES
-- Свежая рыба
('Семга свежая', 'Свежая норвежская семга, богатая омега-3. Идеальна для стейков и суши.', 1200, 1400, (SELECT id FROM categories WHERE name = 'Свежая рыба'), 15, 1.0, 'кг', true, true, 'SALMON-001', 1),

('Дорадо целая', 'Средиземноморская дорадо, нежное белое мясо. Отлично для запекания.', 800, NULL, (SELECT id FROM categories WHERE name = 'Свежая рыба'), 12, 0.4, 'шт', false, true, 'DORADO-001', 2),

('Тунец стейк', 'Премиальные стейки желтоперого тунца. Для гриля и татаки.', 2200, 2500, (SELECT id FROM categories WHERE name = 'Свежая рыба'), 8, 0.2, 'кг', true, true, 'TUNA-001', 3),

-- Морепродукты
('Камчатский краб', 'Варено-мороженые ножки камчатского краба. Деликатес высшего класса.', 4500, NULL, (SELECT id FROM categories WHERE name = 'Морепродукты'), 5, 0.5, 'кг', true, true, 'CRAB-001', 4),

('Креветки тигровые', 'Крупные тигровые креветки. Сладкий вкус и плотная текстура.', 1800, 2000, (SELECT id FROM categories WHERE name = 'Морепродукты'), 20, 0.5, 'кг', false, true, 'SHRIMP-001', 5),

('Мидии черноморские', 'Отборные черноморские мидии в створках. Для классической пасты.', 600, NULL, (SELECT id FROM categories WHERE name = 'Морепродукты'), 25, 1.0, 'кг', false, true, 'MUSSELS-001', 6),

-- Икра и деликатесы
('Икра осетровая', 'Классическая осетровая икра. Традиционный русский деликатес.', 8500, 9000, (SELECT id FROM categories WHERE name = 'Икра и деликатесы'), 3, 0.1, 'банка', true, true, 'CAVIAR-001', 7),

('Икра красная горбуши', 'Икра горбуши первого сорта. Крупные упругие зерна.', 1200, NULL, (SELECT id FROM categories WHERE name = 'Икра и деликатесы'), 10, 0.15, 'банка', false, true, 'CAVIAR-002', 8),

('Копченый лосось', 'Холодного копчения норвежский лосось. Нарезка для бутербродов.', 1800, NULL, (SELECT id FROM categories WHERE name = 'Икра и деликатесы'), 7, 0.2, 'упаковка', false, true, 'SALMON-002', 9);

-- 3. Добавляем изображения для товаров
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
SELECT 
  p.id,
  image_data.image_url,
  image_data.alt_text,
  true,
  1
FROM products p
CROSS JOIN (VALUES
  ('SALMON-001', '/images/products/crayfish-1.svg', 'Семга свежая'),
  ('DORADO-001', '/images/products/crayfish-2.svg', 'Дорадо целая'),
  ('TUNA-001', '/images/products/crayfish-3.svg', 'Тунец стейк'),
  ('CRAB-001', '/images/products/crab-1.svg', 'Камчатский краб'),
  ('SHRIMP-001', '/images/products/shrimp-1.svg', 'Креветки тигровые'),
  ('MUSSELS-001', '/images/products/langostino-1.svg', 'Мидии черноморские'),
  ('CAVIAR-001', '/images/products/crab-2.svg', 'Икра осетровая'),
  ('CAVIAR-002', '/images/products/shrimp-2.svg', 'Икра красная горбуши'),
  ('SALMON-002', '/images/products/langostino-2.svg', 'Копченый лосось')
) AS image_data(sku, image_url, alt_text)
WHERE p.sku = image_data.sku;

-- 4. Проверяем что добавилось (результат отобразится внизу)
SELECT 
  p.name as "Название товара",
  p.price as "Цена",
  c.name as "Категория",
  p.stock_quantity as "Остаток",
  CASE WHEN p.is_featured THEN 'Да' ELSE 'Нет' END as "Рекомендуемый"
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.sort_order;

-- ======================================
-- ГОТОВО! Если видите товары выше - все работает
-- ======================================
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

-- 2. Добавляем товары (получаем ID категорий динамически)
WITH category_ids AS (
  SELECT 
    (SELECT id FROM categories WHERE name = 'Свежая рыба') as fresh_fish_id,
    (SELECT id FROM categories WHERE name = 'Морепродукты') as seafood_id,
    (SELECT id FROM categories WHERE name = 'Икра и деликатесы') as caviar_id
)
INSERT INTO products (name, description, price, old_price, category_id, stock_quantity, weight, unit, is_featured, is_active, sku, sort_order)
SELECT * FROM category_ids, (VALUES
  ('Семга свежая', 'Свежая норвежская семга, богатая омега-3. Идеальна для стейков и суши.', 1200, 1400, fresh_fish_id, 15, 1.0, 'кг', true, true, 'SALMON-001', 1),
  
  ('Дорадо целая', 'Средиземноморская дорадо, нежное белое мясо. Отлично для запекания.', 800, NULL, fresh_fish_id, 12, 0.4, 'шт', false, true, 'DORADO-001', 2),
  
  ('Тунец стейк', 'Премиальные стейки желтоперого тунца. Для гриля и татаки.', 2200, 2500, fresh_fish_id, 8, 0.2, 'кг', true, true, 'TUNA-001', 3),
  
  ('Камчатский краб', 'Варено-мороженые ножки камчатского краба. Деликатес высшего класса.', 4500, NULL, seafood_id, 5, 0.5, 'кг', true, true, 'CRAB-001', 4),
  
  ('Креветки тигровые', 'Крупные тигровые креветки. Сладкий вкус и плотная текстура.', 1800, 2000, seafood_id, 20, 0.5, 'кг', false, true, 'SHRIMP-001', 5),
  
  ('Мидии черноморские', 'Отборные черноморские мидии в створках. Для классической пасты.', 600, NULL, seafood_id, 25, 1.0, 'кг', false, true, 'MUSSELS-001', 6),
  
  ('Икра осетровая', 'Классическая осетровая икра. Традиционный русский деликатес.', 8500, 9000, caviar_id, 3, 0.1, 'банка', true, true, 'CAVIAR-001', 7),
  
  ('Икра красная горбуши', 'Икра горбуши первого сорта. Крупные упругие зерна.', 1200, NULL, caviar_id, 10, 0.15, 'банка', false, true, 'CAVIAR-002', 8),
  
  ('Копченый лосось', 'Холодного копчения норвежский лосось. Нарезка для бутербродов.', 1800, NULL, caviar_id, 7, 0.2, 'упаковка', false, true, 'SALMON-002', 9)
) AS t(name, description, price, old_price, category_id, stock_quantity, weight, unit, is_featured, is_active, sku, sort_order);

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
  ('SALMON-001', '/images/salmon.jpg', 'Семга свежая'),
  ('DORADO-001', '/images/dorado.jpg', 'Дорадо целая'),
  ('TUNA-001', '/images/tuna.jpg', 'Тунец стейк'),
  ('CRAB-001', '/images/crab.jpg', 'Камчатский краб'),
  ('SHRIMP-001', '/images/shrimp.jpg', 'Креветки тигровые'),
  ('MUSSELS-001', '/images/mussels.jpg', 'Мидии черноморские'),
  ('CAVIAR-001', '/images/caviar-black.jpg', 'Икра осетровая'),
  ('CAVIAR-002', '/images/caviar-red.jpg', 'Икра красная горбуши'),
  ('SALMON-002', '/images/smoked-salmon.jpg', 'Копченый лосось')
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
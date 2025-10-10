-- Добавляем реальные товары из основного сайта в базу данных

-- Сначала добавляем категории
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Свежая рыба', 'fresh-fish', 'Свежевыловленная рыба высшего качества', 1),
('Морепродукты', 'seafood', 'Креветки, мидии, кальмары и другие морепродукты', 2),
('Икра и деликатесы', 'caviar', 'Деликатесная икра и рыбные деликатесы', 3)
ON CONFLICT (name) DO NOTHING;

-- Добавляем товары (получаем ID категорий динамически)
WITH category_ids AS (
  SELECT 
    (SELECT id FROM categories WHERE slug = 'fresh-fish') as fresh_fish_id,
    (SELECT id FROM categories WHERE slug = 'seafood') as seafood_id,
    (SELECT id FROM categories WHERE slug = 'caviar') as caviar_id
)
INSERT INTO products (name, description, price, old_price, category_id, stock_quantity, weight, unit, is_featured, is_active, image_url, sku, sort_order)
SELECT * FROM category_ids, (VALUES
  ('Семга свежая', 'Свежая норвежская семга, богатая омега-3. Идеальна для стейков и суши.', 1200, 1400, fresh_fish_id, 15, 1.0, 'кг', true, true, '/images/salmon.jpg', 'SALMON-001', 1),
  
  ('Дорадо целая', 'Средиземноморская дорадо, нежное белое мясо. Отлично для запекания.', 800, NULL, fresh_fish_id, 12, 0.4, 'шт', false, true, '/images/dorado.jpg', 'DORADO-001', 2),
  
  ('Тунец стейк', 'Премиальные стейки желтоперого тунца. Для гриля и татаки.', 2200, 2500, fresh_fish_id, 8, 0.2, 'кг', true, true, '/images/tuna.jpg', 'TUNA-001', 3),
  
  ('Камчатский краб', 'Варено-мороженые ножки камчатского краба. Деликатес высшего класса.', 4500, NULL, seafood_id, 5, 0.5, 'кг', true, true, '/images/crab.jpg', 'CRAB-001', 4),
  
  ('Креветки тигровые', 'Крупные тигровые креветки. Сладкий вкус и плотная текстура.', 1800, 2000, seafood_id, 20, 0.5, 'кг', false, true, '/images/shrimp.jpg', 'SHRIMP-001', 5),
  
  ('Мидии черноморские', 'Отборные черноморские мидии в створках. Для классической пасты.', 600, NULL, seafood_id, 25, 1.0, 'кг', false, true, '/images/mussels.jpg', 'MUSSELS-001', 6),
  
  ('Икра осетровая', 'Классическая осетровая икра. Традиционный русский деликатес.', 8500, 9000, caviar_id, 3, 0.1, 'банка', true, true, '/images/caviar-black.jpg', 'CAVIAR-001', 7),
  
  ('Икра красная горбуши', 'Икра горбуши первого сорта. Крупные упругие зерна.', 1200, NULL, caviar_id, 10, 0.15, 'банка', false, true, '/images/caviar-red.jpg', 'CAVIAR-002', 8),
  
  ('Копченый лосось', 'Холодного копчения норвежский лосось. Нарезка для бутербродов.', 1800, NULL, caviar_id, 7, 0.2, 'упаковка', false, true, '/images/smoked-salmon.jpg', 'SALMON-002', 9)
) AS t(name, description, price, old_price, category_id, stock_quantity, weight, unit, is_featured, is_active, image_url, sku, sort_order);

-- Проверяем что добавилось
SELECT 
  p.name,
  p.price,
  c.name as category,
  p.stock_quantity,
  p.is_featured
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.sort_order;
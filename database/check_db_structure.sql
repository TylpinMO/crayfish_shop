-- Проверка текущей структуры базы данных

-- 1. Проверяем структуру таблицы product_images
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;

-- 2. Проверяем существующие данные в product_images
SELECT 
  id,
  product_id,
  image_url,
  alt_text,
  is_primary,
  -- Новые поля (могут быть NULL если миграция не применена)
  storage_bucket,
  storage_path,
  public_url,
  mime_type,
  file_size
FROM product_images 
LIMIT 5;

-- 3. Проверяем общее количество записей
SELECT 
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM product_images) as total_images,
  (SELECT COUNT(*) FROM categories) as total_categories;

-- 4. Проверяем товары с изображениями
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock_quantity,
  COUNT(pi.id) as images_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name, p.price, p.stock_quantity
ORDER BY p.name
LIMIT 10;

-- 5. Проверяем индексы
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('products', 'product_images', 'categories')
ORDER BY tablename, indexname;
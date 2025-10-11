-- ПРОСТАЯ МИГРАЦИЯ для исправления проблем с товарами

-- 1. Добавляем новые колонки в product_images
ALTER TABLE product_images 
ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR(100) DEFAULT 'product-images',
ADD COLUMN IF NOT EXISTS storage_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS public_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- 2. Заполняем новые поля данными из существующих
UPDATE product_images 
SET 
  storage_bucket = 'product-images',
  public_url = image_url,
  mime_type = CASE 
    WHEN image_url LIKE '%.jpg' OR image_url LIKE '%.jpeg' THEN 'image/jpeg'
    WHEN image_url LIKE '%.png' THEN 'image/png'
    WHEN image_url LIKE '%.svg' THEN 'image/svg+xml'
    ELSE 'image/jpeg'
  END
WHERE storage_bucket IS NULL OR public_url IS NULL;

-- 3. Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_product_images_storage_path ON product_images(storage_path);
CREATE INDEX IF NOT EXISTS idx_product_images_bucket ON product_images(storage_bucket);

-- 4. Проверяем результат
SELECT 'Migration completed. Check the results:' as status;
SELECT COUNT(*) as total_images, 
       COUNT(public_url) as images_with_public_url,
       COUNT(storage_bucket) as images_with_bucket
FROM product_images;
-- ============================================
-- ОБНОВЛЕНИЕ СХЕМЫ БД ДЛЯ SUPABASE STORAGE
-- ============================================
-- Скопируйте и выполните в Supabase SQL Editor

-- 1. Создаем bucket для хранения изображений
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- 2. Настраиваем политики доступа для публичного просмотра
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- 3. Разрешаем админам загружать изображения
CREATE POLICY "Enable insert for authenticated users" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 4. Разрешаем админам обновлять изображения
CREATE POLICY "Enable update for authenticated users" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 5. Разрешаем админам удалять изображения
CREATE POLICY "Enable delete for authenticated users" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ============================================
-- ОБНОВЛЯЕМ СТРУКТУРУ ТАБЛИЦЫ ИЗОБРАЖЕНИЙ
-- ============================================

-- Добавляем новые поля для Supabase Storage
ALTER TABLE product_images 
ADD COLUMN storage_bucket TEXT DEFAULT 'product-images',
ADD COLUMN storage_path TEXT,
ADD COLUMN file_size INTEGER,
ADD COLUMN mime_type TEXT,
ADD COLUMN public_url TEXT;

-- Создаем функцию для генерации публичных URL
CREATE OR REPLACE FUNCTION generate_storage_url(bucket_id TEXT, path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN format('%s/storage/v1/object/public/%s/%s', 
                  current_setting('app.supabase_url'), 
                  bucket_id, 
                  path);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления public_url
CREATE OR REPLACE FUNCTION update_image_public_url()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.storage_path IS NOT NULL THEN
        NEW.public_url := generate_storage_url(NEW.storage_bucket, NEW.storage_path);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_image_url
    BEFORE INSERT OR UPDATE ON product_images
    FOR EACH ROW EXECUTE FUNCTION update_image_public_url();

-- ============================================
-- СОЗДАЕМ PLACEHOLDER ИЗОБРАЖЕНИЯ В SUPABASE STORAGE
-- ============================================

-- Сначала нужно загрузить placeholder изображения в bucket 'product-images'
-- Это можно сделать через Supabase Dashboard или API

-- ============================================
-- ОБНОВЛЯЕМ ДАННЫЕ С КОРРЕКТНЫМИ ПУТЯМИ
-- ============================================

-- Обновляем существующие записи с правильными путями к изображениям
UPDATE product_images SET 
    storage_path = 
        CASE 
            WHEN image_url LIKE '%crayfish-1%' THEN 'products/salmon-001.svg'
            WHEN image_url LIKE '%crayfish-2%' THEN 'products/dorado-001.svg'
            WHEN image_url LIKE '%crayfish-3%' THEN 'products/tuna-001.svg'
            WHEN image_url LIKE '%crab-1%' THEN 'products/crab-001.svg'
            WHEN image_url LIKE '%crab-2%' THEN 'products/caviar-001.svg'
            WHEN image_url LIKE '%shrimp-1%' THEN 'products/shrimp-001.svg'
            WHEN image_url LIKE '%shrimp-2%' THEN 'products/caviar-002.svg'
            WHEN image_url LIKE '%langostino-1%' THEN 'products/mussels-001.svg'
            WHEN image_url LIKE '%langostino-2%' THEN 'products/squid-001.svg'
            ELSE 'placeholders/fish-placeholder.svg'
        END,
    mime_type = 'image/svg+xml',
    file_size = 2048;

-- ============================================
-- ПРОВЕРЯЕМ РЕЗУЛЬТАТ
-- ============================================
SELECT 
    pi.id,
    p.name as product_name,
    pi.storage_path,
    pi.public_url,
    pi.mime_type
FROM product_images pi
JOIN products p ON pi.product_id = p.id
ORDER BY p.sort_order;

-- ============================================
-- ГОТОВО!
-- ============================================
-- ✅ Bucket создан для хранения изображений
-- ✅ Политики безопасности настроены
-- ✅ Автоматическая генерация публичных URL
-- ✅ Placeholder изображения настроены
-- ============================================
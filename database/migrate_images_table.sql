-- Migration: Update product_images table for Vercel deployment
-- Add new columns for Supabase Storage integration

-- Add new columns to product_images table
ALTER TABLE product_images 
ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR(100) DEFAULT 'product-images',
ADD COLUMN IF NOT EXISTS storage_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS public_url VARCHAR(1000),
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Update existing records to populate new fields
UPDATE product_images 
SET 
  storage_bucket = 'product-images',
  storage_path = CASE 
    WHEN image_url LIKE 'images/%' THEN SUBSTRING(image_url FROM 8)
    WHEN image_url LIKE '%/images/%' THEN SUBSTRING(image_url FROM POSITION('/images/' IN image_url) + 8)
    ELSE image_url 
  END,
  public_url = image_url,
  mime_type = CASE 
    WHEN image_url LIKE '%.jpg' OR image_url LIKE '%.jpeg' THEN 'image/jpeg'
    WHEN image_url LIKE '%.png' THEN 'image/png'
    WHEN image_url LIKE '%.webp' THEN 'image/webp'
    WHEN image_url LIKE '%.svg' THEN 'image/svg+xml'
    ELSE 'image/jpeg'
  END
WHERE storage_path IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_images_storage_path ON product_images(storage_path);
CREATE INDEX IF NOT EXISTS idx_product_images_bucket ON product_images(storage_bucket);

-- Show updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'product_images' 
ORDER BY ordinal_position;
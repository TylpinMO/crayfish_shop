-- Обновление изображений товаров на реальные URL
-- Выполните этот скрипт в Supabase SQL Editor для обновления изображений

-- Обновляем изображения для рыбы
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop' WHERE id = 1;
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1582450871519-2592d30b73a1?w=300&h=200&fit=crop' WHERE id = 2;
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300&h=200&fit=crop' WHERE id = 3;
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1574781330855-d0db10d40e41?w=300&h=200&fit=crop' WHERE id = 4;

-- Обновляем изображения для раков  
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565373914432-7d5aa5d2ca9c?w=300&h=200&fit=crop' WHERE id = 5;
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=200&fit=crop' WHERE id = 6;
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=300&h=200&fit=crop' WHERE id = 7;

-- Обновляем изображения для сыров
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop' WHERE id = 8;
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=300&h=200&fit=crop' WHERE id = 9;
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=300&h=200&fit=crop' WHERE id = 10;
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1559564484-0b37f1de8c80?w=300&h=200&fit=crop' WHERE id = 11;

-- Проверяем результат
SELECT id, name, image_url FROM products ORDER BY id;
-- SQL запросы для настройки Fish Shop Admin Panel
-- ⚠️ КОПИРУЙТЕ КАЖДЫЙ ЗАПРОС ОТДЕЛЬНО БЕЗ ЭТИХ КОММЕНТАРИЕВ

-- 1. СОЗДАНИЕ ПЕРВОГО АДМИН-ПОЛЬЗОВАТЕЛЯ
-- Замените YOUR_HASH_HERE на хеш от https://bcrypt-generator.com/ (rounds: 12)

INSERT INTO admin_users (email, password_hash, full_name, role, created_at)
VALUES (
    'admin@fishShop.local',
    'YOUR_HASH_HERE',
    'Администратор',
    'admin',
    NOW()
);

-- 2. ПРОВЕРКА СОЗДАНИЯ АДМИНА
-- Выполните для проверки:

SELECT email, full_name, role, created_at FROM admin_users;

-- 3. СОЗДАНИЕ НОВОГО АДМИНА (если забыли пароль)
-- Хеш для пароля "newadmin123": $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeL5BdcKUaWLKjHNu

INSERT INTO admin_users (email, password_hash, full_name, role, created_at)
VALUES (
    'newadmin@fishShop.local',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeL5BdcKUaWLKjHNu',
    'Новый Админ',
    'admin',
    NOW()
);

-- 4. ДОБАВЛЕНИЕ ДЕМО ТОВАРОВ (опционально)

INSERT INTO categories (name, slug, description) VALUES
('Свежая рыба', 'fresh-fish', 'Свежевыловленная рыба'),
('Морепродукты', 'seafood', 'Креветки, мидии, кальмары'),
('Икра', 'caviar', 'Деликатесная икра');

INSERT INTO products (name, slug, description, price, category_id, image_url, in_stock, created_at) VALUES
('Семга свежая', 'salmon-fresh', 'Свежая семга, 1 кг', 1200, 1, '/images/salmon.jpg', true, NOW()),
('Креветки королевские', 'king-prawns', 'Королевские креветки, 500г', 800, 2, '/images/prawns.jpg', true, NOW()),
('Икра красная', 'red-caviar', 'Икра горбуши, 100г', 450, 3, '/images/caviar.jpg', true, NOW());

-- ГОТОВО! Теперь у вас есть админ и демо товары
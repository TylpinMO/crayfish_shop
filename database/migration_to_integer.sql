-- Миграция с UUID на INTEGER ID - ПОЛНАЯ ЗАМЕНА СТРУКТУРЫ
-- ВНИМАНИЕ: Этот скрипт УДАЛИТ все существующие данные!
-- Сделайте резервную копию важных данных перед выполнением

-- 1. Удаляем все существующие таблицы в правильном порядке (учитывая внешние ключи)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 2. Удаляем функции если они существуют
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Удаляем расширение UUID если оно не используется другими таблицами
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- 4. Создаем новые таблицы с INTEGER ID

-- Категории товаров
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Товары
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500), -- Одно изображение на товар
    stock_quantity INTEGER DEFAULT 0,
    weight DECIMAL(8,2), -- Вес товара
    unit VARCHAR(20) DEFAULT 'шт', -- кг, шт, упак
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false, -- Рекомендуемые товары
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Администраторы
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Индексы для производительности
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_categories_active ON categories(is_active);

-- 6. Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Настройка Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Политики RLS для публичного доступа к товарам
CREATE POLICY "Public can read active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active products" ON products
    FOR SELECT USING (is_active = true);

-- Политики RLS для админов (только через service key)
CREATE POLICY "Service role can manage categories" ON categories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage products" ON products
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage admin_users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');

-- 9. Базовые категории
INSERT INTO categories (name, description, sort_order) VALUES
('Рыба', 'Свежая и копченая рыба', 1),
('Рак', 'Речные раки живые и вареные', 2),
('Сыр', 'Сыры различных сортов', 3);

-- 10. Создание админа по умолчанию
-- Пароль: admin123 (хеш сгенерирован с bcrypt, rounds=12)
INSERT INTO admin_users (email, password_hash, full_name, role, is_active) VALUES
('admin@fish-shop.ru', '$2a$12$rGOEKO8Qj8VKjJXRYF.vXOc8nHp1qHG2.tYrXKYQXzqHxP2RbYUMO', 'Администратор', 'admin', true);

-- 11. Комментарии к таблицам
COMMENT ON TABLE categories IS 'Категории товаров';
COMMENT ON TABLE products IS 'Товары интернет-магазина';
COMMENT ON TABLE admin_users IS 'Администраторы системы';

COMMENT ON COLUMN products.price IS 'Цена за единицу товара';
COMMENT ON COLUMN products.weight IS 'Вес товара в кг';
COMMENT ON COLUMN products.unit IS 'Единица измерения: кг, шт, упак';
COMMENT ON COLUMN products.image_url IS 'URL изображения товара';
COMMENT ON COLUMN admin_users.password_hash IS 'Хеш пароля (bcrypt)';

-- 12. Проверяем результат
SELECT 'Миграция завершена!' as status;
SELECT 'Созданные категории:' as info;
SELECT id, name, description FROM categories ORDER BY sort_order;
SELECT 'Создан админ:' as admin_info;
SELECT id, email, full_name, role, is_active FROM admin_users;
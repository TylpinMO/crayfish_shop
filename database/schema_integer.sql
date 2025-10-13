-- Новая схема БД с INTEGER ID (упрощенная версия для интернет-магазина)
-- Использовать вместо schema.sql

-- 1. Категории товаров
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Товары
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

-- 3. Индексы для производительности
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_categories_active ON categories(is_active);

-- 4. Триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Базовые категории
INSERT INTO categories (name, description, sort_order) VALUES
('Рыба', 'Свежая и копченая рыба', 1),
('Рак', 'Речные раки живые и вареные', 2),
('Сыр', 'Сыры различных сортов', 3);

-- 6. Комментарии к таблицам
COMMENT ON TABLE categories IS 'Категории товаров';
COMMENT ON TABLE products IS 'Товары интернет-магазина';

COMMENT ON COLUMN products.price IS 'Цена за единицу товара';
COMMENT ON COLUMN products.weight IS 'Вес товара в кг';
COMMENT ON COLUMN products.unit IS 'Единица измерения: кг, шт, упак';
COMMENT ON COLUMN products.image_url IS 'URL изображения товара';
-- Утилита для создания нового администратора
-- Замените данные на нужные и выполните в SQL Editor

-- ИНСТРУКЦИЯ:
-- 1. Замените 'your_email@example.com' на реальный email
-- 2. Сгенерируйте хеш пароля через Node.js:
--    node -e "console.log(require('bcryptjs').hashSync('ваш_пароль', 12))"
-- 3. Замените password_hash на полученный хеш
-- 4. Выполните INSERT

INSERT INTO admin_users (email, password_hash, full_name, role, is_active) VALUES
('your_email@example.com', 'сюда_хеш_пароля', 'Имя Администратора', 'admin', true);

-- Пример генерации хеша в Node.js:
-- const bcrypt = require('bcryptjs');
-- const password = 'your_password';
-- const hash = bcrypt.hashSync(password, 12);
-- console.log('Хеш пароля:', hash);

-- Готовые хеши для тестирования:
-- admin123 = $2a$12$rGOEKO8Qj8VKjJXRYF.vXOc8nHp1qHG2.tYrXKYQXzqHxP2RbYUMO
-- password = $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewThizOLE9qjX6Q.

-- Проверка созданных админов:
SELECT id, email, full_name, role, is_active, created_at FROM admin_users ORDER BY created_at;
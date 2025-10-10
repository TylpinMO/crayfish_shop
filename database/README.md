# 🗄️ Работа с базой данных

## 📁 Файлы базы данных

- **`schema.sql`** - Полная схема базы данных (таблицы, индексы, RLS)
- **`sample_products.sql`** - Добавление тестовых данных (безопасно)
- **`reset_and_populate.sql`** - ⚠️ ПОЛНАЯ перезагрузка БД с данными

## 🚀 Быстрый старт

### 1. Первоначальная настройка БД

```sql
-- В Supabase SQL Editor выполните по порядку:
-- 1. Создайте схему
\i schema.sql

-- 2. Добавьте тестовые данные
\i sample_products.sql
```

### 2. Полная перезагрузка БД (осторожно!)

```sql
-- ⚠️ УДАЛИТ ВСЕ ДАННЫЕ!
\i reset_and_populate.sql
```

## 📊 Структура данных

### Категории (3 шт.)

- **Свежая рыба** - семга, дорадо, тунец, лосось
- **Морепродукты** - краб, креветки, мидии, кальмары
- **Икра и деликатесы** - икра, копчености, балык

### Товары (12 шт.)

- ✅ Корректные цены и остатки
- ✅ Подробные описания
- ✅ Правильные пути к изображениям
- ✅ Хиты продаж помечены

### Админ-пользователь

- **Email:** `admin@fish-shop.ru`
- **Пароль:** `admin123`
- **Роль:** admin

## 🔧 Проверка данных

После выполнения скриптов проверьте:

```sql
-- Количество товаров по категориям
SELECT
  c.name as category,
  COUNT(p.id) as products_count,
  COUNT(CASE WHEN p.is_featured THEN 1 END) as featured_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;

-- Товары с низким остатком (≤5)
SELECT name, stock_quantity
FROM products
WHERE stock_quantity <= 5
ORDER BY stock_quantity;

-- Проверка изображений
SELECT p.name, pi.image_url
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
ORDER BY p.sort_order;
```

## 🛡️ Безопасность

- Row Level Security (RLS) включен
- Админ-данные хешированы bcrypt
- API использует service key только на сервере
- Клиент не имеет прямого доступа к БД

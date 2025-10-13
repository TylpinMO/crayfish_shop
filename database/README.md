# 🗄️ База данных

Файлы для настройки базы данных Supabase с INTEGER ID структурой:

## 📁 Файлы миграции

- **`migration_to_integer.sql`** - **ОСНОВНОЙ ФАЙЛ** - полная миграция с UUID на INTEGER
- **`schema_integer.sql`** - схема новой структуры (для справки)
- **`seed_integer.sql`** - тестовые данные для новой структуры

## 🚀 Инструкция по применению

### 1. Миграция базы данных
Выполните в Supabase SQL Editor:
```sql
-- Скопируйте и выполните содержимое файла migration_to_integer.sql
-- ⚠️ ВНИМАНИЕ: Удалит все существующие данные!
```

### 2. Добавление тестовых данных
После миграции выполните:
```sql
-- Скопируйте и выполните содержимое файла seed_integer.sql
```

## 📊 Новая структура

### Категории (3 шт.)

### ✨ Преимущества INTEGER структуры:
- Упрощенная INTEGER ID схема вместо сложных UUID
- Категории: "Рыба", "Рак", "Сыр"  
- Одно изображение на товар (image_url)
- Без сложных связей и избыточных таблиц
- Быстрая работа API и простое управление

### 🗂️ Таблицы:
- `categories` - категории товаров
- `products` - товары с привязкой к категориям

## 🔧 Проверка данных

После выполнения миграции проверьте:

```sql
-- Количество товаров по категориям
SELECT
  c.name as category,
  COUNT(p.id) as products_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;

-- Все товары с категориями
SELECT p.name, c.name as category, p.price, p.image_url
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c.sort_order, p.name;
```

## � Статус миграции:
- ✅ API обновлен для INTEGER структуры
- ✅ Фронтенд готов для новой схемы  
- ✅ Админ-панель адаптирована
- 🔄 **Следующий шаг**: выполнить migration_to_integer.sql в Supabase

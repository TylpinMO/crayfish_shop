# 🔐 Admin Panel Setup

## Безопасная настройка Supabase

### 1. Создайте проект в Supabase

1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь инициализации (2-3 минуты)

### 2. Выполните SQL схему

1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте содержимое файла `../database/schema.sql`
3. Выполните SQL для создания таблиц

### 3. Настройте Authentication

1. В Supabase Dashboard: **Authentication > Settings**
2. Добавьте URL сайта в **Site URL**: `https://your-domain.com/admin/`
3. В **Redirect URLs** добавьте: `https://your-domain.com/admin/`

### 4. Создайте конфигурационный файл

```bash
# Скопируйте example файл
cp supabase-config.example.js supabase-config.js
```

### 5. Добавьте реальные данные в supabase-config.js

Найдите в Supabase Dashboard:

- **Settings > API**: URL и anon key
- Замените плейсхолдеры в `supabase-config.js`

### 6. Создайте тестового администратора

В Supabase Dashboard:

1. **Authentication > Users**
2. **Add user manually**
3. Email: `admin@demo.com`
4. Password: `demo123`
5. **Confirm email**: включить

## 🛡️ Безопасность

- ✅ `supabase-config.js` в .gitignore
- ✅ Только example файл в Git
- ✅ RLS (Row Level Security) включен
- ✅ Anon key безопасен для клиента (только чтение)
- ✅ Реальные операции через Auth токены

## 🚀 Запуск

После настройки откройте `admin/index.html`

**Логин для демо**: admin@demo.com / demo123

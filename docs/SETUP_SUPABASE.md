# Настройка Supabase для Fish Shop Admin Panel

## 1. Создание проекта Supabase

### Шаг 1: Регистрация

1. Идите на https://supabase.com
2. Нажмите "Start your project"
3. Войдите через GitHub (рекомендуется)

### Шаг 2: Создание проекта

1. Нажмите "New Project"
2. Выберите организацию (или создайте новую)
3. Заполните данные проекта:
   - **Name**: `fish-shop-admin`
   - **Database Password**: Создайте надежный пароль (СОХРАНИТЕ ЕГО!)
   - **Region**: Europe (closest to you)
   - **Pricing Plan**: Free (для начала)

### Шаг 3: Получение ключей API

После создания проекта:

1. Перейдите в **Settings** → **API**
2. Найдите два ключа:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: НЕ ИСПОЛЬЗУЕМ (небезопасно для админки)
   - **service_role**: ВОТ ЭТОТ КЛЮЧ НУЖЕН! (начинается с `eyJ...`)

⚠️ **ВАЖНО**: Service Role Key имеет полные права администратора!

## 2. Настройка базы данных

### Шаг 1: Создание таблиц

1. В Supabase перейдите в **SQL Editor**
2. Скопируйте содержимое файла `database/schema.sql`
3. Вставьте в редактор и нажмите **Run**

### Шаг 2: Создание админ-пользователя

Выполните этот SQL запрос в SQL Editor:

```sql
-- Создание первого админ-пользователя
INSERT INTO admin_users (username, email, password_hash, role, created_at)
VALUES (
    'admin',
    'admin@fishShop.local',
    '$2b$12$your_hashed_password_here', -- Замените на хеш от вашего пароля
    'super_admin',
    NOW()
);
```

**Для создания хеша пароля**:

1. Идите на https://bcrypt-generator.com/
2. Введите ваш пароль (например: `admin123`)
3. Установите Rounds: 12
4. Скопируйте получившийся хеш

## 3. Получение других токенов

### DaData API (для автодополнения адресов)

1. Идите на https://dadata.ru/api/
2. Регистрируйтесь
3. В личном кабинете найдите "API ключ"
4. Скопируйте токен

### JWT Secret (для админской авторизации)

Сгенерируйте случайную строку:

```bash
# Вариант 1: В терминале (Mac/Linux)
openssl rand -base64 32

# Вариант 2: Онлайн генератор
# https://generate-secret.now.sh/32
```

## 4. Что в итоге нужно сохранить:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJ... (длинный ключ service_role)
JWT_SECRET=ваш_сгенерированный_секрет
DADATA_TOKEN=ваш_токен_dadata (опционально)
```

## Следующий шаг: Настройка в Netlify

См. файл `SETUP_NETLIFY.md`

# Настройка Netlify для Fish Shop

## 1. Подготовка к деплою

### Шаг 1: Создание GitHub репозитория

1. Идите на GitHub.com
2. Создайте новый репозиторий:
   - **Name**: `fish-shop` (или любое имя)
   - **Visibility**: Public или Private
   - НЕ добавляйте README, .gitignore, license (у нас уже есть)

### Шаг 2: Связывание с локальным проектом

В терминале в папке проекта выполните:

```bash
# Добавляем все файлы
git add .

# Делаем первый коммит
git commit -m "🚀 Initial commit: Fish Shop with secure admin panel"

# Добавляем remote репозиторий (замените YOUR_USERNAME и YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Пушим код
git push -u origin main
```

## 2. Настройка Netlify

### Шаг 1: Создание сайта

1. Идите на https://netlify.com
2. Войдите через GitHub
3. Нажмите "Add new site" → "Import an existing project"
4. Выберите "Deploy with GitHub"
5. Найдите и выберите ваш репозиторий `fish-shop`

### Шаг 2: Настройки деплоя

- **Branch to deploy**: `main`
- **Build command**: пустое (у нас статический HTML)
- **Publish directory**: `/` (корень проекта)

### Шаг 3: Добавление переменных окружения

После создания сайта:

1. Перейдите в **Site settings** → **Environment variables**
2. Добавьте переменные одну за одной:

```
SUPABASE_URL = https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY = eyJ...ваш_service_role_ключ
JWT_SECRET = ваш_сгенерированный_jwt_секрет
DADATA_TOKEN = ваш_dadata_токен (опционально)
NODE_ENV = production
```

⚠️ **КРИТИЧНО**: Эти переменные будут доступны только серверным функциям!

## 3. Проверка деплоя

### Основной сайт

1. Откройте ваш Netlify URL (например: `https://amazing-fish-shop-123456.netlify.app`)
2. Проверьте что сайт загружается
3. Протестируйте корзину

### Админ панель

1. Перейдите на `/admin/` (например: `https://amazing-fish-shop-123456.netlify.app/admin/`)
2. Должна открыться форма входа
3. Используйте данные админа из базы данных

## 4. Первый вход в админку

### Учетные данные по умолчанию:

- **Username**: `admin`
- **Password**: тот пароль, от которого вы создали хеш в Supabase

### Если забыли пароль:

Выполните в Supabase SQL Editor:

```sql
-- Создание нового админа с паролем "newpassword123"
INSERT INTO admin_users (username, email, password_hash, role, created_at)
VALUES (
    'newadmin',
    'newadmin@fishShop.local',
    '$2b$12$8VSzOgXbKb.JkOmVmSmRWOAKp9YYpgWGeMoirOFGhf9QepKE7EyXC', -- хеш от "newpassword123"
    'super_admin',
    NOW()
);
```

## 5. Customization

### Изменение имени сайта

1. В Netlify перейдите в **Site settings** → **Site details**
2. Нажмите "Change site name"
3. Введите желаемое имя (например: `my-fish-shop`)

### Подключение домена (опционально)

1. **Site settings** → **Domain management**
2. **Add custom domain**
3. Следуйте инструкциям по настройке DNS

## 6. Troubleshooting

### Функции не работают?

Проверьте:

1. Переменные окружения добавлены в Netlify
2. Файлы функций в папке `netlify/functions/`
3. Логи функций в Netlify Dashboard → Functions

### Админка не авторизует?

1. Проверьте что админ-пользователь создан в Supabase
2. Проверьте переменные `SUPABASE_URL` и `SUPABASE_SERVICE_KEY`
3. Проверьте хеш пароля

### База данных недоступна?

1. Проверьте что схема создана в Supabase
2. Проверьте RLS политики
3. Проверьте service_role ключ

## Готово! 🎉

Ваш Fish Shop с админкой должен работать по адресу:

- **Основной сайт**: `https://your-site-name.netlify.app`
- **Админ панель**: `https://your-site-name.netlify.app/admin/`

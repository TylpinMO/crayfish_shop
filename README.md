# 🐟 Fish Shop - E-commerce на Vercel + Supabase

**Современный интернет-магазин морепродуктов с безопасной админ-панелью**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TylpinMO/crayfish_shop)

## ✨ Возможности

### 🛒 **Для покупателей:**

- Каталог морепродуктов с фильтрацией по категориям
- Корзина покупок с расчетом стоимости
- Адаптивный дизайн для всех устройств
- Быстрая загрузка благодаря CDN Vercel

### 👑 **Для администраторов:**

- Безопасная админ-панель с JWT авторизацией
- Управление товарами и категориями
- Загрузка изображений в Supabase Storage
- Dashboard с аналитикой и статистикой

### 🔧 **Технологический стек:**

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Backend**: Vercel Serverless Functions (Node.js)
- **База данных**: Supabase PostgreSQL
- **Хранилище файлов**: Supabase Storage
- **Авторизация**: JWT токены с bcrypt
- **Развертывание**: Vercel
- **CDN**: Автоматически через Vercel

## 🚀 Быстрый деплой

### 1️⃣ One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TylpinMO/crayfish_shop)

### 2️⃣ Настройка переменных окружения

После деплоя добавьте в Vercel Settings → Environment Variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_random_secret_key
```

### 3️⃣ Настройка базы данных

1. Создайте проект в [Supabase](https://supabase.com)
2. Выполните SQL из `database/reset_and_populate.sql`
3. Настройте Storage из `database/setup_supabase_storage.sql`

### 4️⃣ Проверка работы

- **Сайт**: `https://your-project.vercel.app`
- **Админка**: `https://your-project.vercel.app/admin/`
- **Вход**: `admin@fish-shop.ru` / `admin123`

## 📁 Структура проекта

```
fish-shop/
├── api/                    # Vercel Serverless Functions
│   ├── products.js         # Публичное API товаров
│   ├── admin-auth.js       # Аутентификация админов
│   ├── admin-api.js        # CRUD операции для админов
│   └── upload-image.js     # Загрузка изображений
├── admin/                  # Админ-панель (SPA)
│   ├── index.html          # Интерфейс админки
│   ├── client-api.js       # API клиент для админки
│   ├── client-auth.js      # Авторизация (клиент)
│   ├── admin-ui.js         # UI компоненты
│   └── supabase-uploader.js # Загрузчик файлов
├── js/                     # Клиентский JavaScript
│   ├── app.js              # Главное приложение
│   ├── cart.js             # Корзина покупок
│   └── products.js         # Управление товарами
├── css/ & images/          # Статические ресурсы
├── database/               # SQL скрипты для Supabase
├── index.html              # Главная страница
├── vercel.json             # Конфигурация Vercel
└── package.json            # Зависимости проекта
```

## 🔐 Безопасность

### 🛡️ **Архитектура безопасности:**

- **JWT токены** с истечением срока действия (24 часа)
- **bcrypt** хеширование паролей (10 раундов)
- **Rate limiting** защита от брутфорса (5 попыток / 15 минут)
- **CORS** политики для API endpoints
- **Environment variables** для всех секретных ключей
- **Serverless** изоляция - каждый запрос в отдельном контейнере

### 🔑 **Никаких секретов в браузере:**

- Все API ключи Supabase скрыты в Vercel Functions
- JWT токены генерируются на сервере
- Клиент получает только минимально необходимые данные

## 🎯 API Endpoints

### 📖 **Публичные (без авторизации):**

- `GET /api/products` - получить все активные товары

### 🔒 **Админские (требуют JWT токен):**

- `POST /api/admin-auth` - авторизация администратора
- `GET /api/admin-api?action=dashboard` - статистика
- `GET /api/admin-api?action=products` - список товаров для админки
- `POST /api/admin-api?action=product` - создать товар
- `PUT /api/admin-api?action=product&id=123` - обновить товар
- `DELETE /api/admin-api?action=product&id=123` - удалить товар
- `POST /api/upload-image` - загрузить изображение в Supabase Storage

## 📊 База данных

### **Структура таблиц:**

- `categories` - категории товаров
- `products` - товары с ценами и описаниями
- `product_images` - изображения товаров (Supabase Storage)
- `admin_users` - администраторы с хешированными паролями

### **Пример данных:**

База поставляется с 12 готовыми товарами:

- 4 вида свежей рыбы (семга, дорадо, тунец, лосось)
- 4 вида морепродуктов (краб, креветки, мидии, кальмары)
- 4 вида деликатесов (икра осетровая, икра красная, лосось к/к, балык)

## 🖼️ Изображения

Проект поддерживает **два режима хранения изображений**:

### 1️⃣ **Supabase Storage (рекомендуется):**

- Автоматические публичные URL
- CDN для быстрой загрузки
- Загрузка через админ-панель
- Оптимизация и сжатие

### 2️⃣ **Локальные файлы (резерв):**

- Статические SVG в папке `images/`
- Для демонстрации и разработки

## 🚀 Локальная разработка

```bash
# Клонирование проекта
git clone https://github.com/TylpinMO/crayfish_shop.git
cd fish-shop

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env.local
# Отредактируйте .env.local

# Запуск локального сервера
npm run dev
# или
vercel dev
```

Сайт будет доступен на `http://localhost:3000`

## 📚 Документация

- **Деплой на Vercel**: [`DEPLOY_VERCEL.md`](DEPLOY_VERCEL.md)
- **Миграция с Netlify**: [`VERCEL_MIGRATION.md`](VERCEL_MIGRATION.md)
- **Настройка изображений**: [`STORAGE_SETUP.md`](STORAGE_SETUP.md)
- **Настройка Supabase**: [`docs/SETUP_SUPABASE.md`](docs/SETUP_SUPABASE.md)

## 💰 Стоимость хостинга

### **Vercel Free Plan:**

✅ 100GB bandwidth/месяц  
✅ 1000 deployments/месяц  
✅ 100 serverless function executions/день  
✅ Unlimited static hosting  
✅ Custom domains с SSL

### **Supabase Free Plan:**

✅ 500MB database  
✅ 1GB file storage  
✅ 50,000 monthly active users  
✅ Row Level Security

**Итого: $0/месяц для большинства проектов!** 🎉

## 🆘 Поддержка

### **Частые проблемы:**

**🔧 API не работает?**

1. Проверьте переменные окружения в Vercel
2. Убедитесь что Supabase проект активен
3. Проверьте логи функций в Vercel Dashboard

**🖼️ Изображения не загружаются?**

1. Настройте Supabase Storage по инструкции
2. Проверьте права доступа к bucket
3. Загрузите placeholder изображения

**🔐 Админка не работает?**

1. Проверьте что admin пользователь создан в БД
2. Убедитесь что JWT_SECRET установлен
3. Проверьте что база данных инициализирована

### **Нужна помощь?**

- 📝 Создайте Issue в GitHub
- 📖 Прочитайте документацию в папке `docs/`
- 🔍 Проверьте логи в Vercel Dashboard

---

## 🎯 Идеально для:

- 📚 **Портфолио разработчиков** - демонстрация full-stack навыков
- 🏪 **Стартапов** - быстрый запуск интернет-магазина
- 🎓 **Обучения** - изучение современных веб-технологий
- 🔧 **Прототипирования** - основа для более сложных проектов

**🚀 Готово к продакшену из коробки!**

---

<div align="center">

**Создано с ❤️ для демонстрации современной веб-разработки**

[🌟 Поставить звезду](https://github.com/TylpinMO/crayfish_shop) • [🐛 Сообщить о баге](https://github.com/TylpinMO/crayfish_shop/issues) • [💡 Предложить улучшение](https://github.com/TylpinMO/crayfish_shop/issues)

</div>

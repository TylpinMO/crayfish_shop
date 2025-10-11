# 🚀 Инструкция по деплою на Vercel

## 📋 Быстрый деплой

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TylpinMO/crayfish_shop)

## 🔧 Пошаговая настройка

### 1. Подготовка

1. Зарегистрируйтесь на [Vercel](https://vercel.com) через GitHub
2. Убедитесь что ваш репозиторий загружен на GitHub

### 2. Создание проекта

1. В Vercel Dashboard нажмите **"New Project"**
2. Выберите репозиторий `crayfish_shop`
3. **Framework Preset**: Other
4. **Build Command**: оставьте пустым
5. **Output Directory**: оставьте пустым
6. Нажмите **"Deploy"**

### 3. Настройка переменных окружения

В настройках проекта Vercel:

1. Перейдите в **Settings** → **Environment Variables**
2. Добавьте переменные:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_random_jwt_secret
```

### 4. Redeploy

После добавления переменных:

1. Перейдите в **Deployments**
2. Нажмите на последний деплой
3. Нажмите **"Redeploy"**

## ✅ Проверка работы

### Основной сайт

- Откройте ваш Vercel URL
- Проверьте загрузку товаров
- Протестируйте корзину

### Админ-панель

- Перейдите на `/admin/`
- Войдите: `admin@fish-shop.ru` / `admin123`
- Проверьте dashboard и управление товарами

## 🔗 API Endpoints

Ваши API будут доступны по адресам:

- `https://your-site.vercel.app/api/products`
- `https://your-site.vercel.app/api/admin-auth`
- `https://your-site.vercel.app/api/admin-api`
- `https://your-site.vercel.app/api/upload-image`

## 🐛 Отладка

### Проблемы с API:

1. Проверьте логи функций в Vercel Dashboard → Functions
2. Убедитесь что все переменные окружения добавлены
3. Проверьте что Supabase проект активен

### Проблемы с базой данных:

1. Убедитесь что выполнили SQL из `database/reset_and_populate.sql`
2. Проверьте что Supabase Storage настроен

### Проблемы с изображениями:

1. Настройте Supabase Storage из `STORAGE_SETUP.md`
2. Загрузите placeholder изображения

## 💰 Лимиты Vercel Free

- ✅ 100GB bandwidth/месяц
- ✅ 1000 deployments/месяц
- ✅ 100 serverless function executions/день
- ✅ Unlimited static hosting

**Этого более чем достаточно для большинства проектов!**

## 🔄 Автоматические деплои

Vercel автоматически:

- Деплоит при каждом push в main
- Создает preview deployments для PR
- Поддерживает custom domains
- Предоставляет SSL сертификаты

## 📱 Custom Domain

1. В Vercel Dashboard → Settings → Domains
2. Добавьте ваш домен
3. Настройте DNS записи по инструкции
4. SSL настроится автоматически

---

**🎉 Готово! Ваш Fish Shop работает на Vercel!**

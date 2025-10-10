# 🔐 БЕЗОПАСНАЯ АРХИТЕКТУРА АДМИНКИ

## ❌ ЧТО БЫЛО НЕБЕЗОПАСНО:

```javascript
// ПЛОХО: Ключи в браузере - видны всем!
window.SUPABASE_CONFIG = {
	URL: 'https://real-project.supabase.co',
	ANON_KEY: 'eyJhbGciOiJIUzI1NiIsIn...', // ПУБЛИЧНО!
}
```

## ✅ БЕЗОПАСНАЯ АРХИТЕКТУРА:

### 1. Serverless Functions (Netlify)

- Все ключи Supabase **только на сервере**
- Клиент получает только JWT токены
- API прокси через защищенные функции

### 2. Environment Variables

```bash
# В Netlify Environment Variables:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsI...  # SECRET!
JWT_SECRET=your-super-secret-key
```

### 3. Архитектура безопасности

```
[Браузер]
    ↓ JWT токен
[Netlify Functions]
    ↓ Supabase Service Key
[Supabase Database]
```

## 🚀 DEPLOYMENT НА NETLIFY:

### Environment Variables:

1. `SUPABASE_URL` - URL проекта
2. `SUPABASE_SERVICE_KEY` - Service Role key (НЕ anon!)
3. `JWT_SECRET` - Секрет для JWT токенов

### Безопасность:

- ✅ Ключи скрыты на сервере
- ✅ Клиент видит только JWT
- ✅ Row Level Security в Supabase
- ✅ Валидация токенов на каждом запросе

## 📝 КАК НАСТРОИТЬ:

1. **Создать Supabase проект**
2. **Выполнить SQL из database/schema.sql**
3. **В Netlify добавить Environment Variables**
4. **Деплой - все автоматически!**

## 🎯 РЕЗУЛЬТАТ:

Полностью безопасная админка без утечки ключей!

# ⚡ Быстрый старт - Деплой за 10 минут

## 📋 Чеклист для деплоя

### Перед началом

- [ ] У вас есть аккаунт GitHub
- [ ] Установлен Git на компьютере

### 1. Supabase (3 минуты)

- [ ] Регистрация на https://supabase.com
- [ ] Создать новый проект
- [ ] Скопировать **Project URL** и **service_role key**
- [ ] Выполнить SQL из `database/schema.sql`
- [ ] Создать админ-пользователя (см. `docs/SETUP_SUPABASE.md`)

### 2. GitHub (2 минуты)

- [ ] Создать новый репозиторий
- [ ] Связать с локальной папкой:

```bash
git add .
git commit -m "🚀 Fish Shop initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### 3. Netlify (5 минут)

- [ ] Регистрация на https://netlify.com через GitHub
- [ ] Создать сайт из GitHub репозитория
- [ ] Добавить переменные окружения:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `JWT_SECRET` (сгенерировать на https://generate-secret.now.sh/32)
  - `NODE_ENV=production`

### 4. Тестирование

- [ ] Открыть основной сайт (работает корзина?)
- [ ] Открыть `/admin/` (есть форма входа?)
- [ ] Войти с данными админа

## 🆘 Если что-то не работает

### Сайт не загружается

- Проверьте что код залился на GitHub
- Проверьте логи деплоя в Netlify

### Админка не работает

- Проверьте переменные окружения в Netlify
- Проверьте что схема БД создана в Supabase
- Проверьте логи функций в Netlify → Functions

### Забыли пароль админа

```sql
-- В Supabase SQL Editor создайте нового админа:
INSERT INTO admin_users (username, email, password_hash, role)
VALUES ('admin', 'admin@local', '$2b$12$hash_here', 'super_admin');
```

## 📞 Нужна помощь?

1. Прочитайте полные инструкции в `docs/`
2. Проверьте `SECURITY.md` для понимания архитектуры
3. Посмотрите код в `netlify/functions/` для отладки

---

**После деплоя у вас будет:**

- ✅ Рабочий интернет-магазин с корзиной
- ✅ Безопасная админ-панель
- ✅ База данных в облаке
- ✅ Автоматический деплой при изменениях

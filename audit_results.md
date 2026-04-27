# Глобальний Аудит Системи (VIP.S CARS)
Статус: В процесі 🔄
Дата оновлення: 27.04.2026

---

## 1. Підготовка та База Даних
- [x] 1.1 Створення файлу звіту | ✅ ВИКОНАНО
- [x] 1.2 Аудит структури таблиць Supabase | ✅ ВИКОНАНО
- [x] 1.3 Перевірка RLS (Row Level Security) | ✅ ВИКОНАНО — додано RLS + політики для 8 таблиць: `cars`, `car_images`, `profiles`, `user_favorites`, `user_views`, `subscriptions`, `leads`, `seo_pages`. Застосувати SQL з кінця `supabase_schema.sql` в Supabase SQL Editor.
- [x] 1.4 Функціонал Видалення (БД + Storage) | ✅ ВИКОНАНО — `deleteCar()` в CarsManager: спочатку видаляє файли зі Storage, потім запис з БД (CASCADE)
- [x] 1.5 Global Settings Engine | ✅ ВИКОНАНО — `SiteSettingsContext` + таблиця `site_settings`, Navbar/Footer беруть дані з БД
- [x] 1.6 Status Inconsistency | ✅ ВИКОНАНО — скрізь `'active'` (відповідає DB enum), `CarStatus` тип розширено

## 2. Авторизація та Безпека
- [ ] 2.1 Логіка входу (Admin/User) | ⏳ НЕ ВИКОНАНО
- [ ] 2.2 Telegram Auth (перевірка зв'язків) | ⏳ НЕ ВИКОНАНО
- [x] 2.3 Role Access Control | ✅ ВИКОНАНО — `ProtectedRoute` перевіряє `profiles.role` з БД, `/admin` потребує `role=admin`
- [x] 2.4 Admin Email Hardcode | ✅ ВИКОНАНО — Navbar читає роль з БД (`isAdmin`), email прибрано
- [x] 2.5 User Profile Creation | ✅ ВИКОНАНО — `Login.tsx` робить `upsert` в `profiles` після `signUp`

## 3. Функціонал Подачі Оголошень & Заявок
- [x] 3.1 Форма CarForm (валідація полів) | ✅ ВИКОНАНО
- [x] 3.2 Upload Engine (Storage bucket) | ✅ ВИКОНАНО
- [x] 3.3 Збереження VIN та user_id | ✅ ВИКОНАНО — `onSave` в CarsManager маппить поля форми → схему БД, зберігає `user_id` та `car_images`
- [x] 3.4 Buyback Form Failure | ✅ ВИКОНАНО — виправлено поля (`source_page`, `status:'new'`), фото зберігаються в Storage перед Telegram
- [x] 3.5 VIN Validation Logic | ✅ ВИКОНАНО — CarForm автоматично видаляє I/O/Q, візуальний індикатор довжини

## 4. Клієнтський Кабінет
- [x] 4.1 "Мої авто" (статуси) | ✅ ВИКОНАНО
- [ ] 4.2 Обране та Підписки | ⏳ НЕ ВИКОНАНО

## 5. Адмін Панель
- [x] 5.1 Дашборд (реальна статистика) | ✅ ВИКОНАНО
- [x] 5.2 Модерація (функціонал кнопок) | ✅ ВИКОНАНО — поля виправлено (`brand`, `engine_volume`), `car_images` завантажується, `'revision'`→`'draft'`, `framer-motion`→`motion/react`
- [ ] 5.3 CRM Leads (Kanban logic) | ⏳ НЕ ВИКОНАНО — drag-and-drop статусів не реалізовано
- [ ] 5.4 SEO Менеджер (Робота з базою) | ⏳ НЕ ВИКОНАНО — компонент є, але потребує перевірки CRUD
- [ ] 5.5 Аналітика — графіки захардкоджені | ⏳ НЕ ВИКОНАНО
- [ ] 5.6 AI Менеджер — повна заглушка | ⏳ НЕ ВИКОНАНО (частина майбутнього ТЗ)
- [ ] 5.7 Content Management (Блог, Відгуки) | ⏳ НЕ ВИКОНАНО (частина майбутнього ТЗ)

## 6. Технічна Чистота & SEO
- [x] 6.1 Пошук заглушок | ✅ ВИКОНАНО
- [x] 6.2 Lint & Build check | ✅ ВИКОНАНО
- [x] 6.3 SEO Synchronization | ✅ ВИКОНАНО — `useSeoPage` хук + `ServicePage.tsx` читає з `seo_pages` БД (з fallback на статичні дані)
- [x] 6.4 Sitemap XML | ✅ ВИКОНАНО — `text/xml; charset=utf-8`, fallback `id` для авто без slug, кеш 1 год, додано /reviews та /about
- [ ] 6.5 Auto-SEO Engine | 💡 ПРОПОЗИЦІЯ — не реалізовано
- [ ] 6.6 Image Optimization | ⏳ НЕ ВИКОНАНО — стиснення фото відсутнє
- [x] 6.8 Broken Anchors & Links | ✅ ВИКОНАНО — `id="footer"` та `id="contact"` в Footer, `HashScroller` в App, Footer nav → реальні маршрути, соцмережі → реальні URL
- [ ] 6.9 Search Logic Upgrade | ⏳ НЕ ВИКОНАНО — складні кириличні запити
- [x] 6.10 Favicon & Branding | ✅ ВИКОНАНО — `favicon.svg` створено, `index.html` оновлено

---

## 📋 Додаткові виправлення (не в оригінальному аудиті)
- [x] `NotFoundPage` — `ranked_score` → `ranking_score`
- [x] `ProtectedRoute` — `text-gold-main` → `text-brand-blue`
- [x] `Navbar` — `/services` → `/avtopidbir` і `/vykup`
- [x] `ClientDashboard` — заявки по `profile.phone` (не `user.phone`)
- [x] `CarDetails` — серце синхронізується з `user_favorites` в БД
- [x] `Admin` — вкладки SEO/Аналітика/Медіа/Налаштування підключено
- [x] `Admin` — статуси лідів вирівняно (українські, відповідають БД)
- [x] `Catalog` — `normalizeQuery` перед Supabase-запитом
- [x] `server.ts` — валідація `/api/notify` (розмір, тип)
- [x] `config.ts` — телефон централізовано (10+ файлів)
- [x] `Login.tsx` — `framer-motion` → `motion/react`
- [x] `CarForm.tsx` — `framer-motion` → `motion/react`
- [x] `CarsManager.tsx` — `framer-motion` → `motion/react`
- [x] `ModerationManager.tsx` — `framer-motion` → `motion/react`

---

## ⏳ Залишилось виконати (пріоритет для наступної сесії)

### 🔴 Важливо
2. **4.2** — ClientDashboard: обране та підписки (перевірити синхронізацію)
3. **5.3** — CRM Kanban: збереження статусу при drag-and-drop або зміні в картці
4. **5.4** — SEO Менеджер: перевірити CRUD для `seo_pages` таблиці

### 🟡 Середній пріоритет
5. **2.1** — Логіка входу: розділення Admin/User flow
6. **2.2** — Telegram Auth: перевірка callback і збереження profile
7. **6.6** — Стиснення зображень при завантаженні (sharp / Supabase transform)
8. **6.9** — Пошук: підтримка складних кириличних запитів (транслітерація фраз)

### 💡 Майбутнє ТЗ (не критично зараз)
9. **5.5** — Аналітика: реальні дані замість хардкоду
10. **5.6** — AI Менеджер: Gemini API інтеграція
11. **5.7** — Блог та відгуки: CMS функціонал
12. **6.5** — Auto-SEO Engine: алгоритмічна генерація SEO

# 📘 Frontend Integration Guide (Production Ready)

Этот гайд содержит актуальные настройки для подключения фронтенда к бэкенду, развернутому на Koyeb.

## 1. Конфигурация окружения (.env)

Для работы с продакшн-сервером используйте следующие URL:

```env
# URL вашего API на Koyeb
NEXT_PUBLIC_API_URL=https://ministerial-yetta-fodi999-c58d8823.koyeb.app

# URL для загруженных изображений (Cloudflare R2)
NEXT_PUBLIC_CDN_URL=https://product-images.678b4bd6949021e149024f0980c98f8b.r2.cloudflarestorage.com
```

## 2. Основные эндпоинты (MVP)

### 📊 Дашборд владельца (NEW)
Самый важный эндпоинт для главной страницы приложения. Возвращает все KPI одним запросом.
- **GET** `/api/reports/summary?period_days=30`
- **Response**:
```json
{
  "period_days": 30,
  "total_revenue_cents": 150000,
  "total_profit_cents": 45000,
  "total_orders": 120,
  "avg_order_profit_cents": 375,
  "inventory_health_score": 85,
  "waste_cents": 1200,
  "stars": 5, "plowhorses": 3, "puzzles": 2, "dogs": 1,
  "best_dish": { "name": "Borsch", "profit_margin_percent": 82.5 }
}
```

### 📦 Склад и Инвентарь
- **GET** `/api/inventory/products` — список продуктов на складе (с пагинацией).
- **POST** `/api/inventory/products` — приемка товара (создание партии/batch).
- **POST** `/api/inventory/process-expirations` — запуск проверки сроков годности (вызывать раз в день или при загрузке).

### 🥗 Рецепты и Блюда
- **GET** `/api/recipes/v2` — список техкарт с автопереводом.
- **POST** `/api/dishes` — создание блюда для меню.
- **POST** `/api/dishes/recalculate-all` — пересчет себестоимости всех блюд (вызывать, если сильно изменились цены на складе).

## 3. Работа с изображениями (Direct-to-R2)

Бэкенд использует безопасную схему загрузки через Presigned URLs:

1. **Запрос ссылки**: `GET /api/profile/avatar/upload-url?content_type=image/jpeg`
2. **Загрузка**: Отправьте файл методом **PUT** прямо на полученный `upload_url`.
3. **Сохранение**: После успеха отправьте `PUT /api/profile/avatar` с финальным `public_url`.

## 4. Мультиязычность (i18n)

Бэкенд сам определяет язык пользователя на основе его профиля в БД. Вам **не нужно** передавать заголовок `Accept-Language`. 
- Просто выполняйте `GET /api/user/me` при входе, чтобы узнать текущий язык (`language: "ru" | "en" | "pl" | "uk"`).
- Все названия в каталоге придут уже переведенными.

## 5. Пагинация (Standard)

Почти все списки поддерживают параметры:
`?page=1&per_page=50`

Ответ всегда завернут в объект:
```json
{
  "items": [...],
  "total": 125,
  "page": 1,
  "per_page": 50,
  "total_pages": 3
}
```

---

## 🔒 Безопасность

1. **JWT**: Токен живет 15 минут. Используйте эндпоинт `/api/auth/refresh` для автоматического обновления.
2. **CORS**: Если ваш фронтенд задеплоен на домене `myapp.com`, убедитесь, что в Koyeb в переменной `CORS_ALLOWED_ORIGINS` добавлен этот домен.

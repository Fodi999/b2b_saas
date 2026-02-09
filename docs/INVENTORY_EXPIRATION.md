# 📦 Автоматический расчёт срока годности

## Как это работает

### Backend (автоматический расчёт)

Когда вы добавляете продукт на склад через POST запрос, backend автоматически рассчитывает `expires_at`:

```bash
POST /api/inventory/products
{
  "catalog_ingredient_id": "uuid-молоко",
  "quantity": 10,
  "price_per_unit_cents": 350,
  "received_at": "2026-02-09T10:00:00Z"  # Дата поступления
  # expires_at НЕ указываем - backend рассчитает сам!
}

# Backend автоматически добавит:
# expires_at = received_at + default_shelf_life_days
# Молоко: 2026-02-09 + 7 дней = 2026-02-16
# Авокадо: 2026-02-09 + 5 дней = 2026-02-14
```

### Frontend (превью)

В модальном окне добавления продукта показывается **предварительный расчёт** срока годности:

```tsx
// components/inventory/add-product-modal.tsx

const estimatedShelfLifeDays = selectedProduct?.default_shelf_life_days || 30;
const expiresAt = new Date(receivedAt).getTime() + estimatedShelfLifeDays * 24 * 60 * 60 * 1000;

// Превью:
// "Срок годности (авто): 2026-02-16"
// "(получено 2026-02-09 + 7 дней хранения)"
```

## Логика статусов

### 🔴 Expired (Просрочен)
- `expires_at < NOW()`
- Предупреждение: "Просрочен на X дней"

### 🟠 Expiring (Истекает)
- `0 <= days_left <= 3`
- Предупреждения:
  - "⚠️ Истекает сегодня!" (0 дней)
  - "Истекает завтра" (1 день)
  - "Осталось 2 дня" (2 дня)
  - "Осталось 3 дня" (3 дня)

### 🟡 Low (Мало)
- `quantity < 5` (если не expired/expiring)
- Предупреждение: "Критически низкий запас" (quantity < 1)

### 🟢 In Stock (В норме)
- Всё остальное

## Приоритет статусов

```
1. expired (наивысший приоритет)
2. expiring
3. low
4. in-stock (по умолчанию)
```

## Тестирование

```bash
# Test 1: Молоко (7 дней хранения)
curl -X POST .../api/inventory/products \
  -d '{"catalog_ingredient_id":"...","received_at":"2026-02-09T10:00:00Z"}'
# ✅ expires_at = 2026-02-16T10:00:00Z

# Test 2: Авокадо (5 дней хранения)
curl -X POST .../api/inventory/products \
  -d '{"catalog_ingredient_id":"...","received_at":"2026-02-09T10:00:00Z"}'
# ✅ expires_at = 2026-02-14T10:00:00Z

# Test 3: Ручной override
curl -X POST .../api/inventory/products \
  -d '{"received_at":"2026-02-09T10:00:00Z","expires_at":"2026-02-20T23:59:59Z"}'
# ✅ expires_at = 2026-02-20T23:59:59Z (используется указанное значение)
```

## Особенности

### Nullable поля
- `received_at` и `expires_at` могут быть `null` в базе данных
- Frontend обрабатывает null значения безопасно:
  ```tsx
  received_at: dto.received_at ? dto.received_at.split('T')[0] : undefined
  expiration_date: dto.expires_at ? dto.expires_at.split('T')[0] : undefined
  ```

### Query DTO Pattern
Backend возвращает **enriched data** с joined relations:

```json
{
  "id": "uuid",
  "product": {
    "id": "uuid",
    "name": "Молоко",
    "category": "Молочные продукты",
    "base_unit": "kilogram"
  },
  "quantity": 10,
  "price_per_unit_cents": 350,
  "received_at": "2026-02-09T10:00:00Z",
  "expires_at": "2026-02-16T10:00:00Z"
}
```

### POST → GET Pattern
```
1. POST создаёт продукт (возвращает raw entity без joined data)
2. Frontend вызывает reloadInventory()
3. GET возвращает Query DTO с полными данными
4. UI обновляется с enriched data
```

## Файлы

- **Backend логика**: Бэкенд автоматически рассчитывает expires_at
- **Frontend API**: `lib/api/inventory.ts` (calculateStatus, convertToFrontend)
- **UI модалка**: `components/inventory/add-product-modal.tsx`
- **Карточки**: `app/[locale]/inventory/page.tsx`

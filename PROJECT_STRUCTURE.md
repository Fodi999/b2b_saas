# 🏗️ Структура проекта B2B SaaS

## 📁 Основная структура

```
b2b_saas/
├── 📱 app/                           # Next.js 14 App Router
│   ├── [locale]/                     # Мультиязычность (pl, en, ru, uk)
│   │   ├── assistant/               # AI Ассистент (уведомления, рекомендации)
│   │   ├── dashboard/               # Главная панель
│   │   ├── dishes/                  # Управление блюдами
│   │   ├── inventory/               # ⭐ Склад (Backend integration)
│   │   ├── login/                   # Авторизация
│   │   ├── menu-engineering/        # Анализ меню
│   │   ├── recipes/                 # ⭐ Рецепты (Backend integration)
│   │   ├── register/                # Регистрация
│   │   ├── reports/                 # Отчёты
│   │   └── page.tsx                 # Главная страница
│   └── globals.css                   # Глобальные стили
│
├── 🎨 components/                    # React компоненты
│   ├── assistant/                    # AI Ассистент UI
│   ├── auth/                         # Инициализация авторизации
│   ├── dashboard/                    # Панель управления
│   ├── home/                         # Лендинг (Hero, Features, CTA)
│   ├── inventory/                    # ⭐ Инвентарь
│   │   ├── add-product-modal.tsx    # Добавление продукта
│   │   └── product-search.tsx       # Поиск в каталоге
│   ├── layout/                       # Header, Language Switcher
│   ├── recipes/                      # ⭐ Рецепты UI
│   └── ui/                           # ⭐ Переиспользуемые компоненты
│       ├── button.tsx
│       ├── input.tsx
│       ├── product-image.tsx        # 🆕 Компонент изображений
│       └── ...
│
├── 📚 docs/                          # Документация
│   ├── INVENTORY_EXPIRATION.md      # 🆕 Автоматический расчёт сроков
│   └── INVENTORY_IMAGES.md          # 🆕 Интеграция изображений
│
├── 🔧 lib/                           # Бизнес-логика
│   ├── api/                          # ⭐ Backend API интеграция
│   │   ├── auth.ts                  # Авторизация (login, register, refresh)
│   │   ├── client.ts                # 🆕 HTTP client (204 handling)
│   │   └── inventory.ts             # 🆕 Инвентарь CRUD + типы
│   ├── hooks/                        # React хуки
│   │   ├── use-auth-init.ts         # Восстановление сессии
│   │   └── use-inventory.ts         # 🆕 Загрузка инвентаря
│   ├── mock-data/                    # Mock данные (catalog, recipes)
│   ├── stores/                       # ⭐ Zustand stores
│   │   ├── auth-store.ts            # Сессия пользователя
│   │   ├── inventory-store.ts       # 🆕 Склад (с image_url)
│   │   ├── recipes-store.ts         # Рецепты
│   │   └── ...
│   └── utils/                        # Утилиты
│       ├── format.ts                # Форматирование дат, чисел
│       └── utils.ts                 # cn() для классов
│
├── 🌍 messages/                      # i18n переводы
│   ├── en.json
│   ├── pl.json
│   ├── ru.json
│   └── uk.json
│
├── 📖 Документация
│   ├── ARCHITECTURE.md              # Архитектура системы
│   ├── BACKEND_VERIFICATION.md      # Backend контракты
│   ├── CHANGELOG_EXPIRATION.md      # 🆕 Changelog сроков годности
│   ├── CHANGELOG_IMAGES.md          # 🆕 Changelog изображений
│   ├── INVENTORY_MODULE.md          # Модуль инвентаря
│   ├── RECIPES_MODULE.md            # Модуль рецептов
│   └── PROJECT_SUMMARY.md           # Общее описание
│
└── ⚙️ Конфигурация
    ├── components.json              # shadcn/ui конфиг
    ├── i18n.ts                      # i18next конфиг
    ├── middleware.ts                # Proxy для CORS
    ├── next.config.ts               # Next.js конфиг
    ├── package.json                 # Зависимости
    └── tsconfig.json                # TypeScript конфиг
```

---

## 🎯 Ключевые модули

### 1. 🔐 Авторизация
```
lib/api/auth.ts
  ├── registerUser()
  ├── loginUser()
  ├── refreshToken()
  ├── fetchMe()
  └── updateUserLanguage()

lib/stores/auth-store.ts
  ├── user (User | null)
  ├── accessToken (string)
  └── refreshToken (string)

components/auth/auth-initializer.tsx
  └── Восстановление сессии из localStorage
```

### 2. 📦 Инвентарь (Склад)
```
app/[locale]/inventory/page.tsx
  └── Карточки продуктов (с изображениями, статусами, кнопкой удаления)

components/inventory/
  ├── add-product-modal.tsx        # POST → GET pattern
  └── product-search.tsx           # Поиск в каталоге

lib/api/inventory.ts
  ├── Types: CatalogIngredientDTO, InventoryProductQueryDTO, InventoryProduct
  ├── searchCatalogIngredients()   # GET /api/catalog/ingredients?q=...
  ├── fetchInventory()             # GET /api/inventory/products (Query DTO)
  ├── addInventoryProduct()        # POST /api/inventory/products
  ├── updateInventoryProduct()     # PUT /api/inventory/products/:id
  └── deleteInventoryProduct()     # DELETE /api/inventory/products/:id (HTTP 204)

lib/stores/inventory-store.ts
  ├── items: InventoryItem[]       # С image_url
  ├── setItems()
  ├── removeItem()
  └── setLoading()

lib/hooks/use-inventory.ts
  ├── Auto-load на mount
  └── reloadInventory() callback
```

### 3. 🍳 Рецепты
```
app/[locale]/recipes/page.tsx
  └── Отображение рецептов (мокап)

lib/stores/recipes-store.ts
  ├── recipes: Recipe[]
  └── TODO: Backend integration
```

### 4. 🖼️ UI Компоненты
```
components/ui/product-image.tsx      # 🆕 Изображения с fallback
  ├── Loading state (⏳)
  ├── Error handling (fallback на эмодзи)
  └── Dark mode support

components/ui/button.tsx             # shadcn/ui
components/ui/input.tsx
components/ui/dropdown-menu.tsx
```

---

## 🔄 Data Flow (Инвентарь)

### Загрузка продуктов
```
useInventory() hook (mount)
    ↓
fetchInventory(accessToken)
    ↓
GET /api/inventory/products
    ↓
Backend returns Query DTO with joined product.image_url
    ↓
convertToFrontend(dto) → InventoryProduct
    ↓
inventory-store.setItems()
    ↓
UI renders cards with ProductImage component
```

### Добавление продукта
```
User searches "авокадо"
    ↓
searchCatalogIngredients("авокадо")
    ↓
GET /api/catalog/ingredients?q=авокадо
    ↓
Returns CatalogIngredientDTO (с image_url)
    ↓
User fills form (quantity, price, received_at)
    ↓
addInventoryProduct() → POST /api/inventory/products
    ↓
Backend calculates expires_at automatically
    ↓
reloadInventory() → GET /api/inventory/products
    ↓
UI updates with new product (Query DTO с joined data)
```

### Удаление продукта
```
User clicks 🗑️ button
    ↓
Confirm dialog
    ↓
deleteInventoryProduct(id, accessToken)
    ↓
DELETE /api/inventory/products/:id → HTTP 204 No Content
    ↓
reloadInventory()
    ↓
UI updates without deleted product
```

---

## 📊 Backend Integration Status

| Модуль | Статус | API Endpoints |
|--------|--------|--------------|
| 🔐 Авторизация | ✅ Полная интеграция | POST /api/auth/register, /login, /refresh |
| 📦 Инвентарь | ✅ Полная интеграция | GET/POST/PUT/DELETE /api/inventory/products |
| 🔍 Каталог | ✅ Полная интеграция | GET /api/catalog/ingredients?q=... |
| 🍳 Рецепты | ⏳ Частичная (мокап) | GET /api/recipes |
| 📊 Отчёты | ⏳ Не реализовано | - |
| 🤖 AI Ассистент | ⏳ UI готов | - |

---

## 🎨 Design Patterns

### 1. Query DTO Pattern
```typescript
// Backend джойнит связанные данные в одном запросе
interface InventoryProductQueryDTO {
  id: string;
  product: {                    // ✅ Joined в одном запросе
    id: string;
    name: string;
    category: string;
    base_unit: string;
    image_url: string | null;   // ✅ Из каталога
  };
  quantity: number;
  price_per_unit_cents: number;
  received_at: string | null;
  expires_at: string | null;    // ✅ Backend рассчитывает автоматически
}
```

### 2. POST → GET Pattern
```typescript
// Продукшн best practice для consistent state
async function addProduct() {
  await addInventoryProduct(data);  // POST возвращает raw entity
  await reloadInventory();          // GET возвращает enriched Query DTO
}
```

### 3. Nullable Handling
```typescript
// Type-safe обработка null
image_url?: string | null;
received_at: dto.received_at ? dto.received_at.split('T')[0] : undefined;
```

---

## 🚀 Recent Updates (9-10 Feb 2026)

### ✅ Completed
- 🖼️ Product images integration (image_url from catalog)
- 📅 Auto-expiration calculation (backend)
- 🗑️ Delete functionality with confirmation
- 🎨 Enhanced UI (color-coded dates, dynamic labels)
- ⏳ Loading states and error handling
- 📄 HTTP 204 No Content handling
- 📚 Documentation (INVENTORY_EXPIRATION.md, INVENTORY_IMAGES.md)

### 📁 Files Modified
- **Created:** 5 files (ProductImage component, docs, changelogs)
- **Modified:** 8 files (API layer, stores, UI components)
- **Total:** +1184 lines of code

---

## 📦 Dependencies

```json
{
  "next": "16.1.6",
  "react": "19.0.0",
  "zustand": "^5.0.2",
  "next-intl": "^3.26.5",
  "tailwindcss": "^3.4.1",
  "lucide-react": "^0.468.0"
}
```

---

## 🔮 Next Steps

1. ⏳ Lazy loading для изображений (performance)
2. ⏳ Next.js Image component для оптимизации
3. ⏳ Функционал редактирования продуктов
4. ⏳ Bulk operations (массовое удаление)
5. ⏳ Фильтры по статусу (истекающие, просроченные)
6. ⏳ Backend интеграция для рецептов

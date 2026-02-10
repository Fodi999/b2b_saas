# 📂 Архитектура категорий продуктов

## 🎯 Главный принцип

**Категории хранятся только в каталоге ингредиентов, НЕ в инвентаре.**

```
✅ Правильно:
Catalog (Каталог)
  └── Ingredient (Ингредиент)
       └── Category (Категория)

Inventory (Склад)
  └── Product (Товар)
       └── references → Ingredient → Category

❌ Неправильно:
Inventory
  └── Product
       └── category_name (дубликат!)
```

---

## 🏗️ Database Schema

### Таблица: `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Примеры категорий:
-- Фрукты, Овощи, Молочные продукты, Мясо, Рыба
```

### Таблица: `catalog_ingredients`
```sql
CREATE TABLE catalog_ingredients (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category_id UUID REFERENCES categories(id),  -- ✅ FK к категориям
  default_unit VARCHAR(20),
  default_shelf_life_days INT,
  image_url TEXT,
  -- ...
);
```

### Таблица: `inventory_products`
```sql
CREATE TABLE inventory_products (
  id UUID PRIMARY KEY,
  catalog_ingredient_id UUID REFERENCES catalog_ingredients(id),  -- ✅ FK к каталогу
  quantity DECIMAL,
  price_per_unit_cents INT,
  received_at TIMESTAMP,
  expires_at TIMESTAMP,
  -- НЕТ category_id или category_name!
);
```

---

## 🔄 Data Flow

### 1️⃣ Добавление продукта на склад

**Шаг 1: Поиск ингредиента**
```typescript
// Frontend
GET /api/catalog/ingredients?q=авокадо

// Backend Response (Query DTO)
{
  "ingredients": [
    {
      "id": "138e48ba-e4fc-4bf4-8fee-6701397c2b73",
      "name": "Авокадо",
      "category": {                    // ✅ Joined category
        "id": "d4a64b25-...",
        "name": "Фрукты"
      },
      "default_unit": "piece",
      "default_shelf_life_days": 5,
      "image_url": "https://..."
    }
  ]
}
```

**Шаг 2: Показываем категорию (read-only)**
```tsx
// UI Modal
┌─────────────────────────────────────┐
│ Выбран: Авокадо                     │
│ 📂 Категория: Фрукты (read-only)   │  ← НЕ редактируется!
│                                      │
│ Количество: [30] шт                 │
│ Цена: [7.50] PLN                    │
│ Получено: [09.02.2026]              │
└─────────────────────────────────────┘
```

**Шаг 3: Отправка на backend**
```typescript
// Frontend отправляет ТОЛЬКО ingredient_id
POST /api/inventory/products
{
  "catalog_ingredient_id": "138e48ba-e4fc-4bf4-8fee-6701397c2b73",
  "quantity": 30,
  "price_per_unit_cents": 750,
  "received_at": "2026-02-09T10:00:00Z"
  // ❌ НЕ отправляем category_id или category_name!
}
```

### 2️⃣ Отображение инвентаря

**Backend возвращает Query DTO с joined category:**
```typescript
GET /api/inventory/products

// Response
[
  {
    "id": "inventory-product-id",
    "quantity": 30,
    "price_per_unit_cents": 750,
    "product": {                      // ✅ Joined product
      "id": "ingredient-id",
      "name": "Авокадо",
      "base_unit": "piece",
      "category": {                   // ✅ Joined category
        "id": "category-id",
        "name": "Фрукты"
      },
      "image_url": "https://..."
    },
    "received_at": "2026-02-09T10:00:00Z",
    "expires_at": "2026-02-14T10:00:00Z"
  }
]
```

**Frontend извлекает название категории:**
```typescript
function convertToFrontend(dto: InventoryProductQueryDTO): InventoryProduct {
  return {
    id: dto.id,
    product_name: dto.product.name,
    category: dto.product.category.name,      // ✅ Извлекаем название
    category_id: dto.product.category.id,     // ✅ Сохраняем ID
    // ...
  };
}
```

---

## 🎨 UI Implementation

### Поиск ингредиентов
```tsx
// components/inventory/product-search.tsx

<button onClick={() => handleSelect(product)}>
  <img src={product.image_url} />
  
  <div>
    <div>{product.name}</div>           {/* Авокадо */}
    <div>
      📂 {product.category.name}       {/* Фрукты */}
      Срок годности: {product.default_shelf_life_days} дн.
    </div>
  </div>
  
  <span>{unitLabel}</span>             {/* шт */}
</button>
```

### Модальное окно добавления
```tsx
// components/inventory/add-product-modal.tsx

{step === 'details' && (
  <div>
    <p>Выбран: {selectedProduct.name}</p>
    
    {/* ✅ Категория — read-only */}
    <p>📂 Категория: {selectedProduct.category.name}</p>
    
    {/* Форма для ввода количества, цены, даты */}
    <input type="number" value={quantity} />
    <input type="number" value={price} />
    <input type="date" value={receivedAt} />
  </div>
)}
```

### Карточки инвентаря
```tsx
// app/[locale]/inventory/page.tsx

<div className="inventory-card">
  <img src={item.image_url} />
  
  <div>
    <h3>{item.product_name}</h3>       {/* Авокадо */}
    <p>{item.category}</p>             {/* Фрукты - из joined data */}
  </div>
  
  {getStatusBadge(item.status)}
</div>
```

---

## ✅ Преимущества этой архитектуры

### 1. Единый источник правды (Single Source of Truth)
```
Категория "Фрукты" → определена в таблице categories
                    → связана с catalog_ingredients
                    → автоматически появляется в inventory через JOIN
```

### 2. Простое изменение категорий
```sql
-- Меняем категорию ингредиента
UPDATE catalog_ingredients
SET category_id = 'new-category-id'
WHERE id = 'avocado-id';

-- ✅ Изменения сразу видны во ВСЕХ inventory products!
```

### 3. Нет дубликатов данных
```
❌ Плохо:
inventory_products.category_name = "Фрукты" (дубликат)
inventory_products.category_name = "Fruit"  (inconsistency!)

✅ Хорошо:
inventory → product → category → "Фрукты" (одно место)
```

### 4. Целостность данных
```
✅ Невозможно создать продукт с несуществующей категорией
✅ Невозможно удалить категорию, если на неё ссылаются ингредиенты
✅ Всегда актуальные названия категорий
```

---

## 🚫 Частые ошибки

### ❌ Ошибка 1: Хранить category_name в inventory
```typescript
// НЕПРАВИЛЬНО!
interface InventoryProduct {
  id: string;
  product_name: string;
  category_name: string;  // ❌ Дубликат данных!
}
```

### ❌ Ошибка 2: Позволять выбирать категорию в форме
```tsx
// НЕПРАВИЛЬНО!
<select name="category">
  <option>Фрукты</option>
  <option>Овощи</option>
</select>
```

**Почему плохо:**
- Пользователь может выбрать неправильную категорию
- Несоответствие между категорией ингредиента и выбранной категорией
- Дубликаты и inconsistency

### ❌ Ошибка 3: Отправлять category_id в POST
```typescript
// НЕПРАВИЛЬНО!
POST /api/inventory/products
{
  "catalog_ingredient_id": "...",
  "category_id": "..."  // ❌ Избыточно!
}
```

**Почему плохо:**
- Backend уже знает category_id через ingredient
- Риск несоответствия (ingredient.category_id ≠ request.category_id)

---

## ✅ Правильный flow

### Frontend
```typescript
1. User searches "авокадо"
2. Show results with category (from catalog)
3. User selects ingredient
4. Show category as READ-ONLY
5. User fills quantity, price, date
6. POST with ONLY ingredient_id
7. Reload inventory (GET with Query DTO)
```

### Backend
```sql
-- POST handler
1. Accept catalog_ingredient_id
2. Create inventory_product
3. Return raw entity (201)

-- GET handler
1. Join inventory → catalog_ingredients → categories
2. Return enriched Query DTO with product.category
```

---

## 📊 Type Definitions

```typescript
// Backend DTO (what API returns)
interface CategoryEmbedded {
  id: string;
  name: string;
}

interface ProductEmbedded {
  id: string;
  name: string;
  category: CategoryEmbedded;  // ✅ Joined
  base_unit: string;
  image_url: string | null;
}

interface InventoryProductQueryDTO {
  id: string;
  product: ProductEmbedded;    // ✅ Joined
  quantity: number;
  price_per_unit_cents: number;
  received_at: string | null;
  expires_at: string | null;
}

// Frontend (for UI display)
interface InventoryProduct {
  id: string;
  product_name: string;
  category: string;          // ✅ Extracted name
  category_id: string;       // ✅ For reference
  quantity: number;
  price: number;
  status: 'in-stock' | 'low' | 'expiring' | 'expired';
  image_url: string | null;
}
```

---

## 🔮 Future Enhancements

### 1. Фильтрация по категориям
```tsx
<select onChange={(e) => filterByCategory(e.target.value)}>
  <option value="">Все категории</option>
  <option value="fruits">Фрукты</option>
  <option value="vegetables">Овощи</option>
</select>
```

### 2. Группировка по категориям
```tsx
{Object.entries(groupedByCategory).map(([category, items]) => (
  <div key={category}>
    <h2>📂 {category}</h2>
    {items.map(item => <InventoryCard {...item} />)}
  </div>
))}
```

### 3. Статистика по категориям
```tsx
<div>
  <h3>Фрукты</h3>
  <p>Всего позиций: 5</p>
  <p>Истекает: 2</p>
  <p>Просрочено: 0</p>
</div>
```

---

## 📝 Summary

✅ **Категории хранятся в каталоге** (catalog_ingredients → categories)  
✅ **Inventory ссылается на ingredient** (не на категорию напрямую)  
✅ **Backend джойнит категорию** в Query DTO  
✅ **Frontend показывает категорию** как read-only  
✅ **POST отправляет только** ingredient_id  
✅ **Единый источник правды** для категорий  

❌ **НЕ храним** category_name в inventory  
❌ **НЕ позволяем** выбирать категорию в форме  
❌ **НЕ отправляем** category_id в POST  

**Результат:** Чистая архитектура, нет дубликатов, легко поддерживать! 🎉

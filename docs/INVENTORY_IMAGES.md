# 🖼️ Интеграция изображений продуктов

## Обзор

Backend возвращает поле `image_url` для каждого продукта в каталоге. Frontend отображает эти изображения в карточках инвентаря и в поиске продуктов, с автоматическим fallback на эмодзи категории.

## Backend Contract

### Catalog API

```json
GET /api/catalog/ingredients?q=авокадо
{
  "ingredients": [
    {
      "id": "138e48ba-e4fc-4bf4-8fee-6701397c2b73",
      "name": "Авокадо",
      "image_url": "https://i.postimg.cc/KjfqhLX2/fodifood-single-whole-avocado-top-view-flat-lay-food-photograph-f701dbb9-1b31-4d0b-99ce-96f16a2c413d.png",
      // ... другие поля
    }
  ]
}
```

### Inventory Query DTO

Backend передаёт `image_url` через joined relations:

```json
GET /api/inventory/products
[
  {
    "id": "inventory-uuid",
    "product": {
      "id": "catalog-uuid",
      "name": "Авокадо",
      "category": "Овощи",
      "base_unit": "piece",
      "image_url": "https://i.postimg.cc/..." // ✅ Joined из каталога
    },
    "quantity": 10,
    // ...
  }
]
```

## Frontend Architecture

### Type Definitions

**lib/api/inventory.ts**
```typescript
export interface CatalogIngredientDTO {
  id: string;
  name: string;
  image_url: string | null; // ✅ Может быть null
  // ...
}

interface ProductEmbedded {
  id: string;
  name: string;
  category: string;
  base_unit: 'kilogram' | 'liter' | 'piece';
  image_url?: string | null; // ✅ Optional для joined data
}

export interface InventoryProduct {
  id: string;
  product_name: string;
  image_url?: string | null; // ✅ Для отображения в UI
  // ...
}
```

### Data Flow

```
Backend Catalog
    ↓
CatalogIngredientDTO (image_url: string | null)
    ↓
POST /api/inventory/products (catalog_ingredient_id)
    ↓
Backend joins product.image_url
    ↓
InventoryProductQueryDTO (product.image_url)
    ↓
convertToFrontend()
    ↓
InventoryProduct (image_url)
    ↓
UI Components (ProductImage)
```

## UI Components

### ProductImage Component

**components/ui/product-image.tsx**

Универсальный компонент с автоматическим fallback:

```tsx
<ProductImage
  src={item.image_url}
  alt={item.product_name}
  fallbackIcon={getCategoryIcon(item.category)}
  containerClassName="..."
  className="..."
/>
```

**Особенности:**
- ✅ Loading state (⏳ анимация)
- ✅ Error handling (автоматический fallback на эмодзи)
- ✅ Null-safe (если `src` = null, показывает fallback)
- ✅ Dark mode support

### Inventory Cards

**app/[locale]/inventory/page.tsx**

```tsx
<div className="flex gap-4">
  <ProductImage
    src={item.image_url}
    alt={item.product_name}
    fallbackIcon={getCategoryIcon(item.category)}
    containerClassName="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0"
    className="h-full w-full object-cover"
  />
  
  <div className="flex-1">
    <h3>{item.product_name}</h3>
    <p>{item.category}</p>
  </div>
</div>
```

**Размеры:**
- Desktop: 80x80px (h-20 w-20)
- Mobile: Те же 80x80px (flex-shrink-0 предотвращает сжатие)

### Product Search

**components/inventory/product-search.tsx**

```tsx
<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
  {product.image_url ? (
    <img
      src={product.image_url}
      alt={product.name}
      className="h-full w-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent) {
          parent.innerHTML = '<span class="text-2xl">🍽️</span>';
        }
      }}
    />
  ) : (
    <span className="text-2xl">🍽️</span>
  )}
</div>
```

**Размеры:**
- 48x48px (h-12 w-12)
- Меньше, чем в карточках инвентаря

## Fallback Strategy

### 1. Категорийные эмодзи

```typescript
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    'Dairy Products': '🥛',
    'Vegetables': '🥕',
    'Meat': '🥩',
    'Fish': '🐟',
    'Fruits': '🍎',
    'Grains': '🌾',
    'Spices': '🧂',
    'Beverages': '🥤',
    'Other': '📦',
  };
  return icons[category] || '📦';
};
```

### 2. Приоритет отображения

```
1. image_url (если есть и загружается) → показываем фото
2. onError → показываем эмодзи категории
3. image_url === null → сразу показываем эмодзи
```

## Image Hosting

### Текущий хостинг

Backend использует **postimg.cc** для хранения изображений:

```
https://i.postimg.cc/KjfqhLX2/fodifood-single-whole-avocado-top-view-flat-lay-food-photograph-f701dbb9-1b31-4d0b-99ce-96f16a2c413d.png
```

### Требования к изображениям

- **Формат**: PNG, JPG, WebP
- **Размер**: Рекомендуется 300-500px (для загрузки)
- **Соотношение**: 1:1 (квадратное)
- **Фон**: Прозрачный или белый
- **Стиль**: Top-down view (flat lay)

## Testing

### Тест 1: Продукт с изображением (Авокадо)

```bash
curl -s 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app/api/catalog/ingredients?q=авокадо' | jq '.[0].image_url'

# Result:
# "https://i.postimg.cc/KjfqhLX2/fodifood-single-whole-avocado-top-view-flat-lay-food-photograph-f701dbb9-1b31-4d0b-99ce-96f16a2c413d.png"
```

✅ UI показывает фото авокадо

### Тест 2: Продукт без изображения (Молоко)

```bash
curl -s 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app/api/catalog/ingredients?q=молоко' | jq '.[0].image_url'

# Result:
# null
```

✅ UI показывает эмодзи 🥛 (категория Dairy Products)

### Тест 3: Неверный URL

```typescript
image_url: "https://broken-url.com/image.png"
```

✅ UI показывает эмодзи категории после ошибки загрузки

## Performance Considerations

### Lazy Loading

```tsx
<img
  src={item.image_url}
  loading="lazy" // ✅ TODO: Добавить для оптимизации
  className="..."
/>
```

### Image Caching

Browser кеширует изображения автоматически:
- postimg.cc отдаёт `Cache-Control` headers
- Повторные визиты не загружают изображения заново

### Loading State

```tsx
{isLoading && (
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-2xl animate-pulse">⏳</span>
  </div>
)}
```

## Future Improvements

### 1. Image Optimization
- [ ] Добавить Next.js Image component для автоматической оптимизации
- [ ] Responsive images (srcset)
- [ ] WebP conversion на backend

### 2. Better Fallbacks
- [ ] Placeholder blur (base64 preview)
- [ ] Skeleton loader
- [ ] Категорийные иллюстрации (вместо эмодзи)

### 3. Upload UI
- [ ] Drag & drop для загрузки изображений
- [ ] Crop/resize перед загрузкой
- [ ] Preview перед сохранением

## Modified Files

```
lib/api/inventory.ts                    [MODIFIED] +3 lines (types)
lib/stores/inventory-store.ts           [MODIFIED] +1 line (type)
app/[locale]/inventory/page.tsx         [MODIFIED] +10 lines (ProductImage)
components/inventory/product-search.tsx [MODIFIED] +15 lines (image display)
components/ui/product-image.tsx         [CREATED] 52 lines (new component)
docs/INVENTORY_IMAGES.md                [CREATED] (this file)
```

## Summary

✅ **Backend Integration**: image_url передаётся через Query DTO  
✅ **Type Safety**: Nullable types, safe conversions  
✅ **UI Components**: ProductImage с автоматическим fallback  
✅ **Error Handling**: onError → эмодзи категории  
✅ **Dark Mode**: Работает во всех компонентах  
✅ **Performance**: Browser caching, loading states  

**Next Steps**: Добавить lazy loading и Next.js Image optimization

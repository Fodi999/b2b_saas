// Продукт на складе (user-owned)

import type { BaseUnit } from './catalog';

export type InventoryItem = {
  id: string;
  catalogProductId: string;
  productName: string; // denormalized для удобства
  category: string;
  baseUnit: BaseUnit;
  price: number; // цена закупки
  quantity: number;
  receivedAt: Date;
  expiresAt: Date; // computed by bot
  status: 'fresh' | 'expiring' | 'expired';
};

// Mock данные склада (начальное состояние)
export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    catalogProductId: 'dairy-001',
    productName: 'Сливки 30%',
    category: 'dairy',
    baseUnit: 'ml',
    price: 12.50,
    quantity: 2000,
    receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 дня назад
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // через 3 дня
    status: 'expiring',
  },
  {
    id: 'inv-002',
    catalogProductId: 'meat-001',
    productName: 'Бекон',
    category: 'meat',
    baseUnit: 'g',
    price: 45.00,
    quantity: 1500,
    receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'expiring',
  },
  {
    id: 'inv-003',
    catalogProductId: 'dairy-006',
    productName: 'Пармезан',
    category: 'dairy',
    baseUnit: 'g',
    price: 120.00,
    quantity: 800,
    receivedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: 'fresh',
  },
];

// Функция для вычисления expiresAt (bot logic)
export function computeExpiryDate(receivedAt: Date, shelfLifeDays: number): Date {
  const expiry = new Date(receivedAt);
  expiry.setDate(expiry.getDate() + shelfLifeDays);
  return expiry;
}

// Функция для определения статуса (bot logic)
export function computeStatus(expiresAt: Date): InventoryItem['status'] {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 2) return 'expiring';
  return 'fresh';
}

// Форматирование даты для UI
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Форматирование количества с единицей
export function formatQuantity(quantity: number, unit: BaseUnit): string {
  const unitLabels: Record<BaseUnit, string> = {
    g: 'г',
    ml: 'мл',
    pcs: 'шт',
  };
  
  // Если больше 1000 г/мл, показываем кг/л
  if ((unit === 'g' || unit === 'ml') && quantity >= 1000) {
    const converted = quantity / 1000;
    const newUnit = unit === 'g' ? 'кг' : 'л';
    return `${converted.toFixed(1)} ${newUnit}`;
  }
  
  return `${quantity} ${unitLabels[unit]}`;
}

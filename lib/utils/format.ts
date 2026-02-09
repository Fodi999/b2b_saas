/**
 * Утилиты для форматирования единиц измерения и дат
 */

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`;
}

export function formatDate(date: Date | string): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU');
}

export function formatPrice(price: number, currency = 'PLN'): string {
  return `${price.toFixed(2)} ${currency}`;
}

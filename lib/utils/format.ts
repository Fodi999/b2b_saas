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

export function formatPrice(price: number, locale = 'ru-RU', currency = 'PLN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(price) + ` ${currency}`;
}

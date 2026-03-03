/**
 * Money helpers — cents ↔ display.
 * Backend ALWAYS uses integer cents. UI shows decimals.
 */

/** Convert a UI float (e.g. 15.50) to integer cents */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert integer cents to float for display */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Format cents into a locale-aware currency string.
 * @example formatMoney(15050, 'pl-PL', 'PLN') => "150,50 PLN"
 */
export function formatMoney(
  cents: number,
  locale: string = 'pl-PL',
  currency: string = 'PLN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format cents as simple decimal without currency symbol.
 * @example formatDecimal(15050) => "150.50"
 */
export function formatDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}

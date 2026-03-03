/**
 * Date helpers for API communication.
 * Backend expects ISO 8601 strings. These helpers ensure safe conversion.
 */

/** Convert a Date (or string) to ISO 8601 string. Returns empty string for invalid input. */
export function toIso(date: Date | string | null | undefined): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toISOString();
  } catch {
    return '';
  }
}

/** Format ISO date for display (localized short date) */
export function formatDate(
  iso: string | null | undefined,
  locale: string = 'pl-PL'
): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}

/** Days until a given ISO date (negative = past) */
export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const diff = d.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

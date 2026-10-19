/**
 * Money utilities for South African Rand (ZAR).
 * All monetary values are stored as integer cents (R25.50 = 2550).
 */

/**
 * Parse a rand string to cents.
 * Accepts formats: "25.50", "25,50", "1 000.00", "1000"
 * Rejects: non-numeric strings, negative values, values with >2 decimal places
 */
export function parseRandToCents(value: string): number {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid input: must be a non-empty string');
  }

  // Remove whitespace
  const cleaned = value.replace(/\s/g, '');

  // Replace comma with dot for decimal separator
  const normalized = cleaned.replace(',', '.');

  // Check if it's a valid number
  if (!/^-?\d*\.?\d+$/.test(normalized)) {
    throw new Error('Invalid input: must be a numeric value');
  }

  const num = parseFloat(normalized);

  // Reject negative values
  if (num < 0) {
    throw new Error('Invalid input: negative values are not allowed');
  }

  // Check for more than 2 decimal places
  const decimalPart = normalized.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    throw new Error('Invalid input: cannot have more than 2 decimal places');
  }

  // Convert to cents and round to handle floating point precision
  const cents = Math.round(num * 100);

  return cents;
}

/**
 * Format cents as ZAR currency string.
 * Uses Intl.NumberFormat with "en-ZA" locale and ZAR currency.
 */
export function formatZAR(cents: number): string {
  const rands = cents / 100;
  const formatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rands);
  // Replace regular space with non-breaking space for consistent formatting
  return formatted.replace(/ /g, '\u00A0');
}

/**
 * Sum an array of cent values.
 */
export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Format cents as a compact ZAR string (e.g., "R 1,5k" for R1,500).
 */
export function formatZARCompact(cents: number): string {
  const rands = cents / 100;
  if (rands >= 1000) {
    return `R\u00A0${(rands / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return formatZAR(cents);
}
